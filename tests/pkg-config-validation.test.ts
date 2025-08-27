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

// @ts-nocheck
const { generatePkgConfig, getTreeSitterDependencies } = require('../scripts/generate-pkg-config.js');

describe('PKG Configuration Validation', () => {
  test('should find all tree-sitter dependencies', () => {
    const packageJson = require('../package.json');
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const expectedCount = Object.keys(allDeps).filter(name => 
      name.startsWith('tree-sitter') || name.includes('tree-sitter')
    ).length;
    
    const deps = getTreeSitterDependencies();
    
    expect(deps).toContain('tree-sitter');
    expect(deps).toContain('@tree-sitter-grammars/tree-sitter-kotlin');
    expect(deps.length).toBe(expectedCount);
  });

  test('should generate valid configurations for all platforms', () => {
    const platforms = ['linux', 'macos', 'win'];
    
    platforms.forEach(platform => {
      const config = generatePkgConfig(platform);
      
      expect(config).toHaveProperty('targets');
      expect(config).toHaveProperty('ignore');  
      expect(config).toHaveProperty('assets');
      
      expect(config.targets).toHaveLength(1);
      expect(config.assets).toContain('node_modules/node-gyp-build/**/*');
    });
  });


});
