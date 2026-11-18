package cl.duoc.huertohogar.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "boleta")
public class Boleta {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @ManyToOne(optional = false) @JoinColumn(name = "usuario_id") public Usuario usuario;
  @Column(nullable = false) public Instant fecha = Instant.now();
  @Column(nullable = false, precision = 12, scale = 2) public BigDecimal total;
  @Column(nullable = false) public String estado = "CONFIRMADO";
  @Column(nullable = false) public String nombreEntrega;
  @Column(nullable = false) public String direccion;
  @Column(nullable = false) public String region;
  @Column(nullable = false) public String comuna;
  @Column(nullable = false) public String entrega;
  @Column(length = 300) public String indicaciones;
  @OneToMany(mappedBy = "boleta", cascade = CascadeType.ALL, orphanRemoval = true)
  public List<DetalleBoleta> detalles = new ArrayList<>();
  @OneToMany(mappedBy = "boleta", cascade = CascadeType.ALL, orphanRemoval = true)
  public List<CajaPedido> cajas = new ArrayList<>();
}
