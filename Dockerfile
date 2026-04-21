FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src ./src
COPY public ./public

RUN npm run build

FROM node:20-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=build /app/dist ./dist
COPY public ./public

EXPOSE 8080

CMD ["node", "dist/server.js"]
