# Container image for the URL Detector GitHub Action.
#
# The image intentionally ships no source and runs no build: at runtime the
# entrypoint installs the published @morgan-stanley/url-detector package from
# the npm registry (version controlled by the `version` action input) and
# runs its CLI. Keeping the image minimal makes it cheap to build and means
# publishing a new package version is all that's needed to ship updates.
FROM node:22-slim

# Dedicated non-root user plus the directory the package is installed into.
RUN useradd --create-home --shell /bin/bash url-detector \
    && mkdir -p /action \
    && chown url-detector /action

COPY action-entrypoint.sh /usr/local/bin/action-entrypoint.sh
RUN chmod 755 /usr/local/bin/action-entrypoint.sh

USER url-detector

ENTRYPOINT ["/usr/local/bin/action-entrypoint.sh"]
