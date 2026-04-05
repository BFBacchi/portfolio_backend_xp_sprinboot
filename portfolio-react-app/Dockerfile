# Imagen de producción para Easypanel / Docker (Vite → estáticos + nginx)
#
# Opción A — Proxy interno (recomendado en el mismo proyecto Easypanel):
#   Build: VITE_API_BASE_URL vacío (o sin definir).
#   Runtime: variable de entorno API_UPSTREAM=http://NOMBRE_SERVICIO_BACKEND:8080
#
# Opción B — API en URL pública:
#   Build-arg: VITE_API_BASE_URL=https://tu-api-publica...

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

COPY nginx/spa-only.conf /etc/nginx/spa-only.conf
COPY nginx/spa-api-proxy.conf.tpl /etc/nginx/spa-api-proxy.conf.tpl

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
