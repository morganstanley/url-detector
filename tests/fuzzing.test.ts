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

import * as fc from 'fast-check';
import { URLDetector } from '../src/urlDetector';
import { LanguageManager } from '../src/languageManager';
import { DetectorOptions } from '../src/options';
import { NullLogger } from '../src/logger';

describe('URLDetector Fuzzing Tests', () => {
    let detector: URLDetector;

    beforeEach(() => {
        detector = new URLDetector(
            new DetectorOptions({
                fallbackRegex: true,
                includeComments: true,
                includeNonFqdn: true,
            }),
            NullLogger,
        );
    });

    describe('URL Detection Properties', () => {
        it('should never crash on arbitrary input', () => {
            fc.assert(
                fc.property(
                    fc.string(),
                    fc.constantFrom('javascript', 'typescript', 'python', 'java', 'unknown'),
                    (input, language) => {
                        expect(() => {
                            detector.detectURLs(input, language, 'test-file');
                        }).not.toThrow();
                    },
                ),
                { numRuns: 1000 },
            );
        });

        it('should handle extremely long inputs gracefully', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 10000, maxLength: 50000 }),
                    fc.constantFrom('javascript', 'typescript', 'python'),
                    (input, language) => {
                        const start = Date.now();
                        const result = detector.detectURLs(input, language, 'long-file');
                        const duration = Date.now() - start;

                        expect(Array.isArray(result)).toBe(true);
                        expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
                    },
                ),
                { numRuns: 10 },
            );
        });

        it('should handle valid URL patterns correctly', () => {
            const testCases = [
                { input: 'const url = "https://example.com";', language: 'javascript' },
                { input: 'url = "http://localhost:3000"', language: 'python' },
                { input: 'String url = "https://api.github.com/users";', language: 'java' },
                { input: 'let endpoint: string = "https://www.google.com/search";', language: 'typescript' },
            ];

            fc.assert(
                fc.property(fc.constantFrom(...testCases), testCase => {
                    const results = detector.detectURLs(testCase.input, testCase.language, 'test-file');

                    expect(Array.isArray(results)).toBe(true);
                    expect(results.length).toBeGreaterThan(0);
                    expect(results[0]).toHaveProperty('url');
                    expect(results[0]).toHaveProperty('line');
                    expect(results[0]).toHaveProperty('column');
                }),
                { numRuns: 20 },
            );
        });

        it('should handle mixed content with URLs and non-URLs', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.oneof(
                            fc.constantFrom('https://example.com', 'http://test.org', 'https://api.service.com'),
                            fc.string().filter(s => !s.includes('http')),
                        ),
                    ),
                    fc.constantFrom('javascript', 'typescript', 'python'),
                    (parts, language) => {
                        const input = parts.join(' ');
                        const results = detector.detectURLs(input, language, 'mixed-file');

                        expect(Array.isArray(results)).toBe(true);
                        results.forEach(result => {
                            expect(result).toHaveProperty('url');
                            expect(result).toHaveProperty('line');
                            expect(result).toHaveProperty('column');
                            expect(result).toHaveProperty('start');
                            expect(result).toHaveProperty('end');
                            expect(result.start).toBeGreaterThanOrEqual(0);
                            expect(result.end).toBeGreaterThan(result.start);
                        });
                    },
                ),
                { numRuns: 200 },
            );
        });

        it('should handle special characters and unicode correctly', () => {
            fc.assert(
                fc.property(
                    fc.string(),
                    fc.constantFrom('https://example.com/path', 'http://localhost:8080'),
                    fc.string(),
                    fc.constantFrom('javascript', 'typescript'),
                    (prefix, url, suffix, language) => {
                        const input = prefix + url + suffix;
                        const results = detector.detectURLs(input, language, 'unicode-file');

                        expect(() => {
                            JSON.stringify(results);
                        }).not.toThrow();
                    },
                ),
                { numRuns: 500 },
            );
        });

        it('should maintain consistent results for identical inputs', () => {
            fc.assert(
                fc.property(fc.string(), fc.constantFrom('javascript', 'typescript', 'python'), (input, language) => {
                    const result1 = detector.detectURLs(input, language, 'consistency-test');
                    const result2 = detector.detectURLs(input, language, 'consistency-test');

                    expect(result1).toEqual(result2);
                }),
                { numRuns: 100 },
            );
        });
    });

    describe('Language Manager Fuzzing', () => {
        let languageManager: LanguageManager;

        beforeEach(() => {
            languageManager = new LanguageManager(NullLogger);
        });

        it('should handle arbitrary language detection inputs', () => {
            fc.assert(
                fc.property(fc.string(), filename => {
                    expect(() => {
                        languageManager.detectLanguageFromPath(filename);
                    }).not.toThrow();
                }),
                { numRuns: 1000 },
            );
        });

        it('should always return a valid language or undefined', () => {
            fc.assert(
                fc.property(fc.string(), extension => {
                    const result = languageManager.getLanguage(extension);
                    expect(result === undefined || typeof result === 'object').toBe(true);
                }),
                { numRuns: 500 },
            );
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle null bytes and control characters', () => {
            fc.assert(
                fc.property(
                    fc.string().map(s => s + '\0' + s),
                    fc.constantFrom('javascript', 'typescript'),
                    (input, language) => {
                        expect(() => {
                            detector.detectURLs(input, language, 'null-byte-file');
                        }).not.toThrow();
                    },
                ),
                { numRuns: 100 },
            );
        });

        it('should handle deeply nested structures', () => {
            const createNestedString = (depth: number): string => {
                if (depth === 0) return 'https://example.com';
                return `{${createNestedString(depth - 1)}}`;
            };

            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 100 }),
                    fc.constantFrom('javascript', 'json'),
                    (depth, language) => {
                        const input = createNestedString(depth);
                        const results = detector.detectURLs(input, language, 'nested-file');

                        expect(Array.isArray(results)).toBe(true);
                    },
                ),
                { numRuns: 50 },
            );
        });

        it('should handle malformed URLs gracefully', () => {
            const malformedUrls = [
                'http://',
                'https://',
                'http://.',
                'https://.',
                'http://..',
                'https://..',
                'http://...',
                'https://...',
            ];

            fc.assert(
                fc.property(
                    fc.constantFrom(...malformedUrls),
                    fc.string(),
                    fc.constantFrom('javascript', 'typescript'),
                    (malformedUrl, context, language) => {
                        const input = context + malformedUrl + context;

                        expect(() => {
                            detector.detectURLs(input, language, 'malformed-file');
                        }).not.toThrow();
                    },
                ),
                { numRuns: 100 },
            );
        });

        it('should handle extremely long URLs', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1000, maxLength: 10000 }),
                    fc.constantFrom('javascript', 'typescript'),
                    (longPath, language) => {
                        const longUrl = `https://example.com/${longPath}`;
                        const results = detector.detectURLs(longUrl, language, 'long-url-file');

                        expect(Array.isArray(results)).toBe(true);
                        if (results.length > 0) {
                            // URL detector may normalize URLs, so check for domain presence more flexibly
                            const hasExpectedDomain = results.some(r => r.url.includes('example.com'));
                            expect(hasExpectedDomain).toBe(true);
                        }
                    },
                ),
                { numRuns: 20 },
            );
        });
    });

    describe('Performance Properties', () => {
        it('should complete within reasonable time bounds', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 100, maxLength: 5000 }),
                    fc.constantFrom('javascript', 'typescript'),
                    (input, language) => {
                        const start = Date.now();
                        const results = detector.detectURLs(input, language, 'perf-test');
                        const duration = Date.now() - start;

                        expect(Array.isArray(results)).toBe(true);
                        expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
                    },
                ),
                { numRuns: 20 },
            );
        });
    });

    describe('Regression Tests', () => {
        it('should handle common problematic patterns', () => {
            const problematicPatterns = [
                '//example.com', // Protocol-relative URL
                'https://example.com//double-slash',
                'https://example.com/path with spaces',
                'https://example.com/path"with"quotes',
                "https://example.com/path'with'quotes",
                'https://example.com/path\nwith\nnewlines',
                'https://example.com/path\twith\ttabs',
                'https://example.com/path<with>brackets',
                'https://example.com/path{with}braces',
                'https://example.com/path[with]square',
            ];

            fc.assert(
                fc.property(
                    fc.constantFrom(...problematicPatterns),
                    fc.constantFrom('javascript', 'typescript', 'html'),
                    (pattern, language) => {
                        expect(() => {
                            const results = detector.detectURLs(pattern, language, 'problematic-file');
                            expect(Array.isArray(results)).toBe(true);
                        }).not.toThrow();
                    },
                ),
                { numRuns: 100 },
            );
        });
    });
});
