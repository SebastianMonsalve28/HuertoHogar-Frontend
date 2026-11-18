package cl.duoc.huertohogar.model;
import jakarta.persistence.*;
@Entity @Table(name = "categoria")
public class Categoria {
  @Id @Column(length = 30) public String codigo;
  @Column(nullable = false, length = 90) public String nombre;
  protected Categoria() {}
  public Categoria(String codigo, String nombre) { this.codigo = codigo; this.nombre = nombre; }
}
