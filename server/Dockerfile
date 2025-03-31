FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json ./
RUN pnpm install

COPY tsconfig*.json ./
COPY src ./src

RUN pnpm build

FROM node:20-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=base /app/dist ./dist
COPY package.json  ./
RUN pnpm install --prod

CMD ["node", "dist/index.js"]
