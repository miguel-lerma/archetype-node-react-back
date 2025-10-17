FROM node:20-alpine as runtime
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i
COPY . .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["npm", "start"]
