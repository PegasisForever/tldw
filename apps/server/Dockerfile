# Build from project root!

FROM node:16 as pruner

WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=server --docker

FROM node:16 as builder

WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
RUN yarn install

COPY --from=pruner /app/out/full/ .
ENV NODE_ENV=production
RUN yarn prisma generate
RUN yarn turbo run build --scope=server --include-dependencies --no-deps

RUN mv node_modules/.prisma/client ./prisma-client
RUN rm -rf node_modules apps/server/node_modules

FROM node:16 as prod-installer

WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock

ENV NODE_ENV=production
RUN yarn install --prod

FROM node:16 as prod-modules-builder
ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder /app/ .

COPY --from=prod-installer /app/node_modules/ ./node_modules
RUN rm -rf node_modules/.prisma/client
RUN mv ./prisma-client ./node_modules/.prisma/client

COPY --from=prod-installer /app/apps/server/node_modules/ ./apps/server/node_modules

COPY prod-yarnclean ./.yarnclean
RUN yarn autoclean --force

#FROM gcr.io/distroless/nodejs:16 as runner
FROM node:16-alpine as runner

WORKDIR /app
COPY --from=prod-modules-builder /app/ .

ENV NODE_OPTIONS=--enable-source-maps
ENV NODE_ENV=production

WORKDIR /app/apps/server
CMD ["--enable-source-maps", "dist/main.js"]
