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

export { URLDetector } from './urlDetector';
export { DetectorOptions } from './options';
export { LanguageManager, LanguageConfig } from './languageManager';
export { URLFilter } from './urlFilter';
export { OutputFormatter } from './outputFormatter';
export { Logger, NullLogger, ConsoleLogger, ResultsOnlyLogger } from './logger';

import { URLDetector } from './urlDetector';

// Default export for CommonJS compatibility
export default URLDetector;

// If this module is run directly
if (require.main === module) {
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
