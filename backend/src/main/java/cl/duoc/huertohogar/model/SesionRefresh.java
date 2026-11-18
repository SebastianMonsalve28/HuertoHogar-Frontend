package cl.duoc.huertohogar.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name = "sesion_refresh", indexes = @Index(columnList = "tokenHash", unique = true))
public class SesionRefresh {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @ManyToOne(optional = false) public Usuario usuario;
  @Column(nullable = false, unique = true, length = 64) public String tokenHash;
  @Column(nullable = false) public Instant expiresAt;
}
