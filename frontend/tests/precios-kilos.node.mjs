import {strict as assert} from 'node:assert';
import {test} from 'node:test';
import {addItem,changeQuantity,available,offerPrice,totalCart,originalTotal,savings,linePrice,quantityLabel,reconcileCart} from '../src/carrito.js';
const apple={codigo:'FR001',nombre:'Manzanas Fuji',precio:1200,stock:10,descuento:15,unidadVenta:'kg'};
const honey={codigo:'PO001',nombre:'Miel',precio:5000,stock:7,descuento:20,unidadVenta:'unidad'};
test('Manzanas: medio kilo rebajado, ahorro y total correctos',()=>{
 const items=addItem([],apple,0.5);
 assert.equal(items[0].cantidad,0.5);
 assert.equal(offerPrice(apple),1020);
 assert.equal(originalTotal(items),600);
 assert.equal(totalCart(items),510);
 assert.equal(savings(items),90);
 assert.equal(available(apple,items),9.5);
});
test('Frutas admiten fracciones de 250 gramos',()=>{
 const items=addItem([],apple,1.75);
 assert.equal(available(apple,items),8.25);
 assert.throws(()=>addItem(items,apple,0.3),/0.25/);
 assert.throws(()=>addItem(items,apple,9),/stock/i);
});
test('Miel solo admite unidades enteras',()=>{
 assert.throws(()=>addItem([],honey,0.5),/1 unidad/);
 const items=addItem([],honey,2);
 assert.equal(totalCart(items),8000);
 assert.equal(savings(items),2000);
 assert.equal(quantityLabel(2,honey),'2 unidades');
});
test('Al modificar la cantidad, vuelve disponibilidad al catálogo',()=>{
 const items=addItem([],apple,3);
 const changed=changeQuantity(items,'FR001',1.5);
 assert.equal(available(apple,changed),8.5);
 const reconciled=reconcileCart(changed,[{...apple,stock:1}]);
 assert.equal(reconciled[0].cantidad,1);
});
