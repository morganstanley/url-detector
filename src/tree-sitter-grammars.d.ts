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

// tree-sitter-c-sharp (0.23.5) and tree-sitter-css (0.25.0) are ESM grammar packages
// whose "types" entry is a directory ("bindings/node"), which does not resolve under
// this project's NodeNext module resolution. LanguageManager references every built-in
// grammar by a LITERAL import specifier (so `bun build --compile` can embed it), and we
// only ever consume the resolved module as a plain namespace, so an `any`-typed ambient
// declaration is sufficient for these two and keeps tsc from failing to resolve them.
declare module 'tree-sitter-c-sharp';
declare module 'tree-sitter-css';
