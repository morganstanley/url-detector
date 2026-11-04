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

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { PKG_TARGET_TO_PREBUILD } from './platforms.js';

// This is a CLI build script that emits its config JSON to stdout (piped to a
// file by the pkg:* npm scripts) and usage errors to stderr, so console is the
// correct idiom here — the no-console rule is aimed at shipped library code.
/* eslint-disable no-console */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json to get dependencies
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

// Extract tree-sitter dependencies
export function getTreeSitterDependencies() {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const treeSitterDeps = [];

    for (const name of Object.keys(deps)) {
        if (name.startsWith('tree-sitter') || name.includes('tree-sitter')) {
            treeSitterDeps.push(name);
        }
    }

    return treeSitterDeps.sort();
}

// Generate platform-specific assets for tree-sitter packages
function generateTreeSitterAssets(platform) {
    const deps = getTreeSitterDependencies();
    const platformDir = PKG_TARGET_TO_PREBUILD[platform];
    const assets = [];

    for (const dep of deps) {
        const basePath = `node_modules/${dep}`;

        // Handle special case for tree-sitter main package
        if (dep === 'tree-sitter') {
            assets.push(
                `${basePath}/prebuilds/${platformDir}/**/*`,
                `${basePath}/index.js`,
                `${basePath}/package.json`,
            );
            continue;
        }

        // Standard pattern for most tree-sitter packages
        let nodeFileName;
        if (dep.startsWith('@tree-sitter-grammars/')) {
            // Scoped packages use: @scope+package-name.node
            nodeFileName = dep.replace('/', '+') + '.node';
        } else {
            // Regular packages use: package-name.node (but c-sharp stays as c-sharp, not c_sharp)
            nodeFileName = dep + '.node';
        }

        assets.push(
            `${basePath}/prebuilds/${platformDir}/${nodeFileName}`,
            `${basePath}/bindings/node/*.js`,
            `${basePath}/index.js`,
            `${basePath}/package.json`,
        );
    }

    return assets;
}

// Generate base pkg configuration (common parts)
function getBasePkgConfig(platform) {
    const target = `node22-${platform === 'win' ? 'win-x64' : platform === 'macos' ? 'macos-x64' : 'linux-x64'}`;

    return {
        targets: [target],
        ignore: [
            '**/vendor/**',
            '**/node-addon-api/**',
            '**/test/**',
            '**/tests/**',
            '**/example/**',
            '**/examples/**',
            '**/docs/**',
            '**/doc/**',
            '**/.github/**',
            '**/grammar.js',
            '**/Makefile',
            '**/CMakeLists.txt',
            '**/*.gyp',
            '**/*.gypi',
            '**/*.cc',
            '**/*.cpp',
            '**/*.h',
            '**/*.hpp',
            '**/*.c',
            '**/*.md',
            '**/*.txt',
            '**/*.wasm',
            '**/*.a',
            '**/*.lib',
            '**/package-lock.json',
            '**/yarn.lock',
            '**/.gitignore',
            '**/.npmignore',
            '**/LICENSE*',
            '**/CHANGELOG*',
            '**/README*',
            '**/queries/**',
            // Exclude other platform prebuilds to reduce size
            '**/prebuilds/darwin-arm64/**',
            '**/prebuilds/linux-arm64/**',
            '**/prebuilds/win32-arm64/**',
            ...(platform !== 'linux' ? ['**/prebuilds/linux-x64/**'] : []),
            ...(platform !== 'macos' ? ['**/prebuilds/darwin-x64/**'] : []),
            ...(platform !== 'win' ? ['**/prebuilds/win32-x64/**'] : []),
        ],
    };
}

// Generate full pkg configuration for a platform
export function generatePkgConfig(platform) {
    const config = getBasePkgConfig(platform);

    // Add common non-tree-sitter assets
    const commonAssets = ['node_modules/node-gyp-build/**/*', 'node_modules/cli-table3/**/*'];

    const treeSitterAssets = generateTreeSitterAssets(platform);

    config.assets = [...commonAssets, ...treeSitterAssets];

    return config;
}

// Main function
function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!['linux', 'macos', 'win'].includes(command)) {
        console.error('Usage: node generate-pkg-config.js <linux|macos|win>');
        process.exit(1);
    }

    const config = generatePkgConfig(command);
    console.log(JSON.stringify(config, null, 2));
}

// Only run if this file is executed directly (not imported)
const isMainModule = (() => {
    if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
        return true;
    }
    return false;
})();

if (isMainModule) {
    main();
}
