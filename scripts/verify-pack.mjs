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
 * Verifies the packed tarball the way a fresh consumer experiences it, on THIS
 * platform. Written in cross-platform Node so the identical script can run on
 * the ubuntu / windows / macos CI matrix without shell-quoting drift.
 *
 * What it proves (and why each matters):
 *   1. Clean install — `npm install <tgz>` in an empty directory does a fresh
 *      arborist resolve, which is exactly the scenario that surfaces the
 *      per-grammar `ERESOLVE` peer warnings. We fail if any `ERESOLVE` or
 *      `npm warn` line is emitted, so a peer-dep regression is caught in CI.
 *   2. Native binding loads — the installed CLI is executed; because cli.ts
 *      eagerly imports the tree-sitter Parser, a missing/corrupt prebuild for
 *      this OS throws at load time. So the very act of running it proves the
 *      platform's native addon is present and loadable.
 *   3. Real detection, not the regex fallback — we scan `examples/test.js` and
 *      assert a commented-out URL is excluded by default but included with
 *      `--include-comments`. That toggle requires the AST, so it can only pass
 *      if the native parser is actually driving detection.
 *
 * Exits 0 only if all three hold; prints the offending output and exits 1 otherwise.
 * Expects the tarball to already exist in the project root (run `npm pack` first).
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// `npm` on Windows is a `.cmd` shim, which Node's no-shell spawn cannot execute
// — `spawnSync('npm')` fails ENOENT on the GitHub runner even though `npm ci`
// in the same job works (that goes through pwsh, not Node's process spawn).
// Run the npm CLI entry that ships inside the Node distribution instead — the
// same file `npm.cmd` delegates to — with this same node binary. One
// deterministic path; no PATH / PATHEXT / `.cmd` resolution involved.
const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
if (!fs.existsSync(npmCli)) {
    process.stdout.write(`FAIL: npm CLI entry not found at ${npmCli} (expected inside the Node distribution)\n`);
    process.exit(1);
}

/**
 * Runs a command, always returning { code, log } where log is stdout+stderr.
 * No shell is used, so arguments reach the child process verbatim (no quoting
 * or escaping surprises). The installed CLI is also run directly with this
 * same node binary.
 */
function run(cmd, args, cwd) {
    const res = spawnSync(cmd, args, { cwd, encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 });
    const spawnErr = res.error ? `\n[spawn error] ${res.error.message}` : '';
    return { code: res.status, log: `${res.stdout ?? ''}${res.stderr ?? ''}${spawnErr}` };
}

/** Prints a labelled block and returns true if `needle` is in `haystack`. */
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

let failed = false;
function fail(msg) {
    failed = true;
    process.stdout.write(`\nFAIL: ${msg}\n`);
}

// --- 1. Locate the tarball -----------------------------------------------------
const tgzName = fs.readdirSync(projectRoot).find(f => /^morgan-stanley-url-detector-.*\.tgz$/.test(f));
if (!tgzName) {
    fail('no packed tarball found in project root. Run `npm pack` first.');
    process.exit(1);
}
const tgzPath = path.join(projectRoot, tgzName);
process.stdout.write(`\nVerifying packed tarball: ${tgzName}\n`);

// --- 2. Clean consumer install (reproduces the fresh-resolve scenario) --------
const consumer = fs.mkdtempSync(path.join(os.tmpdir(), 'ud-pack-verify-'));
fs.writeFileSync(
    path.join(consumer, 'package.json'),
    JSON.stringify({ name: 'ud-pack-verify', version: '1.0.0', private: true }, null, 2) + '\n',
);

process.stdout.write('\n(2) Installing the tarball into a fresh consumer directory...\n');
const install = run(
    process.execPath,
    [npmCli, 'install', tgzPath, '--no-audit', '--no-fund', '--loglevel=warn'],
    consumer,
);
if (install.code !== 0) {
    fail(`npm install exited ${install.code}\n${install.log}`);
}

// --- 3. Assert the install emitted no ERESOLVE / warnings ---------------------
const warnLines = install.log
    .split('\n')
    .map(l => l.trimEnd())
    .filter(l => /npm warn|ERESOLVE/i.test(l));
if (warnLines.length === 0) {
    process.stdout.write('  [PASS] install was clean (no `npm warn` / ERESOLVE lines)\n');
} else {
    warnLines.forEach(l => process.stdout.write(`    | ${l}\n`));
    fail(`consumer install emitted ${warnLines.length} warning line(s) — see above`);
}

// --- 4. Run the installed CLI against a real example --------------------------
// Resolve the installed JS entry directly (not the .bin shim) so we avoid
// platform-specific cmd/pwsh shims; Node module resolution still finds the
// bundled grammar deps inside the installed package's own node_modules.
const cliEntry = path.join(consumer, 'node_modules', '@morgan-stanley', 'url-detector', 'dist', 'cli.js');
if (!fs.existsSync(cliEntry)) {
    fail(`installed CLI entry not found at ${cliEntry}`);
} else {
    const baseArgs = ['--scan', 'examples/test.js', '--results-only'];

    const byDefault = run(process.execPath, [cliEntry, ...baseArgs], projectRoot);
    const withComments = run(process.execPath, [cliEntry, ...baseArgs, '--include-comments'], projectRoot);
    if (byDefault.code !== 0) {
        fail(`installed CLI (default) exited ${byDefault.code}\n${byDefault.log}`);
    }
    if (withComments.code !== 0) {
        fail(`installed CLI (--include-comments) exited ${withComments.code}\n${withComments.log}`);
    }

    process.stdout.write('\n(4) Functional detection on ' + process.platform + ':\n');
    const a1 = assertContains('non-comment URL found by default', byDefault.log, 'secure.bank.com', true);
    const a2 = assertContains('commented URL excluded by default', byDefault.log, 'old-api.example.com', false);
    const a3 = assertContains(
        'commented URL included with --include-comments',
        withComments.log,
        'old-api.example.com',
        true,
    );
    if (!a1) fail('expected non-comment URL was not detected (is the native parser active?)');
    if (!a2) fail('commented URL leaked into default output (native parser not filtering comments)');
    if (!a3) fail('--include-comments did not surface the commented URL (native parser not active)');
}

// --- Cleanup ------------------------------------------------------------------
try {
    fs.rmSync(consumer, { recursive: true, force: true });
} catch {
    /* best-effort cleanup */
}

process.stdout.write(
    failed
        ? '\nRESULT: FAILED (see FAIL lines above)\n'
        : '\nRESULT: PASS — clean install + native detection on ' + process.platform + '\n',
);
process.exit(failed ? 1 : 0);
