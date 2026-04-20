package dev.portfolio.backend.api;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.portfolio.backend.api.dto.AssistantAskResponse;
import dev.portfolio.backend.error.GlobalExceptionHandler;
import dev.portfolio.backend.security.JwtAuthenticationFilter;
import dev.portfolio.backend.service.AssistantService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = PublicAssistantController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class PublicAssistantControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;

  @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
  @MockBean private AssistantService assistantService;

  @Test
  void askReturnsAssistantAnswer() throws Exception {
    when(assistantService.answerQuestion(anyString()))
        .thenReturn(new AssistantAskResponse("Hola!", "gpt-4o-mini", "portfolio"));

    mockMvc
        .perform(
            post("/api/v1/public/assistant/ask")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AskBody("¿Quién es Bruno?"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.answer").value("Hola!"))
        .andExpect(jsonPath("$.model").value("gpt-4o-mini"));
  }

  @Test
  void askRejectsBlankQuestion() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/public/assistant/ask")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AskBody(" "))))
        .andExpect(status().isBadRequest());
  }

  private record AskBody(String question) {}
}
