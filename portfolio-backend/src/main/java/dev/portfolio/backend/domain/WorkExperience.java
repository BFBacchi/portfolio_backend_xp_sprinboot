package dev.portfolio.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "work_experience")
@Getter
@Setter
@NoArgsConstructor
public class WorkExperience {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private PortfolioUser user;

  @Column(nullable = false, length = 255)
  private String company;

  @Column(name = "role_title", length = 255)
  private String roleTitle;

  @Column(name = "period_label", length = 120)
  private String periodLabel;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder = 0;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();
}
