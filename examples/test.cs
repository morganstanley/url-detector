// C# Example File - URL Detection Test Cases
// This file contains various URL patterns for testing the URL detector

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

// Single line comments with URLs (should be excluded by default)
// .NET documentation: https://docs.microsoft.com/en-us/dotnet/
// ASP.NET Core guide: https://docs.microsoft.com/en-us/aspnet/core/
// NuGet packages: https://nuget.org/packages/

/*
 * Multi-line comment with URLs (should be excluded by default)
 * C# language guide: https://docs.microsoft.com/en-us/dotnet/csharp/
 * Visual Studio: https://visualstudio.microsoft.com/
 * GitHub repository: //github.com/dotnet/core
 */

/// <summary>
/// XML documentation with URLs (should be excluded by default)
/// See also: https://xmldoc.example.com/csharp-reference
/// Example usage: https://example.com/csharp-demo
/// </summary>
namespace UrlTest.Examples
{
    /// <summary>
    /// Class documentation with URLs (should be excluded by default)
    /// API reference: https://class-doc.example.com/api-reference
    /// </summary>
    public class UrlTestExample
    {
        // String constants with URLs (should be included)
        private const string API_BASE_URL = "https://api.csharp.example.com/v1";
        private const string STAGING_URL = "https://staging.csharp.example.com";
        private const string DEV_URL = "http://localhost:5000/api";
        private const string CDN_URL = "//cdn.csharp.example.com/assets";
        
        // Field with URL (should be included)
        private readonly string _baseUrl = "https://field.csharp.example.com";
        
        // Comment in field: https://field-comment.csharp.example.com/ignored
        
        // Properties with URLs (should be included)
        public string ProductionUrl { get; set; } = "https://production.csharp.example.com";
        public string BackupUrl { get; private set; } = "https://backup.csharp.example.com";
        
        // Auto-implemented property
        public string CdnUrl { get; } = "//auto-property.csharp.example.com/static";
        
        /// <summary>
        /// Constructor documentation with URLs (should be excluded by default)
        /// </summary>
        /// <param name="apiUrl">Base URL like https://constructor-doc.csharp.example.com</param>
        public UrlTestExample(string apiUrl = null)
        {
            // Comment in constructor: https://constructor-comment.csharp.example.com/ignored
            _baseUrl = apiUrl ?? "https://default.csharp.example.com";
        }
        
        /// <summary>
        /// Method documentation with URLs (should be excluded by default)
        /// </summary>
        /// <param name="endpoint">API endpoint URL</param>
        /// <returns>Response from https://method-doc.csharp.example.com</returns>
        public async Task<string> MakeRequestAsync(string endpoint)
        {
            // Comment in method: https://method-comment.csharp.example.com/ignored
            var fullUrl = $"{_baseUrl}/{endpoint}";
            
            using var client = new HttpClient();
            var response = await client.GetAsync(fullUrl);
            return await response.Content.ReadAsStringAsync();
        }
        
        // Method with URL string literals (should be included)
        public List<string> GetEndpoints()
        {
            return new List<string>
            {
                "https://api.csharp.example.com/users",
                "https://api.csharp.example.com/posts",
                "http://legacy.csharp.example.com/old-api",
                "//cdn.csharp.example.com/images",
                "file:///C:/App/Data/config.json"
            };
        }
        
        // String interpolation with URLs
        public void DemonstrateUrls()
        {
            var userId = GetUserId();
            var environment = GetEnvironment();
            
            // String interpolation
            var dynamicUrl = $"https://api.{environment}.csharp.example.com/users/{userId}";
            
            // Verbatim string
            var verbatimUrl = @"https://verbatim.csharp.example.com/path/with\backslashes";
            
            // Raw string literal (C# 11)
            var rawUrl = """https://raw-string.csharp.example.com/path""";
            
            // String array
            string[] urls = {
                "https://array1.csharp.example.com",
                "http://array2.csharp.example.com:8080",
                "//array3.csharp.example.com/cdn"
            };
            
            // Dictionary with URL values
            var urlDictionary = new Dictionary<string, string>
            {
                ["production"] = "https://prod.csharp.example.com",
                ["staging"] = "https://stage.csharp.example.com",
                ["development"] = "http://dev.csharp.example.com:3000"
            };
        }
        
        private int GetUserId() => 123;
        private string GetEnvironment() => "prod";
    }
    
    // Static class with URLs
    public static class ApiConfig
    {
        // Comment in static class: https://static-comment.csharp.example.com/ignored
        public static readonly string BaseUrl = "https://static.csharp.example.com";
        public static readonly string DocsUrl = "https://docs.static.csharp.example.com";
        
        public static string GetFullUrl(string path) =>
            $"{BaseUrl}/{path.TrimStart('/')}";
    }
    
    // Enum with URL attributes
    public enum Environment  
    {
        Production,
        Staging,
        Development
    }
    
    // Extension class for enum
    public static class EnvironmentExtensions
    {
        public static string GetUrl(this Environment environment) =>
            environment switch
            {
                Environment.Production => "https://production.csharp.example.com",
                Environment.Staging => "https://staging.csharp.example.com", 
                Environment.Development => "http://development.csharp.example.com:5000",
                _ => "https://default.csharp.example.com"
            };
    }
    
    // Interface with URL constants
    public interface IApiClient
    {
        // Comment in interface: https://interface-comment.csharp.example.com/ignored
        const string DefaultEndpoint = "https://interface.csharp.example.com";
        
        Task<T> GetAsync<T>(string url);
    }
    
    // Record with URL properties (C# 9)
    public record ApiResponse(string Url, int StatusCode, string Data)
    {
        // Comment in record: https://record-comment.csharp.example.com/ignored
        public static ApiResponse Success(string url, string data) =>
            new(url, 200, data);
    }
    
    // Generic class with URL constraints
    public class UrlHandler<T> where T : class
    {
        private readonly string _handlerUrl = "https://generic.csharp.example.com";
        
        // Comment in generic: https://generic-comment.csharp.example.com/ignored
        public async Task<T> ProcessAsync(string endpoint)
        {
            var fullUrl = $"{_handlerUrl}/{endpoint}";
            // Process and return T
            return default(T);
        }
    }
    
    // Attribute with URL parameter
    [System.ComponentModel.Description("https://attribute.csharp.example.com/description")]
    public class AttributeExample
    {
        // Property with attribute containing URL
        [System.ComponentModel.DefaultValue("https://default-value.csharp.example.com")]
        public string DefaultUrl { get; set; }
    }
    
    // Complex URL scenarios
    public static class ComplexUrlScenarios
    {
        // LINQ with URLs
        public static readonly string[] ApiUrls = {
            "https://linq1.csharp.example.com/api",
            "https://linq2.csharp.example.com/data", 
            "http://linq3.csharp.example.com:8080/legacy"
        };
        
        public static void ProcessUrls()
        {
            // LINQ query
            var httpsUrls = ApiUrls.Where(url => url.StartsWith("https://")).ToList();
            
            // URL with query parameters
            var queryUrl = "https://search.csharp.example.com?q=dotnet&type=package&page=1";
            
            // URL with authentication
            var authUrl = "https://user:password@secure.csharp.example.com/private";
            
            // File protocol variations
            var windowsFile = @"file:///C:\Users\Admin\Documents\config.xml";
            var linuxFile = "file:///home/user/app/settings.json";
            
            // Various protocols
            var protocolUrls = new[]
            {
                "https://secure.csharp.example.com/ssl",
                "http://insecure.csharp.example.com/plain", 
                "ftp://files.csharp.example.com/downloads/package.zip",
                "sftp://secure-files.csharp.example.com/backup.tar.gz"
            };
        }
        
        // Async method with URLs
        public static async Task<string> FetchDataAsync()
        {
            var urls = new[]
            {
                "https://async1.csharp.example.com/data",
                "https://async2.csharp.example.com/backup"
            };
            
            using var client = new HttpClient();
            var tasks = urls.Select(url => client.GetStringAsync(url));
            var results = await Task.WhenAll(tasks);
            
            return string.Join(",", results);
        }
    }
}

/*
 * Large commented namespace with URLs (should be excluded by default)
 * This section contains multiple URLs that should not be detected:
 * - Documentation: https://commented.csharp.example.com/docs
 * - Repository: http://repo.commented.csharp.example.com/source  
 * - NuGet: https://nuget.commented.csharp.example.com/packages
 * - Config: file:///C:/Commented/app-config.json
 */

// Global using statements (C# 10)
global using GlobalUrl = System.String; // Not a URL, but shows syntax

    // Block comment immediately before URL usage (edge case testing)
    /* https://cs-block-before.example.com/ignored */ private static readonly string ImmediateUrl = "https://cs-immediate.example.com/after-comment";
    /* Comment */ public static string BlockBeforeVar = "https://cs-block-before-var.example.com";
    
    /* Multi
     * line comment
     * with https://cs-multiline-block.example.com/ignored
     */
    private string multilineBlock = "https://cs-after-multiline.example.com";
    
    // Property with block comment
    /* https://property-comment.example.com/ignored */ public string PropertyUrl { get; set; } = "https://cs-property.example.com";
}

// End of file comment: https://end-csharp.example.com/final
