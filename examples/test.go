// Go Example File - URL Detection Test Cases
// This file contains various URL patterns for testing the URL detector

package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

// Single line comments with URLs (should be excluded by default)
// Go documentation: https://golang.org/doc/
// Go modules: https://go.dev/blog/using-go-modules
// Package repository: https://pkg.go.dev/
// Local development: http://localhost:8080/debug

/*
Multi-line comment with URLs (should be excluded by default)
Official docs: https://docs.go.example.com/reference
Tutorial site: http://go-tutorial.example.com/basics
Package index: //go-packages.example.com/modules
*/

// Constants with URLs (should be included)
const (
	APIBaseURL  = "https://api.go.example.com/v1"
	StagingURL  = "https://staging-api.go.example.com"
	DevURL      = "http://localhost:9000/api"
	CDNURL      = "//cdn.go.example.com/assets"
	FileURL     = "file:///home/user/config.json"
	WebSocketURL = "wss://ws.go.example.com/socket"
)

// Variables with URLs
var (
	productionURL = "https://prod.go.example.com/api"
	testURL       = "https://test.go.example.com/endpoint"
	backupURL     = "https://backup.go.example.com/restore"
)

// String literals with different formats
var (
	singleLineURL = "https://single-line.go.example.com/endpoint"
	multiLineURL  = "https://multi-line.go.example.com/" +
		"very/long/path/with/segments"
	rawStringURL = `https://raw.go.example.com/endpoint`
	backtickURL  = `https://backtick.go.example.com/raw-string`
)

// Struct with URL fields
type APIConfig struct {
	// Struct field comment: https://struct-comment.go.example.com/ignored
	BaseURL    string `json:"base_url"`
	CDNURL     string `json:"cdn_url"`
	WebhookURL string `json:"webhook_url"`
	Endpoints  map[string]string
}

// Constructor function with URLs
func NewAPIConfig() *APIConfig {
	// Constructor comment: https://constructor-comment.go.example.com/ignored
	return &APIConfig{
		BaseURL:    "https://constructor.go.example.com/api",
		CDNURL:     "//constructor-cdn.go.example.com/assets",
		WebhookURL: "https://constructor-webhook.go.example.com/hooks",
		Endpoints: map[string]string{
			"users": "https://constructor.go.example.com/users",
			"posts": "https://constructor.go.example.com/posts",
		},
	}
}

// Interface with URL methods
type URLProvider interface {
	// Interface comment: https://interface-comment.go.example.com/ignored
	GetBaseURL() string
	GetEndpoints() map[string]string
}

// Struct implementing interface
type APIClient struct {
	baseURL   string
	endpoints map[string]string
}

// Method with URLs
func (c *APIClient) GetBaseURL() string {
	// Method comment: https://method-comment.go.example.com/ignored
	return c.baseURL
}

func (c *APIClient) GetEndpoints() map[string]string {
	return c.endpoints
}

func (c *APIClient) MakeRequest(endpoint string) (*http.Response, error) {
	// HTTP request comment: https://request-comment.go.example.com/ignored
	fullURL := c.baseURL + "/" + endpoint
	return http.Get(fullURL)
}

// Function with URL parameters
func processURLs(urls []string) map[string]string {
	// Function comment: https://function-comment.go.example.com/ignored
	results := make(map[string]string)
	
	for _, rawURL := range urls {
		// Loop comment: https://loop-comment.go.example.com/ignored
		parsed, err := url.Parse(rawURL)
		if err == nil {
			results[rawURL] = fmt.Sprintf("Processed: %s", parsed.Host)
		}
	}
	
	return results
}

// URL validation function
func validateURLs() {
	testURLs := []string{
		"https://validate.go.example.com/valid",
		"http://validate.go.example.com:8080/with-port",
		"//validate.go.example.com/protocol-relative",
		"file:///var/app/config.go",
		"ftp://validate.go.example.com/files",
		"sftp://secure.validate.go.example.com/secure-files",
	}
	
	for _, testURL := range testURLs {
		// Validation comment: https://validation-comment.go.example.com/ignored
		fmt.Printf("Validating: %s\n", testURL)
	}
}

// Map with URL values
var protocolURLs = map[string]string{
	"https": "https://secure.go.example.com/",
	"http":  "http://insecure.go.example.com/",
	"ftp":   "ftp://files.go.example.com/",
	"sftp":  "sftp://secure-files.go.example.com/",
	"file":  "file:///etc/go/config.yaml",
	"ws":    "ws://websocket.go.example.com/chat",
}

// Slice with URLs
var urlSlice = []string{
	"https://slice.go.example.com/endpoint1",
	"http://slice.go.example.com/endpoint2",
	"//slice.go.example.com/static/resources",
	"ftp://files.slice.go.example.com/downloads",
}

// Complex URL scenarios
var complexURLs = map[string]string{
	"with_auth":      "https://user:pass@auth.go.example.com/secure",
	"with_query":     "https://search.go.example.com?q=golang&page=1&sort=date",
	"with_fragment":  "https://docs.go.example.com/guide#section-5",
	"with_port":      "https://api.go.example.com:9443/secure-endpoint",
	"long_path":      "https://api.go.example.com/very/long/path/to/resource/with/params",
	"encoded_chars":  "https://api.go.example.com/search?q=hello%20world&type=json",
}

// Function with conditional URLs
func getAPIURL(environment string) string {
	// Switch comment: https://switch-comment.go.example.com/ignored
	switch environment {
	case "production":
		return "https://prod-switch.go.example.com/api"
	case "staging":
		return "https://staging-switch.go.example.com/api"
	case "development":
		return "http://dev-switch.go.example.com:9000/api"
	default:
		return "https://default-switch.go.example.com/api"
	}
}

// If statement with URLs
func getConditionalURL(isProd bool) string {
	if isProd {
		// Condition comment: https://condition-comment.go.example.com/ignored
		return "https://prod-condition.go.example.com/api"
	}
	return "http://dev-condition.go.example.com:9000/api"
}

// Error handling with URLs
func handleURLError() error {
	_, err := http.Get("https://try.go.example.com/endpoint")
	if err != nil {
		// Error comment: https://error-comment.go.example.com/ignored
		fallbackURL := "https://fallback.go.example.com/api"
		fmt.Printf("Using fallback: %s\n", fallbackURL)
		return err
	}
	return nil
}

// Goroutine with URL
func processURLInGoroutine(urlChan chan string) {
	go func() {
		// Goroutine comment: https://goroutine-comment.go.example.com/ignored
		goroutineURL := "https://goroutine.go.example.com/background"
		urlChan <- goroutineURL
	}()
}

// Method with receiver
func (c *APIClient) UpdateURL(newURL string) {
	c.baseURL = newURL
}

// Anonymous function with URL
var getURLFunc = func(service string) string {
	return fmt.Sprintf("https://%s.anonymous.go.example.com/api", service)
}

// Closure with URL
func createURLGetter(baseURL string) func(string) string {
	return func(endpoint string) string {
		return baseURL + "/" + endpoint
	}
}

// JSON marshaling with URLs
type ConfigJSON struct {
	APIURL    string `json:"api_url"`
	CDNURL    string `json:"cdn_url"`
	WebhookURL string `json:"webhook_url"`
}

func marshalConfig() ([]byte, error) {
	config := &ConfigJSON{
		APIURL:    "https://json.go.example.com/api",
		CDNURL:    "//json-cdn.go.example.com/assets",
		WebhookURL: "https://json-webhook.go.example.com/hooks",
	}
	return json.Marshal(config)
}

// URL parsing examples
func parseURLExamples() {
	rawURL := "https://parse.go.example.com/path?query=value#fragment"
	parsed, err := url.Parse(rawURL)
	if err == nil {
		fmt.Printf("Scheme: %s, Host: %s, Path: %s\n", parsed.Scheme, parsed.Host, parsed.Path)
	}
	
	// URL with values
	params := url.Values{}
	params.Add("api_url", "https://params.go.example.com/api")
	params.Add("callback", "//params-callback.go.example.com/hook")
}

// HTTP client with URLs
func createHTTPClient() *http.Client {
	transport := &http.Transport{
		// Transport comment: https://transport-comment.go.example.com/ignored
		Proxy: http.ProxyURL(&url.URL{
			Scheme: "http",
			Host:   "proxy.go.example.com:8080",
		}),
	}
	
	return &http.Client{
		Transport: transport,
	}
}

// Test function with URLs
func TestURLProcessing() {
	testCases := []struct {
		name string
		url  string
	}{
		{"https", "https://test.go.example.com/case1"},
		{"http", "http://test.go.example.com/case2"},
		{"protocol-relative", "//test.go.example.com/case3"},
		{"file", "file:///tmp/test-config.json"},
	}
	
	for _, tc := range testCases {
		// Test comment: https://test-comment.go.example.com/ignored
		fmt.Printf("Testing %s: %s\n", tc.name, tc.url)
	}
}

// Channel operations with URLs
func urlChannelExample() {
	urlChan := make(chan string, 3)
	
	// Send URLs to channel
	urlChan <- "https://channel.go.example.com/send1"
	urlChan <- "https://channel.go.example.com/send2"
	urlChan <- "//channel.go.example.com/send3"
	
	close(urlChan)
	
	// Receive URLs from channel
	for url := range urlChan {
		// Channel comment: https://channel-comment.go.example.com/ignored
		fmt.Printf("Received URL: %s\n", url)
	}
}

// Embedded struct with URLs
type ServerConfig struct {
	*APIConfig
	ServerURL string
	AdminURL  string
}

func NewServerConfig() *ServerConfig {
	return &ServerConfig{
		APIConfig: NewAPIConfig(),
		ServerURL: "https://server.go.example.com:8443",
		AdminURL:  "https://admin.go.example.com/dashboard",
	}
}

// Pointer operations with URLs
func pointerURLExample() {
	url1 := "https://pointer.go.example.com/url1"
	url2 := "https://pointer.go.example.com/url2"
	
	urlPtr := &url1
	fmt.Printf("Pointer URL: %s\n", *urlPtr)
	
	urlPtr = &url2
	fmt.Printf("Updated pointer URL: %s\n", *urlPtr)
}

// Select statement with URLs
func selectURLExample() {
	url1Chan := make(chan string, 1)
	url2Chan := make(chan string, 1)
	
	url1Chan <- "https://select.go.example.com/channel1"
	url2Chan <- "https://select.go.example.com/channel2"
	
	select {
	case url := <-url1Chan:
		// Select comment: https://select-comment.go.example.com/ignored
		fmt.Printf("Got URL from channel 1: %s\n", url)
	case url := <-url2Chan:
		fmt.Printf("Got URL from channel 2: %s\n", url)
	}
}

// Main function
func main() {
	// Main comment: https://main-comment.go.example.com/ignored
	fmt.Println("Starting URL processing...")
	
	config := NewAPIConfig()
	fmt.Printf("API Base URL: %s\n", config.BaseURL)
	
	validateURLs()
	TestURLProcessing()
}

/*
Large commented block with URLs (should be excluded by default)
This entire section contains multiple URLs that should not be detected:
- API server: https://block-comment.go.example.com/api
- Documentation: http://block-docs.go.example.com/guide
- Repository: //github.block.go.example.com/project
- Config file: file:///etc/go/block-config.yaml
*/

// Block comment immediately before URL usage (edge case testing)
/* https://go-block-before.example.com/ignored */ var immediateURL = "https://go-immediate.example.com/after-comment"
/* Comment */ var blockBeforeVar = "https://go-block-before-var.example.com"

/*
Multi-line comment
with https://go-multiline-block.example.com/ignored
*/
var multilineBlock = "https://go-after-multiline.example.com"

// End of file comment: https://end-go.example.com/final
