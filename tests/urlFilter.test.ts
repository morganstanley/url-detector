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

import { URLFilter, URLMatch } from '../src/urlFilter';

function makeUrl(url: string): URLMatch {
    return { url, start: 0, end: url.length, line: 1, column: 1, sourceType: 'string' };
}

describe('URLFilter FQDN classification', () => {
    describe('numeric-only TLDs', () => {
        // Note: a shorthand form like "1.22" is not a good counter-example here - the
        // WHATWG URL parser normalizes it to the real IPv4 address "1.0.0.22" before
        // extractDomain ever sees it, so it's correctly treated as an IP address rather
        // than an FQDN and never reaches the TLD check below. The cases here use hosts
        // that fail URL parsing (out-of-range octets, or a non-numeric earlier label)
        // and so reach isFqdn via the raw-text fallback in extractDomain, where the
        // numeric-only-TLD check actually applies.
        it('excludes numeric-only-TLD fragments that are not real IP addresses', () => {
            const filter = new URLFilter({});
            const urls = [makeUrl('http://192.168.1.999/'), makeUrl('http://example.999/'), makeUrl('http://sub.domain.42/')];

            const filtered = filter.filterUrls(urls);

            expect(filtered).toHaveLength(0);
        });

        it('still includes genuine FQDNs with alphabetic TLDs', () => {
            const filter = new URLFilter({});
            const urls = [makeUrl('https://example.com/api'), makeUrl('https://sub.example.co.uk/path')];

            const filtered = filter.filterUrls(urls);

            expect(filtered.map(u => u.url)).toEqual(urls.map(u => u.url));
        });

        it('still includes real IPv4 addresses', () => {
            const filter = new URLFilter({});
            const urls = [makeUrl('http://192.168.1.1/'), makeUrl('http://8.8.8.8/')];

            const filtered = filter.filterUrls(urls);

            expect(filtered.map(u => u.url)).toEqual(urls.map(u => u.url));
        });

        it('is bypassed by includeNonFqdn', () => {
            const filter = new URLFilter({ includeNonFqdn: true });
            const urls = [makeUrl('http://example.999/')];

            const filtered = filter.filterUrls(urls);

            expect(filtered).toHaveLength(1);
        });
    });
});
