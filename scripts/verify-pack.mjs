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

/**
 * Verifies the packed tarball the way a fresh consumer experiences it, on this
 * platform. Two modes, so the real `npm` runs under the CI shell (which
 * resolves it natively on every OS) instead of being spawned from Node:
 *
 *   --prepare
 *     Locates the packed tarball in the project root and creates a fresh,
 *     empty consumer project (.pack-verify/) with a minimal package.json.
 *     Reports the tarball's file name via GITHUB_OUTPUT for the workflow
 *     step that runs the `npm install`.
 *
 *   --check
 *     Asserts the consumer install was clean (no `npm warn` / `ERESOLVE`
 *     lines in .pack-verify/install.log), then runs the installed CLI —
 *     directly with this node binary, not the .bin shim — and checks real
 *     detection: a commented-out URL in examples/test.js is excluded by
 *     default but included with --include-comments. That toggle requires the
 *     AST, so it can only pass if the native parser is actually driving
 *     detection. Cleans up the consumer project.
 *
 * Exits 0 only if all checks hold; prints the offending output and exits 1 otherwise.
 * Expects the tarball to already exist in the project root (run `npm pack` first).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONSUMER_DIR = '.pack-verify';
const consumerDir = path.join(projectRoot, CONSUMER_DIR);

/** Prints a labelled block and returns true if `needle` is in `haystack` as expected. */
function assertContains(label, haystack, needle, expect) {
    const found = haystack.includes(needle);
    const ok = found === expect;
    const verdict = expect
        ? found
            ? 'PRESENT (as expected)'
            : 'ABSENT (unexpected!)'
        : found
          ? 'PRESENT (unexpected!)'
          : 'ABSENT (as expected)';
    process.stdout.write(`  [${ok ? 'PASS' : 'FAIL'}] ${label}: ${verdict}\n`);
    return ok;
}

/**
 * Runs a command, always returning { code, log } where log is stdout+stderr.
 * No shell is used, so arguments reach the child process verbatim (no quoting
 * or escaping surprises).
 */
function run(cmd, args, cwd) {
    const res = spawnSync(cmd, args, { cwd, encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 });
    const spawnErr = res.error ? `\n[spawn error] ${res.error.message}` : '';
    return { code: res.status, log: `${res.stdout ?? ''}${res.stderr ?? ''}${spawnErr}` };
}

function fail(msg) {
    process.stdout.write(`\nFAIL: ${msg}\n`);
    process.exit(1);
}

/** Locates the packed tarball in the project root (created by `npm pack`). */
function locateTarball() {
    const name = fs.readdirSync(projectRoot).find(f => /^morgan-stanley-url-detector-.*\.tgz$/.test(f));
    if (!name) fail('no packed tarball found in project root. Run `npm pack` first.');
    return name;
}

const mode = process.argv[2];

if (mode === '--prepare') {
    const tgz = locateTarball();
    // Recreate the consumer project from scratch: an empty project whose only
    // dependency is the tarball under test — exactly a fresh consumer's resolve.
    fs.rmSync(consumerDir, { recursive: true, force: true });
    fs.mkdirSync(consumerDir);
    fs.writeFileSync(
        path.join(consumerDir, 'package.json'),
        JSON.stringify({ name: 'pack-verify-consumer', version: '1.0.0', private: true }, null, 2) + '\n',
    );
    process.stdout.write(`Prepared fresh consumer project: ${CONSUMER_DIR}/ (tarball: ${tgz})\n`);
    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `tgz=${tgz}\n`);
    }
} else if (mode === '--check') {
    let failed = false;

    // 1. The consumer install must have been clean (no `npm warn` / ERESOLVE lines).
    //    A fresh arborist resolve is exactly the scenario that surfaces per-grammar
    //    peer-dep warnings, so a regression there is caught here.
    const logPath = path.join(consumerDir, 'install.log');
    if (!fs.existsSync(logPath)) {
        fail(`consumer install log not found at ${logPath} — did the \`npm install\` step run?`);
    }
    const installLog = fs.readFileSync(logPath, 'utf8');
    const warnLines = installLog
        .split(/\r?\n/)
        .map(l => l.trimEnd())
        .filter(l => /npm warn|ERESOLVE/i.test(l));
    if (warnLines.length === 0) {
        process.stdout.write('\n(1) Install was clean (no `npm warn` / ERESOLVE lines)\n');
    } else {
        warnLines.forEach(l => process.stdout.write(`    | ${l}\n`));
        failed = true;
        process.stdout.write(`\nFAIL: consumer install emitted ${warnLines.length} warning line(s) — see above\n`);
    }

    // 2. Run the installed JS entry directly (not the .bin shim) so no
    //    platform-specific cmd/pwsh shim is involved; Node module resolution
    //    still finds the bundled grammar deps inside the installed package.
    const cliEntry = path.join(consumerDir, 'node_modules', '@morgan-stanley', 'url-detector', 'dist', 'cli.js');
    if (!fs.existsSync(cliEntry)) {
        failed = true;
        process.stdout.write(`\nFAIL: installed CLI entry not found at ${cliEntry}\n`);
    } else {
        const baseArgs = ['--scan', 'examples/test.js', '--results-only'];

        const byDefault = run(process.execPath, [cliEntry, ...baseArgs], projectRoot);
        const withComments = run(process.execPath, [cliEntry, ...baseArgs, '--include-comments'], projectRoot);
        if (byDefault.code !== 0) {
            failed = true;
            process.stdout.write(`\nFAIL: installed CLI (default) exited ${byDefault.code}\n${byDefault.log}\n`);
        }
        if (withComments.code !== 0) {
            failed = true;
            process.stdout.write(
                `\nFAIL: installed CLI (--include-comments) exited ${withComments.code}\n${withComments.log}\n`,
            );
        }

        process.stdout.write('\n(2) Functional detection on ' + process.platform + ':\n');
        const a1 = assertContains('non-comment URL found by default', byDefault.log, 'secure.bank.com', true);
        const a2 = assertContains('commented URL excluded by default', byDefault.log, 'old-api.example.com', false);
        const a3 = assertContains(
            'commented URL included with --include-comments',
            withComments.log,
            'old-api.example.com',
            true,
        );
        if (!a1) {
            failed = true;
            process.stdout.write('\nFAIL: expected non-comment URL was not detected (is the native parser active?)\n');
        }
        if (!a2) {
            failed = true;
            process.stdout.write(
                '\nFAIL: commented URL leaked into default output (native parser not filtering comments)\n',
            );
        }
        if (!a3) {
            failed = true;
            process.stdout.write(
                '\nFAIL: --include-comments did not surface the commented URL (native parser not active)\n',
            );
        }
    }

    // 3. Cleanup (best effort).
    try {
        fs.rmSync(consumerDir, { recursive: true, force: true });
    } catch {
        /* best-effort cleanup */
    }

    process.stdout.write(
        failed
            ? '\nRESULT: FAILED (see FAIL lines above)\n'
            : '\nRESULT: PASS — clean install + native detection on ' + process.platform + '\n',
    );
    process.exit(failed ? 1 : 0);
} else {
    fail('usage: node scripts/verify-pack.mjs --prepare | --check');
}
