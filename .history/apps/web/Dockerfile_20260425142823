FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
WORKDIR /app
ENV NODE_ENV=development
COPY package.json pnpm-workspace.yaml turbo.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
ENV NODE_ENV=production
COPY apps/web apps/web
RUN pnpm -C apps/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN useradd -m nodeuser
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/web/node_modules /app/apps/web/node_modules
COPY --from=build /app/apps/web/.next /app/apps/web/.next
COPY --from=build /app/apps/web/public /app/apps/web/public
COPY --from=build /app/apps/web/package.json /app/apps/web/package.json
EXPOSE 3000
USER nodeuser
CMD ["pnpm", "-C", "apps/web", "start", "-p", "3000"]
