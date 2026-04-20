package dev.portfolio.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "about_me")
@Getter
@Setter
@NoArgsConstructor
public class AboutMe {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private PortfolioUser user;

  @Column(length = 255)
  private String headline;

  @Column(columnDefinition = "TEXT")
  private String bio;

  @Column(name = "cv_text", columnDefinition = "TEXT")
  private String cvText;

  @Column(length = 400)
  private String tagline;

  @Column(name = "luna_quote", length = 500)
  private String lunaQuote;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();
}
