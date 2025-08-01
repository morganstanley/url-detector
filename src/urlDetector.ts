/*
 * Morgan Stanley makes this available to you under the Apache License,
 * Version 2.0 (the "License"). You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0.
 *
 * See the NOTICE file distributed with this work for additional information
 * regarding copyright ownership. Unless required by applicable law or agreed
 * to in writing, software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';
import Parser from 'tree-sitter';
import { LanguageManager } from './languageManager';
import { DetectorOptions, DetectorOptionsConfig } from './options';
import { URLFilter, URLMatch } from './urlFilter';
import pLimit from 'p-limit';
import { sanitizeGlobPatterns } from './pathSanitizer';
import { Logger, NullLogger } from './logger';

/**
 * Result data for a single file scan
 */
export interface FileResult {
    /** Path to the file that was scanned */
    file: string;
    /** Array of URLs found in this file */
    urls: URLMatch[];
}

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

/**
 * Internal interface representing a tree-sitter AST node.
 * Used for type safety when traversing the abstract syntax tree.
 */
interface TreeSitterNode {
    /** The type of the AST node (e.g., 'string_literal', 'comment') */
    type: string;
    /** Character position where this node starts in the source text */
    startIndex: number;
    /** Character position where this node ends in the source text */
    endIndex: number;
    /** Number of direct child nodes */
    childCount: number;
    /** Reference to the parent node, if any */
    parent?: TreeSitterNode | null;
    /** Array of child nodes */
    children?: TreeSitterNode[];
    /** Text content of this node */
    text?: string;
    /** Get a specific child node by index */
    child(index: number): TreeSitterNode;
}

/**
 * Core URL detection engine that scans source code files for URLs using tree-sitter parsing.
 *
 * The URLDetector uses tree-sitter parsers to understand the structure of source code,
 * allowing it to distinguish between URLs in different contexts (strings, comments, etc.)
 * and providing more accurate detection than simple regex approaches.
 *
 * @example
 * ```typescript
 * const detector = new URLDetector({
 *   scan: ['src/**.ts'],
 *   includeComments: true,
 *   fallbackRegex: true
 * });
 *
 * const results = await detector.process();
 * console.log('Found files with URLs:', results.length);
 * ```
 */
export class URLDetector {
    private options: DetectorOptions;
    private parser: Parser;
    private languageManager: LanguageManager;
    private urlPattern: RegExp;
    private commonSchemaPatterns: RegExp[];
    private urlFilter: URLFilter;

    private logger: Logger;

    /**
     * Creates a new URLDetector instance with the specified configuration options.
     *
     * Initializes the tree-sitter parser, language manager, URL patterns, and filtering components.
     * The detector automatically sets up common schema patterns to exclude false positives like
     * XML DOCTYPE declarations.
     *
     * @param options Configuration options for URL detection
     * @param logger Logger instance for output messages (defaults to NullLogger for quiet operation)
     * @example
     * ```typescript
     * const detector = new URLDetector({
     *   scan: ['src/*.js', 'src/*.ts'],
     *   exclude: ['node_modules/*'],
     *   includeComments: false,
     *   fallbackRegex: true
     * }, ConsoleLogger);
     * ```
     */
    constructor(options: DetectorOptionsConfig = {}, logger: Logger = NullLogger) {
        this.options = new DetectorOptions(options);
        this.logger = logger;
        this.parser = new Parser();
        this.languageManager = new LanguageManager(this.logger);
        this.urlPattern = /(?:https?:\/\/|\/\/(?=[a-zA-Z0-9.-]+[a-zA-Z]))[^\s<>"'`${}]+/g;
        this.commonSchemaPatterns = [
            /^\/\/W3C\/\/DTD/i,
            /^\/\/EN$/i,
            /^\/\/IETF\/\/DTD/i,
            /^\/\/OASIS\/\/DTD/i,
            /^\/\/ISO\/\/DTD/i,
            /^\/\/XML-DEV\/\/DTD/i,
            /^\/\/Apache\/\/DTD/i,
            /^\/\/Sun\/\/DTD/i,
            /^\/\/Dublin Core\/\/DTD/i,
        ];
        this.urlFilter = new URLFilter({
            ignoreDomains: this.options.ignoreDomains,
            includeComments: this.options.includeComments,
            includeNonFqdn: this.options.includeNonFqdn,
        });
    }

    /**
     * Gets the current configuration options for this detector instance.
     * Primarily used for testing and debugging purposes.
     *
     * @returns The DetectorOptions instance used by this detector
     */
    public get getOptions(): DetectorOptions {
        return this.options;
    }

    /**
     * Gets the URL filter instance used by this detector.
     * Primarily used for testing and debugging purposes.
     *
     * @returns The URLFilter instance used to filter detected URLs
     */
    public get getUrlFilter(): URLFilter {
        return this.urlFilter;
    }

    /**
     * Detects URLs in the provided source code using tree-sitter parsing.
     *
     * This method is the core URL detection functionality. It attempts to parse the source code
     * using the appropriate tree-sitter grammar for the specified language, then traverses the
     * abstract syntax tree to find URLs in string literals and comments. If parsing fails or
     * no grammar is available, it can optionally fall back to regex-based detection.
     *
     * @param sourceCode The source code content to scan for URLs
     * @param language The programming language of the source code (e.g., 'javascript', 'python')
     * @param filePath Optional file path for error reporting and logging (default: '<unknown>')
     * @returns Array of URLMatch instances representing detected URLs with position information
     *
     * @example
     * ```typescript
     * const sourceCode = 'const url = "https://example.com/api";';
     * const urls = detector.detectURLs(sourceCode, 'javascript', 'app.js');
     * console.log(urls[0].url); // "https://example.com/api"
     * console.log(urls[0].line); // 1
     * ```
     */
    public detectURLs(sourceCode: string, language: string, filePath: string = '<unknown>'): URLMatch[] {
        try {
            const languageGrammar = this.languageManager.getLanguage(language);

            if (!languageGrammar && !this.options.fallbackRegex) {
                return [];
            }

            if (!languageGrammar) {
                this.logger.warn(
                    `No parser available for language ${language} for file ${filePath}, using fallback regex`,
                );
                return this.fallbackDetection(sourceCode, filePath);
            }

            // Create a fresh parser instance to avoid conflicts
            const parser = new Parser();
            parser.setLanguage(languageGrammar as Parser.Language);
            const tree = parser.parse(sourceCode);

            return this.extractURLsFromTree(tree, sourceCode, filePath);
        } catch (error: any) {
            if (this.options.fallbackRegex) {
                this.logger.warn(
                    `Failed to parse ${filePath} with tree-sitter, falling back to regex: ${error.message}`,
                );
                return this.fallbackDetection(sourceCode, filePath);
            } else {
                this.logger.warn(`Failed to parse ${filePath}: ${error.message}`);
                return [];
            }
        }
    }

    private extractURLsFromTree(tree: any, sourceCode: string, filePath: string): URLMatch[] {
        const urls: URLMatch[] = [];
        const sourceLines = sourceCode.split('\n');

        // Use recursive node traversal instead of cursor to avoid API compatibility issues
        const traverseNode = (node: any): void => {
            const text = sourceCode.slice(node.startIndex, node.endIndex);

            if (this.isStringNode(node)) {
                // Special handling for raw_text nodes in script tags
                if (node.type === 'raw_text' && this.isScriptContent(node)) {
                    const scriptUrls = this.parseScriptContent(text, node.startIndex, sourceCode, sourceLines);
                    urls.push(...scriptUrls);
                } else {
                    const foundUrls = this.extractURLsFromString(
                        text,
                        node.startIndex,
                        'string',
                        sourceCode,
                        sourceLines,
                    );
                    urls.push(...foundUrls);
                }
            }

            if (this.isCommentNode(node)) {
                const foundUrls = this.extractURLsFromString(text, node.startIndex, 'comment', sourceCode, sourceLines);
                urls.push(...foundUrls);
            }

            // Traverse children
            for (let i = 0; i < node.childCount; i++) {
                traverseNode(node.child(i));
            }
        };

        traverseNode(tree.rootNode);
        return this.deduplicateByExactPosition(urls);
    }

    /**
     * Removes duplicate URLs found at the exact same character positions.
     *
     * This is necessary because tree-sitter AST traversal can find the same URL in both
     * parent and child nodes (e.g., a `string_literal` node and its `string_content` child)
     * which represent the exact same text at identical start:end positions. These are not
     * "real" duplicates that users care about - they're just artifacts of AST structure.
     *
     * This method ONLY removes URLs with identical start:end positions. It preserves all
     * "real" duplicates where the same URL appears at different positions in the source code,
     * which is the behavior users want for comprehensive URL detection.
     *
     * @param urls Array of URLs that may contain position-based duplicates
     * @returns Array with AST traversal duplicates removed, real duplicates preserved
     */
    private deduplicateByExactPosition(urls: URLMatch[]): URLMatch[] {
        const seen = new Map<string, URLMatch>();

        for (const url of urls) {
            // Create a unique key based on exact start and end position
            // This prevents the same URL from being reported multiple times when found in both
            // parent and child AST nodes (e.g., string_literal and string_content)
            const key = `${url.start}:${url.end}`;

            if (!seen.has(key)) {
                seen.set(key, url);
            }
        }

        return Array.from(seen.values());
    }

    private isStringNode(node: any): boolean {
        const stringTypes = [
            'string',
            'string_literal',
            'string_content',
            'string_fragment', // JavaScript string content
            'template_string',
            'interpreted_string_literal',
            'raw_string_literal',
            'character_literal',
            'attribute_value', // HTML attribute values
            'raw_text', // HTML script/style content
            'line_string_literal', // Swift regular strings
            'line_str_text', // Swift string content
            'raw_str_end_part', // Swift raw string content
            'CharData', // XML character data
            'CData', // XML CDATA sections
            'AttValue', // XML attribute values
            'double_quote_scalar', // YAML double-quoted strings
            'single_quote_scalar', // YAML single-quoted strings
            'plain_scalar', // YAML unquoted strings
        ];
        return stringTypes.includes(node.type);
    }

    private isCommentNode(node: any): boolean {
        const commentTypes = ['comment', 'line_comment', 'block_comment', 'documentation_comment', 'Comment'];
        return commentTypes.includes(node.type);
    }

    private isScriptContent(node: any): boolean {
        // Check if this raw_text node is inside a script element
        let parent = node.parent;
        while (parent) {
            if (parent.type === 'script_element' || parent.type === 'element') {
                // For HTML, check if it's actually a script tag
                const startTag = parent.children && parent.children[0];
                if (startTag && startTag.type === 'start_tag') {
                    const tagName =
                        startTag.children && startTag.children.find((child: any) => child.type === 'tag_name');
                    if (tagName) {
                        const tagText = tagName.text || '';
                        return tagText.toLowerCase() === 'script';
                    }
                }
            }
            parent = parent.parent;
        }
        return false;
    }

    private parseScriptContent(
        scriptText: string,
        startIndex: number,
        fullSourceCode: string,
        sourceLines: string[],
    ): URLMatch[] {
        try {
            // Get JavaScript language grammar
            const jsLanguage = this.languageManager.getLanguage('javascript');
            if (!jsLanguage) {
                // Fall back to regex if JavaScript parser not available
                return this.extractURLsFromString(scriptText, startIndex, 'string', fullSourceCode, sourceLines);
            }

            // Parse the script content as JavaScript
            const jsParser = new Parser();
            jsParser.setLanguage(jsLanguage as Parser.Language);
            const jsTree = jsParser.parse(scriptText);

            const urls: URLMatch[] = [];

            // Traverse the JavaScript AST
            const traverseJSNode = (node: any): void => {
                const nodeType = node.type;
                const text = scriptText.slice(node.startIndex, node.endIndex);

                if (this.isStringNode(node)) {
                    const foundUrls = this.extractURLsFromString(
                        text,
                        startIndex + node.startIndex,
                        'string',
                        fullSourceCode,
                        sourceLines,
                    );
                    urls.push(...foundUrls);
                }

                if (this.isCommentNode(node)) {
                    const foundUrls = this.extractURLsFromString(
                        text,
                        startIndex + node.startIndex,
                        'comment',
                        fullSourceCode,
                        sourceLines,
                    );
                    urls.push(...foundUrls);
                }

                // Traverse children
                for (let i = 0; i < node.childCount; i++) {
                    traverseJSNode(node.child(i));
                }
            };

            traverseJSNode(jsTree.rootNode);
            return urls;
        } catch (error: any) {
            // Fall back to regex if JavaScript parsing fails
            this.logger.warn(`Failed to parse script content as JavaScript, falling back to regex: ${error.message}`);
            return this.extractURLsFromString(scriptText, startIndex, 'string', fullSourceCode, sourceLines);
        }
    }

    private extractURLsFromString(
        text: string,
        startIndex: number,
        sourceType: 'string' | 'comment' | 'unknown' = 'unknown',
        fullSourceCode: string = '',
        sourceLines: string[] = [],
    ): URLMatch[] {
        const urls: URLMatch[] = [];
        let match: RegExpExecArray | null;

        while ((match = this.urlPattern.exec(text)) !== null) {
            // Skip common schema/DOCTYPE patterns that aren't real URLs
            if (this.isCommonSchemaPattern(match[0])) {
                continue;
            }

            const globalStart = startIndex + match.index;
            const globalEnd = startIndex + match.index + match[0].length;
            const line = this.getLineNumber(fullSourceCode, globalStart);
            const column = this.getColumnNumber(fullSourceCode, globalStart);

            const urlObj: URLMatch = {
                url: match[0],
                start: globalStart,
                end: globalEnd,
                line: line,
                column: column,
                sourceType: sourceType,
            };

            // Add context if requested
            if (this.options.context && this.options.context > 0) {
                urlObj.context = this.getContext(sourceLines, line - 1, this.options.context);
            }

            urls.push(urlObj);
        }

        this.urlPattern.lastIndex = 0;
        return urls;
    }

    private isCommonSchemaPattern(url: string): boolean {
        return this.commonSchemaPatterns.some(pattern => pattern.test(url));
    }

    private fallbackDetection(sourceCode: string, filePath: string): URLMatch[] {
        const urls: URLMatch[] = [];
        const sourceLines = sourceCode.split('\n');
        let match: RegExpExecArray | null;

        while ((match = this.urlPattern.exec(sourceCode)) !== null) {
            const line = this.getLineNumber(sourceCode, match.index);
            const column = this.getColumnNumber(sourceCode, match.index);

            // Skip common schema/DOCTYPE patterns that aren't real URLs
            if (this.isCommonSchemaPattern(match[0])) {
                continue;
            }

            const urlObj: URLMatch = {
                url: match[0],
                start: match.index,
                end: match.index + match[0].length,
                line: line,
                column: column,
                sourceType: 'unknown',
            };

            // Add context if requested
            if (this.options.context && this.options.context > 0) {
                urlObj.context = this.getContext(sourceLines, line - 1, this.options.context);
            }

            urls.push(urlObj);
        }

        this.urlPattern.lastIndex = 0;
        return urls;
    }

    // File finding and reading methods (moved from FileScanner)
    private async findFiles(): Promise<string[]> {
        // Use fast-glob to find files matching patterns
        // Sanitize glob patterns to prevent path traversal
        const scanPatterns = sanitizeGlobPatterns(this.options.scan || ['**/*']);
        const excludePatterns = sanitizeGlobPatterns(this.options.exclude || []);

        // Set up the working directory
        const cwd = process.cwd();

        try {
            const files = await fg(scanPatterns, {
                cwd: cwd,
                ignore: excludePatterns,
                dot: false,
                onlyFiles: true,
                followSymbolicLinks: false,
                suppressErrors: true,
                absolute: false,
                markDirectories: false,
            });

            return files.map(file => path.resolve(cwd, file));
        } catch (error: any) {
            throw new Error(`Failed to find files: ${error.message}`);
        }
    }

    private async processFile(filePath: string): Promise<FileResult | null> {
        try {
            const content: string = await fs.promises.readFile(filePath, 'utf8');
            const language = this.languageManager.detectLanguageFromPath(filePath);
            const urls = this.detectURLs(content, language, filePath);
            const filteredUrls = this.urlFilter.filterUrls(urls);

            return {
                file: filePath,
                urls: filteredUrls,
            };
        } catch (error: any) {
            this.logger.warn(`Failed to process file ${filePath}: ${error.message}`);
            return null;
        }
    }

    private getLineNumber(text: string, position: number): number {
        const beforePosition = text.substring(0, position);
        return beforePosition.split('\n').length;
    }

    private getColumnNumber(text: string, position: number): number {
        const beforePosition = text.substring(0, position);
        const lines = beforePosition.split('\n');
        return lines[lines.length - 1].length + 1;
    }

    private getContext(lines: string[], lineIndex: number, contextSize: number): string[] {
        const start = Math.max(0, lineIndex - contextSize);
        const end = Math.min(lines.length, lineIndex + contextSize + 1);
        return lines.slice(start, end);
    }

    /**
     * Processes all files matching the configured scan patterns and detects URLs in them.
     *
     * This is the main entry point for batch URL detection. It finds all files matching
     * the scan patterns (excluding ignored patterns), processes them concurrently with
     * the configured concurrency limit, applies URL filtering, and optionally formats
     * and outputs the results.
     *
     * The method performs the following steps:
     * 1. Find files using glob patterns from options.scan
     * 2. Process files concurrently (respecting options.concurrency limit)
     * 3. Detect URLs in each file using detectURLs()
     * 4. Apply URL filtering using the configured URLFilter
     * 5. Format and output results
     *
     * @returns Promise resolving to array of FileResult objects containing detected URLs
     *
     * @example
     * ```typescript
     * const detector = new URLDetector({
     *   scan: ['src/*.js'],
     *   includeComments: true
     * });
     *
     * const results = await detector.process();
     * results.forEach(result => {
     *   console.log(`${result.file}: ${result.urls.length} URLs found`);
     * });
     * ```
     */
    public async process(): Promise<FileResult[]> {
        const filePaths = await this.findFiles();

        if (filePaths.length === 0) {
            this.logger.info('No files found to process.');
            return [];
        }

        // Create concurrency limiter
        const limit = pLimit(this.options.concurrency || 10);

        // Process files concurrently with limit (read + detect URLs in one step)
        const fileProcessPromises = filePaths.map(filePath => limit(() => this.processFile(filePath)));

        // Wait for all file processing to complete and filter out nulls (failed files)
        const allResults = await Promise.all(fileProcessPromises);
        const results = allResults.filter((result): result is FileResult => result !== null);

        return results;
    }
}
