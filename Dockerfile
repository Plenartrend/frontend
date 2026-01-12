# Based on https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:22.11.0-alpine AS base

# NEW enable yarn 4.0.2 version and copy yarnrc.yml
RUN corepack enable

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager (NEW copy yarnrc.yml to the image)
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .yarnrc.yml ./

RUN \
  if [ -f yarn.lock ]; then yarn install; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi
# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install JAVA for OpenAPI Generator
RUN apk update && apk add --no-cache \
    openjdk11
ENV JAVA_HOME="/usr/lib/jvm/java-11-openjdk" \
    PATH="/usr/lib/jvm/java-11-openjdk/bin:$PATH"

RUN yarn build

ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

CMD ["yarn", "run", "start"]
