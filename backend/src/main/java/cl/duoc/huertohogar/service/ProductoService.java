package cl.duoc.huertohogar.service;

import cl.duoc.huertohogar.model.*;
import cl.duoc.huertohogar.repository.*;
import java.math.BigDecimal;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductoService {
  public record Datos(
      @NotBlank @Pattern(regexp = "[A-Z0-9]{3,12}") String codigo,
      @NotBlank String nombre,
      @NotBlank String categoria,
      @NotNull @DecimalMin("0.01") BigDecimal precio,
      @NotNull @DecimalMin("0.00") BigDecimal stock,
      @NotBlank String descripcion,
      @NotBlank String imagen,
      @NotNull @Min(0) @Max(90) Integer descuento,
      @NotBlank @Pattern(regexp="kg|unidad") String unidadVenta) {}
  public record Salida(String codigo, String nombre, String categoria,
      String categoriaNombre, BigDecimal precio, BigDecimal stock,
      String descripcion, String imagen, Integer descuento, String unidadVenta) {
    public static Salida from(Producto p) {
      return new Salida(p.codigo, p.nombre, p.categoria.codigo, p.categoria.nombre,
          p.precio, p.stock, p.descripcion, p.imagen, p.descuento, p.unidadVenta);
    }
  }
  private final ProductoRepository productos;
  private final CategoriaRepository categorias;
  public ProductoService(ProductoRepository productos, CategoriaRepository categorias) {
    this.productos = productos; this.categorias = categorias;
  }
  @Transactional(readOnly = true)
  public List<Salida> listar() { return productos.findAll().stream().map(Salida::from).toList(); }
  @Transactional(readOnly = true)
  public Salida obtener(String codigo) { return Salida.from(productos.findById(codigo).orElseThrow(() ->
      new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"))); }
  private void copiar(Producto p, Datos d) {
    Categoria categoria = categorias.findById(d.categoria()).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoría inexistente"));
    validarPeso(d.stock(), d.unidadVenta());
    p.nombre = d.nombre().trim(); p.categoria = categoria; p.precio = d.precio();
    p.stock = d.stock(); p.descripcion = d.descripcion().trim();
    p.imagen = d.imagen().trim(); p.descuento = d.descuento(); p.unidadVenta = d.unidadVenta();
  }
  private void validarPeso(BigDecimal stock, String unidad) {
    BigDecimal paso = "kg".equals(unidad) ? new BigDecimal("0.25") : BigDecimal.ONE;
    if (stock.remainder(paso).compareTo(BigDecimal.ZERO) != 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El stock debe ser multiplo de " + paso + " " + unidad);
    }
  }
  @Transactional
  public Salida crear(@Valid Datos datos) {
    if (productos.existsById(datos.codigo())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Código duplicado");
    Producto p = new Producto(); p.codigo = datos.codigo(); copiar(p, datos);
    return Salida.from(productos.save(p));
  }
  @Transactional
  public Salida actualizar(String codigo, @Valid Datos datos) {
    if (!codigo.equals(datos.codigo())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código no puede cambiar");
    Producto p = productos.findById(codigo).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    copiar(p, datos); return Salida.from(productos.save(p));
  }
  @Transactional
  public void eliminar(String codigo) {
    if (!productos.existsById(codigo)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado");
    try { productos.deleteById(codigo); productos.flush(); }
    catch (org.springframework.dao.DataIntegrityViolationException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Producto asociado a pedidos: no se puede eliminar");
    }
  }
}
