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
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
public class Skill {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private PortfolioUser user;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(length = 80)
  private String category;

  @Column(length = 500)
  private String notes;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder = 0;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();
}
