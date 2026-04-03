package dev.portfolio.backend.domain;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioUserRepository extends JpaRepository<PortfolioUser, Long> {

  Optional<PortfolioUser> findByUsername(String username);

  Optional<PortfolioUser> findFirstByOrderByIdAsc();
}
