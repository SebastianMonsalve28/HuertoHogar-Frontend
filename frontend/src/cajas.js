import { offerPrice, money, quantityLabel } from './carrito.js';

export const productosCaja = caja => caja?.productos || [];
export const reservadoEnCajas = (cajas, codigo) => (cajas || []).reduce((sum, caja) =>
  sum + productosCaja(caja).filter(p => p.codigo === codigo).reduce((n,p) => n + Number(p.cantidad),0), 0);
export function desgloseCaja(caja, catalogo) {
  const productos = productosCaja(caja).map(linea => {
    const p = catalogo.find(x => x.codigo === linea.codigo);
    const cantidad=Number(linea.cantidad);
    return p ? { ...p, cantidad, total: Math.round(offerPrice(p)*cantidad),
      original: Math.round(Number(p.precio)*cantidad) } : null;
  });
  if(productos.some(p => !p)) return null;
  return productos;
}
export const totalCaja = (caja, productos) => (desgloseCaja(caja, productos) || []).reduce((n,p) => n+p.total,0);
export const originalCaja = (caja, productos) => (desgloseCaja(caja, productos) || []).reduce((n,p) => n+p.original,0);
export const totalCajas = (cajas, productos) => cajas.reduce((n,caja) => n+totalCaja(caja,productos),0);
export const originalCajas = (cajas, productos) => cajas.reduce((n,caja) => n+originalCaja(caja,productos),0);
export function cajaValida(caja, catalogo, items, cajas) {
  if(!productosCaja(caja).length) return false;
  for(const linea of productosCaja(caja)) {
    const p=catalogo.find(x=>x.codigo===linea.codigo);
    const reservado = Number(items.find(x=>x.codigo===linea.codigo)?.cantidad || 0) +
       reservadoEnCajas(cajas,linea.codigo);
    if(!p || !Number.isFinite(Number(linea.cantidad)) || Number(linea.cantidad)<=0 ||
       Number(linea.cantidad) + reservado > Number(p.stock)+0.000001) return false;
  }
  return true;
}
export function cajaTexto(caja, catalogo) {
  return (desgloseCaja(caja,catalogo) || []).map(p=>`${p.nombre} · ${quantityLabel(p.cantidad,p)}`).join(' · ');
}
export const resumenPrecioCaja = (caja, catalogo) => money(totalCaja(caja,catalogo));
