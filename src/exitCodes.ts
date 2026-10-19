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

/**
 * CLI process exit codes.
 *
 * Numbering matches https://github.com/morganstanley/url-detector/issues/92
 */
export const EXIT_CODES = {
    SUCCESS: 0,
    URLS_FOUND: 1,
    CONFIG: 2,
    FILE_READ: 3,
    PARSE_THRESHOLD: 4,
} as const;

const FILE_SYSTEM_ERROR_CODES = new Set([
    'ENOENT',
    'EACCES',
    'EPERM',
    'EISDIR',
    'ENOTDIR',
    'ELOOP',
    'ENAMETOOLONG',
    'EBUSY',
    'EROFS',
]);

function getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error && error.code != null) {
        return String(error.code);
    }
    return undefined;
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

/**
 * Maps a thrown error to the matching CLI exit code.
 *
 * Exit code 1 is reserved for `--fail-on-error` when URLs are found, so
 * operational failures use 2–4 instead.
 */
export function getExitCodeForError(error: unknown): number {
    const code = getErrorCode(error);
    if (code && FILE_SYSTEM_ERROR_CODES.has(code)) {
        return EXIT_CODES.FILE_READ;
    }

    const message = getErrorMessage(error);

    if (/parse error threshold/i.test(message)) {
        return EXIT_CODES.PARSE_THRESHOLD;
    }

    if (
        /Failed to find files/i.test(message) ||
        /no such file or directory/i.test(message) ||
        /permission denied/i.test(message)
    ) {
        return EXIT_CODES.FILE_READ;
    }

    return EXIT_CODES.CONFIG;
}
