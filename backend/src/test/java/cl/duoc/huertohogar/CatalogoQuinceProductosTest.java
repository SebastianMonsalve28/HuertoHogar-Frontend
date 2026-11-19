package cl.duoc.huertohogar;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={
  "spring.datasource.url=jdbc:h2:mem:productos15;MODE=MySQL;DB_CLOSE_DELAY=-1",
  "spring.datasource.driver-class-name=org.h2.Driver",
  "spring.datasource.username=sa",
  "spring.datasource.password=",
  "spring.jpa.hibernate.ddl-auto=create-drop",
  "app.jwt.secret=EstaEsUnaClaveDePruebaUnicamenteParaTests12345",
  "app.admin.password=ClaveSegura123"
})
@AutoConfigureMockMvc
class CatalogoQuinceProductosTest {
  @Autowired MockMvc mvc;
  @Test void catalogoTieneQuinceProductosYFotos() throws Exception {
    mvc.perform(get("/api/v1/productos")).andExpect(status().isOk())
      .andExpect(jsonPath("$.length()").value(15))
      .andExpect(jsonPath("$[?(@.codigo == 'FR004')].imagen").exists())
      .andExpect(jsonPath("$[?(@.codigo == 'VR007')].imagen").exists());
  }
}
