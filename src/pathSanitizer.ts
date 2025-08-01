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
 * Sanitizes glob patterns to prevent path traversal attacks
 * @param pattern - The glob pattern to sanitize
 * @returns Sanitized glob pattern
 */
export function sanitizeGlobPattern(pattern: string): string {
    return (
        pattern
            // Normalize path separators to forward slashes
            .replace(/\\/g, '/')
            // Remove dangerous traversal sequences
            .replace(/\.\.\/+/g, '')
            .replace(/\/\.\.$/g, '')
            .replace(/^\.\.$/g, '')
            .replace(/^\.\.\/+/g, '')
            // Remove null bytes and other control characters
            // eslint-disable-next-line no-control-regex
            .replace(/[\x00-\x1f\x7f]/g, '')
            // Remove URL encoding attempts for path traversal
            .replace(/%2e%2e/gi, '')
            .replace(/%252e%252e/gi, '')
    );
}

/**
 * Sanitizes an array of glob patterns
 * @param patterns - Array of glob patterns to sanitize
 * @returns Array of sanitized glob patterns
 */
export function sanitizeGlobPatterns(patterns: string[]): string[] {
    return patterns.map(pattern => sanitizeGlobPattern(pattern));
}
