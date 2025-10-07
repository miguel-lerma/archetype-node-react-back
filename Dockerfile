FROM node:20-alpine
WORKDIR /app

# Copiar manifests (package.json + package-lock.json)
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código (después, para cache eficaz)
COPY src ./src
COPY .env.dev ./.env.dev
COPY .env.qa  ./.env.qa
COPY .env.prd ./.env.prd

EXPOSE 8080
CMD ["node", "src/server.js"]
