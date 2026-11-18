package cl.duoc.huertohogar.web;

import cl.duoc.huertohogar.service.ValoracionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController @RequestMapping("/api/v1/valoraciones")
public class ValoracionController {
  private final ValoracionService service;
  public ValoracionController(ValoracionService service) { this.service=service; }
  @GetMapping public List<ValoracionService.Salida> listar() { return service.listar(); }
  @GetMapping("/resumen") public ValoracionService.Resumen resumen() { return service.resumen(); }
  @GetMapping("/compras-disponibles")
  @PreAuthorize("hasRole('CLIENTE')") @SecurityRequirement(name="bearerAuth")
  public List<ValoracionService.Disponible> disponibles(@AuthenticationPrincipal Jwt jwt) {
    return service.disponibles(Long.parseLong(jwt.getSubject()));
  }
  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('CLIENTE')") @SecurityRequirement(name="bearerAuth")
  public ValoracionService.Salida crear(@AuthenticationPrincipal Jwt jwt,
      @Valid @RequestBody ValoracionService.Entrada entrada) {
    return service.crear(Long.parseLong(jwt.getSubject()),entrada);
  }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasRole('ADMIN')") @SecurityRequirement(name="bearerAuth")
  public void eliminar(@PathVariable Long id) { service.eliminar(id); }
}
