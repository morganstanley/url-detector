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
import { DetectorOptions } from '../src/options';
import { URLDetector } from '../src/urlDetector';

describe('CLI file options', () => {
    let tmpDir: string;
    let cliContent: string;

    beforeAll(() => {
        cliContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'cli.ts'), 'utf8');
    });

    beforeEach(async () => {
        tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'url-detector-'));
    });

    afterEach(async () => {
        await fs.promises.rm(tmpDir, { recursive: true, force: true });
    });

    test('defines --scan-file, --exclude-file, and --ignore-domains-file', () => {
        expect(cliContent).toContain('--scan-file <file>');
        expect(cliContent).toContain('--exclude-file <file>');
        expect(cliContent).toContain('--ignore-domains-file <file>');
        expect(cliContent).toContain('options.ignoreDomainsFile');
    });

    test('loadPatternsFromFile skips comments, blanks, and whitespace', async () => {
        const filePath = path.join(tmpDir, 'ignore-domains.txt');
        await fs.promises.writeFile(
            filePath,
            `# Internal domains
*.mycompany.com
*.internal.net

# Development
localhost
*.local
`,
        );

        const options = new DetectorOptions();
        const patterns = await options.loadPatternsFromFile(filePath);
        expect(patterns).toEqual(['*.mycompany.com', '*.internal.net', 'localhost', '*.local']);
    });

    test('ignore domain patterns from a file are applied by the detector', async () => {
        const filePath = path.join(tmpDir, 'allowlist.txt');
        await fs.promises.writeFile(
            filePath,
            `# Internal domains
*.mycompany.com
*.internal.net
`,
        );

        const options = new DetectorOptions();
        const ignoreDomains = await options.loadPatternsFromFile(filePath);
        const detector = new URLDetector({ ignoreDomains });
        const code = `
            const internal = "https://api.mycompany.com/v1";
            const vpn = "https://tools.internal.net";
            const publicUrl = "https://example.org/docs";
        `;
        const urls = await detector.detectURLs(code, 'javascript');
        const filtered = detector.getUrlFilter.filterUrls(urls);

        expect(filtered.map(u => u.url)).toEqual(['https://example.org/docs']);
    });
});
