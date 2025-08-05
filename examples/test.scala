// Scala Example File - URL Detection Test Cases
// This file contains various URL patterns for testing the URL detector

package com.example.urltest

import java.net.{URL, URI}
import scala.collection.immutable.List

// Single line comments with URLs (should be excluded by default)
// Official documentation: https://docs.scala-lang.org/
// Scala.js guide: https://www.scala-js.org/doc/
// SBT documentation: https://www.scala-sbt.org/documentation.html

/*
 * Multi-line comment with URLs (should be excluded by default)
 * Akka documentation: https://doc.akka.io/docs/akka/current/
 * Play Framework: https://www.playframework.com/documentation
 * Cats library: //typelevel.org/cats/
 */

/**
 * ScalaDoc comment with URLs (should be excluded by default)
 * @see https://scaladoc.example.com/api-reference
 * @author Developer (https://developer.example.com/profile)
 * @since 2.13 (http://releases.example.com/v2.13)
 */
object UrlTestExample {

  // String constants with URLs (should be included)
  private val ApiBaseUrl = "https://api.example.com/v1"
  private val StagingUrl = "https://staging.api.example.com"
  private val DevUrl = "http://localhost:8080/api"
  private val CdnUrl = "//cdn.example.com/assets"
  private val FileUrl = "file:///home/app/config.properties"

  // Protocol variations
  private val HttpsUrl = "https://secure.example.com/login"
  private val HttpUrl = "http://insecure.example.com/public"
  private val FtpUrl = "ftp://files.example.com/downloads"
  private val WebSocketUrl = "wss://websocket.example.com/chat"

  // Comment in field declaration: https://field-comment.example.com/ignored
  val baseUrl: String = "https://instance.api.example.com"

  // Case class with URL parameter
  case class ApiConfig(
    // Comment in case class: https://case-class-comment.example.com/ignored
    apiUrl: String = "https://default.api.example.com",
    timeout: Int = 30
  )

  // Method with URL strings (should be included)
  def getEndpoints: List[String] = List(
    "https://api.example.com/users",
    "https://api.example.com/posts",
    "http://legacy.api.example.com/old-endpoint",
    "//cdn.example.com/static/images",
    "file:///opt/app/data/cache.db"
  )

  /**
   * Method documentation with URLs (should be excluded by default)
   * @param endpoint API endpoint URL like https://method-doc.example.com/endpoint
   * @return Response from https://response-doc.example.com/api
   */
  def makeRequest(endpoint: String): String = {
    // Implementation comment: https://impl-comment.example.com/ignored
    val fullUrl = s"$baseUrl/$endpoint"
    println(s"Making request to: $fullUrl")
    "Response data"
  }

  // URL manipulation methods with Scala features
  def demonstrateUrls(): Unit = {
    // String interpolation
    val userId = getUserId
    val dynamicUrl = s"https://api.example.com/users/$userId"

    // String interpolation with expressions
    val environment = getEnvironment
    val formattedUrl = s"https://api.$environment.example.com/data"

    // StringBuilder equivalent
    val urlBuilder = new StringBuilder("https://builder.example.com")
    urlBuilder.append("/path").append("?param=value")

    // URL parsing examples
    try {
      val url1 = new URL("https://scala-url.example.com/path")
      val uri1 = new URI("https://scala-uri.example.com/resource")

      // Protocol relative URL
      val url2 = new URL("//protocol-relative.example.com/assets/style.css")

    } catch {
      // Exception comment: https://exception-comment.example.com/ignored
      case _: Exception => System.err.println("URL parsing failed")
    }
  }

  // Trait with URLs
  trait ApiClient {
    // Comment in trait: https://trait-comment.example.com/ignored
    val DefaultEndpoint: String = "https://trait.api.example.com"

    def callApi(url: String): Unit
  }

  // Sealed trait for environments (similar to enum)
  sealed trait Environment {
    def baseUrl: String
  }

  case object Production extends Environment {
    val baseUrl = "https://production.example.com"
  }

  case object Staging extends Environment {
    val baseUrl = "https://staging.example.com"
  }

  case object Development extends Environment {
    val baseUrl = "http://development.example.com:3000"
  }

  case object Local extends Environment {
    val baseUrl = "http://localhost:8080"
  }

  // Pattern matching with URLs
  def getUrlByEnvironment(env: String): String = env match {
    case "prod" => "https://prod.pattern.example.com"
    case "stage" => "https://stage.pattern.example.com"
    case "dev" => "http://dev.pattern.example.com:3000"
    case _ => "http://localhost:8080"
  }

  // Complex URL scenarios with Scala collections
  private def complexUrlScenarios(): Unit = {
    // List of URLs
    val urls = List(
      "https://list.example.com/endpoint1",
      "http://list.example.com/endpoint2",
      "//list.example.com/static/resources"
    )

    // Map with URLs as values
    val urlMap = Map(
      "api" -> "https://map.api.example.com",
      "cdn" -> "//map.cdn.example.com",
      "docs" -> "https://map.docs.example.com"
    )

    // URL with query parameters using string interpolation
    val query = "scala"
    val page = 1
    val queryUrl = s"https://search.example.com?q=$query&type=tutorial&page=$page"

    // URL with authentication
    val authUrl = "https://user:password@secure.example.com/private"

    // File protocol variations
    val linuxFile = "file:///home/user/documents/data.json"
    val windowsFile = "file:///C:/Users/Admin/Documents/config.xml"

    // Special protocols in Scala collections
    val specialProtocols = Vector(
      "ftp://files.example.com/public/download.zip",
      "sftp://secure.files.example.com/private/backup.tar.gz",
      "ftps://encrypted.files.example.com/archive/data.sql"
    )

    // Option with URL
    val optionalUrl: Option[String] = Some("https://optional.example.com/maybe")

    // Either with URLs
    val eitherUrl: Either[String, String] = Right("https://either.example.com/success")
  }

  // Companion object pattern
  class ScalaApiClient(val baseUrl: String) extends ApiClient {
    // Comment in class: https://class-comment.example.com/ignored
    private val timeout = 30

    override def callApi(url: String): Unit = {
      val fullUrl = s"$baseUrl$url"
      println(s"Calling: $fullUrl")
    }
  }

  object ScalaApiClient {
    // Comment in companion object: https://companion-comment.example.com/ignored
    def apply(baseUrl: String): ScalaApiClient = new ScalaApiClient(baseUrl)

    val defaultClient = new ScalaApiClient("https://companion.api.example.com")
  }

  // Higher-order functions with URLs
  def processUrls(urls: List[String])(processor: String => String): List[String] = {
    urls.map(processor)
  }

  val urlProcessor: String => String = url => {
    if (url.startsWith("https://")) url
    else s"https://processed.example.com/redirect?url=$url"
  }

  // For comprehension with URLs
  def generateUrls: List[String] = {
    val protocols = List("http", "https")
    val domains = List("api.example.com", "cdn.example.com")
    val paths = List("/users", "/posts")

    for {
      protocol <- protocols
      domain <- domains
      path <- paths
    } yield s"$protocol://$domain$path"
  }

  // Annotation with URL (should be included in annotation value)
  @deprecated("Use new API at https://annotation.example.com/v2", "2.0")
  def oldMethod(): Unit = {
    // Method implementation
  }

  private def getUserId: String = "123"
  private def getEnvironment: String = "prod"
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
/* https://scala-block-before.example.com/ignored */ val immediateUrl = "https://scala-immediate.example.com/after-comment"
/* Comment */ val blockBeforeVar = "https://scala-block-before-var.example.com"

/* Multi
 * line comment
 * with https://scala-multiline-block.example.com/ignored
 */
val multilineBlock = "https://scala-after-multiline.example.com"

// End of file comment: https://end-scala.example.com/final
