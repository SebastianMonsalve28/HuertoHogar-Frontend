import React,{useState} from 'react';
import {useParams,Link} from 'react-router-dom';
import {useStore} from '../Tienda';
import {money,offerPrice,reserved,unitOf,quantityLabel,stepOf} from '../carrito';
export default function Detail(){
 const {code}=useParams(); const {products,add,productsLoading,disponible,items}=useStore();
 const [quantity,setQuantity]=useState('');
 const p=products.find(x=>x.codigo===code);
 if(productsLoading)return <section className="container section">Cargando producto...</section>;
 if(!p)return <section className="container section"><h1>Producto no encontrado</h1><Link to="/productos">Volver al catálogo</Link></section>;
 const unit=unitOf(p),step=stepOf(p),stock=disponible(p.codigo),enCarrito=reserved(items,p.codigo),chosen=quantity===''?step:Number(quantity);
 return <section className="container section product-detail-section"><Link className="back-link" to="/productos">← Volver a productos</Link>
  <div className="row g-5 align-items-center mt-2"><div className="col-lg-6"><div className="detail-picture"><img className="detail-image" src={'/'+p.imagen} alt={p.nombre}/>{Number(p.descuento)>0&&<span className="sale-flag">-{p.descuento}%</span>}</div></div>
  <div className="col-lg-6"><p className="eyebrow">{p.categoriaNombre}</p><h1>{p.nombre}</h1>
   <div className="d-flex flex-wrap gap-3 align-items-baseline mt-3 mb-2"><strong className="price detail-price">{money(offerPrice(p))}/{unit}</strong>
    {Number(p.descuento)>0&&<span className="text-muted text-decoration-line-through">Antes {money(p.precio)}/{unit}</span>}</div>
   <p className="lead detail-description">{p.descripcion}</p>
   <div className="stock-panel"><strong>{quantityLabel(stock,p)} disponibles</strong><span>{enCarrito>0?`${quantityLabel(enCarrito,p)} reservados en tu carrito`: 'Disponible para agregar al carrito'}</span></div>
   <div className="quantity-picker"><label htmlFor="quantity" className="form-label">Cantidad en {unit}</label>
    <div className="d-flex align-items-center gap-2 flex-wrap"><button type="button" className="btn btn-outline-success" onClick={()=>setQuantity(String(Math.max(step,Number((chosen-step).toFixed(2)))))}>−</button>
     <input className="form-control quantity" id="quantity" type="number" inputMode="decimal" min={step} max={stock} step={step} value={quantity===''?step:quantity} onChange={e=>setQuantity(e.target.value)}/>
     <button type="button" className="btn btn-outline-success" onClick={()=>setQuantity(String(Number((chosen+step).toFixed(2))))}>+</button></div>
    <small className="text-secondary">{unit==='kg'?'Elige múltiplos de 0,25 kg.':'Este producto se vende por unidad.'}</small></div>
    <div className="detail-actions"><div><span className="text-secondary small">Total estimado</span><strong className="h4 d-block">{money(chosen*offerPrice(p))}</strong></div>
      <button disabled={stock<step} className="btn btn-success btn-lg" type="button" onClick={()=>add(p,chosen)}>Agregar al carrito</button></div>
    <p className="small text-secondary mt-3">Código: {p.codigo} · Los precios de la compra se verifican en el servidor.</p>
  </div></div></section>;
}
