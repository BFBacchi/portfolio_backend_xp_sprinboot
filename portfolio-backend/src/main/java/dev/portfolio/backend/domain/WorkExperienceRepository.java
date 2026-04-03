package dev.portfolio.backend.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {

  List<WorkExperience> findByUserIdOrderBySortOrderAscIdAsc(Long userId);

  boolean existsByIdAndUserId(Long id, Long userId);
}
