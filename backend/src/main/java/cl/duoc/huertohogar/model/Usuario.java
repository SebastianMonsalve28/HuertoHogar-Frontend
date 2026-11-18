package cl.duoc.huertohogar.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuario", uniqueConstraints = @UniqueConstraint(columnNames = "correo"))
public class Usuario {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @Column(nullable = false, length = 120) public String nombre;
  @Column(nullable = false, length = 150) public String correo;
  @Column(nullable = false) public String passwordHash;
  @Enumerated(EnumType.STRING) @Column(nullable = false) public Rol rol = Rol.CLIENTE;
  @Column(length = 20) public String run;
  public String region;
  public String comuna;
  public String direccion;
}
