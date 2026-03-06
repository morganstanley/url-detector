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
 * Tests for exit code behavior of the CLI
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

/**
 * Helper function to run the CLI and capture its exit code
 */
function runCLI(args: string[]): Promise<{ exitCode: number | null; stdout: string; stderr: string }> {
    return new Promise(resolve => {
        const cliPath = path.join(__dirname, '..', 'dist', 'cli.js');
        const child = spawn('node', [cliPath, ...args]);

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', data => {
            stdout += data.toString();
        });

        child.stderr.on('data', data => {
            stderr += data.toString();
        });

        child.on('close', code => {
            resolve({ exitCode: code, stdout, stderr });
        });
    });
}

describe('CLI Exit Codes', () => {
    let tempDir: string;

    beforeAll(() => {
        // Create a temporary directory for test files
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'url-detector-test-'));
    });

    afterAll(() => {
        // Clean up temporary directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('exit code 0 - success, no URLs found', async () => {
        // Create a file with no URLs
        const testFile = path.join(tempDir, 'no-urls.txt');
        fs.writeFileSync(testFile, 'This is just plain text with no URLs');

        const result = await runCLI(['--scan', testFile, '--quiet']);
        expect(result.exitCode).toBe(0);
    }, 10000);

    test('exit code 1 - URLs found with --fail-on-error', async () => {
        // Create a file with a URL
        const testFile = path.join(tempDir, 'with-url.txt');
        fs.writeFileSync(testFile, 'Check out https://example.com for more info');

        const result = await runCLI(['--scan', testFile, '--fail-on-error', '--quiet']);
        expect(result.exitCode).toBe(1);
    }, 10000);

    test('exit code 0 - URLs found WITHOUT --fail-on-error', async () => {
        // Create a file with a URL
        const testFile = path.join(tempDir, 'with-url-2.txt');
        fs.writeFileSync(testFile, 'Visit https://example.org for details');

        const result = await runCLI(['--scan', testFile, '--quiet']);
        expect(result.exitCode).toBe(0);
    }, 10000);

    test('exit code 2 - configuration error (invalid format)', async () => {
        const testFile = path.join(tempDir, 'test.txt');
        fs.writeFileSync(testFile, 'Some text');

        const result = await runCLI(['--scan', testFile, '--format', 'invalid', '--quiet']);
        expect(result.exitCode).toBe(2);
    }, 10000);

    test('exit code 2 - configuration error (invalid concurrency)', async () => {
        const testFile = path.join(tempDir, 'test.txt');
        fs.writeFileSync(testFile, 'Some text');

        const result = await runCLI(['--scan', testFile, '--concurrency', '0', '--quiet']);
        expect(result.exitCode).toBe(2);
    }, 10000);

    test('exit code 3 - file read error (scan-file does not exist)', async () => {
        const nonExistentFile = path.join(tempDir, 'does-not-exist.txt');

        const result = await runCLI(['--scan-file', nonExistentFile, '--quiet']);
        expect(result.exitCode).toBe(3);
    }, 10000);

    test('exit code 3 - file read error (exclude-file does not exist)', async () => {
        const testFile = path.join(tempDir, 'test.txt');
        fs.writeFileSync(testFile, 'Some text');
        const nonExistentFile = path.join(tempDir, 'exclude-does-not-exist.txt');

        const result = await runCLI(['--scan', testFile, '--exclude-file', nonExistentFile, '--quiet']);
        expect(result.exitCode).toBe(3);
    }, 10000);
});
