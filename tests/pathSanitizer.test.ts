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

import { sanitizeGlobPattern, sanitizeGlobPatterns } from '../src/pathSanitizer';

describe('Path Sanitizer', () => {
    describe('sanitizeGlobPattern', () => {
        it('should normalize backslashes to forward slashes', () => {
            expect(sanitizeGlobPattern('src\\**\\*.js')).toBe('src/**/*.js');
            expect(sanitizeGlobPattern('folder\\subfolder\\*.ts')).toBe('folder/subfolder/*.ts');
        });

        it('should remove path traversal sequences', () => {
            expect(sanitizeGlobPattern('../../../etc/*')).toBe('etc/*');
            expect(sanitizeGlobPattern('src/../../../etc/*')).toBe('src/etc/*');
            expect(sanitizeGlobPattern('../../..')).toBe('');
            expect(sanitizeGlobPattern('../')).toBe('');
            expect(sanitizeGlobPattern('folder/../secret')).toBe('folder/secret');
        });

        it('should handle complex traversal patterns', () => {
            expect(sanitizeGlobPattern('src/../../config/../etc/*')).toBe('src/config/etc/*');
            expect(sanitizeGlobPattern('../project/../../../etc/passwd')).toBe('project/etc/passwd');
        });

        it('should remove null bytes and control characters', () => {
            expect(sanitizeGlobPattern('src/**\x00*.js')).toBe('src/***.js');
            expect(sanitizeGlobPattern('folder\x01\x02\x1f*.txt')).toBe('folder*.txt');
            expect(sanitizeGlobPattern('test\x7f*.log')).toBe('test*.log');
        });

        it('should remove URL-encoded path traversal attempts', () => {
            expect(sanitizeGlobPattern('%2e%2e/etc/*')).toBe('/etc/*');
            expect(sanitizeGlobPattern('%252e%252e/config/*')).toBe('/config/*');
            expect(sanitizeGlobPattern('src/%2E%2E/secret')).toBe('src//secret');
        });

        it('should preserve safe glob patterns', () => {
            expect(sanitizeGlobPattern('**/*.js')).toBe('**/*.js');
            expect(sanitizeGlobPattern('src/**/*.{ts,js}')).toBe('src/**/*.{ts,js}');
            expect(sanitizeGlobPattern('**/test*.spec.js')).toBe('**/test*.spec.js');
            expect(sanitizeGlobPattern('src/[a-z]*.ts')).toBe('src/[a-z]*.ts');
        });

        it('should handle edge cases', () => {
            expect(sanitizeGlobPattern('')).toBe('');
            expect(sanitizeGlobPattern('.')).toBe('.');
            expect(sanitizeGlobPattern('./')).toBe('./');
            expect(sanitizeGlobPattern('*')).toBe('*');
        });

        it('should handle mixed separators and traversal', () => {
            expect(sanitizeGlobPattern('src\\..\\..\\..\\etc\\*')).toBe('src/etc/*');
            expect(sanitizeGlobPattern('folder/..\\..\\config\\*.json')).toBe('folder/config/*.json');
        });
    });

    describe('sanitizeGlobPatterns', () => {
        it('should sanitize an array of patterns', () => {
            const patterns = ['../../../etc/*', 'src\\**\\*.js', 'folder/../secret', '**/*.ts'];

            const sanitized = sanitizeGlobPatterns(patterns);

            expect(sanitized).toEqual(['etc/*', 'src/**/*.js', 'folder/secret', '**/*.ts']);
        });

        it('should handle empty array', () => {
            expect(sanitizeGlobPatterns([])).toEqual([]);
        });

        it('should preserve order', () => {
            const patterns = ['first/**', 'second\\*', '../third/*'];
            const sanitized = sanitizeGlobPatterns(patterns);

            expect(sanitized).toEqual(['first/**', 'second/*', 'third/*']);
        });
    });

    describe('Security Test Cases', () => {
        it('should prevent common path traversal attacks', () => {
            const maliciousPatterns = [
                '../../../etc/passwd',
                '..\\..\\..\\windows\\system32\\*',
                'src/../../../../../../etc/*',
                '%2e%2e/%2e%2e/etc/shadow',
                'folder/../../../../../../root/.ssh/*',
            ];

            const sanitized = sanitizeGlobPatterns(maliciousPatterns);

            // None should contain .. sequences after sanitization
            sanitized.forEach(pattern => {
                expect(pattern).not.toMatch(/\.\./);
                expect(pattern).not.toMatch(/%2e%2e/i);
            });
        });

        it('should handle null byte injection attempts', () => {
            const pattern = 'safe/path\x00../../../etc/passwd';
            const sanitized = sanitizeGlobPattern(pattern);

            expect(sanitized).toBe('safe/pathetc/passwd');
            expect(sanitized).not.toContain('\x00');
            expect(sanitized).not.toMatch(/\.\./);
        });
    });
});
