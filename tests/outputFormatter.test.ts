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
import { OutputFormatter } from '../src/outputFormatter';
import { FileResult } from '../src/urlDetector';
import { Logger, NullLogger } from '../src/logger';

function makeResult(file: string, url: string): FileResult {
    return {
        file,
        urls: [{ url, start: 0, end: url.length, line: 1, column: 1, sourceType: 'string' }],
    };
}

function captureLogger(): { logger: Logger; lines: string[] } {
    const lines: string[] = [];
    const logger: Logger = {
        log: (message: string) => {
            lines.push(message);
        },
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
    };
    return { logger, lines };
}

async function formatAsCsv(results: FileResult[]): Promise<string> {
    const { logger, lines } = captureLogger();
    const formatter = new OutputFormatter({ format: 'csv' }, logger);
    await formatter.formatAndOutput(results);
    return lines.join('\n');
}

describe('OutputFormatter CSV escaping', () => {
    describe('formula neutralization', () => {
        test.each([
            ['=', '=cmd|calc'],
            ['+', '+1+1'],
            ['-', '-1+1'],
            ['@', '@SUM(A1)'],
        ])('prefixes a leading %s with a single quote', async (_label, value) => {
            const csv = await formatAsCsv([makeResult(value, 'https://example.com')]);
            const dataRow = csv.split('\n')[1];

            expect(dataRow.startsWith(`'${value}`)).toBe(true);
        });

        test('prefixes a formula trigger appearing in a URL column', async () => {
            const csv = await formatAsCsv([makeResult('safe.js', '=HYPERLINK("https://evil.example")')]);
            const dataRow = csv.split('\n')[1];

            expect(dataRow).toContain(`'=HYPERLINK`);
        });

        test('leaves ordinary values untouched', async () => {
            const csv = await formatAsCsv([makeResult('src/app.ts', 'https://example.com/api')]);
            const dataRow = csv.split('\n')[1];

            expect(dataRow).not.toContain("'");
        });
    });

    describe('quoting', () => {
        test('quotes values containing a tab or carriage return', async () => {
            const csvTab = await formatAsCsv([makeResult('name\twith-tab.js', 'https://example.com')]);
            const csvCr = await formatAsCsv([makeResult('name\rwith-cr.js', 'https://example.com')]);

            expect(csvTab.split('\n')[1]).toContain('"name\twith-tab.js"');
            expect(csvCr.split('\n')[1]).toContain('"name\rwith-cr.js"');
        });

        test('still quotes and escapes existing comma/quote/newline cases', async () => {
            const csv = await formatAsCsv([makeResult('a,"b".js', 'https://example.com')]);
            const dataRow = csv.split('\n')[1];

            expect(dataRow).toContain('"a,""b"".js"');
        });
    });
});

describe('OutputFormatter JSON output', () => {
    test('emits a JSON document with a summary and per-file URLs', async () => {
        const { logger, lines } = captureLogger();
        const formatter = new OutputFormatter({ format: 'json', withLineNumbers: true }, logger);
        await formatter.formatAndOutput([makeResult('src/app.js', 'https://example.com/a')]);
        const parsed = JSON.parse(lines.join('\n'));

        expect(parsed.summary.totalFiles).toBe(1);
        expect(parsed.summary.totalUrls).toBe(1);
        expect(parsed.summary.uniqueUrls).toBe(1);
        expect(parsed.files[0].file).toBe('src/app.js');
        expect(parsed.files[0].urlCount).toBe(1);
        expect(parsed.files[0].urls[0].url).toBe('https://example.com/a');
        expect(parsed.files[0].urls[0].line).toBe(1);
    });

    test('counts unique URLs separately from total URLs in the summary', async () => {
        const { logger, lines } = captureLogger();
        const formatter = new OutputFormatter({ format: 'json' }, logger);
        await formatter.formatAndOutput([
            makeResult('a.js', 'https://example.com'),
            makeResult('b.js', 'https://example.com'),
        ]);
        const parsed = JSON.parse(lines.join('\n'));

        expect(parsed.summary.totalUrls).toBe(2);
        expect(parsed.summary.uniqueUrls).toBe(1);
    });
});

describe('OutputFormatter table output', () => {
    test('renders a table row per URL with line:col position', async () => {
        const { logger, lines } = captureLogger();
        const formatter = new OutputFormatter({ format: 'table' }, logger);
        await formatter.formatAndOutput([makeResult('src/app.js', 'https://example.com/a')]);
        const output = lines.join('\n');

        expect(output).toContain('FilePath');
        expect(output).toContain('1:1');
        expect(output).toContain('https://example.com/a');
    });

    test('reports when there are no files or URLs', async () => {
        const { logger, lines } = captureLogger();
        const formatter = new OutputFormatter({ format: 'table' }, logger);
        await formatter.formatAndOutput([]);

        expect(lines.join('\n')).toContain('No URLs found.');
    });

    test('truncates overly long cell values', async () => {
        const longUrl = `https://example.com/${'a'.repeat(60)}`;
        const { logger, lines } = captureLogger();
        const formatter = new OutputFormatter({ format: 'table' }, logger);
        await formatter.formatAndOutput([makeResult('src/very/long/path/file.js', longUrl)]);
        const output = lines.join('\n');

        expect(output).toContain('...');
    });
});

describe('OutputFormatter URLs-only output', () => {
    test('emits only the URL strings, one per line', async () => {
        const { logger, lines } = captureLogger();
        const formatter = new OutputFormatter({ onlyUrls: true }, logger);
        await formatter.formatAndOutput([
            makeResult('a.js', 'https://example.com/a'),
            makeResult('b.js', 'https://example.com/b'),
        ]);

        expect(lines.join('\n')).toBe('https://example.com/a\nhttps://example.com/b');
    });
});

describe('OutputFormatter file output', () => {
    test('writes the formatted results to the output file', async () => {
        const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'url-detector-fmt-'));
        const outFile = path.join(dir, 'results.json');
        const formatter = new OutputFormatter({ format: 'json', outputFile: outFile }, NullLogger);
        await formatter.formatAndOutput([makeResult('a.js', 'https://example.com')]);

        const content = await fs.promises.readFile(outFile, 'utf8');
        await fs.promises.rm(dir, { recursive: true, force: true });

        expect(content).toContain('example.com');
    });
});
