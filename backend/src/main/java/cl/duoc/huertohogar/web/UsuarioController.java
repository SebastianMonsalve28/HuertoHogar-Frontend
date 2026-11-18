package cl.duoc.huertohogar.web;

import cl.duoc.huertohogar.auth.AuthController.UsuarioDto;
import cl.duoc.huertohogar.model.*;
import cl.duoc.huertohogar.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController @RequestMapping("/api/v1/usuarios")
@PreAuthorize("hasRole('ADMIN')") @SecurityRequirement(name = "bearerAuth")
public class UsuarioController {
  public record CambiarRol(@NotNull Rol rol) {}
  private final UsuarioRepository usuarios;
  public UsuarioController(UsuarioRepository usuarios) { this.usuarios = usuarios; }
  @GetMapping @Transactional(readOnly = true)
  public List<UsuarioDto> listar() { return usuarios.findAll().stream().map(UsuarioDto::from).toList(); }
  @PatchMapping("/{id}/rol") @Transactional
  public UsuarioDto rol(@PathVariable Long id, @Valid @RequestBody CambiarRol body, @AuthenticationPrincipal Jwt jwt) {
    if (id.toString().equals(jwt.getSubject()))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes cambiar tu propio rol");
    Usuario u = usuarios.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    u.rol = body.rol(); return UsuarioDto.from(u);
  }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional
  public void eliminar(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
    if (id.toString().equals(jwt.getSubject()))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes eliminar tu propia cuenta");
    Usuario u = usuarios.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    usuarios.delete(u);
  }
}
