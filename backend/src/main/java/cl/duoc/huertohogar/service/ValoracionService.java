package cl.duoc.huertohogar.service;

import cl.duoc.huertohogar.model.*;
import cl.duoc.huertohogar.repository.*;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ValoracionService {
  public record Entrada(Long boletaId,
    @NotNull @Min(1) @Max(5) Integer experiencia,
    @NotNull @Min(1) @Max(5) Integer calidad,
    @NotNull @Min(1) @Max(5) Integer variedad,
    @NotBlank @Size(min=15, max=800) String comentario) {}
  public record Salida(Long id, Long boletaId, String nombre, Instant fecha,
    int experiencia, int calidad, int variedad, String comentario, boolean compraVerificada) {}
  public record Disponible(Long id, Instant fecha) {}
  public record Resumen(long total, double experiencia, double calidad, double variedad) {}
  private final ValoracionRepository repo;
  private final BoletaRepository boletas;
  private final UsuarioRepository usuarios;
  public ValoracionService(ValoracionRepository repo, BoletaRepository boletas, UsuarioRepository usuarios) {
    this.repo=repo; this.boletas=boletas; this.usuarios=usuarios;
  }
  private Salida dto(Valoracion v) {
    String[] partes=v.usuario.nombre.trim().split("\\s+");
    String nombre=partes[0];
    if (partes.length>1) nombre += " " + partes[partes.length-1].substring(0,1).toUpperCase(Locale.ROOT) + ".";
    return new Salida(v.id,v.boleta==null?null:v.boleta.id,nombre,v.fecha,v.experiencia,v.calidad,v.variedad,v.comentario,v.boleta!=null);
  }
  @Transactional(readOnly=true)
  public List<Salida> listar() { return repo.findAllByOrderByFechaDesc().stream().limit(100).map(this::dto).toList(); }
  @Transactional(readOnly=true)
  public Resumen resumen() {
    List<Valoracion> lista=repo.findAll();
    if(lista.isEmpty()) return new Resumen(0,0,0,0);
    return new Resumen(lista.size(), lista.stream().mapToInt(v->v.experiencia).average().orElse(0),
       lista.stream().mapToInt(v->v.calidad).average().orElse(0),
       lista.stream().mapToInt(v->v.variedad).average().orElse(0));
  }
  @Transactional(readOnly=true)
  public List<Disponible> disponibles(Long usuarioId) {
    return boletas.findByUsuarioIdOrderByFechaDesc(usuarioId).stream()
      .filter(b->"CONFIRMADO".equals(b.estado) && !repo.existsByBoletaId(b.id))
      .map(b->new Disponible(b.id,b.fecha)).toList();
  }
  @Transactional
  public Salida crear(Long usuarioId, Entrada in) {
    Usuario usuario=usuarios.findById(usuarioId).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    if(usuario.rol!=Rol.CLIENTE) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo clientes pueden valorar compras");
    // Se puede opinar sobre la experiencia de la tienda sin haber comprado,
    // pero solo mostramos el distintivo "Compra verificada" para una compra real.
    Boleta boleta=null;
    if (in.boletaId()!=null) {
      boleta=boletas.findById(in.boletaId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Compra inexistente"));
      if (!boleta.usuario.id.equals(usuarioId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo puedes valorar tus compras");
      if (!"CONFIRMADO".equals(boleta.estado)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Compra no confirmada");
      if (repo.existsByBoletaId(boleta.id)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Esta compra ya tiene una valoración");
    } else if (repo.existsByUsuarioIdAndBoletaIsNull(usuarioId)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,"Ya compartiste una valoración general de la tienda");
    }
    Valoracion v=new Valoracion(); v.usuario=usuario; v.boleta=boleta;
    v.experiencia=in.experiencia(); v.calidad=in.calidad(); v.variedad=in.variedad();
    v.comentario=in.comentario().trim();
    return dto(repo.saveAndFlush(v));
  }
  @Transactional
  public void eliminar(Long id) {
    if(!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Valoración inexistente");
    repo.deleteById(id);
  }
}
