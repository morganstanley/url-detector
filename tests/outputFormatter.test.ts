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

import { OutputFormatter } from '../src/outputFormatter';
import { FileResult } from '../src/urlDetector';
import { Logger } from '../src/logger';

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
