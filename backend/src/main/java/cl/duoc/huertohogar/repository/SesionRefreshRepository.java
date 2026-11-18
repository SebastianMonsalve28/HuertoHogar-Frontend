package cl.duoc.huertohogar.repository;
import cl.duoc.huertohogar.model.SesionRefresh;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface SesionRefreshRepository extends JpaRepository<SesionRefresh, Long> {
  Optional<SesionRefresh> findByTokenHash(String tokenHash);
  void deleteByTokenHash(String tokenHash);
}
