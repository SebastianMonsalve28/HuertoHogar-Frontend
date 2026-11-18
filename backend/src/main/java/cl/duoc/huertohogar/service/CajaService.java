package cl.duoc.huertohogar.service;

import cl.duoc.huertohogar.model.Producto;
import cl.duoc.huertohogar.repository.ProductoRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CajaService {
  public record Seleccion(String codigo, BigDecimal cantidad) {}
  public record Oferta(String id, String nombre, String descripcion, int personas,
    List<Seleccion> productos, BigDecimal kilos, BigDecimal precio, boolean disponible, String imagen) {}
  private record Plantilla(String nombre, String descripcion, int personas, String imagen, List<Seleccion> componentes) {}
  private final ProductoRepository productos;
  private static Seleccion sel(String codigo, String cantidad) { return new Seleccion(codigo, new BigDecimal(cantidad)); }
  private static final Map<String, Plantilla> PLANTILLAS = Map.of(
    "CHICA", new Plantilla("Caja Chica", "Una selección equilibrada para 1 a 2 personas", 2, "img/huerto.webp",
       List.of(sel("FR001","0.75"),sel("FR002","0.50"),sel("VR001","0.50"),sel("FR003","0.50"))),
    "MEDIANA", new Plantilla("Caja Mediana", "Más variedad para la semana", 4, "img/huerto.webp",
       List.of(sel("FR001","1.00"),sel("FR002","1.00"),sel("FR003","1.00"),sel("VR001","0.75"),sel("VR002","0.50"))),
    "GRANDE", new Plantilla("Caja Grande", "Una caja abundante para compartir", 6, "img/huerto.webp",
       List.of(sel("FR001","1.50"),sel("FR002","1.50"),sel("FR003","1.50"),sel("VR001","1.00"),sel("VR002","0.75"),sel("VR003","0.75"))),
    "FRUTAS", new Plantilla("Caja de Frutas", "Manzanas, naranjas y plátanos de temporada", 3, "img/manzanas.jpg",
       List.of(sel("FR001","1.00"),sel("FR002","1.00"),sel("FR003","1.00"))),
    "VERDURAS", new Plantilla("Caja de Verduras", "Zanahorias, espinacas y pimientos", 3, "img/zanahorias.jpg",
       List.of(sel("VR001","1.00"),sel("VR002","0.75"),sel("VR003","1.00")))
  );
  public CajaService(ProductoRepository productos) { this.productos = productos; }
  public List<Seleccion> composicion(String id) {
    Plantilla p = PLANTILLAS.get(id == null ? "" : id.toUpperCase(Locale.ROOT));
    if (p == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Caja preparada no válida");
    return p.componentes();
  }
  public String nombre(String id) { return PLANTILLAS.get(id).nombre(); }
  public void validarPersonalizada(List<Seleccion> seleccion) {
    if (seleccion == null || seleccion.size() < 2 || seleccion.size() > 6)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arma tu caja con 2 a 6 productos diferentes");
    Set<String> vistos = new HashSet<>();
    BigDecimal peso = BigDecimal.ZERO;
    for (Seleccion i : seleccion) {
      if (i == null || i.codigo() == null || i.cantidad() == null || !vistos.add(i.codigo()))
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Productos repetidos o inválidos en la caja");
      Producto p = productos.findById(i.codigo()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Producto de caja inexistente"));
      if (!"kg".equals(p.unidadVenta) || i.cantidad().compareTo(BigDecimal.ZERO) <= 0 ||
          i.cantidad().remainder(new BigDecimal("0.25")).compareTo(BigDecimal.ZERO) != 0)
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La caja personalizada admite frutas y verduras en pasos de 0,25 kg");
      peso = peso.add(i.cantidad());
    }
    if (peso.compareTo(new BigDecimal("1.00")) < 0 || peso.compareTo(new BigDecimal("12.00")) > 0)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Una caja personalizada debe contener entre 1 y 12 kg");
  }
  @Transactional(readOnly = true)
  public List<Oferta> listar() {
    List<Oferta> result = new ArrayList<>();
    for (String key : List.of("CHICA", "MEDIANA", "GRANDE", "FRUTAS", "VERDURAS")) {
      Plantilla t = PLANTILLAS.get(key);
      BigDecimal precio = BigDecimal.ZERO, kilos = BigDecimal.ZERO;
      boolean disponible = true;
      for (Seleccion s : t.componentes()) {
        Producto p = productos.findById(s.codigo()).orElse(null);
        kilos = kilos.add(s.cantidad());
        if (p == null || p.stock.compareTo(s.cantidad()) < 0) { disponible = false; continue; }
        precio = precio.add(p.precio.multiply(BigDecimal.valueOf(100 - p.descuento))
            .multiply(s.cantidad()).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP));
      }
      result.add(new Oferta(key, t.nombre(), t.descripcion(), t.personas(), t.componentes(), kilos,
        disponible ? precio : null, disponible, t.imagen()));
    }
    return result;
  }
}
