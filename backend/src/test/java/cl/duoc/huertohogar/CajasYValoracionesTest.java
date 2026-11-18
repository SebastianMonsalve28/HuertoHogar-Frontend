package cl.duoc.huertohogar;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={
  "spring.datasource.url=jdbc:h2:mem:cajastest;MODE=MySQL;DB_CLOSE_DELAY=-1",
  "spring.datasource.driver-class-name=org.h2.Driver",
  "spring.datasource.username=sa",
  "spring.datasource.password=",
  "spring.jpa.hibernate.ddl-auto=create-drop",
  "app.jwt.secret=EstaEsUnaClaveDePruebaUnicamenteParaTests12345",
  "app.admin.password=ClaveSegura123"
})
@AutoConfigureMockMvc
public class CajasYValoracionesTest {
  private static final AtomicInteger N = new AtomicInteger();
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper mapper;
  private record Login(String token,String correo){}
  private Login cliente() throws Exception {
    String correo="cliente-"+UUID.randomUUID().toString().substring(0,8)+"@gmail.com";
    String run = N.incrementAndGet()==1 ? "12345678-5" : "76543210-3";
    String body="{\"nombre\":\"Cliente Test\",\"correo\":\""+correo+"\",\"password\":\"Clave1234\",\"run\":\""+run+"\",\"region\":\"Región Metropolitana\",\"comuna\":\"Santiago\",\"direccion\":\"Calle Principal 123\"}";
    MvcResult r=mvc.perform(post("/api/v1/auth/registro").contentType(MediaType.APPLICATION_JSON).content(body))
      .andExpect(status().is2xxSuccessful()).andReturn();
    return new Login(mapper.readTree(r.getResponse().getContentAsString()).path("accessToken").asText(),correo);
  }
  @Test void cajasSeDescuentanYResenasRequierenCompraVerificada() throws Exception {
    Login usuario=cliente();
    mvc.perform(get("/api/v1/cajas")).andExpect(status().isOk())
      .andExpect(jsonPath("$[0].id").exists());
    String payload="{\"nombre\":\"Cliente Test\",\"direccion\":\"Calle Principal 123\",\"region\":\"Región Metropolitana\",\"comuna\":\"Santiago\",\"entrega\":\"retiro\",\"items\":[],\"cajas\":[{\"tipo\":\"preparada\",\"presetId\":\"CHICA\"}]}";
    MvcResult r=mvc.perform(post("/api/v1/pedidos").header("Authorization","Bearer "+usuario.token())
       .contentType(MediaType.APPLICATION_JSON).content(payload))
       .andExpect(status().isCreated()).andExpect(jsonPath("$.cajas[0].nombre").value("Caja Chica"))
       .andExpect(jsonPath("$.productos.length()").value(4)).andReturn();
    JsonNode result=mapper.readTree(r.getResponse().getContentAsString());
    long pedidoId=result.path("id").asLong();
    mvc.perform(get("/api/v1/productos/FR001")).andExpect(status().isOk())
       .andExpect(jsonPath("$.stock").value(149.25));
    String comentario="Muy buena selección de frutas y verduras frescas";
    String resena="{\"boletaId\":"+pedidoId+",\"experiencia\":5,\"calidad\":4,\"variedad\":5,\"comentario\":\""+comentario+"\"}";
    mvc.perform(post("/api/v1/valoraciones").contentType(MediaType.APPLICATION_JSON).content(resena))
       .andExpect(status().isUnauthorized());
    mvc.perform(post("/api/v1/valoraciones").header("Authorization","Bearer "+usuario.token())
       .contentType(MediaType.APPLICATION_JSON).content(resena))
       .andExpect(status().isCreated()).andExpect(jsonPath("$.compraVerificada").value(true));
    mvc.perform(post("/api/v1/valoraciones").header("Authorization","Bearer "+usuario.token())
       .contentType(MediaType.APPLICATION_JSON).content(resena))
       .andExpect(status().isConflict());
    mvc.perform(get("/api/v1/valoraciones")).andExpect(status().isOk())
       .andExpect(jsonPath("$[0].comentario").value(comentario));
    mvc.perform(get("/api/v1/valoraciones/resumen")).andExpect(status().isOk())
       .andExpect(jsonPath("$.total").value(1));
  }
  @Test void cajaPersonalizadaValidaPesosYStock() throws Exception {
    Login usuario=cliente();
    String inicio="{\"nombre\":\"Cliente Test\",\"direccion\":\"Calle Principal 123\",\"region\":\"Región Metropolitana\",\"comuna\":\"Santiago\",\"entrega\":\"retiro\",\"items\":[],\"cajas\":[";
    String valida=inicio+"{\"tipo\":\"personalizada\",\"productos\":[{\"codigo\":\"FR001\",\"cantidad\":0.5},{\"codigo\":\"VR001\",\"cantidad\":0.5}]}]}";
    mvc.perform(post("/api/v1/pedidos").header("Authorization","Bearer "+usuario.token())
       .contentType(MediaType.APPLICATION_JSON).content(valida))
       .andExpect(status().isCreated()).andExpect(jsonPath("$.cajas[0].tipo").value("personalizada"));
    String invalida=inicio+"{\"tipo\":\"personalizada\",\"productos\":[{\"codigo\":\"FR001\",\"cantidad\":0.5},{\"codigo\":\"PO001\",\"cantidad\":0.5}]}]}";
    mvc.perform(post("/api/v1/pedidos").header("Authorization","Bearer "+usuario.token())
       .contentType(MediaType.APPLICATION_JSON).content(invalida)).andExpect(status().isBadRequest());
  }
}
