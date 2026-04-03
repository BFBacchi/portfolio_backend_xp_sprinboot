package dev.portfolio.backend.api;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.portfolio.backend.domain.PortfolioUser;
import dev.portfolio.backend.domain.PortfolioUserRepository;
import dev.portfolio.backend.error.GlobalExceptionHandler;
import dev.portfolio.backend.security.JwtAuthenticationFilter;
import dev.portfolio.backend.security.JwtService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;

  @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
  @MockBean private PortfolioUserRepository userRepository;
  @MockBean private PasswordEncoder passwordEncoder;
  @MockBean private JwtService jwtService;

  @Test
  void loginSuccessReturnsBearerToken() throws Exception {
    PortfolioUser u = new PortfolioUser();
    u.setId(9L);
    u.setUsername("admin");
    u.setPasswordHash("hash");
    when(userRepository.findByUsername("admin")).thenReturn(Optional.of(u));
    when(passwordEncoder.matches("secret", "hash")).thenReturn(true);
    when(jwtService.createToken(u)).thenReturn("jwt-token-123");
    when(jwtService.getExpirationMs()).thenReturn(3600_000L);

    mockMvc
        .perform(
            post("/api/v1/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginBody("admin", "secret"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").value("jwt-token-123"))
        .andExpect(jsonPath("$.tokenType").value("Bearer"));
  }

  @Test
  void loginFailsWithWrongPassword() throws Exception {
    PortfolioUser u = new PortfolioUser();
    u.setUsername("admin");
    u.setPasswordHash("hash");
    when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(u));
    when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

    mockMvc
        .perform(
            post("/api/v1/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginBody("admin", "bad"))))
        .andExpect(status().isUnauthorized());
  }

  private record LoginBody(String username, String password) {}
}
