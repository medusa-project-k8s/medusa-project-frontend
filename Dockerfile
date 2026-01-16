# Basic Dockerfile for Next.js Storefront
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Expose the port Next.js runs on
EXPOSE 8000

# Start the application
CMD ["yarn", "start"]
