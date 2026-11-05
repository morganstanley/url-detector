#!/bin/sh
# Entrypoint for the URL Detector GitHub Action.
#
# Installs the published @morgan-stanley/url-detector package (version taken
# from the `version` action input) and runs its CLI.
#
# Docker actions only support static `runs.args`, so conditional flags
# (e.g. --include-comments) cannot be wired there. GitHub does, however,
# expose every action input as an INPUT_* environment variable (input name
# upper-cased, dashes replaced with underscores), which this script uses to
# build the CLI invocation.

set -eu

package="@morgan-stanley/url-detector"
install_dir="/action"

# --- version -----------------------------------------------------------
# Fallback mirrors the default declared in action.yml.
version="${INPUT_VERSION:-0.1.0-beta.4}"
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

scan_patterns="${INPUT_SCAN_PATTERNS:-**/*}"
add_flag_values "--scan" "$scan_patterns"

if [ -n "${INPUT_EXCLUDE_PATTERNS:-}" ]; then
    add_flag_values "--exclude" "$INPUT_EXCLUDE_PATTERNS"
fi

if [ -n "${INPUT_SCAN_FILE:-}" ]; then
    add_flag_values "--scan-file" "$INPUT_SCAN_FILE"
fi

if [ -n "${INPUT_EXCLUDE_FILE:-}" ]; then
    add_flag_values "--exclude-file" "$INPUT_EXCLUDE_FILE"
fi

if [ -n "${INPUT_IGNORE_DOMAINS:-}" ]; then
    add_flag_values "--ignore-domains" "$INPUT_IGNORE_DOMAINS"
fi

if [ "${INPUT_INCLUDE_COMMENTS:-false}" = "true" ]; then
    add_flag "--include-comments"
fi

if [ "${INPUT_INCLUDE_NON_FQDN:-false}" = "true" ]; then
    add_flag "--include-non-fqdn"
fi

format="${INPUT_FORMAT:-table}"
case "$format" in
    table|json|csv)
        add_flag_values "--format" "$format"
        ;;
    *)
        echo "error: invalid format '$format' (expected table, json, or csv)" >&2
        exit 2
        ;;
esac

if [ -n "${INPUT_OUTPUT_FILE:-}" ]; then
    add_flag_values "--output" "$INPUT_OUTPUT_FILE"
fi

if [ "${INPUT_FAIL_ON_ERROR:-false}" = "true" ]; then
    add_flag "--fail-on-error"
fi

concurrency="${INPUT_CONCURRENCY:-10}"
case "$concurrency" in
    ''|*[!0-9]*)
        echo "error: concurrency '$concurrency' must be a positive integer" >&2
        exit 2
        ;;
esac
add_flag_values "--concurrency" "$concurrency"

if [ "${INPUT_RESULTS_ONLY:-false}" = "true" ]; then
    add_flag "--results-only"
fi

if [ "${INPUT_QUIET:-false}" = "true" ]; then
    add_flag "--quiet"
fi

# Unquoted $args on purpose: each space-separated value (glob patterns,
# domains) must become its own CLI argument.
exec node "$cli" $args
