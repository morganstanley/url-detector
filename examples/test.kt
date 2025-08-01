// Kotlin Example File - URL Detection Test Cases
// This file contains various URL patterns for testing the URL detector

package com.example.urltest

import kotlinx.coroutines.*
import kotlinx.serialization.*
import java.net.URL
import java.net.URI

// Single line comments with URLs (should be excluded by default)
// Kotlin documentation: https://kotlinlang.org/docs/
// Android development: https://developer.android.com/kotlin
// Package repository: https://mvnrepository.com/artifact/org.jetbrains.kotlin
// Local development: http://localhost:8080/android-studio

/*
 * Multi-line comment with URLs (should be excluded by default)
 * Official docs: https://docs.kotlin.example.com/reference
 * Tutorial site: http://kotlin-tutorial.example.com/basics
 * Package index: //kotlin-packages.example.com/libraries
 */

/**
 * KDoc comment with URLs (should be excluded by default)
 * @see https://kdoc.kotlin.example.com/api-reference
 * @author Developer (https://developer.kotlin.example.com/profile)
 * @since 1.0 (http://releases.kotlin.example.com/v1.0)
 */

// Constants with URLs (should be included)
const val API_BASE_URL = "https://api.kotlin.example.com/v1"
const val STAGING_URL = "https://staging-api.kotlin.example.com"
const val DEV_URL = "http://localhost:9000/api"
const val CDN_URL = "//cdn.kotlin.example.com/assets"
const val FILE_URL = "file:///home/user/config.json"

// Object with URL constants
object APIConstants {
    // Object comment: https://object-comment.kotlin.example.com/ignored
    const val PRODUCTION_URL = "https://prod.kotlin.example.com/api"
    const val STAGING_URL = "https://staging.kotlin.example.com/api"
    const val WEBSOCKET_URL = "wss://ws.kotlin.example.com/socket"
    const val CDN_BASE = "//cdn-object.kotlin.example.com/assets"
}

// String variables with different formats
val singleQuoteURL = "https://single.kotlin.example.com/endpoint"
val tripleQuoteURL = """https://triple.kotlin.example.com/endpoint"""
val rawStringURL = """
    https://raw.kotlin.example.com/endpoint
""".trimIndent()

// String interpolation
val version = "v2"
val userId = "123"
val interpolatedURL = "https://api.kotlin.example.com/$version/users/$userId"
val expressionURL = "https://api.${System.getProperty("env", "dev")}.kotlin.example.com"

// Lists with URLs
val urlList = listOf(
    "https://list.kotlin.example.com/endpoint1",
    "http://list.kotlin.example.com/endpoint2",
    "//list.kotlin.example.com/static/resources",
    "ftp://files.kotlin.example.com/downloads"
)

// Maps with URLs
val apiEndpoints = mapOf(
    "production" to "https://prod.kotlin.example.com/api",
    "staging" to "https://staging.kotlin.example.com/api",
    "development" to "http://dev.kotlin.example.com:8000/api",
    "cdn" to "//cdn.kotlin.example.com/static",
    "websocket" to "wss://ws.kotlin.example.com/socket",
    "fileStorage" to "file:///var/app/storage/files"
)

// Data class with URLs
data class APIConfig(
    // Data class comment: https://data-comment.kotlin.example.com/ignored
    val baseURL: String = "https://default.kotlin.example.com",
    val cdnURL: String = "//default-cdn.kotlin.example.com/assets",
    val webhookURL: String = "https://default-webhook.kotlin.example.com/hooks",
    val endpoints: Map<String, String> = mapOf(
        "users" to "$baseURL/users",
        "posts" to "$baseURL/posts"
    )
)

// Sealed class with URL variants
sealed class APIEnvironment(val baseURL: String) {
    object Production : APIEnvironment("https://prod-sealed.kotlin.example.com/api")
    object Staging : APIEnvironment("https://staging-sealed.kotlin.example.com/api")
    object Development : APIEnvironment("http://dev-sealed.kotlin.example.com:8000/api")
    
    data class Custom(val customURL: String) : APIEnvironment(customURL)
}

// Enum class with URLs
enum class ProtocolType(val exampleURL: String) {
    HTTPS("https://secure.kotlin.example.com/"),
    HTTP("http://insecure.kotlin.example.com/"),
    FTP("ftp://files.kotlin.example.com/"),
    SFTP("sftp://secure-files.kotlin.example.com/"),
    WEBSOCKET("wss://websocket.kotlin.example.com/chat");
    
    companion object {
        // Companion comment: https://companion-comment.kotlin.example.com/ignored
        const val DEFAULT_API = "https://default-enum.kotlin.example.com/api"
    }
}

// Class with URL properties and methods
class APIClient(private val baseURL: String = "https://client.kotlin.example.com") {
    // Class comment: https://class-comment.kotlin.example.com/ignored
    
    private val endpoints = mutableMapOf<String, String>()
    
    init {
        // Init comment: https://init-comment.kotlin.example.com/ignored
        endpoints["users"] = "$baseURL/users"
        endpoints["posts"] = "$baseURL/posts"
    }
    
    fun makeRequest(endpoint: String): String {
        // Method comment: https://method-comment.kotlin.example.com/ignored
        val fullURL = "$baseURL/$endpoint"
        return "Response from $fullURL"
    }
    
    suspend fun fetchDataAsync(urlString: String): String = withContext(Dispatchers.IO) {
        // Coroutine comment: https://coroutine-comment.kotlin.example.com/ignored
        val url = URL(urlString)
        url.readText()
    }
    
    companion object {
        fun createDefault(): APIClient {
            return APIClient("https://companion.kotlin.example.com/api")
        }
    }
}

// Interface with URL methods
interface URLProvider {
    // Interface comment: https://interface-comment.kotlin.example.com/ignored
    val baseURL: String
    fun getEndpointURL(endpoint: String): String
}

// Extension functions with URLs
fun APIClient.getHealthURL(): String = "https://health.kotlin.example.com/status"

fun String.toAPIURL(): String = "https://extension.kotlin.example.com/api/$this"

// Functions with URL parameters
fun processURLs(urls: List<String>): Map<String, String> {
    // Function comment: https://function-comment.kotlin.example.com/ignored
    return urls.associateWith { url ->
        try {
            val uri = URI(url)
            "Processed: ${uri.host}"
        } catch (e: Exception) {
            "Invalid URL"
        }
    }
}

// URL validation function
fun validateURLs() {
    val testURLs = listOf(
        "https://validate.kotlin.example.com/valid",
        "http://validate.kotlin.example.com:8080/with-port",
        "//validate.kotlin.example.com/protocol-relative",
        "file:///var/app/config.kt",
        "ftp://validate.kotlin.example.com/files",
        "sftp://secure.validate.kotlin.example.com/secure-files"
    )
    
    testURLs.forEach { testURL ->
        // Validation comment: https://validation-comment.kotlin.example.com/ignored
        println("Validating: $testURL")
    }
}

// Complex URL scenarios
val complexURLs = mapOf(
    "withAuth" to "https://user:pass@auth.kotlin.example.com/secure",
    "withQuery" to "https://search.kotlin.example.com?q=kotlin&page=1&sort=date",
    "withFragment" to "https://docs.kotlin.example.com/guide#section-13",
    "withPort" to "https://api.kotlin.example.com:9443/secure-endpoint",
    "longPath" to "https://api.kotlin.example.com/very/long/path/to/resource/with/params",
    "encodedChars" to "https://api.kotlin.example.com/search?q=hello%20world&type=kotlin"
)

// When expression with URLs
fun getAPIURL(environment: String): String = when (environment) {
    "production" -> {
        // When comment: https://when-comment.kotlin.example.com/ignored
        "https://prod-when.kotlin.example.com/api"
    }
    "staging" -> "https://staging-when.kotlin.example.com/api"
    "development" -> "http://dev-when.kotlin.example.com:9000/api"
    else -> "https://default-when.kotlin.example.com/api"
}

// If expression with URLs
val apiURL = if (System.getenv("ENVIRONMENT") == "production") {
    // If comment: https://if-comment.kotlin.example.com/ignored
    "https://prod-if.kotlin.example.com/api"
} else {
    "http://dev-if.kotlin.example.com:9000/api"
}

// Exception handling with URLs
fun handleURLException() {
    try {
        val url = URL("https://try.kotlin.example.com/endpoint")
        println("URL is valid: $url")
    } catch (e: Exception) {
        // Exception comment: https://exception-comment.kotlin.example.com/ignored
        val fallbackURL = "https://fallback.kotlin.example.com/api"
        println("Using fallback: $fallbackURL")
    }
}

// Lambda expressions with URLs
val urlProcessor: (String) -> String = { url ->
    "Processing: $url"
}

val getServiceURL: (String) -> String = { service ->
    "https://$service.lambda.kotlin.example.com/api"
}

// Higher-order functions with URLs
fun processURLsWithCallback(urls: List<String>, callback: (String) -> Unit) {
    urls.forEach { url ->
        // Callback comment: https://callback-comment.kotlin.example.com/ignored
        callback(url)
    }
}

// Coroutines with URLs
suspend fun fetchMultipleURLs(urls: List<String>): List<String> = coroutineScope {
    urls.map { url ->
        async {
            // Async comment: https://async-comment.kotlin.example.com/ignored
            delay(100) // Simulate network call
            "Data from $url"
        }
    }.awaitAll()
}

// Flow with URLs
fun getURLFlow(): kotlinx.coroutines.flow.Flow<String> = kotlinx.coroutines.flow.flow {
    val urls = listOf(
        "https://flow.kotlin.example.com/stream1",
        "https://flow.kotlin.example.com/stream2",
        "https://flow.kotlin.example.com/stream3"
    )
    
    urls.forEach { url ->
        emit(url)
        delay(1000)
    }
}

// Generic class with URLs
class Repository<T>(private val baseURL: String) {
    // Generic comment: https://generic-comment.kotlin.example.com/ignored
    
    fun getResourceURL(id: String): String = "$baseURL/resources/$id"
    
    companion object {
        fun <T> create(): Repository<T> = Repository("https://generic.kotlin.example.com/api")
    }
}

// Annotation with URL
@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class APIEndpoint(val url: String)

@APIEndpoint("https://annotation.kotlin.example.com/service")
class AnnotatedService {
    // Annotated class comment: https://annotated-comment.kotlin.example.com/ignored
    fun process() = "Processing with annotation"
}

// Delegation with URLs
class URLDelegate {
    operator fun getValue(thisRef: Any?, property: kotlin.reflect.KProperty<*>): String {
        return "https://delegate.kotlin.example.com/${property.name}"
    }
    
    operator fun setValue(thisRef: Any?, property: kotlin.reflect.KProperty<*>, value: String) {
        println("Setting ${property.name} to $value")
    }
}

class ServiceConfiguration {
    var apiURL by URLDelegate()
    var webhookURL by URLDelegate()
}

// Inline functions with URLs
inline fun <reified T> fetchResource(): String = "https://inline.kotlin.example.com/api/${T::class.simpleName}"

// Type aliases with URLs
typealias URLString = String
typealias APIEndpointMap = Map<String, URLString>

val typedURLs: APIEndpointMap = mapOf(
    "api" to "https://typealias.kotlin.example.com/api",
    "webhook" to "https://typealias-webhook.kotlin.example.com/hooks"
)

// Destructuring with URLs
data class URLPair(val name: String, val url: String)

fun useDestructuring() {
    val urlPairs = listOf(
        URLPair("api", "https://destructure.kotlin.example.com/api"),
        URLPair("cdn", "//destructure-cdn.kotlin.example.com/assets")
    )
    
    urlPairs.forEach { (name, url) ->
        // Destructure comment: https://destructure-comment.kotlin.example.com/ignored
        println("$name: $url")
    }
}

// Operator overloading with URLs
data class APIService(val baseURL: String) {
    operator fun plus(endpoint: String): String = "$baseURL/$endpoint"
    operator fun get(endpoint: String): String = "$baseURL/$endpoint"
}

val service = APIService("https://operator.kotlin.example.com")
val endpoint = service + "users" // Results in URL
val resource = service["posts"]  // Results in URL

// Regular expressions with URLs
val urlPattern = Regex("""https?://[^\s<>"'`]+""")
val testString = "Visit https://regex.kotlin.example.com/test for more info"
val matches = urlPattern.findAll(testString)

// JSON serialization with URLs
@Serializable
data class APIResponse(
    @SerialName("api_url") val apiURL: String,
    @SerialName("cdn_url") val cdnURL: String,
    @SerialName("webhook_url") val webhookURL: String
)

val jsonResponse = APIResponse(
    apiURL = "https://json.kotlin.example.com/api",
    cdnURL = "//json-cdn.kotlin.example.com/assets",
    webhookURL = "https://json-webhook.kotlin.example.com/hooks"
)

// Property delegation with URLs
class Properties {
    private val props = mutableMapOf<String, String>()
    
    fun string(key: String, defaultValue: String = ""): kotlin.properties.ReadWriteProperty<Any?, String> =
        object : kotlin.properties.ReadWriteProperty<Any?, String> {
            override fun getValue(thisRef: Any?, property: kotlin.reflect.KProperty<*>): String =
                props[key] ?: defaultValue
            
            override fun setValue(thisRef: Any?, property: kotlin.reflect.KProperty<*>, value: String) {
                props[key] = value
            }
        }
}

class Configuration {
    private val properties = Properties()
    
    var apiURL by properties.string("api.url", "https://properties.kotlin.example.com/api")
    var cdnURL by properties.string("cdn.url", "//properties-cdn.kotlin.example.com/assets")
}

// Scope functions with URLs
fun scopeFunctionExample() {
    val config = APIConfig().apply {
        // Apply comment: https://apply-comment.kotlin.example.com/ignored
        println("Base URL: $baseURL")
    }
    
    val result = with(config) {
        "Configured with $baseURL"
    }
    
    config.let { cfg ->
        // Let comment: https://let-comment.kotlin.example.com/ignored
        println("Processing ${cfg.baseURL}")
    }
    
    val processedConfig = config.run {
        APIConfig(baseURL = "https://run.kotlin.example.com/api")
    }
}

// Main function
fun main() {
    // Main comment: https://main-comment.kotlin.example.com/ignored
    println("Starting Kotlin URL processing...")
    
    val client = APIClient.createDefault()
    val response = client.makeRequest("users")
    println(response)
    
    validateURLs()
    
    println("Processing completed")
}

/*
 * Large commented block with URLs (should be excluded by default)
 * This entire section contains multiple URLs that should not be detected:
 * - API server: https://block-comment.kotlin.example.com/api
 * - Documentation: http://block-docs.kotlin.example.com/guide
 * - Repository: https://github.block.kotlin.example.com/project
 * - Config file: file:///etc/kotlin/block-config.kt
 */

// Block comment immediately before declaration (edge case testing)
// https://kotlin-block-before.example.com/ignored
val immediateURL = "https://kotlin-immediate.example.com/after-comment"
// Comment
val blockBeforeVar = "https://kotlin-block-before-var.example.com"

/*
 * Multi-line comment
 * with https://kotlin-multiline-block.example.com/ignored
 */
val multilineBlock = "https://kotlin-after-multiline.example.com"

// End of file comment: https://end-kotlin.example.com/final
