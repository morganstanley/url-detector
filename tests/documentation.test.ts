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

/**
 * Tests to ensure documentation stays in sync with code
 */

import fs from 'fs';
import path from 'path';
import { LanguageManager } from '../src/languageManager';

describe('Documentation Sync Tests', () => {
    let readmeContent: string;

    beforeAll(() => {
        const readmePath = path.join(__dirname, '..', 'README.md');
        readmeContent = fs.readFileSync(readmePath, 'utf8');
    });

    describe('CLI Options Documentation', () => {
        it('should document all CLI options defined in cli.ts', () => {
            // Extract options from README table first
            const tableMatch = readmeContent.match(/\| Option \| Description \| Default \|([\s\S]*?)\n\n/);
            if (!tableMatch) {
                throw new Error('Could not find CLI options table in README.md');
            }

            const tableContent = tableMatch[1];
            const optionRows = tableContent
                .split('\n')
                .filter(line => line.trim().startsWith('|') && !line.includes('----------'));

            const documentedOptions: string[] = [];
            for (const row of optionRows) {
                const columns = row.split('|').map(col => col.trim());
                if (columns.length >= 2 && columns[1]) {
                    // Extract option from first column (e.g., "`-s, --scan <patterns...>`")
                    const optionMatch = columns[1].match(/`([^`]+)`/);
                    if (optionMatch) {
                        const optionString = optionMatch[1];
                        // Split on comma and extract individual options
                        const parts = optionString.split(',').map(part =>
                            part
                                .trim()
                                .replace(/\s+<[^>]*>.*$/, '')
                                .replace(/\s+\[[^\]]*\].*$/, '')
                                .trim(),
                        );
                        documentedOptions.push(...parts);
                    }
                }
            }

            // Read the CLI file to extract option definitions
            const cliPath = path.join(__dirname, '..', 'src', 'cli.ts');
            const cliContent = fs.readFileSync(cliPath, 'utf8');

            // Extract all .option() calls using regex
            const optionRegex = /\.option\(\s*['"`]([^'"`]+)['"`]/g;
            const definedOptions: string[] = [];
            let match;

            while ((match = optionRegex.exec(cliContent)) !== null) {
                const optionString = match[1];
                // Extract both short and long forms (e.g., "-s, --scan" -> ["-s", "--scan"])
                const parts = optionString.split(',').map(part => part.trim());
                definedOptions.push(...parts);
            }

            // Filter out options that have parameters (contain < or [)
            const baseOptions = definedOptions.map(opt => {
                // Remove parameter specifications like "<patterns...>" or "[file]"
                return opt
                    .replace(/\s+<[^>]*>.*$/, '')
                    .replace(/\s+\[[^\]]*\].*$/, '')
                    .trim();
            });

            // Check that each option appears in the documented options
            const missingOptions: string[] = [];
            for (const option of baseOptions) {
                if (!documentedOptions.includes(option)) {
                    missingOptions.push(option);
                }
            }

            if (missingOptions.length > 0) {
                throw new Error(
                    `The following CLI options are not documented in README.md: ${missingOptions.join(', ')}\n` +
                        `Please update the CLI Options table in README.md to include these options.`,
                );
            }
        });

        it('should not document CLI options that do not exist in code', () => {
            // Extract options from README table
            const tableMatch = readmeContent.match(/\| Option \| Description \| Default \|([\s\S]*?)\n\n/);
            if (!tableMatch) {
                fail('Could not find CLI options table in README.md');
                return;
            }

            const tableContent = tableMatch[1];
            const optionRows = tableContent
                .split('\n')
                .filter(line => line.trim().startsWith('|') && !line.includes('----------'));

            const documentedOptions: string[] = [];
            for (const row of optionRows) {
                const columns = row.split('|').map(col => col.trim());
                if (columns.length >= 2 && columns[1]) {
                    // Extract option from first column (e.g., "`-s, --scan <patterns...>`")
                    const optionMatch = columns[1].match(/`([^`]+)`/);
                    if (optionMatch) {
                        const optionString = optionMatch[1];
                        // Split on comma and extract individual options
                        const parts = optionString.split(',').map(part =>
                            part
                                .trim()
                                .replace(/\s+<[^>]*>.*$/, '')
                                .replace(/\s+\[[^\]]*\].*$/, '')
                                .trim(),
                        );
                        documentedOptions.push(...parts);
                    }
                }
            }

            // Read CLI file to get actual options
            const cliPath = path.join(__dirname, '..', 'src', 'cli.ts');
            const cliContent = fs.readFileSync(cliPath, 'utf8');

            const optionRegex = /\.option\(\s*['"`]([^'"`]+)['"`]/g;
            const actualOptions: string[] = [];
            let match;

            while ((match = optionRegex.exec(cliContent)) !== null) {
                const optionString = match[1];
                const parts = optionString.split(',').map(part =>
                    part
                        .trim()
                        .replace(/\s+<[^>]*>.*$/, '')
                        .replace(/\s+\[[^\]]*\].*$/, '')
                        .trim(),
                );
                actualOptions.push(...parts);
            }

            // Find documented options that don't exist in code
            const extraOptions = documentedOptions.filter(opt => !actualOptions.includes(opt));

            if (extraOptions.length > 0) {
                throw new Error(
                    `The following CLI options are documented in README.md but do not exist in cli.ts: ${extraOptions.join(', ')}\n` +
                        `Please remove these options from the CLI Options table in README.md.`,
                );
            }
        });
    });

    describe('Supported Languages Documentation', () => {
        it('should document all languages supported by LanguageManager', () => {
            const languageManager = new LanguageManager();
            const supportedLanguageDisplayNames = languageManager.getSupportedLanguageDisplayNames();

            const missingLanguages: string[] = [];
            for (const displayName of supportedLanguageDisplayNames) {
                // Check if language display name appears in the supported languages table
                if (!readmeContent.includes(`| ${displayName} |`)) {
                    missingLanguages.push(displayName);
                }
            }

            if (missingLanguages.length > 0) {
                throw new Error(
                    `The following supported languages are not documented in README.md: ${missingLanguages.join(', ')}\n` +
                        `Please update the Supported Languages table in README.md to include these languages.`,
                );
            }
        });

        it('should not document languages that are not supported', () => {
            // Extract languages from README table
            const tableMatch = readmeContent.match(/\| Language \| Extensions \| Tree-sitter Parser \|([\s\S]*?)\n>/);
            if (!tableMatch) {
                fail('Could not find Supported Languages table in README.md');
                return;
            }

            const tableContent = tableMatch[1];
            const languageRows = tableContent
                .split('\n')
                .filter(line => line.trim().startsWith('|') && !line.includes('----------'));

            const documentedLanguages: string[] = [];
            for (const row of languageRows) {
                const columns = row.split('|').map(col => col.trim());
                if (columns.length >= 2 && columns[1]) {
                    documentedLanguages.push(columns[1]);
                }
            }

            // Get actual supported language display names
            const languageManager = new LanguageManager();
            const actualLanguageDisplayNames = languageManager.getSupportedLanguageDisplayNames();

            // Find documented languages that aren't actually supported
            const extraLanguages = documentedLanguages.filter(lang => !actualLanguageDisplayNames.includes(lang));

            if (extraLanguages.length > 0) {
                throw new Error(
                    `The following languages are documented in README.md but are not supported by LanguageManager: ${extraLanguages.join(', ')}\n` +
                        `Please remove these languages from the Supported Languages table in README.md or add support for them.`,
                );
            }
        });

        it('should have correct extensions for each documented language', () => {
            const languageManager = new LanguageManager();

            // Extract languages and extensions from README table
            const tableMatch = readmeContent.match(/\| Language \| Extensions \| Tree-sitter Parser \|([\s\S]*?)\n>/);
            if (!tableMatch) {
                fail('Could not find Supported Languages table in README.md');
                return;
            }

            const tableContent = tableMatch[1];
            const languageRows = tableContent
                .split('\n')
                .filter(line => line.trim().startsWith('|') && !line.includes('----------'));

            const documentedLanguageInfo: Array<{ language: string; extensions: string[] }> = [];
            for (const row of languageRows) {
                const columns = row.split('|').map(col => col.trim());
                if (columns.length >= 3 && columns[1] && columns[2]) {
                    const language = columns[1];
                    // Extract extensions from the second column (e.g., "`.js`, `.mjs`")
                    const extensionsText = columns[2];
                    const extensions = extensionsText.match(/`\.[^`]+`/g)?.map(ext => ext.slice(1, -1)) || [];
                    documentedLanguageInfo.push({ language, extensions });
                }
            }

            const errors: string[] = [];
            for (const { language, extensions } of documentedLanguageInfo) {
                try {
                    // Try to find by display name first, then by internal name
                    const config = languageManager
                        .getLanguageConfigs()
                        .find(
                            c =>
                                (c.displayName && c.displayName.toLowerCase() === language.toLowerCase()) ||
                                c.name.toLowerCase() === language.toLowerCase(),
                        );

                    if (config) {
                        // Check if documented extensions match actual extensions
                        const actualExtensions = config.extensions;
                        const missingExtensions = actualExtensions.filter(ext => !extensions.includes(ext));
                        const extraExtensions = extensions.filter(ext => !actualExtensions.includes(ext));

                        if (missingExtensions.length > 0) {
                            errors.push(`${language}: Missing extensions in README: ${missingExtensions.join(', ')}`);
                        }
                        if (extraExtensions.length > 0) {
                            errors.push(`${language}: Extra extensions in README: ${extraExtensions.join(', ')}`);
                        }
                    } else {
                        // Language not found in manager
                        errors.push(`${language}: Language not found in LanguageManager`);
                    }
                } catch (error) {
                    // Language not found in manager
                    errors.push(`${language}: Language lookup failed: ${error}`);
                }
            }

            if (errors.length > 0) {
                throw new Error(
                    `Extension mismatches found:\n${errors.join('\n')}\n` +
                        `Please update the Supported Languages table in README.md to match the actual language configurations.`,
                );
            }
        });
    });
});
