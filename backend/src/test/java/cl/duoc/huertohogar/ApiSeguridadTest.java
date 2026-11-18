package cl.duoc.huertohogar;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:huertotest;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "app.jwt.secret=EstaEsUnaClaveDePruebaUnicamenteParaTests12345",
    "app.admin.password=ClaveSegura123"
})
@AutoConfigureMockMvc
public class ApiSeguridadTest {
  @Autowired MockMvc mvc;
  @Test void publicoPuedeListarProductos() throws Exception {
    mvc.perform(get("/api/v1/productos")).andExpect(status().isOk())
        .andExpect(jsonPath("$[0].codigo").exists());
  }
  @Test void anonimoNoPuedeCrearProductos() throws Exception {
    mvc.perform(post("/api/v1/productos").contentType(MediaType.APPLICATION_JSON)
        .content("{}"))
        .andExpect(status().isUnauthorized());
  }
  @Test void anonimoNoPuedeConsultarPedidos() throws Exception {
    mvc.perform(get("/api/v1/pedidos")).andExpect(status().isUnauthorized());
  }
  @Test void credencialesIncorrectasSonRechazadas() throws Exception {
    mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"correo\":\"admin@duoc.cl\",\"password\":\"equivocada\"}"))
        .andExpect(status().isUnauthorized());
  }
}
