package dev.portfolio.backend;

import java.util.TimeZone;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class PortfolioBackendApplication {

  public static void main(String[] args) {
    // El driver JDBC envía la zona por defecto de la JVM al conectar; muchos Postgres
    // en contenedor/cloud no aceptan zonas como America/Buenos_Aires (tzdata reducido).
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    SpringApplication.run(PortfolioBackendApplication.class, args);
  }
}
