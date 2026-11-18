import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/TarjetaProducto';
import { useStore } from '../Tienda';
import CajasInicio from '../components/CajasInicio';
import {ResenasDestacadas} from './Valoraciones';

export default function Home() {
  const { products, add } = useStore();
  const offers = products.filter(p => Number(p.descuento) > 0).slice(0, 3);
  return <>
    <section className="hero">
      <div className="container"><div className="row align-items-center g-5">
        <div className="col-lg-6">
          <p className="eyebrow">ALIMENTOS FRESCOS · DEL CAMPO A TU MESA</p>
          <h1>Lo mejor del campo,<br/><em>en tu hogar.</em></h1>
          <p className="lead my-4">Compra frutas y verduras por kilo, elige solo lo que necesitas y descubre productos naturales en Huerto Hogar.</p>
          <div className="d-flex flex-wrap gap-3">
            <Link className="btn btn-success btn-lg" to="/productos">Explorar productos</Link>
            <Link className="btn btn-outline-success btn-lg" to="/ofertas">Descubrir ofertas</Link>
          </div>
          <p className="hero-note">Precios transparentes · Compra a tu medida · Productos frescos</p>
        </div>
        <div className="col-lg-6"><div className="hero-photo">
          <img className="hero-image" src="/img/huerto.webp" alt="Frutas y verduras variadas del huerto"/>
          <div className="hero-photo-label">Frescura que se nota <strong>Huerto Hogar</strong></div>
        </div></div>
      </div></div>
    </section>

    <section className="container section section-compact">
      <div className="section-heading"><div><p className="eyebrow">PARA CADA MESA</p><h2>Encuentra lo que buscas</h2></div><Link to="/productos">Ver catálogo completo →</Link></div>
      <div className="category-grid">
        <Link to="/productos?categoria=frutas" className="category-tile"><img src="/img/manzanas.jpg" alt="Manzanas frescas"/><span><strong>Frutas</strong><small>Compra por kilo</small></span></Link>
        <Link to="/productos?categoria=verduras" className="category-tile"><img src="/img/zanahorias.jpg" alt="Zanahorias frescas"/><span><strong>Verduras</strong><small>Elige la cantidad</small></span></Link>
        <Link to="/productos?categoria=organicos" className="category-tile"><img src="/img/miel.jpg" alt="Miel y productos naturales"/><span><strong>Orgánicos</strong><small>Productos seleccionados</small></span></Link>
      </div>
    </section>

    <section className="container section section-compact">
      <div className="section-heading"><div><p className="eyebrow">FAVORITOS DEL HUERTO</p><h2>Para disfrutar esta semana</h2></div><Link to="/productos">Ver todos los productos →</Link></div>
      <div className="row g-4">{products.slice(0, 3).map(p => <div key={p.codigo} className="col-sm-6 col-lg-4"><ProductCard product={p} onAdd={add}/></div>)}</div>
    </section>

    {offers.length > 0 && <section className="offers-band"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">OPORTUNIDADES PARA APROVECHAR</p><h2>Ofertas de temporada</h2></div><Link className="btn btn-outline-success" to="/ofertas">Todas las ofertas</Link></div>
      <div className="row g-4">{offers.map(p => <div key={p.codigo} className="col-sm-6 col-lg-4"><ProductCard product={p} onAdd={add}/></div>)}</div>
    </div></section>}

    <CajasInicio />

    <section className="container section section-compact">
      <div className="section-heading"><div><p className="eyebrow">ASÍ DE SIMPLE</p><h2>¿Cómo funciona Huerto Hogar?</h2>
      <p>Elige tus productos, revisa el total y confirma una compra de demostración.</p></div><Link to="/cajas" className="btn btn-outline-success">Conocer nuestras cajas</Link></div>
      <div className="steps-grid">{[
       ['01','🧺','Elige tu caja','Toma una caja preparada o crea tu selección personal.'],
       ['02','🥕','Personaliza kilos','Combina frutas y verduras con cantidades de 250 g.'],
       ['03','📋','Confirma tu pedido','Revisa descuentos, disponibilidad y modalidad de entrega.'],
       ['04','🌿','Revisa tu compra','Tu pedido queda registrado para consultarlo desde tu cuenta.']
      ].map(([n,emoji,title,desc])=><div className="step-card" key={n}><span className="step-number">{n}</span><span className="step-emoji" aria-hidden="true">{emoji}</span><h3>{title}</h3><p>{desc}</p></div>)}</div>
      <p className="small text-secondary mt-3">No se realizan despachos ni cobros reales. No existen suscripciones automáticas.</p>
    </section>

    <section className="season-home"><div className="container season-home-grid">
      <div><p className="eyebrow">APROVECHA CADA ESTACIÓN</p><h2>¿Qué está de temporada?</h2>
       <p>Descubre productos característicos de primavera, verano, otoño e invierno en Chile, además de consejos para conservar mejor tu compra.</p>
       <Link className="btn btn-success" to="/guia-temporada">Ver guía de temporada</Link></div>
      <div className="season-home-photos"><img src="/img/manzanas.jpg" alt="Manzanas frescas"/><img src="/img/zanahorias.jpg" alt="Zanahorias frescas"/></div>
    </div></section>

    <ResenasDestacadas compacto />

    <section className="story-strip"><div className="container"><div className="row align-items-center g-5">
      <div className="col-lg-5"><p className="eyebrow">CONOCE HUERTO HOGAR</p><h2>Cerca del origen.<br/>Cerca de ti.</h2><p className="lead">Una tienda inspirada en la frescura de nuestros campos y en una forma de comprar fácil y cercana.</p><Link className="btn btn-outline-success" to="/nosotros">Conoce nuestra historia</Link></div>
      <div className="col-lg-7"><video className="story-video" controls preload="metadata" poster="/img/huerto.webp"><source src="/video/video.mp4" type="video/mp4"/>Tu navegador no permite reproducir video.</video><p className="video-caption">Un vistazo al campo y a los productos que inspiran nuestra tienda.</p></div>
    </div></div></section>
  </>;
}
