package cl.duoc.huertohogar;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
public class AutenticacionSesionTest {
  @Autowired MockMvc mvc;

  private Cookie refreshCookie(MvcResult response) {
    String header = response.getResponse().getHeader("Set-Cookie");
    if (header == null || !header.startsWith("hh_refresh="))
      throw new AssertionError("No se devolvió cookie de refresh");
    String token = header.split(";",2)[0].substring("hh_refresh=".length());
    return new Cookie("hh_refresh", token);
  }

  @Test
  void loginRecargaRenuevaYLogoutInvalida() throws Exception {
    MvcResult login = mvc.perform(post("/api/v1/auth/login")
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"correo\":\"admin@duoc.cl\",\"password\":\"ClaveSegura123\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").isNotEmpty())
        .andExpect(jsonPath("$.user.role").value("admin"))
        .andReturn();

    MvcResult renovado = mvc.perform(post("/api/v1/auth/refresh").cookie(refreshCookie(login)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").isNotEmpty())
        .andReturn();

    mvc.perform(post("/api/v1/auth/logout").cookie(refreshCookie(renovado)))
        .andExpect(status().isNoContent());
    mvc.perform(post("/api/v1/auth/refresh").cookie(refreshCookie(renovado)))
        .andExpect(status().isUnauthorized());
  }
}
