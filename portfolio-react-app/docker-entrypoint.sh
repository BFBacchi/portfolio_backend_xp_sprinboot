#!/bin/sh
set -e

# Si API_UPSTREAM está definido (URL del backend, p. ej. http://nombre_servicio:8080),
# nginx hace proxy de /api/* al Spring Boot. Así VITE_API_BASE_URL puede ir vacío en el build.
# Sin API_UPSTREAM: solo SPA (necesitas VITE_API_BASE_URL en el build para llamar al API en otro host).

if [ -n "$API_UPSTREAM" ]; then
  sed "s|@@API_UPSTREAM@@|${API_UPSTREAM}|g" /etc/nginx/spa-api-proxy.conf.tpl > /etc/nginx/conf.d/default.conf
else
  cp /etc/nginx/spa-only.conf /etc/nginx/conf.d/default.conf
fi

exec nginx -g 'daemon off;'
