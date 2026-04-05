# Portfolio — escritorio Windows XP (React + Vite)

## API en producción

Hay dos formas (elige **una**):

### Recomendada en Easypanel (mismo proyecto que el backend): **`API_UPSTREAM`**

El contenedor del front usa **nginx como proxy**: el navegador llama a `https://tu-front/.../api/v1/...` (mismo sitio) y nginx reenvía al Spring Boot en la **red interna** de Docker.

1. En el **build** del Docker del front: **no** pases `VITE_API_BASE_URL` (déjalo vacío o no lo definas). Así el JS usa rutas relativas `/api/...`.
2. En el servicio del front, variable de entorno **en runtime** (no hace falta rebuild al cambiarla, pero hay que **reiniciar** el contenedor):

```env
API_UPSTREAM=http://NOMBRE_INTERNO_DEL_SERVICIO_BACKEND:8080
```

- Sustituye `NOMBRE_INTERNO_DEL_SERVICIO_BACKEND` por el hostname que Easypanel asigna al contenedor del backend en la misma red (suele parecerse al nombre del servicio, con guiones o guiones bajos).
- **Sin** barra final. Esquema **`http://`** y puerto **`8080`** (o el puerto interno donde escuche Spring en el contenedor).

Con esto evitas **CORS** en el navegador para el API (mismo origen) y no dependes del build-arg de Vite.

### Alternativa: URL pública del API — **`VITE_API_BASE_URL`**

Se incrusta en el bundle en el **build**. Útil si el front y el back no comparten red Docker.

En `.env` / build-args:

```env
VITE_API_BASE_URL=https://tu-api-publica.easypanel.host
```

(Sin barra `/` al final.) Entonces hace falta **CORS** en Spring con el origen del front.

```bash
npm run build
```

### Desarrollo local

Hay dos formas; si ves **`ECONNREFUSED`** o **`http proxy error`** en la consola de Vite, casi siempre es porque el proxy apunta a `127.0.0.1:8080` y **no tienes Spring Boot en marcha** en ese puerto.

**A) Sin backend en tu PC (solo el desplegado en Easypanel)**  
En `.env`:

```env
VITE_API_BASE_URL=https://escribania-alcira-portfolio-backend-xp-springboot.ew1trr.easypanel.host
```

Reinicia `npm run dev`. Las peticiones van directo al servidor; el proxy de Vite **no** se usa.  
En el backend, `CORS_ALLOWED_ORIGINS` debe incluir `http://localhost:5173` (y `http://127.0.0.1:5173` si lo usas).

**B) Backend en local**  
Deja `VITE_API_BASE_URL` vacío, arranca Spring en el puerto 8080 (`mvn spring-boot:run` en `portfolio-backend`). Vite hace **proxy** de `/api` → `http://127.0.0.1:8080`.  
Si usas otro puerto, define `DEV_PROXY_TARGET` en `.env` (ver `.env.example`).

### CORS en el backend

El Spring Boot usa `CORS_ALLOWED_ORIGINS` (coma separada). Debe incluir el **origen exacto** de tu web (protocolo + dominio + puerto si aplica), por ejemplo:

```text
https://tu-frontend.easypanel.host,http://localhost:5173
```

Configúralo en las variables de entorno del servicio del backend en Easypanel.

---

## Despliegue en Easypanel (Docker)

El front incluye un **`Dockerfile`** multi-stage: compila con Node y sirve **`dist/`** con **nginx** (puerto **80**), con rutas SPA (`try_files` → `index.html`).

### 1. Nuevo servicio en el mismo proyecto

1. En Easypanel, **Add Service** → **App** (o el tipo que uses para Docker desde Dockerfile).
2. Conecta el **mismo repositorio Git** que usas para el backend (el que tiene `.git` en el **directorio padre** que contiene `portfolio-react-app` y `portfolio-backend`).
3. Define el **contexto / directorio raíz del build** como la subcarpeta **`portfolio-react-app`** (monorepo). El `Dockerfile` debe resolverse dentro de ese contexto (p. ej. `Dockerfile` en la raíz del contexto).
4. Si el panel pide ruta completa desde la raíz del repo: **Dockerfile** `portfolio-react-app/Dockerfile` y **build context** `portfolio-react-app` (según cómo lo exprese tu versión de Easypanel).

### 2. Conectar el front con el backend

**Opción recomendada (proxy nginx)**

| Dónde | Qué poner |
|-------|-----------|
| **Build args** | Sin `VITE_API_BASE_URL` (vacío) |
| **Variables de entorno del contenedor** (runtime) | `API_UPSTREAM=http://<hostname-interno-backend>:8080` |

**Opción solo URL pública**

| Build args | `VITE_API_BASE_URL=https://...` (URL HTTPS pública del Spring Boot) |
|------------|---------------------------------------------------------------------|
| Runtime | No hace falta `API_UPSTREAM` |

### 3. Puerto del contenedor

El contenedor escucha en **80**. En Easypanel asigna el puerto interno **80** al dominio / HTTPS que quieras para el portfolio.

### 4. CORS en el backend

Si usas **`API_UPSTREAM`** (proxy), el navegador habla con el mismo dominio del front; el API suele no necesitar CORS extra para esas peticiones.

Si usas **`VITE_API_BASE_URL`** hacia otro dominio, añade el origen del front a `CORS_ALLOWED_ORIGINS` en Spring, por ejemplo:

```text
https://tu-frontend.ew1trr.easypanel.host,http://localhost:5173,http://127.0.0.1:5173
```

### Probar la imagen en local

Con proxy a un backend en tu máquina:

```bash
cd portfolio-react-app
docker build -t portfolio-xp-front .
docker run --rm -p 8081:80 -e API_UPSTREAM=http://host.docker.internal:8080 portfolio-xp-front
```

Con URL pública en el bundle:

```bash
docker build --build-arg VITE_API_BASE_URL=https://tu-api.easypanel.host -t portfolio-xp-front .
docker run --rm -p 8081:80 portfolio-xp-front
```

Abre `http://localhost:8081`.

### Error `405` en `https://tu-front/.../api/v1/...`

Significa que el navegador sigue pegando al **front** sin proxy ni `VITE_API_BASE_URL` correcto. Solución: define **`API_UPSTREAM`** en el contenedor del front **y** vuelve a desplegar una imagen construida **sin** `VITE_API_BASE_URL` (o bórralo en build args).

### Error en Docker: `Could not resolve ... LogoScreen`

En **Linux** (build de Docker / Easypanel) las rutas de archivos **distinguen mayúsculas**. Los imports deben coincidir exactamente con los nombres en Git (p. ej. `LogoScreen.jsx`, no `logoScreen.jsx` mezclado con import `LogoScreen`).

---

Plantilla base: [Vite + React](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react).
