# Copilot & AI Agent Instructions for `url-detector`

## Project Overview
- **Purpose:** Scans source code and text files for URLs using Tree-sitter AST parsing, supporting 20+ languages. Finds URLs in strings, comments, and other contexts with high accuracy.
- **Core Components:**
  - `src/urlDetector.ts`: Main URL detection logic
  - `src/languageManager.ts`: Handles language detection, Tree-sitter parser loading, and extension mapping
  - `src/cli.ts`: Command-line interface, defines all CLI options
  - `src/urlFilter.ts`: Filtering and validation of detected URLs
  - `src/outputFormatter.ts`: Output formatting (table, json, csv)
  - `src/options.ts`: Option parsing and config
  - `src/logger.ts`: Logging abstraction
  - `tests/`: Jest-based tests for all major modules
  - `examples/`: Realistic code samples in many languages for test/validation

## Developer Workflows
- **Install dependencies:**
  - Use `npm install --legacy-peer-deps` (required for Tree-sitter peer deps)
- **Build:**
  - `npm run build` (TypeScript → JavaScript)
  - `npm run clean` (remove build artifacts)
- **Test:**
  - `npm test` (all tests)
  - `npm run test:watch` (watch mode)
  - `npm run test:coverage` (with coverage)
- **Lint:**
  - `npm run lint` (check)
  - `npm run lint:fix` (auto-fix)

## Key Patterns & Conventions
- **Language/Parser Management:**
  - All language support is centralized in `LanguageManager` (`src/languageManager.ts`).
  - Tree-sitter grammars are dynamically loaded per language; see `languageConfigs` array for supported languages/extensions.
- **CLI Option Sync:**
  - CLI options are defined in `src/cli.ts` and must be documented in the README table. Tests in `tests/documentation.test.ts` enforce this sync.
- **Filtering:**
  - Domain and context filtering is handled in `urlFilter.ts` and via CLI/programmatic options.
- **Output:**
  - Output format is selected via CLI/programmatic option --format with values (`table`, `json`, `csv`).
- **Examples:**
  - Use files in `examples/` to validate detection across languages and edge cases.  This can be done with running with arguments --scan examples/**/*.  There must be an example for every language grammar registered or else tests will fail.

## Integration & CI
- **CI/CD:**
  - Typical usage: `url-detector --scan "**/*" --exclude "**/node_modules" --fail-on-error`
  - Quiet/results-only modes for CI logs: `--quiet`, `--results-only`
- **Programmatic API:**
  - Import `URLDetector` and `LanguageManager` from the package for custom workflows.

## Project-Specific Notes
- **Peer Dependency Issues:** Always use `--legacy-peer-deps` with npm install.  Only allow upgrades of tree-sitter package if it includes prebuilts and you have verified compatibility.  Currently 0.22.4 is the latest release that includes prebuilts, 0.25.0 does not include prebuilts and will not work.
- **Documentation Sync:** Update both CLI code and README when adding options; tests will fail if out of sync.

---

For further details, see `README.md` and `CONTRIBUTING.md`. If any section is unclear or missing, please provide feedback for improvement.
