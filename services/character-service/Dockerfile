FROM node:20-alpine

WORKDIR /app

# Instaliraj zavisnosti
COPY package*.json ./
RUN npm install

# Kopiraj sav kod
COPY . .

# Ne radimo build dist-a jer pokrećemo direktno ts-node zbog migracija
EXPOSE 3000

# Pokretanje direktno preko ts-node
CMD ["npx", "ts-node", "src/main.ts"]