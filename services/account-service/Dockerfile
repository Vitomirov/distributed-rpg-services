FROM node:20-alpine

WORKDIR /app

COPY shared/ ./shared/

COPY services/account-service/package*.json ./services/account-service/
RUN cd services/account-service && npm install

COPY services/account-service/ ./services/account-service/

WORKDIR /app/services/account-service

EXPOSE 3000

CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/main.ts"]