# Python Example File - URL Detection Test Cases
# This file contains various URL patterns for testing the URL detector

import requests
import urllib.parse
from typing import List, Dict

# Single line comments with URLs (should be excluded by default)
# Documentation: https://docs.python.org/3/library/urllib.html
# Flask tutorial: http://flask.example.com/quickstart
# Django docs: //django.example.com/documentation
# Local development: http://127.0.0.1:8000/admin

"""
Multi-line docstring with URLs (should be excluded by default)
API Reference: https://python-api.example.com/reference
Package index: https://pypi.org/project/requests/
Tutorial site: http://python-tutorial.example.com/basics
CDN resources: //static.python.example.com/assets
"""

'''
Another multi-line string with URLs (should be excluded by default)
Alternative docs: https://alt-docs.python.example.com/guide
Repository: http://github.python.example.com/project
'''

# String variables with URLs (should be included)
API_BASE_URL = "https://api.python.example.com/v1"
STAGING_URL = "https://staging-api.python.example.com"
DEV_URL = "http://localhost:5000/api"
CDN_URL = "//cdn.python.example.com/static"
FILE_URL = "file:///home/user/config.json"

# Different quote types
single_quote_url = 'https://single.python.example.com/endpoint'
double_quote_url = "https://double.python.example.com/endpoint"
triple_single_url = '''https://triple-single.python.example.com/endpoint'''
triple_double_url = """https://triple-double.python.example.com/endpoint"""

# f-strings and string formatting
user_id = "123"
api_version = "v2"
formatted_url = f"https://api.python.example.com/{api_version}/users/{user_id}"
percent_format = "https://api.python.example.com/%s/data" % "endpoint"
format_method = "https://api.{}.example.com/{}".format("python", "resource")

# Dictionary with URLs
api_endpoints = {
    'production': 'https://prod.python.example.com/api',
    'staging': 'https://staging.python.example.com/api',
    'development': 'http://dev.python.example.com:8000/api',
    'cdn': '//cdn.python.example.com/assets',
    'websocket': 'wss://ws.python.example.com/socket',
    'file_storage': 'file:///var/app/storage/files'
}

# List of URLs
url_list = [
    "https://list.python.example.com/endpoint1",
    "http://list.python.example.com/endpoint2", 
    "//list.python.example.com/static/images",
    "ftp://files.python.example.com/downloads"
]

# Class with URL attributes
class ApiClient:
    """
    API client class with URL endpoints (docstring URLs should be excluded)
    Documentation: https://class-doc.python.example.com/api-client
    """
    
    # Class comment: https://class-comment.python.example.com/ignored
    base_url = "https://class.python.example.com"
    
    def __init__(self, base_url: str = None):
        # Constructor comment: https://init-comment.python.example.com/ignored
        self.base_url = base_url or "https://default.python.example.com"
        self.endpoints = {
            'users': f"{self.base_url}/users",
            'posts': f"{self.base_url}/posts"
        }
    
    def make_request(self, endpoint: str) -> str:
        """
        Make HTTP request to endpoint (docstring URLs should be excluded)
        Args:
            endpoint: API endpoint like https://method-doc.python.example.com/api
        Returns:
            Response from https://response-doc.python.example.com/api
        """
        # Method comment: https://method-comment.python.example.com/ignored
        full_url = f"{self.base_url}/{endpoint}"
        response = requests.get(full_url)
        return response.text

# Function with URLs
def process_urls(urls: List[str]) -> Dict[str, str]:
    # Function comment: https://function-comment.python.example.com/ignored
    results = {}
    
    for url in urls:
        # Loop comment: https://loop-comment.python.example.com/ignored
        parsed = urllib.parse.urlparse(url)
        results[url] = f"Processed: {parsed.netloc}"
    
    return results

# URL validation examples
def validate_urls():
    test_urls = [
        "https://validate.python.example.com/valid",
        "http://validate.python.example.com:8080/with-port",
        "//validate.python.example.com/protocol-relative",
        "file:///home/validate/config.yml",
        "ftp://validate.python.example.com/files",
        "sftp://secure.validate.python.example.com/secure-files"
    ]
    
    for url in test_urls:
        # Validation comment: https://validation-comment.python.example.com/ignored
        print(f"Validating: {url}")

# Raw strings (should still detect URLs)
raw_string_url = r"https://raw.python.example.com/endpoint"
regex_pattern = r"https?://[^\s<>\"'`]+"
test_regex_url = "https://regex-test.python.example.com/pattern"

# Protocol variations
protocols = {
    'https': 'https://secure.python.example.com/',
    'http': 'http://insecure.python.example.com/',
    'ftp': 'ftp://files.python.example.com/',
    'sftp': 'sftp://secure-files.python.example.com/',
    'file': 'file:///etc/python/config.conf',
    'websocket': 'wss://websocket.python.example.com/chat'
}

# Complex URL scenarios
complex_urls = {
    'with_auth': 'https://user:pass@auth.python.example.com/secure',
    'with_query': 'https://search.python.example.com?q=python&page=1&sort=date',
    'with_fragment': 'https://docs.python.example.com/guide#section-2',
    'with_port': 'https://api.python.example.com:9443/secure-endpoint',
    'long_path': 'https://api.python.example.com/very/long/path/to/resource/with/parameters',
    'encoded_chars': 'https://api.python.example.com/search?q=hello%20world&type=json'
}

# Conditional URL assignment
environment = "production"
if environment == "production":
    # Condition comment: https://condition-comment.python.example.com/ignored
    api_url = "https://prod-condition.python.example.com/api"
elif environment == "staging":
    api_url = "https://staging-condition.python.example.com/api"
else:
    api_url = "http://dev-condition.python.example.com:5000/api"

# Exception handling with URLs
try:
    response = requests.get("https://try.python.example.com/endpoint")
except requests.exceptions.RequestException:
    # Exception comment: https://exception-comment.python.example.com/ignored
    fallback_url = "https://fallback.python.example.com/api"
    print(f"Using fallback: {fallback_url}")

# Multiline string assignment (URLs should be included)
long_url = ("https://very-long-url.python.example.com/api/v1/resources/"
           "with-very-long-path/and-parameters?param1=value1&param2=value2")

multiline_url = """https://multiline.python.example.com/endpoint"""

# Lambda with URL
get_api_url = lambda env: f"https://lambda.{env}.python.example.com/api"

# Configuration dictionary
config = {
    # Comment in dict: https://dict-comment.python.example.com/ignored  
    'database_url': 'file:///var/lib/app/database.sqlite',
    'redis_url': 'redis://redis.python.example.com:6379/0',
    'api_base': 'https://config.python.example.com/api'
}

'''
Large commented block with URLs (should be excluded by default)
This entire section contains multiple URLs that should not be detected:
- API server: https://block-comment.python.example.com/api
- Documentation: http://block-docs.python.example.com/guide
- Repository: //github.block.python.example.com/project  
- Config file: file:///etc/block-config.json
'''

# Block comment immediately before URL usage (edge case testing)
# https://python-block-before.example.com/ignored 
immediate_url = "https://python-immediate.example.com/after-comment"
# Comment 
block_before_var = "https://python-block-before-var.example.com"

"""
Multi-line comment
with https://python-multiline-block.example.com/ignored
"""
multiline_block = "https://python-after-multiline.example.com"

# End of file comment: https://end-python.example.com/final
