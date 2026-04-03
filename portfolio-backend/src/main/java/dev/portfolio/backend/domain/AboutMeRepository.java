package dev.portfolio.backend.domain;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AboutMeRepository extends JpaRepository<AboutMe, Long> {

  Optional<AboutMe> findByUserId(Long userId);
}
