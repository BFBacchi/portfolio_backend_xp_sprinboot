package dev.portfolio.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import dev.portfolio.backend.api.dto.AboutMeDto;
import dev.portfolio.backend.api.dto.AssistantAskResponse;
import dev.portfolio.backend.api.dto.EducationDto;
import dev.portfolio.backend.api.dto.ProjectDto;
import dev.portfolio.backend.api.dto.SkillDto;
import dev.portfolio.backend.api.dto.WorkExperienceDto;
import dev.portfolio.backend.error.BadRequestException;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AssistantServiceTest {

  @Mock private PortfolioContentService contentService;
  @Mock private OpenAiClient openAiClient;

  private AssistantService assistantService;

  @BeforeEach
  void setUp() {
    assistantService = new AssistantService(contentService, openAiClient);
  }

  @Test
  void rejectsBlankQuestion() {
    assertThrows(BadRequestException.class, () -> assistantService.answerQuestion(" "));
  }

  @Test
  void returnsAnswerFromOpenAi() {
    when(contentService.getPublicAboutMe())
        .thenReturn(new AboutMeDto(1L, "Dev", "Bio", "CV", "Tag", "Luna", null));
    when(contentService.listProjectsPublic())
        .thenReturn(List.of(new ProjectDto(1L, "Portfolio XP", "React + Spring", null, null, 0)));
    when(contentService.listEducationPublic())
        .thenReturn(List.of(new EducationDto(1L, "UTN", "Ingeniería", "2010-2015", "", 0)));
    when(contentService.listSkillsPublic())
        .thenReturn(List.of(new SkillDto(1L, "Java", "Backend", "", 0)));
    when(contentService.listWorkExperiencePublic())
        .thenReturn(List.of(new WorkExperienceDto(1L, "Empresa", "Developer", "2020-2024", "", 0)));
    when(openAiClient.ask(anyString(), anyString())).thenReturn("Respuesta IA");
    when(openAiClient.model()).thenReturn("gpt-4o-mini");

    AssistantAskResponse response = assistantService.answerQuestion("¿Qué experiencia tiene?");

    assertEquals("Respuesta IA", response.answer());
    assertEquals("gpt-4o-mini", response.model());
    assertEquals("portfolio", response.source());
  }
}
