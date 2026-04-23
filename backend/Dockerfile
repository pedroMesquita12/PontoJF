# Etapa 1: build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dependências
COPY package*.json ./
RUN npm install

# Copia o restante do projeto
COPY . .

# Build do NestJS
RUN npm run build


# Etapa 2: produção
FROM node:20-alpine

WORKDIR /app

# Copia apenas o necessário
COPY package*.json ./
RUN npm install --omit=dev

# Copia build gerado
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Prisma (caso use)
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/main"]