import * as C from '../src/carrito';
import * as B from '../src/cajas';
import * as V from '../src/validaciones';
import {storage} from '../src/almacenamiento';
import {api,apiPublica,guardarToken,sesionPorCookie,cerrarSesion} from '../src/api';
const p={codigo:'FR001',nombre:'Manzana',precio:1000,stock:3,unidadVenta:'kg',descuento:10};
const u={codigo:'OR001',nombre:'Miel',precio:2000,stock:2,unidadVenta:'unidad'};
const caja={nombre:'Caja',productos:[{codigo:p.codigo,cantidad:1},{codigo:u.codigo,cantidad:1}]};
describe('Cobertura adicional: límites y datos inválidos',()=>{
 it('reconcilia cambios de precio, stock, unidad y productos eliminados',()=>{
  const items=[{...p,cantidad:2},{...u,cantidad:1},{codigo:'X',cantidad:1}];
  expect(C.reconcileCart(items,[{...p,stock:1.6,precio:2000},{...u,stock:0}])).toEqual([{...p,stock:1.6,precio:1800,precioOriginal:2000,cantidad:1.5}]);
  expect(C.reconcileCart([{...p,cantidad:0.3}],[p])).toEqual([]);
  expect(C.reconcileCart([{...p,cantidad:1}],[{...p,stock:0.1}])).toEqual([]);
 });
 it('maneja stock reservado, cantidad por defecto y productos inexistentes',()=>{
  const items=C.addItem([],p);expect(items[0].cantidad).toBe(.25);
  expect(C.available(p,items)).toBe(2.75);expect(C.available(p,[{...p,cantidad:5}])).toBe(0);
  expect(C.reserved(items,'X')).toBe(0);expect(()=>C.changeQuantity(items,'X',1)).toThrow();
  expect(()=>C.changeQuantity(items,p.codigo,.3)).toThrow();
  expect(C.validQuantity(Infinity,p)).toBeFalse();expect(C.validQuantity(0,p)).toBeFalse();
  expect(C.changeQuantity([...items,{...u,cantidad:1}],p.codigo,1)[1].cantidad).toBe(1);
  expect(C.addItem([...items,{...u,cantidad:1}],p,1)[1].codigo).toBe(u.codigo);
 });
 it('calcula precios sin descuentos y valores límite',()=>{
  expect(C.unitOf(null)).toBe('kg');expect(C.stepOf(u)).toBe(1);
  expect(C.quantityLabel(1,u)).toContain('unidad');expect(C.offerPrice(u)).toBe(2000);
  expect(C.originalLine({...u,cantidad:2})).toBe(4000);expect(C.savings([{...u,cantidad:1,precioOriginal:1}])).toBe(0);
  expect(C.money(null)).toContain('0');expect(C.desgloseImpuestos(-10)).toEqual({neto:0,iva:0,total:0});
  expect(C.desgloseImpuestos('abc').total).toBe(0);
 });
 it('calcula cajas, descuentos y reservas compartidas',()=>{
  expect(B.productosCaja(null)).toEqual([]);expect(B.reservadoEnCajas(null,p.codigo)).toBe(0);
  expect(B.reservadoEnCajas([caja],p.codigo)).toBe(1);
  expect(B.totalCaja(caja,[p,u])).toBe(2900);expect(B.originalCaja(caja,[p,u])).toBe(3000);
  expect(B.totalCajas([caja,caja],[p,u])).toBe(5800);expect(B.originalCajas([caja],[p,u])).toBe(3000);
  expect(B.cajaTexto(caja,[p,u])).toContain('Manzana');expect(B.resumenPrecioCaja(caja,[p,u])).toContain('2.900');
  expect(B.desgloseCaja(caja,[p])).toBeNull();expect(B.totalCaja(caja,[p])).toBe(0);expect(B.originalCaja(caja,[p])).toBe(0);expect(B.cajaTexto(caja,[p])).toBe('');
 });
 it('rechaza cajas vacías, inexistentes, sin stock o cantidades no válidas',()=>{
  expect(B.cajaValida({},[p,u],[],[])).toBeFalse();expect(B.cajaValida(caja,[p],[],[])).toBeFalse();
  for(const cantidad of [0,-1,NaN,Infinity,4])expect(B.cajaValida({productos:[{codigo:p.codigo,cantidad}]},[p],[],[])).toBeFalse();
  expect(B.cajaValida(caja,[p,u],[{...p,cantidad:2}], [caja])).toBeFalse();
  expect(B.cajaValida(caja,[p,u],[],[])).toBeTrue();
 });
 it('valida formatos de correo, nombre, dirección y RUN',()=>{
  for(const correo of [null,'','a'.repeat(101)+'@gmail.com','a b@gmail.com','.a@gmail.com','a.@gmail.com','a..b@gmail.com','@gmail.com','a!b@gmail.com','a@@gmail.com','a@otro.cl'])expect(V.emailError(correo)).not.toBe('');
  expect(V.validEmail('A+1@DUOC.CL')).toBeTrue();expect(V.validEmail('x@profesor.duoc.cl')).toBeTrue();
  for(const nombre of [null,'A','Juan 1','a'.repeat(101)])expect(V.nameError(nombre)).not.toBe('');
  expect(V.nameError('María José')).toBe('');
  for(const d of [null,'a'.repeat(201),'123456','Calle','A 1'])expect(V.addressError(d)).not.toBe('');
  expect(V.addressError('Calle S/N')).toBe('');expect(V.addressError('Calle 123')).toBe('');
  expect(V.normalizeRun(' 12.345.678-5 ')).toBe('123456785');expect(V.validRun(null)).toBeFalse();
  // Recorre dígitos verificadores numéricos, cero y K calculados independientemente.
  for(let n=10000000;n<10000030;n++){let suma=0;const digitos=String(n).split('').reverse();digitos.forEach((d,i)=>suma+=Number(d)*(2+i%6));const mod=11-suma%11;const dv=mod===11?'0':mod===10?'K':String(mod);expect(V.validRun(n+'-'+dv)).toBeTrue();}
 });
 it('valida registro, login, contacto y checkout con casos límite',()=>{
  const ok={nombre:'Ana Pérez',correo:'ana@gmail.com',password:'password123',confirmPassword:'password123',run:'12.345.678-5',region:'Región Metropolitana',comuna:'Santiago',direccion:'Calle 123',comentario:'Hola',indicaciones:''};
  expect(V.validate(ok,'register')).toEqual({});expect(V.validate(ok,'contact')).toEqual({});expect(V.validate(ok,'login')).toEqual({});expect(V.validateCheckout(ok)).toEqual({});
  expect(V.validate({...ok,password:'a'.repeat(73),confirmPassword:'otra'},'register').confirmPassword).toBeTruthy();
  expect(V.validate({...ok,comentario:'a'.repeat(501)},'contact').comentario).toBeTruthy();
  expect(V.validate({...ok,comentario:' '},'contact').comentario).toBeTruthy();
  const e=V.validateCheckout({...ok,nombre:'',correo:'',region:'x',comuna:'x',direccion:'',indicaciones:'a'.repeat(301)});expect(Object.keys(e).length).toBe(6);
 });
});
describe('Cobertura adicional: almacenamiento',()=>{
 afterEach(()=>localStorage.clear());
 it('guarda, lee y recupera valores ausentes o JSON corrupto',()=>{expect(storage.read('missing',42)).toBe(42);expect(storage.write('test',{x:1})).toBeTrue();expect(storage.read('test',{})).toEqual({x:1});localStorage.setItem('hh:test','{');expect(storage.read('test',42)).toBe(42);});
 it('controla fallos de almacenamiento',()=>{spyOn(Storage.prototype,'setItem').and.throwError('cuota');expect(storage.write('x',1)).toBeFalse();spyOn(Storage.prototype,'getItem').and.throwError('bloqueado');expect(storage.read('x',0)).toBe(0);});
});
describe('Cobertura adicional: REST y renovación JWT',()=>{
 const original=globalThis.fetch;
 let mock;
 const response=(status,data)=>({ok:status>=200&&status<300,status,json:async()=>data});
 beforeEach(()=>{guardarToken(null);mock=jasmine.createSpy('fetch');globalThis.fetch=mock;});
 afterEach(()=>{globalThis.fetch=original;guardarToken(null);});
 it('envía JSON, token y cookies, y procesa 204',async()=>{guardarToken('abc');mock.and.resolveTo(response(204,null));expect(await api('/productos/1',{method:'DELETE'})).toBeNull();expect(mock.calls.mostRecent().args[1].headers.Authorization).toBe('Bearer abc');mock.and.resolveTo(response(201,{id:1}));expect(await apiPublica('/productos',{method:'POST',body:{nombre:'Test'}})).toEqual({id:1});const op=mock.calls.mostRecent().args[1];expect(op.body).toBe('{"nombre":"Test"}');expect(op.credentials).toBe('include');expect(op.headers.Authorization).toBeUndefined();});
 it('renueva una sesión vencida y reintenta la petición',async()=>{guardarToken('old');mock.and.returnValues(Promise.resolve(response(401,{})),Promise.resolve(response(200,{accessToken:'new'})),Promise.resolve(response(200,['ok'])));expect(await api('/pedidos')).toEqual(['ok']);expect(mock.calls.count()).toBe(3);expect(mock.calls.mostRecent().args[1].headers.Authorization).toBe('Bearer new');});
 it('comparte una renovación concurrente',async()=>{mock.and.resolveTo(response(200,{accessToken:'new'}));const [a,b]=await Promise.all([sesionPorCookie(),sesionPorCookie()]);expect(a).toEqual(b);expect(mock.calls.count()).toBe(1);});
 it('propaga errores sin reintentos indebidos',async()=>{for(const [body,msg] of [[{error:'e'},'e'],[{detail:'d'},'d'],[{message:'m'},'m'],[{},'Error HTTP 403']]){mock.and.resolveTo(response(403,body));await expectAsync(api('/pedidos')).toBeRejectedWithError(msg);}mock.and.resolveTo(response(401,{}));await expectAsync(api('/auth/login')).toBeRejected();});
 it('controla error de red, JSON inválido y renovación fallida',async()=>{mock.and.rejectWith(new Error('offline'));await expectAsync(apiPublica('/productos')).toBeRejectedWithError(/No se pudo conectar/);mock.and.resolveTo({ok:false,status:500,json:async()=>{throw Error('json');}});await expectAsync(apiPublica('/productos')).toBeRejectedWithError('Error HTTP 500');mock.and.resolveTo(response(401,{}));await expectAsync(sesionPorCookie()).toBeRejected();});
 it('limpia token al cerrar sesión incluso si falla el servidor',async()=>{guardarToken('x');mock.and.resolveTo(response(204,null));await cerrarSesion();await api('/productos');expect(mock.calls.mostRecent().args[1].headers.Authorization).toBeUndefined();guardarToken('y');mock.and.rejectWith(Error('offline'));await expectAsync(cerrarSesion()).toBeRejected();mock.and.resolveTo(response(200,[]));await api('/productos');expect(mock.calls.mostRecent().args[1].headers.Authorization).toBeUndefined();});
});
