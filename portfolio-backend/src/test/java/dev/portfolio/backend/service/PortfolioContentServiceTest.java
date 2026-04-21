package dev.portfolio.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import dev.portfolio.backend.api.dto.ProjectRequest;
import dev.portfolio.backend.domain.PortfolioUser;
import dev.portfolio.backend.domain.PortfolioUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PortfolioContentServiceTest {

  @Autowired private PortfolioContentService contentService;
  @Autowired private PortfolioUserRepository userRepository;

  private Long userId;

  @BeforeEach
  void setUp() {
    PortfolioUser u = new PortfolioUser();
    u.setUsername("tester");
    u.setPasswordHash("x");
    userId = userRepository.save(u).getId();
  }

  @Test
  void listProjectsInitiallyEmpty() {
    assertThat(contentService.listProjectsForUser(userId)).isEmpty();
  }

  @Test
  void createAndListProject() {
    contentService.createProject(
        userId,
        new ProjectRequest(
            "Mi app XP", "Descripción", "https://github.com/x", null, null, "Java, React", 0));
    assertThat(contentService.listProjectsForUser(userId)).hasSize(1);
  }
}
