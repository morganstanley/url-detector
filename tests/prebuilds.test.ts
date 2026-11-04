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
import { fileURLToPath } from 'url';
import { PREBUILD_PLATFORMS } from '../scripts/platforms.js';

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Returns the list of all tree-sitter packages (from dependencies + devDependencies).
 */
function getTreeSitterPackages(): string[] {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
    };
    const packages = new Set<string>();

    for (const name of Object.keys(packageJson.dependencies ?? {})) {
        if (name.startsWith('tree-sitter') || name.includes('tree-sitter')) {
            packages.add(name);
        }
    }
    for (const name of Object.keys(packageJson.devDependencies ?? {})) {
        if (name.startsWith('tree-sitter') || name.includes('tree-sitter')) {
            packages.add(name);
        }
    }

    return [...packages].sort();
}

/**
 * Checks whether a given tree-sitter package has a non-empty prebuilds directory
 * for the specified platform.
 */
function hasPrebuilds(packageName: string, platform: string): boolean {
    const prebuildsPath = path.join(projectRoot, 'node_modules', packageName, 'prebuilds', platform);
    if (!fs.existsSync(prebuildsPath)) return false;
    try {
        return fs.readdirSync(prebuildsPath).length > 0;
    } catch {
        return false;
    }
}

/**
 * Returns a list of missing prebuild descriptions (empty array if all are present).
 */
function checkPrebuilds(): string[] {
    const packages = getTreeSitterPackages();
    const failures: string[] = [];

    for (const pkg of packages) {
        for (const platform of PREBUILD_PLATFORMS) {
            if (!hasPrebuilds(pkg, platform)) {
                failures.push(`${pkg} is missing a prebuild for ${platform}`);
            }
        }
    }

    return failures;
}

describe('Prebuilds Verification', () => {
    test('should detect at least one tree-sitter package', () => {
        const packages = getTreeSitterPackages();
        expect(packages.length).toBeGreaterThan(0);
        expect(packages).toContain('tree-sitter');
    });

    test('all tree-sitter packages should have prebuilds for all supported platforms', () => {
        const failures = checkPrebuilds();
        expect(failures).toEqual([]);
    });

    test('should check all 6 prebuild platforms', () => {
        expect(PREBUILD_PLATFORMS).toHaveLength(6);
        expect(PREBUILD_PLATFORMS).toContain('win32-x64');
        expect(PREBUILD_PLATFORMS).toContain('linux-x64');
        expect(PREBUILD_PLATFORMS).toContain('darwin-x64');
    });
});
