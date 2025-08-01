// TypeScript Example File - URL Detection Test Cases
// This file contains various URL patterns for testing the URL detector

// Single line comments with URLs (should be excluded by default)
// API documentation: https://api-docs.typescript.com/interfaces
// Development server: http://localhost:4200/dev-tools
// CDN resources: //cdn.typescript.com/assets/types.d.ts

/* 
 * Multi-line comment with URLs (should be excluded by default)
 * TypeScript handbook: https://typescript-handbook.com/advanced-types
 * Playground: http://typescriptlang.org/playground
 */

/**
 * Interface documentation with URLs (should be excluded by default)
 * @see https://typescript-docs.com/interfaces
 * @example https://example.com/typescript-demo
 */

// Type definitions and interfaces with URL strings (should be included)
interface ApiConfig {
    baseUrl: string;  // 'https://api.example.com/v1'
    timeout: number;
    endpoints: {
        users: string;    // 'https://api.example.com/v1/users'
        posts: string;    // 'https://api.example.com/v1/posts'
        media: string;    // '//media.example.com/uploads'
    };
}

// Type aliases
type ApiEndpoint = 'https://api.production.com' | 'https://api.staging.com' | 'http://localhost:3001';
type ProtocolRelativeUrl = `//${string}.example.com/${string}`;

// Class with URL properties (should be included)
class HttpClient {
    private baseUrl: string = 'https://api.example.com/v2';
    private fallbackUrl: string = '//fallback.example.com/api';
    
    // Comment with URL: https://comment-in-class.example.com/ignored
    constructor(config: ApiConfig) {
        this.baseUrl = config.baseUrl || 'https://default-api.example.com';
    }
    
    async fetchData(endpoint: string): Promise<any> {
        const fullUrl = `${this.baseUrl}/${endpoint}`;
        return fetch(fullUrl);
    }
}

// Generic types with URL constraints
interface ResourceLoader<T extends string> {
    loadFrom(url: T): Promise<any>;
}

// Usage examples
const loader: ResourceLoader<'https://data.example.com' | 'https://backup.example.com'> = {
    async loadFrom(url) {
        return fetch(url);
    }
};

// Enum with URL values (should be included)
enum ApiEndpoints {
    PRODUCTION = 'https://api.production.com/v1',
    STAGING = 'https://staging.api.com/v1',
    DEVELOPMENT = 'http://localhost:3000/api',
    CDN = '//cdn.example.com/static'
}

// Const assertions
const endpoints = {
    primary: 'https://primary.api.com/v1',
    secondary: 'https://secondary.api.com/v1',
    fallback: '//fallback.api.com/v1'
} as const;

// Template literal types
type ApiUrl = `https://api.${string}.com/${string}`;
type FileUrl = `file:///${string}`;

// Function overloads with URL parameters
function makeRequest(url: 'https://secure.api.com'): Promise<SecureResponse>;
function makeRequest(url: 'http://public.api.com'): Promise<PublicResponse>;
function makeRequest(url: string): Promise<any> {
    return fetch(url);
}

// Decorators with URLs (if using experimental decorators)
// @ApiEndpoint('https://decorated.api.com/endpoint')
class DecoratedService {
    // Implementation
}

// Advanced type scenarios
type WebSocketUrl = `wss://${string}` | `ws://${string}`;
type HttpsUrl = `https://${string}`;

const websocketUrls: WebSocketUrl[] = [
    'wss://secure-socket.example.com/chat',
    'ws://dev-socket.example.com:8080/debug'
];

// Conditional types with URLs
type UrlProtocol<T> = T extends `https://${infer _}` ? 'secure' : 
                     T extends `http://${infer _}` ? 'insecure' :
                     T extends `//${infer _}` ? 'protocol-relative' : 'unknown';

// Utility types
type ExtractDomain<T extends string> = T extends `${string}://${infer Domain}/${string}` ? Domain : never;

// Complex URL validation
const validUrls = [
    'https://api.example.com/users?page=1&limit=10',
    'http://legacy.system.com:8080/old-api',
    '//cdn.assets.com/images/logo.svg',
    'file:///Users/developer/project/config.json',
    'ftp://files.company.com/downloads/archive.zip'
];

// Namespace with URLs
namespace ApiService {
    export const BASE_URL = 'https://namespace-api.example.com';
    export const DOCS_URL = 'https://docs.namespace.com/api';
    
    // Comment in namespace: https://namespace-comment.example.com/ignored
    export function getEndpoint(path: string): string {
        return `${BASE_URL}/${path}`;
    }
}

// Module augmentation example
declare module 'some-library' {
    interface Config {
        apiUrl: 'https://extended.api.com';  // Should be included
    }
}

/* 
Commented code block with URLs (should be excluded)
const oldConfig = {
    legacyApi: 'https://legacy.old-system.com/v1',
    deprecatedCdn: '//old-cdn.example.com/assets'
};
*/

// Triple-slash directive (TypeScript-specific)
/// <reference path="https://external-types.example.com/definitions.d.ts" />

// Block comment immediately before URL usage (edge case testing)
/* https://ts-block-before.example.com/ignored */ const immediateUrl: string = 'https://ts-immediate.example.com/after-comment';
/* Comment */ let blockBeforeVar: string = "https://ts-block-before-var.example.com";
/* Multi
   line comment
   with https://ts-multiline-block.example.com/ignored */ const multilineBlock: string = 'https://ts-after-multiline.example.com';

// Interface with block comment before URL
interface ApiConfig {
    /* https://interface-comment.example.com/ignored */ baseUrl: string; // Should be 'https://interface-url.example.com'
}

// End comment: https://end-typescript.example.com/final
