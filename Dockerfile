# 멀티스테이지 빌드를 위한 NX 모노레포 Dockerfile

# Stage 1: Base image with Node.js and Yarn
FROM node:20-slim AS base
WORKDIR /app

# 빌드 도구 설치 (네이티브 모듈 빌드용)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Yarn v4 설치 및 설정
RUN corepack enable && corepack prepare yarn@4.10.3 --activate

# Stage 2: Dependencies 설치
FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install

# Stage 3: Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NX 캐시 클리어 및 빌드
RUN npx nx reset
RUN NX_DAEMON=false npx nx build backend --prod
RUN NX_DAEMON=false npx nx build frontend --prod

# Stage 4: Production dependencies
FROM base AS prod-deps
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn workspaces focus --production

# Stage 5: Backend production image
FROM node:20-slim AS backend-prod
WORKDIR /app

# 보안을 위한 non-root 사용자 생성
RUN groupadd -r nodejs && useradd -r -g nodejs nestjs

# curl 설치 (healthcheck용)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 필요한 파일들 복사
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nestjs:nodejs /app/shared ./shared

USER nestjs
EXPOSE 4000
CMD ["node", "backend/dist/main.js"]

# Stage 6: Frontend production image
FROM node:20-slim AS frontend-prod
WORKDIR /app

# 보안을 위한 non-root 사용자 생성
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

# curl 설치 (healthcheck용)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Next.js 빌드 결과물 복사
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

USER nextjs
EXPOSE 3000
CMD ["node", "frontend/server.js"]

# Stage 7: Development image
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 개발용 포트 노출
EXPOSE 3000 3001

# 개발 서버 실행을 위한 스크립트
CMD ["yarn", "nx", "run-many", "--target=serve", "--all", "--parallel"]
