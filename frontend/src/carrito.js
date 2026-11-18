export const money = value => Math.round(Number(value || 0)).toLocaleString("es-CL", {style:"currency",currency:"CLP",maximumFractionDigits:0});
export const unitOf = product => product?.unidadVenta === "unidad" ? "unidad" : "kg";
export const stepOf = product => unitOf(product) === "kg" ? 0.25 : 1;
export const quantityLabel = (quantity, product) => `${Number(quantity).toLocaleString("es-CL", {maximumFractionDigits:2})} ${unitOf(product) === "kg" ? "kg" : Number(quantity) === 1 ? "unidad" : "unidades"}`;
export const offerPrice = product => Math.round(Number(product.precio) * (100 - Number(product.descuento || 0))) / 100;
export const linePrice = item => Math.round(Number(item.precio) * Number(item.cantidad));
export const originalLine = item => Math.round(Number(item.precioOriginal ?? item.precio) * Number(item.cantidad));
export const totalCart = items => items.reduce((total,item)=>total + linePrice(item),0);
export const originalTotal = items => items.reduce((total,item)=>total + originalLine(item),0);
export const savings = items => Math.max(0, originalTotal(items) - totalCart(items));
export const reserved = (items,code) => Number(items.find(i=>i.codigo===code)?.cantidad || 0);
const normalized = value => Math.round(Number(value) * 100) / 100;
export const available = (product,items) => Math.max(0, normalized(Number(product.stock) - reserved(items,product.codigo)));
export function validQuantity(value,product) {
 const n=Number(value), step=stepOf(product);
 return Number.isFinite(n) && n>0 && Math.abs(n / step - Math.round(n / step)) < 0.000001;
}
export function addItem(items,product,quantity=stepOf(product)) {
 if(!validQuantity(quantity,product)) throw new Error(`Usa cantidades de ${stepOf(product)} ${unitOf(product)}.`);
 const old=items.find(i=>i.codigo===product.codigo);
 const next=normalized(Number(quantity)+Number(old?.cantidad||0));
 if(next > Number(product.stock)+0.000001) throw new Error('La cantidad supera el stock disponible.');
 const line={...product,precio:offerPrice(product),precioOriginal:Number(product.precio),cantidad:next};
 return old ? items.map(i=>i.codigo===product.codigo?line:i) : [...items,line];
}
export function changeQuantity(items,code,quantity) {
 const item=items.find(i=>i.codigo===code);
 if(!item) throw new Error('Producto no encontrado en el carrito.');
 if(!validQuantity(quantity,item) || Number(quantity)>Number(item.stock)+0.000001)
  throw new Error(`Ingresa una cantidad válida de ${stepOf(item)} ${unitOf(item)}, según el stock.`);
 return items.map(i=>i.codigo===code?{...i,cantidad:normalized(quantity)}:i);
}
export function reconcileCart(items,products) {
 const byId=new Map(products.map(p=>[p.codigo,p]));
 return items.flatMap(item=>{
  const product=byId.get(item.codigo);
  if(!product || Number(product.stock)<=0 || !validQuantity(item.cantidad,product)) return [];
  const cantidad=Math.min(Number(item.cantidad),Number(product.stock));
  const aligned=normalized(Math.floor((cantidad+0.000001)/stepOf(product))*stepOf(product));
  if(aligned<=0)return [];
  return [{...product,precio:offerPrice(product),precioOriginal:Number(product.precio),cantidad:aligned}];
 });
}
