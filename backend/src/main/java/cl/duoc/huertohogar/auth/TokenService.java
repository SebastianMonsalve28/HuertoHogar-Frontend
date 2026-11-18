package cl.duoc.huertohogar.auth;

import cl.duoc.huertohogar.model.Usuario;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
  private final JwtEncoder encoder;
  private final long minutos;

  public TokenService(JwtEncoder encoder, @Value("${app.jwt.access-minutes:15}") long minutos) {
    this.encoder = encoder;
    this.minutos = minutos;
  }

  public String emitir(Usuario usuario) {
    Instant ahora = Instant.now();
    JwtClaimsSet claims = JwtClaimsSet.builder()
        .subject(usuario.id.toString())
        .issuer("huerto-hogar")
        .issuedAt(ahora)
        .expiresAt(ahora.plusSeconds(minutos * 60))
        .claim("rol", usuario.rol.name())
        .build();
    return encoder.encode(JwtEncoderParameters.from(
        JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
  }
}
