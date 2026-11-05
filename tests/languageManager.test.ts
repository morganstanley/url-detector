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

import { LanguageManager, LanguageConfig } from '../src/languageManager';
import { Logger } from '../src/logger';

function captureWarnings(): { logger: Logger; warnings: string[] } {
    const warnings: string[] = [];
    const logger: Logger = {
        log: () => {},
        info: () => {},
        warn: (message: string) => {
            warnings.push(message);
        },
        error: () => {},
        debug: () => {},
    };
    return { logger, warnings };
}

describe('LanguageManager', () => {
    let manager: LanguageManager;

    beforeEach(() => {
        manager = new LanguageManager();
    });

    test('should detect language from extension', async () => {
        expect(await manager.getLanguage('.js')).toBeDefined();
        expect(await manager.getLanguage('.ts')).toBeDefined();
        expect(await manager.getLanguage('.java')).toBeDefined();
        expect(await manager.getLanguage('.cpp')).toBeDefined();
        expect(await manager.getLanguage('.cs')).toBeDefined();
        expect(await manager.getLanguage('.html')).toBeDefined();
        expect(await manager.getLanguage('.css')).toBeDefined();
        expect(await manager.getLanguage('.scala')).toBeDefined();
        expect(await manager.getLanguage('.sc')).toBeDefined();
    });

    test('should return undefined for unsupported extensions', async () => {
        expect(await manager.getLanguage('.xyz')).toBeUndefined();
        expect(await manager.getLanguage('.unknown')).toBeUndefined();
    });

    test('should handle case insensitive lookup', async () => {
        expect(await manager.getLanguage('JAVASCRIPT')).toBeDefined();
        expect(await manager.getLanguage('JavaScript')).toBeDefined();
        expect(await manager.getLanguage('javascript')).toBeDefined();
    });

    describe('module allowlist', () => {
        test('should skip a path-like custom module and warn instead of loading it', async () => {
            const { logger, warnings } = captureWarnings();
            const customLanguages: LanguageConfig[] = [
                { name: 'evil', module: '../../etc/passwd', extensions: ['.evil'] },
            ];

            const customManager = new LanguageManager(logger, customLanguages);

            await expect(customManager.getLanguage('.evil')).resolves.toBeUndefined();
            expect(warnings.some(w => w.includes('not an approved'))).toBe(true);
        });

        test('should skip an absolute-path custom module and warn instead of loading it', async () => {
            const { logger, warnings } = captureWarnings();
            const customLanguages: LanguageConfig[] = [{ name: 'evil', module: '/etc/passwd', extensions: ['.evil'] }];

            const customManager = new LanguageManager(logger, customLanguages);

            await expect(customManager.getLanguage('.evil')).resolves.toBeUndefined();
            expect(warnings.some(w => w.includes('not an approved'))).toBe(true);
        });

        test('should allow a properly-named grammar package through validation, even if not installed', async () => {
            const { logger, warnings } = captureWarnings();
            const customLanguages: LanguageConfig[] = [
                { name: 'rust', module: 'tree-sitter-rust', extensions: ['.rs'] },
            ];

            const customManager = new LanguageManager(logger, customLanguages);

            // "tree-sitter-rust" is not installed in this project, so loading fails - but it
            // must fail at import() (module not found), never at the allowlist check itself.
            await expect(customManager.getLanguage('.rs')).resolves.toBeUndefined();
            expect(warnings.some(w => w.includes('not an approved'))).toBe(false);
            expect(warnings.some(w => w.includes('Failed to load'))).toBe(true);
        });

        test('should allow scoped grammar packages using npm-valid dot or underscore in the scope name', async () => {
            const { logger, warnings } = captureWarnings();
            const customLanguages: LanguageConfig[] = [
                { name: 'foo', module: '@my.scope/tree-sitter-foo', extensions: ['.foo'] },
                { name: 'bar', module: '@my_scope/tree-sitter-bar', extensions: ['.bar'] },
            ];

            const customManager = new LanguageManager(logger, customLanguages);

            // Neither package is installed, so loading fails - but at import(), not at the
            // allowlist check. npm allows '.' and '_' in scope names outside the leading
            // position, so these must not be rejected as "not an approved" module name.
            await customManager.getLanguage('.foo');
            await customManager.getLanguage('.bar');
            expect(warnings.some(w => w.includes('not an approved'))).toBe(false);
            expect(warnings.filter(w => w.includes('Failed to load'))).toHaveLength(2);
        });

        test('addLanguage should skip a disallowed module and warn', async () => {
            const { logger, warnings } = captureWarnings();
            const customManager = new LanguageManager(logger);

            customManager.addLanguage({ name: 'evil2', module: '../../etc/shadow', extensions: ['.evil2'] });

            await expect(customManager.getLanguage('.evil2')).resolves.toBeUndefined();
            expect(warnings.some(w => w.includes('not an approved'))).toBe(true);
        });
    });

    describe('customLanguages isolation', () => {
        test('should not be affected by mutating the customLanguages array or its objects after construction', () => {
            const customLanguages: LanguageConfig[] = [
                { name: 'rust', module: 'tree-sitter-rust', extensions: ['.rs'] },
            ];

            const customManager = new LanguageManager(undefined, customLanguages);

            // Mutate the caller's original config object and array after handing them to the manager.
            customLanguages[0].module = '../../etc/passwd';
            customLanguages[0].extensions.push('.hacked');
            customLanguages.push({ name: 'sneaky', module: '../../etc/shadow', extensions: ['.sneaky'] });

            const configs = customManager.getLanguageConfigs();
            expect(configs).toHaveLength(1);
            expect(configs[0].module).toBe('tree-sitter-rust');
            expect(configs[0].extensions).toEqual(['.rs']);
        });
    });
});
