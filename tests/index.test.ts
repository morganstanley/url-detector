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

import * as index from '../src/index';
import DefaultExport from '../src/index';
import { URLDetector } from '../src/urlDetector';
import { DetectorOptions } from '../src/options';
import { LanguageManager } from '../src/languageManager';
import { URLFilter } from '../src/urlFilter';
import { OutputFormatter } from '../src/outputFormatter';
import { NullLogger, ConsoleLogger, ResultsOnlyLogger } from '../src/logger';

// Importing the barrel (src/index.ts) executes its module body: the re-export
// statements, the default export, and the isMainModule IIFE (which resolves to
// false in a test, so the top-level `process()` call is skipped). These tests
// assert the public API surface is intact and that the default export is
// URLDetector.
describe('index barrel exports', () => {
    test('re-exports the public API surface', () => {
        expect(index.URLDetector).toBe(URLDetector);
        expect(index.DetectorOptions).toBe(DetectorOptions);
        expect(index.LanguageManager).toBe(LanguageManager);
        expect(index.URLFilter).toBe(URLFilter);
        expect(index.OutputFormatter).toBe(OutputFormatter);
        expect(index.NullLogger).toBe(NullLogger);
        expect(index.ConsoleLogger).toBe(ConsoleLogger);
        expect(index.ResultsOnlyLogger).toBe(ResultsOnlyLogger);
    });

    test('exposes URLDetector as the default export', () => {
        expect(DefaultExport).toBe(URLDetector);
    });
});
