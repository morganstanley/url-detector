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
 * Decodes percent-encoded dot sequences (including doubly-encoded forms
 * such as `%252e`) to a fixed point, so traversal removal below sees the
 * same characters whether a pattern arrived literal or encoded.
 */
function decodeEncodedDots(pattern: string): string {
    let result = pattern;
    let previous: string;
    do {
        previous = result;
        result = result.replace(/%2e/gi, '.').replace(/%252e/gi, '%2e');
    } while (result !== previous);
    return result;
}

/**
 * Sanitizes glob patterns to keep them scoped to the intended scan root.
 *
 * Decodes percent-encoded traversal sequences, removes relative `../`
 * segments, and strips leading glob-negation (`!`), drive-letter
 * (`C:`), and absolute-path (`/`) prefixes so a sanitized pattern always
 * resolves to a relative path regardless of the caller's `cwd`. Every step
 * is re-applied in a fixed-point loop so that removing one prefix or
 * sequence can't uncover another one underneath it.
 *
 * @param pattern - The glob pattern to sanitize
 * @returns Sanitized glob pattern
 */
export function sanitizeGlobPattern(pattern: string): string {
    let result = pattern
        // Normalize path separators to forward slashes
        .replace(/\\/g, '/')
        // Remove null bytes and other control characters
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1f\x7f]/g, '');

    let previous: string;
    do {
        previous = result;

        // Decode URL-encoded traversal attempts before stripping them.
        result = decodeEncodedDots(result);

        // Remove relative traversal segments: "../", a trailing "/..", or
        // a bare "..", each only when properly bounded by a path
        // separator (or the start/end of the pattern). A trailing "/.."
        // (preceded by a separator, with nothing after it) is dropped
        // entirely rather than leaving the separator behind - there's no
        // following segment left to join it to.
        result = result.replace(/(^|\/)\.\.(\/|$)/g, (_match, before: string, after: string) =>
            before === '/' && after === '' ? '' : before,
        );

        // Strip glob-negation, drive-letter, and absolute-path prefixes so
        // the pattern can't escape the scan root regardless of fast-glob's
        // cwd.
        result = result
            .replace(/^!+/, '')
            .replace(/^[A-Za-z]:\/?/, '')
            .replace(/^\/+/, '');
    } while (result !== previous);

    return result;
}

/**
 * Sanitizes an array of glob patterns
 * @param patterns - Array of glob patterns to sanitize
 * @returns Array of sanitized glob patterns
 */
export function sanitizeGlobPatterns(patterns: string[]): string[] {
    return patterns.map(pattern => sanitizeGlobPattern(pattern));
}
