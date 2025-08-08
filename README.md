# URL Detector

![Lifecycle Incubating](https://badgen.net/badge/Lifecycle/Incubating/yellow)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CI](https://github.com/morganstanley/url-detector/actions/workflows/continuous-integration.yml/badge.svg)](https://github.com/morganstanley/url-detector/actions/workflows/continuous-integration.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/morganstanley/url-detector/badge)](https://securityscorecards.dev/viewer/?uri=github.com/morganstanley/url-detector)

A URL detection tool that scans files using Tree-sitter parsers for accurate URL discovery across 20+ programming languages. Instead of simple regex matching, this tool performs AST (Abstract Syntax Tree) parsing to precisely locate URLs in strings, comments, and other appropriate contexts.

## The SBOM Gap

Software Bill of Materials (SBOM) generation has become critical for security and compliance, but traditional SBOM tools miss a significant category of external dependencies: URLs embedded directly in source code.

Modern package managers and dependency scanners excel at tracking managed dependencies (npm packages, Maven artifacts, etc.), but they can't detect legacy patterns like:

```html
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto">
```

```javascript
const API_ENDPOINT = "https://api.thirdparty.com/v1";
fetch("https://analytics.example.com/track", { ... });
```

These URLs represent real external dependencies that can impact security, availability, and compliance - but they won't appear in any SBOM generated from package metadata. URL Detector fills this gap by providing comprehensive URL inventory that complements traditional dependency tracking tools.

## Features

- **🌐 20+ Language Support**: JavaScript, TypeScript, Java, C/C++, C#, HTML, CSS, Python, PHP, Ruby, Go, Scala, JSON, XML, TOML, Bash, Swift, Kotlin, and more
- **🌳 AST-Based Parsing**: Uses Tree-sitter for accurate tokenization and context-aware URL detection
- **🚀 High Performance**: Concurrent file processing with configurable concurrency limits
- **📊 Multiple Output Formats**: Table, JSON, and CSV output with customizable formatting
- **🎯 Advanced Filtering**: Domain allowlists/blocklists with wildcard support, protocol filtering, and regex fallback
- **📍 Precise Location Tracking**: Line numbers, columns, and character positions for each URL
- **🔍 Context Detection**: Finds URLs in string literals, comments, and appropriate language constructs
- **🛡️ False Positive Filtering**: Automatically excludes common schema patterns (//W3C//DTD, //EN, etc.)
- **⚙️ Highly Configurable**: Extensive CLI options and programmatic API
- **📦 Zero Config**: Easy setup without complex configuration

## Installation

To suppress warnings from tree-sitter transitive dependencies, all these commands can be run optionally with --loglevel=error flag.

### Global Installation (Recommended)

```bash
npm install -g @morgan-stanley/url-detector
```

### Local Installation

```bash
npm install @morgan-stanley/url-detector
```

### NPX Usage (No Installation)

```bash
npx @morgan-stanley/url-detector --scan "src/**/*.js" --format table
```

## Quick Start

### Command Line Interface

```bash
# Scan all files in current directory
url-detector

# Scan specific files/patterns
url-detector --scan "src/**/*.{js,ts}" --format table

# Exclude directories and ignore domains
url-detector --scan "**/*" --exclude "**/node_modules" --ignore-domains "*example.com"

# Export results to CSV
url-detector --scan "src/**/*" --format csv --output urls.csv

# Run in CI/CD (fail if URLs found)
url-detector --scan "**/*.js" --fail-on-error --results-only
```

### Programmatic Usage

```typescript
import { URLDetector, LanguageManager } from '@morgan-stanley/url-detector';

// Basic usage
const detector = new URLDetector();
const sourceCode = `
const apiUrl = "https://api.example.com/v1/users";
// Documentation: https://docs.example.com
`;

const urls = detector.detectURLs(sourceCode, 'javascript', 'app.js');
console.log(urls);

// Advanced usage with custom options
const detector = new URLDetector({
    includeComments: true,
    ignoreDomains: ['*.example.com', 'localhost'],
    protocol: ['https'],
    unique: true,
    logger: new ConsoleLogger()
});

// Custom language configurations
const customLanguageManager = new LanguageManager(undefined, [
    { name: 'mylang', module: 'tree-sitter-mylang', extensions: ['.ml'] }
]);
```

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --scan <patterns...>` | Glob patterns for files to scan | `["**/*"]` |
| `-e, --exclude <patterns...>` | Glob patterns for files to exclude | `[]` |
| `-i, --ignore-domains <domains...>` | Additional domains to ignore (supports wildcards, always includes `www.w3.org`) | `[]` |
| `--include-comments` | Also scan commented-out lines for URLs | `false` |
| `--include-non-fqdn` | Include non-fully qualified domain names like "localhost" | `false` |
| `-f, --format <format>` | Output format: `table`, `json`, or `csv` | `"table"` |
| `-o, --output <file>` | Output file path (stdout if not specified) | `null` |
| `-q, --quiet` | Run in quiet mode with no console output | `false` |
| `--results-only` | Show only results, suppressing progress and info messages | `false` |
| `--fail-on-error` | Exit with non-zero code if any URLs are found | `false` |
| `--concurrency <number>` | Maximum number of files to scan concurrently | `10` |
| `--scan-file <file>` | File containing glob patterns to scan (one per line) | `null` |
| `--exclude-file <file>` | File containing glob patterns to exclude (one per line) | `null` |

## Supported Languages

| Language | Extensions | Tree-sitter Parser |
|----------|------------|-------------------|
| JavaScript | `.js`, `.mjs` | [`tree-sitter-javascript`](https://npmjs.com/package/tree-sitter-javascript) |
| TypeScript | `.ts`, `.tsx` | [`tree-sitter-typescript`](https://npmjs.com/package/tree-sitter-typescript) |
| Java | `.java` | [`tree-sitter-java`](https://npmjs.com/package/tree-sitter-java) |
| C | `.c`, `.h` | [`tree-sitter-c`](https://npmjs.com/package/tree-sitter-c) |
| C++ | `.cpp`, `.cc`, `.cxx`, `.hpp`, `.hh`, `.hxx` | [`tree-sitter-cpp`](https://npmjs.com/package/tree-sitter-cpp) |
| C# | `.cs` | [`tree-sitter-c-sharp`](https://npmjs.com/package/tree-sitter-c-sharp) |
| Python | `.py`, `.pyw` | [`tree-sitter-python`](https://npmjs.com/package/tree-sitter-python) |
| PHP | `.php`, `.phtml` | [`tree-sitter-php`](https://npmjs.com/package/tree-sitter-php) |
| Ruby | `.rb`, `.rake`, `.gemspec` | [`tree-sitter-ruby`](https://npmjs.com/package/tree-sitter-ruby) |
| Go | `.go` | [`tree-sitter-go`](https://npmjs.com/package/tree-sitter-go) |
| Swift | `.swift` | [`tree-sitter-swift`](https://npmjs.com/package/tree-sitter-swift) |
| Kotlin | `.kt`, `.kts` | [`@tree-sitter-grammars/tree-sitter-kotlin`](https://npmjs.com/package/@tree-sitter-grammars/tree-sitter-kotlin) |
| Scala | `.scala`, `.sc` | [`tree-sitter-scala`](https://npmjs.com/package/tree-sitter-scala) |
| HTML | `.html`, `.htm` | [`tree-sitter-html`](https://npmjs.com/package/tree-sitter-html) |
| CSS | `.css` | [`tree-sitter-css`](https://npmjs.com/package/tree-sitter-css) |
| JSON | `.json`, `.jsonc` | [`tree-sitter-json`](https://npmjs.com/package/tree-sitter-json) |
| XML | `.xml`, `.xsd`, `.xsl`, `.xslt` | [`@tree-sitter-grammars/tree-sitter-xml`](https://npmjs.com/package/@tree-sitter-grammars/tree-sitter-xml) |
| TOML | `.toml` | [`@tree-sitter-grammars/tree-sitter-toml`](https://npmjs.com/package/@tree-sitter-grammars/tree-sitter-toml) |
| Bash | `.sh`, `.bash`, `.zsh`, `.fish` | [`tree-sitter-bash`](https://npmjs.com/package/tree-sitter-bash) |
| YAML | `.yaml`, `.yml` | [`@tree-sitter-grammars/tree-sitter-yaml`](https://npmjs.com/package/@tree-sitter-grammars/tree-sitter-yaml) |

> **Note**: For unsupported file types, the tool automatically falls back to regex-based detection.

## Examples

### Basic File Scanning

```bash
# Scan all JavaScript and TypeScript files
url-detector --scan "**/*.{js,ts}" --format table

# Scan source code only, exclude build artifacts
url-detector --scan "src/**/*" --exclude "build/**" "dist/**" "**/node_modules"
```

### Domain Filtering

The tool automatically ignores common non-meaningful domains found in code (like `www.w3.org` in XML namespaces). You can add additional domains to ignore:

```bash
# Ignore all example.com subdomains
url-detector --ignore-domains "*.example.com"

# Ignore multiple domain patterns
url-detector --ignore-domains "*.example.com" "localhost" "*.local"
```

### Output Formats

```bash
# Table output (default)
url-detector --scan "src/**/*" --format table

# JSON output for programmatic processing
url-detector --scan "src/**/*" --format json --output results.json

# CSV output for spreadsheet analysis
url-detector --scan "src/**/*" --format csv --output urls.csv
```

### CI/CD Integration

```bash
# Fail build if any URLs are found
url-detector --scan "**/*" --exclude "**/node_modules" --fail-on-error

# Quiet mode for CI logs
url-detector --scan "src/**/*" --quiet --format json --output scan-results.json

# Results-only mode (no progress messages)
url-detector --scan "**/*" --results-only --format table
```

## API Reference

### URLDetector Class

```typescript
class URLDetector {
    constructor(options?: DetectorOptionsConfig, logger?: Logger);
    detectURLs(sourceCode: string, language: string, filePath?: string): URLMatch[];
    process(): Promise<FileResult[]>;
}
```

### DetectorOptionsConfig Interface

```typescript
interface DetectorOptionsConfig {
    // File scanning options
    scan?: string[];                  // Glob patterns for files to scan (default: ["**/*"])
    exclude?: string[];               // Glob patterns to exclude (default: [])
    
    // Filtering options
    ignoreDomains?: string[];         // Additional domains to ignore (default: [], always includes `www.w3.org`)
    includeComments?: boolean;        // Include URLs from comments (default: false)
    includeNonFqdn?: boolean;         // Include non-FQDN domains like "localhost" (default: false)
    
    // Output options  
    format?: 'table' | 'json' | 'csv'; // Output format (default: "table")
    output?: string | null;           // Output file path (default: null)
    
    // Control options
    resultsOnly?: boolean;            // Results only mode (default: false)
    failOnError?: boolean;            // Exit with error if URLs found (default: false)
    
    // Performance options
    concurrency?: number;             // Max concurrent files (default: 10)
    
    // Advanced options (programmatic only)
    fallbackRegex?: boolean;          // Use regex fallback when tree-sitter fails (default: true)
    context?: number;                 // Lines of context to include (default: 0)
    maxDepth?: number;                // Max directory depth (default: Infinity)
    quiet?: boolean;                  // Suppress informational output (default: false)
}
```

### URLMatch Structure

```typescript
interface URLMatch {
    url: string;                      // The detected URL
    start: number;                    // Start character position
    end: number;                      // End character position
    line: number;                     // Line number (1-based)
    column: number;                   // Column number (1-based)
    sourceType: 'string' | 'comment' | 'unknown';  // Context type
    context?: string[];               // Surrounding lines (if requested)
}
```

### Language Customization

```typescript
import { LanguageManager, LanguageConfig } from '@morgan-stanley/url-detector';

// Add custom language support
const customLanguages: LanguageConfig[] = [
    {
        name: 'mylang',
        module: 'tree-sitter-mylang',
        extensions: ['.ml', '.mylang'],
        filenames: ['Mylangfile'] 
    }
];

const languageManager = new LanguageManager(undefined, customLanguages);
```

## How It Works

1. **Language Detection**: Automatically detects programming language from file extension or filename
2. **AST Parsing**: Uses Tree-sitter to parse source code into an Abstract Syntax Tree
3. **Node Traversal**: Recursively walks through AST to find string literals and comment nodes
4. **URL Extraction**: Applies URL regex patterns to content of relevant nodes
5. **Context Analysis**: Determines if URLs are in strings, comments, or other contexts
6. **Filtering**: Applies domain filters and other criteria
7. **Position Tracking**: Calculates precise line/column positions for each URL
8. **Fallback Support**: Falls back to regex scanning for unsupported languages

## Performance

- **Concurrent Processing**: Processes multiple files simultaneously (configurable concurrency)
- **Memory Efficient**: Streams large files and processes incrementally
- **Fast Parsing**: Tree-sitter provides high-performance parsing
- **Smart Caching**: Reuses parser instances where possible

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## Development

### Project Structure

```text
src/
├── index.ts              # Main library entry point
├── cli.ts               # Command-line interface
├── urlDetector.ts       # Core URL detection logic
├── languageManager.ts   # Language/parser management
├── urlFilter.ts         # URL filtering and validation
├── outputFormatter.ts   # Output formatting (table/json/csv)
├── options.ts          # Configuration options
└── logger.ts           # Logging interfaces

tests/
├── urlDetector.test.ts
├── languageManager.test.ts
└── integration.test.ts
```

### Local Development Setup

When cloning this project for local development, you'll need to use the `--legacy-peer-deps` flag due to complex peer dependencies across Tree-sitter packages:

```bash
# Clone the repository
git clone https://github.com/morgan-stanley/url-detector.git
cd url-detector

# Install dependencies with legacy peer deps support
npm install --legacy-peer-deps
```

### Building

```bash
# Build TypeScript to JavaScript
npm run build

# Build and watch for changes
npm run dev

# Clean build artifacts
npm run clean
```

### Linting

```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

## License

Apache License 2.0 - see [LICENSE](LICENSE) file for details.
