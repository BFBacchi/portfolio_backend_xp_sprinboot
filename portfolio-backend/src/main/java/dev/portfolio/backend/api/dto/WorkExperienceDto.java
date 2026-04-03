package dev.portfolio.backend.api.dto;

public record WorkExperienceDto(
    Long id,
    String company,
    String roleTitle,
    String periodLabel,
    String description,
    int sortOrder) {}
