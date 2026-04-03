package dev.portfolio.backend.api;

import dev.portfolio.backend.api.dto.LoginRequest;
import dev.portfolio.backend.api.dto.TokenResponse;
import dev.portfolio.backend.domain.PortfolioUserRepository;
import dev.portfolio.backend.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

  private final PortfolioUserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  @PostMapping("/login")
  public TokenResponse login(@Valid @RequestBody LoginRequest request) {
    var user =
        userRepository
            .findByUsername(request.username().trim())
            .orElseThrow(() -> new BadCredentialsException("Usuario o contraseña incorrectos."));
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new BadCredentialsException("Usuario o contraseña incorrectos.");
    }
    String token = jwtService.createToken(user);
    return new TokenResponse(token, "Bearer", jwtService.getExpirationMs() / 1000);
  }
}
