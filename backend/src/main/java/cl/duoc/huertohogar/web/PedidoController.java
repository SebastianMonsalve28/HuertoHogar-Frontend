package cl.duoc.huertohogar.web;

import cl.duoc.huertohogar.repository.UsuarioRepository;
import cl.duoc.huertohogar.service.PedidoService;
import cl.duoc.huertohogar.service.PedidoService.Entrada;
import cl.duoc.huertohogar.service.PedidoService.Salida;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController @RequestMapping("/api/v1/pedidos") @SecurityRequirement(name = "bearerAuth")
public class PedidoController {
  private final PedidoService pedidos;
  public PedidoController(PedidoService pedidos) { this.pedidos = pedidos; }
  private Long usuario(Jwt jwt) { return Long.parseLong(jwt.getSubject()); }
  private boolean staff(Authentication auth) {
    return auth.getAuthorities().stream().anyMatch(a ->
        a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_VENDEDOR"));
  }
  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAnyRole('CLIENTE','ADMIN')")
  public Salida crear(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody Entrada entrada) {
    return pedidos.crear(usuario(jwt), entrada);
  }
  @GetMapping
  public List<Salida> listar(@AuthenticationPrincipal Jwt jwt, Authentication auth) {
    return pedidos.listar(usuario(jwt), staff(auth));
  }
  @GetMapping("/{id}")
  public Salida detalle(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt, Authentication auth) {
    return pedidos.obtener(id, usuario(jwt), staff(auth));
  }
}
