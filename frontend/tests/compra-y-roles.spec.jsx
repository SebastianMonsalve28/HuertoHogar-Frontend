import React from 'react';
import {render, screen, fireEvent, cleanup, waitFor, within} from '@testing-library/react';
import App from '../src/Aplicacion';
import {desgloseImpuestos} from '../src/carrito';

const producto={codigo:'PR001',nombre:'Producto de prueba',precio:1190,stock:10,descuento:0,unidadVenta:'unidad',imagen:'img/miel.webp',categoriaNombre:'Orgánicos'};
const cliente={id:2,nombre:'Lucas Parra',correo:'lucas@duoc.cl',role:'cliente'};
const originalFetch=globalThis.fetch;
const pedido={id:25,cliente:'Lucas Parra',fecha:'2026-11-19T10:00:00',total:1190,neto:1000,iva:190,estado:'CONFIRMADO',productos:[{...producto,cantidad:1,subtotal:1190}],entrega:'domicilio',direccion:'Calle 123',region:'Región Metropolitana',comuna:'Santiago'};
let rol, rechazar, cuerpos, catalogo;
const respuesta=(status,datos)=>({ok:status>=200&&status<300,status,json:async()=>datos});
beforeEach(()=>{
 localStorage.clear();rol='cliente';rechazar=false;cuerpos=[];catalogo=[producto];
 localStorage.setItem('hh:cart',JSON.stringify([{...producto,cantidad:1}]));
 globalThis.fetch=jasmine.createSpy('fetch').and.callFake(async(url,opciones={})=>{
  if(url.endsWith('/auth/refresh'))return respuesta(200,{accessToken:'prueba',user:{...cliente,role:rol}});
  if(url.endsWith('/productos'))return respuesta(200,catalogo);
  if(url.endsWith('/pedidos')&&opciones.method==='POST'){
   cuerpos.push(JSON.parse(opciones.body));
   return rechazar?respuesta(402,{error:'Pago de prueba rechazado'}):respuesta(201,pedido);
  }
  if(url.endsWith('/pedidos'))return respuesta(200,[pedido]);
  if(url.endsWith('/valoraciones/resumen'))return respuesta(200,{total:0,promedio:0});
  return respuesta(200,[]);
 });
});
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;localStorage.clear();window.location.hash='';});
function abrir(ruta){window.location.hash='#'+ruta;render(<App/>);}
async function completar(){
 await screen.findByLabelText('Dirección de entrega');
 fireEvent.change(screen.getByLabelText('Dirección de entrega'),{target:{value:'Calle Principal 123'}});
 fireEvent.change(screen.getByLabelText('Región'),{target:{value:'Región Metropolitana'}});
 fireEvent.change(screen.getByLabelText('Comuna'),{target:{value:'Santiago'}});
}
it('desglosa el IVA incluido sin incrementar el precio y mantiene neto + IVA = total',()=>{
 expect(desgloseImpuestos(1190)).toEqual({neto:1000,iva:190,total:1190});
 for(const total of [0,1,255,510,999,13711]){const d=desgloseImpuestos(total);expect(d.neto+d.iva).toBe(total);}
});
it('muestra impuestos en el carrito',async()=>{abrir('/carrito');await screen.findByText('IVA incluido (19 %)');expect(screen.getByTestId('total').textContent).toContain('1.190');});
it('muestra el neto e IVA por unidad en el catálogo sin cambiar el precio',async()=>{
 abrir('/productos');
 const impuestos=await screen.findByLabelText('Desglose de impuestos');
 expect(impuestos.textContent).toContain('Neto sin IVA: $1.000');
 expect(impuestos.textContent).toContain('IVA incluido (19 %): $190 por unidad');
 expect(screen.getByText('$1.190')).toBeTruthy();
});
it('desglosa el precio rebajado por kilo y actualiza impuestos al cambiar la cantidad',async()=>{
 catalogo=[{...producto,unidadVenta:'kg',precio:11900,descuento:10}];
 abrir('/productos/PR001');await screen.findByLabelText('Cantidad en kg');
 expect(screen.getByText(/IVA incluido \(19 %\): \$1.710 por kg/)).toBeTruthy();
 fireEvent.change(screen.getByLabelText('Cantidad en kg'),{target:{value:'2'}});
 const total=within(screen.getByLabelText('Total de la cantidad seleccionada'));
 expect(total.getByText('$18.000')).toBeTruthy();
 expect(total.getByText('$3.420')).toBeTruthy();
 expect(total.getByText('$21.420')).toBeTruthy();
});
it('muestra el neto y el IVA guardados al consultar el detalle de una compra',async()=>{
 abrir('/mis-pedidos');fireEvent.click(await screen.findByRole('button',{name:'Ver detalle'}));
 const impuestos=screen.getByLabelText('Desglose de impuestos');
 expect(within(impuestos).getByText('$1.000')).toBeTruthy();
 expect(within(impuestos).getByText('$190')).toBeTruthy();
});
it('una compra aprobada muestra resultado y vacía el carrito',async()=>{
 abrir('/checkout');await completar();fireEvent.click(screen.getByRole('button',{name:'Pagar y confirmar compra de prueba'}));
 await screen.findByRole('heading',{name:'Compra exitosa'});
 expect(cuerpos[0].resultadoPago).toBe('aprobado');
 expect(JSON.parse(localStorage.getItem('hh:cart'))).toEqual([]);
 expect(screen.getByText('IVA incluido (19 %)')).toBeTruthy();
});
it('un rechazo conserva carrito y dirección; permite reintentar y aprobar',async()=>{
 rechazar=true;abrir('/checkout');await completar();
 fireEvent.change(screen.getByLabelText('Pago de prueba'),{target:{value:'rechazado'}});
 fireEvent.click(screen.getByRole('button',{name:'Pagar y confirmar compra de prueba'}));
 await screen.findByRole('heading',{name:'Compra fallida'});
 expect(cuerpos[0].resultadoPago).toBe('rechazado');
 expect(JSON.parse(localStorage.getItem('hh:cart')).length).toBe(1);
 fireEvent.click(screen.getByRole('link',{name:'Volver a intentar el pago'}));
 await screen.findByLabelText('Dirección de entrega');
 expect(screen.getByLabelText('Dirección de entrega').value).toBe('Calle Principal 123');
 expect(screen.getByLabelText('Comuna').value).toBe('Santiago');
 rechazar=false;fireEvent.click(screen.getByRole('button',{name:'Pagar y confirmar compra de prueba'}));
 await screen.findByRole('heading',{name:'Compra exitosa'});
});
it('el vendedor solo ve productos, pedidos, detalles y salir, también en el pie',async()=>{
 rol='vendedor';abrir('/gestion');await screen.findByRole('heading',{name:'Panel del vendedor'});
 expect(screen.getByRole('button',{name:'Productos'})).toBeTruthy();
 expect(screen.getByRole('button',{name:'Pedidos'})).toBeTruthy();
 expect(screen.queryByRole('button',{name:'Usuarios'})).toBeNull();
 expect(screen.queryByText('Guardar producto')).toBeNull();
 expect(screen.queryByRole('link',{name:'Ofertas'})).toBeNull();
 expect(screen.queryByRole('link',{name:'Nuestros productos'})).toBeNull();
 expect(screen.queryByRole('link',{name:'Contacto'})).toBeNull();
 expect(screen.queryByRole('link',{name:/Ir al carrito/})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Ver detalle'}));
 expect(screen.getByRole('button',{name:'Cerrar detalle'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Pedidos'}));
 fireEvent.click(await screen.findByRole('button',{name:'Ver'}));
 expect(screen.getByRole('heading',{name:'Pedido #25'})).toBeTruthy();
 expect(screen.getByText('IVA incluido (19 %)')).toBeTruthy();
});
it('administrador conserva acceso a productos, pedidos y usuarios',async()=>{
 rol='admin';abrir('/admin');await screen.findByRole('heading',{name:'Administración'});
 expect(screen.getByRole('button',{name:'Guardar producto'})).toBeTruthy();
 expect(screen.getByRole('button',{name:'Pedidos'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Usuarios'}));
 expect(screen.getByRole('heading',{name:'Usuarios'})).toBeTruthy();
});
it('cliente que intenta abrir gestión vuelve a la tienda',async()=>{
 abrir('/gestion');await waitFor(()=>{if(window.location.hash!=='#/')throw new Error('Esperando redirección');});
 expect(screen.queryByRole('heading',{name:'Administración'})).toBeNull();
});
