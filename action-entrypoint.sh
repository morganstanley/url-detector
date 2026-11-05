#!/bin/sh
# Entrypoint for the URL Detector GitHub Action.
#
# Installs the published @morgan-stanley/url-detector package (version taken
# from the `version` action input) and runs its CLI.
#
# Docker actions only support static `runs.args`, so conditional flags
# (e.g. --include-comments) cannot be wired there. Instead, GitHub passes
# every action input into the container as an environment variable named
# INPUT_<NAME> (upper-cased, dashes preserved, e.g. INPUT_SCAN-PATTERNS).
# This script reads those variables to build the CLI invocation.

set -eu

package="@morgan-stanley/url-detector"
install_dir="/action"

# Read an action input by name (e.g. SCAN-PATTERNS); empty when unset.
# GitHub passes docker-action inputs as INPUT_<NAME> with the original
# dashes (e.g. INPUT_SCAN-PATTERNS); some environments normalize dashes
# to underscores, so check both forms.
input() {
    v="$(printenv "INPUT_$1" 2>/dev/null || true)"
    if [ -z "$v" ]; then
        v="$(printenv "INPUT_$(printf '%s' "$1" | tr '-' '_')" 2>/dev/null || true)"
    fi
    printf '%s' "$v"
}

input_count="$(env | grep -c '^INPUT_' 2>/dev/null || true)"
echo "Detected $input_count action input(s) in the container environment"

# --- version -----------------------------------------------------------
# Fallback mirrors the default declared in action.yml.
version="$(input VERSION)"
if [ -z "$version" ]; then
    version="0.1.0-beta.4"
fi
case "$version" in
    ''|*[!A-Za-z0-9._-]*)
        echo "error: version '$version' is not a valid semver or dist-tag" >&2
        exit 2
        ;;
esac

echo "Installing $package@$version ..."
npm install --prefix "$install_dir" --no-audit --no-fund --loglevel=error \
    "$package@$version"

cli="$install_dir/node_modules/$package/dist/cli.js"
if [ ! -f "$cli" ]; then
    echo "error: $package@$version installed but $cli was not found" >&2
    exit 2
fi

# --- CLI arguments -------------------------------------------------------
args=""

# Append a boolean flag (present = enabled).
add_flag() {
    args="$args $1"
}

# Append a flag with one or more space-separated values.
add_flag_values() {
    args="$args $1 $2"
}

scan_patterns="$(input SCAN-PATTERNS)"
if [ -z "$scan_patterns" ]; then
    scan_patterns="**/*"
fi
add_flag_values "--scan" "$scan_patterns"

exclude_patterns="$(input EXCLUDE-PATTERNS)"
if [ -n "$exclude_patterns" ]; then
    add_flag_values "--exclude" "$exclude_patterns"
fi

scan_file="$(input SCAN-FILE)"
if [ -n "$scan_file" ]; then
    add_flag_values "--scan-file" "$scan_file"
fi

exclude_file="$(input EXCLUDE-FILE)"
if [ -n "$exclude_file" ]; then
    add_flag_values "--exclude-file" "$exclude_file"
fi

ignore_domains="$(input IGNORE-DOMAINS)"
if [ -n "$ignore_domains" ]; then
    add_flag_values "--ignore-domains" "$ignore_domains"
fi

if [ "$(input INCLUDE-COMMENTS)" = "true" ]; then
    add_flag "--include-comments"
fi

if [ "$(input INCLUDE-NON-FQDN)" = "true" ]; then
    add_flag "--include-non-fqdn"
fi

format="$(input FORMAT)"
if [ -z "$format" ]; then
    format="table"
fi
case "$format" in
    table|json|csv)
        add_flag_values "--format" "$format"
        ;;
    *)
        echo "error: invalid format '$format' (expected table, json, or csv)" >&2
        exit 2
        ;;
esac

output_file="$(input OUTPUT-FILE)"
if [ -n "$output_file" ]; then
    add_flag_values "--output" "$output_file"
fi

if [ "$(input FAIL-ON-ERROR)" = "true" ]; then
    add_flag "--fail-on-error"
fi

concurrency="$(input CONCURRENCY)"
if [ -z "$concurrency" ]; then
    concurrency="10"
fi
case "$concurrency" in
    ''|*[!0-9]*)
        echo "error: concurrency '$concurrency' must be a positive integer" >&2
        exit 2
        ;;
esac
add_flag_values "--concurrency" "$concurrency"

if [ "$(input RESULTS-ONLY)" = "true" ]; then
    add_flag "--results-only"
fi

if [ "$(input QUIET)" = "true" ]; then
    add_flag "--quiet"
fi

# Unquoted $args on purpose: each space-separated value (glob patterns,
# domains) must become its own CLI argument.
exec node "$cli" $args
