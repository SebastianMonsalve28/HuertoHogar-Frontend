package cl.duoc.huertohogar.auth;

import cl.duoc.huertohogar.model.*;
import cl.duoc.huertohogar.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  public record Registro(
      @NotBlank @Size(max = 120) String nombre,
      @Email @NotBlank String correo,
      @NotBlank @Size(min = 8, max = 72) String password,
      @NotBlank String run,
      @NotBlank String region,
      @NotBlank String comuna,
      @NotBlank String direccion) {}
  public record Login(@Email @NotBlank String correo, @NotBlank String password) {}
  public record UsuarioDto(Long id, String nombre, String correo, String role) {
    public static UsuarioDto from(Usuario u) {
      return new UsuarioDto(u.id, u.nombre, u.correo, u.rol.name().toLowerCase());
    }
  }
  public record Sesion(String accessToken, UsuarioDto user) {}

  private final UsuarioRepository usuarios;
  private final SesionRefreshRepository refreshes;
  private final PasswordEncoder passwords;
  private final TokenService tokens;
  private final SecureRandom random = new SecureRandom();
  private final boolean cookieSecure;

  public AuthController(UsuarioRepository usuarios, SesionRefreshRepository refreshes,
      PasswordEncoder passwords, TokenService tokens,
      @Value("${app.cookie-secure:false}") boolean cookieSecure) {
    this.usuarios = usuarios;
    this.refreshes = refreshes;
    this.passwords = passwords;
    this.tokens = tokens;
    this.cookieSecure = cookieSecure;
  }

  private String digest(String texto) {
    try {
      byte[] hash = MessageDigest.getInstance("SHA-256").digest(texto.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(hash);
    } catch (Exception e) { throw new IllegalStateException(e); }
  }

  private void cookie(HttpServletResponse response, String value, long seconds) {
    ResponseCookie c = ResponseCookie.from("hh_refresh", value)
        .httpOnly(true).secure(cookieSecure).sameSite("Strict")
        .path("/api/v1/auth").maxAge(Duration.ofSeconds(seconds)).build();
    response.addHeader(HttpHeaders.SET_COOKIE, c.toString());
  }

  private Sesion sesion(Usuario usuario, HttpServletResponse response) {
    byte[] bytes = new byte[32];
    random.nextBytes(bytes);
    String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    SesionRefresh refresh = new SesionRefresh();
    refresh.usuario = usuario;
    refresh.tokenHash = digest(raw);
    refresh.expiresAt = Instant.now().plus(Duration.ofDays(7));
    refreshes.save(refresh);
    cookie(response, raw, Duration.ofDays(7).toSeconds());
    return new Sesion(tokens.emitir(usuario), UsuarioDto.from(usuario));
  }

  private boolean runValido(String run) {
    if (!run.matches("\\d{6,8}[\\dK]")) return false;
    int total = 0, factor = 2;
    for (int i = run.length() - 2; i >= 0; i--) {
      total += Character.digit(run.charAt(i), 10) * factor;
      factor = factor == 7 ? 2 : factor + 1;
    }
    int dv = 11 - (total % 11);
    char esperado = dv == 11 ? '0' : dv == 10 ? 'K' : Character.forDigit(dv, 10);
    return run.charAt(run.length() - 1) == esperado;
  }

  @PostMapping("/registro")
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  public Sesion registro(@Valid @RequestBody Registro datos, HttpServletResponse response) {
    String correo = datos.correo().trim().toLowerCase();
    String run = datos.run().trim().toUpperCase().replace(".", "").replace("-", "").replace(" ", "");
    if (!runValido(run)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RUN inválido");
    if (usuarios.existsByCorreoIgnoreCase(correo)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Correo ya registrado");
    if (usuarios.existsByRun(run)) throw new ResponseStatusException(HttpStatus.CONFLICT, "RUN ya registrado");
    Usuario u = new Usuario();
    u.nombre = datos.nombre().trim(); u.correo = correo; u.passwordHash = passwords.encode(datos.password());
    u.run = run; u.region = datos.region(); u.comuna = datos.comuna(); u.direccion = datos.direccion();
    usuarios.save(u);
    return sesion(u, response);
  }

  @PostMapping("/login")
  @Transactional
  public Sesion login(@Valid @RequestBody Login datos, HttpServletResponse response) {
    Usuario u = usuarios.findByCorreoIgnoreCase(datos.correo().trim()).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));
    if (!passwords.matches(datos.password(), u.passwordHash))
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
    return sesion(u, response);
  }

  @PostMapping("/refresh")
  @Transactional
  public Sesion refresh(@CookieValue(name = "hh_refresh", required = false) String raw, HttpServletResponse response) {
    if (raw == null || raw.isBlank()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión vencida");
    SesionRefresh anterior = refreshes.findByTokenHash(digest(raw)).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión vencida"));
    if (anterior.expiresAt.isBefore(Instant.now())) {
      refreshes.delete(anterior);
      cookie(response, "", 0);
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión vencida");
    }
    Usuario u = anterior.usuario;
    refreshes.delete(anterior);
    refreshes.flush();
    return sesion(u, response);
  }

  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Transactional
  public void logout(@CookieValue(name = "hh_refresh", required = false) String raw, HttpServletResponse response) {
    if (raw != null && !raw.isBlank()) refreshes.deleteByTokenHash(digest(raw));
    cookie(response, "", 0);
  }

  @GetMapping("/me")
  public UsuarioDto me(@AuthenticationPrincipal Jwt jwt) {
    Usuario u = usuarios.findById(Long.parseLong(jwt.getSubject())).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario inexistente"));
    return UsuarioDto.from(u);
  }
}
