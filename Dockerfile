# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the source code
COPY . .

# Create necessary config directories and env files if they don't exist
RUN mkdir -p ./config
RUN touch ./config/.env.production ./config/.env.development ./config/.env.test

# Generate Prisma client with production environment
RUN if [ -f "./config/.env.production" ]; then \
      npx dotenv -e ./config/.env.production -- prisma generate; \
    else \
      npx prisma generate; \
    fi

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Final stage
FROM node:20-alpine

WORKDIR /app

# Install netcat for health checks
RUN apk add --no-cache netcat-openbsd

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config.js ./config.js
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Prisma files needed for runtime
COPY --from=builder /app/prisma ./prisma

# Copy wait-for-it script
COPY scripts/wait-for-it.sh ./scripts/wait-for-it.sh
RUN chmod +x ./scripts/wait-for-it.sh

# Ensure the dist/config directory exists
RUN mkdir -p ./dist/config

# Ensure the views directory exists with necessary files
RUN mkdir -p ./dist/views

# Create a default health check endpoint HTML file
RUN echo '<!DOCTYPE html><html><head><title>LocationSearch Health</title></head><body><h1>Service is running</h1></body></html>' > ./dist/views/health.html

# Create a non-root user and set proper permissions
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8081

# Expose the application port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8081/api/health || exit 1

# Start the application
CMD ["npm", "start"]