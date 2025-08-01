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
import { URLDetector } from '../src/urlDetector';
import { LanguageManager } from '../src/languageManager';
import { Logger } from '../src/logger';

class TestLogger implements Logger {
    public warnings: string[] = [];
    public errors: string[] = [];

    warn(message: string): void {
        this.warnings.push(message);
    }

    error(message: string): void {
        this.errors.push(message);
    }

    log(): void {
        // Ignore log messages in tests
    }

    info(): void {
        // Ignore info messages in tests
    }

    debug(): void {
        // Ignore debug messages in tests
    }

    clear(): void {
        this.warnings = [];
        this.errors = [];
    }
}

describe('Integration Tests - Examples Validation', () => {
    const examplesDir = path.join(__dirname, '..', 'examples');
    let testLogger: TestLogger;

    beforeEach(() => {
        testLogger = new TestLogger();
    });

    test('every supported language should have at least one example file', () => {
        const languageManager = new LanguageManager();
        const languageConfigs = languageManager.getLanguageConfigs();

        // Get all example file extensions
        const exampleFiles = fs.readdirSync(examplesDir);
        const exampleExtensions = new Set(exampleFiles.map(file => path.extname(file)));

        const languagesWithoutExamples: string[] = [];

        // Check that each language has at least one example file
        languageConfigs.forEach(config => {
            const hasExample = config.extensions.some(ext => exampleExtensions.has(ext));
            if (!hasExample) {
                languagesWithoutExamples.push(`${config.name} (extensions: ${config.extensions.join(', ')})`);
            }
        });

        if (languagesWithoutExamples.length > 0) {
            throw new Error(`Languages without any example files: ${languagesWithoutExamples.join(', ')}`);
        }
    });

    test('every example file should have a corresponding language grammar', () => {
        const languageManager = new LanguageManager();
        const supportedExtensions = new Set<string>();

        // Get all supported extensions from language configurations
        languageManager.getLanguageConfigs().forEach(config => {
            config.extensions.forEach(ext => supportedExtensions.add(ext));
        });

        // Check that all example files have corresponding language support
        const exampleFiles = fs.readdirSync(examplesDir);
        const unsupportedFiles: string[] = [];

        exampleFiles.forEach(file => {
            const ext = path.extname(file);
            if (!supportedExtensions.has(ext)) {
                unsupportedFiles.push(file);
            }
        });

        if (unsupportedFiles.length > 0) {
            throw new Error(`Example files without language grammar support: ${unsupportedFiles.join(', ')}`);
        }
    });

    test('all example files should be processed with tree-sitter (no regex fallback)', () => {
        const exampleFiles = fs.readdirSync(examplesDir);
        const filesWithFallback: string[] = [];

        for (const file of exampleFiles) {
            const filePath = path.join(examplesDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            testLogger.clear();
            const detector = new URLDetector(
                {
                    fallbackRegex: true, // Enable fallback but we want to detect when it happens
                    includeComments: true,
                },
                testLogger,
            );

            // Process the file - auto-detect language from file path
            const languageManager = new LanguageManager();
            const language = languageManager.detectLanguageFromPath(filePath);
            detector.detectURLs(content, language, filePath);

            // Check if fallback was used by looking for warning messages
            const hasFallbackWarning = testLogger.warnings.some(
                warning =>
                    warning.includes('No parser available') ||
                    warning.includes('falling back to regex') ||
                    warning.includes('fallback regex'),
            );

            if (hasFallbackWarning) {
                filesWithFallback.push(`${file}: ${testLogger.warnings.join(', ')}`);
            }
        }

        if (filesWithFallback.length > 0) {
            throw new Error(
                `Files that fell back to regex instead of using tree-sitter:\n${filesWithFallback.join('\n')}`,
            );
        }
    });

    test('all example files should be successfully processed without errors', () => {
        const exampleFiles = fs.readdirSync(examplesDir);
        const filesWithErrors: string[] = [];

        for (const file of exampleFiles) {
            const filePath = path.join(examplesDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            testLogger.clear();
            const detector = new URLDetector(
                {
                    fallbackRegex: false, // Disable fallback to catch errors
                    includeComments: true,
                },
                testLogger,
            );

            try {
                // Process the file - should not throw errors for supported languages
                const languageManager = new LanguageManager();
                const language = languageManager.detectLanguageFromPath(filePath);
                const urls = detector.detectURLs(content, language, filePath);

                // Check for any error messages
                if (testLogger.errors.length > 0) {
                    filesWithErrors.push(`${file}: ${testLogger.errors.join(', ')}`);
                }

                // Verify we get a result (even if empty)
                expect(Array.isArray(urls)).toBe(true);
            } catch (error) {
                filesWithErrors.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        if (filesWithErrors.length > 0) {
            throw new Error(`Files that failed to process:\n${filesWithErrors.join('\n')}`);
        }
    });

    test('all example files should produce URLs with proper sourceType (not unknown)', () => {
        const exampleFiles = fs.readdirSync(examplesDir);
        const filesWithUnknownSource: string[] = [];

        for (const file of exampleFiles) {
            const filePath = path.join(examplesDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            testLogger.clear();
            const detector = new URLDetector(
                {
                    fallbackRegex: true,
                    includeComments: true,
                },
                testLogger,
            );

            const languageManager = new LanguageManager();
            const language = languageManager.detectLanguageFromPath(filePath);
            const urls = detector.detectURLs(content, language, filePath);

            // Check if any URLs have sourceType 'unknown' (indicates regex fallback)
            const unknownSourceUrls = urls.filter(url => url.sourceType === 'unknown');

            if (unknownSourceUrls.length > 0) {
                const urlsList = unknownSourceUrls.map(url => `"${url.url}" at line ${url.line}`).join(', ');
                filesWithUnknownSource.push(`${file}: ${urlsList}`);
            }
        }

        if (filesWithUnknownSource.length > 0) {
            throw new Error(
                `Files with URLs detected via regex fallback (sourceType: 'unknown'):\n${filesWithUnknownSource.join('\n')}`,
            );
        }
    });

    test('example files should be processed by URLDetector', () => {
        const exampleFiles = fs.readdirSync(examplesDir);

        for (const file of exampleFiles) {
            const filePath = path.join(examplesDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            testLogger.clear();
            const detector = new URLDetector(
                {
                    fallbackRegex: true,
                    includeComments: true,
                },
                testLogger,
            );

            const languageManager = new LanguageManager();
            const language = languageManager.detectLanguageFromPath(filePath);

            // Just verify the detector can process the file without errors
            expect(() => detector.detectURLs(content, language, filePath)).not.toThrow();
        }
    });
});
