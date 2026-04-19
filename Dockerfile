# Use Node.js as base image
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) for building
RUN npm ci

# Copy source code
COPY . .

# Build the project using npx tsc
RUN npx tsc

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create a non-root user
RUN useradd --create-home --shell /bin/bash nextjs

# Switch to the non-root user
USER nextjs

# Set entrypoint to run CLI with node
ENTRYPOINT ["node", "/app/dist/cli.js"]