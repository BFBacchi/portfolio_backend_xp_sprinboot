package dev.portfolio.backend.api.dto;

import jakarta.validation.constraints.Size;

public record AboutMeUpdateRequest(
    @Size(max = 255) String headline,
    @Size(max = 8000) String bio,
    @Size(max = 400) String tagline,
    @Size(max = 500) String lunaQuote) {}
