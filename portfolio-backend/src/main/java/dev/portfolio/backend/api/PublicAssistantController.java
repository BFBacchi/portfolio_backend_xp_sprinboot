package dev.portfolio.backend.api;

import dev.portfolio.backend.api.dto.AssistantAskRequest;
import dev.portfolio.backend.api.dto.AssistantAskResponse;
import dev.portfolio.backend.service.AssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/assistant")
@RequiredArgsConstructor
public class PublicAssistantController {
  private final AssistantService assistantService;

  @PostMapping("/ask")
  public AssistantAskResponse ask(@Valid @RequestBody AssistantAskRequest request) {
    return assistantService.answerQuestion(request.question());
  }
}
