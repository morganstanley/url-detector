import { defineConfig } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import licenseHeader from 'eslint-plugin-license-header';
import prettier from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

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
        extends: compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'),

        plugins: {
            '@typescript-eslint': typescriptEslint,
            prettier: prettier,
        },

        languageOptions: {
            globals: {
                ...globals.node,
            },

            parser: tsParser,
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
            // Catch unused variables
            '@typescript-eslint/no-unused-vars': 'error',
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
