package dev.portfolio.backend.api.dto;

public record ProjectDto(
    Long id,
    String title,
    String description,
    String projectUrl,
    String technologies,
    int sortOrder) {}
