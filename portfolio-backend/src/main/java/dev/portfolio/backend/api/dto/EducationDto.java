package dev.portfolio.backend.api.dto;

public record EducationDto(
    Long id,
    String institution,
    String degree,
    String periodLabel,
    String description,
    String certificateUrl,
    int sortOrder) {}
