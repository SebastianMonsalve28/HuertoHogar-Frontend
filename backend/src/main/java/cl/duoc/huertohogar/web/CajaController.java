package cl.duoc.huertohogar.web;
import cl.duoc.huertohogar.service.CajaService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/cajas")
public class CajaController {
  private final CajaService service;
  public CajaController(CajaService service) { this.service = service; }
  @GetMapping public List<CajaService.Oferta> listar() { return service.listar(); }
}
