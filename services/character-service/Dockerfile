FROM node:20-alpine

WORKDIR /app

COPY shared/ ./shared/

COPY services/character-service/package*.json ./services/character-service/
RUN cd services/character-service && npm install

COPY services/character-service/ ./services/character-service/

WORKDIR /app/services/character-service

EXPOSE 3000

CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/main.ts"]