package cl.duoc.huertohogar.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name = "producto")
public class Producto {
  @Id @Column(length = 12) public String codigo;
  @Column(nullable = false, length = 120) public String nombre;
  @ManyToOne(optional = false) @JoinColumn(name = "categoria_codigo") public Categoria categoria;
  @Column(nullable = false, precision = 12, scale = 2) public BigDecimal precio;
  // El stock se almacena en kg para alimentos a granel, unidades para productos envasados.
  @Column(nullable = false, precision = 12, scale = 3) public BigDecimal stock;
  @Column(nullable = false, length = 500) public String descripcion;
  @Column(nullable = false) public String imagen;
  @Column(nullable = false) public Integer descuento = 0;
  @Column(nullable = false, length = 12) public String unidadVenta = "kg";
  @Version public Long version;
}
