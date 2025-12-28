FROM node:20-alpine

WORKDIR /app

COPY shared/ ./shared/

COPY services/combat-service/package*.json ./services/combat-service/
RUN cd services/combat-service && npm install

COPY services/combat-service/ ./services/combat-service/

WORKDIR /app/services/combat-service

EXPOSE 3000

# Pokretanje
CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/main.ts"]