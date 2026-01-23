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
const packageJson = require('../package.json');

/**
 * Exit codes used by the CLI
 */
export const ExitCode = {
    SUCCESS: 0, // Success, no URLs found
    URLS_FOUND: 1, // URLs found (when --fail-on-error)
    CONFIG_ERROR: 2, // Configuration error
    FILE_READ_ERROR: 3, // File read error
    PARSE_ERROR: 4, // Parse error threshold exceeded
} as const;

const program = new Command();

program
    .name('url-detector')
    .description('Scan source code and text files for URLs, detecting all discovered URLs')
    .version(packageJson.version)
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
        const exitCode = await runCLI(options);
        if (exitCode !== ExitCode.SUCCESS) {
            process.exit(exitCode);
        }
    });

/**
 * CLI options interface
 */
export interface CLIOptions {
    scan?: string[];
    exclude?: string[];
    ignoreDomains?: string[];
    includeComments?: boolean;
    includeNonFqdn?: boolean;
    format?: string;
    output?: string | null;
    resultsOnly?: boolean;
    failOnError?: boolean;
    concurrency?: number;
    quiet?: boolean;
    scanFile?: string;
    excludeFile?: string;
}

/**
 * Main CLI logic extracted for testability
 * Returns the exit code that should be used
 */
export async function runCLI(options: CLIOptions): Promise<number> {
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
            try {
                const fileScanPatterns = await loadPatternsFromFile(options.scanFile as string);
                scanPatterns = [...scanPatterns, ...fileScanPatterns];
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.error('Error loading scan patterns file:', errorMessage);
                return ExitCode.FILE_READ_ERROR;
            }
        }

        if (options.excludeFile) {
            try {
                const fileExcludePatterns = await loadPatternsFromFile(options.excludeFile as string);
                excludePatterns = [...excludePatterns, ...fileExcludePatterns];
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.error('Error loading exclude patterns file:', errorMessage);
                return ExitCode.FILE_READ_ERROR;
            }
        }

        // Create detector with options and logger - catch configuration errors
        let detector;
        try {
            detector = new URLDetector(
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
        } catch (error: unknown) {
            // Configuration validation errors
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('Configuration error:', errorMessage);
            return ExitCode.CONFIG_ERROR;
        }

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
            return ExitCode.URLS_FOUND;
        }

        return ExitCode.SUCCESS;
    } catch (error: unknown) {
        // Handle unexpected errors - check if it's a file read error
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Error:', errorMessage);

        // Determine exit code based on error type
        if (errorMessage.includes('Failed to find files') || errorMessage.includes('ENOENT')) {
            return ExitCode.FILE_READ_ERROR;
        } else {
            // Default to config error for other unexpected errors
            return ExitCode.CONFIG_ERROR;
        }
    }
}

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
