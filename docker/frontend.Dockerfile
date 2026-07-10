# Dockerfile para el frontend (placeholder - se completará en el futuro)
# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Copiamos los archivos de dependencias
COPY ../frontend/package*.json ./

# Instalamos dependencias
RUN npm ci

# Copiamos el resto del código
COPY ../frontend ./

# Construimos la aplicación
RUN npm run build

# Stage 2: Serve (usando Nginx)
FROM nginx:alpine

# Copiamos el build a Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiamos la configuración de Nginx (placeholder)
# COPY nginx.conf /etc/nginx/nginx.conf

# Exponemos el puerto
EXPOSE 80

# Iniciamos Nginx
CMD ["nginx", "-g", "daemon off;"]