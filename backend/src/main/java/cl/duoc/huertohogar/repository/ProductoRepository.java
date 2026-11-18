package cl.duoc.huertohogar.repository;
import cl.duoc.huertohogar.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
public interface ProductoRepository extends JpaRepository<Producto, String> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select p from Producto p where p.codigo = :codigo")
  Optional<Producto> findForUpdate(@Param("codigo") String codigo);
}
