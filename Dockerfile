# Multi-stage Dockerfile for Next.js Storefront
# NEXT_PUBLIC_* are inlined at build time; pass real key via --build-arg when building.
# K8s secret can still be set for runtime (server-side reads process.env).

########################
# 1) Build stage
########################
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

COPY . .

# Next.js inlines NEXT_PUBLIC_* at build time. Pass at build: --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
# Optional: MEDUSA_BACKEND_URL for store API (also inlined if used in client).
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL

RUN npm run build

########################
# 2) Runtime stage
########################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --frozen-lockfile

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 8000

# Do not set NEXT_PUBLIC_* here so K8s env (from secretKeyRef) is used for server-side process.env
CMD ["npm", "start"]
