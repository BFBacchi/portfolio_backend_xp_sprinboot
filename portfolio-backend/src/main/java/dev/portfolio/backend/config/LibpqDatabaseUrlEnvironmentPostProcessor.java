package dev.portfolio.backend.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

/**
 * Normaliza URLs PostgreSQL: {@code postgres://} → JDBC, y el typo frecuente {@code
 * jdbc:postgres://} → {@code jdbc:postgresql://} (sin eso Spring no detecta el driver).
 */
public class LibpqDatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

  private static final String JDBC_POSTGRES_TYPO_PREFIX = "jdbc:postgres://";

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE + 1;
  }

  @Override
  public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
    Map<String, Object> map = new LinkedHashMap<>();
    applyJdbcPostgresTypoFix(environment, map);

    String raw = firstLibpqStyleUrl(environment);
    if (raw != null) {
      Conversion c = convert(raw);
      map.put("DATABASE_URL", c.jdbcUrl());
      map.put("spring.datasource.url", c.jdbcUrl());
      String existingUser = environment.getProperty("DATABASE_USER");
      if ((existingUser == null || existingUser.isBlank()) && c.username() != null) {
        map.put("DATABASE_USER", c.username());
      }
      String existingPass = environment.getProperty("DATABASE_PASSWORD");
      if ((existingPass == null || existingPass.isBlank()) && c.password() != null) {
        map.put("DATABASE_PASSWORD", c.password());
      }
    }

    mirrorUrlKeys(map);

    if (map.isEmpty()) {
      return;
    }
    MutablePropertySources sources = environment.getPropertySources();
    sources.addFirst(new MapPropertySource("libpqDatabaseUrlConverted", map));
  }

  /** Corrige {@code jdbc:postgres://} (inválido); {@code jdbc:postgresql://} no coincide con este prefijo. */
  private static void applyJdbcPostgresTypoFix(
      ConfigurableEnvironment environment, Map<String, Object> map) {
    String[] keys = {"spring.datasource.url", "SPRING_DATASOURCE_URL", "DATABASE_URL"};
    for (String key : keys) {
      String v = environment.getProperty(key);
      if (v == null || v.isBlank()) {
        continue;
      }
      String t = v.trim();
      if (t.startsWith(JDBC_POSTGRES_TYPO_PREFIX)) {
        map.put(key, "jdbc:postgresql://" + t.substring(JDBC_POSTGRES_TYPO_PREFIX.length()));
      }
    }
  }

  /** Alinea las tres claves de URL si solo una quedó corregida. */
  private static void mirrorUrlKeys(Map<String, Object> map) {
    Object url = map.get("DATABASE_URL");
    if (url == null) {
      url = map.get("spring.datasource.url");
    }
    if (url == null) {
      url = map.get("SPRING_DATASOURCE_URL");
    }
    if (url == null) {
      return;
    }
    map.putIfAbsent("DATABASE_URL", url);
    map.putIfAbsent("spring.datasource.url", url);
    map.putIfAbsent("SPRING_DATASOURCE_URL", url);
  }

  /** Primera propiedad definida que parece {@code postgres://} (orden: datasource, DATABASE_URL). */
  private static String firstLibpqStyleUrl(ConfigurableEnvironment environment) {
    String[] keys = {"spring.datasource.url", "SPRING_DATASOURCE_URL", "DATABASE_URL"};
    for (String key : keys) {
      String v = environment.getProperty(key);
      if (v == null || v.isBlank()) {
        continue;
      }
      v = v.trim();
      if (v.startsWith("postgres://") || v.startsWith("postgresql://")) {
        return v;
      }
    }
    return null;
  }

  private static Conversion convert(String url) {
    String forUri = url.replaceFirst("^postgres(ql)?://", "http://");
    URI uri = URI.create(forUri);
    String host = uri.getHost();
    if (host == null || host.isBlank()) {
      throw new IllegalArgumentException("URL PostgreSQL (libpq) sin host válido");
    }
    int port = uri.getPort() > 0 ? uri.getPort() : 5432;

    String path = uri.getPath();
    String database = "";
    if (path != null && path.length() > 1) {
      database = path.substring(1);
    }

    String jdbc = "jdbc:postgresql://" + host + ":" + port + "/" + database;
    String query = uri.getRawQuery();
    if (query != null && !query.isEmpty()) {
      jdbc += "?" + query;
    }

    String user = null;
    String password = null;
    String userInfo = uri.getRawUserInfo();
    if (userInfo != null && !userInfo.isEmpty()) {
      int colon = userInfo.indexOf(':');
      if (colon >= 0) {
        user = URLDecoder.decode(userInfo.substring(0, colon), StandardCharsets.UTF_8);
        password = URLDecoder.decode(userInfo.substring(colon + 1), StandardCharsets.UTF_8);
      } else {
        user = URLDecoder.decode(userInfo, StandardCharsets.UTF_8);
      }
    }

    return new Conversion(jdbc, user, password);
  }

  private record Conversion(String jdbcUrl, String username, String password) {}
}
