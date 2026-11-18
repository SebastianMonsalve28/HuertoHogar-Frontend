package cl.duoc.huertohogar.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="valoracion", uniqueConstraints=@UniqueConstraint(columnNames={"boleta_id"}))
public class Valoracion {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
  @ManyToOne(optional=false) @JoinColumn(name="usuario_id") public Usuario usuario;
  @OneToOne(optional=false) @JoinColumn(name="boleta_id", unique=true) public Boleta boleta;
  @Column(nullable=false) public int experiencia;
  @Column(nullable=false) public int calidad;
  @Column(nullable=false) public int variedad;
  @Column(nullable=false, length=800) public String comentario;
  @Column(nullable=false) public Instant fecha=Instant.now();
}
