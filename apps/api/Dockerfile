FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN corepack enable

# Install deps (monorepo)
FROM base AS deps
WORKDIR /app
ENV NODE_ENV=development
COPY package.json pnpm-workspace.yaml turbo.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

# Build API
FROM deps AS build
WORKDIR /app
COPY apps/api apps/api
RUN pnpm -C apps/api prisma:generate
RUN pnpm -C apps/api build

# Runtime image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN useradd -m nodeuser
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/node_modules /app/apps/api/node_modules
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json
COPY --from=build /app/apps/api/prisma /app/apps/api/prisma
COPY --from=build /app/apps/api/docker-entrypoint.sh /app/apps/api/docker-entrypoint.sh
RUN chmod +x /app/apps/api/docker-entrypoint.sh
EXPOSE 3001
USER nodeuser
CMD ["sh", "apps/api/docker-entrypoint.sh"]
