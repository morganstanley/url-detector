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

export { URLDetector } from './urlDetector.js';
export { DetectorOptions } from './options.js';
export { LanguageManager, LanguageConfig } from './languageManager.js';
export { URLFilter } from './urlFilter.js';
export { OutputFormatter } from './outputFormatter.js';
export { Logger, NullLogger, ConsoleLogger, ResultsOnlyLogger } from './logger.js';
export { loadConfig, resolveConfigPath, validateConfig, CONFIG_FILE_NAMES } from './configLoader.js';
export type { ConfigLoadResult } from './configLoader.js';

import * as fs from 'fs';
import { URLDetector } from './urlDetector.js';
import { fileURLToPath } from 'url';

// Default export for CommonJS compatibility
export default URLDetector;

// If this module is run directly
const isMainModule = (() => {
    if (process.env.PKG_EXECPATH) return true;
    if (!process.argv[1]) return false;
    try {
        // Normalize both sides to real paths: argv[1] may name a symlink, or a
        // path whose casing differs from the casing stored on disk (Windows). A
        // mismatch would silently skip the direct-run branch below.
        const entry = fs.realpathSync.native(process.argv[1]);
        const self = fs.realpathSync.native(fileURLToPath(import.meta.url));
        return entry === self;
    } catch {
        return false;
    }
})();

if (isMainModule) {
    const detector = new URLDetector({
        scan: ['**/*.js', '**/*.ts'],
        format: 'table',
    });

    detector
        .process()
        .then(() => {
            // URL Detection complete
        })
        .catch(() => {
            // Error occurred
        });
}
