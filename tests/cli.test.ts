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
import * as os from 'os';
import * as path from 'path';
import { vi } from 'vitest';
import { program } from '../src/cli';

// The --stdin-language (stdin) path reads piped input via fs.readFileSync(0, 'utf8').
// We cannot vi.spyOn() a Node builtin ESM namespace (it is non-configurable), so
// partially mock 'fs' with a Proxy over the real module: everything (fs.promises,
// etc.) stays real, and only readFileSync(fd === 0) returns controlled content.
const stdinMock = vi.hoisted(() => ({ content: '' }));

vi.mock('fs', async importOriginal => {
    const original = (await importOriginal()) as typeof import('fs');
    return new Proxy(original, {
        get(target, prop, receiver) {
            if (prop === 'readFileSync') {
                return (fd: unknown) =>
                    fd === 0 ? stdinMock.content : (target.readFileSync as (f: unknown) => string)(fd);
            }
            const value = Reflect.get(target, prop, receiver);
            return typeof value === 'function' ? value.bind(target) : value;
        },
    });
});

// Drives the commander program defined in src/cli.ts. Importing the module runs
// the top-level program setup (name/options/action registration) and the
// isMainModule IIFE; the `if (isMainModule)` branch that calls program.parse()
// is skipped in a test because process.argv[1] is the test runner, not cli.ts.
// We then invoke the registered action directly via program.parseAsync.
//
// Only the happy path and --scan-file are exercised: the --fail-on-error and
// error-handling branches call process.exit(1), which would terminate the test
// worker, so they are intentionally not driven here.
describe('CLI', () => {
    let tmpDir: string;
    let originalCwd: string;

    beforeEach(async () => {
        tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'url-detector-cli-test-'));
        // Canonicalize like the other temp-dir tests: on macOS os.tmpdir() returns a
        // /var/folders/... path while the detector resolves scan patterns against
        // process.cwd() (the symlink-resolved /private/var/folders/... path).
        tmpDir = await fs.promises.realpath(tmpDir);
        await fs.promises.writeFile(
            path.join(tmpDir, 'sample.js'),
            'const apiUrl = "https://api.example.com/v1/users";\n',
        );
        originalCwd = process.cwd();
        process.chdir(tmpDir);
    });

    afterEach(async () => {
        process.chdir(originalCwd);
        await fs.promises.rm(tmpDir, { recursive: true, force: true });
    });

    test('scans a file and writes JSON output to the output file', async () => {
        const outFile = path.join(tmpDir, 'out.json');

        await program.parseAsync([
            'node',
            'url-detector',
            '--scan',
            'sample.js',
            '--format',
            'json',
            '--output',
            outFile,
            '--quiet',
        ]);

        const content = await fs.promises.readFile(outFile, 'utf8');
        const parsed = JSON.parse(content);

        expect(parsed.summary.totalFiles).toBe(1);
        expect(parsed.summary.totalUrls).toBeGreaterThan(0);
        expect(content).toContain('api.example.com');
    });

    test('loads scan patterns from a patterns file', async () => {
        const patternsFile = path.join(tmpDir, 'patterns.txt');
        await fs.promises.writeFile(patternsFile, 'sample.js\n# a comment line\n\n');
        const outFile = path.join(tmpDir, 'out.json');

        await program.parseAsync([
            'node',
            'url-detector',
            '--scan-file',
            patternsFile,
            '--format',
            'json',
            '--output',
            outFile,
            '--quiet',
        ]);

        const content = await fs.promises.readFile(outFile, 'utf8');
        expect(content).toContain('api.example.com');
    });

    test('reports when no URLs are found without writing a results file', async () => {
        // A file with no URLs: the action handler skips the formatter (totalUrls === 0)
        // and only logs a summary. This covers the totalUrls === 0 branch.
        // --fail-on-error is safe here because it only exits when URLs are found, so it
        // also drives the cliOverrides.failOnError branch.
        await fs.promises.writeFile(path.join(tmpDir, 'clean.js'), 'const x = 1;\n');

        await program.parseAsync([
            'node',
            'url-detector',
            '--scan',
            'clean.js',
            '--format',
            'json',
            '--fail-on-error',
            '--quiet',
        ]);

        // No output file was requested; nothing to assert on disk. Reaching here
        // without an exception means the action handler completed the no-URL path.
    });

    test('reads piped stdin with --stdin-language instead of scanning files', async () => {
        // The beforeEach already created sample.js in cwd. In --stdin-language (stdin) mode we
        // must NOT scan files; we only read from stdin. Feed piped content through the
        // fs.readFileSync(0) mock and assert the result comes from it, not sample.js.
        stdinMock.content = 'const url = "https://piped.example.com/endpoint";';

        try {
            const outFile = path.join(tmpDir, 'out.json');

            await program.parseAsync([
                'node',
                'url-detector',
                '--stdin-language',
                'javascript',
                '--format',
                'json',
                '--output',
                outFile,
                '--quiet',
            ]);

            const content = await fs.promises.readFile(outFile, 'utf8');
            const parsed = JSON.parse(content);

            expect(parsed.summary.totalFiles).toBe(1);
            expect(parsed.summary.totalUrls).toBe(1);
            expect(content).toContain('piped.example.com');
            expect(content).not.toContain('api.example.com');
            expect(content).toContain('<stdin>');
        } finally {
            stdinMock.content = '';
        }
    });

    test('applies the output format from a discovered configuration file', async () => {
        // A config file in the working directory sets the format. The CLI does not pass
        // --format, so the configuration value is what takes effect (CSV here).
        await fs.promises.writeFile(path.join(tmpDir, '.url-detector.json'), JSON.stringify({ format: 'csv' }));
        const outFile = path.join(tmpDir, 'out.csv');

        await program.parseAsync(['node', 'url-detector', '--scan', 'sample.js', '--output', outFile, '--quiet']);

        const content = await fs.promises.readFile(outFile, 'utf8');
        expect(content).toContain('ColumnPosition'); // CSV header proves the format came from the config file
        expect(content).not.toContain('"summary"');
        expect(content).toContain('api.example.com');
    });

    test('lets a command-line flag override the configuration file', async () => {
        // The config file asks for CSV, but the CLI explicitly requests JSON. The CLI wins.
        await fs.promises.writeFile(path.join(tmpDir, '.url-detector.json'), JSON.stringify({ format: 'csv' }));
        const outFile = path.join(tmpDir, 'out.json');

        await program.parseAsync([
            'node',
            'url-detector',
            '--scan',
            'sample.js',
            '--format',
            'json',
            '--output',
            outFile,
            '--quiet',
        ]);

        const content = await fs.promises.readFile(outFile, 'utf8');
        expect(content).toContain('"summary"'); // JSON proves --format overrode the config value
        expect(content).not.toContain('ColumnPosition');
        expect(content).toContain('api.example.com');
    });

    test('loads a configuration file from an explicit --config path', async () => {
        // A file discovery would ignore (it is not .url-detector.json / .url-detectorrc),
        // referenced only via --config. The CLI omits --format, so a CSV result proves the
        // explicit file was loaded rather than the default format being used.
        const configPath = path.join(tmpDir, 'my-config.json');
        await fs.promises.writeFile(configPath, JSON.stringify({ format: 'csv' }));
        const outFile = path.join(tmpDir, 'out.csv');

        await program.parseAsync([
            'node',
            'url-detector',
            '--scan',
            'sample.js',
            '--config',
            configPath,
            '--output',
            outFile,
            '--quiet',
        ]);

        const content = await fs.promises.readFile(outFile, 'utf8');
        expect(content).toContain('ColumnPosition');
        expect(content).not.toContain('"summary"');
        expect(content).toContain('api.example.com');
    });

    test('lets command-line flags override the configuration file', async () => {
        // Every overridable flag is passed on the command line while the configuration
        // file sets a conflicting value for a few of them. This drives each
        // `options.X !== undefined` branch in the handler. The meaningful assertion is
        // the ignore-domains conflict: the config tries to suppress api.example.com, but
        // the command line overrides ignore-domains with a domain that does not match, so
        // the URL is still reported (command line wins over the configuration file).
        await fs.promises.writeFile(
            path.join(tmpDir, '.url-detector.json'),
            JSON.stringify({ ignoreDomains: ['api.example.com'], includeComments: false, concurrency: 2 }),
        );
        const outFile = path.join(tmpDir, 'out.json');

        await program.parseAsync([
            'node',
            'url-detector',
            '--scan',
            'sample.js',
            '--ignore-domains',
            'other.example.com',
            '--include-comments',
            '--include-non-fqdn',
            '--results-only',
            '--concurrency',
            '9',
            '--format',
            'json',
            '--output',
            outFile,
            '--quiet',
        ]);

        const content = await fs.promises.readFile(outFile, 'utf8');
        const parsed = JSON.parse(content);
        expect(parsed.summary.totalUrls).toBeGreaterThan(0);
        expect(content).toContain('api.example.com'); // CLI ignore-domains beat the config value
    });

    test('loads exclude patterns from an exclude-file', async () => {
        // An exclude-file listing a pattern that does not match the scanned file must not
        // remove it: the scan still finds sample.js. This drives the --exclude-file
        // branch (cliOverrides.exclude merge), mirroring the --scan-file test above.
        const excludeFile = path.join(tmpDir, 'exclude.txt');
        await fs.promises.writeFile(excludeFile, '*.txt\n# an exclude comment\n\n');
        const outFile = path.join(tmpDir, 'out.json');

        await program.parseAsync([
            'node',
            'url-detector',
            '--scan',
            'sample.js',
            '--exclude-file',
            excludeFile,
            '--format',
            'json',
            '--output',
            outFile,
            '--quiet',
        ]);

        const content = await fs.promises.readFile(outFile, 'utf8');
        expect(content).toContain('api.example.com');
    });

    test('warns about unknown keys in a discovered configuration file', async () => {
        // A configuration file with an unknown key still loads: the known key (format)
        // applies and the unknown key is surfaced as a warning rather than an error.
        await fs.promises.writeFile(
            path.join(tmpDir, '.url-detector.json'),
            JSON.stringify({ format: 'csv', bogusKey: 'ignored' }),
        );
        const outFile = path.join(tmpDir, 'out.csv');

        await program.parseAsync(['node', 'url-detector', '--scan', 'sample.js', '--output', outFile, '--quiet']);

        const content = await fs.promises.readFile(outFile, 'utf8');
        expect(content).toContain('ColumnPosition'); // format from the config file still applied
        expect(content).toContain('api.example.com');
    });
});
