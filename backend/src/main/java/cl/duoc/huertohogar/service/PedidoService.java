package cl.duoc.huertohogar.service;

import cl.duoc.huertohogar.model.*;
import cl.duoc.huertohogar.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PedidoService {
  public record Item(@NotBlank String codigo, @NotNull @DecimalMin("0.01") @DecimalMax("1000") BigDecimal cantidad) {}
  public record CajaEntrada(@NotBlank String tipo, String presetId, List<@Valid Item> productos) {}
  public record Entrada(@NotBlank String nombre, @NotBlank String direccion,
      @NotBlank String region, @NotBlank String comuna, @NotBlank String entrega,
      @Size(max = 300) String indicaciones, List<@Valid Item> items,
      List<@Valid CajaEntrada> cajas,
      @Pattern(regexp = "aprobado|rechazado") String resultadoPago) {}
  public record Linea(String codigo, String nombre, BigDecimal cantidad, String unidadVenta,
      BigDecimal precioOriginal, int descuentoAplicado, BigDecimal precio, BigDecimal subtotal) {}
  public record CajaLinea(String codigo, String nombre, String tipo, String contenido, BigDecimal total) {}
  public record Salida(Long id, Instant fecha, String estado, BigDecimal total,
      String cliente, String nombre, String direccion, String region, String comuna,
      String entrega, List<Linea> productos, List<CajaLinea> cajas, BigDecimal neto, BigDecimal iva) {
    public static Salida from(Boleta b) {
      return new Salida(b.id, b.fecha, b.estado, b.total, b.usuario.correo,
          b.nombreEntrega, b.direccion, b.region, b.comuna, b.entrega,
          b.detalles.stream().map(d -> new Linea(d.producto.codigo, d.producto.nombre,
              d.cantidad, d.unidadVenta, d.precioOriginal, d.descuentoAplicado, d.precioUnitario, d.subtotal)).toList(),
          b.cajas.stream().map(c -> new CajaLinea(c.codigo,c.nombre,c.tipo,c.contenido,c.total)).toList(),
          b.total.divide(new BigDecimal("1.19"),0,RoundingMode.HALF_UP),
          b.total.subtract(b.total.divide(new BigDecimal("1.19"),0,RoundingMode.HALF_UP)));
    }
  }
  private final UsuarioRepository usuarios;
  private final ProductoRepository productos;
  private final BoletaRepository boletas;
  private final CajaService cajas;
  public PedidoService(UsuarioRepository usuarios, ProductoRepository productos,
      BoletaRepository boletas, CajaService cajas) {
    this.usuarios=usuarios; this.productos=productos; this.boletas=boletas; this.cajas=cajas;
  }
  private List<Item> resolver(CajaEntrada caja) {
    if ("preparada".equals(caja.tipo())) {
      if(caja.presetId()==null || caja.productos()!=null && !caja.productos().isEmpty())
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Una caja preparada utiliza su composición oficial");
      return cajas.composicion(caja.presetId()).stream().map(i -> new Item(i.codigo(), i.cantidad())).toList();
    }
    if ("personalizada".equals(caja.tipo())) {
      if(caja.presetId()!=null && !caja.presetId().isBlank())
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La caja personalizada no utiliza presetId");
      List<Item> recibidos=caja.productos()==null?List.of():caja.productos();
      if(recibidos.stream().anyMatch(i->i==null || i.codigo()==null || i.cantidad()==null))
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Productos inválidos en caja personalizada");
      List<CajaService.Seleccion> contenido=recibidos.stream()
          .map(i -> new CajaService.Seleccion(i.codigo(), i.cantidad())).toList();
      cajas.validarPersonalizada(contenido);
      return caja.productos();
    }
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Tipo de caja inválido");
  }
  @Transactional
  public Salida crear(Long usuarioId, @Valid Entrada datos) {
    Usuario usuario=usuarios.findById(usuarioId).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Usuario inexistente"));
    if(!Set.of("domicilio","retiro").contains(datos.entrega()))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Tipo de entrega inválido");
    List<Item> sueltos=datos.items()==null?List.of():datos.items();
    List<CajaEntrada> cajasEntrada=datos.cajas()==null?List.of():datos.cajas();
    if(sueltos.isEmpty() && cajasEntrada.isEmpty())
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El pedido está vacío");
    if(cajasEntrada.size()>10 || sueltos.size()>100)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Demasiadas líneas en el pedido");
    List<List<Item>> grupos=new ArrayList<>();
    for(CajaEntrada caja:cajasEntrada) grupos.add(resolver(caja));
    Map<String,BigDecimal> cantidades=new TreeMap<>();
    for(Item i:sueltos) agregar(cantidades,i);
    for(List<Item> grupo:grupos) for(Item i:grupo) agregar(cantidades,i);
    if ("rechazado".equals(datos.resultadoPago()))
      throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,"No se pudo realizar el pago de prueba");
    Boleta b=new Boleta(); b.usuario=usuario; b.nombreEntrega=datos.nombre().trim();
    b.direccion=datos.direccion().trim(); b.region=datos.region(); b.comuna=datos.comuna();
    b.entrega=datos.entrega(); b.indicaciones=datos.indicaciones(); b.total=BigDecimal.ZERO;
    Map<String,Producto> bloqueados=new HashMap<>();
    for(var entry:cantidades.entrySet()) {
      Producto p=productos.findForUpdate(entry.getKey()).orElseThrow(() ->
          new ResponseStatusException(HttpStatus.NOT_FOUND,"Producto no encontrado: " + entry.getKey()));
      BigDecimal cantidad=entry.getValue();
      BigDecimal paso="kg".equals(p.unidadVenta)?new BigDecimal("0.25"):BigDecimal.ONE;
      if(cantidad.compareTo(BigDecimal.ZERO)<=0 || cantidad.remainder(paso).compareTo(BigDecimal.ZERO)!=0)
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Cantidad inválida para " + p.nombre);
      if(cantidad.compareTo(new BigDecimal("1000"))>0 || p.stock.compareTo(cantidad)<0)
        throw new ResponseStatusException(HttpStatus.CONFLICT,"Stock insuficiente para " + p.nombre);
      bloqueados.put(entry.getKey(),p);
      BigDecimal unitario=precio(p);
      DetalleBoleta d=new DetalleBoleta(); d.boleta=b; d.producto=p; d.cantidad=cantidad;
      d.unidadVenta=p.unidadVenta; d.precioOriginal=p.precio; d.descuentoAplicado=p.descuento;
      d.precioUnitario=unitario; d.subtotal=unitario.multiply(cantidad).setScale(0,RoundingMode.HALF_UP);
      b.total=b.total.add(d.subtotal); b.detalles.add(d);
      p.stock=p.stock.subtract(cantidad);
    }
    for(int idx=0;idx<grupos.size();idx++) {
      CajaEntrada entrada=cajasEntrada.get(idx);
      String id="preparada".equals(entrada.tipo()) ? entrada.presetId().toUpperCase(Locale.ROOT) : "PERSONALIZADA";
      CajaPedido c=new CajaPedido(); c.boleta=b; c.tipo=entrada.tipo(); c.codigo=id;
      c.nombre="preparada".equals(entrada.tipo()) ? cajas.nombre(id) : "Caja a tu gusto";
      List<String> etiquetas=new ArrayList<>(); BigDecimal total=BigDecimal.ZERO;
      for(Item i:grupos.get(idx)) {
        Producto p=bloqueados.get(i.codigo());
        etiquetas.add(p.nombre + ": " + i.cantidad().stripTrailingZeros().toPlainString() + " " + p.unidadVenta);
        total=total.add(precio(p).multiply(i.cantidad()).setScale(0,RoundingMode.HALF_UP));
      }
      c.contenido=String.join(" · ",etiquetas); c.total=total; b.cajas.add(c);
    }
    return Salida.from(boletas.saveAndFlush(b));
  }
  private void agregar(Map<String,BigDecimal> mapa, Item i) {
    if(i==null || i.codigo()==null || i.codigo().isBlank() || i.cantidad()==null || i.cantidad().compareTo(BigDecimal.ZERO)<=0)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Producto y cantidad obligatorios");
    mapa.merge(i.codigo(),i.cantidad(),BigDecimal::add);
  }
  private BigDecimal precio(Producto p) {
    return p.precio.multiply(BigDecimal.valueOf(100-p.descuento))
       .divide(BigDecimal.valueOf(100),2,RoundingMode.HALF_UP);
  }
  @Transactional(readOnly=true)
  public List<Salida> listar(Long usuarioId, boolean staff) {
    List<Boleta> lista=staff?boletas.findAllByOrderByFechaDesc():boletas.findByUsuarioIdOrderByFechaDesc(usuarioId);
    return lista.stream().map(Salida::from).toList();
  }
  @Transactional(readOnly=true)
  public Salida obtener(Long id,Long usuarioId,boolean staff) {
    Boleta b=boletas.findById(id).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.NOT_FOUND,"Pedido no encontrado"));
    if(!staff && !b.usuario.id.equals(usuarioId))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,"No tienes acceso a este pedido");
    return Salida.from(b);
  }
}
