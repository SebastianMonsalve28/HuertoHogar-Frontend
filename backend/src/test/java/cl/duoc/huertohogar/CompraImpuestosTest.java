package cl.duoc.huertohogar;
import cl.duoc.huertohogar.model.*;
import cl.duoc.huertohogar.repository.*;
import java.math.BigDecimal;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.MediaType;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={
 "spring.datasource.url=jdbc:h2:mem:huertotest;MODE=MySQL;DB_CLOSE_DELAY=-1",
 "spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=",
 "spring.jpa.hibernate.ddl-auto=create-drop","app.jwt.secret=EstaEsUnaClaveDePruebaUnicamenteParaTests12345","app.admin.password=ClaveSegura123"})
@AutoConfigureMockMvc @Transactional
class CompraImpuestosTest {
 @Autowired MockMvc mvc;
 @Autowired UsuarioRepository usuarios;
 @Autowired ProductoRepository productos;
 @Autowired BoletaRepository boletas;
 Usuario usuario;
 @BeforeEach void preparar(){usuario=new Usuario();usuario.nombre="Cliente de prueba";usuario.correo="pago-test@duoc.cl";usuario.passwordHash="solo-test";usuario=usuarios.saveAndFlush(usuario);}
 String datos(String pago){return """
 {"nombre":"Cliente de prueba","direccion":"Calle 123","region":"Región Metropolitana","comuna":"Santiago","entrega":"domicilio","items":[{"codigo":"FR002","cantidad":1}],"resultadoPago":"%s"}
 """.formatted(pago);}
 @Test void rechazoNoCreaPedidoNiDescuentaStock() throws Exception {
  var stock=productos.findById("FR002").orElseThrow().stock;long antes=boletas.count();
  mvc.perform(post("/api/v1/pedidos").with(jwt().jwt(j->j.subject(usuario.id.toString())).authorities(new SimpleGrantedAuthority("ROLE_CLIENTE")))
   .contentType(MediaType.APPLICATION_JSON).content(datos("rechazado"))).andExpect(status().isPaymentRequired());
  assertEquals(antes,boletas.count());assertEquals(0,stock.compareTo(productos.findById("FR002").orElseThrow().stock));
 }
 @Test void aprobadoCalculaImpuestosYDescuentaStockUnaVez() throws Exception {
  BigDecimal stock=productos.findById("FR002").orElseThrow().stock;
  mvc.perform(post("/api/v1/pedidos").with(jwt().jwt(j->j.subject(usuario.id.toString())).authorities(new SimpleGrantedAuthority("ROLE_CLIENTE")))
   .contentType(MediaType.APPLICATION_JSON).content(datos("aprobado"))).andExpect(status().isCreated())
   .andExpect(jsonPath("$.total").value(1000)).andExpect(jsonPath("$.neto").value(840)).andExpect(jsonPath("$.iva").value(160));
  assertEquals(0,stock.subtract(BigDecimal.ONE).compareTo(productos.findById("FR002").orElseThrow().stock));
 }
 @Test void noAceptaUnResultadoDePagoInventado() throws Exception {
  mvc.perform(post("/api/v1/pedidos").with(jwt().jwt(j->j.subject(usuario.id.toString())).authorities(new SimpleGrantedAuthority("ROLE_CLIENTE")))
   .contentType(MediaType.APPLICATION_JSON).content(datos("inventado"))).andExpect(status().isBadRequest());
 }
 @Test void vendedorNoPuedeComprarNiAdministrarUsuarios() throws Exception {
  var vendedor=jwt().jwt(j->j.subject(usuario.id.toString())).authorities(new SimpleGrantedAuthority("ROLE_VENDEDOR"));
  mvc.perform(post("/api/v1/pedidos").with(vendedor).contentType(MediaType.APPLICATION_JSON).content(datos("aprobado"))).andExpect(status().isForbidden());
  mvc.perform(get("/api/v1/usuarios").with(vendedor)).andExpect(status().isForbidden());
  mvc.perform(get("/api/v1/pedidos").with(vendedor)).andExpect(status().isOk());
 }
}
