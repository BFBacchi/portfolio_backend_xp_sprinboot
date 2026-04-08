# Imagen de producción para EasyPanel / Docker (multi-stage)
# Runtime: JRE sobre Ubuntu Noble (parches de seguridad más frecuentes que Alpine en muchos escaneos).
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
