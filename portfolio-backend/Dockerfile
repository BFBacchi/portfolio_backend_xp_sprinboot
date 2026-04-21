# Imagen de producción para EasyPanel / Docker (multi-stage)
# CORS, JWT, DB, etc. deben ir en variables de entorno del CONTENEDOR en ejecución.
# Los --build-arg del panel no llegan a Spring salvo que las declares como ENV abajo.
#
# Runtime: JRE Alpine (ligera).
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --chown=spring:spring --from=build /app/target/portfolio-backend-*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
