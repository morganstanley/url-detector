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

// Canonical list of prebuilt-binary platforms (OS + architecture) that the
// tree-sitter ecosystem ships inside its npm tarballs.
// Used by scripts/generate-pkg-config.js and tests/prebuilds.test.ts.
const PREBUILD_PLATFORMS = ['win32-x64', 'win32-arm64', 'linux-x64', 'linux-arm64', 'darwin-x64', 'darwin-arm64'];

// Mapping from @yao-pkg/pkg target names to prebuild platform directories.
const PKG_TARGET_TO_PREBUILD = {
    linux: 'linux-x64',
    macos: 'darwin-x64',
    win: 'win32-x64',
};

export { PREBUILD_PLATFORMS, PKG_TARGET_TO_PREBUILD };
