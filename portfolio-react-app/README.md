# Portfolio — escritorio Windows XP (React + Vite)

## API en producción

El front llama al backend usando la variable **`VITE_API_BASE_URL`**. Se lee en tiempo de **build** (Vite la incrusta en el bundle).

1. En la carpeta `portfolio-react-app`, crea un archivo **`.env`** o **`.env.production`**:

```env
VITE_API_BASE_URL=https://escribania-alcira-portfolio-backend-xp-springboot.ew1trr.easypanel.host
```

(Sin barra `/` al final.)

2. Vuelve a generar el build:

```bash
npm run build
```

3. Si despliegas el front en **Easypanel, Vercel, Netlify**, etc., define la misma variable en el panel de variables de entorno del servicio y ejecuta el build allí.

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

### 2. Build arguments (imprescindible)

Vite inyecta la URL del API **al compilar**. En Easypanel, en la sección de **Build Arguments** (o variables disponibles en el paso de build), define:

| Argumento              | Valor (ejemplo) |
|------------------------|------------------|
| `VITE_API_BASE_URL`    | `https://escribania-alcira-portfolio-backend-xp-springboot.ew1trr.easypanel.host` |

- **Sin** barra `/` al final.
- Debe ser la URL que el **navegador** del visitante puede resolver (normalmente la URL pública HTTPS de tu Spring Boot en Easypanel).

Cada vez que cambies el dominio del backend, **vuelve a construir** la imagen del front.

### 3. Puerto del contenedor

El contenedor escucha en **80**. En Easypanel asigna el puerto interno **80** al dominio / HTTPS que quieras para el portfolio.

### 4. CORS en el backend

Añade el origen **exacto** del front desplegado a `CORS_ALLOWED_ORIGINS` del servicio Spring Boot, por ejemplo:

```text
https://tu-frontend.ew1trr.easypanel.host,http://localhost:5173,http://127.0.0.1:5173
```

### Probar la imagen en local

```bash
cd portfolio-react-app
docker build --build-arg VITE_API_BASE_URL=https://tu-backend.easypanel.host -t portfolio-xp-front .
docker run --rm -p 8081:80 portfolio-xp-front
```

Abre `http://localhost:8081`.

---

Plantilla base: [Vite + React](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react).
