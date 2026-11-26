import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { addItem,changeQuantity,offerPrice,totalCart,money,quantityLabel,originalTotal,savings,stepOf } from '../src/carrito';
import { emailError,validRun,validate,validateCheckout,locations } from '../src/validaciones';
import TarjetaProducto from '../src/components/TarjetaProducto';

const p={codigo:'FR001', nombre:'Manzanas Fuji',categoria:'frutas', categoriaNombre:'Frutas Frescas',precio:1200, stock:10,descuento:15,descripcion:'Manzanas frescas',imagen:'img/manzanas.jpg',unidadVenta:'kg'};
describe('EP3 · lógica del carrito',()=>{
 it('agrega un producto',()=>expect(addItem([],p,2)[0].cantidad).toBe(2));
 it('suma cantidades de un producto repetido',()=>expect(addItem(addItem([],p,2),p,3)[0].cantidad).toBe(5));
 it('no permite cantidad negativa',()=>expect(()=>addItem([],p,-1)).toThrow());
 it('no permite exceder stock',()=>expect(()=>addItem([],p,11)).toThrow());
 it('permite medios kilos',()=>expect(addItem([],p,1.5)[0].cantidad).toBe(1.5));
 it('rechaza fracciones menores a 250 gramos',()=>expect(()=>addItem([],p,0.3)).toThrow());
 it('miel solo se vende por unidad',()=>expect(()=>addItem([],{...p,unidadVenta:'unidad'},1.5)).toThrow());
 it('edita cantidades',()=>expect(changeQuantity(addItem([],p,2),'FR001',3)[0].cantidad).toBe(3));
 it('rechaza editar con stock insuficiente',()=>expect(()=>changeQuantity(addItem([],p,2),'FR001',20)).toThrow());
 it('calcula descuento',()=>expect(offerPrice(p)).toBe(1020));
 it('calcula total',()=>expect(totalCart([{...p,cantidad:2,precio:1020}])).toBe(2040));
 it('formatea CLP',()=>expect(money(1200)).toContain('1.200'));
 it('muestra kilos y unidades',()=>{expect(quantityLabel(1.5,p)).toContain('kg');expect(quantityLabel(2,{...p,unidadVenta:'unidad'})).toContain('unidades');});
 it('muestra ahorro real del carrito',()=>{const linea=addItem([],p,5);expect(originalTotal(linea)).toBe(6000);expect(totalCart(linea)).toBe(5100);expect(savings(linea)).toBe(900);});
});
describe('EP3 · validaciones',()=>{
 it('rechaza correo sin arroba',()=>expect(emailError('nada.gmail.com')).not.toBe(''));
 it('rechaza correos con arroba doble',()=>expect(emailError('a@@gmail.com')).not.toBe(''));
 it('rechaza dominio incorrecto',()=>expect(emailError('a@inventado.com')).not.toBe(''));
 it('acepta correo permitido',()=>expect(emailError('cliente@gmail.com')).toBe(''));
 it('valida dígito verificador RUN',()=>expect(validRun('12.345.678-5')).toBeTrue());
 it('rechaza RUN inválido',()=>expect(validRun('12.345.678-9')).toBeFalse());
 it('rechaza registro vacío',()=>expect(Object.keys(validate({nombre:'', correo:'',password:'',confirmPassword:'',run:'',region:'',comuna:'',direccion:''},'register')).length).toBeGreaterThan(4));
 it('detecta dirección inexistente en checkout',()=>expect(validateCheckout({nombre:'Cliente', correo:'cliente@gmail.com', direccion:'', region:'Región Metropolitana', comuna:'Santiago',indicaciones:''}).direccion).toBeTruthy());
 it('contiene comunas para región metropolitana',()=>expect(locations['Región Metropolitana']).toContain('Santiago'));
});
describe('EP3 · componente visual de producto',()=>{
 afterEach(()=>cleanup());
 const draw=(product=p,onAdd=()=>{})=>render(<MemoryRouter><TarjetaProducto product={product} onAdd={onAdd}/></MemoryRouter>);
 it('muestra nombre y precio del producto',()=>{draw();expect(screen.getByText('Manzanas Fuji')).toBeTruthy();expect(screen.getByText('-15%')).toBeTruthy();});
 it('activa acción Agregar desde DOM',()=>{const callback=jasmine.createSpy('agregar');draw(p,callback);fireEvent.click(screen.getByRole('button',{name:'Agregar'}));expect(callback).toHaveBeenCalledWith(p,0.25);});
 it('bloquea producto agotado',()=>{const callback=jasmine.createSpy('agregar');draw({...p,stock:0},callback);expect(screen.getByRole('button',{name:'Agotado'}).disabled).toBeTrue();});
 it('presenta enlace de detalles',()=>{draw();expect(screen.getAllByRole('link',{name:'Manzanas Fuji'})[0].getAttribute('href')).toContain('FR001');});
});
