package dev.portfolio.backend.error;

public class AssistantUnavailableException extends RuntimeException {
  public AssistantUnavailableException(String message) {
    super(message);
  }
}
