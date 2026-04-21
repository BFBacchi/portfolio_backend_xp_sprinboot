package dev.portfolio.backend.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EducationRequest(
    @NotBlank @Size(max = 255) String institution,
    @Size(max = 255) String degree,
    @Size(max = 120) String periodLabel,
    @Size(max = 8000) String description,
    @Size(max = 2048) String certificateUrl,
    int sortOrder) {}
