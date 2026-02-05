FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsup src/server.ts --format esm --target node20 --outDir dist
RUN npm prune --omit=dev
EXPOSE 8080
CMD ["node", "dist/server.js"]
