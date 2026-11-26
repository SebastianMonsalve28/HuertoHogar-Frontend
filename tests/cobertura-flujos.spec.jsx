import React from 'react';
import {render,screen,fireEvent,cleanup,waitFor,within,act} from '@testing-library/react';
import App from '../src/Aplicacion';
import {StoreProvider,useStore} from '../src/Tienda';
import {guardarToken} from '../src/api';
const p={codigo:'FR001',nombre:'Manzana de prueba',precio:1190,stock:5,descuento:10,unidadVenta:'kg',imagen:'img/manzanas.jpg',categoria:'frutas',categoriaNombre:'Frutas',descripcion:'Fruta fresca'};
const u={codigo:'OR001',nombre:'Miel de prueba',precio:2000,stock:2,descuento:0,unidadVenta:'unidad',imagen:'img/miel.jpg',categoria:'organicos',categoriaNombre:'Orgánicos',descripcion:'Miel natural'};
const cliente={id:2,nombre:'Ana Pérez',correo:'ana@gmail.com',role:'cliente'};
let user, catalogo, pedidos, usuarios, errores, requests, resenas, resumen, compras, loginRole, cajasOferta, pedidoRespuesta;
const originalFetch=globalThis.fetch;
const resp=(status,data)=>({ok:status>=200&&status<300,status,json:async()=>data});
const btn=(name)=>screen.getByRole('button',{name,exact:true});
const click=(name)=>fireEvent.click(btn(name));
const change=(label,value)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});
const abrir=(ruta)=>{window.location.hash='#'+ruta;render(<App/>);};
const heading=(name)=>screen.findByRole('heading',{name,exact:true});
describe('Cobertura adicional: flujos de la tienda',()=>{
beforeEach(()=>{
 localStorage.clear();guardarToken(null);user=cliente;catalogo=[p,u];pedidos=[];usuarios=[cliente,{id:3,nombre:'Vendedor',correo:'vendedor@duoc.cl',role:'vendedor'}];errores={};requests=[];resenas=[];resumen={total:0,promedio:0};compras=[];loginRole='cliente';cajasOferta=[];pedidoRespuesta=null;
 globalThis.fetch=jasmine.createSpy('fetch').and.callFake(async(url,opt={})=>{
  const path=url.split('/api/v1')[1] || url;const method=opt.method||'GET';const body=opt.body?JSON.parse(opt.body):null;requests.push({path,method,body});
  if(errores[method+' '+path]){const e=errores[method+' '+path];return resp(e.status||400,{error:e.message||e});}
  if(path==='/auth/refresh')return user?resp(200,{user,accessToken:'token'}):resp(401,{});
  if(path==='/auth/login'||path==='/auth/registro'){user=user||{...cliente,role:loginRole};return resp(200,{user,accessToken:'token'});}
  if(path==='/auth/logout'){user=null;return resp(204,null);}
  if(path==='/productos'&&method==='GET')return resp(200,catalogo);
  if(path==='/productos'&&method==='POST'){catalogo=[...catalogo,body];return resp(201,body);}
  if(path.startsWith('/productos/')&&method==='PUT'){catalogo=catalogo.map(x=>x.codigo===body.codigo?body:x);return resp(200,body);}
  if(path.startsWith('/productos/')&&method==='DELETE'){catalogo=catalogo.filter(x=>x.codigo!==path.split('/').pop());return resp(204,null);}
  if(path==='/cajas')return resp(200,cajasOferta);
  if(path==='/pedidos'&&method==='POST'&&pedidoRespuesta)return resp(201,pedidoRespuesta);
  if(path==='/pedidos')return resp(200,pedidos);
  if(path==='/usuarios')return resp(200,usuarios);
  if(path.endsWith('/rol')&&method==='PATCH'){const id=Number(path.split('/')[2]);usuarios=usuarios.map(x=>x.id===id?{...x,role:body.rol.toLowerCase()}:x);return resp(200,{});}
  if(path.startsWith('/usuarios/')&&method==='DELETE'){const id=Number(path.split('/')[2]);usuarios=usuarios.filter(x=>x.id!==id);return resp(204,null);}
  if(path==='/valoraciones/resumen')return resp(200,resumen);
  if(path==='/valoraciones/compras-disponibles')return resp(200,compras);
  if(path==='/valoraciones'&&method==='GET')return resp(200,resenas);
  if(path==='/valoraciones'&&method==='POST')return resp(201,body);
  return resp(200,[]);
 });
});
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;guardarToken(null);localStorage.clear();window.location.hash='';});
it('filtra el catálogo por categoría y texto, muestra vacío y recupera resultados',async()=>{
 abrir('/productos');await heading('Nuestros productos');await screen.findByText(p.nombre);click('Orgánicos');await screen.findByText(u.nombre);expect(screen.queryByText(p.nombre)).toBeNull();change('Buscar productos','no existe');await screen.findByText(/No encontramos productos/);change('Buscar productos','miel');await screen.findByText(u.nombre);click('Todos');change('Buscar productos','');await screen.findByText(p.nombre);
});
it('selecciona cantidad en detalle, agrega, actualiza y elimina carrito',async()=>{
 abrir('/productos/FR001');await heading(p.nombre);click('+');click('−');click('Agregar al carrito');await screen.findByText(/agregado al carrito/);click('Cerrar aviso');fireEvent.click(screen.getByRole('link',{name:/Ir al carrito/}));await heading('Tu carrito');change('Cantidad (kg)','1.5');await waitFor(()=>expect(JSON.parse(localStorage.getItem('hh:cart'))[0].cantidad).toBe(1.5));click('Eliminar');await heading('Tu carrito está vacío');
});
it('informa producto inexistente',async()=>{abrir('/productos/NOEXISTE');await heading('Producto no encontrado');});
it('rechaza acceso anónimo a gestión y pedidos',async()=>{user=null;abrir('/admin');await heading('Bienvenido de nuevo');expect(screen.queryByRole('heading',{name:'Administración'})).toBeNull();});
it('vendedor es redirigido desde administrador y puede buscar productos y cerrar detalles',async()=>{
 user={...cliente,role:'vendedor'};abrir('/admin');await heading('Panel del vendedor');click('Ver productos');await heading('Catálogo de productos');change('Buscar por nombre, código o categoría','Miel');await screen.findByText(u.nombre);expect(screen.queryByText(p.nombre)).toBeNull();click('Ver detalle');expect(screen.getByRole('dialog')).toBeTruthy();click('Cerrar detalle');click('Inicio');click('Ver pedidos');await screen.findByText('No hay pedidos registrados.');
});
it('admin valida formulario, crea, edita y elimina un producto mediante REST',async()=>{
 user={...cliente,role:'admin'};abrir('/admin');await heading('Administración');await screen.findByText(p.nombre);click('Guardar producto');await screen.findByText(/Revisa código/);
 change('Código','PR099');change('Nombre','Producto nuevo');change('Precio con IVA incluido','1500');change('Forma de venta','unidad');change('Stock','3');change('Descuento (%)','5');change('Descripción','Producto para probar');change('Categoría','organicos');change('Imagen','img/miel.jpg');click('Guardar producto');await screen.findByText('Producto guardado en la base de datos.');
 const row=()=>screen.getByText('Producto nuevo').closest('tr');fireEvent.click(within(row()).getByRole('button',{name:'Editar'}));expect(screen.getByLabelText('Código').disabled).toBeTrue();change('Precio con IVA incluido','1800');click('Guardar producto');await waitFor(()=>expect(requests.some(r=>r.method==='PUT'&&r.body.precio===1800)).toBeTrue());await waitFor(()=>expect(screen.getByLabelText('Código').disabled).toBeFalse());spyOn(window,'confirm').and.returnValues(false,true);fireEvent.click(within(row()).getByRole('button',{name:'Eliminar'}));expect(requests.some(r=>r.method==='DELETE')).toBeFalse();fireEvent.click(within(row()).getByRole('button',{name:'Eliminar'}));await screen.findByText('Producto eliminado.');expect(screen.queryByText('Producto nuevo')).toBeNull();
});
it('admin cambia rol y elimina otra cuenta, protege su propia cuenta',async()=>{
 user={...cliente,role:'admin'};abrir('/admin');await heading('Administración');click('Usuarios');await screen.findByText('vendedor@duoc.cl');expect(screen.getByLabelText('Rol de ana@gmail.com').disabled).toBeTrue();change('Rol de vendedor@duoc.cl','cliente');await screen.findByText('Rol actualizado.');spyOn(window,'confirm').and.returnValue(true);fireEvent.click(within(screen.getByText('vendedor@duoc.cl').closest('tr')).getByRole('button',{name:'Eliminar'}));await screen.findByText('Usuario eliminado.');expect(screen.queryByText('vendedor@duoc.cl')).toBeNull();
});
it('login valida campos y muestra error de servidor antes de iniciar sesión correctamente',async()=>{
 user=null;abrir('/login');await heading('Bienvenido de nuevo');click('Iniciar sesión');await screen.findByText('El correo es obligatorio.');change('Correo electrónico',' ANA@GMAIL.COM ');change('Contraseña','password123');errores['POST /auth/login']='Credenciales inválidas';click('Iniciar sesión');await screen.findByText('Credenciales inválidas');delete errores['POST /auth/login'];click('Iniciar sesión');await waitFor(()=>{if(window.location.hash!=='#/')throw new Error('Esperando navegación a inicio');});expect(window.location.hash).toBe('#/');expect(requests.find(r=>r.path==='/auth/login').body.correo).toBe('ana@gmail.com');
});
it('registra usuario con RUN normalizado y comuna seleccionada',async()=>{
 user=null;abrir('/registro');await heading('Crea tu cuenta');click('Registrarme');await screen.findByText('El nombre es obligatorio.');change('Nombre completo','Ana Pérez');change('RUN (con dígito verificador)','12.345.678-5');change('Correo electrónico','ana@gmail.com');change('Contraseña','password123');change('Confirmar contraseña','password123');change('Región','Región Metropolitana');change('Comuna','Santiago');change('Dirección','Calle 123');click('Registrarme');await waitFor(()=>{if(window.location.hash!=='#/')throw new Error('Esperando navegación a inicio');});expect(window.location.hash).toBe('#/');expect(requests.find(r=>r.path==='/auth/registro').body.run).toBe('123456785');
});
it('contacto valida y guarda localmente sin simular envío de correo',async()=>{
 abrir('/contacto');await heading('Conversemos');click('Guardar mensaje');await screen.findByText('El comentario es obligatorio.');change('Nombre completo','Ana Pérez');change('Correo electrónico','ana@gmail.com');change('Mensaje','Consulta de prueba');click('Guardar mensaje');await screen.findByText(/Mensaje guardado en esta demostración/);expect(JSON.parse(localStorage.getItem('hh:messages'))[0].comentario).toBe('Consulta de prueba');expect(screen.getByLabelText('Mensaje').value).toBe('');
});
it('consulta pedidos vacíos y muestra error de consulta',async()=>{
 errores['GET /pedidos']='Servicio no disponible';abrir('/mis-pedidos');await screen.findByText('Servicio no disponible');
});
it('muestra historial vacío',async()=>{abrir('/mis-pedidos');await screen.findByText(/No hay pedidos registrados/);});
it('abre menú móvil y cierra sesión',async()=>{abrir('/productos');await heading('Nuestros productos');await screen.findByText(/Hola, Ana Pérez/);click('Abrir menú');expect(btn('Abrir menú').getAttribute('aria-expanded')).toBe('true');click('Salir');await waitFor(()=>{if(window.location.hash!=='#/')throw new Error('Esperando navegación a inicio');});expect(window.location.hash).toBe('#/');expect(requests.some(r=>r.path==='/auth/logout')).toBeTrue();});


// Casos de navegación y comportamiento que no cubría la primera ampliación.
it('login de administrador redirige al panel autorizado',async()=>{
 user=null;loginRole='admin';abrir('/login');await heading('Bienvenido de nuevo');change('Correo electrónico','ana@gmail.com');change('Contraseña','password123');click('Iniciar sesión');await heading('Administración');expect(window.location.hash).toBe('#/admin');
});
it('login de vendedor redirige al panel de consulta',async()=>{
 user=null;loginRole='vendedor';abrir('/login');await heading('Bienvenido de nuevo');change('Correo electrónico','ana@gmail.com');change('Contraseña','password123');click('Iniciar sesión');await heading('Panel del vendedor');expect(window.location.hash).toBe('#/gestion');
});
it('muestra ruta no encontrada y permite regresar',async()=>{abrir('/ruta-inexistente');await heading('Página no encontrada');fireEvent.click(screen.getByRole('link',{name:'Volver al inicio'}));await waitFor(()=>{if(window.location.hash!=='#/')throw Error('Esperando inicio');});});
it('muestra artículo inexistente',async()=>{abrir('/blog/no-existe');await heading('Artículo no encontrado');fireEvent.click(screen.getByRole('link',{name:'Volver al blog'}));await heading('Historias del huerto');});
it('muestra únicamente productos rebajados',async()=>{abrir('/ofertas');await heading('Ofertas');await screen.findByText(p.nombre);expect(screen.queryByText(u.nombre)).toBeNull();});
it('muestra ofertas vacías cuando no hay descuentos',async()=>{catalogo=[u];abrir('/ofertas');await heading('Ofertas');await screen.findByText('No hay ofertas por el momento.');});
it('checkout sin sesión solicita ingreso',async()=>{user=null;abrir('/checkout');await heading('Inicia sesión para comprar');});
it('checkout sin artículos muestra carrito vacío',async()=>{abrir('/checkout');await heading('Finalizar compra');await screen.findByText('Tu carrito está vacío.');});
it('checkout valida entrega y conserva carrito ante conflicto de stock',async()=>{
 localStorage.setItem('hh:cart',JSON.stringify([{...p,cantidad:1}]));abrir('/checkout');await screen.findByLabelText('Dirección de entrega');click('Pagar y confirmar compra de prueba');await screen.findByText('La dirección es obligatoria.');change('Dirección de entrega','Calle 123');change('Región','Región Metropolitana');change('Comuna','Santiago');change('Tipo de entrega','retiro');change('Indicaciones (opcional)','Portón verde');errores['POST /pedidos']={status:409,message:'Stock insuficiente'};click('Pagar y confirmar compra de prueba');await screen.findByText('Stock insuficiente');expect(JSON.parse(localStorage.getItem('hh:cart')).length).toBe(1);expect(requests.filter(r=>r.path==='/productos').length).toBeGreaterThan(1);
});
it('resultado directo sin pedido ofrece consultar historial',async()=>{abrir('/resultado');await heading('Resultado del pedido');expect(screen.getByText('Consulta el estado de tus pedidos desde tu cuenta.')).toBeTruthy();});
it('valoraciones solicita sesión para usuarios anónimos',async()=>{user=null;abrir('/valoraciones');await heading('Ayúdanos a mejorar');await screen.findByText('Inicia sesión para valorar una compra.');});
it('administrador no puede publicar una reseña',async()=>{user={...cliente,role:'admin'};abrir('/valoraciones');await screen.findByText('Solo los clientes pueden dejar reseñas de sus compras.');});
it('cliente valora una compra, vuelve de paso y publica reseña',async()=>{
 compras=[{id:25,fecha:'2026-11-19T10:00:00'}];abrir('/valoraciones');await heading('Ayúdanos a mejorar');await screen.findByRole('option',{name:/Pedido #25/});change('Asocia una compra (opcional)','25');expect(btn('Continuar').disabled).toBeTrue();click('Experiencia de compra: 5 estrellas');click('Calidad de productos: 4 estrellas');click('Variedad de productos: 3 estrellas');click('Continuar');expect(btn('Publicar mi reseña').disabled).toBeTrue();click('Volver');click('Continuar');change('Tu comentario *','Muy buena experiencia de compra.');click('Publicar mi reseña');await screen.findByText('Tu valoración se guardó correctamente. Gracias por compartirla.');expect(requests.find(r=>r.method==='POST'&&r.path==='/valoraciones').body).toEqual({boletaId:25,experiencia:5,calidad:4,variedad:3,comentario:'Muy buena experiencia de compra.'});
});
it('muestra opiniones verificadas y resumen real del servicio',async()=>{
 resenas=[{id:1,nombre:'Cliente de prueba',fecha:'2026-11-19T10:00:00',experiencia:5,calidad:4,variedad:3,comentario:'Buena experiencia de compra.',compraVerificada:true}];resumen={total:1,experiencia:5,calidad:4,variedad:3};abrir('/valoraciones');await screen.findByText('Cliente de prueba');expect(screen.getByText(/Compra verificada/)).toBeTruthy();expect(screen.getByText('1 valoración publicada')).toBeTruthy();
});
it('muestra error del servicio de opiniones',async()=>{errores['GET /valoraciones']='Servicio de reseñas no disponible';abrir('/valoraciones');await screen.findByText(/No pudimos cargar las opiniones: Servicio de reseñas no disponible/);});
it('muestra fallo del envío de valoración y permite conservar comentario',async()=>{
 abrir('/valoraciones');await heading('Ayúdanos a mejorar');click('Experiencia de compra: 1 estrella');click('Calidad de productos: 2 estrellas');click('Variedad de productos: 3 estrellas');click('Continuar');change('Tu comentario *','La compra necesita algunas mejoras.');errores['POST /valoraciones']='No se pudo publicar';click('Publicar mi reseña');await screen.findByText('No se pudo publicar');expect(screen.getByLabelText('Tu comentario *').value).toBe('La compra necesita algunas mejoras.');
});

// V3: cajas, errores de gestión y flujos alternativos.
const verdura={...p,codigo:'VE001',nombre:'Zanahoria de prueba',categoria:'verduras',categoriaNombre:'Verduras',descuento:0};
const oferta={id:'CHICA',nombre:'Caja de prueba',descripcion:'Selección fresca',personas:2,kilos:2,disponible:true,precio:2200,productos:[{codigo:p.codigo,cantidad:1},{codigo:verdura.codigo,cantidad:1}]};
const orden={id:77,cliente:'Ana Pérez',fecha:'2026-11-25T12:00:00',estado:'CONFIRMADO',entrega:'domicilio',direccion:'Calle 123',comuna:'Santiago',region:'Región Metropolitana',total:3000,neto:2521,iva:479,productos:[{...p,cantidad:1,subtotal:1000,descuentoAplicado:10},{...u,cantidad:1,subtotal:2000,descuentoAplicado:0}],cajas:[{nombre:'Caja de prueba',contenido:'Manzana y zanahoria'}]};
it('inicio muestra caja con stock e imagen alternativa sin stock',async()=>{
 cajasOferta=[oferta,{...oferta,id:'OTRA',imagen:'/img/caja_grande.png',nombre:'Caja agotada',disponible:false}];abrir('/');await heading('Caja agotada');expect(screen.getByAltText('Productos de Caja de prueba').getAttribute('src')).toBe('/img/caja_chica.png');expect(screen.getByAltText('Productos de Caja agotada').getAttribute('src')).toBe('/img/caja_grande.png');expect(screen.getByText('Sin stock')).toBeTruthy();
});
it('selecciona caja preparada y personalizada y permite quitar y vaciar',async()=>{
 catalogo=[p,u,verdura];cajasOferta=[oferta,{...oferta,id:'OTRA',nombre:'Caja agotada',disponible:false,productos:[{codigo:'X',cantidad:1}]}];abrir('/cajas');await heading('Caja agotada');await heading(verdura.nombre);expect(btn('Sin stock').disabled).toBeTrue();expect(btn('Agregar mi caja').disabled).toBeTrue();click('Agregar caja');await screen.findByText('¡Caja de prueba se agregó al carrito!');fireEvent.change(document.getElementById('caja-FR001'),{target:{value:'0.5'}});expect(btn('Agregar mi caja').disabled).toBeTrue();fireEvent.change(document.getElementById('caja-VE001'),{target:{value:'0.5'}});expect(btn('Agregar mi caja').disabled).toBeFalse();click('Agregar mi caja');await screen.findByText('¡Caja a tu gusto se agregó al carrito!');click('Ver mi carrito');await heading('Tu carrito');expect(screen.getByText('Caja preparada')).toBeTruthy();expect(screen.getByText('Personalizada')).toBeTruthy();fireEvent.click(screen.getAllByRole('button',{name:'Quitar caja'})[0]);expect(screen.queryByText('Caja preparada')).toBeNull();click('Vaciar carrito');await heading('Tu carrito está vacío');
});
it('rechaza caja si el stock cambió y muestra fallo del catálogo de cajas',async()=>{
 catalogo=[p];cajasOferta=[oferta];abrir('/cajas');await heading('Caja de prueba');await heading(p.nombre);click('Agregar caja');await screen.findByText('No hay stock suficiente para completar esta caja.');expect(JSON.parse(localStorage.getItem('hh:cajas'))).toEqual([]);
});
it('informa error al consultar cajas',async()=>{errores['GET /cajas']='Cajas no disponibles';abrir('/cajas');await screen.findByText('Cajas no disponibles');});
it('consulta una orden del vendedor con productos y cajas; cierra mediante cancelar diálogo',async()=>{
 user={...cliente,role:'vendedor'};pedidos=[orden];abrir('/gestion');await heading('Panel del vendedor');await screen.findByText('1 pedido registrado');click('Pedidos');await screen.findByText('CONFIRMADO');click('Ver');await heading('Pedido #77');expect(screen.getByText('Cajas incluidas')).toBeTruthy();fireEvent(screen.getByRole('dialog'),new Event('cancel',{cancelable:true}));expect(screen.queryByRole('dialog')).toBeNull();
});
it('admin abre detalle de producto, cancela edición y maneja errores de eliminación',async()=>{
 user={...cliente,role:'admin'};abrir('/admin');await screen.findByText(p.nombre);const fila=()=>within(screen.getByText(p.nombre).closest('tr'));fireEvent.click(fila().getByRole('button',{name:'Ver detalle'}));await heading('Detalle de '+p.nombre);click('Cerrar detalle');fireEvent.click(fila().getByRole('button',{name:'Editar'}));click('Cancelar');expect(screen.getByLabelText('Código').disabled).toBeFalse();spyOn(window,'confirm').and.returnValue(true);errores['DELETE /productos/FR001']='Producto asociado a pedidos';fireEvent.click(fila().getByRole('button',{name:'Eliminar'}));await screen.findByText('Producto asociado a pedidos');expect(screen.getByText(p.nombre)).toBeTruthy();
});
it('admin informa error al cargar pedidos y al guardar cambios',async()=>{
 user={...cliente,role:'admin'};errores['GET /pedidos']='Pedidos fuera de servicio';abrir('/admin');await screen.findByText('Pedidos fuera de servicio');await screen.findByText(p.nombre);fireEvent.click(within(screen.getByText(p.nombre).closest('tr')).getByRole('button',{name:'Editar'}));errores['PUT /productos/FR001']='No se pudo guardar';fireEvent.submit(btn('Guardar producto').closest('form'));await screen.findByText('No se pudo guardar');
});
it('admin informa fallos de rol y eliminación y respeta cancelación',async()=>{
 user={...cliente,role:'admin'};abrir('/admin');await heading('Administración');click('Usuarios');await screen.findByText('vendedor@duoc.cl');errores['PATCH /usuarios/3/rol']='Rol rechazado';change('Rol de vendedor@duoc.cl','cliente');await screen.findByText('Rol rechazado');spyOn(window,'confirm').and.returnValues(false,true);const eliminar=()=>fireEvent.click(within(screen.getByText('vendedor@duoc.cl').closest('tr')).getByRole('button',{name:'Eliminar'}));eliminar();expect(requests.some(r=>r.method==='DELETE')).toBeFalse();errores['DELETE /usuarios/3']='Cuenta protegida';eliminar();await screen.findByText('Cuenta protegida');
});
it('admin valida límites de stock y descuentos antes de enviar',async()=>{
 user={...cliente,role:'admin'};abrir('/admin');await screen.findByText(p.nombre);fireEvent.click(within(screen.getByText(p.nombre).closest('tr')).getByRole('button',{name:'Editar'}));const form=btn('Guardar producto').closest('form');for(const [label,value] of [['Nombre',' '],['Descripción',' '],['Precio con IVA incluido','0'],['Stock','-1'],['Stock','0.3'],['Descuento (%)','1.5'],['Descuento (%)','-1'],['Descuento (%)','91']]){fireEvent.change(screen.getByLabelText(label),{target:{value}});fireEvent.submit(form);await screen.findByText(/Revisa código/);change('Nombre',p.nombre);change('Descripción',p.descripcion);change('Precio con IVA incluido','1190');change('Stock','5');change('Descuento (%)','10');}expect(requests.some(r=>r.method==='PUT')).toBeFalse();
});
it('vendedor busca sin coincidencias',async()=>{user={...cliente,role:'vendedor'};abrir('/gestion?vista=productos');await screen.findByText(p.nombre);change('Buscar por nombre, código o categoría','XXXX');await screen.findByText('No se encontraron productos.');});
it('cliente abre y cierra pedido con cajas y descuento',async()=>{pedidos=[orden];abrir('/mis-pedidos');await screen.findByText('CONFIRMADO');click('Ver detalle');await heading('Pedido #77');expect(screen.getByText('Cajas del pedido')).toBeTruthy();click('Ver detalle');expect(screen.queryByRole('heading',{name:'Pedido #77'})).toBeNull();click('Ver detalle');await heading('Pedido #77');click('Cerrar detalle');expect(screen.queryByRole('heading',{name:'Pedido #77'})).toBeNull();});
it('contacto informa error al guardar localmente',async()=>{abrir('/contacto');await heading('Conversemos');change('Nombre completo','Ana Pérez');change('Correo electrónico','ana@gmail.com');change('Mensaje','Consulta de prueba');spyOn(Storage.prototype,'setItem').and.throwError('cuota');click('Guardar mensaje');await screen.findByText('No se pudo guardar el mensaje localmente.');});
it('imagen de formulario usa alternativas al fallar la carga',async()=>{abrir('/login');await heading('Bienvenido de nuevo');const alt='Compra de productos frescos en Huerto Hogar';let img=screen.getByAltText(alt);for(let i=0;i<6;i++){if(!img)break;fireEvent.error(img);img=screen.queryByAltText(alt);}expect(screen.queryByAltText(alt)).toBeNull();});
it('detalle de unidad permite editar cantidad y avisa si supera stock',async()=>{abrir('/productos/OR001');await heading(u.nombre);change('Cantidad en unidad','3');click('Agregar al carrito');await screen.findByText('La cantidad supera el stock disponible.');change('Cantidad en unidad','2');click('Agregar al carrito');await screen.findByText(/agregado al carrito/);expect(btn('Agregar al carrito').disabled).toBeTrue();});
it('carrito anónimo redirige al login sin perder productos',async()=>{user=null;localStorage.setItem('hh:cart',JSON.stringify([{...u,cantidad:1}]));abrir('/carrito');await heading(u.nombre);click('Ingresar para comprar');await heading('Bienvenido de nuevo');expect(JSON.parse(localStorage.getItem('hh:cart')).length).toBe(1);});
it('rechaza actualización de cantidad inválida desde carrito',async()=>{localStorage.setItem('hh:cart',JSON.stringify([{...u,cantidad:1}]));abrir('/carrito');await heading(u.nombre);change('Cantidad (unidad)','3');await screen.findByText(/Ingresa una cantidad válida/);expect(JSON.parse(localStorage.getItem('hh:cart'))[0].cantidad).toBe(1);});
it('checkout de cajas envía ambos tipos al servidor y muestra comprobante',async()=>{
 catalogo=[p,u,verdura];pedidoRespuesta=orden;localStorage.setItem('hh:cajas',JSON.stringify([{...oferta,id:'a',tipo:'preparada',presetId:'CHICA'},{id:'b',nombre:'Personalizada',tipo:'personalizada',productos:[{codigo:p.codigo,cantidad:1},{codigo:verdura.codigo,cantidad:1}]}]));abrir('/checkout');await heading('Finalizar compra');await screen.findByText(/Caja de prueba ·/);change('Nombre completo','Ana Pérez');change('Dirección de entrega','Calle 123');change('Región','Región Metropolitana');change('Comuna','Santiago');change('Tipo de entrega','retiro');click('Pagar y confirmar compra de prueba');await heading('Compra exitosa');expect(screen.getByText('Cajas incluidas')).toBeTruthy();const body=requests.find(r=>r.method==='POST'&&r.path==='/pedidos').body;expect(body.cajas[0]).toEqual({tipo:'preparada',presetId:'CHICA'});expect(body.cajas[1].productos.length).toBe(2);
});
it('valoraciones informa error al consultar compras disponibles',async()=>{errores['GET /valoraciones/compras-disponibles']='Historial no disponible';abrir('/valoraciones');await screen.findByText('Historial no disponible');});
it('valoraciones permite reseña sin pedido y muestra varias reseñas no verificadas',async()=>{
 resenas=[{id:1,nombre:'Una persona',fecha:'2026-11-25',experiencia:4,calidad:4,variedad:3,comentario:'Muy buenos productos',compraVerificada:false},{id:2,nombre:'Otra persona',fecha:'2026-11-25',experiencia:5,calidad:5,variedad:5,comentario:'Excelente selección',compraVerificada:false}];resumen={total:2,experiencia:4.5,calidad:4.5,variedad:4};abrir('/valoraciones');await screen.findByText('2 valoraciones publicadas');click('Experiencia de compra: 5 estrellas');click('Calidad de productos: 5 estrellas');click('Variedad de productos: 5 estrellas');click('Continuar');change('Tu comentario *','Muy buena experiencia de compra.');click('Publicar mi reseña');await screen.findByText(/Tu valoración se guardó correctamente/);expect(requests.find(r=>r.method==='POST'&&r.path==='/valoraciones').body.boletaId).toBeNull();
});

function storeProbe(){let store;function Probe(){store=useStore();return <span>{store.productsLoading?'Cargando':'Listo'}</span>;}render(<StoreProvider><Probe/></StoreProvider>);return ()=>store;}
it('estado del carrito descarta datos corruptos y cajas sin productos existentes',async()=>{
 localStorage.setItem('hh:cart',JSON.stringify([{codigo:'X',cantidad:1},{codigo:'FR001',cantidad:-1},{cantidad:1}]));localStorage.setItem('hh:cajas',JSON.stringify([{id:'x',productos:[{codigo:'X',cantidad:1}]}]));const get=storeProbe();await screen.findByText('Listo');await waitFor(()=>{if(get().items.length||get().cajas.length)throw Error('Reconciliando');});expect(get().disponible('X')).toBe(0);expect(get().items).toEqual([]);expect(get().cajas).toEqual([]);
});
it('estado rechaza agregar o editar productos eliminados y aplica cantidad inicial',async()=>{
 const get=storeProbe();await screen.findByText('Listo');act(()=>get().add({codigo:'X'}));expect(get().notice).toContain('ya no está disponible');act(()=>get().update('X',1));expect(get().notice).toContain('ya no está disponible');act(()=>get().add(p));expect(get().items[0].cantidad).toBe(.25);expect(get().disponible(p.codigo)).toBe(4.75);act(()=>get().update(p.codigo,1));expect(get().items[0].cantidad).toBe(1);
});
it('estado conserva selección al no poder consultar catálogo y rechaza actualización inválida',async()=>{
 catalogo={mal:true};localStorage.setItem('hh:cart',JSON.stringify([{...p,cantidad:1}]));const get=storeProbe();await screen.findByText('Listo');expect(get().products).toEqual([]);expect(get().items.length).toBe(1);await expectAsync(get().refreshProducts()).toBeRejectedWithError('El servidor devolvió un catálogo inválido.');
});
it('estado recupera almacenamiento no array y comunica fallo de red de catálogo',async()=>{
 localStorage.setItem('hh:cart','{}');localStorage.setItem('hh:cajas','{}');errores['GET /productos']='Catálogo fuera de servicio';const get=storeProbe();await screen.findByText('Listo');expect(get().notice).toBe('Catálogo fuera de servicio');expect(get().items).toEqual([]);expect(get().cajas).toEqual([]);
});
it('salir con error del servidor limpia carrito y sesión local',async()=>{
 localStorage.setItem('hh:cart',JSON.stringify([{...p,cantidad:1}]));errores['POST /auth/logout']='No se pudo cerrar sesión en servidor';abrir('/productos');await screen.findByText(/Hola, Ana Pérez/);click('Salir');await screen.findByText('No se pudo cerrar sesión en servidor');await waitFor(()=>{if(window.location.hash!=='#/')throw Error('Esperando inicio');});expect(JSON.parse(localStorage.getItem('hh:cart'))).toEqual([]);expect(screen.queryByText(/Hola, Ana Pérez/)).toBeNull();
});
it('valoración inválida no se envía al servidor',async()=>{
 abrir('/valoraciones');await screen.findByLabelText('Asocia una compra (opcional)');const form=screen.getByLabelText('Asocia una compra (opcional)').closest('form');fireEvent.submit(form);await screen.findByText(/Completa las tres valoraciones/);expect(requests.some(r=>r.method==='POST'&&r.path==='/valoraciones')).toBeFalse();
});
it('vendedor que abre una ruta de tienda vuelve a gestión',async()=>{user={...cliente,role:'vendedor'};abrir('/productos');await heading('Panel del vendedor');expect(window.location.hash).toBe('#/gestion');});
it('cliente cambia región y pierde comuna anterior en registro',async()=>{user=null;abrir('/registro');await heading('Crea tu cuenta');change('Región','Región Metropolitana');change('Comuna','Santiago');change('Región','Biobío');expect(screen.getByLabelText('Comuna').value).toBe('');expect(screen.getByRole('option',{name:'Concepción'})).toBeTruthy();});

it('caja personalizada no permite peso superior a 12 kg ni más de seis productos',async()=>{
 catalogo=Array.from({length:7},(_,i)=>({...p,codigo:'PR00'+i,nombre:'Producto caja '+i,stock:5}));abrir('/cajas');await heading('Producto caja 6');const elegir=(i,v)=>fireEvent.change(document.getElementById('caja-PR00'+i),{target:{value:v}});for(let i=0;i<5;i++)elegir(i,'3');expect(btn('Agregar mi caja').disabled).toBeTrue();for(let i=0;i<7;i++)elegir(i,'1');expect(btn('Agregar mi caja').disabled).toBeTrue();elegir(6,'0');expect(btn('Agregar mi caja').disabled).toBeFalse();
});
it('inicio conserva llamada a cajas personalizadas ante error del servicio',async()=>{errores['GET /cajas']='Error de cajas';abrir('/');await screen.findByText('Arma tu caja a medida');await waitFor(()=>{if(!requests.some(r=>r.path==='/cajas'))throw Error('Esperando cajas');});expect(screen.getByRole('link',{name:'Explorar opciones'}).getAttribute('href')).toBe('#/cajas');});
it('historial trata respuesta no array como lista vacía',async()=>{pedidos={error:'formato inesperado'};abrir('/mis-pedidos');await screen.findByText(/No hay pedidos registrados/);});
it('historial de administrador redirige a su panel',async()=>{user={...cliente,role:'admin'};abrir('/mis-pedidos');await heading('Administración');});
it('admin rechaza unidades fraccionadas de stock',async()=>{user={...cliente,role:'admin'};abrir('/admin');await screen.findByText(u.nombre);fireEvent.click(within(screen.getByText(u.nombre).closest('tr')).getByRole('button',{name:'Editar'}));change('Stock','1.5');fireEvent.submit(btn('Guardar producto').closest('form'));await screen.findByText(/Revisa código/);expect(requests.some(r=>r.method==='PUT')).toBeFalse();});
it('checkout conserva carrito ante error de servidor distinto de stock o pago',async()=>{localStorage.setItem('hh:cart',JSON.stringify([{...p,cantidad:1}]));abrir('/checkout');await screen.findByLabelText('Dirección de entrega');change('Nombre completo','Ana Pérez');change('Dirección de entrega','Calle 123');change('Región','Región Metropolitana');change('Comuna','Santiago');errores['POST /pedidos']={status:500,message:'Servicio temporalmente no disponible'};click('Pagar y confirmar compra de prueba');await screen.findByText('Servicio temporalmente no disponible');expect(JSON.parse(localStorage.getItem('hh:cart')).length).toBe(1);});
it('valoración demasiado larga se rechaza en validación de envío',async()=>{abrir('/valoraciones');await screen.findByLabelText('Asocia una compra (opcional)');click('Experiencia de compra: 5 estrellas');click('Calidad de productos: 5 estrellas');click('Variedad de productos: 5 estrellas');click('Continuar');change('Tu comentario *','a'.repeat(801));fireEvent.submit(btn('Publicar mi reseña').closest('form'));await screen.findByText(/Completa las tres valoraciones/);expect(requests.some(r=>r.method==='POST'&&r.path==='/valoraciones')).toBeFalse();});
});
