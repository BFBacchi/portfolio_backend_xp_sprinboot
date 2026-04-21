package dev.portfolio.backend.api.dto;

public record ProjectDto(
    Long id,
    String title,
    String description,
    String projectUrl,
    String imageUrl1,
    String imageUrl2,
    String technologies,
    int sortOrder) {}
