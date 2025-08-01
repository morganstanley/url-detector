#!/bin/bash
# Bash Example File - URL Detection Test Cases
# This file contains various URL patterns for testing the URL detector

# Single line comments with URLs (should be excluded by default)
# Bash documentation: https://www.gnu.org/software/bash/manual/
# Shell scripting guide: https://bash-guide.example.com/tutorial
# Package manager: https://apt.example.com/packages
# Local development: http://localhost:7000/status

# Variable assignments with URLs (should be included)
API_BASE_URL="https://api.bash.example.com/v1"
STAGING_URL="https://staging-api.bash.example.com"
DEV_URL="http://localhost:7000/api"
CDN_URL="//cdn.bash.example.com/assets"
FILE_URL="file:///home/user/config.sh"

# Different quote types
SINGLE_QUOTE_URL='https://single.bash.example.com/endpoint'
DOUBLE_QUOTE_URL="https://double.bash.example.com/endpoint"
NO_QUOTE_URL=https://noquote.bash.example.com/endpoint

# String interpolation and command substitution
VERSION="v2"
USER_ID="123"
INTERPOLATED_URL="https://api.bash.example.com/${VERSION}/users/${USER_ID}"
COMMAND_SUB_URL="https://api.$(hostname).bash.example.com/local"

# Arrays with URLs
declare -a URL_ARRAY=(
    "https://array.bash.example.com/endpoint1"
    "http://array.bash.example.com/endpoint2"
    "//array.bash.example.com/static/resources"
    "ftp://files.bash.example.com/downloads"
)

# Associative arrays with URLs
declare -A API_ENDPOINTS=(
    ["production"]="https://prod.bash.example.com/api"
    ["staging"]="https://staging.bash.example.com/api"
    ["development"]="http://dev.bash.example.com:8000/api"
    ["cdn"]="//cdn.bash.example.com/static"
    ["websocket"]="wss://ws.bash.example.com/socket"
    ["file_storage"]="file:///var/app/storage/files"
)

# Protocol variations
PROTOCOLS=(
    "https://secure.bash.example.com/"
    "http://insecure.bash.example.com/"
    "ftp://files.bash.example.com/"
    "sftp://secure-files.bash.example.com/"
    "file:///etc/bash/config.conf"
    "ssh://remote.bash.example.com:22"
)

# Complex URL scenarios
COMPLEX_URLS=(
    "https://user:pass@auth.bash.example.com/secure"
    "https://search.bash.example.com?q=bash&page=1&sort=date"
    "https://docs.bash.example.com/guide#section-10"
    "https://api.bash.example.com:9443/secure-endpoint"
    "https://api.bash.example.com/very/long/path/to/resource/with/params"
    "https://api.bash.example.com/search?q=hello%20world&type=bash"
)

# Function with URLs
function process_urls() {
    # Function comment: https://function-comment.bash.example.com/ignored
    local urls=("$@")
    
    for url in "${urls[@]}"; do
        # Loop comment: https://loop-comment.bash.example.com/ignored
        echo "Processing: $url"
        # You could use curl, wget, etc. here
    done
}

# Function to validate URLs
validate_urls() {
    local test_urls=(
        "https://validate.bash.example.com/valid"
        "http://validate.bash.example.com:8080/with-port"
        "//validate.bash.example.com/protocol-relative"
        "file:///var/app/config.sh"
        "ftp://validate.bash.example.com/files"
        "sftp://secure.validate.bash.example.com/secure-files"
    )
    
    for test_url in "${test_urls[@]}"; do
        # Validation comment: https://validation-comment.bash.example.com/ignored
        echo "Validating: $test_url"
    done
}

# Conditional URL assignment
ENVIRONMENT="production"
if [[ "$ENVIRONMENT" == "production" ]]; then
    # Condition comment: https://condition-comment.bash.example.com/ignored
    API_URL="https://prod-condition.bash.example.com/api"
elif [[ "$ENVIRONMENT" == "staging" ]]; then
    API_URL="https://staging-condition.bash.example.com/api"
else
    API_URL="http://dev-condition.bash.example.com:7000/api"
fi

# Case statement with URLs
case "$ENVIRONMENT" in
    "prod")
        # Case comment: https://case-comment.bash.example.com/ignored
        CASE_URL="https://case-prod.bash.example.com/api"
        ;;
    "dev")
        CASE_URL="http://case-dev.bash.example.com:8080/api"
        ;;
    *)
        CASE_URL="https://case-default.bash.example.com/api"
        ;;
esac

# Error handling with URLs
make_request() {
    local url="https://try.bash.example.com/endpoint"
    
    if ! curl -f "$url" &>/dev/null; then
        # Error comment: https://error-comment.bash.example.com/ignored
        local fallback_url="https://fallback.bash.example.com/api"
        echo "Using fallback: $fallback_url"
        curl "$fallback_url"
    fi
}

# Command line operations with URLs
curl_examples() {
    # HTTP GET request
    curl "https://curl.bash.example.com/api/data"
    
    # HTTP POST request with JSON
    curl -X POST \
         -H "Content-Type: application/json" \
         -d '{"key": "value"}' \
         "https://curl-post.bash.example.com/api"
    
    # Download file
    wget "https://wget.bash.example.com/file.tar.gz"
    
    # Upload file
    scp file.txt user@upload.bash.example.com:/path/to/destination
}

# Environment variable exports
export API_URL="https://export.bash.example.com/api"
export CDN_BASE="//export-cdn.bash.example.com/assets"
export WEBHOOK_URL="https://export-webhook.bash.example.com/hooks"

# Read URLs from file
read_urls_from_file() {
    # Read comment: https://read-comment.bash.example.com/ignored
    while IFS= read -r line; do
        if [[ "$line" =~ ^https?:// ]]; then
            echo "Found URL: $line"
        fi
    done < <(echo -e "https://file-read.bash.example.com/line1\nhttp://file-read.bash.example.com/line2")
}

# Here document with URLs
cat << EOF > config.txt
# Configuration file with URLs
api_url=https://heredoc.bash.example.com/api
cdn_url=//heredoc-cdn.bash.example.com/assets
webhook_url=https://heredoc-webhook.bash.example.com/hooks
EOF

# Here string with URL
grep "api" <<< "https://herestring.bash.example.com/api/endpoint"

# Process substitution with URLs
diff <(curl -s "https://compare1.bash.example.com/data") \
     <(curl -s "https://compare2.bash.example.com/data")

# URL in pipe operations
echo "https://pipe.bash.example.com/api" | xargs curl -s | jq '.'

# Background job with URL
{
    # Background comment: https://background-comment.bash.example.com/ignored
    sleep 5
    curl "https://background.bash.example.com/api"
} &

# Subshell with URL
(
    cd /tmp
    wget "https://subshell.bash.example.com/file.zip"
    unzip file.zip
)

# Command substitution with URLs
RESPONSE=$(curl -s "https://command-sub.bash.example.com/api")
API_VERSION=`curl -s "https://version.bash.example.com/api/version" | jq -r '.version'`

# Arithmetic expansion (unusual but possible)
PORT=$((8000 + 80))
CALC_URL="https://calc.bash.example.com:${PORT}/api"

# Parameter expansion with URLs
BASE_URL="https://param.bash.example.com"
API_ENDPOINT="${BASE_URL}/api"
API_VERSION="${BASE_URL##*/}/v1"  # Extract version from URL

# Regex matching URLs
url_pattern="https?://[^[:space:]]+"
test_string="Visit https://regex.bash.example.com/test for more info"
if [[ "$test_string" =~ $url_pattern ]]; then
    echo "Found URL: ${BASH_REMATCH[0]}"
fi

# Select menu with URLs
select_api_endpoint() {
    local endpoints=(
        "https://select.bash.example.com/api/v1"
        "https://select.bash.example.com/api/v2"
        "http://select.bash.example.com:8080/api"
    )
    
    echo "Select an API endpoint:"
    select endpoint in "${endpoints[@]}"; do
        # Select comment: https://select-comment.bash.example.com/ignored
        echo "Selected: $endpoint"
        break
    done
}

# Trap with URL (for cleanup)
cleanup() {
    # Cleanup comment: https://cleanup-comment.bash.example.com/ignored
    curl -X POST "https://cleanup.bash.example.com/session-end"
}
trap cleanup EXIT

# Signal handling with URL
handle_interrupt() {
    echo "Interrupted! Notifying server..."
    curl -X POST "https://interrupt.bash.example.com/interrupt"
    exit 1
}
trap handle_interrupt INT

# Job control with URLs
start_background_services() {
    # Start API service
    nohup python -m http.server 8080 &
    API_PID=$!
    
    # Register with service discovery
    curl -X POST \
         -d "service_url=http://localhost:8080" \
         "https://discovery.bash.example.com/register"
}

# Configuration file sourcing
# source /path/to/config.sh  # Might contain URLs

# Logging with URLs
log_message() {
    local message="$1"
    local log_url="https://logging.bash.example.com/ingest"
    
    # Log comment: https://log-comment.bash.example.com/ignored
    curl -X POST \
         -H "Content-Type: application/json" \
         -d "{\"message\": \"$message\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
         "$log_url"
}

# Main execution
main() {
    # Main comment: https://main-comment.bash.example.com/ignored
    echo "Starting URL processing script..."
    
    validate_urls
    process_urls "${URL_ARRAY[@]}"
    
    echo "Script completed successfully"
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

# Multiline comments (using : and heredoc)
: << 'COMMENT'
Large commented block with URLs (should be excluded by default)
This entire section contains multiple URLs that should not be detected:
- API server: https://block-comment.bash.example.com/api
- Documentation: http://block-docs.bash.example.com/guide
- Repository: https://github.block.bash.example.com/project
- Config file: file:///etc/bash/block-config.sh
COMMENT

# Block comment immediately before assignment (edge case testing)
# https://bash-block-before.example.com/ignored
IMMEDIATE_URL="https://bash-immediate.example.com/after-comment"
# Comment
BLOCK_BEFORE_VAR="https://bash-block-before-var.example.com"

: << 'MULTILINE_COMMENT'
Multi-line comment
with https://bash-multiline-block.example.com/ignored
MULTILINE_COMMENT
MULTILINE_BLOCK="https://bash-after-multiline.example.com"

# End of file comment: https://end-bash.example.com/final
