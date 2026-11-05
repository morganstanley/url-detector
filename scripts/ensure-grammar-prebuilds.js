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
 * Make the native prebuilds resolvable for `bun build --compile`.
 *
 * Two classes of grammar package break the compiled binary, and this script fixes
 * both before the bundle step:
 *
 * 1. Scoped packages (`@tree-sitter-grammars/*`) ship their native addon under a
 *    name that encodes the scoped package
 *    (e.g. `prebuilds/<platform>/@tree-sitter-grammars+tree-sitter-kotlin.node`) but
 *    reference the *unscoped* name (`tree-sitter-kotlin.node`) in the branch of their
 *    binding that targets Bun. This step copies the scoped file to the expected
 *    unscoped filename so the compiler can find and embed it.
 *
 * 2. A few grammar packages (currently `tree-sitter-c-sharp` and `tree-sitter-css`)
 *    are ESM and load their native addon with a top-level
 *    `await import(`${root}/prebuilds/<platform>-<arch>/<name>.node`)`) where `root`
 *    is computed from `import.meta.url` at runtime. `bun build --compile` cannot
 *    statically resolve that runtime path, so it embeds the addon at a location that
 *    does not match where the code looks at runtime, and the binary falls back to the
 *    regex scanner (silently). Rewriting these bindings to the CJS form used by the
 *    other grammars — `require("../../prebuilds/<platform>-<arch>/<name>.node")` —
 *    makes the path statically analyzable so the addon is embedded and loaded
 *    correctly, and flips the package to `"type": "commonjs"`.
 *
 * Both fixes are idempotent and safe to run repeatedly. Run it immediately before
 * `bun build --compile`.
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nodeModules = path.join(projectRoot, 'node_modules');

/** Recursively yields the full path of every `.node` file under `dir`. */
function* nativeFiles(dir) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return; // unreadable directory (e.g. a broken symlink) - skip
    }
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            yield* nativeFiles(full);
        } else if (entry.name.endsWith('.node')) {
            yield full;
        }
    }
}

if (!fs.existsSync(nodeModules)) {
    process.stdout.write('ensure-grammar-prebuilds: node_modules not present, nothing to do\n');
    process.exit(0);
}

let created = 0;
for (const file of nativeFiles(nodeModules)) {
    const base = path.basename(file);
    // Only scoped-package prebuilds use the `scope+name.node` encoding.
    const plus = base.indexOf('+');
    if (plus === -1) continue;
    const dir = path.dirname(file);
    // Only act inside a platform prebuild directory (win32/linux/darwin).
    if (!/(win32|linux|darwin)/.test(path.basename(dir))) continue;

    const unscoped = base.slice(plus + 1); // strip everything up to and including '+'
    const target = path.join(dir, unscoped);
    if (fs.existsSync(target)) continue;

    fs.copyFileSync(file, target);
    created++;
}

// Grammar packages that ship an ESM binding loading the native addon via a
// runtime-computed `await import()` path, which `bun build --compile` cannot
// statically embed. Each is normalized to the CJS form bun handles correctly.
const ESM_TLA_GRAMMARS = [
    { pkg: 'tree-sitter-c-sharp', node: 'tree-sitter-c-sharp.node' },
    { pkg: 'tree-sitter-css', node: 'tree-sitter-css.node' },
];

/**
 * Flips a grammar package's `"type"` to `"commonjs"` so its CJS binding is
 * interpreted as CommonJS. Surgical (string replace) to preserve the rest of the
 * package.json; a no-op if it is already `"commonjs"` or the file is absent.
 */
function ensureCommonjsType(pkgJson) {
    if (!fs.existsSync(pkgJson)) {
        return;
    }
    const raw = fs.readFileSync(pkgJson, 'utf8');
    if (/"type"\s*:\s*"commonjs"/.test(raw)) {
        return;
    }
    const updated = raw.replace(/"type"\s*:\s*"module"/, '"type": "commonjs"');
    if (updated !== raw) {
        fs.writeFileSync(pkgJson, updated);
    }
}

/**
 * Rewrites an ESM grammar binding to the CJS form used by the grammars that bun
 * embeds correctly. Idempotent: a binding already in the CJS form is left alone
 * (only its package type is re-checked).
 */
function ensureCjsBinding(pkg, nodeName) {
    const pkgDir = path.join(nodeModules, pkg);
    const bindingFile = path.join(pkgDir, 'bindings', 'node', 'index.js');
    const pkgJson = path.join(pkgDir, 'package.json');

    // Detect an ESM binding (uses import.meta.url / top-level await / export default).
    if (!fs.existsSync(bindingFile)) {
        return;
    }
    const src = fs.readFileSync(bindingFile, 'utf8');
    const alreadyCjs = /require\(`\.\.\/\.\.\/prebuilds\//.test(src) && !src.includes('import.meta.url');
    if (!alreadyCjs) {
        const cjs = [
            'const root = require("path").join(__dirname, "..", "..");',
            '',
            'module.exports =',
            '  typeof process.versions.bun === "string"',
            `    ? require(\`../../prebuilds/${'${process.platform}'}-${'${process.arch}'}/${nodeName}\`)`,
            '    : require("node-gyp-build")(root);',
            '',
            'try {',
            '  module.exports.nodeTypeInfo = require("../../src/node-types.json");',
            '} catch (_) {}',
            '',
        ].join('\n');
        fs.writeFileSync(bindingFile, cjs);
    }
    ensureCommonjsType(pkgJson);
}

let normalized = 0;
for (const { pkg, node } of ESM_TLA_GRAMMARS) {
    const bindingFile = path.join(nodeModules, pkg, 'bindings', 'node', 'index.js');
    if (!fs.existsSync(bindingFile)) {
        continue; // package not installed on this platform set - nothing to do
    }
    const before = fs.readFileSync(bindingFile, 'utf8');
    ensureCjsBinding(pkg, node);
    if (fs.readFileSync(bindingFile, 'utf8') !== before) {
        normalized++;
    }
}

process.stdout.write(
    `ensure-grammar-prebuilds: ensured ${created} native prebuild alias(es), ` +
        `normalized ${normalized} ESM grammar binding(s) to CJS\n`,
);
