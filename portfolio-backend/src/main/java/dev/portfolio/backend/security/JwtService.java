package dev.portfolio.backend.security;

import dev.portfolio.backend.domain.PortfolioUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final SecretKey key;
  private final long expirationMs;

  public JwtService(
      @Value("${jwt.secret}") String secret,
      @Value("${jwt.expiration-ms}") long expirationMs) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMs = expirationMs;
  }

  public String createToken(PortfolioUser user) {
    Instant now = Instant.now();
    Instant exp = now.plusMillis(expirationMs);
    return Jwts.builder()
        .subject(user.getUsername())
        .claim("uid", user.getId())
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .signWith(key)
        .compact();
  }

  public Claims parseClaims(String token) throws JwtException {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }

  public long getExpirationMs() {
    return expirationMs;
  }
}
