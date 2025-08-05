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

import { Logger, NullLogger } from './logger';
import * as path from 'path';

/**
 * Configuration for a programming language parser with Tree-sitter integration.
 */
export interface LanguageConfig {
    /** Unique identifier for the language (e.g., 'javascript', 'typescript') */
    name: string;
    /** Human-readable display name for documentation (e.g., 'JavaScript', 'TypeScript') */
    displayName?: string;
    /** Name of the Tree-sitter module to import (e.g., 'tree-sitter-javascript') */
    module: string;
    /** Array of file extensions associated with this language (e.g., ['.js', '.ts']) */
    extensions: string[];
    /** Optional sub-language key for modules that export multiple languages (defaults to name) */
    subLanguage?: string;
    /** Optional array of specific filenames to associate with this language */
    filenames?: string[];
}

/**
 * Manages programming language configurations and Tree-sitter parser loading.
 *
 * Provides centralized management of language parsers used for code analysis,
 * including dynamic loading of Tree-sitter modules, file extension mapping,
 * and language detection from file paths.
 */
export class LanguageManager {
    /**
     * Default set of supported programming languages with their Tree-sitter configurations.
     * Includes popular languages like JavaScript, TypeScript, Java, Python, C/C++, and more.
     */
    /* eslint-disable prettier/prettier */
    private static readonly DEFAULT_LANGUAGES: LanguageConfig[] = [
        { name: 'javascript', displayName: 'JavaScript', module: 'tree-sitter-javascript', extensions: ['.js', '.mjs'] },
        { name: 'typescript', displayName: 'TypeScript', module: 'tree-sitter-typescript', extensions: ['.ts', '.tsx'] },
        { name: 'java', displayName: 'Java', module: 'tree-sitter-java', extensions: ['.java'] },
        { name: 'c', displayName: 'C', module: 'tree-sitter-c', extensions: ['.c', '.h'] },
        { name: 'cpp', displayName: 'C++', module: 'tree-sitter-cpp', extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx'] },
        { name: 'csharp', displayName: 'C#', module: 'tree-sitter-c-sharp', extensions: ['.cs'] },
        { name: 'html', displayName: 'HTML', module: 'tree-sitter-html', extensions: ['.html', '.htm'] },
        { name: 'css', displayName: 'CSS', module: 'tree-sitter-css', extensions: ['.css'] },
        { name: 'python', displayName: 'Python', module: 'tree-sitter-python', extensions: ['.py', '.pyw'] },
        { name: 'php', displayName: 'PHP', module: 'tree-sitter-php', extensions: ['.php', '.phtml'] },
        { name: 'ruby', displayName: 'Ruby', module: 'tree-sitter-ruby', extensions: ['.rb', '.rake', '.gemspec'] },
        { name: 'go', displayName: 'Go', module: 'tree-sitter-go', extensions: ['.go'] },
        { name: 'json', displayName: 'JSON', module: 'tree-sitter-json', extensions: ['.json', '.jsonc'] },
        { name: 'toml', displayName: 'TOML', module: '@tree-sitter-grammars/tree-sitter-toml', extensions: ['.toml'] },
        { name: 'xml', displayName: 'XML', module: '@tree-sitter-grammars/tree-sitter-xml', extensions: ['.xml', '.xsd', '.xsl', '.xslt'] },
        { name: 'bash', displayName: 'Bash', module: 'tree-sitter-bash', extensions: ['.sh', '.bash', '.zsh', '.fish'] },
        { name: 'swift', displayName: 'Swift', module: 'tree-sitter-swift', extensions: ['.swift'] },
        { name: 'kotlin', displayName: 'Kotlin', module: '@tree-sitter-grammars/tree-sitter-kotlin', extensions: ['.kt', '.kts'] },
        { name: 'scala', displayName: 'Scala', module: 'tree-sitter-scala', extensions: ['.scala', '.sc'] },
        { name: 'yaml', displayName: 'YAML', module: '@tree-sitter-grammars/tree-sitter-yaml', extensions: ['.yaml', '.yml'] },
    ];
    /* eslint-enable prettier/prettier */

    private languages: Map<string, unknown>;
    private languageConfigs: LanguageConfig[];
    private logger: Logger;

    /**
     * Creates a new LanguageManager instance with optional custom configuration.
     *
     * @param logger Optional logger instance for diagnostics and error reporting
     * @param customLanguages Optional array of custom language configurations.
     *                       If provided, replaces the default language set entirely.
     *
     * @example
     * ```typescript
     * // Using default languages
     * const manager = new LanguageManager();
     *
     * // With custom logger
     * const manager = new LanguageManager(new ConsoleLogger());
     *
     * // With custom languages only
     * const customLangs = [
     *   { name: 'rust', module: 'tree-sitter-rust', extensions: ['.rs'] }
     * ];
     * const manager = new LanguageManager(logger, customLangs);
     * ```
     */
    constructor(logger?: Logger, customLanguages?: LanguageConfig[]) {
        this.languages = new Map();
        this.logger = logger || NullLogger;
        this.languageConfigs = customLanguages ? [...customLanguages] : [...LanguageManager.DEFAULT_LANGUAGES];
        this.loadLanguages();
    }

    private loadLanguages(): void {
        // Clear existing languages
        this.languages.clear();

        for (const config of this.languageConfigs) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const languageModule = require(config.module);
                let language: unknown;

                // Try to get subLanguage from module, defaulting to language name, then module directly
                const subLanguageName = config.subLanguage || config.name;
                if (subLanguageName && (languageModule as Record<string, unknown>)[subLanguageName]) {
                    language = (languageModule as Record<string, unknown>)[subLanguageName];
                } else {
                    // For Tree-sitter 0.25+, use the module directly
                    language = languageModule;
                }

                this.languages.set(config.name, language);

                for (const ext of config.extensions) {
                    this.languages.set(ext, language);
                }

                if (config.filenames) {
                    for (const filename of config.filenames) {
                        this.languages.set(filename.toLowerCase(), language);
                    }
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.warn(`Failed to load ${config.name} parser: ${errorMessage}`);
            }
        }
    }

    /**
     * Adds or updates a language configuration.
     *
     * If a language with the same name exists, it will be replaced.
     * Otherwise, the new language will be added to the configuration.
     * Automatically reloads all language parsers after the change.
     *
     * @param config The language configuration to add or update
     *
     * @example
     * ```typescript
     * const rustConfig = {
     *   name: 'rust',
     *   module: 'tree-sitter-rust',
     *   extensions: ['.rs'],
     *   filenames: ['Cargo.toml']
     * };
     * manager.addLanguage(rustConfig);
     * ```
     */
    public addLanguage(config: LanguageConfig): void {
        const existingIndex = this.languageConfigs.findIndex(c => c.name === config.name);
        if (existingIndex >= 0) {
            this.languageConfigs[existingIndex] = config;
        } else {
            this.languageConfigs.push(config);
        }
        this.loadLanguages();
    }

    /**
     * Removes a language configuration by name.
     *
     * Automatically reloads all language parsers after removal if the language was found.
     *
     * @param name The name of the language to remove
     * @returns true if the language was found and removed, false otherwise
     *
     * @example
     * ```typescript
     * const wasRemoved = manager.removeLanguage('rust');
     * if (wasRemoved) {
     *   console.log('Rust language configuration removed');
     * }
     * ```
     */
    public removeLanguage(name: string): boolean {
        const initialLength = this.languageConfigs.length;
        this.languageConfigs = this.languageConfigs.filter(config => config.name !== name);

        if (this.languageConfigs.length < initialLength) {
            this.loadLanguages();
            return true;
        }
        return false;
    }

    /**
     * Updates an existing language configuration.
     *
     * The language name cannot be changed through this method - use removeLanguage()
     * followed by addLanguage() if you need to rename a language.
     * Automatically reloads all language parsers after update if the language was found.
     *
     * @param name The name of the language to update
     * @param config The new configuration (name property will be overridden with the provided name)
     * @returns true if the language was found and updated, false otherwise
     *
     * @example
     * ```typescript
     * const updatedConfig = {
     *   name: 'javascript', // This will be overridden
     *   module: 'tree-sitter-javascript',
     *   extensions: ['.js', '.mjs', '.jsx'] // Adding .jsx support
     * };
     * const wasUpdated = manager.updateLanguage('javascript', updatedConfig);
     * ```
     */
    public updateLanguage(name: string, config: LanguageConfig): boolean {
        const index = this.languageConfigs.findIndex(c => c.name === name);
        if (index >= 0) {
            this.languageConfigs[index] = { ...config, name };
            this.loadLanguages();
            return true;
        }
        return false;
    }

    /**
     * Gets a copy of all current language configurations.
     *
     * Returns a defensive copy to prevent external modifications to the internal state.
     *
     * @returns Array of all language configurations currently managed
     *
     * @example
     * ```typescript
     * const configs = manager.getLanguageConfigs();
     * console.log(`Managing ${configs.length} languages`);
     * configs.forEach(config => {
     *   console.log(`${config.name}: ${config.extensions.join(', ')}`);
     * });
     * ```
     */
    public getLanguageConfigs(): LanguageConfig[] {
        return [...this.languageConfigs];
    }

    /**
     * Retrieves the names of all supported languages.
     *
     * Returns an array of language names that are currently configured in this manager.
     * Useful for testing and validation purposes.
     *
     * @returns Array of supported language names
     *
     * @example
     * ```typescript
     * const languages = manager.getSupportedLanguages();
     * console.log(`Supported: ${languages.join(', ')}`); // "javascript, typescript, java, ..."
     * ```
     */
    public getSupportedLanguages(): string[] {
        return this.languageConfigs.map(config => config.name);
    }

    /**
     * Retrieves the display names of all supported languages.
     *
     * Returns an array of human-readable language display names for documentation purposes.
     * Falls back to the internal name if no displayName is specified.
     *
     * @returns Array of supported language display names
     *
     * @example
     * ```typescript
     * const displayNames = manager.getSupportedLanguageDisplayNames();
     * console.log(`Supported: ${displayNames.join(', ')}`); // "JavaScript, TypeScript, Java, ..."
     * ```
     */
    public getSupportedLanguageDisplayNames(): string[] {
        return this.languageConfigs.map(config => config.displayName || config.name);
    }

    /**
     * Retrieves a specific language configuration by name.
     *
     * Performs a case-insensitive lookup for the language configuration.
     * Returns undefined if the language is not found.
     *
     * @param name Language name to look up
     * @returns Language configuration or undefined if not found
     *
     * @example
     * ```typescript
     * const jsConfig = manager.getLanguageConfig('javascript');
     * if (jsConfig) {
     *   console.log(`Extensions: ${jsConfig.extensions.join(', ')}`);
     * }
     * ```
     */
    public getLanguageConfig(name: string): LanguageConfig | undefined {
        return this.languageConfigs.find(config => config.name.toLowerCase() === name.toLowerCase());
    }

    /**
     * Retrieves a loaded Tree-sitter language parser by name or file extension.
     *
     * The lookup is case-insensitive and supports both language names (e.g., 'javascript')
     * and file extensions (e.g., '.js'). Returns the actual Tree-sitter language object
     * that can be used for parsing.
     *
     * @param languageOrExtension Language name or file extension to look up
     * @returns The Tree-sitter language parser object, or undefined if not found
     *
     * @example
     * ```typescript
     * // Get by language name
     * const jsParser = manager.getLanguage('javascript');
     *
     * // Get by file extension
     * const tsParser = manager.getLanguage('.ts');
     *
     * if (jsParser) {
     *   // Use the parser with Tree-sitter
     *   const tree = parser.parse(sourceCode, jsParser);
     * }
     * ```
     */
    public getLanguage(languageOrExtension: string): unknown {
        return this.languages.get(languageOrExtension.toLowerCase());
    }

    /**
     * Detects the programming language from a file path.
     *
     * Uses both file extensions and specific filenames to determine the language.
     * The detection is case-insensitive and checks against all configured languages.
     * File extensions are checked first, followed by specific filename patterns.
     *
     * @param filePath The file path to analyze for language detection
     * @returns The detected language name, or 'unknown' if no match is found
     *
     * @example
     * ```typescript
     * const lang1 = manager.detectLanguageFromPath('src/main.js');     // 'javascript'
     * const lang2 = manager.detectLanguageFromPath('app.component.ts'); // 'typescript'
     * const lang3 = manager.detectLanguageFromPath('Cargo.toml');      // 'toml'
     * const lang4 = manager.detectLanguageFromPath('README.txt');      // 'unknown'
     * ```
     */
    public detectLanguageFromPath(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const basename = path.basename(filePath).toLowerCase();

        // Find language by extension or filename from the configs
        for (const config of this.languageConfigs) {
            // Check extensions
            if (config.extensions.includes(ext)) {
                return config.name;
            }
            // Check filenames
            if (config.filenames && config.filenames.includes(basename)) {
                return config.name;
            }
        }

        return 'unknown';
    }
}
