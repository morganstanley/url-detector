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
import { DetectorOptionsConfig, OutputFormat } from './options.js';

/**
 * File names recognized as a url-detector configuration file during discovery,
 * checked in order. Both are expected to contain a JSON object of options.
 */
export const CONFIG_FILE_NAMES = ['.url-detector.json', '.url-detectorrc'] as const;

/**
 * Result of a successful configuration file load.
 */
export interface ConfigLoadResult {
    /** The validated options read from the configuration file. */
    config: DetectorOptionsConfig;
    /** Absolute path of the configuration file that was loaded. */
    sourcePath: string;
    /** Non-fatal messages (e.g. unknown keys that were ignored). */
    warnings: string[];
}

/**
 * The set of option keys that a configuration file may define. This mirrors the
 * programmatic {@link DetectorOptionsConfig} surface. Values here are treated as
 * defaults that command-line flags override.
 */
const VALID_FORMATS: OutputFormat[] = ['table', 'json', 'csv'];

/**
 * Resolves the path of the configuration file to use.
 *
 * When an explicit path is provided (from `--config`), it is resolved to an
 * absolute path and must exist, otherwise an error is thrown. When no explicit
 * path is given, the search starts at `startDir` (default: the current working
 * directory) and walks up the directory tree to the filesystem root, checking
 * each directory for the known configuration file names.
 *
 * @param explicitPath Optional explicit configuration file path (from `--config`)
 * @param startDir Directory to begin the discovery search from (default: cwd)
 * @returns The absolute path of the configuration file, or null when no
 *          configuration file was discovered and no explicit path was given
 * @throws {Error} When an explicit path is given but no file exists at that path
 */
export function resolveConfigPath(
    explicitPath: string | null | undefined,
    startDir: string = process.cwd(),
): string | null {
    if (explicitPath) {
        const resolved = path.resolve(explicitPath);
        if (!isFile(resolved)) {
            throw new Error(`Configuration file not found: ${resolved}`);
        }
        return resolved;
    }

    let dir = path.resolve(startDir);
    for (;;) {
        for (const name of CONFIG_FILE_NAMES) {
            const candidate = path.join(dir, name);
            if (isFile(candidate)) {
                return candidate;
            }
        }

        const parent = path.dirname(dir);
        if (parent === dir) {
            // Reached the filesystem root without finding a configuration file.
            return null;
        }
        dir = parent;
    }
}

/**
 * Loads and validates a JSON configuration file.
 *
 * Returns null when there is no configuration file to load (no explicit path was
 * provided and none was discovered). This is not an error: running the tool with
 * no configuration file present behaves exactly as before this feature.
 *
 * @param explicitPath Optional explicit configuration file path (from `--config`)
 * @param startDir Directory to begin discovery from when no explicit path is given
 * @returns The loaded, validated configuration, or null when none is present
 * @throws {Error} When the file is missing (explicit path), unreadable, contains
 *                 invalid JSON, is not a JSON object, or has invalid option values
 */
export async function loadConfig(
    explicitPath: string | null | undefined,
    startDir: string = process.cwd(),
): Promise<ConfigLoadResult | null> {
    const configPath = resolveConfigPath(explicitPath, startDir);
    if (configPath === null) {
        return null;
    }

    let content: string;
    try {
        content = await fs.promises.readFile(configPath, 'utf8');
    } catch (error) {
        throw new Error(`Cannot read configuration file ${configPath}: ${describeError(error)}`, { cause: error });
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch (error) {
        throw new Error(`Invalid JSON in configuration file ${configPath}: ${describeError(error)}`, { cause: error });
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error(`Configuration file ${configPath} must contain a JSON object of url-detector options`);
    }

    const { config, warnings } = validateConfig(parsed as Record<string, unknown>, configPath);

    return { config, sourcePath: configPath, warnings };
}

/**
 * Validates a raw configuration object against the known options and their types.
 *
 * Known keys with valid values are copied into a {@link DetectorOptionsConfig}.
 * Unknown keys do not throw; they are reported in `warnings` and ignored, which
 * keeps configuration files forward-compatible. Values with the wrong type throw,
 * because silently accepting them would change detection behavior in a confusing
 * way (for example, `"includeComments": "yes"` must not be treated as enabled).
 *
 * @param input The parsed JSON object from the configuration file
 * @param sourcePath Path used in error and warning messages
 * @returns The validated config plus any non-fatal warnings
 * @throws {Error} When a known key has a value of the wrong type
 */
export function validateConfig(
    input: Record<string, unknown>,
    sourcePath: string = '<config>',
): { config: DetectorOptionsConfig; warnings: string[] } {
    const warnings: string[] = [];
    const config: DetectorOptionsConfig = {};

    for (const [key, value] of Object.entries(input)) {
        if (value === undefined) {
            continue;
        }

        switch (key) {
            case 'scan':
                config.scan = assertStringArray(key, value, sourcePath);
                break;
            case 'exclude':
                config.exclude = assertStringArray(key, value, sourcePath);
                break;
            case 'ignoreDomains':
                config.ignoreDomains = assertStringArray(key, value, sourcePath);
                break;
            case 'includeComments':
                config.includeComments = assertBoolean(key, value, sourcePath);
                break;
            case 'includeNonFqdn':
                config.includeNonFqdn = assertBoolean(key, value, sourcePath);
                break;
            case 'resultsOnly':
                config.resultsOnly = assertBoolean(key, value, sourcePath);
                break;
            case 'failOnError':
                config.failOnError = assertBoolean(key, value, sourcePath);
                break;
            case 'fallbackRegex':
                config.fallbackRegex = assertBoolean(key, value, sourcePath);
                break;
            case 'format': {
                const format = assertString(key, value, sourcePath);
                if (!VALID_FORMATS.includes(format as OutputFormat)) {
                    throw new Error(
                        `Invalid format "${format}" in ${sourcePath}. Valid formats: ${VALID_FORMATS.join(', ')}`,
                    );
                }
                config.format = format as OutputFormat;
                break;
            }
            case 'output':
                if (value !== null && typeof value !== 'string') {
                    throw new Error(`Invalid output value in ${sourcePath}. Must be a string or null.`);
                }
                config.output = value as string | null;
                break;
            case 'concurrency':
                config.concurrency = assertPositiveInt(key, value, sourcePath);
                break;
            case 'maxDepth':
                config.maxDepth = assertNumber(key, value, sourcePath);
                break;
            case 'context':
                config.context = assertNonNegativeInt(key, value, sourcePath);
                break;
            default:
                warnings.push(`Unknown configuration key "${key}" in ${sourcePath} was ignored.`);
                break;
        }
    }

    return { config, warnings };
}

// ---------------------------------------------------------------------------
// Value type assertions
// ---------------------------------------------------------------------------

function assertString(key: string, value: unknown, sourcePath: string): string {
    if (typeof value !== 'string') {
        throw new Error(`Invalid ${key} value in ${sourcePath}. Expected a string.`);
    }
    return value;
}

function assertStringArray(key: string, value: unknown, sourcePath: string): string[] {
    if (typeof value === 'string') {
        return [value];
    }
    if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
        return value;
    }
    throw new Error(`Invalid ${key} value in ${sourcePath}. Expected a string or an array of strings.`);
}

function assertBoolean(key: string, value: unknown, sourcePath: string): boolean {
    if (typeof value !== 'boolean') {
        throw new Error(`Invalid ${key} value in ${sourcePath}. Expected a boolean.`);
    }
    return value;
}

function assertPositiveInt(key: string, value: unknown, sourcePath: string): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
        throw new Error(`Invalid ${key} value in ${sourcePath}. Expected a positive integer.`);
    }
    return value;
}

function assertNonNegativeInt(key: string, value: unknown, sourcePath: string): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
        throw new Error(`Invalid ${key} value in ${sourcePath}. Expected a non-negative integer.`);
    }
    return value;
}

function assertNumber(key: string, value: unknown, sourcePath: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`Invalid ${key} value in ${sourcePath}. Expected a number.`);
    }
    return value;
}

function isFile(filePath: string): boolean {
    try {
        return fs.statSync(filePath).isFile();
    } catch {
        return false;
    }
}

function describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
