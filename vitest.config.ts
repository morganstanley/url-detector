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

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Only the tests/ directory is run; node_modules is excluded by default.
        include: ['tests/**/*.test.ts'],
        environment: 'node',
        // Tests use describe/test/expect/beforeEach as globals (Jest style),
        // so inject the test APIs globally rather than importing them per file.
        globals: true,
        // Bound per-test and per-hook execution time. The default 5s test timeout is
        // too tight for the (now deterministic) property-based tests, and an unbounded
        // run lets a pathological case hang CI for tens of minutes instead of failing
        // fast. 30s is generous for real work while still catching a genuine stall.
        testTimeout: 30000,
        hookTimeout: 30000,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.d.ts'],
            // Emit lcov.info (what Codecov reads) in addition to the console
            // summary and the HTML report for local debugging.
            reporter: ['text', 'html', 'lcov'],
        },
    },
});
