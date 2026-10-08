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

import { once } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import { URLDetector } from '../src/urlDetector';

describe('URLDetector large file processing', () => {
    test('detects a URL split across chunk boundaries with correct offsets', async () => {
        const directory = await fs.promises.mkdtemp(path.join(process.cwd(), 'url-detector-test-'));
        const filePath = path.join(directory, 'boundary.txt');
        const prefix = 'x'.repeat(60);

        try {
            await fs.promises.writeFile(filePath, `${prefix}https://boundary.example/path\n`);
            const detector = new URLDetector({
                scan: [path.relative(process.cwd(), filePath)],
                chunkSize: 64,
            });
            const [result] = await detector.process();

            expect(result.urls).toHaveLength(1);
            expect(result.urls[0].url).toBe('https://boundary.example/path');
            expect(result.urls[0].start).toBe(prefix.length);
            expect(result.urls[0].line).toBe(1);
        } finally {
            await fs.promises.rm(directory, { recursive: true, force: true });
        }
    });

    test(
        'scans files larger than 100 MiB without retaining the whole file in memory',
        async () => {
            const directory = await fs.promises.mkdtemp(path.join(process.cwd(), 'url-detector-test-'));
            const filePath = path.join(directory, 'large.txt');
            const output = fs.createWriteStream(filePath);
            const block = Buffer.alloc(1024 * 1024, 'x');
            const fileBlocks = 101;

            try {
                for (let index = 0; index < fileBlocks; index++) {
                    if (!output.write(block)) {
                        await once(output, 'drain');
                    }
                }
                output.end();
                await once(output, 'finish');
                await fs.promises.appendFile(filePath, '\nhttps://large-file.example/found\n');

                const detector = new URLDetector({
                    scan: [path.relative(process.cwd(), filePath)],
                    chunkSize: 256 * 1024,
                });
                const baselineRss = process.memoryUsage().rss;
                const baselineExternal = process.memoryUsage().external;
                let peakRss = baselineRss;
                let peakExternal = baselineExternal;
                const sampler = setInterval(() => {
                    const memory = process.memoryUsage();
                    peakRss = Math.max(peakRss, memory.rss);
                    peakExternal = Math.max(peakExternal, memory.external);
                }, 5);

                let results;
                try {
                    results = await detector.process();
                    const memory = process.memoryUsage();
                    peakRss = Math.max(peakRss, memory.rss);
                    peakExternal = Math.max(peakExternal, memory.external);
                } finally {
                    clearInterval(sampler);
                }

                expect(fs.statSync(filePath).size).toBeGreaterThan(100 * 1024 * 1024);
                expect(results[0].urls.map(url => url.url)).toContain('https://large-file.example/found');
                expect(peakRss - baselineRss).toBeLessThan(160 * 1024 * 1024);
                expect(peakExternal - baselineExternal).toBeLessThan(64 * 1024 * 1024);
            } finally {
                output.destroy();
                await fs.promises.rm(directory, { recursive: true, force: true });
            }
        },
        120000,
    );
});