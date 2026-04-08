package dev.portfolio.backend.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

/**
 * Lee {@code .env} en el directorio de trabajo. Si el archivo existe, sus claves tienen la máxima
 * prioridad (por encima de variables de sistema), para que un {@code DATABASE_USER} viejo en Windows
 * no tape lo definido en {@code .env}. En CI no suele haber {@code .env}.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE;
  }

  @Override
  public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
    Path envFile = Path.of(System.getProperty("user.dir"), ".env");
    if (!Files.isRegularFile(envFile)) {
      return;
    }
    Map<String, Object> fromFile = new LinkedHashMap<>();
    try {
      for (String line : Files.readAllLines(envFile, StandardCharsets.UTF_8)) {
        String trimmed = line.trim();
        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
          continue;
        }
        int eq = trimmed.indexOf('=');
        if (eq <= 0) {
          continue;
        }
        String key = trimmed.substring(0, eq).trim();
        if (key.isEmpty()) {
          continue;
        }
        String value = trimmed.substring(eq + 1).trim();
        if (value.length() >= 2
            && ((value.startsWith("\"") && value.endsWith("\""))
                || (value.startsWith("'") && value.endsWith("'")))) {
          value = value.substring(1, value.length() - 1);
        }
        if (!value.isBlank()) {
          fromFile.put(key, value);
        }
      }
    } catch (IOException ignored) {
      return;
    }
    mirrorDatasourceKeys(fromFile);
    if (fromFile.isEmpty()) {
      return;
    }
    MutablePropertySources sources = environment.getPropertySources();
    sources.addFirst(new MapPropertySource("dotenvFile", fromFile));
  }

  /**
   * Spring Boot resuelve {@code spring.datasource.username} también desde {@code
   * SPRING_DATASOURCE_USERNAME} (variables de sistema), que suelen ganar a {@code application.yml}.
   * Publicar las mismas credenciales bajo {@code spring.datasource.*} en esta fuente (máxima
   * prioridad) evita que un {@code SPRING_DATASOURCE_USERNAME=portfolio} viejo en Windows tape el
   * {@code .env}.
   */
  private static void mirrorDatasourceKeys(Map<String, Object> fromFile) {
    putIfPresent(fromFile, "DATABASE_USER", "spring.datasource.username");
    putIfPresent(fromFile, "DATABASE_PASSWORD", "spring.datasource.password");
    putIfPresent(fromFile, "DATABASE_URL", "spring.datasource.url");
  }

  private static void putIfPresent(Map<String, Object> from, String fromKey, String toKey) {
    Object v = from.get(fromKey);
    if (v != null && !String.valueOf(v).isBlank()) {
      from.put(toKey, v);
    }
  }
}
