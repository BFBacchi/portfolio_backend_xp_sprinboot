package dev.portfolio.backend.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {

  List<Skill> findByUserIdOrderBySortOrderAscIdAsc(Long userId);

  boolean existsByIdAndUserId(Long id, Long userId);
}
