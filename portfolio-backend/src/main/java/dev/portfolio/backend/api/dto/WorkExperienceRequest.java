package dev.portfolio.backend.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WorkExperienceRequest(
    @NotBlank @Size(max = 255) String company,
    @Size(max = 255) String roleTitle,
    @Size(max = 120) String periodLabel,
    @Size(max = 8000) String description,
    int sortOrder) {}
