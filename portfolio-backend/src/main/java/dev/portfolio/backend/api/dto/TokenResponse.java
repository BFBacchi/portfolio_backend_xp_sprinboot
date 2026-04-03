package dev.portfolio.backend.api.dto;

public record TokenResponse(String accessToken, String tokenType, long expiresInSeconds) {}
