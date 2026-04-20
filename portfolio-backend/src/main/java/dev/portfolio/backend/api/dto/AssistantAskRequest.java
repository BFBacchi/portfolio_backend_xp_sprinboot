package dev.portfolio.backend.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AssistantAskRequest(
    @NotBlank(message = "La pregunta es obligatoria.")
        @Size(max = 600, message = "La pregunta no puede superar 600 caracteres.")
        String question) {}
