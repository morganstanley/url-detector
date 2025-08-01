#!/usr/bin/env node

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

import { Command } from 'commander';
import * as fs from 'fs';
import { URLDetector } from './urlDetector';
import { OutputFormat } from './options';
import { ConsoleLogger, NullLogger, ResultsOnlyLogger } from './logger';
import { OutputFormatter } from './outputFormatter';

const program = new Command();

program
    .name('url-detector')
    .description('Scan source code and text files for URLs, detecting all discovered URLs')
    .version('1.0.0');

// Main options based on new requirements
program
    .option('-s, --scan <patterns...>', 'Glob patterns for files to scan', ['**/*'])
    .option('-e, --exclude <patterns...>', 'Glob patterns for files to exclude', [])
    .option('-i, --ignore-domains <domains...>', 'List of domains to ignore (e.g., example.com)', [])
    .option('--include-comments', 'Also scan commented-out lines for URLs', false)
    .option('--include-non-fqdn', 'Include non-fully qualified domain names like "localhost"', false)
    .option('-f, --format <format>', 'Output format: table, json, csv', 'table')
    .option('-o, --output <file>', 'Output file path (defaults to stdout)')
    .option('-q, --quiet', 'Run in quiet mode with no console output', false)
    .option('--results-only', 'Show only results, suppressing progress and info messages', false)
    .option('--fail-on-error', 'Exit with non-zero code if any URLs are found', false)
    .option('--concurrency <number>', 'Maximum number of files to scan concurrently', parseInt, 10)
    .option('--scan-file <file>', 'File containing glob patterns to scan (one per line)')
    .option('--exclude-file <file>', 'File containing glob patterns to exclude (one per line)')
    .action(async options => {
        // Create appropriate logger based on CLI options
        let logger;
        if (options.quiet) {
            logger = NullLogger;
        } else if (options.resultsOnly) {
            logger = ResultsOnlyLogger;
        } else {
            logger = ConsoleLogger;
        }

        try {
            // Create mutable copy of options for processing
            let scanPatterns = (options.scan as string[]) || [];
            let excludePatterns = (options.exclude as string[]) || [];

            // Load patterns from files if specified
            if (options.scanFile) {
                const fileScanPatterns = await loadPatternsFromFile(options.scanFile as string);
                scanPatterns = [...scanPatterns, ...fileScanPatterns];
            }

            if (options.excludeFile) {
                const fileExcludePatterns = await loadPatternsFromFile(options.excludeFile as string);
                excludePatterns = [...excludePatterns, ...fileExcludePatterns];
            }

            // Create detector with options and logger
            const detector = new URLDetector(
                {
                    scan: scanPatterns,
                    exclude: excludePatterns,
                    ignoreDomains: options.ignoreDomains as string[],
                    includeComments: options.includeComments as boolean,
                    includeNonFqdn: options.includeNonFqdn as boolean,
                    format: options.format as OutputFormat,
                    output: options.output as string,
                    resultsOnly: options.resultsOnly as boolean,
                    failOnError: options.failOnError as boolean,
                    concurrency: options.concurrency as number,
                },
                logger,
            );

            // Process results
            const results = await detector.process();

            // Calculate summary
            const totalFiles = results.length;
            const totalUrls = results.reduce((sum, r) => sum + r.urls.length, 0);

            // Handle output formatting - format results if we found URLs or if explicitly requested
            if (totalUrls > 0) {
                const outputFormatter = new OutputFormatter(
                    {
                        format: (options.format as OutputFormat) || 'table',
                        outputFile: (options.output as string) || null,

                        withLineNumbers: true,
                        withFilenames: true,
                        context: 0,
                    },
                    logger,
                );

                await outputFormatter.formatAndOutput(results);
            }

            // Print summary using logger
            logger.info(`Processed ${totalFiles} file(s), found ${totalUrls} URL(s)`);

            // Exit with error code if URLs found and fail-on-error is set
            if (options.failOnError && totalUrls > 0) {
                process.exit(1);
            }
        } catch (error: unknown) {
            // Use the same logger - errors will be shown in results-only mode, hidden in quiet mode
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('Error:', errorMessage);
            process.exit(1);
        }
    });

async function loadPatternsFromFile(filePath: string): Promise<string[]> {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));
}

// Only run if this file is executed directly (not imported)
if (require.main === module) {
    // Handle cases where no arguments are provided
    program.parse();
}

export { program };
