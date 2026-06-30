# 🖥️ Portfolio — Escritorio Windows XP

API backend de mi portfolio personal con temática de escritorio **Windows XP**: cada ícono y ventana del frontend consume esta API para mostrar mi información profesional, proyectos y un asistente conversacional con IA.

> Frontend: React + Vite (recreación interactiva del escritorio de XP)
> Backend: este repositorio — Spring Boot 3.4 + PostgreSQL + Flyway

![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6DB33F?logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Flyway](https://img.shields.io/badge/Flyway-CC0200?logo=flyway&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

---

## 📝 Descripción

API REST que actúa como backend de mi portfolio personal, construida con **Spring Boot 3.4**, persistencia en **PostgreSQL** y migraciones versionadas con **Flyway**. Incluye:

- Endpoints públicos de información del portfolio
- Healthcheck vía **Spring Actuator**
- Un **asistente conversacional con IA** (integración con [Groq](https://groq.com/) usando el modelo `llama-3.1-8b-instant`) que responde preguntas sobre mi perfil profesional en tiempo real
- Configuración de **CORS** para consumo seguro desde el frontend
- Imagen **Docker multi-stage** lista para producción, desplegada en [Easypanel](https://easypanel.io/)

## 🏗️ Arquitectura

```
┌─────────────────────┐        ┌──────────────────────┐
│  Frontend (React)   │  HTTP  │  Backend (Spring Boot)│
│  Escritorio XP       │ ─────▶ │  API REST + Actuator  │
│  servido con nginx   │        │  PostgreSQL + Flyway  │
└─────────────────────┘        └──────────────────────┘
            │                              │
            └──────────── Docker / Easypanel ──────────┘
```

En producción, **nginx** (en el contenedor del frontend) actúa como proxy reverso hacia este backend dentro de la red interna de Docker, evitando problemas de CORS entre dominios.

## 🚀 Stack técnico

| Capa | Tecnología |
|---|---|
| Lenguaje | Java 17 |
| Framework | Spring Boot 3.4 |
| Base de datos | PostgreSQL |
| Migraciones | Flyway |
| IA | Groq API (Llama 3.1) |
| Build | Maven |
| Contenedores | Docker (multi-stage, JRE 21) |
| Despliegue | Easypanel |

## ⚙️ Requisitos

- Java 17 (JDK)
- Maven 3.9+
- PostgreSQL accesible desde tu máquina (o contenedor)

## 🗄️ Base de datos

Crea una base de datos y un usuario con permisos sobre ella. Por defecto, la app espera:

- Base: `portfolio`
- Usuario: `portfolio`
- Contraseña: `portfolio`
- Host: `localhost:5432`

Al arrancar, Flyway ejecuta automáticamente las migraciones ubicadas en `src/main/resources/db/migration/`.

## 🔑 Variables de entorno

Podés copiar `env.example` como referencia.

| Variable | Descripción | Valor por defecto (local) |
|---|---|---|
| `PORT` | Puerto HTTP | `8080` |
| `DATABASE_URL` | JDBC URL de PostgreSQL | `jdbc:postgresql://localhost:5432/portfolio` |
| `DATABASE_USER` | Usuario de la base de datos | `portfolio` |
| `DATABASE_PASSWORD` | Contraseña | `portfolio` |
| `CORS_ALLOWED_ORIGINS` | Orígenes del frontend, separados por coma | `http://localhost:5173,http://127.0.0.1:5173` |
| `GROQ_ENABLED` | Habilita el endpoint de IA público | `false` |
| `GROQ_API_KEY` | API key de Groq (solo backend) | *(vacío)* |
| `GROQ_MODEL` | Modelo de Groq para respuestas | `llama-3.1-8b-instant` |
| `GROQ_MAX_TOKENS` | Máximo de tokens de salida | `350` |
| `GROQ_TIMEOUT_MS` | Timeout HTTP a Groq en ms | `12000` |
| `GROQ_TEMPERATURE` | Temperatura del modelo | `0.3` |

> ⚠️ En producción (por ejemplo, Easypanel) definí estas variables en el panel del servicio. Nunca subas secretos al repositorio.

## ▶️ Arranque en local

Desde la carpeta del proyecto:

```bash
mvn spring-boot:run
```

> El goal correcto es `spring-boot:run` (con guion), no `springboot`.

Con variables personalizadas (PowerShell):

```powershell
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/mi_db"
$env:DATABASE_USER="mi_usuario"
$env:DATABASE_PASSWORD="mi_password"
mvn spring-boot:run
```

La aplicación queda disponible en `http://localhost:8080` (o el `PORT` que definas).

## ✅ Comprobar que funciona

- **Ping:** `GET http://localhost:8080/api/v1/public/ping` → respuesta JSON con `status: ok`
- **Asistente IA:** `POST http://localhost:8080/api/v1/public/assistant/ask` con body `{"question": "..."}`
- **Salud (Actuator):** `GET http://localhost:8080/actuator/health`

## 🐳 Docker

Construir la imagen (multi-stage, JRE 21):

```bash
docker build -t portfolio-backend .
```

Ejecutar (ajustá URL, usuario y contraseña a tu PostgreSQL):

```bash
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/portfolio \
  -e DATABASE_USER=portfolio \
  -e DATABASE_PASSWORD=portfolio \
  portfolio-backend
```

> En Linux, si `host.docker.internal` no existe, usá la IP del host o una red Docker compartida con el contenedor de PostgreSQL.

## 📦 Empaquetado JAR

```bash
mvn -DskipTests package
```

El JAR queda en `target/portfolio-backend-0.1.0-SNAPSHOT.jar` y se ejecuta con:

```bash
java -jar target/portfolio-backend-0.1.0-SNAPSHOT.jar
```

## ☁️ Despliegue en Easypanel

El frontend se despliega como un servicio Docker aparte (nginx sirviendo `dist/`), y se conecta a este backend de dos formas posibles:

**Opción recomendada — proxy interno vía nginx**
El frontend no define `VITE_API_BASE_URL` en el build; en su lugar, su contenedor recibe en runtime `API_UPSTREAM=http://<hostname-interno-backend>:8080`, y nginx reenvía las peticiones `/api/...` al backend dentro de la red interna de Docker. Esto evita CORS por completo, ya que el navegador siempre habla con un único origen.

**Opción alternativa — URL pública**
El frontend se buildea con `VITE_API_BASE_URL=https://tu-api-publica.easypanel.host` incrustada en el bundle. En este caso, el backend necesita tener configurado `CORS_ALLOWED_ORIGINS` con el dominio exacto del frontend.

## 📁 Estructura relevante

```
src/main/java/dev/portfolio/backend/      # Código de la aplicación
src/main/resources/application.yml        # Configuración y valores por defecto
src/main/resources/db/migration/          # Migraciones Flyway (V1__, V2__, ...)
```

## 🔗 Proyecto relacionado

Frontend (React + Vite, escritorio de Windows XP): repositorio del frontend del portfolio.

## 👋 Sobre el autor

**Bruno Bacchi** — Full Stack Developer
🔗 [LinkedIn](https://www.linkedin.com/in/bruno-bacchi) · 📧 bfbacchi@gmail.com
