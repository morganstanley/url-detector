import { defineConfig } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import js from '@eslint/js';
import licenseHeader from 'eslint-plugin-license-header';
import prettier from 'eslint-plugin-prettier';

// Define the license header
const LICENSE_HEADER = [
    '/*',
    ' * Morgan Stanley makes this available to you under the Apache License,',
    ' * Version 2.0 (the "License"). You may obtain a copy of the License at',
    ' *',
    ' *      http://www.apache.org/licenses/LICENSE-2.0.',
    ' *',
    ' * See the NOTICE file distributed with this work for additional information',
    ' * regarding copyright ownership. Unless required by applicable law or agreed',
    ' * to in writing, software distributed under the License is distributed on an',
    ' * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express',
    ' * or implied. See the License for the specific language governing permissions',
    ' * and limitations under the License.',
    ' */',
];

export default defineConfig([
    {
        ignores: ['node_modules', 'dist', 'examples', 'coverage'],
    },
    {
        ...js.configs.recommended,
        files: ['**/*.{js,cjs,mjs}'],
        languageOptions: {
            ...js.configs.recommended.languageOptions,
            globals: {
                ...globals.node,
            },
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
    },
    ...typescriptEslint.configs['flat/recommended'].map(config => ({
        ...config,
        files: config.files ?? ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    })),
    {
        files: ['**/*.{js,cjs,mjs,ts}'],
        plugins: {
            prettier: prettier,
        },

        languageOptions: {
            globals: {
                ...globals.node,
            },
            ecmaVersion: 'latest',
            sourceType: 'module',
        },

        rules: {
            'prettier/prettier': [
                'error',
                {
                    trailingComma: 'all',
                    tabWidth: 4,
                    singleQuote: true,
                    printWidth: 120,
                    endOfLine: 'auto',
                    arrowParens: 'avoid',
                },
            ],
            // Prevent console usage in all code by default
            'no-console': 'error',
        },
    },
    {
        files: ['scripts/**/*.js'],
        rules: {
            'no-console': 'off',
        },
    },
    {
        files: ['src/cli.ts', 'src/outputFormatter.ts', 'tests/pkg-config-validation.test.ts'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: ['tests/**/*.ts'],
        rules: {
            '@typescript-eslint/ban-ts-comment': 'off',
        },
    },
    // Add license header check for TypeScript files
    {
        files: ['**/*.ts'],
        plugins: {
            'license-header': licenseHeader,
        },
        rules: {
            'license-header/header': ['error', LICENSE_HEADER],
        },
    },
]);
