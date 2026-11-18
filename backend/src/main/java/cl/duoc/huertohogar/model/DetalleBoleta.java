package cl.duoc.huertohogar.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name = "detalle_boleta")
public class DetalleBoleta {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @ManyToOne(optional = false) @JoinColumn(name = "boleta_id") public Boleta boleta;
  @ManyToOne(optional = false) @JoinColumn(name = "producto_codigo") public Producto producto;
  @Column(nullable = false, precision = 12, scale = 3) public BigDecimal cantidad;
  @Column(nullable = false, length = 12) public String unidadVenta;
  @Column(nullable = false, precision = 12, scale = 2) public BigDecimal precioOriginal;
  @Column(nullable = false) public int descuentoAplicado;
  @Column(nullable = false, precision = 12, scale = 2) public BigDecimal precioUnitario;
  @Column(nullable = false, precision = 12, scale = 2) public BigDecimal subtotal;
}
