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

/**
 * Supported output formats for URL detection results
 */
export type OutputFormat = 'table' | 'json' | 'csv';

/**
 * Configuration interface for URL detector options.
 * All properties are optional and will use sensible defaults if not provided.
 */
export interface DetectorOptionsConfig {
    /* File patterns to scan for URLs */
    scan?: string[];
    /** File patterns to exclude from scanning (default: []) */
    exclude?: string[];

    /** Array of domain patterns to ignore during URL detection (default: []) */
    ignoreDomains?: string[];
    /** Whether to include URLs found in comments (default: false) */
    includeComments?: boolean;
    /** Whether to include non-fully qualified domain names like 'localhost' (default: false) */
    includeNonFqdn?: boolean;
    /** Output format for results (default: 'table') */
    format?: OutputFormat;
    /** Path to output file, or null for stdout (default: null) */
    output?: string | null;

    /** Whether to output only the results without metadata (default: false) */
    resultsOnly?: boolean;
    /** Whether to exit with non-zero code on detection errors (default: false) */
    failOnError?: boolean;
    /** Number of concurrent file processing operations (default: 10) */
    concurrency?: number;

    /** Maximum directory depth to scan (default: Infinity) */
    maxDepth?: number;
    /** Whether to use fallback regex patterns when primary detection fails (default: true) */
    fallbackRegex?: boolean;

    /** Number of context lines to include around detected URLs (default: 0) */
    context?: number;
}

/**
 * Main configuration class for URL detection operations.
 *
 * This class holds all configuration options and provides methods for parsing
 * and validating options from various sources (CLI arguments, config files, etc.).
 *
 * @example
 * ```typescript
 * const options = new DetectorOptions({
 *     scan: ['src/index.ts', 'docs/readme.md'],
 *     exclude: ['node_modules', 'dist'],
 *     includeComments: true,
 *     format: 'json',
 *     concurrency: 5
 * });
 * ```
 */
export class DetectorOptions {
    public scan: string[];
    public exclude: string[];
    public ignoreDomains: string[];
    public includeComments: boolean;
    public includeNonFqdn: boolean;
    public format: OutputFormat;
    public outputFile: string | null;

    public resultsOnly: boolean;
    public failOnError: boolean;
    public concurrency: number;

    public maxDepth: number;
    public withLineNumbers: boolean;
    public withFilenames: boolean;
    public relativePaths: boolean;
    public fallbackRegex: boolean;

    public context: number;

    /**
     * Creates a new DetectorOptions instance with the provided configuration.
     *
     * All options are optional and will use sensible defaults if not provided.
     * The constructor validates the provided options and throws errors for invalid values.
     *
     * @param options Configuration object with URL detection settings
     * @throws {Error} When invalid output format, negative values, or conflicting options are provided
     *
     * @example
     * ```typescript
     * // Basic usage with defaults
     * const options = new DetectorOptions();
     *
     * // Custom configuration
     * const options = new DetectorOptions({
     *     scan: ['src/app.js'],
     *     includeComments: true,
     *     format: 'json',
     *     concurrency: 5
     * });
     * ```
     */
    constructor(options: DetectorOptionsConfig = {}) {
        // File patterns - handle array parsing from CLI
        this.scan = DetectorOptions.parseArrayOption(options.scan) || ['**/*'];
        this.exclude = DetectorOptions.parseArrayOption(options.exclude) || [];

        // Filtering options - handle array parsing from CLI
        this.ignoreDomains = DetectorOptions.parseArrayOption(options.ignoreDomains) || [];
        this.includeComments = options.includeComments || false;
        this.includeNonFqdn = options.includeNonFqdn || false;

        // Output options
        this.format = options.format || 'table';
        this.outputFile = options.output || null;

        // Control options
        this.resultsOnly = options.resultsOnly || false;
        this.failOnError = options.failOnError || false;

        // Performance options
        this.concurrency = options.concurrency ?? 10;

        // Internal options (maintain compatibility with existing code)

        this.maxDepth = options.maxDepth || Infinity;
        this.withLineNumbers = true;
        this.withFilenames = true;
        this.relativePaths = true;
        this.fallbackRegex = options.fallbackRegex !== false;

        this.context = options.context || 0;

        this.validateOptions();
    }

    private validateOptions(): void {
        const validOutputFormats: OutputFormat[] = ['json', 'csv', 'table'];
        if (!validOutputFormats.includes(this.format)) {
            throw new Error(`Invalid output format: ${this.format}. Valid formats: ${validOutputFormats.join(', ')}`);
        }

        if (this.maxDepth < 0) {
            throw new Error('Max depth must be >= 0');
        }

        if (this.concurrency < 1) {
            throw new Error('Concurrency must be >= 1');
        }
    }

    /**
     * Converts various input formats to string arrays for CLI compatibility.
     *
     * This static method handles the conversion of command-line arguments that can be
     * provided as strings (comma-separated) or arrays into normalized string arrays.
     *
     * @param value Input value to convert - can be undefined, string, or string array
     * @returns Array of strings, or empty array if input is undefined
     *
     * @example
     * ```typescript
     * // String input (comma-separated)
     * DetectorOptions.parseArrayOption('file1.js,file2.ts,file3.html')
     * // Returns: ['file1.js', 'file2.ts', 'file3.html']
     *
     * // Array input (already parsed)
     * DetectorOptions.parseArrayOption(['file1.js', 'file2.ts'])
     * // Returns: ['file1.js', 'file2.ts']
     *
     * // Undefined input
     * DetectorOptions.parseArrayOption(undefined)
     * // Returns: []
     * ```
     */
    static parseArrayOption(value: string | string[] | undefined): string[] {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
            return value
                .split(',')
                .map(v => v.trim())
                .filter(v => v.length > 0);
        }
        return [];
    }

    /**
     * Loads file patterns from a text file.
     *
     * Reads a file containing patterns (one per line) and returns them as an array.
     * Lines starting with '#' are treated as comments and ignored. Empty lines
     * and whitespace-only lines are also filtered out.
     *
     * @param filePath Path to the file containing patterns
     * @returns Promise resolving to array of pattern strings
     * @throws {Error} When file cannot be read or accessed
     *
     * @example
     * ```typescript
     * // File content example:
     * // # Scan patterns
     * // src/components
     * // src/utils
     * // # Empty lines and comments are ignored
     *
     * const patterns = await options.loadPatternsFromFile('scan-patterns.txt');
     * // Returns: ['src/components', 'src/utils']
     * ```
     */
    async loadPatternsFromFile(filePath: string): Promise<string[]> {
        const content = await fs.promises.readFile(filePath, 'utf8');
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));
    }
}
