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
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

RUN npm run build

########################
# 2) Runtime stage
########################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Optional: pass at build via --build-arg MEDUSA_BACKEND_URL=... (e.g. from GitHub Secrets)
# Otherwise set at runtime (e.g. docker run -e MEDUSA_BACKEND_URL=... or K8s secret).
ARG MEDUSA_BACKEND_URL
ENV MEDUSA_BACKEND_URL=$MEDUSA_BACKEND_URL

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --frozen-lockfile

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 8000

CMD ["npm", "start"]
