package dev.portfolio.backend.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiErrorBody(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path,
    Map<String, String> fieldErrors) {

  public static ApiErrorBody of(int status, String error, String message) {
    return new ApiErrorBody(Instant.now(), status, error, message, null, null);
  }

  public static ApiErrorBody of(int status, String error, String message, String path) {
    return new ApiErrorBody(Instant.now(), status, error, message, path, null);
  }

  public static ApiErrorBody withFields(
      int status, String error, String message, String path, Map<String, String> fields) {
    return new ApiErrorBody(Instant.now(), status, error, message, path, fields);
  }
}
