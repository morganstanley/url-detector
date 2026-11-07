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
import { loadConfig, resolveConfigPath, validateConfig, CONFIG_FILE_NAMES } from '../src/configLoader';

async function makeTempDir(prefix: string): Promise<string> {
    const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), prefix));
    // Canonicalize like the other temp-dir tests so symlinked temp roots (macOS /var vs
    // /private/var) compare equal to what path.resolve produces.
    return fs.promises.realpath(dir);
}

async function writeConfig(dir: string, name: string, content: string): Promise<string> {
    const file = path.join(dir, name);
    await fs.promises.writeFile(file, content);
    return file;
}

describe('validateConfig', () => {
    test('accepts a valid configuration and copies every key', () => {
        const { config, warnings } = validateConfig({
            scan: ['src/**/*.ts'],
            exclude: ['node_modules'],
            ignoreDomains: ['example.com'],
            includeComments: true,
            includeNonFqdn: false,
            resultsOnly: true,
            failOnError: false,
            fallbackRegex: false,
            format: 'json',
            output: 'results.txt',
            concurrency: 5,
            maxDepth: 4,
            context: 2,
        });

        expect(config.scan).toEqual(['src/**/*.ts']);
        expect(config.exclude).toEqual(['node_modules']);
        expect(config.ignoreDomains).toEqual(['example.com']);
        expect(config.includeComments).toBe(true);
        expect(config.includeNonFqdn).toBe(false);
        expect(config.resultsOnly).toBe(true);
        expect(config.failOnError).toBe(false);
        expect(config.fallbackRegex).toBe(false);
        expect(config.format).toBe('json');
        expect(config.output).toBe('results.txt');
        expect(config.concurrency).toBe(5);
        expect(config.maxDepth).toBe(4);
        expect(config.context).toBe(2);
        expect(warnings).toEqual([]);
    });

    test('wraps a single scan string into a one-element array', () => {
        const { config } = validateConfig({ scan: 'src/app.js' });
        expect(config.scan).toEqual(['src/app.js']);
    });

    test('allows output to be null', () => {
        const { config } = validateConfig({ output: null });
        expect(config.output).toBeNull();
    });

    test('accepts a zero context value', () => {
        const { config } = validateConfig({ context: 0 });
        expect(config.context).toBe(0);
    });

    test('reports unknown keys as warnings and ignores them', () => {
        const { config, warnings } = validateConfig({ includeComments: true, bogusKey: 123 });
        expect(config.includeComments).toBe(true);
        expect((config as Record<string, unknown>).bogusKey).toBeUndefined();
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain('bogusKey');
    });

    test('ignores keys with undefined values', () => {
        const { config, warnings } = validateConfig({ includeComments: true, scan: undefined });
        expect(config.scan).toBeUndefined();
        expect(warnings).toEqual([]);
    });

    test('throws when a boolean option has the wrong type', () => {
        expect(() => validateConfig({ includeComments: 'yes' })).toThrow(/includeComments/);
    });

    test('throws on an invalid format value', () => {
        expect(() => validateConfig({ format: 'xml' })).toThrow(/format/);
    });

    test('throws when format is not a string', () => {
        expect(() => validateConfig({ format: 123 })).toThrow(/format/);
    });

    test('throws when concurrency is not a positive integer', () => {
        expect(() => validateConfig({ concurrency: 0 })).toThrow(/concurrency/);
        expect(() => validateConfig({ concurrency: 2.5 })).toThrow(/concurrency/);
        expect(() => validateConfig({ concurrency: '10' })).toThrow(/concurrency/);
    });

    test('throws when context is negative or non-integer', () => {
        expect(() => validateConfig({ context: -1 })).toThrow(/context/);
        expect(() => validateConfig({ context: 1.5 })).toThrow(/context/);
    });

    test('throws when maxDepth is not a finite number', () => {
        expect(() => validateConfig({ maxDepth: 'deep' })).toThrow(/maxDepth/);
        expect(() => validateConfig({ maxDepth: Infinity })).toThrow(/maxDepth/);
    });

    test('throws when an array option contains a non-string', () => {
        expect(() => validateConfig({ ignoreDomains: ['ok.com', 42] })).toThrow(/ignoreDomains/);
    });

    test('throws when output is neither a string nor null', () => {
        expect(() => validateConfig({ output: 42 })).toThrow(/output/);
    });
});

describe('resolveConfigPath', () => {
    let base: string;

    beforeEach(async () => {
        base = await makeTempDir('url-detector-config-resolve-');
    });

    afterEach(async () => {
        await fs.promises.rm(base, { recursive: true, force: true });
    });

    test('returns the explicit path when the file exists', async () => {
        const file = await writeConfig(base, '.url-detector.json', '{}');
        expect(resolveConfigPath(file)).toBe(path.resolve(file));
    });

    test('throws when the explicit path does not exist', async () => {
        const missing = path.join(base, 'does-not-exist.json');
        expect(() => resolveConfigPath(missing)).toThrow(/not found/);
    });

    test('discovers a configuration file in the start directory', async () => {
        const file = await writeConfig(base, CONFIG_FILE_NAMES[0], '{}');
        expect(resolveConfigPath(null, base)).toBe(file);
    });

    test('walks up to a parent directory to find a configuration file', async () => {
        const child = path.join(base, 'nested', 'deeper');
        await fs.promises.mkdir(child, { recursive: true });
        const file = await writeConfig(base, '.url-detectorrc', '{}');
        expect(resolveConfigPath(null, child)).toBe(file);
    });

    test('returns null when no configuration file is found anywhere', () => {
        expect(resolveConfigPath(null, base)).toBeNull();
    });
});

describe('loadConfig', () => {
    let base: string;

    beforeEach(async () => {
        base = await makeTempDir('url-detector-config-load-');
    });

    afterEach(async () => {
        await fs.promises.rm(base, { recursive: true, force: true });
    });

    test('returns null when there is no configuration file to load', async () => {
        const result = await loadConfig(null, base);
        expect(result).toBeNull();
    });

    test('reads and validates an explicit configuration file', async () => {
        const file = await writeConfig(base, 'custom.json', JSON.stringify({ includeComments: true, format: 'csv' }));
        const result = await loadConfig(file);

        expect(result).not.toBeNull();
        expect(result?.config.includeComments).toBe(true);
        expect(result?.config.format).toBe('csv');
        expect(result?.sourcePath).toBe(path.resolve(file));
        expect(result?.warnings).toEqual([]);
    });

    test('discovers a configuration file from the start directory', async () => {
        const file = await writeConfig(base, CONFIG_FILE_NAMES[1], JSON.stringify({ concurrency: 3 }));
        const result = await loadConfig(null, base);

        expect(result?.config.concurrency).toBe(3);
        expect(result?.sourcePath).toBe(file);
    });

    test('surfaces unknown-key warnings from the loaded file', async () => {
        await writeConfig(base, CONFIG_FILE_NAMES[0], JSON.stringify({ includeComments: true, unknown: true }));
        const result = await loadConfig(null, base);

        expect(result?.config.includeComments).toBe(true);
        expect(result?.warnings).toHaveLength(1);
        expect(result?.warnings[0]).toContain('unknown');
    });

    test('throws on invalid JSON', async () => {
        await writeConfig(base, CONFIG_FILE_NAMES[0], '{ not valid json');
        await expect(loadConfig(null, base)).rejects.toThrow(/Invalid JSON/);
    });

    test('throws when the top-level value is an array', async () => {
        await writeConfig(base, CONFIG_FILE_NAMES[0], JSON.stringify(['a', 'b']));
        await expect(loadConfig(null, base)).rejects.toThrow(/must contain a JSON object/);
    });

    test('throws when the top-level value is a string', async () => {
        await writeConfig(base, CONFIG_FILE_NAMES[0], JSON.stringify('hello'));
        await expect(loadConfig(null, base)).rejects.toThrow(/must contain a JSON object/);
    });

    test('propagates value-type validation errors', async () => {
        await writeConfig(base, CONFIG_FILE_NAMES[0], JSON.stringify({ includeComments: 'yes' }));
        await expect(loadConfig(null, base)).rejects.toThrow(/includeComments/);
    });

    test('throws when the explicit path does not exist', async () => {
        const missing = path.join(base, 'missing.json');
        await expect(loadConfig(missing)).rejects.toThrow(/not found/);
    });
});
