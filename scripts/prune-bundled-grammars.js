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
 * Prunes the bundled Tree-sitter grammar packages in `node_modules/` down to just
 * what is needed to RUN the parsers, so the published tarball ships the grammar
 * code and every prebuilt native binary in a single, compact, install-script-free
 * package (see issue #217, PR 2).
 *
 * How it fits together:
 *   - `bundleDependencies` in package.json tells npm to pack these grammar packages
 *     (and their transitive runtime dep, `node-gyp-build`) into the tarball instead
 *     of fetching them from the registry at install time.
 *   - npm packs each bundled dependency from the local `node_modules/`, honoring that
 *     dependency's own `files` field — and the grammar packages list their build
 *     sources (`src/**`, `vendor/**`, `*.wasm`, `grammar.js`, …) in `files`. So to
 *     keep the tarball small we physically remove those build-only artifacts here.
 *   - This script runs from the `prepack` hook (i.e. before `npm pack` / `npm publish`),
 *     so the pruned tree is exactly what gets packed.
 *
 * What is kept (runtime-only surface):
 *   - package.json (name/version/main/type)
 *   - the JS entry: `index.js` (tree-sitter core) or `bindings/node/*` (grammars)
 *   - `prebuilds/**` — the native `.node` addon for each of the 6 supported platforms
 *   - `*.d.ts` type declarations and small JSON such as `src/node-types.json`
 *   - LICENSE / README
 *
 * What is removed (build-only, never loaded at runtime):
 *   - C/C++ sources & headers, `vendor/`, `.wasm`, `grammar.js`, `binding.gyp`,
 *     `tree-sitter.json`, `queries/`, `test/`, `examples/`, `docs/`
 *   - `node-addon-api` (a build-time C++ header library; the runtime loader is
 *     `node-gyp-build`, which is kept)
 *   - lifecycle scripts (`install` / `preinstall` / `postinstall` / `prepare`) from
 *     each bundled package.json, so no install script runs on the consumer's machine.
 *   - the advisory `tree-sitter` peer dependency (and its `peerDependenciesMeta`)
 *     from each bundled package.json. The grammar never loads `tree-sitter` itself —
 *     the app pairs it with the pinned `tree-sitter` at runtime — so the peer entry is
 *     only a compatibility declaration. Its `^0.2x` range does not cover our pinned
 *     `tree-sitter`, and on a consumer's fresh `npm install` / `npx` that mismatch
 *     surfaces as one `ERESOLVE` peer warning per grammar. Dropping the entry removes
 *     the noise without changing resolution or runtime behavior.
 *
 * The script is idempotent and only ever touches `node_modules/`; running `npm ci`
 * (or `npm install`) afterwards restores the full, un-pruned tree.
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nodeModules = path.join(projectRoot, 'node_modules');
const packageJson = path.join(projectRoot, 'package.json');

/** File-name patterns (or exact names) that are build-only and safe to drop. */
const BUILD_ONLY_FILE_RE =
    /\.(wasm|gyp|gypi)$|^grammar\.js$|^binding\.gyp$|^tree-sitter\.json$|\.(c|cc|cpp|cxx|h|hpp|hh)$|^\.npmignore$/i;
/** Directory names (at any depth under a grammar package) that are build-only. */
const BUILD_ONLY_DIR_RE = /^(vendor|queries|test|tests|examples|docs)$/i;
/** Lifecycle scripts to strip from bundled package.json files (no install scripts). */
const LIFECYCLE_SCRIPTS = ['preinstall', 'install', 'postinstall', 'prepare'];

let removedFiles = 0;
let removedBytes = 0;
let prunedPackages = 0;

/** Returns the size of a file in bytes, or 0 if it is unreadable. */
function fileSize(file) {
    try {
        return fs.statSync(file).size;
    } catch {
        return 0;
    }
}

/**
 * Recursively removes build-only files (and empty build-only directories) under
 * `dir`. Returns the number of files removed.
 */
function pruneDir(dir) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return 0; // unreadable — skip
    }

    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (BUILD_ONLY_DIR_RE.test(entry.name)) {
                removeTree(full);
                continue;
            }
            pruneDir(full);
            // Drop the directory if it is now empty (e.g. src/ holding only C files).
            dropIfEmpty(full);
        } else if (BUILD_ONLY_FILE_RE.test(entry.name)) {
            removedBytes += fileSize(full);
            fs.rmSync(full, { force: true });
            removedFiles++;
        }
    }
    return removedFiles;
}

/** Deletes a directory tree, tolerating missing/unreadable paths. */
function removeTree(full) {
    try {
        removedBytes += dirSize(full);
        fs.rmSync(full, { recursive: true, force: true });
    } catch {
        /* ignore */
    }
}

/** Deletes `dir` if it contains no entries. */
function dropIfEmpty(dir) {
    try {
        if (fs.readdirSync(dir).length === 0) {
            fs.rmdirSync(dir);
        }
    } catch {
        /* ignore */
    }
}

/** Sums the size of every file under `dir`. */
function dirSize(dir) {
    let total = 0;
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return 0;
    }
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        total += entry.isDirectory() ? dirSize(full) : fileSize(full);
    }
    return total;
}

/**
 * Collects the directory of every Tree-sitter package instance under `root`
 * (top-level and nested, e.g. `tree-sitter-cpp/node_modules/tree-sitter-c`), by
 * locating each package.json whose `name` is a Tree-sitter package. This covers
 * version-nested instances that npm installs alongside a parent grammar.
 */
function collectTreeSitterInstances(root) {
    const instances = [];
    const stack = [root];
    while (stack.length > 0) {
        const dir = stack.pop();
        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            continue;
        }
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (!entry.isDirectory()) {
                continue;
            }
            const pkgJson = path.join(full, 'package.json');
            if (fs.existsSync(pkgJson)) {
                try {
                    const name = JSON.parse(fs.readFileSync(pkgJson, 'utf8')).name ?? '';
                    if (name.includes('tree-sitter')) {
                        instances.push(full);
                        continue; // a package dir: don't descend into it for *more* packages
                    }
                } catch {
                    /* malformed package.json — treat as a plain dir */
                }
            }
            stack.push(full);
        }
    }
    return instances;
}

/**
 * Removes any lifecycle scripts from a package.json in place. A no-op if the file
 * is absent or has none of them.
 */
function stripLifecycleScripts(pkgJson) {
    if (!fs.existsSync(pkgJson)) {
        return;
    }
    let raw;
    try {
        raw = fs.readFileSync(pkgJson, 'utf8');
    } catch {
        return;
    }
    const pkg = JSON.parse(raw);
    if (!pkg.scripts) {
        return;
    }
    let changed = false;
    for (const script of LIFECYCLE_SCRIPTS) {
        if (Object.prototype.hasOwnProperty.call(pkg.scripts, script)) {
            delete pkg.scripts[script];
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(pkgJson, JSON.stringify(pkg, null, 2) + '\n');
    }
}

/**
 * Removes the advisory `tree-sitter` peer dependency (and its
 * `peerDependenciesMeta` entry) from a bundled grammar's package.json. See the
 * module docblock for why this is safe. Surgical: only the `tree-sitter` entry is
 * removed (both the `tree-sitter` and `tree_sitter` spellings some grammars use);
 * any other peer dependency is left intact.
 */
function stripPeerTreeSitter(pkgJson) {
    if (!fs.existsSync(pkgJson)) {
        return;
    }
    let raw;
    try {
        raw = fs.readFileSync(pkgJson, 'utf8');
    } catch {
        return;
    }
    const pkg = JSON.parse(raw);
    let changed = false;
    for (const field of ['peerDependencies', 'peerDependenciesMeta']) {
        const obj = pkg[field];
        if (
            obj &&
            (Object.prototype.hasOwnProperty.call(obj, 'tree-sitter') ||
                Object.prototype.hasOwnProperty.call(obj, 'tree_sitter'))
        ) {
            delete obj['tree-sitter'];
            delete obj['tree_sitter'];
            if (Object.keys(obj).length === 0) {
                delete pkg[field];
            }
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(pkgJson, JSON.stringify(pkg, null, 2) + '\n');
    }
}

function main() {
    if (!fs.existsSync(nodeModules)) {
        process.stdout.write('prune-bundled-grammars: node_modules not present, nothing to do\n');
        return;
    }

    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    // Direct dependencies whose name is a Tree-sitter core/grammar package.
    const deps = Object.keys(pkg.dependencies ?? {}).filter(name => name.includes('tree-sitter'));

    for (const name of deps) {
        const pkgDir = path.join(nodeModules, name);
        if (!fs.existsSync(pkgDir)) {
            continue; // not installed on this platform set — nothing to prune
        }
        // pruneDir is recursive, so a single pass over the root also removes the
        // build artifacts of any version-nested Tree-sitter instance it contains
        // (e.g. tree-sitter-cpp/node_modules/tree-sitter-c).
        pruneDir(pkgDir);
        // Normalize the manifest of every instance (the root plus any nested ones)
        // so no bundled grammar — top-level or nested — ships an install script, and
        // the advisory tree-sitter peer dependency does not surface as ERESOLVE
        // warnings when a consumer installs the package.
        for (const inst of [pkgDir, ...collectTreeSitterInstances(pkgDir)]) {
            const pkgJson = path.join(inst, 'package.json');
            stripLifecycleScripts(pkgJson);
            stripPeerTreeSitter(pkgJson);
            prunedPackages++;
        }
    }

    // node-addon-api is a build-time C++ header library only; the runtime loader
    // (node-gyp-build) is a separate package that we keep.
    const napi = path.join(nodeModules, 'node-addon-api');
    if (fs.existsSync(napi)) {
        removeTree(napi);
        process.stdout.write('prune-bundled-grammars: removed node-addon-api (build-time only)\n');
    }

    process.stdout.write(
        `prune-bundled-grammars: pruned ${prunedPackages} grammar package(s), ` +
            `removed ${removedFiles} build-only file(s) (~${(removedBytes / 1024 / 1024).toFixed(1)} MB)\n`,
    );
}

main();
