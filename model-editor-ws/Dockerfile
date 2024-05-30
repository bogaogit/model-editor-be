# Stage 1: Build environment (based on Node.js image)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY dist/ .

EXPOSE 8080

CMD [ "node", "server.js" ]
