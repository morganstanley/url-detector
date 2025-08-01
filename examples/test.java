// Java Example File - URL Detection Test Cases
// This file contains various URL patterns for testing the URL detector

package com.example.urltest;

import java.net.URL;
import java.net.URI;
import java.util.List;
import java.util.Arrays;

// Single line comments with URLs (should be excluded by default)
// API documentation: https://docs.oracle.com/javase/8/docs/api/
// Spring Boot guide: https://spring.io/guides/gs/spring-boot/
// Maven repository: https://mvnrepository.com/artifact/junit/junit

/*
 * Multi-line comment with URLs (should be excluded by default) 
 * Official documentation: https://docs.java.com/en/java/
 * Tutorial site: http://tutorials.example.com/java-basics
 * Code examples: //github.com/java-examples/samples
 */

/**
 * JavaDoc comment with URLs (should be excluded by default)
 * @see https://javadoc.example.com/api-reference
 * @author Developer (https://developer.example.com/profile)
 * @since 1.0 (http://releases.example.com/v1.0)
 */
public class UrlTestExample {
    
    // String constants with URLs (should be included)
    private static final String API_BASE_URL = "https://api.example.com/v1";
    private static final String STAGING_URL = "https://staging.api.example.com";
    private static final String DEV_URL = "http://localhost:8080/api";
    private static final String CDN_URL = "//cdn.example.com/assets";
    private static final String FILE_URL = "file:///home/app/config.properties";
    
    // Protocol variations
    private static final String HTTPS_URL = "https://secure.example.com/login";
    private static final String HTTP_URL = "http://insecure.example.com/public";
    private static final String FTP_URL = "ftp://files.example.com/downloads";
    private static final String WEBSOCKET_URL = "wss://websocket.example.com/chat";
    
    // Comment in field declaration: https://field-comment.example.com/ignored
    private String baseUrl = "https://instance.api.example.com";
    
    /**
     * Constructor with URL parameter (should be excluded in JavaDoc)
     * @param apiUrl Base API URL like https://constructor-doc.example.com/api
     */
    public UrlTestExample(String apiUrl) {
        // Comment in constructor: https://constructor-comment.example.com/ignored
        this.baseUrl = apiUrl != null ? apiUrl : "https://default.api.example.com";
    }
    
    // Method with URL strings (should be included)
    public List<String> getEndpoints() {
        return Arrays.asList(
            "https://api.example.com/users",
            "https://api.example.com/posts", 
            "http://legacy.api.example.com/old-endpoint",
            "//cdn.example.com/static/images",
            "file:///opt/app/data/cache.db"
        );
    }
    
    /**
     * Method documentation with URLs (should be excluded by default)
     * @param endpoint API endpoint URL like https://method-doc.example.com/endpoint
     * @return Response from https://response-doc.example.com/api
     */
    public String makeRequest(String endpoint) {
        // Implementation comment: https://impl-comment.example.com/ignored
        String fullUrl = this.baseUrl + "/" + endpoint;
        System.out.println("Making request to: " + fullUrl);
        return "Response data";
    }
    
    // URL manipulation methods
    public void demonstrateUrls() {
        // String concatenation
        String dynamicUrl = "https://api.example.com/users/" + getUserId();
        
        // String formatting
        String formattedUrl = String.format("https://api.%s.example.com/data", getEnvironment());
        
        // StringBuilder
        StringBuilder urlBuilder = new StringBuilder("https://builder.example.com");
        urlBuilder.append("/path").append("?param=value");
        
        // URL parsing examples
        try {
            URL url1 = new URL("https://java-url.example.com/path");
            URI uri1 = new URI("https://java-uri.example.com/resource");
            
            // Protocol relative URL
            URL url2 = new URL("//protocol-relative.example.com/assets/style.css");
            
        } catch (Exception e) {
            // Exception comment: https://exception-comment.example.com/ignored
            System.err.println("URL parsing failed");
        }
    }
    
    // Static nested class
    public static class ApiConfig {
        // Comment in nested class: https://nested-comment.example.com/ignored
        public static final String PRODUCTION = "https://prod.api.example.com";
        public static final String TESTING = "https://test.api.example.com";
        
        private String customUrl = "https://custom.nested.example.com";
    }
    
    // Enum with URL values (should be included)
    public enum Environment {
        PROD("https://production.example.com"),
        STAGE("https://staging.example.com"), 
        DEV("http://development.example.com:3000"),
        LOCAL("http://localhost:8080");
        
        private final String baseUrl;
        
        Environment(String baseUrl) {
            this.baseUrl = baseUrl;
        }
        
        public String getBaseUrl() {
            return baseUrl;
        }
    }
    
    // Annotation with URL (should be included in annotation value)
    @RequestMapping(value = "https://annotation.example.com/mapping")
    public void annotatedMethod() {
        // Method implementation
    }
    
    // Interface with URLs
    interface ApiClient {
        // Comment in interface: https://interface-comment.example.com/ignored
        String DEFAULT_ENDPOINT = "https://interface.api.example.com";
        
        void callApi(String url);
    }
    
    // Complex URL scenarios
    private void complexUrlScenarios() {
        // Array of URLs
        String[] urls = {
            "https://array.example.com/endpoint1",
            "http://array.example.com/endpoint2",
            "//array.example.com/static/resources"
        };
        
        // URL with query parameters
        String queryUrl = "https://search.example.com?q=java&type=tutorial&page=1";
        
        // URL with authentication
        String authUrl = "https://user:password@secure.example.com/private";
        
        // File protocol variations  
        String linuxFile = "file:///home/user/documents/data.json";
        String windowsFile = "file:///C:/Users/Admin/Documents/config.xml";
        
        // Special protocols
        String[] specialProtocols = {
            "ftp://files.example.com/public/download.zip",
            "sftp://secure.files.example.com/private/backup.tar.gz", 
            "ftps://encrypted.files.example.com/archive/data.sql"
        };
    }
    
    private String getUserId() { return "123"; }
    private String getEnvironment() { return "prod"; }
}

/*
 * Large commented block with URLs (should be excluded by default)
 * This entire section contains multiple URLs that should not be detected:
 * - Development server: https://dev.commented.example.com/api
 * - Documentation: http://docs.commented.example.com/guide  
 * - Repository: //github.commented.example.com/project
 * - Local file: file:///tmp/commented-config.properties
 */

    // Block comment immediately before URL usage (edge case testing)
    /* https://java-block-before.example.com/ignored */ private static final String IMMEDIATE_URL = "https://java-immediate.example.com/after-comment";
    /* Comment */ public static String blockBeforeVar = "https://java-block-before-var.example.com";
    
    /* Multi
     * line comment  
     * with https://java-multiline-block.example.com/ignored
     */ 
    private String multilineBlock = "https://java-after-multiline.example.com";
}

// End of file comment: https://end-java.example.com/final
