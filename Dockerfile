FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS server
WORKDIR /app
COPY package* ./
RUN npm install --production
COPY --from=builder ./app/dist ./dist

EXPOSE ${SERVER_PORT}
EXPOSE ${SECURE_SERVER_PORT}

CMD ["npm", "start"]
