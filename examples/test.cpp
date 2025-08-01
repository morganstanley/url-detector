// C++ Example File - URL Detection Test Cases
// This file contains various URL patterns for testing the URL detector

#include <iostream>
#include <string>
#include <vector>
#include <map>

// Single line comments with URLs (should be excluded by default)
// C++ reference: https://cppreference.com/w/cpp/string/basic_string
// Boost libraries: https://boost.org/doc/libs/
// CMake documentation: https://cmake.org/cmake/help/latest/

/*
 * Multi-line comment with URLs (should be excluded by default)
 * Standard library docs: https://en.cppreference.com/w/cpp
 * Tutorial site: http://cplusplus.com/doc/tutorial/
 * GitHub repository: //github.com/cpp-examples/samples
 */

/**
 * Doxygen comment with URLs (should be excluded by default)
 * @see https://doxygen.example.com/cpp-api
 * @brief Example class for URL testing
 * @author Developer (https://developer.example.com/cpp-profile)
 */
class UrlTestExample {
private:
    // String literals with URLs (should be included)
    static const std::string API_BASE_URL;
    static const std::string STAGING_URL;
    std::string baseUrl = "https://instance.cpp.example.com";
    
    // Comment in private section: https://private-comment.example.com/ignored
    
public:
    // Constructor with URL initialization (should be included)
    UrlTestExample() : baseUrl("https://constructor.cpp.example.com") {
        // Comment in constructor: https://constructor-comment.example.com/ignored
        std::cout << "Initialized with URL: " << baseUrl << std::endl;
    }
    
    // Method with URLs in string literals (should be included)
    std::vector<std::string> getEndpoints() {
        return {
            "https://api.cpp.example.com/users",
            "https://api.cpp.example.com/posts",
            "http://legacy.cpp.api.example.com/old",
            "//cdn.cpp.example.com/static/assets",
            "file:///opt/cpp/app/config.ini"
        };
    }
    
    /**
     * Method with Doxygen URLs (should be excluded by default)
     * @param endpoint URL like https://method-doc.cpp.example.com/api
     * @return Result from https://result-doc.cpp.example.com/response
     */
    std::string makeRequest(const std::string& endpoint) {
        // Implementation comment: https://impl-comment.cpp.example.com/ignored
        std::string fullUrl = baseUrl + "/" + endpoint;
        return "Response from " + fullUrl;
    }
    
    // URL manipulation demonstrations
    void demonstrateUrls() {
        // String concatenation
        std::string dynamicUrl = "https://dynamic.cpp.example.com/user/" + std::to_string(getUserId());  
        
        // C-style string with URL
        const char* cStyleUrl = "https://c-style.cpp.example.com/endpoint";
        
        // Raw string literal (C++11)
        std::string rawUrl = R"(https://raw-string.cpp.example.com/path/with/quotes)";
        
        // String array
        const char* urls[] = {
            "https://array1.cpp.example.com",
            "http://array2.cpp.example.com:8080", 
            "//array3.cpp.example.com/cdn"
        };
        
        // Vector of URLs
        std::vector<std::string> urlVector = {
            "https://vector1.cpp.example.com/api",
            "https://vector2.cpp.example.com/data",
            "file:///home/cpp/data/cache.db"
        };
        
        // Map with URL values
        std::map<std::string, std::string> urlMap = {
            {"production", "https://prod.cpp.example.com"},
            {"staging", "https://stage.cpp.example.com"},
            {"development", "http://dev.cpp.example.com:3000"}
        };
    }
    
private:
    int getUserId() const { return 42; }
};

// Static member definitions (should be included)
const std::string UrlTestExample::API_BASE_URL = "https://static.cpp.example.com/api";
const std::string UrlTestExample::STAGING_URL = "https://staging.cpp.example.com/v1";

// Global constants with URLs (should be included)
const std::string GLOBAL_API_URL = "https://global.cpp.example.com";
const std::string PROTOCOL_RELATIVE = "//global-cdn.cpp.example.com/assets";

// Namespace with URLs
namespace ApiConfig {
    // Comment in namespace: https://namespace-comment.cpp.example.com/ignored
    const std::string BASE_URL = "https://namespace.cpp.example.com";
    const std::string BACKUP_URL = "https://backup.namespace.cpp.example.com";
    
    std::string getFullUrl(const std::string& path) {
        return BASE_URL + "/" + path;
    }
}

// Template class with URL handling
template<typename T>
class UrlHandler {
private:
    std::string templateUrl = "https://template.cpp.example.com";
    
public:
    // Comment in template: https://template-comment.cpp.example.com/ignored
    void processUrl(const T& data) {
        std::string processUrl = "https://process.template.cpp.example.com/data";
        // Process the data
    }
};

// Enum class with URLs (C++11)
enum class Environment {
    PRODUCTION,
    STAGING, 
    DEVELOPMENT
};

// Function to get URL by environment
std::string getEnvironmentUrl(Environment env) {
    switch (env) {
        case Environment::PRODUCTION:
            return "https://production.cpp.example.com";
        case Environment::STAGING:
            return "https://staging.cpp.example.com";
        case Environment::DEVELOPMENT:
            return "http://development.cpp.example.com:8080";
        default:
            return "https://default.cpp.example.com";
    }
}

// Preprocessor definitions with URLs (should be included)
#define API_ENDPOINT "https://macro.cpp.example.com/api"
#define CDN_BASE "//macro-cdn.cpp.example.com"

// Complex URL scenarios
void complexUrlScenarios() {
    // URL with query parameters
    std::string queryUrl = "https://search.cpp.example.com?query=cpp&type=tutorial&page=1";
    
    // URL with authentication
    std::string authUrl = "https://user:pass@secure.cpp.example.com/private";
    
    // File protocol variations
    std::string linuxFile = "file:///usr/local/cpp/config.conf";
    std::string windowsFile = "file:///C:/Program Files/App/settings.ini";
    
    // Various protocols
    std::vector<std::string> protocols = {
        "https://secure.cpp.example.com/ssl",
        "http://insecure.cpp.example.com/plain",
        "ftp://files.cpp.example.com/downloads/library.tar.gz",
        "sftp://secure-files.cpp.example.com/backup.sql"
    };
    
    // Lambda with URL (C++11)
    auto urlLambda = [](const std::string& path) -> std::string {
        // Comment in lambda: https://lambda-comment.cpp.example.com/ignored
        return "https://lambda.cpp.example.com/" + path;
    };
    
    // Smart pointer with URL string
    std::unique_ptr<std::string> urlPtr = std::make_unique<std::string>("https://smart-ptr.cpp.example.com");
}

// C-style function with URLs
extern "C" {
    const char* getCApiUrl() {
        return "https://c-api.cpp.example.com/extern";
    }
}

/*
 * Large commented block with URLs (should be excluded by default)
 * This entire section contains URLs that should not be detected:
 * - Documentation: https://commented.cpp.example.com/docs
 * - Repository: http://repo.commented.cpp.example.com/source
 * - CDN: //cdn.commented.cpp.example.com/libraries
 * - Config: file:///etc/commented-cpp-config.conf
 */

int main() {
    // Comment in main: https://main-comment.cpp.example.com/ignored
    UrlTestExample example;
    std::string mainUrl = "https://main.cpp.example.com/entry-point";
    
    std::cout << "Application started with URL: " << mainUrl << std::endl;
    return 0;
}

// Block comment immediately before URL usage (edge case testing)
/* https://cpp-block-before.example.com/ignored */ const std::string IMMEDIATE_URL = "https://cpp-immediate.example.com/after-comment";
/* Comment */ std::string blockBeforeVar = "https://cpp-block-before-var.example.com";

/* Multi
 * line comment
 * with https://cpp-multiline-block.example.com/ignored
 */
std::string multilineBlock = "https://cpp-after-multiline.example.com";

// Class with block comment before member
class BlockCommentTest {
public:
    /* https://class-member-comment.example.com/ignored */ std::string memberUrl = "https://cpp-class-member.example.com";
};

// End of file comment: https://end-cpp.example.com/final
