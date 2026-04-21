package dev.portfolio.backend.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProjectRequest(
    @NotBlank @Size(max = 200) String title,
    @Size(max = 8000) String description,
    @Size(max = 500) String projectUrl,
    @Size(max = 2048) String imageUrl1,
    @Size(max = 2048) String imageUrl2,
    @Size(max = 500) String technologies,
    int sortOrder) {}
