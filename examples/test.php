<?php
// PHP Example File - URL Detection Test Cases
// This file contains various URL patterns for testing the URL detector

// Single line comments with URLs (should be excluded by default)
// PHP documentation: https://www.php.net/manual/en/
// Laravel guide: https://laravel.example.com/docs/routing
// Symfony docs: http://symfony.example.com/documentation
// Local server: http://localhost/phpmyadmin

/*
 * Multi-line comment with URLs (should be excluded by default)
 * Official docs: https://docs.php.example.com/reference
 * Tutorial site: http://php-tutorial.example.com/basics
 * Package repository: //packagist.php.example.com/packages
 */

/**
 * PHPDoc comment with URLs (should be excluded by default)
 * @see https://phpdoc.example.com/documentation
 * @link http://php-examples.example.com/samples
 * @author Developer <dev@example.com>
 */

// String variables with URLs (should be included)
define('API_BASE_URL', 'https://api.php.example.com/v1');
define('STAGING_URL', 'https://staging-api.php.example.com');
define('DEV_URL', 'http://localhost:8080/api');
define('CDN_URL', '//cdn.php.example.com/assets');

// Variable assignments with different quote types
$singleQuoteUrl = 'https://single.php.example.com/endpoint';
$doubleQuoteUrl = "https://double.php.example.com/endpoint";
$heredocUrl = <<<EOD
https://heredoc.php.example.com/endpoint
EOD;
$nowdocUrl = <<<'EOD'
https://nowdoc.php.example.com/endpoint
EOD;

// String interpolation
$version = 'v2';
$userId = '123';
$interpolatedUrl = "https://api.php.example.com/{$version}/users/{$userId}";
$concatenatedUrl = 'https://api.php.example.com/' . $version . '/resource';

// Array with URLs
$apiEndpoints = [
    'production' => 'https://prod.php.example.com/api',
    'staging' => 'https://staging.php.example.com/api',
    'development' => 'http://dev.php.example.com:8000/api',
    'cdn' => '//cdn.php.example.com/static',
    'websocket' => 'wss://ws.php.example.com/socket',
    'file' => 'file:///var/www/storage/files'
];

// Associative array with mixed URL types
$urlList = array(
    "https://array.php.example.com/endpoint1",
    "http://array.php.example.com/endpoint2",
    "//array.php.example.com/static/resources",
    "ftp://files.php.example.com/downloads"
);

// Class with URL properties
class ApiClient {
    /**
     * API client class (PHPDoc URLs should be excluded)
     * @link https://class-doc.php.example.com/api-client
     */
    
    // Class property comment: https://property-comment.php.example.com/ignored
    private $baseUrl = 'https://class.php.example.com';
    protected $endpoints = [];
    public $publicUrl = 'https://public.php.example.com/api';
    
    public function __construct($baseUrl = null) {
        // Constructor comment: https://constructor-comment.php.example.com/ignored
        $this->baseUrl = $baseUrl ?: 'https://default.php.example.com';
        $this->endpoints = [
            'users' => $this->baseUrl . '/users',
            'posts' => $this->baseUrl . '/posts'
        ];
    }
    
    /**
     * Make HTTP request (PHPDoc URLs should be excluded)
     * @param string $endpoint API endpoint like https://method-doc.php.example.com/api
     * @return string Response from https://response-doc.php.example.com/api
     */
    public function makeRequest($endpoint) {
        // Method comment: https://method-comment.php.example.com/ignored
        $fullUrl = $this->baseUrl . '/' . $endpoint;
        return file_get_contents($fullUrl);
    }
    
    public static function getDefaultUrls() {
        return [
            'api' => 'https://static.php.example.com/api',
            'docs' => 'https://static-docs.php.example.com'
        ];
    }
}

// Function with URLs
function processUrls($urls) {
    // Function comment: https://function-comment.php.example.com/ignored
    $results = [];
    
    foreach ($urls as $url) {
        // Loop comment: https://loop-comment.php.example.com/ignored
        $parsed = parse_url($url);
        $results[$url] = 'Processed: ' . $parsed['host'];
    }
    
    return $results;
}

// URL validation function
function validateUrls() {
    $testUrls = [
        'https://validate.php.example.com/valid',
        'http://validate.php.example.com:8080/with-port',
        '//validate.php.example.com/protocol-relative',
        'file:///var/www/config.php',
        'ftp://validate.php.example.com/files',
        'sftp://secure.validate.php.example.com/secure-files'
    ];
    
    foreach ($testUrls as $url) {
        // Validation comment: https://validation-comment.php.example.com/ignored
        echo "Validating: {$url}\n";
    }
}

// Superglobal arrays often contain URLs
$_SERVER['HTTP_HOST'] = 'https://server.php.example.com';
$_POST['redirect_url'] = 'https://redirect.php.example.com/success';
$_GET['api_endpoint'] = 'https://get-param.php.example.com/api';

// Configuration array
$config = [
    // Comment in config: https://config-comment.php.example.com/ignored
    'database_url' => 'mysql://user:pass@db.php.example.com:3306/database',
    'redis_url' => 'redis://redis.php.example.com:6379/0',
    'api_base' => 'https://config.php.example.com/api',
    'upload_path' => 'file:///var/www/uploads'
];

// Protocol variations
$protocols = [
    'https' => 'https://secure.php.example.com/',
    'http' => 'http://insecure.php.example.com/',
    'ftp' => 'ftp://files.php.example.com/',
    'sftp' => 'sftp://secure-files.php.example.com/',
    'file' => 'file:///etc/php/config.ini',
    'mysql' => 'mysql://db.php.example.com:3306/app'
];

// Complex URL scenarios
$complexUrls = [
    'with_auth' => 'https://user:pass@auth.php.example.com/secure',
    'with_query' => 'https://search.php.example.com?q=php&page=1&sort=date',
    'with_fragment' => 'https://docs.php.example.com/guide#section-3',
    'with_port' => 'https://api.php.example.com:9443/secure-endpoint',
    'long_path' => 'https://api.php.example.com/very/long/path/to/resource/with/params',
    'encoded_chars' => 'https://api.php.example.com/search?q=hello%20world&type=json'
];

// Conditional URL assignment
$environment = 'production';
if ($environment === 'production') {
    // Condition comment: https://condition-comment.php.example.com/ignored
    $apiUrl = 'https://prod-condition.php.example.com/api';
} elseif ($environment === 'staging') {
    $apiUrl = 'https://staging-condition.php.example.com/api';
} else {
    $apiUrl = 'http://dev-condition.php.example.com:8000/api';
}

// Switch statement with URLs
switch ($environment) {
    case 'prod':
        // Switch comment: https://switch-comment.php.example.com/ignored
        $switchUrl = 'https://switch-prod.php.example.com/api';
        break;
    case 'dev':
        $switchUrl = 'http://switch-dev.php.example.com:8080/api';
        break;
    default:
        $switchUrl = 'https://switch-default.php.example.com/api';
}

// Try-catch with URLs
try {
    $response = file_get_contents('https://try.php.example.com/endpoint');
} catch (Exception $e) {
    // Exception comment: https://exception-comment.php.example.com/ignored
    $fallbackUrl = 'https://fallback.php.example.com/api';
    echo "Using fallback: {$fallbackUrl}";
}

// Anonymous function with URL
$getApiUrl = function($env) {
    return "https://lambda.{$env}.php.example.com/api";
};

// Closure with URL
$urlClosure = function() use ($apiUrl) {
    return $apiUrl . '/closure';
};

// Regular expression with URL pattern
$urlPattern = '/https?:\/\/[^\s<>"\'`]+/';
$testRegexUrl = 'https://regex-test.php.example.com/pattern';

// JSON string containing URLs (should be included)
$jsonConfig = '{"api_url": "https://json.php.example.com/api", "cdn": "//json-cdn.php.example.com"}';

// Curl operations with URLs
$curlUrl = 'https://curl.php.example.com/api/data';
$ch = curl_init($curlUrl);
curl_setopt($ch, CURLOPT_URL, 'https://curl-option.php.example.com/endpoint');

// Include/require with URLs (unusual but possible)
// include 'https://remote.php.example.com/config.php'; // Would be included as string

// Magic methods and URLs
class UrlMagic {
    public function __toString() {
        return 'https://magic.php.example.com/string';
    }
    
    public function __get($name) {
        if ($name === 'url') {
            return 'https://magic-get.php.example.com/property';
        }
    }
}

// Namespace and use statements (URLs in strings)
namespace App\Http\Controllers;

use Illuminate\Http\Request;
// Note: URLs in use statements would be unusual, but in comments they should be excluded

// Interface with URL constants
interface ApiInterface {
    // Interface comment: https://interface-comment.php.example.com/ignored
    const DEFAULT_ENDPOINT = 'https://interface.php.example.com/api';
    const BACKUP_ENDPOINT = 'https://backup.php.example.com/api';
}

// Trait with URLs
trait UrlHelpers {
    // Trait comment: https://trait-comment.php.example.com/ignored
    protected $traitUrl = 'https://trait.php.example.com/helper';
    
    public function getTraitUrl() {
        return $this->traitUrl;
    }
}

/*
 * Large commented block with URLs (should be excluded by default)
 * This entire section contains multiple URLs that should not be detected:
 * - API server: https://block-comment.php.example.com/api
 * - Documentation: http://block-docs.php.example.com/guide
 * - Repository: //github.block.php.example.com/project
 * - Config file: file:///etc/php/block-config.ini
 */

// Block comment immediately before URL usage (edge case testing)
/* https://php-block-before.example.com/ignored */ $immediateUrl = 'https://php-immediate.example.com/after-comment';
/* Comment */ $blockBeforeVar = "https://php-block-before-var.example.com";

/*
 * Multi-line comment
 * with https://php-multiline-block.example.com/ignored
 */
$multilineBlock = 'https://php-after-multiline.example.com';

// End of file comment: https://end-php.example.com/final
?>
