# Simple multi-stage Dockerfile for Next.js Storefront

########################
# 1) Build stage
########################
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (prod + dev) for build
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

# Set dummy env var for build (override at runtime in K8s)
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy-build-key

# Build the application
RUN npm run build

########################
# 2) Runtime stage
########################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only package files and install prod dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --frozen-lockfile

# Copy built assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 8000

# Start production server
CMD ["npm", "start"]

