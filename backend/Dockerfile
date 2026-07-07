FROM node:22-alpine AS base
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY backend/package.json ./backend/
RUN pnpm install --frozen-lockfile

COPY backend/src ./backend/src
COPY backend/prisma ./backend/prisma
COPY backend/tsconfig.json backend/tsconfig.build.json backend/nest-cli.json ./backend/
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

FROM base AS runner
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend ./backend
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/tsconfig.base.json ./

COPY backend/entrypoint.sh ./
RUN chmod +x entrypoint.sh

RUN addgroup --system app && adduser --system --ingroup app app
USER app

EXPOSE 4000
ENTRYPOINT ["./entrypoint.sh"]
