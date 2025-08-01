// Swift Example File - URL Detection Test Cases
// This file contains various URL patterns for testing the URL detector

import Foundation
import UIKit

// Single line comments with URLs (should be excluded by default)
// Swift documentation: https://swift.org/documentation/
// iOS development: https://developer.apple.com/swift/
// Package manager: https://swift.org/package-manager/
// Local development: http://localhost:8000/simulator

/*
 Multi-line comment with URLs (should be excluded by default)
 Official docs: https://docs.swift.example.com/reference
 Tutorial site: http://swift-tutorial.example.com/basics
 Package index: //swift-packages.example.com/repositories
 */

/**
 Documentation comment with URLs (should be excluded by default)
 - See: https://swiftdoc.example.com/api-reference
 - Author: Developer (https://developer.swift.example.com/profile)
 - Since: 1.0 (http://releases.swift.example.com/v1.0)
 */

// String constants with URLs (should be included)
let apiBaseURL = "https://api.swift.example.com/v1"
let stagingURL = "https://staging-api.swift.example.com"
let devURL = "http://localhost:9000/api"
let cdnURL = "//cdn.swift.example.com/assets"
let fileURL = "file:///Users/developer/config.plist"

// Protocol variations
let httpsURL = "https://secure.swift.example.com/"
let httpURL = "http://insecure.swift.example.com/"
let ftpURL = "ftp://files.swift.example.com/"
let websocketURL = "wss://websocket.swift.example.com/chat"

// String interpolation
let version = "v2"
let userID = "123"
let interpolatedURL = "https://api.swift.example.com/\(version)/users/\(userID)"
let multiPartURL = "https://api.\(ProcessInfo.processInfo.environment["ENV"] ?? "dev").swift.example.com"

// Multi-line strings
let multiLineURL = """
https://multiline.swift.example.com/endpoint
"""

// Raw strings (Swift 5.0+)
let rawStringURL = #"https://raw.swift.example.com/endpoint"#
let rawMultiLineURL = """
https://raw-multiline.swift.example.com/api
"""

// Arrays with URLs
let urlArray = [
    "https://array.swift.example.com/endpoint1",
    "http://array.swift.example.com/endpoint2",
    "//array.swift.example.com/static/resources",
    "ftp://files.swift.example.com/downloads"
]

// Dictionaries with URLs
let apiEndpoints: [String: String] = [
    "production": "https://prod.swift.example.com/api",
    "staging": "https://staging.swift.example.com/api",
    "development": "http://dev.swift.example.com:8000/api",
    "cdn": "//cdn.swift.example.com/static",
    "websocket": "wss://ws.swift.example.com/socket",
    "fileStorage": "file:///var/app/storage/files"
]

// Enum with URLs
enum APIEnvironment: String, CaseIterable {
    case production = "https://prod-enum.swift.example.com/api"
    case staging = "https://staging-enum.swift.example.com/api"
    case development = "http://dev-enum.swift.example.com:8000/api"
    
    var baseURL: String {
        return self.rawValue
    }
}

// Struct with URL properties
struct APIConfig {
    // Struct comment: https://struct-comment.swift.example.com/ignored
    let baseURL: String
    let cdnURL: String
    let webhookURL: String
    var endpoints: [String: String]
    
    init(baseURL: String = "https://default.swift.example.com") {
        // Init comment: https://init-comment.swift.example.com/ignored
        self.baseURL = baseURL
        self.cdnURL = "//default-cdn.swift.example.com/assets"
        self.webhookURL = "https://default-webhook.swift.example.com/hooks"
        self.endpoints = [
            "users": "\(baseURL)/users",
            "posts": "\(baseURL)/posts"
        ]
    }
}

// Class with URL methods
class APIClient {
    // Class comment: https://class-comment.swift.example.com/ignored
    
    private let baseURL: String
    private var session: URLSession
    
    static let shared = APIClient(baseURL: "https://shared.swift.example.com/api")
    
    init(baseURL: String) {
        // Constructor comment: https://constructor-comment.swift.example.com/ignored
        self.baseURL = baseURL
        self.session = URLSession.shared
    }
    
    func makeRequest(endpoint: String) -> URL? {
        // Method comment: https://method-comment.swift.example.com/ignored
        let fullURL = "\(baseURL)/\(endpoint)"
        return URL(string: fullURL)
    }
    
    func fetchData(from urlString: String, completion: @escaping (Data?) -> Void) {
        guard let url = URL(string: urlString) else {
            completion(nil)
            return
        }
        
        let task = session.dataTask(with: url) { data, response, error in
            completion(data)
        }
        task.resume()
    }
}

// Protocol with URL requirements
protocol URLProvider {
    // Protocol comment: https://protocol-comment.swift.example.com/ignored
    var baseURL: String { get }
    func getEndpointURL(for endpoint: String) -> String
}

// Extension with URL methods
extension APIClient: URLProvider {
    var baseURL: String {
        return "https://extension.swift.example.com/api"
    }
    
    func getEndpointURL(for endpoint: String) -> String {
        return "\(baseURL)/\(endpoint)"
    }
}

// Function with URL parameters
func processURLs(_ urls: [String]) -> [String: String] {
    // Function comment: https://function-comment.swift.example.com/ignored
    var results: [String: String] = [:]
    
    for url in urls {
        // Loop comment: https://loop-comment.swift.example.com/ignored
        if let parsedURL = URL(string: url) {
            results[url] = "Processed: \(parsedURL.host ?? "unknown")"
        }
    }
    
    return results
}

// URL validation function
func validateURLs() {
    let testURLs = [
        "https://validate.swift.example.com/valid",
        "http://validate.swift.example.com:8080/with-port",
        "//validate.swift.example.com/protocol-relative",
        "file:///var/app/config.swift",
        "ftp://validate.swift.example.com/files",
        "sftp://secure.validate.swift.example.com/secure-files"
    ]
    
    for testURL in testURLs {
        // Validation comment: https://validation-comment.swift.example.com/ignored
        print("Validating: \(testURL)")
    }
}

// Complex URL scenarios
let complexURLs: [String: String] = [
    "withAuth": "https://user:pass@auth.swift.example.com/secure",
    "withQuery": "https://search.swift.example.com?q=swift&page=1&sort=date",
    "withFragment": "https://docs.swift.example.com/guide#section-12",
    "withPort": "https://api.swift.example.com:9443/secure-endpoint",
    "longPath": "https://api.swift.example.com/very/long/path/to/resource/with/params",
    "encodedChars": "https://api.swift.example.com/search?q=hello%20world&type=swift"
]

// Conditional URL assignment
let environment = "production"
let apiURL: String
if environment == "production" {
    // Condition comment: https://condition-comment.swift.example.com/ignored
    apiURL = "https://prod-condition.swift.example.com/api"
} else if environment == "staging" {
    apiURL = "https://staging-condition.swift.example.com/api"
} else {
    apiURL = "http://dev-condition.swift.example.com:9000/api"
}

// Switch statement with URLs
let switchURL: String
switch environment {
case "production":
    // Switch comment: https://switch-comment.swift.example.com/ignored
    switchURL = "https://switch-prod.swift.example.com/api"
case "development":
    switchURL = "http://switch-dev.swift.example.com:8080/api"
default:
    switchURL = "https://switch-default.swift.example.com/api"
}

// Error handling with URLs
func handleURLError() {
    do {
        let url = URL(string: "https://try.swift.example.com/endpoint")!
        let data = try Data(contentsOf: url)
        print("Loaded \(data.count) bytes")
    } catch {
        // Error comment: https://error-comment.swift.example.com/ignored
        let fallbackURL = "https://fallback.swift.example.com/api"
        print("Using fallback: \(fallbackURL)")
    }
}

// Closure with URL
let urlProcessor: (String) -> String = { url in
    return "Processing: \(url)"
}

let getAPIURL: (String) -> String = { service in
    return "https://\(service).closure.swift.example.com/api"
}

// Optional binding with URLs
func processOptionalURL() {
    let urlString: String? = "https://optional.swift.example.com/api"
    
    if let url = urlString {
        print("Processing URL: \(url)")
    }
    
    guard let validURL = URL(string: urlString ?? "") else {
        let defaultURL = "https://guard.swift.example.com/default"
        print("Using default: \(defaultURL)")
        return
    }
    
    print("Valid URL: \(validURL)")
}

// Async/await with URLs (Swift 5.5+)
@available(iOS 15.0, *)
func fetchDataAsync() async throws {
    let url = URL(string: "https://async.swift.example.com/api")!
    let (data, _) = try await URLSession.shared.data(from: url)
    print("Fetched \(data.count) bytes")
}

// Combine framework with URLs
import Combine

@available(iOS 13.0, *)
func fetchWithCombine() -> AnyPublisher<Data, Error> {
    let url = URL(string: "https://combine.swift.example.com/api")!
    return URLSession.shared.dataTaskPublisher(for: url)
        .map(\.data)
        .eraseToAnyPublisher()
}

// SwiftUI View with URLs
import SwiftUI

@available(iOS 13.0, *)
struct ContentView: View {
    // SwiftUI comment: https://swiftui-comment.swift.example.com/ignored
    
    @State private var imageURL = "https://swiftui.swift.example.com/image.jpg"
    @State private var apiEndpoint = "https://swiftui-api.swift.example.com/data"
    
    var body: some View {
        VStack {
            AsyncImage(url: URL(string: imageURL))
            
            Button("Load Data") {
                // Button action comment: https://button-comment.swift.example.com/ignored
                loadData(from: apiEndpoint)
            }
        }
    }
    
    private func loadData(from urlString: String) {
        // Load data implementation
    }
}

// UserDefaults with URLs
extension UserDefaults {
    static let apiBaseURLKey = "api_base_url"
    
    var apiBaseURL: String {
        get {
            return string(forKey: Self.apiBaseURLKey) ?? "https://defaults.swift.example.com/api"
        }
        set {
            set(newValue, forKey: Self.apiBaseURLKey)
        }
    }
}

// Notification with URL
extension Notification.Name {
    static let urlUpdated = Notification.Name("URLUpdated")
}

func postURLNotification() {
    let userInfo = ["url": "https://notification.swift.example.com/updated"]
    NotificationCenter.default.post(name: .urlUpdated, object: nil, userInfo: userInfo)
}

// Property wrapper with URL
@propertyWrapper
struct URLString {
    private var value: String
    
    init(wrappedValue: String) {
        self.value = wrappedValue
    }
    
    var wrappedValue: String {
        get { value }
        set { value = newValue }
    }
}

struct APISettings {
    @URLString var baseURL = "https://property-wrapper.swift.example.com/api"
    @URLString var cdnURL = "//property-wrapper-cdn.swift.example.com/assets"
}

// Core Data model with URLs (conceptual)
/*
@Entity
class APIConfiguration: NSManagedObject {
    // Core Data comment: https://coredata-comment.swift.example.com/ignored
    @NSManaged var baseURL: String
    @NSManaged var webhookURL: String
}
*/

// Testing with URLs
import XCTest

class URLTests: XCTestCase {
    // Test comment: https://test-comment.swift.example.com/ignored
    
    func testURLValidation() {
        let testURL = "https://test.swift.example.com/endpoint"
        XCTAssertNotNil(URL(string: testURL))
    }
    
    func testAPIEndpoints() {
        let expectedURL = "https://test-api.swift.example.com/users"
        let config = APIConfig(baseURL: "https://test-api.swift.example.com")
        XCTAssertEqual(config.endpoints["users"], expectedURL)
    }
}

// Regular expressions with URLs
let urlPattern = #"https?://[^\s<>"'`]+"#
let testString = "Visit https://regex.swift.example.com/test for more info"
let regex = try! NSRegularExpression(pattern: urlPattern)
let matches = regex.matches(in: testString, range: NSRange(testString.startIndex..., in: testString))

// JSON encoding/decoding with URLs
struct APIResponse: Codable {
    let apiURL: String
    let cdnURL: String
    let webhookURL: String
    
    enum CodingKeys: String, CodingKey {
        case apiURL = "api_url"
        case cdnURL = "cdn_url"
        case webhookURL = "webhook_url"
    }
}

let jsonData = """
{
    "api_url": "https://json.swift.example.com/api",
    "cdn_url": "//json-cdn.swift.example.com/assets",
    "webhook_url": "https://json-webhook.swift.example.com/hooks"
}
""".data(using: .utf8)!

let decoder = JSONDecoder()
let apiResponse = try! decoder.decode(APIResponse.self, from: jsonData)

/*
 Large commented block with URLs (should be excluded by default)
 This entire section contains multiple URLs that should not be detected:
 - API server: https://block-comment.swift.example.com/api
 - Documentation: http://block-docs.swift.example.com/guide
 - Repository: https://github.block.swift.example.com/project
 - Config file: file:///etc/swift/block-config.swift
 */

// Block comment immediately before declaration (edge case testing)
// https://swift-block-before.example.com/ignored
let immediateURL = "https://swift-immediate.example.com/after-comment"
// Comment
let blockBeforeVar = "https://swift-block-before-var.example.com"

/*
 Multi-line comment
 with https://swift-multiline-block.example.com/ignored
 */
let multilineBlock = "https://swift-after-multiline.example.com"

// End of file comment: https://end-swift.example.com/final
