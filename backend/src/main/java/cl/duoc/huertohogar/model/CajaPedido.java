package cl.duoc.huertohogar.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name = "caja_pedido")
public class CajaPedido {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @ManyToOne(optional = false) @JoinColumn(name = "boleta_id") public Boleta boleta;
  @Column(nullable = false, length = 20) public String tipo;
  @Column(nullable = false, length = 30) public String codigo;
  @Column(nullable = false, length = 100) public String nombre;
  @Column(nullable = false, length = 1000) public String contenido;
  @Column(nullable = false, precision = 12, scale = 2) public BigDecimal total;
}
