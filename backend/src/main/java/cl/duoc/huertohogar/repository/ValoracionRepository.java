package cl.duoc.huertohogar.repository;
import cl.duoc.huertohogar.model.Valoracion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ValoracionRepository extends JpaRepository<Valoracion,Long> {
  boolean existsByBoletaId(Long id);
  boolean existsByUsuarioIdAndBoletaIsNull(Long id);
  List<Valoracion> findAllByOrderByFechaDesc();
}
