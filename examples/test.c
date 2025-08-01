// C Example File - URL Detection Test Cases
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define API_BASE "https://api.c.example.com/v1"
#define BACKUP_URL "https://backup.c.example.com/api"

// Configuration structure
typedef struct {
    char* base_url;
    char* cdn_url;
    int port;
} api_config_t;

// Initialize configuration with URLs
api_config_t* init_config() {
    api_config_t* config = malloc(sizeof(api_config_t));
    
    config->base_url = "https://config.c.example.com/api";
    config->cdn_url = "//cdn.c.example.com/assets";
    config->port = 8080;
    
    return config;
}

// HTTP client function
int make_request(const char* endpoint) {
    char url[512];
    
    // Build full URL: https://api.c.example.com/data
    snprintf(url, sizeof(url), "%s%s", API_BASE, endpoint);
    
    printf("Making request to: %s\n", url);
    
    // Simulated error handling with fallback URL
    if (strstr(url, "timeout")) {
        printf("Falling back to: %s\n", BACKUP_URL);
        return 0;
    }
    
    return 1;
}

int main() {
    printf("C URL Detection Example\n");
    printf("Documentation: https://docs.c.example.com\n");
    
    // Initialize API configuration
    api_config_t* config = init_config();
    
    // Make API calls
    make_request("/users");
    make_request("/posts");
    
    // Log URLs for debugging
    fprintf(stderr, "Debug: Using API at %s\n", config->base_url);
    
    /* 
     * Multi-line comment with URL
     * Repository: https://github.c.example.com/project
     * Should be excluded by default
     */
    
    // Single line comment: https://comment.c.example.com/ignored
    
    // String concatenation with URLs
    char* webhook_url = "https://webhook.c.example.com/notifications";
    char* monitoring_url = "https://monitoring.c.example.com/health";
    
    printf("Webhook: %s\n", webhook_url);
    printf("Monitoring: %s\n", monitoring_url);
    
    // Cleanup
    free(config);
    
    return 0;
}
