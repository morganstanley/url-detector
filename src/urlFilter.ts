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

import { minimatch } from 'minimatch';

/**
 * Represents a URL found in source code with its location and context information.
 */
export interface URLMatch {
    /** The actual URL string that was detected */
    url: string;
    /** Character position where the URL starts in the source text */
    start: number;
    /** Character position where the URL ends in the source text */
    end: number;
    /** Line number where the URL appears (1-indexed) */
    line: number;
    /** Column number where the URL appears (1-indexed) */
    column: number;
    /** The context where the URL was found */
    sourceType: 'string' | 'comment' | 'unknown';
    /** Additional context lines around the URL for better understanding */
    context?: string[];
}

/**
 * Configuration options for filtering URLs during detection and processing.
 */
export interface URLFilterOptions {
    /** Array of domain patterns to exclude (blocklist) - supports glob patterns */
    ignoreDomains?: string[];
    /** Whether to include URLs found in comments (default: false) */
    includeComments?: boolean;
    /** Whether to include non-fully qualified domain names like 'localhost' (default: false) */
    includeNonFqdn?: boolean;
}

/**
 * Result containing all URLs found in a specific file.
 */
export interface FileResult {
    /** Path to the file that was scanned */
    file: string;
    /** Array of URLs found in this file */
    urls: URLMatch[];
}

/**
 * Filters and processes URLs based on various criteria such as domain patterns,
 * protocols, content context, and more.
 */
export class URLFilter {
    private options: URLFilterOptions;

    /**
     * Default domains to ignore during URL filtering.
     * These are commonly found in code but typically not meaningful for analysis.
     */
    public static readonly DEFAULT_IGNORED_DOMAINS = ['www.w3.org'];

    /**
     * Creates a new URLFilter with the specified filtering options.
     * @param options Configuration options for URL filtering
     */
    constructor(options: URLFilterOptions) {
        this.options = options;
    }

    /**
     * Filters an array of URLs based on the configured filtering options.
     *
     * Applies filters in the following order:
     * 1. Minimum length filtering
     * 2. Protocol filtering (allowlist)
     * 3. Domain filtering (allowlist)
     * 4. Domain exclusion (blocklist, including defaults)
     * 5. Comment context filtering
     * 6. Non-FQDN filtering
     * 7. Uniqueness filtering
     *
     * @param urls Array of URLs to filter
     * @returns Filtered array of URLs that meet all specified criteria
     */
    public filterUrls(urls: URLMatch[]): URLMatch[] {
        let filtered = [...urls];

        // Apply domain exclusion filter (blocklist) - using both default and user-provided ignoreDomains
        const ignoreDomains = [...URLFilter.DEFAULT_IGNORED_DOMAINS, ...(this.options.ignoreDomains || [])];
        if (ignoreDomains.length > 0) {
            filtered = filtered.filter(urlObj => {
                const domain = this.extractDomain(urlObj.url);
                return !this.matchesAnyPattern(domain, ignoreDomains);
            });
        }

        // Apply context filtering based on includeComments option
        if (!this.options.includeComments) {
            // By default, exclude URLs found in comments
            filtered = filtered.filter(urlObj => urlObj.sourceType !== 'comment');
        }

        // Apply FQDN filtering based on includeNonFqdn option
        if (!this.options.includeNonFqdn) {
            // By default, exclude non-FQDN domains like localhost, server, etc.
            filtered = filtered.filter(urlObj => {
                const domain = this.extractDomain(urlObj.url);
                return this.isFqdn(domain);
            });
        }

        return filtered;
    }

    private extractDomain(url: string): string {
        try {
            // Handle protocol-relative URLs by prepending https:
            const urlToParse = url.startsWith('//') ? 'https:' + url : url;
            const urlObj = new URL(urlToParse);
            return urlObj.hostname.toLowerCase();
        } catch {
            // Fallback for malformed URLs - handle both full and protocol-relative URLs
            let match = url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/([^/]+)/);
            if (!match) {
                // Try protocol-relative pattern
                match = url.match(/^\/\/([^/]+)/);
            }
            return match ? match[1].toLowerCase() : '';
        }
    }

    private matchesAnyPattern(value: string, patterns: string[]): boolean {
        return patterns.some(pattern => {
            // Support both exact matches and glob patterns
            return value === pattern || minimatch(value, pattern);
        });
    }

    private isFqdn(domain: string): boolean {
        if (!domain) return false;

        // IP addresses are considered valid (both IPv4 and IPv6)
        if (this.isIPAddress(domain)) return true;

        // FQDN must contain at least one dot
        if (!domain.includes('.')) return false;

        // Must not be a single level domain (like localhost, server, db)
        const parts = domain.split('.');

        // At least 2 parts and the last part should be a valid TLD (at least 2 chars)
        return parts.length >= 2 && parts[parts.length - 1].length >= 2;
    }

    private isIPAddress(domain: string): boolean {
        // IPv4 pattern
        // eslint-disable-next-line prettier/prettier
        const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        // IPv6 pattern (simplified)
        const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

        return ipv4Pattern.test(domain) || ipv6Pattern.test(domain);
    }
}
