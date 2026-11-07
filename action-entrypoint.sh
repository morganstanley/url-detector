#!/bin/sh
# Entrypoint for the URL Detector GitHub Action.
#
# Installs the published @morgan-stanley/url-detector package (version taken
# from the `version` input) and runs its CLI.
#
# Docker container actions receive inputs via runs.args (GitHub only
# guarantees INPUT_* env vars for inputs whose names contain no dashes).
# action.yml passes every input as a positional argument, in the same order
# as the inputs are declared in action.yml. This script maps those positions
# to CLI flags. Keep the two files in sync if inputs are added or reordered.

set -eu

package="@morgan-stanley/url-detector"
install_dir="/action"

# Positional inputs (order matches action.yml inputs). ${N-} is safe under
# set -u and yields an empty string for an unset slot.
version="${1-}"
scan_patterns="${2-}"
exclude_patterns="${3-}"
scan_file="${4-}"
exclude_file="${5-}"
ignore_domains="${6-}"
include_comments="${7-}"
include_non_fqdn="${8-}"
format="${9-}"
output_file="${10-}"
fail_on_error="${11-}"
concurrency="${12-}"
results_only="${13-}"
quiet="${14-}"
config="${15-}"

# --- version -----------------------------------------------------------
# Fallback mirrors the default declared in action.yml.
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

# Only forwarded when the caller actually set it; otherwise the CLI's own
# default (or a discovered configuration file) applies.
if [ -n "$scan_patterns" ]; then
    add_flag_values "--scan" "$scan_patterns"
fi

if [ -n "$exclude_patterns" ]; then
    add_flag_values "--exclude" "$exclude_patterns"
fi

if [ -n "$scan_file" ]; then
    add_flag_values "--scan-file" "$scan_file"
fi

if [ -n "$exclude_file" ]; then
    add_flag_values "--exclude-file" "$exclude_file"
fi

if [ -n "$ignore_domains" ]; then
    add_flag_values "--ignore-domains" "$ignore_domains"
fi

if [ "$include_comments" = "true" ]; then
    add_flag "--include-comments"
fi

if [ "$include_non_fqdn" = "true" ]; then
    add_flag "--include-non-fqdn"
fi

# Only forwarded when the caller actually set it; otherwise the CLI's own
# default (or a discovered configuration file) applies.
if [ -n "$format" ]; then
    case "$format" in
        table|json|csv)
            add_flag_values "--format" "$format"
            ;;
        *)
            echo "error: invalid format '$format' (expected table, json, or csv)" >&2
            exit 2
            ;;
    esac
fi

if [ -n "$output_file" ]; then
    add_flag_values "--output" "$output_file"
fi

if [ "$fail_on_error" = "true" ]; then
    add_flag "--fail-on-error"
fi

# Only forwarded when the caller actually set it; otherwise the CLI's own
# default (or a discovered configuration file) applies.
if [ -n "$concurrency" ]; then
    case "$concurrency" in
        ''|*[!0-9]*)
            echo "error: concurrency '$concurrency' must be a positive integer" >&2
            exit 2
            ;;
    esac
    add_flag_values "--concurrency" "$concurrency"
fi

if [ "$results_only" = "true" ]; then
    add_flag "--results-only"
fi

if [ "$quiet" = "true" ]; then
    add_flag "--quiet"
fi

if [ -n "$config" ]; then
    add_flag_values "--config" "$config"
fi

# Unquoted $args on purpose: each space-separated value (glob patterns,
# domains) must become its own CLI argument.
exec node "$cli" $args
