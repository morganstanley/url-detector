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

/* eslint-disable no-console */

/**
 * Interface for logging functionality used throughout the URL detector.
 */
export interface Logger {
    /** Log a general message */
    log(message: string, ...args: unknown[]): void;
    /** Log an informational message */
    info(message: string, ...args: unknown[]): void;
    /** Log a warning message */
    warn(message: string, ...args: unknown[]): void;
    /** Log an error message */
    error(message: string, ...args: unknown[]): void;
    /** Log a debug message */
    debug(message: string, ...args: unknown[]): void;
}

/**
 * Logger implementation that discards all messages.
 * Useful for quiet operation where no output is desired.
 */
export const NullLogger: Logger = {
    log: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
};

/**
 * Logger implementation that outputs all messages to the console.
 * Uses standard console methods for different log levels.
 */
export const ConsoleLogger: Logger = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
};

/**
 * Logger implementation that only outputs results and errors.
 * Suppresses info, warning, and debug messages while preserving
 * actual results and error reporting.
 */
export const ResultsOnlyLogger: Logger = {
    log(message: string, ...args: unknown[]): void {
        // Show actual results/output
        console.log(message, ...args);
    },
    info: () => {
        // Skip info messages (progress, etc.)
    },
    warn: () => {
        // Skip warning messages
    },
    error(message: string, ...args: unknown[]): void {
        // Always show errors
        console.error(message, ...args);
    },
    debug: () => {
        // Skip debug messages
    },
};
