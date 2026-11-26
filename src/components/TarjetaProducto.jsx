import React from 'react';
import { Link } from 'react-router-dom';
import Impuestos from './Impuestos';
import { useStore } from '../Tienda';
import { money, offerPrice, reserved, unitOf, quantityLabel, stepOf } from '../carrito';

export default function ProductCard({ product, onAdd }) {
  const store = useStore();
  const items = store?.items || [];
  const remaining = store?.disponible ? store.disponible(product.codigo) : Number(product.stock);
  const cartQty = reserved(items, product.codigo);
  const unit = unitOf(product);
  const discount = Number(product.descuento || 0);
  return <article className="card product-card h-100">
    <Link className="card-picture" to={'/productos/' + product.codigo}>
      <img loading="lazy" className="card-img-top" src={'/' + product.imagen} alt={product.nombre}/>
      {discount > 0 && <span className="sale-flag">-{discount}%</span>}
    </Link>
    <div className="card-body d-flex flex-column">
      <p className="eyebrow">{product.categoriaNombre}</p>
      <h3 className="h5"><Link className="product-title" to={'/productos/' + product.codigo}>{product.nombre}</Link></h3>
      <p className="small text-secondary flex-grow-1">{product.descripcion}</p>
      <div className="price-layout">
        <div><div className="price">{money(offerPrice(product))}<span className="price-unit">/{unit}</span></div>
          {discount > 0 && <small className="text-muted text-decoration-line-through">Antes {money(product.precio)}/{unit}</small>}</div>
        <button disabled={remaining < stepOf(product)} className="btn btn-success" type="button" onClick={() => onAdd(product,stepOf(product))}>
          {remaining < stepOf(product) ? 'Agotado' : 'Agregar'}
        </button>
      </div>
      <Impuestos total={offerPrice(product)} compacto unidad={unit}/>
      <p className="stock-note mb-0 mt-3" aria-live="polite">
        <strong>{quantityLabel(remaining,product)}</strong> disponibles
        {cartQty>0 && <span> · {quantityLabel(cartQty,product)} en carrito</span>}
      </p>
    </div>
  </article>;
}
