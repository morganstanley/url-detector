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
 * Unit tests for CLI logic with code coverage
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { runCLI, ExitCode } from '../src/cli';

describe('CLI Unit Tests (for coverage)', () => {
    let tempDir: string;

    beforeAll(() => {
        // Create a temporary directory for test files
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'url-detector-unit-test-'));
    });

    afterAll(() => {
        // Clean up temporary directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe('Exit Code 0 - Success', () => {
        test('should return 0 when no URLs are found', async () => {
            const testFile = path.join(tempDir, 'no-urls.txt');
            fs.writeFileSync(testFile, 'This is just plain text with no URLs');

            const exitCode = await runCLI({
                scan: [testFile],
                exclude: [],
                ignoreDomains: [],
                includeComments: false,
                includeNonFqdn: false,
                format: 'table',
                output: null,
                resultsOnly: false,
                failOnError: false,
                concurrency: 10,
                quiet: true,
            });

            expect(exitCode).toBe(ExitCode.SUCCESS);
        });

        test('should return 0 when URLs found without fail-on-error', async () => {
            const testFile = path.join(tempDir, 'with-url.txt');
            fs.writeFileSync(testFile, 'Visit https://example.com for details');

            const exitCode = await runCLI({
                scan: [testFile],
                exclude: [],
                ignoreDomains: [],
                includeComments: false,
                includeNonFqdn: false,
                format: 'table',
                output: null,
                resultsOnly: false,
                failOnError: false,
                concurrency: 10,
                quiet: true,
            });

            expect(exitCode).toBe(ExitCode.SUCCESS);
        });
    });

    describe('Exit Code 1 - URLs Found', () => {
        test('should return 1 when URLs found with fail-on-error', async () => {
            const testFile = path.join(tempDir, 'with-url-fail.txt');
            fs.writeFileSync(testFile, 'Check out https://example.org');

            const exitCode = await runCLI({
                scan: [testFile],
                exclude: [],
                ignoreDomains: [],
                includeComments: false,
                includeNonFqdn: false,
                format: 'table',
                output: null,
                resultsOnly: false,
                failOnError: true,
                concurrency: 10,
                quiet: true,
            });

            expect(exitCode).toBe(ExitCode.URLS_FOUND);
        });
    });

    describe('Exit Code 2 - Configuration Error', () => {
        test('should return 2 for invalid format', async () => {
            const testFile = path.join(tempDir, 'test.txt');
            fs.writeFileSync(testFile, 'Some text');

            const exitCode = await runCLI({
                scan: [testFile],
                exclude: [],
                ignoreDomains: [],
                includeComments: false,
                includeNonFqdn: false,
                format: 'invalid-format',
                output: null,
                resultsOnly: false,
                failOnError: false,
                concurrency: 10,
                quiet: true,
            });

            expect(exitCode).toBe(ExitCode.CONFIG_ERROR);
        });

        test('should return 2 for invalid concurrency', async () => {
            const testFile = path.join(tempDir, 'test2.txt');
            fs.writeFileSync(testFile, 'Some text');

            const exitCode = await runCLI({
                scan: [testFile],
                exclude: [],
                ignoreDomains: [],
                includeComments: false,
                includeNonFqdn: false,
                format: 'table',
                output: null,
                resultsOnly: false,
                failOnError: false,
                concurrency: 0,
                quiet: true,
            });

            expect(exitCode).toBe(ExitCode.CONFIG_ERROR);
        });
    });

    describe('Exit Code 3 - File Read Error', () => {
        test('should return 3 when scan-file does not exist', async () => {
            const nonExistentFile = path.join(tempDir, 'does-not-exist.txt');

            const exitCode = await runCLI({
                scan: [],
                exclude: [],
                ignoreDomains: [],
                includeComments: false,
                includeNonFqdn: false,
                format: 'table',
                output: null,
                resultsOnly: false,
                failOnError: false,
                concurrency: 10,
                quiet: true,
                scanFile: nonExistentFile,
            });

            expect(exitCode).toBe(ExitCode.FILE_READ_ERROR);
        });

        test('should return 3 when exclude-file does not exist', async () => {
            const testFile = path.join(tempDir, 'test3.txt');
            fs.writeFileSync(testFile, 'Some text');
            const nonExistentFile = path.join(tempDir, 'exclude-does-not-exist.txt');

            const exitCode = await runCLI({
                scan: [testFile],
                exclude: [],
                ignoreDomains: [],
                includeComments: false,
                includeNonFqdn: false,
                format: 'table',
                output: null,
                resultsOnly: false,
                failOnError: false,
                concurrency: 10,
                quiet: true,
                excludeFile: nonExistentFile,
            });

            expect(exitCode).toBe(ExitCode.FILE_READ_ERROR);
        });
    });
});
