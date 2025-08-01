# Ruby Example File - URL Detection Test Cases
# This file contains various URL patterns for testing the URL detector

require 'net/http'
require 'uri'
require 'json'

# Single line comments with URLs (should be excluded by default)
# Ruby documentation: https://ruby-doc.org/core/
# Rails guides: https://guides.rubyonrails.org/
# RubyGems: https://rubygems.org/
# Local server: http://localhost:3000/admin

=begin
Multi-line comment with URLs (should be excluded by default)
Official docs: https://docs.ruby.example.com/reference
Tutorial site: http://ruby-tutorial.example.com/basics
Package repository: //gems.ruby.example.com/packages
=end

# String variables with URLs (should be included)
API_BASE_URL = 'https://api.ruby.example.com/v1'
STAGING_URL = 'https://staging-api.ruby.example.com'
DEV_URL = 'http://localhost:4000/api'
CDN_URL = '//cdn.ruby.example.com/assets'
FILE_URL = 'file:///home/user/config.yaml'

# Different quote types
single_quote_url = 'https://single.ruby.example.com/endpoint'
double_quote_url = "https://double.ruby.example.com/endpoint"

# String interpolation
version = 'v2'
user_id = '123'
interpolated_url = "https://api.ruby.example.com/#{version}/users/#{user_id}"
string_concat = 'https://api.ruby.example.com/' + version + '/resource'

# Heredoc syntax
heredoc_url = <<~EOF
  https://heredoc.ruby.example.com/endpoint
EOF

# Squiggly heredoc (Ruby 2.3+)
squiggly_heredoc = <<~URL
  https://squiggly.ruby.example.com/endpoint
URL

# Hash with URLs
api_endpoints = {
  production: 'https://prod.ruby.example.com/api',
  staging: 'https://staging.ruby.example.com/api',
  development: 'http://dev.ruby.example.com:8000/api',
  cdn: '//cdn.ruby.example.com/static',
  websocket: 'wss://ws.ruby.example.com/socket',
  file_storage: 'file:///var/app/storage/files'
}

# Array with URLs
url_array = [
  'https://array.ruby.example.com/endpoint1',
  'http://array.ruby.example.com/endpoint2',
  '//array.ruby.example.com/static/resources',
  'ftp://files.ruby.example.com/downloads'
]

# Class with URL attributes
class ApiClient
  # Class comment: https://class-comment.ruby.example.com/ignored
  attr_accessor :base_url, :endpoints
  attr_reader :public_url
  
  BASE_URL = 'https://class.ruby.example.com'
  
  def initialize(base_url = nil)
    # Constructor comment: https://init-comment.ruby.example.com/ignored
    @base_url = base_url || 'https://default.ruby.example.com'
    @endpoints = {
      users: "#{@base_url}/users",
      posts: "#{@base_url}/posts"
    }
    @public_url = 'https://public.ruby.example.com/api'
  end
  
  def make_request(endpoint)
    # Method comment: https://method-comment.ruby.example.com/ignored
    full_url = "#{@base_url}/#{endpoint}"
    uri = URI(full_url)
    Net::HTTP.get(uri)
  end
  
  def self.default_urls
    {
      api: 'https://class-method.ruby.example.com/api',
      docs: 'https://class-docs.ruby.example.com'
    }
  end
  
  private
  
  def private_url
    'https://private.ruby.example.com/internal'
  end
end

# Module with URLs
module UrlHelpers
  # Module comment: https://module-comment.ruby.example.com/ignored
  
  def self.included(base)
    base.extend(ClassMethods)
  end
  
  module ClassMethods
    def api_url
      'https://module-class.ruby.example.com/api'
    end
  end
  
  def instance_url
    'https://module-instance.ruby.example.com/helper'
  end
end

# Method with URLs
def process_urls(urls)
  # Function comment: https://function-comment.ruby.example.com/ignored
  results = {}
  
  urls.each do |url|
    # Loop comment: https://loop-comment.ruby.example.com/ignored
    parsed = URI.parse(url)
    results[url] = "Processed: #{parsed.host}"
  end
  
  results
end

# URL validation method
def validate_urls
  test_urls = [
    'https://validate.ruby.example.com/valid',
    'http://validate.ruby.example.com:8080/with-port',
    '//validate.ruby.example.com/protocol-relative',
    'file:///var/app/config.rb',
    'ftp://validate.ruby.example.com/files',
    'sftp://secure.validate.ruby.example.com/secure-files'
  ]
  
  test_urls.each do |url|
    # Validation comment: https://validation-comment.ruby.example.com/ignored
    puts "Validating: #{url}"
  end
end

# Constants with URLs
PROTOCOL_URLS = {
  https: 'https://secure.ruby.example.com/',
  http: 'http://insecure.ruby.example.com/',
  ftp: 'ftp://files.ruby.example.com/',
  sftp: 'sftp://secure-files.ruby.example.com/',
  file: 'file:///etc/ruby/config.yml',
  websocket: 'wss://websocket.ruby.example.com/chat'
}.freeze

# Complex URL scenarios
COMPLEX_URLS = {
  with_auth: 'https://user:pass@auth.ruby.example.com/secure',
  with_query: 'https://search.ruby.example.com?q=ruby&page=1&sort=date',
  with_fragment: 'https://docs.ruby.example.com/guide#section-4',
  with_port: 'https://api.ruby.example.com:9443/secure-endpoint',
  long_path: 'https://api.ruby.example.com/very/long/path/to/resource/with/params',
  encoded_chars: 'https://api.ruby.example.com/search?q=hello%20world&type=json'
}.freeze

# Conditional URL assignment
environment = 'production'
api_url = case environment
          when 'production'
            # Case comment: https://case-comment.ruby.example.com/ignored
            'https://prod-case.ruby.example.com/api'
          when 'staging'
            'https://staging-case.ruby.example.com/api'
          else
            'http://dev-case.ruby.example.com:4000/api'
          end

# If statement with URLs
if environment == 'production'
  # Condition comment: https://condition-comment.ruby.example.com/ignored
  conditional_url = 'https://prod-condition.ruby.example.com/api'
elsif environment == 'staging'
  conditional_url = 'https://staging-condition.ruby.example.com/api'
else
  conditional_url = 'http://dev-condition.ruby.example.com:4000/api'
end

# Exception handling with URLs
begin
  response = Net::HTTP.get(URI('https://try.ruby.example.com/endpoint'))
rescue StandardError => e
  # Exception comment: https://exception-comment.ruby.example.com/ignored
  fallback_url = 'https://fallback.ruby.example.com/api'
  puts "Using fallback: #{fallback_url}"
end

# Block with URL
url_processor = proc do |url|
  "Processing: #{url}"
end

# Lambda with URL
get_api_url = lambda { |env| "https://lambda.#{env}.ruby.example.com/api" }

# Method chaining with URLs
chain_result = ['https://chain.ruby.example.com/api']
              .map { |url| URI.parse(url) }
              .select { |uri| uri.scheme == 'https' }
              .first

# Regular expression with URL
url_regex = /https?:\/\/[^\s<>"'`]+/
test_regex_url = 'https://regex-test.ruby.example.com/pattern'

# JSON parsing with URLs
json_config = '{"api_url": "https://json.ruby.example.com/api", "cdn": "//json-cdn.ruby.example.com"}'
parsed_json = JSON.parse(json_config)

# Metaprogramming with URLs
class DynamicUrls
  # Define methods dynamically
  %w[api cdn files].each do |service|
    define_method("#{service}_url") do
      "https://#{service}.dynamic.ruby.example.com"
    end
  end
  
  # Class eval with URL
  class_eval do
    def eval_url
      'https://eval.ruby.example.com/method'
    end
  end
end

# Struct with URLs
ApiConfig = Struct.new(:base_url, :cdn_url, :api_key) do
  def full_api_url
    "#{base_url}/api/v1"
  end
end

config = ApiConfig.new(
  'https://struct.ruby.example.com',
  '//struct-cdn.ruby.example.com',
  'api-key-123'
)

# OpenStruct with URLs
require 'ostruct'
open_config = OpenStruct.new(
  api_url: 'https://ostruct.ruby.example.com/api',
  webhook_url: 'https://ostruct-webhook.ruby.example.com/hooks'
)

# Singleton class with URL
class << self
  def singleton_url
    'https://singleton.ruby.example.com/method'
  end
end

# Rails-style configuration (if Rails were loaded)
# config.api_base_url = 'https://rails-config.ruby.example.com/api'

# Rack application URLs
rack_app = proc do |env|
  api_url = 'https://rack.ruby.example.com/api'
  [200, {}, ["API URL: #{api_url}"]]
end

# Thread with URL
thread = Thread.new do
  # Thread comment: https://thread-comment.ruby.example.com/ignored
  thread_url = 'https://thread.ruby.example.com/background'
  puts "Thread processing: #{thread_url}"
end

# Fiber with URL
fiber = Fiber.new do
  fiber_url = 'https://fiber.ruby.example.com/async'
  Fiber.yield fiber_url
end

=begin
Large commented block with URLs (should be excluded by default)
This entire section contains multiple URLs that should not be detected:
- API server: https://block-comment.ruby.example.com/api
- Documentation: http://block-docs.ruby.example.com/guide
- Repository: //github.block.ruby.example.com/project
- Config file: file:///etc/ruby/block-config.yml
=end

# Block comment immediately before URL usage (edge case testing)
# https://ruby-block-before.example.com/ignored
immediate_url = 'https://ruby-immediate.example.com/after-comment'
# Comment
block_before_var = "https://ruby-block-before-var.example.com"

=begin
Multi-line comment
with https://ruby-multiline-block.example.com/ignored
=end
multiline_block = 'https://ruby-after-multiline.example.com'

# End of file comment: https://end-ruby.example.com/final
