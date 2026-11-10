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
import { DetectorOptions, loadPatternsFromFile } from '../src/options';

describe('loadPatternsFromFile', () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'url-detector-options-test-'));
    });

    afterEach(async () => {
        await fs.promises.rm(tmpDir, { recursive: true, force: true });
    });

    async function load(content: string): Promise<string[]> {
        const filePath = path.join(tmpDir, 'patterns.txt');
        await fs.promises.writeFile(filePath, content);
        return loadPatternsFromFile(filePath);
    }

    test('skips full-line comments, blank lines and surrounding whitespace', async () => {
        expect(await load('# Internal\n*.mycompany.com\n\n   \n  localhost  \n# Dev\n*.local\n')).toEqual([
            '*.mycompany.com',
            'localhost',
            '*.local',
        ]);
    });

    test('strips trailing comments that follow whitespace', async () => {
        expect(await load('api.corp.com # legacy\n*.internal.net\t# vpn\nlocalhost   #\n')).toEqual([
            'api.corp.com',
            '*.internal.net',
            'localhost',
        ]);
    });

    test('keeps a # that is not preceded by whitespace', async () => {
        expect(await load('src/#generated/**\n')).toEqual(['src/#generated/**']);
    });

    test('accepts CRLF line endings', async () => {
        expect(await load('a.example.com\r\n# c\r\nb.example.com # x\r\n')).toEqual(['a.example.com', 'b.example.com']);
    });

    test('DetectorOptions.loadPatternsFromFile delegates to the shared loader', async () => {
        const filePath = path.join(tmpDir, 'patterns.txt');
        await fs.promises.writeFile(filePath, 'api.corp.com # legacy\n');
        expect(await new DetectorOptions().loadPatternsFromFile(filePath)).toEqual(['api.corp.com']);
    });

    test('rejects when the file does not exist', async () => {
        await expect(loadPatternsFromFile(path.join(tmpDir, 'missing.txt'))).rejects.toThrow();
    });
});
