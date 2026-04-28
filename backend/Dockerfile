FROM node:20-alpine AS builder

WORKDIR /app

# instala deps
COPY package*.json ./
RUN npm install

# copia o projeto
COPY . .

# GERA O PRISMA CLIENT (ESSENCIAL)
RUN npx prisma generate

# build
RUN npm run build

# ---------- PRODUÇÃO ----------
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

CMD ["node", "dist/main.js"]