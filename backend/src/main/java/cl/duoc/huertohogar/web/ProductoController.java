package cl.duoc.huertohogar.web;

import cl.duoc.huertohogar.service.ProductoService;
import cl.duoc.huertohogar.service.ProductoService.Datos;
import cl.duoc.huertohogar.service.ProductoService.Salida;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/productos")
public class ProductoController {
  private final ProductoService service;
  public ProductoController(ProductoService service) { this.service = service; }
  @GetMapping public List<Salida> listar() { return service.listar(); }
  @GetMapping("/{codigo}") public Salida obtener(@PathVariable String codigo) { return service.obtener(codigo); }
  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('ADMIN')") @SecurityRequirement(name = "bearerAuth")
  public Salida crear(@Valid @RequestBody Datos datos) { return service.crear(datos); }
  @PutMapping("/{codigo}")
  @PreAuthorize("hasRole('ADMIN')") @SecurityRequirement(name = "bearerAuth")
  public Salida actualizar(@PathVariable String codigo, @Valid @RequestBody Datos datos) { return service.actualizar(codigo, datos); }
  @DeleteMapping("/{codigo}") @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasRole('ADMIN')") @SecurityRequirement(name = "bearerAuth")
  public void eliminar(@PathVariable String codigo) { service.eliminar(codigo); }
}
