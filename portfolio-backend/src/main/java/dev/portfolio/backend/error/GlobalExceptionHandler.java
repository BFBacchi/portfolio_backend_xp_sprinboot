package dev.portfolio.backend.error;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiErrorBody> notFound(
      ResourceNotFoundException ex, HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(
            ApiErrorBody.of(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                req.getRequestURI()));
  }

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<ApiErrorBody> badRequest(
      BadRequestException ex, HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(
            ApiErrorBody.of(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                req.getRequestURI()));
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ApiErrorBody> badCredentials(
      BadCredentialsException ex, HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(
            ApiErrorBody.of(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                "Usuario o contraseña incorrectos.",
                req.getRequestURI()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiErrorBody> validation(
      MethodArgumentNotValidException ex, HttpServletRequest req) {
    Map<String, String> fields = new HashMap<>();
    for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
      fields.put(fe.getField(), fe.getDefaultMessage());
    }
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(
            ApiErrorBody.withFields(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Error",
                "Revise los campos enviados.",
                req.getRequestURI(),
                fields));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiErrorBody> generic(Exception ex, HttpServletRequest req) {
    log.error("Error no controlado: {}", ex.getMessage(), ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(
            ApiErrorBody.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Error interno. Intente más tarde.",
                req.getRequestURI()));
  }
}
