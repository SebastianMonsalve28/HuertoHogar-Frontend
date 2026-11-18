import test from 'node:test';
import assert from 'node:assert/strict';
import {totalCaja,reservadoEnCajas,cajaValida,totalCajas,originalCajas} from '../src/cajas.js';
const catalogo=[
 {codigo:'FR001',nombre:'Manzanas',precio:1200,descuento:15,stock:8,unidadVenta:'kg'},
 {codigo:'VR001',nombre:'Zanahorias',precio:900,descuento:10,stock:4,unidadVenta:'kg'},
 {codigo:'PO001',nombre:'Miel',precio:5000,descuento:0,stock:10,unidadVenta:'unidad'},
];
const caja={nombre:'Caja a tu gusto',tipo:'personalizada',productos:[{codigo:'FR001',cantidad:.5},{codigo:'VR001',cantidad:1}]};
test('caja calcula descuentos y precio por kilo',()=>{
 assert.equal(totalCaja(caja,catalogo),510+810);
 assert.equal(originalCajas([caja],catalogo),600+900);
 assert.equal(totalCajas([caja],catalogo),1320);
});
test('disponibilidad descuenta lo reservado en otras cajas',()=>{
 assert.equal(reservadoEnCajas([caja],'FR001'),.5);
 assert.equal(cajaValida(caja,catalogo,[],[caja]),true);
 assert.equal(cajaValida({...caja,productos:[{codigo:'FR001',cantidad:7.75}]},catalogo,[],[caja]),false);
});
test('rechaza cajitas cuando falta stock combinado con productos individuales',()=>{
 assert.equal(cajaValida(caja,catalogo,[{codigo:'FR001',cantidad:8}],[]),false);
});
