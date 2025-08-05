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

import { LanguageManager } from '../src/languageManager';

describe('LanguageManager', () => {
    let manager: LanguageManager;

    beforeEach(() => {
        manager = new LanguageManager();
    });

    test('should detect language from extension', () => {
        expect(manager.getLanguage('.js')).toBeDefined();
        expect(manager.getLanguage('.ts')).toBeDefined();
        expect(manager.getLanguage('.java')).toBeDefined();
        expect(manager.getLanguage('.cpp')).toBeDefined();
        expect(manager.getLanguage('.cs')).toBeDefined();
        expect(manager.getLanguage('.html')).toBeDefined();
        expect(manager.getLanguage('.css')).toBeDefined();
        expect(manager.getLanguage('.scala')).toBeDefined();
        expect(manager.getLanguage('.sc')).toBeDefined();
    });

    test('should return undefined for unsupported extensions', () => {
        expect(manager.getLanguage('.xyz')).toBeUndefined();
        expect(manager.getLanguage('.unknown')).toBeUndefined();
    });

    test('should handle case insensitive lookup', () => {
        expect(manager.getLanguage('JAVASCRIPT')).toBeDefined();
        expect(manager.getLanguage('JavaScript')).toBeDefined();
        expect(manager.getLanguage('javascript')).toBeDefined();
    });
});
