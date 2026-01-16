# Simple Dockerfile for Next.js Storefront
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

# Set dummy env var for build (override at runtime in K8s)
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy-build-key

# Build the application
RUN npm run build

# Expose port
EXPOSE 8000

# Start production server
CMD ["npm", "start"]
