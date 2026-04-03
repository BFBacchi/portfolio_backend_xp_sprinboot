package dev.portfolio.backend.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final String BEARER = "Bearer ";

  private final JwtService jwtService;

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header != null && header.startsWith(BEARER)) {
      String token = header.substring(BEARER.length()).trim();
      if (!token.isEmpty()) {
        try {
          var claims = jwtService.parseClaims(token);
          Number uidNum = claims.get("uid", Number.class);
          Long uid = uidNum != null ? uidNum.longValue() : null;
          String subject = claims.getSubject();
          if (uid != null && subject != null) {
            var principal = new PortfolioPrincipal(uid, subject);
            var auth =
                new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_PORTFOLIO_ADMIN")));
            SecurityContextHolder.getContext().setAuthentication(auth);
          }
        } catch (JwtException ignored) {
          SecurityContextHolder.clearContext();
        }
      }
    }
    filterChain.doFilter(request, response);
  }
}
