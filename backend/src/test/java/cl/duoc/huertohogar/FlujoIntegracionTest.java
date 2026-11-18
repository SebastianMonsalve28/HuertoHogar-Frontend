package cl.duoc.huertohogar;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class FlujoIntegracionTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper mapper;

  private String token(String json, String ruta) throws Exception {
    MvcResult r = mvc.perform(post(ruta).contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().is2xxSuccessful()).andReturn();
    return mapper.readTree(r.getResponse().getContentAsString()).path("accessToken").asText();
  }

  @Test
  void rolesCrudYPedidoConStock() throws Exception {
    String admin = token("{\"correo\":\"admin@duoc.cl\",\"password\":\"ClaveSegura123\"}", "/api/v1/auth/login");
    String cliente = token("{\"nombre\":\"Prueba Cliente\",\"correo\":\"clienteep3@duoc.cl\",\"password\":\"Cliente12345\",\"run\":\"12345678-5\",\"region\":\"Región Metropolitana\",\"comuna\":\"Santiago\",\"direccion\":\"Av Principal 100\"}", "/api/v1/auth/registro");

    String producto = "{\"codigo\":\"EP3001\",\"nombre\":\"Pera de prueba\",\"categoria\":\"frutas\",\"precio\":500,\"stock\":5,\"descripcion\":\"Pera de la prueba de integración\",\"imagen\":\"img/manzanas.jpg\",\"descuento\":0,\"unidadVenta\":\"kg\"}";
    mvc.perform(post("/api/v1/productos").header("Authorization", "Bearer " + cliente)
        .contentType(MediaType.APPLICATION_JSON).content(producto)).andExpect(status().isForbidden());
    mvc.perform(post("/api/v1/productos").header("Authorization", "Bearer " + admin)
        .contentType(MediaType.APPLICATION_JSON).content(producto)).andExpect(status().isCreated());
    mvc.perform(get("/api/v1/productos/EP3001")).andExpect(status().isOk())
        .andExpect(jsonPath("$.stock").value(5));

    String pedido = "{\"nombre\":\"Prueba Cliente\",\"direccion\":\"Av Principal 100\",\"region\":\"Región Metropolitana\",\"comuna\":\"Santiago\",\"entrega\":\"domicilio\",\"items\":[{\"codigo\":\"EP3001\",\"cantidad\":1.5}]}";
    mvc.perform(post("/api/v1/pedidos").header("Authorization", "Bearer " + cliente)
        .contentType(MediaType.APPLICATION_JSON).content(pedido)).andExpect(status().isCreated())
        .andExpect(jsonPath("$.total").value(750));
    mvc.perform(get("/api/v1/productos/EP3001")).andExpect(status().isOk())
        .andExpect(jsonPath("$.stock").value(3.5));
    // El checkout se rechaza si intenta vender más que el stock real.
    String exceso = "{\"nombre\":\"Prueba Cliente\",\"direccion\":\"Av Principal 100\",\"region\":\"Región Metropolitana\",\"comuna\":\"Santiago\",\"entrega\":\"domicilio\",\"items\":[{\"codigo\":\"EP3001\",\"cantidad\":4}]}";
    mvc.perform(post("/api/v1/pedidos").header("Authorization", "Bearer " + cliente)
        .contentType(MediaType.APPLICATION_JSON).content(exceso))
        .andExpect(status().isConflict());
    mvc.perform(get("/api/v1/productos/EP3001")).andExpect(status().isOk())
        .andExpect(jsonPath("$.stock").value(3.5));
    // Venta por kg: manzanas con 15 % de descuento y cantidad fraccionaria.
    String manzanas = "{\"nombre\":\"Prueba Cliente\",\"direccion\":\"Av Principal 100\",\"region\":\"Región Metropolitana\",\"comuna\":\"Santiago\",\"entrega\":\"domicilio\",\"items\":[{\"codigo\":\"FR001\",\"cantidad\":0.5}]}";
    mvc.perform(post("/api/v1/pedidos").header("Authorization", "Bearer " + cliente)
        .contentType(MediaType.APPLICATION_JSON).content(manzanas))
        .andExpect(status().isCreated()).andExpect(jsonPath("$.total").value(510))
        .andExpect(jsonPath("$.productos[0].descuentoAplicado").value(15))
        .andExpect(jsonPath("$.productos[0].unidadVenta").value("kg"));
    // La miel no admite medios envases.
    String mediaMiel = "{\"nombre\":\"Prueba Cliente\",\"direccion\":\"Av Principal 100\",\"region\":\"Región Metropolitana\",\"comuna\":\"Santiago\",\"entrega\":\"domicilio\",\"items\":[{\"codigo\":\"PO001\",\"cantidad\":0.5}]}";
    mvc.perform(post("/api/v1/pedidos").header("Authorization", "Bearer " + cliente)
        .contentType(MediaType.APPLICATION_JSON).content(mediaMiel))
        .andExpect(status().isBadRequest());

    mvc.perform(get("/api/v1/pedidos").header("Authorization", "Bearer " + cliente))
        .andExpect(status().isOk()).andExpect(jsonPath("$[0].cliente").value("clienteep3@duoc.cl"));

    MvcResult usuarios = mvc.perform(get("/api/v1/usuarios").header("Authorization", "Bearer " + admin))
        .andExpect(status().isOk()).andReturn();
    JsonNode lista = mapper.readTree(usuarios.getResponse().getContentAsString());
    long clienteId = -1;
    for (JsonNode u : lista) if (u.path("correo").asText().equals("clienteep3@duoc.cl")) clienteId = u.path("id").asLong();
    if (clienteId == -1) throw new AssertionError("Cliente no encontrado");
    mvc.perform(patch("/api/v1/usuarios/" + clienteId + "/rol")
        .header("Authorization", "Bearer " + admin)
        .contentType(MediaType.APPLICATION_JSON).content("{\"rol\":\"VENDEDOR\"}"))
        .andExpect(status().isOk());
    mvc.perform(get("/api/v1/pedidos").header("Authorization", "Bearer " + cliente)).andExpect(status().isOk());
    mvc.perform(post("/api/v1/pedidos").header("Authorization", "Bearer " + cliente)
        .contentType(MediaType.APPLICATION_JSON).content(pedido)).andExpect(status().isForbidden());
    mvc.perform(put("/api/v1/productos/EP3001").header("Authorization", "Bearer " + cliente)
        .contentType(MediaType.APPLICATION_JSON).content(producto)).andExpect(status().isForbidden());
    mvc.perform(delete("/api/v1/productos/EP3001").header("Authorization", "Bearer " + admin))
        .andExpect(status().isConflict());
  }
}
