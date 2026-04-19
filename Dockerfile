# Use Node.js as base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies for build
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Set entrypoint to the CLI
ENTRYPOINT ["node", "dist/cli.js"]