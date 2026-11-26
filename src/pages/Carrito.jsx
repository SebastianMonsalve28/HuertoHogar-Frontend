import Impuestos from "../components/Impuestos";
import React from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { useStore } from '../Tienda';
import {money,totalCart,originalTotal,quantityLabel,unitOf,stepOf,linePrice,originalLine} from '../carrito';
import {totalCajas,originalCajas,cajaTexto,totalCaja} from '../cajas';
export default function Cart(){
 const {items,setItems,update,user,products,cajas,setCajas,quitarCaja,disponible}=useStore(); const navigate=useNavigate();
 const subtotal=originalTotal(items)+originalCajas(cajas,products);
 const total=totalCart(items)+totalCajas(cajas,products);
 const ahorro=Math.max(0,subtotal-total);
 return <section className="container section checkout-section">
  <div className="section-heading"><div><p className="eyebrow">TU SELECCIÓN</p><h1>Tu carrito</h1><p className="text-secondary">Revisa tus productos y confirma las cantidades antes de comprar.</p></div><div className="d-flex flex-wrap gap-2"><Link to="/productos" className="btn btn-outline-success">Seguir comprando</Link><Link to="/cajas" className="btn btn-success">Explorar cajas</Link></div></div>
  {!items.length && !cajas.length ? <div className="empty-state"><h2 className="h4">Tu carrito está vacío</h2><p>Agrega frutas frescas, verduras u otros productos para comenzar.</p><Link className="btn btn-success" to="/productos">Explorar productos</Link></div> :
  <div className="row g-4 mt-2"><div className="col-lg-8"><div className="cart-surface">
   {items.map(i=>{const original=Number(i.precioOriginal??i.precio),current=Number(i.precio),discount=Number(i.descuento||0),unit=unitOf(i);
     const remaining=disponible(i.codigo);
     return <article className="cart-line" key={i.codigo}>
      <img src={'/'+i.imagen} alt={i.nombre}/>
      <div className="cart-description"><h2 className="h5 mb-1">{i.nombre}</h2><p className="text-secondary small mb-2">{i.categoriaNombre}</p>
       <div className="line-prices">
        {discount>0 && <><span className="text-muted text-decoration-line-through">{money(original)}/{unit}</span><span className="offer-chip">-{discount}%</span></>}
        <strong>{money(current)}/{unit}</strong>
       </div>
       <label className="form-label small mt-2 mb-1" htmlFor={'qty-'+i.codigo}>Cantidad ({unit})</label>
       <input className="form-control quantity" id={'qty-'+i.codigo} type="number" min={stepOf(i)} max={i.stock} step={stepOf(i)} value={i.cantidad} onChange={e=>update(i.codigo,Number(e.target.value))}/>
       <small className="stock-note d-block mt-2">{quantityLabel(remaining,i)} adicionales disponibles</small>
      </div>
      <div className="cart-line-actions"><strong className="h5">{money(linePrice(i))}</strong>
       {discount>0 && <small className="text-success d-block">Ahorras {money(originalLine(i)-linePrice(i))}</small>}
       <button className="btn btn-link text-danger px-0" type="button" onClick={()=>setItems(prev=>prev.filter(p=>p.codigo!==i.codigo))}>Eliminar</button>
      </div>
     </article>})}
     {cajas.map(caja=><article className="cart-line cart-box-line" key={caja.id}>
      <div className="cart-box-emoji" aria-hidden="true">🧺</div>
      <div className="cart-description"><h2 className="h5 mb-1">{caja.nombre}</h2><p className="text-secondary small">{cajaTexto(caja,products)}</p>
        <span className="offer-chip">{caja.tipo==='preparada'?'Caja preparada':'Personalizada'}</span>
      </div><div className="cart-line-actions"><strong className="h5">{money(totalCaja(caja,products))}</strong>
      <button className="btn btn-link text-danger px-0" type="button" onClick={()=>quitarCaja(caja.id)}>Quitar caja</button></div>
     </article>)}
     <div className="d-flex justify-content-between flex-wrap gap-2 pt-3"><button className="btn btn-outline-danger" type="button" onClick={()=>{setItems([]);setCajas([]);}}>Vaciar carrito</button><Link to="/ofertas" className="btn btn-link">Ver ofertas disponibles</Link></div>
    </div></div><aside className="col-lg-4"><div className="summary sticky-summary"><h2 className="h4 mb-4">Resumen de compra</h2>
     <div className="summary-row"><span>Subtotal sin descuentos</span><span>{money(subtotal)}</span></div>
     <div className="summary-row savings"><span>Descuentos</span><strong>− {money(ahorro)}</strong></div>
     <hr/><Impuestos total={total}/><div className="summary-row summary-total"><strong>Total</strong><strong data-testid="total">{money(total)}</strong></div>
     <p className="small text-secondary mt-3">El servidor valida el stock y calcula el total definitivo al confirmar el pedido. Compra académica sin cobro real.</p>
     <button className="btn btn-success w-100 mt-2" onClick={()=>navigate(user?'/checkout':'/login')}>{user?'Continuar a compra de prueba':'Ingresar para comprar'}</button>
    </div></aside></div>}
 </section>;
}
