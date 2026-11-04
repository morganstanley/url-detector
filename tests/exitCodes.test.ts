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

import { EXIT_CODES, getExitCodeForError } from '../src/exitCodes';

describe('CLI exit codes', () => {
    test('uses the numbering from issue #92', () => {
        expect(EXIT_CODES.SUCCESS).toBe(0);
        expect(EXIT_CODES.URLS_FOUND).toBe(1);
        expect(EXIT_CODES.CONFIG).toBe(2);
        expect(EXIT_CODES.FILE_READ).toBe(3);
        expect(EXIT_CODES.PARSE_THRESHOLD).toBe(4);
    });

    test('maps invalid configuration messages to exit code 2', () => {
        expect(getExitCodeForError(new Error('Invalid output format: xml. Valid formats: json, csv, table'))).toBe(
            EXIT_CODES.CONFIG,
        );
        expect(getExitCodeForError(new Error('Unknown output format: xml'))).toBe(EXIT_CODES.CONFIG);
        expect(getExitCodeForError(new Error('Concurrency must be >= 1'))).toBe(EXIT_CODES.CONFIG);
        expect(getExitCodeForError(new Error('Max depth must be >= 0'))).toBe(EXIT_CODES.CONFIG);
    });

    test('maps filesystem errors to exit code 3', () => {
        const missingFile = Object.assign(new Error("ENOENT: no such file or directory, open 'missing.txt'"), {
            code: 'ENOENT',
        });
        const permissionDenied = Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });

        expect(getExitCodeForError(missingFile)).toBe(EXIT_CODES.FILE_READ);
        expect(getExitCodeForError(permissionDenied)).toBe(EXIT_CODES.FILE_READ);
        expect(getExitCodeForError(new Error('Failed to find files: EACCES'))).toBe(EXIT_CODES.FILE_READ);
    });

    test('maps parse error threshold messages to exit code 4', () => {
        expect(getExitCodeForError(new Error('Parse error threshold exceeded'))).toBe(EXIT_CODES.PARSE_THRESHOLD);
    });

    test('does not use exit code 1 for operational failures', () => {
        expect(getExitCodeForError(new Error('something unexpected'))).not.toBe(EXIT_CODES.URLS_FOUND);
        expect(getExitCodeForError(new Error('something unexpected'))).toBe(EXIT_CODES.CONFIG);
    });
});
