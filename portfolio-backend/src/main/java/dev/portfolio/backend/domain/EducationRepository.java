package dev.portfolio.backend.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EducationRepository extends JpaRepository<Education, Long> {

  List<Education> findByUserIdOrderBySortOrderAscIdAsc(Long userId);

  boolean existsByIdAndUserId(Long id, Long userId);
}
