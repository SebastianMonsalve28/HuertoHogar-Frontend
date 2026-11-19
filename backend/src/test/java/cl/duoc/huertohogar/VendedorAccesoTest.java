package cl.duoc.huertohogar;

import cl.duoc.huertohogar.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={
 "spring.datasource.url=jdbc:h2:mem:vendedortest;MODE=MySQL;DB_CLOSE_DELAY=-1",
 "spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=",
 "spring.jpa.hibernate.ddl-auto=create-drop","app.jwt.secret=EstaEsUnaClaveDePruebaUnicamenteParaTests12345",
 "app.admin.password=ClaveSegura123","app.vendedor.password=VendedorSoloTest123"})
@AutoConfigureMockMvc @Transactional
class VendedorAccesoTest {
 @Autowired MockMvc mvc;
 @Autowired ObjectMapper json;
 @Autowired UsuarioRepository usuarios;
 @Autowired PasswordEncoder passwords;
 @Autowired ApplicationContext contexto;

 @Test void vendedorInicialIngresaYSoloPuedeConsultar() throws Exception {
  var login=mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
   .content("{\"correo\":\"vendedor@duoc.cl\",\"password\":\"VendedorSoloTest123\"}"))
   .andExpect(status().isOk()).andExpect(jsonPath("$.user.role").value("vendedor")).andReturn();
  String token=json.readTree(login.getResponse().getContentAsString()).get("accessToken").asText();
  String auth="Bearer "+token;
  mvc.perform(get("/api/v1/productos/FR002").header("Authorization",auth)).andExpect(status().isOk());
  mvc.perform(get("/api/v1/pedidos").header("Authorization",auth)).andExpect(status().isOk());
  mvc.perform(get("/api/v1/usuarios").header("Authorization",auth)).andExpect(status().isForbidden());
  mvc.perform(delete("/api/v1/productos/FR002").header("Authorization",auth)).andExpect(status().isForbidden());
 }

 @Test void rechazaClaveIncorrectaDelVendedor() throws Exception {
  mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
   .content("{\"correo\":\"vendedor@duoc.cl\",\"password\":\"incorrecta\"}"))
   .andExpect(status().isUnauthorized());
 }

 @Test void reiniciarNoDuplicaVendedorNiReemplazaSuClave() throws Exception {
  var vendedor=usuarios.findByCorreoIgnoreCase("vendedor@duoc.cl").orElseThrow();
  vendedor.passwordHash=passwords.encode("NuevaClaveSoloTest123");usuarios.saveAndFlush(vendedor);
  long cantidad=usuarios.count();
  contexto.getBean("cargarDatos",CommandLineRunner.class).run();
  assertEquals(cantidad,usuarios.count());
  assertTrue(passwords.matches("NuevaClaveSoloTest123",usuarios.findByCorreoIgnoreCase("vendedor@duoc.cl").orElseThrow().passwordHash));
 }
}
