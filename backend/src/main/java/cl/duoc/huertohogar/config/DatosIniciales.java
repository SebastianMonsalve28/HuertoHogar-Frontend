package cl.duoc.huertohogar.config;

import cl.duoc.huertohogar.model.*;
import cl.duoc.huertohogar.repository.*;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DatosIniciales {
  @Bean
  CommandLineRunner cargarDatos(CategoriaRepository categorias, ProductoRepository productos,
      UsuarioRepository usuarios, PasswordEncoder encoder,
      @Value("${app.admin.email}") String adminEmail,
      @Value("${app.admin.password}") String adminPassword) {
    return args -> {
      seedCategoria(categorias, "frutas", "Frutas Frescas");
      seedCategoria(categorias, "verduras", "Verduras Orgánicas");
      seedCategoria(categorias, "organicos", "Productos Orgánicos");
      seedProducto(productos, categorias, "FR001", "Manzanas Fuji", "frutas", 1200, 150, "Manzanas Fuji crujientes y dulces cultivadas en el Valle del Maule.", "img/manzanas.jpg", 15);
      seedProducto(productos, categorias, "FR002", "Naranjas", "frutas", 1000, 200, "Naranjas jugosas y ricas en vitamina C.", "img/naranjas.jpg", 0);
      seedProducto(productos, categorias, "FR003", "Plátanos", "frutas", 800, 250, "Plátanos maduros y dulces ideales para desayuno.", "img/platanos.jpg", 0);
      seedProducto(productos, categorias, "VR001", "Zanahorias", "verduras", 900, 100, "Zanahorias cultivadas sin pesticidas.", "img/zanahorias.jpg", 10);
      seedProducto(productos, categorias, "VR002", "Espinacas", "verduras", 700, 80, "Espinacas frescas ideales para ensaladas.", "img/espinacas.jpg", 0);
      seedProducto(productos, categorias, "VR003", "Pimientos Tricolores", "verduras", 1500, 120, "Pimientos rojos, amarillos y verdes.", "img/pimientos.jpg", 0);
      seedProducto(productos, categorias, "PO001", "Miel", "organicos", 5000, 50, "Miel pura producida por apicultores locales.", "img/miel.jpg", 20);
      if (adminPassword != null && !adminPassword.isBlank() && !usuarios.existsByCorreoIgnoreCase(adminEmail)) {
        Usuario admin = new Usuario();
        admin.nombre = "Administrador"; admin.correo = adminEmail.trim().toLowerCase();
        admin.passwordHash = encoder.encode(adminPassword); admin.rol = Rol.ADMIN;
        usuarios.save(admin);
      }
    };
  }
  private void seedCategoria(CategoriaRepository repo, String codigo, String nombre) {
    if (!repo.existsById(codigo)) repo.save(new Categoria(codigo, nombre));
  }
  private void seedProducto(ProductoRepository repo, CategoriaRepository categorias,
      String codigo, String nombre, String categoria, int precio, int stock,
      String descripcion, String imagen, int descuento) {
    if (repo.existsById(codigo)) return;
    Producto p = new Producto(); p.codigo = codigo; p.nombre = nombre;
    p.categoria = categorias.getReferenceById(categoria); p.precio = BigDecimal.valueOf(precio);
    p.stock = BigDecimal.valueOf(stock); p.unidadVenta = codigo.equals("PO001") ? "unidad" : "kg"; p.descripcion = descripcion; p.imagen = imagen; p.descuento = descuento;
    repo.save(p);
  }
}
