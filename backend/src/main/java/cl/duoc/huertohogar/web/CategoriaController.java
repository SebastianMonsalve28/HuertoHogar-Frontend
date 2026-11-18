package cl.duoc.huertohogar.web;

import cl.duoc.huertohogar.repository.CategoriaRepository;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/categorias")
public class CategoriaController {
  private final CategoriaRepository categorias;
  public CategoriaController(CategoriaRepository categorias) { this.categorias = categorias; }
  public record CategoriaDto(String codigo, String nombre) {}
  @GetMapping
  public List<CategoriaDto> listar() {
    return categorias.findAll().stream().map(c -> new CategoriaDto(c.codigo, c.nombre)).toList();
  }
}
