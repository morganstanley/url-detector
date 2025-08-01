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

import { URLDetector } from '../src/urlDetector';

describe('URLDetector', () => {
    let detector: URLDetector;

    beforeEach(() => {
        detector = new URLDetector();
    });

    describe('JavaScript detection', () => {
        test('should detect URLs in string literals', () => {
            const code = `const apiUrl = "https://api.example.com/v1/users";`;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://api.example.com/v1/users');
        });

        test('should detect URLs in template literals', () => {
            const code = `const url = \`https://api.example.com/users\`;`;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://api.example.com/users');
        });

        test('should detect URLs in comments', () => {
            const code = `// Visit https://docs.example.com for more info`;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://docs.example.com');
        });

        test('should detect multiple URLs', () => {
            const code = `
                const api = "https://api.example.com";
                fetch('http://localhost:3000/data');
                // See https://github.com/user/repo
            `;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(3);
            expect(urls.map(u => u.url)).toContain('https://api.example.com');
            expect(urls.map(u => u.url)).toContain('http://localhost:3000/data');
            expect(urls.map(u => u.url)).toContain('https://github.com/user/repo');
        });
    });

    describe('HTML detection', () => {
        test('should detect URLs in href attributes', () => {
            const code = `<a href="https://example.com">Link</a>`;
            const urls = detector.detectURLs(code, 'html');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://example.com');
        });

        test('should detect URLs in HTML comments', () => {
            const code = `<!-- Visit https://docs.example.com -->`;
            const urls = detector.detectURLs(code, 'html');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://docs.example.com');
        });
    });

    describe('CSS detection', () => {
        test('should detect URLs in CSS url() functions', () => {
            const code = `background: url('https://example.com/image.jpg');`;
            const urls = detector.detectURLs(code, 'css');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://example.com/image.jpg');
        });
    });

    describe('Java detection', () => {
        test('should detect URLs in string literals', () => {
            const code = `String apiUrl = "https://api.example.com/v1/users";`;
            const urls = detector.detectURLs(code, 'java');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://api.example.com/v1/users');
        });

        test('should detect URLs in Java comments', () => {
            const code = `// Documentation: https://docs.oracle.com/javase/`;
            const urls = detector.detectURLs(code, 'java');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://docs.oracle.com/javase/');
        });
    });

    describe('C++ detection', () => {
        test('should detect URLs in string literals', () => {
            const code = `std::string url = "https://cppreference.com";`;
            const urls = detector.detectURLs(code, 'cpp');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://cppreference.com');
        });
    });

    describe('TypeScript detection', () => {
        test('should detect URLs with TypeScript annotations', () => {
            const code = `const apiUrl: string = "https://api.example.com/v1/users";`;
            const urls = detector.detectURLs(code, 'typescript');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://api.example.com/v1/users');
        });
    });

    describe('C# detection', () => {
        test('should detect URLs in string literals', () => {
            const code = `string apiUrl = "https://api.example.com/v1/users";`;
            const urls = detector.detectURLs(code, 'csharp');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://api.example.com/v1/users');
        });
    });

    describe('Fallback detection', () => {
        test('should fall back to regex for unsupported languages', () => {
            const code = `# Perl comment with URL: https://perldoc.perl.org`;
            const urls = detector.detectURLs(code, 'perl');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://perldoc.perl.org');
        });
    });

    describe('Protocol-relative URLs', () => {
        test('should detect protocol-relative URLs in JavaScript', () => {
            const code = `const url = "//example.com/api";`;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('//example.com/api');
        });

        test('should detect protocol-relative URLs in HTML', () => {
            const code = `<a href="//cdn.example.com/script.js">Link</a>`;
            const urls = detector.detectURLs(code, 'html');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('//cdn.example.com/script.js');
        });

        test('should detect both absolute and protocol-relative URLs', () => {
            const code = `
                const httpsUrl = "https://secure.example.com";
                const httpUrl = "http://insecure.example.com";
                const protocolRelative = "//flexible.example.com";
            `;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(3);
            expect(urls.map(u => u.url)).toContain('https://secure.example.com');
            expect(urls.map(u => u.url)).toContain('http://insecure.example.com');
            expect(urls.map(u => u.url)).toContain('//flexible.example.com');
        });

        test('should detect protocol-relative URLs with paths and query parameters', () => {
            const code = `const url = "//api.example.com/v1/users?format=json";`;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('//api.example.com/v1/users?format=json');
        });

        test('should not detect single slash URLs', () => {
            const code = `const path = "/relative/path";`;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(0);
        });
    });

    describe('Block comment before URL edge cases', () => {
        test('should detect URL after block comment in JavaScript', () => {
            const code = `/* https://comment.example.com/ignored */ const url = "https://actual.example.com";`;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(2); // Both comment and string URLs
            expect(urls.map(u => u.url)).toContain('https://comment.example.com/ignored');
            expect(urls.map(u => u.url)).toContain('https://actual.example.com');
        });

        test('should detect only string URL when comments excluded in JavaScript', () => {
            const detectorNoComments = new URLDetector({ includeComments: false });
            const code = `/* https://comment.example.com/ignored */ const url = "https://actual.example.com";`;
            const allUrls = detectorNoComments.detectURLs(code, 'javascript');
            const filteredUrls = detectorNoComments.getUrlFilter.filterUrls(allUrls);

            expect(filteredUrls).toHaveLength(1);
            expect(filteredUrls[0].url).toBe('https://actual.example.com');
            expect(filteredUrls[0].sourceType).toBe('string');
        });

        test('should handle multiline block comment before URL', () => {
            const code = `/* Multi
                           line comment
                           with https://multiline.example.com/ignored */
                          const url = "https://after-multiline.example.com";`;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(2);
            expect(urls.map(u => u.url)).toContain('https://multiline.example.com/ignored');
            expect(urls.map(u => u.url)).toContain('https://after-multiline.example.com');
        });

        test('should detect URL after block comment in CSS', () => {
            const code = `/* https://css-comment.example.com/ignored */ .class { background: url('https://css-actual.example.com'); }`;
            const urls = detector.detectURLs(code, 'css');

            expect(urls).toHaveLength(2);
            expect(urls.map(u => u.url)).toContain('https://css-comment.example.com/ignored');
            expect(urls.map(u => u.url)).toContain('https://css-actual.example.com');
        });

        test('should detect URL after block comment in Java', () => {
            const code = `/* https://java-comment.example.com/ignored */ String url = "https://java-actual.example.com";`;
            const urls = detector.detectURLs(code, 'java');

            expect(urls).toHaveLength(2);
            expect(urls.map(u => u.url)).toContain('https://java-comment.example.com/ignored');
            expect(urls.map(u => u.url)).toContain('https://java-actual.example.com');
        });

        test('should detect URL after block comment in C++', () => {
            const code = `/* https://cpp-comment.example.com/ignored */ std::string url = "https://cpp-actual.example.com";`;
            const urls = detector.detectURLs(code, 'cpp');

            expect(urls).toHaveLength(2);
            expect(urls.map(u => u.url)).toContain('https://cpp-comment.example.com/ignored');
            expect(urls.map(u => u.url)).toContain('https://cpp-actual.example.com');
        });

        test('should detect URL after block comment in C#', () => {
            const code = `/* https://cs-comment.example.com/ignored */ string url = "https://cs-actual.example.com";`;
            const urls = detector.detectURLs(code, 'csharp');

            expect(urls).toHaveLength(2);
            expect(urls.map(u => u.url)).toContain('https://cs-comment.example.com/ignored');
            expect(urls.map(u => u.url)).toContain('https://cs-actual.example.com');
        });

        test('should detect URL after block comment in TypeScript', () => {
            const code = `/* https://ts-comment.example.com/ignored */ const url: string = "https://ts-actual.example.com";`;
            const urls = detector.detectURLs(code, 'typescript');

            expect(urls).toHaveLength(2);
            expect(urls.map(u => u.url)).toContain('https://ts-comment.example.com/ignored');
            expect(urls.map(u => u.url)).toContain('https://ts-actual.example.com');
        });

        test('should handle multiple block comments with URLs', () => {
            const code = `
                /* https://first-comment.example.com */ const url1 = "https://first-string.example.com";
                /* https://second-comment.example.com */ const url2 = "https://second-string.example.com";
            `;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(4);
            expect(urls.map(u => u.url)).toContain('https://first-comment.example.com');
            expect(urls.map(u => u.url)).toContain('https://first-string.example.com');
            expect(urls.map(u => u.url)).toContain('https://second-comment.example.com');
            expect(urls.map(u => u.url)).toContain('https://second-string.example.com');
        });

        test('should correctly identify source types for block comment edge case', () => {
            const code = `/* https://comment.example.com */ const url = "https://string.example.com";`;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(2);

            const commentUrl = urls.find(u => u.url === 'https://comment.example.com');
            const stringUrl = urls.find(u => u.url === 'https://string.example.com');

            expect(commentUrl!.sourceType).toBe('comment');
            expect(stringUrl!.sourceType).toBe('string');
        });
    });

    describe('Concurrency', () => {
        test('should respect concurrency setting', () => {
            const detectorWithConcurrency = new URLDetector({ concurrency: 2 });
            expect(detectorWithConcurrency.getOptions.concurrency).toBe(2);
        });

        test('should use default concurrency when not specified', () => {
            const detectorDefault = new URLDetector();
            expect(detectorDefault.getOptions.concurrency).toBe(10);
        });

        test('should validate concurrency option', () => {
            expect(() => {
                new URLDetector({ concurrency: 0 });
            }).toThrow('Concurrency must be >= 1');

            expect(() => {
                new URLDetector({ concurrency: -1 });
            }).toThrow('Concurrency must be >= 1');
        });
    });

    describe('Edge cases', () => {
        test('should handle empty input', () => {
            const urls = detector.detectURLs('', 'javascript');
            expect(urls).toHaveLength(0);
        });

        test('should handle code with no URLs', () => {
            const code = `const greeting = "Hello, World!";`;
            const urls = detector.detectURLs(code, 'javascript');
            expect(urls).toHaveLength(0);
        });

        test('should report duplicate URLs when they appear multiple times', () => {
            const code = `
                const url1 = "https://example.com";
                const url2 = "https://example.com";
                const url3 = "https://example.com";
            `;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(3);
            expect(urls.every(u => u.url === 'https://example.com')).toBe(true);
        });

        test('should provide position information', () => {
            const code = `const url = "https://example.com";`;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls[0]).toHaveProperty('start');
            expect(urls[0]).toHaveProperty('end');
            expect(urls[0]).toHaveProperty('line');
            expect(urls[0]).toHaveProperty('column');
        });
    });

    describe('Duplicate URL detection', () => {
        test('should report same URL in different string literals', () => {
            const code = `
                const api = "https://api.example.com";
                const backup = "https://api.example.com";
                const fallback = "https://api.example.com";
            `;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(3);
            expect(urls.every(u => u.url === 'https://api.example.com')).toBe(true);
        });

        test('should report same URL in different contexts (string + comment)', () => {
            const code = `
                // API endpoint: https://api.example.com
                const url = "https://api.example.com";
            `;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(2);
            expect(urls.every(u => u.url === 'https://api.example.com')).toBe(true);

            const commentUrl = urls.find(u => u.sourceType === 'comment');
            const stringUrl = urls.find(u => u.sourceType === 'string');

            expect(commentUrl).toBeDefined();
            expect(stringUrl).toBeDefined();
        });

        test('should report same URL multiple times within a single string', () => {
            const code = `const msg = "Visit https://example.com or use https://example.com as backup";`;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(2);
            expect(urls.every(u => u.url === 'https://example.com')).toBe(true);
            expect(urls[0].start).not.toBe(urls[1].start);
        });

        test('should report all duplicate URLs across multiple languages', () => {
            const htmlCode = `
                <a href="https://example.com">Link 1</a>
                <a href="https://example.com">Link 2</a>
                <!-- https://example.com -->
            `;
            const urls = detector.detectURLs(htmlCode, 'html');

            expect(urls).toHaveLength(3);
            expect(urls.every(u => u.url === 'https://example.com')).toBe(true);
        });

        test('should report duplicates with different URL patterns', () => {
            const code = `
                const https = "https://example.com";
                const http = "http://example.com";
                const protocol = "//example.com";
            `;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(3);
            expect(urls.map(u => u.url)).toContain('https://example.com');
            expect(urls.map(u => u.url)).toContain('http://example.com');
            expect(urls.map(u => u.url)).toContain('//example.com');
        });

        test('should maintain correct position information for duplicates', () => {
            const code = `const url1 = "https://example.com";
const url2 = "https://example.com";`;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(2);
            expect(urls[0].line).not.toBe(urls[1].line);
            expect(urls[0].start).not.toBe(urls[1].start);
            expect(urls[0].column).toBe(urls[1].column); // Same column position on their respective lines
        });

        test('should deduplicate URLs found at exact same position in AST traversal', () => {
            // This tests that when tree-sitter finds the same URL in both parent and child nodes
            // at the exact same character positions, only one is reported
            const code = 'const url = "https://example.com";';
            const urls = detector.detectURLs(code, 'javascript');

            // Should only get one URL despite potential parent/child node traversal
            expect(urls).toHaveLength(1);
            expect(urls[0].url).toBe('https://example.com');
            expect(urls[0].start).toBe(13);
            expect(urls[0].end).toBe(32);
        });

        test('should report URLs at different positions even if same content', () => {
            // This tests that identical URLs at different positions are both reported
            const code = `
                const url1 = "https://example.com";
                const url2 = "https://example.com";
            `;
            const urls = detector.detectURLs(code, 'javascript');

            expect(urls).toHaveLength(2);
            expect(urls.every(u => u.url === 'https://example.com')).toBe(true);
            expect(urls[0].start).not.toBe(urls[1].start);
            expect(urls[0].end).not.toBe(urls[1].end);
        });
    });
});
