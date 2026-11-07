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
import { fileURLToPath } from 'url';
import { URLDetector } from './urlDetector.js';
import { OutputFormat } from './options.js';
import { ConsoleLogger, NullLogger, ResultsOnlyLogger } from './logger.js';
import { OutputFormatter } from './outputFormatter.js';
import packageJson from '../package.json' with { type: 'json' };

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
    .option(
        '--stdin-language <language>',
        'Language for stdin input (e.g., javascript). When set, reads content from stdin instead of scanning files',
    )
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
            // --stdin-language switches the tool into stdin mode: it reads content from
            // stdin and detects URLs using the given language, instead of scanning files.
            const stdinMode = Boolean(options.stdinLanguage);

            // Create mutable copy of options for processing
            let scanPatterns: string[] = [];
            let excludePatterns: string[] = [];

            if (!stdinMode) {
                scanPatterns = (options.scan as string[]) || [];
                excludePatterns = (options.exclude as string[]) || [];

                // Load patterns from files if specified
                if (options.scanFile) {
                    const fileScanPatterns = await loadPatternsFromFile(options.scanFile as string);
                    scanPatterns = [...scanPatterns, ...fileScanPatterns];
                }

                if (options.excludeFile) {
                    const fileExcludePatterns = await loadPatternsFromFile(options.excludeFile as string);
                    excludePatterns = [...excludePatterns, ...fileExcludePatterns];
                }
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

            // Process results: detect from piped stdin, or scan files matching the patterns
            const results = stdinMode
                ? [await detector.detectFromText(fs.readFileSync(0, 'utf8'), options.stdinLanguage as string)]
                : await detector.process();

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

// Only run if this file is executed directly (not imported as a library).
const isMainModule = (() => {
    // pkg bundle (Standard or SEA): the entry module IS the executable.
    if (process.env.PKG_EXECPATH || typeof (process as NodeJS.Process & { pkg?: unknown }).pkg !== 'undefined') {
        return true;
    }

    // Bun (both `bun <file>` dev mode and a `bun build --compile` executable).
    // `import.meta.main` is true only for the module that is the process entrypoint,
    // so it correctly distinguishes "running the CLI" from "imported as a library".
    // It is unavailable under Node, where we fall through to the path comparison below.
    if (process.versions.bun) {
        return Boolean((import.meta as { main?: boolean }).main);
    }

    // Node: compare the resolved entry path to this module's own path.
    if (!process.argv[1]) return false;
    try {
        // process.argv[1] may name a symlink (npm's Unix bin shim), or a path whose
        // casing differs from the casing stored on disk (Windows paths are
        // case-insensitive; `realpathSync.native` returns the stored casing while
        // `import.meta.url` keeps the casing the process was launched with).
        // Normalize both sides to their real paths before comparing so the check
        // holds on every platform — a mismatch here would silently skip
        // `program.parse()` and no-op the CLI.
        const entry = fs.realpathSync.native(process.argv[1]);
        const self = fs.realpathSync.native(fileURLToPath(import.meta.url));
        return entry === self;
    } catch {
        return false;
    }
})();

if (isMainModule) {
    // Handle cases where no arguments are provided
    program.parse();
}

export { program };
