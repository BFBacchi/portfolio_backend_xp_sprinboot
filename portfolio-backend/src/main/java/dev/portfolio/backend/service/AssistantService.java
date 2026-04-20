package dev.portfolio.backend.service;

import dev.portfolio.backend.api.dto.AboutMeDto;
import dev.portfolio.backend.api.dto.AssistantAskResponse;
import dev.portfolio.backend.error.BadRequestException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AssistantService {
  private static final int MAX_QUESTION_LEN = 600;

  private final PortfolioContentService portfolioContentService;
  private final OpenAiClient openAiClient;

  @Transactional(readOnly = true)
  public AssistantAskResponse answerQuestion(String question) {
    if (question == null || question.isBlank()) {
      throw new BadRequestException("La pregunta no puede estar vacía.");
    }
    if (question.length() > MAX_QUESTION_LEN) {
      throw new BadRequestException("La pregunta no puede superar 600 caracteres.");
    }

    AboutMeDto about = portfolioContentService.getPublicAboutMe();
    String context = buildContext(about);
    String answer =
        openAiClient.ask(
            """
            Eres Clip, un asistente del portfolio estilo Windows XP.
            Responde SIEMPRE en español, tono profesional y breve.
            Limítate al contexto del perfil provisto. Si no hay datos, dilo claramente.
            Nunca inventes estudios, empleos, tecnologías ni enlaces.
            """,
            "Contexto del portfolio:\n" + context + "\n\nPregunta del visitante:\n" + question);
    return new AssistantAskResponse(answer, openAiClient.model(), "portfolio");
  }

  private String buildContext(AboutMeDto about) {
    List<String> projects =
        portfolioContentService.listProjectsPublic().stream()
            .map(p -> "- " + nullSafe(p.title()) + ": " + nullSafe(p.description()))
            .limit(8)
            .toList();
    List<String> education =
        portfolioContentService.listEducationPublic().stream()
            .map(e -> "- " + nullSafe(e.institution()) + " / " + nullSafe(e.degree()))
            .limit(8)
            .toList();
    List<String> skills =
        portfolioContentService.listSkillsPublic().stream()
            .map(s -> "- " + nullSafe(s.name()) + " (" + nullSafe(s.category()) + ")")
            .limit(20)
            .toList();
    List<String> work =
        portfolioContentService.listWorkExperiencePublic().stream()
            .map(w -> "- " + nullSafe(w.company()) + ": " + nullSafe(w.roleTitle()))
            .limit(10)
            .toList();

    return """
        Titular: %s
        Biografía: %s
        Tagline: %s
        Cita Luna: %s
        CV texto: %s

        Proyectos:
        %s

        Educación:
        %s

        Habilidades:
        %s

        Experiencia laboral:
        %s
        """
        .formatted(
            nullSafe(about.headline()),
            nullSafe(about.bio()),
            nullSafe(about.tagline()),
            nullSafe(about.lunaQuote()),
            nullSafe(about.cvText()),
            String.join("\n", projects),
            String.join("\n", education),
            String.join("\n", skills),
            String.join("\n", work));
  }

  private String nullSafe(String value) {
    return value == null || value.isBlank() ? "(sin dato)" : value.trim();
  }
}
