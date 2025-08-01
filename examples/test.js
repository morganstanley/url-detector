// JavaScript Example File - URL Detection Test Cases
// This file contains various URL patterns for testing the URL detector

// Single line comments with URLs (should be excluded by default)
// Production API: https://api.production.com/v1/users  
// Development server: http://dev.example.com:3000/api
// Protocol-relative: //cdn.example.com/assets/js/main.js
// File protocol: file:///C:/Users/admin/documents/test.txt
// FTP protocol: ftp://files.example.com/downloads/

/* 
 * Multi-line comment block with URLs (should be excluded by default)
 * Documentation: https://docs.example.com/javascript/
 * Legacy API: http://legacy-api.example.com/old-endpoint
 * CDN resources: //static.example.com/images/logo.png
 */

/**
 * JSDoc comment with URLs (should be excluded by default)
 * @see https://jsdoc.example.com/documentation
 * @example http://example.com/demo
 */

// String literals with URLs (should be included)
const apiEndpoints = {
    production: 'https://api.production.com/v1/',
    staging: 'https://staging-api.example.com/v1/',
    development: 'http://localhost:3000/api/',
    cdn: '//cdn.example.com/assets/',
    websocket: 'wss://ws.example.com/socket',
    secure: 'https://secure.bank.com/login'
};

// Template literals
const dynamicUrl = `https://api.${process.env.NODE_ENV}.example.com/users/${userId}`;
const protocolRelative = `//assets.example.com/images/${imageName}.jpg`;

// Function calls with URL arguments
fetch('https://jsonplaceholder.typicode.com/posts/1')
    .then(response => response.json())
    .then(data => console.log(data));

// URL in regex pattern (should be included as string)
const urlPattern = /https?:\/\/[^\s<>"'`]+/g;
const testUrl = 'https://regex-test.example.com/pattern';

// Mixed scenarios
const config = {
    // Comment in object: https://comment-in-object.example.com/ignored
    baseUrl: 'https://config.example.com/api',
    fallbackUrl: '//fallback.example.com/api'
};

// URLs in different quote types
const singleQuotes = 'https://single-quotes.example.com/endpoint';
const doubleQuotes = "https://double-quotes.example.com/endpoint";
const backticks = `https://backticks.example.com/endpoint`;

// File protocol variations
const localFile = 'file:///home/user/documents/readme.txt';
const windowsFile = 'file:///C:/Windows/System32/config.ini';

// Various protocols
const protocols = [
    'https://secure.example.com/',
    'http://insecure.example.com/',
    'ftp://files.example.com/',
    'sftp://secure-files.example.com/',
    'ftps://encrypted-files.example.com/',
    'mailto:admin@example.com',  // Not a URL but similar pattern
    'tel:+1-555-123-4567'       // Not a URL but similar pattern
];

// Edge cases
const edgeCases = {
    withPort: 'https://api.example.com:8443/secure',
    withQuery: 'https://search.example.com/?q=test&page=1',
    withFragment: 'https://docs.example.com/page#section-1',
    withAuth: 'https://user:pass@private.example.com/data',
    longPath: 'https://api.example.com/very/long/path/to/resource/with/many/segments',
    specialChars: 'https://api.example.com/search?q=hello%20world&type=json'
};

// Commented out code blocks (URLs should be excluded)
/*
console.log('This entire block is commented out');
const oldApi = 'https://old-api.example.com/v1/deprecated';
fetch(oldApi).then(res => res.json());
*/

// Block comment immediately before URL usage (edge case testing)
/* https://block-before.example.com/ignored */ const immediateUrl = 'https://immediate.example.com/after-comment';
/* Comment */ var blockBeforeVar = "https://block-before-var.example.com";
/* Multi
   line comment
   with https://multiline-block.example.com/ignored */ const multilineBlock = 'https://after-multiline.example.com';

// End of file comment: https://end-comment.example.com/final
