# frontend/Dockerfile

# --- ETAPA 1: Construcción (Node) ---
FROM node:18-alpine as build

WORKDIR /app

# Copiamos package.json de la carpeta frontend
COPY package.json package-lock.json ./
RUN npm ci

# Copiamos el código fuente y construimos la web
COPY . .
RUN npm run build 

# --- ETAPA 2: Servidor (Nginx) ---
FROM nginx:alpine

# Copiamos los archivos construidos a la carpeta pública de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos la configuración del servidor (que crearemos en el paso 3)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 8501 (El que te pide la empresa)
EXPOSE 8501

CMD ["nginx", "-g", "daemon off;"]