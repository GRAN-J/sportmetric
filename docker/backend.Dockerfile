# Dockerfile para el backend (placeholder - se completará en el futuro)
FROM node:22-alpine

WORKDIR /app

# Instalamos dependencias necesarias para Prisma (openssl y bash)
RUN apk add --no-cache openssl bash

# Copiamos los archivos de dependencias
COPY ../backend/package*.json ./
COPY ../backend/prisma ./prisma

# Instalamos dependencias
RUN npm ci

# Generamos el cliente de Prisma
RUN npx prisma generate

# Copiamos el resto del código
COPY ../backend ./

# Construimos la aplicación
RUN npm run build

# Exponemos el puerto
EXPOSE 3001

# Reducimos privilegios del proceso en runtime.
USER node

# Iniciamos la aplicación
CMD ["node", "dist/server.js"]
