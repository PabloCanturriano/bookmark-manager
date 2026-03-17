
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# Copy manifests only — lets Docker cache this layer until a package.json changes
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/config/package.json  ./packages/config/
COPY packages/types/package.json   ./packages/types/
COPY apps/api/package.json         ./apps/api/

RUN pnpm install --frozen-lockfile

FROM deps AS build

WORKDIR /app

COPY . .

# Build shared types first, then the API
RUN pnpm --filter=@bookmark-manager/types build
RUN pnpm --filter=api build

FROM deps AS prod-deps

WORKDIR /app

COPY . .

RUN pnpm --filter=@bookmark-manager/types build

# pnpm deploy creates an isolated folder with only production dependencies
RUN pnpm deploy --filter=@bookmark-manager/api --prod /prod/api

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy production node_modules from the deploy stage
COPY --from=prod-deps /prod/api/node_modules ./node_modules

# Copy compiled output
COPY --from=build /app/apps/api/dist ./dist

# Copy prisma schema for migrate on startup (optional)
COPY --from=build /app/apps/api/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/main"]
