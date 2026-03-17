
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy manifests only — lets Docker cache this layer until a package.json changes
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/config/package.json  ./packages/config/
COPY packages/types/package.json   ./packages/types/
COPY apps/web/package.json         ./apps/web/

RUN pnpm install --frozen-lockfile

FROM deps AS build

WORKDIR /app

COPY . .

# Build shared types first, then the web app
RUN pnpm --filter=@bookmark-manager/types build
RUN pnpm --filter=@bookmark-manager/web build

# next build --output standalone produces a self-contained server in .next/standalone
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# next standalone server
COPY --from=build /app/apps/web/.next/standalone ./

# Static assets served directly by Next.js
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static

# Public folder (images, favicons, etc.)
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 3000

# standalone output places the entrypoint at apps/web/server.js inside the
# standalone root (because the build root is the monorepo, not apps/web)
CMD ["node", "apps/web/server.js"]
