# portfolio-backend

API del portfolio personal construida con **Spring Boot 3.4**, **PostgreSQL** y **Flyway**.

## Requisitos

- **Java 17** (JDK)
- **Maven 3.9+**
- **PostgreSQL** accesible desde tu máquina (o contenedor)

## Base de datos

1. Crea una base de datos y un usuario con permisos sobre ella (por defecto la app espera `portfolio` / usuario `portfolio` / contraseña `portfolio` en `localhost:5432`).
2. Al arrancar, **Flyway** ejecuta las migraciones en `src/main/resources/db/migration/`.

## Variables de entorno

Puedes copiar `env.example` como referencia. Variables soportadas:

| Variable | Descripción | Valor por defecto (local) |
|----------|-------------|---------------------------|
| `PORT` | Puerto HTTP | `8080` |
| `DATABASE_URL` | JDBC URL de PostgreSQL | `jdbc:postgresql://localhost:5432/portfolio` |
| `DATABASE_USER` | Usuario de la base de datos | `portfolio` |
| `DATABASE_PASSWORD` | Contraseña | `portfolio` |
| `CORS_ALLOWED_ORIGINS` | Orígenes del frontend, separados por coma | `http://localhost:5173,http://127.0.0.1:5173` |

En producción (por ejemplo EasyPanel), define estas variables en el panel; **no subas secretos al repositorio**.

## Arranque en local

Desde la carpeta `portfolio-backend`:

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

La aplicación queda en `http://localhost:8080` (o el `PORT` que definas).

## Comprobar que funciona

- **Ping:** `GET http://localhost:8080/api/v1/ping` → respuesta JSON con `status: ok`.
- **Salud (Actuator):** `GET http://localhost:8080/actuator/health`.

## Docker

Construir la imagen (multi-stage, JRE 17):

```bash
docker build -t portfolio-backend .
```

Ejecutar (ajusta URL, usuario y contraseña a tu PostgreSQL):

```bash
docker run -p 8080:8080 -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/portfolio -e DATABASE_USER=portfolio -e DATABASE_PASSWORD=portfolio portfolio-backend
```

En Linux, si `host.docker.internal` no existe, usa la IP del host o una red Docker compartida con el contenedor de PostgreSQL.

## Empaquetado JAR

```bash
mvn -DskipTests package
```

El JAR queda en `target/portfolio-backend-0.1.0-SNAPSHOT.jar` y se puede ejecutar con:

```bash
java -jar target/portfolio-backend-0.1.0-SNAPSHOT.jar
```

## Estructura relevante

- `src/main/java/dev/portfolio/backend/` — código de la aplicación
- `src/main/resources/application.yml` — configuración y valores por defecto
- `src/main/resources/db/migration/` — migraciones Flyway (`V1__`, `V2__`, …)
