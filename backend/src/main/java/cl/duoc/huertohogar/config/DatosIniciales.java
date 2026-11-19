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
      @Value("${app.admin.password}") String adminPassword,
      @Value("${app.vendedor.email}") String vendedorEmail,
      @Value("${app.vendedor.password}") String vendedorPassword) {
    return args -> {
      seedCategoria(categorias, "frutas", "Frutas Frescas");
      seedCategoria(categorias, "verduras", "Verduras Orgánicas");
      seedCategoria(categorias, "organicos", "Productos Orgánicos");
      seedProducto(productos, categorias, "FR001", "Manzanas Fuji", "frutas", 1200, 150, "Manzanas Fuji crujientes y dulces cultivadas en el Valle del Maule.", "img/manzanas.webp", 15);
      seedProducto(productos, categorias, "FR002", "Naranjas", "frutas", 1000, 200, "Naranjas jugosas y ricas en vitamina C.", "img/naranjas.webp", 0);
      seedProducto(productos, categorias, "FR003", "Plátanos", "frutas", 800, 250, "Plátanos maduros y dulces ideales para desayuno.", "img/platanos.webp", 0);
      seedProducto(productos, categorias, "VR001", "Zanahorias", "verduras", 900, 100, "Zanahorias cultivadas sin pesticidas.", "img/zanahorias.webp", 10);
      seedProducto(productos, categorias, "VR002", "Espinacas", "verduras", 700, 80, "Espinacas frescas ideales para ensaladas.", "img/espinacas.webp", 0);
      seedProducto(productos, categorias, "VR003", "Pimientos Tricolores", "verduras", 1500, 120, "Pimientos rojos, amarillos y verdes.", "img/pimientos.webp", 0);
      seedProducto(productos, categorias, "PO001", "Miel", "organicos", 5000, 50, "Miel pura producida por apicultores locales.", "img/miel.webp", 20);
      // Ocho productos adicionales: total del catálogo inicial = 15 productos.
      seedProducto(productos, categorias, "FR004", "Frutillas", "frutas", 3400, 80, "Frutillas frescas, perfectas para postres y desayunos.", "img/frutillas.webp", 10);
      seedProducto(productos, categorias, "FR005", "Uvas", "frutas", 2200, 95, "Uvas seleccionadas, dulces y frescas.", "img/uvas.webp", 0);
      seedProducto(productos, categorias, "FR006", "Peras", "frutas", 1800, 130, "Peras de temporada, jugosas y aromáticas.", "img/peras.webp", 0);
      seedProducto(productos, categorias, "FR007", "Paltas Hass", "frutas", 5500, 65, "Paltas Hass cremosas y sabrosas para cada comida.", "img/paltas.webp", 5);
      seedProducto(productos, categorias, "VR004", "Tomates", "verduras", 1700, 140, "Tomates rojos ideales para ensaladas y salsas.", "img/tomates.webp", 0);
      seedProducto(productos, categorias, "VR005", "Brócoli", "verduras", 1600, 75, "Brócoli fresco para recetas saludables.", "img/brocoli.webp", 0);
      seedProducto(productos, categorias, "VR006", "Papas", "verduras", 1100, 220, "Papas versátiles para preparar tus platos favoritos.", "img/papas.webp", 0);
      seedProducto(productos, categorias, "VR007", "Lechugas", "verduras", 1300, 110, "Lechugas crujientes recién seleccionadas.", "img/lechugas.webp", 0);
      if (adminPassword != null && !adminPassword.isBlank() && !usuarios.existsByCorreoIgnoreCase(adminEmail)) {
        Usuario admin = new Usuario();
        admin.nombre = "Administrador"; admin.correo = adminEmail.trim().toLowerCase();
        admin.passwordHash = encoder.encode(adminPassword); admin.rol = Rol.ADMIN;
        usuarios.save(admin);
      }
      if (vendedorPassword != null && !vendedorPassword.isBlank()
          && !usuarios.existsByCorreoIgnoreCase(vendedorEmail)) {
        Usuario vendedor = new Usuario();
        vendedor.nombre = "Vendedor"; vendedor.correo = vendedorEmail.trim().toLowerCase();
        vendedor.passwordHash = encoder.encode(vendedorPassword); vendedor.rol = Rol.VENDEDOR;
        usuarios.save(vendedor);
      }
    };
  }
  private void seedCategoria(CategoriaRepository repo, String codigo, String nombre) {
    if (!repo.existsById(codigo)) repo.save(new Categoria(codigo, nombre));
  }
  private void seedProducto(ProductoRepository repo, CategoriaRepository categorias,
      String codigo, String nombre, String categoria, int precio, int stock,
      String descripcion, String imagen, int descuento) {
    if (repo.existsById(codigo)) {
      // Actualizar solo las rutas de fotos antiguas del catálogo de muestra,
      // sin reemplazar imágenes personalizadas por el administrador.
      Producto actual = repo.findById(codigo).orElseThrow();
      String antigua = imagen.replace(".webp", ".jpg");
      if (actual.imagen != null && actual.imagen.equals(antigua)) {
        actual.imagen = imagen; repo.save(actual);
      }
      return;
    }
    Producto p = new Producto(); p.codigo = codigo; p.nombre = nombre;
    p.categoria = categorias.getReferenceById(categoria); p.precio = BigDecimal.valueOf(precio);
    p.stock = BigDecimal.valueOf(stock); p.unidadVenta = codigo.equals("PO001") ? "unidad" : "kg"; p.descripcion = descripcion; p.imagen = imagen; p.descuento = descuento;
    repo.save(p);
  }
}
