package dev.portfolio.backend.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.portfolio.backend.api.dto.AboutMeDto;
import dev.portfolio.backend.security.JwtAuthenticationFilter;
import dev.portfolio.backend.service.PortfolioContentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = PublicPortfolioController.class)
@AutoConfigureMockMvc(addFilters = false)
class PublicPortfolioControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
  @MockBean private PortfolioContentService contentService;

  @Test
  void pingReturnsXpTheme() throws Exception {
    mockMvc
        .perform(get("/api/v1/public/ping").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("ok"))
        .andExpect(jsonPath("$.theme").value("windows-xp-luna"));
  }

  @Test
  void aboutMeIncludesXpNote() throws Exception {
    when(contentService.getPublicAboutMe())
        .thenReturn(new AboutMeDto(1L, "Dev", "Bio", "CV", "Tag", "Luna quote", null));

    mockMvc
        .perform(get("/api/v1/public/about-me"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.headline").value("Dev"))
        .andExpect(jsonPath("$.xpFlavorNote").exists());
  }
}
