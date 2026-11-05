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

import { URLDetector } from './urlDetector.js';
import { pathToFileURL } from 'url';

// Default export for CommonJS compatibility
export default URLDetector;

// If this module is run directly
const isMainModule = (() => {
    if (process.env.PKG_EXECPATH) return true;
    if (!process.argv[1]) return false;
    try {
        return import.meta.url === pathToFileURL(process.argv[1]).href;
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
