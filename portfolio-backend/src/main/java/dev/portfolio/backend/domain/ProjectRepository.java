package dev.portfolio.backend.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {

  List<Project> findByUserIdOrderBySortOrderAscIdAsc(Long userId);

  boolean existsByIdAndUserId(Long id, Long userId);
}
