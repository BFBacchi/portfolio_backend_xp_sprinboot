package dev.portfolio.backend.bootstrap;

import dev.portfolio.backend.domain.PortfolioUser;
import dev.portfolio.backend.domain.PortfolioUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class PortfolioAdminBootstrap implements CommandLineRunner {

  private final PortfolioUserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Value("${portfolio.bootstrap.admin-username:admin}")
  private String adminUsername;

  @Value("${portfolio.bootstrap.admin-password:changeme}")
  private String adminPassword;

  @Override
  public void run(String... args) {
    if (userRepository.count() > 0) {
      return;
    }
    PortfolioUser u = new PortfolioUser();
    u.setUsername(adminUsername);
    u.setPasswordHash(passwordEncoder.encode(adminPassword));
    userRepository.save(u);
    log.warn(
        "Usuario administrador creado ({}). Cambie la contraseña en producción (variable PORTFOLIO_ADMIN_PASSWORD).",
        adminUsername);
  }
}
