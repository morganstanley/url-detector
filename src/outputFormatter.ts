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

import * as fs from 'fs';
import * as path from 'path';
import { createHash, randomUUID } from 'node:crypto';
import Table from 'cli-table3';
import { Logger, NullLogger } from './logger.js';
import { FileResult } from './urlDetector.js';
import { OutputFormat } from './options.js';
import packageJson from '../package.json' with { type: 'json' };

/**
 * Configuration options for output formatting.
 */
export interface OutputFormatterOptions {
    /** Whether to output only URLs without additional metadata (default: false) */
    onlyUrls?: boolean;
    /** Output format for results (default: 'table') */
    format?: OutputFormat;
    /** Path to output file, or null for stdout (default: null) */
    outputFile?: string | null;

    /** Whether to include line numbers in output (default: true) */
    withLineNumbers?: boolean;
    /** Whether to include filenames in output (default: true) */
    withFilenames?: boolean;
    /** Number of context lines to include around URLs (default: 0) */
    context?: number;
}

export interface OutputSummary {
    totalFiles: number;
    totalUrls: number;
    uniqueUrls: number;
}

export interface JsonOutput {
    summary: OutputSummary;
    files: Array<{
        file: string;
        urlCount: number;
        urls: Array<{
            url: string;
            line?: number;
            column?: number;
            start: number;
            end: number;
            context?: string[];
        }>;
    }>;
}

/**
 * A single place a URL was found, recorded in a CycloneDX component's
 * properties. Kept minimal: enough to locate the URL again, nothing that
 * a URL-only manifest cannot supply.
 */
interface UrlLocation {
    file: string;
    line: number;
    column: number;
    sourceType: 'string' | 'comment' | 'unknown';
}

export class OutputFormatter {
    private options: OutputFormatterOptions;
    private logger: Logger;

    constructor(options: OutputFormatterOptions, logger?: Logger) {
        this.options = options;
        this.logger = logger || NullLogger;
    }

    public async formatAndOutput(results: FileResult[]): Promise<void> {
        let output: string;

        if (this.options.onlyUrls) {
            output = this.formatUrlsOnly(results);
        } else {
            const format = this.options.format || 'table';
            switch (format) {
                case 'json':
                    output = this.formatJson(results);
                    break;
                case 'csv':
                    output = this.formatCsv(results);
                    break;
                case 'table':
                    output = this.formatTable(results);
                    break;
                case 'cyclonedx':
                    output = this.formatCycloneDX(results);
                    break;

                default:
                    throw new Error(`Unknown output format: ${format}`);
            }
        }

        const outputFile = this.options.outputFile;
        if (outputFile) {
            await fs.promises.writeFile(outputFile, output, 'utf8');
            this.logger.info(`Output written to ${outputFile}`);
        } else {
            // Output results through the logger - the logger will handle quiet/console behavior
            this.logger.log(output);
        }
    }

    private formatUrlsOnly(results: FileResult[]): string {
        const urls: string[] = [];

        for (const result of results) {
            for (const urlObj of result.urls) {
                urls.push(urlObj.url);
            }
        }

        return urls.join('\n');
    }

    private formatJson(results: FileResult[]): string {
        const output: JsonOutput = {
            summary: {
                totalFiles: results.length,
                totalUrls: results.reduce((sum, r) => sum + r.urls.length, 0),
                uniqueUrls: this.getUniqueUrls(results).length,
            },
            files: results.map(result => ({
                file: result.file,
                urlCount: result.urls.length,
                urls: result.urls
                    .map(urlObj => ({
                        url: urlObj.url,
                        line: this.options.withLineNumbers ? urlObj.line : undefined,
                        column: this.options.withLineNumbers ? urlObj.column : undefined,
                        start: urlObj.start,
                        end: urlObj.end,
                        context: urlObj.context,
                    }))
                    .filter(url => url.line !== undefined || !this.options.withLineNumbers),
            })),
        };

        return JSON.stringify(output, null, 2);
    }

    private formatCsv(results: FileResult[]): string {
        const headers = ['FilePath', 'FileName', 'LineNumber', 'ColumnPosition', 'URL'];
        const rows: string[] = [headers.join(',')];

        for (const result of results) {
            for (const urlObj of result.urls) {
                const fileName = path.basename(result.file);
                const row = [
                    this.escapeCsv(result.file),
                    this.escapeCsv(fileName),
                    urlObj.line.toString(),
                    urlObj.column.toString(),
                    this.escapeCsv(urlObj.url),
                ];

                rows.push(row.join(','));
            }
        }

        return rows.join('\n');
    }

    private formatTable(results: FileResult[]): string {
        if (results.length === 0) {
            return 'No URLs found.';
        }

        const headers = ['FilePath', 'FileName', 'Line:Col', 'URL'];

        const table = new Table({
            head: headers,
            style: {
                head: ['cyan'],
                border: ['grey'],
            },
            colWidths: [30, 20, 10, 50],
        });

        for (const result of results) {
            for (const urlObj of result.urls) {
                const fileName = path.basename(result.file);
                const row = [
                    this.truncate(result.file, 25),
                    this.truncate(fileName, 18),
                    `${urlObj.line}:${urlObj.column}`,
                    this.truncate(urlObj.url, 45),
                ];

                table.push(row);
            }
        }

        return table.toString();
    }

    /**
     * Builds a CycloneDX 1.5 BOM (bill of materials) from the detection results.
     *
     * Each unique URL becomes a single component: a dependency identified only by
     * its URL, since a URL alone carries no version or license to record. Every
     * place the URL was found in the scanned files is kept in the component's
     * properties so the origin can be traced. The result is a valid "URL-only
     * manifest" that CycloneDX tooling can import and reconcile against a full
     * SBOM where versions and licenses are known.
     */
    private formatCycloneDX(results: FileResult[]): string {
        const locationsByUri = new Map<string, UrlLocation[]>();
        for (const result of results) {
            for (const urlObj of result.urls) {
                const locations = locationsByUri.get(urlObj.url) || [];
                locations.push({
                    file: result.file,
                    line: urlObj.line,
                    column: urlObj.column,
                    sourceType: urlObj.sourceType,
                });
                locationsByUri.set(urlObj.url, locations);
            }
        }

        const components = Array.from(locationsByUri.entries()).map(([url, locations]) => ({
            type: 'library',
            'bom-ref': `url-${this.sha256Hex(url).slice(0, 16)}`,
            name: url,
            externalReferences: [
                {
                    type: 'distribution',
                    url,
                },
            ],
            properties: [
                {
                    name: 'url-detector:locations',
                    value: JSON.stringify(locations),
                },
            ],
        }));

        const bom = {
            bomFormat: 'CycloneDX',
            specVersion: '1.5',
            serialNumber: `urn:uuid:${randomUUID()}`,
            version: 1,
            metadata: {
                timestamp: new Date().toISOString(),
                tools: {
                    components: [
                        {
                            type: 'application',
                            name: 'url-detector',
                            version: packageJson.version,
                            description: 'SBOM generator for URLs detected in source code',
                        },
                    ],
                },
            },
            components,
        };

        return JSON.stringify(bom, null, 2);
    }

    private sha256Hex(value: string): string {
        return createHash('sha256').update(value, 'utf8').digest('hex');
    }

    private getUniqueUrls(results: FileResult[]): string[] {
        const urls = new Set<string>();

        for (const result of results) {
            for (const urlObj of result.urls) {
                urls.add(urlObj.url);
            }
        }

        return Array.from(urls);
    }

    /**
     * Prefixes a cell value with a single quote if it starts with a character that
     * spreadsheet applications (Excel, LibreOffice, Google Sheets) interpret as the
     * start of a formula. This keeps scanned filenames and URLs from being evaluated
     * as formulas when the CSV output is opened in a spreadsheet.
     */
    private neutralizeFormula(value: string): string {
        if (/^[=+\-@\t\r]/.test(value)) {
            return `'${value}`;
        }

        return value;
    }

    private escapeCsv(value: string | number): string {
        const strValue = this.neutralizeFormula(typeof value === 'string' ? value : value.toString());

        if (
            strValue.includes(',') ||
            strValue.includes('"') ||
            strValue.includes('\n') ||
            strValue.includes('\t') ||
            strValue.includes('\r')
        ) {
            return `"${strValue.replace(/"/g, '""')}"`;
        }

        return strValue;
    }

    private truncate(str: string, maxLength: number): string {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    }
}
