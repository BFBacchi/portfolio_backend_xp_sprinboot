package dev.portfolio.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.portfolio.backend.domain.PortfolioUser;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

  private static final String SECRET =
      "unit-test-secret-key-at-least-32-bytes-long-for-hs256!!";

  @Test
  void createsAndParsesToken() {
    JwtService jwt = new JwtService(SECRET, 3_600_000L);
    PortfolioUser u = new PortfolioUser();
    u.setId(42L);
    u.setUsername("dev");

    String token = jwt.createToken(u);
    assertThat(token).isNotBlank();

    var claims = jwt.parseClaims(token);
    assertThat(claims.getSubject()).isEqualTo("dev");
    assertThat(claims.get("uid", Number.class).longValue()).isEqualTo(42L);
  }

  @Test
  void rejectsTamperedToken() {
    JwtService jwt = new JwtService(SECRET, 3_600_000L);
    PortfolioUser u = new PortfolioUser();
    u.setId(1L);
    u.setUsername("a");
    String token = jwt.createToken(u);
    String tampered = token.substring(0, token.length() - 3) + "XXX";

    assertThatThrownBy(() -> jwt.parseClaims(tampered)).isInstanceOf(JwtException.class);
  }
}
