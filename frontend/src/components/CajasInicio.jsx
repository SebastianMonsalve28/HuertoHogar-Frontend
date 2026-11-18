import React, {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {apiPublica} from '../api';
import {money} from '../carrito';

export default function CajasInicio(){
 const [ofertas,setOfertas]=useState([]);
 useEffect(()=>{let active=true;apiPublica('/cajas').then(data=>{if(active)setOfertas(data);}).catch(()=>{});return()=>{active=false;};},[]);
 return <section className="boxes-home section"><div className="container">
   <div className="section-heading"><div><p className="eyebrow">TU HUERTO EN UNA CAJA</p><h2>Una caja para cada hogar</h2>
   <p>Selecciona una lista para llevar o prepara una con tus frutas y verduras preferidas.</p></div><Link to="/cajas" className="btn btn-success">Armar mi caja</Link></div>
   <div className="box-preview-grid">{ofertas.slice(0,4).map(c=><article className="box-preview" key={c.id}>
    <img src={'/'+c.imagen.replace(/^\//,'')} alt={'Productos de '+c.nombre}/>
    <div className="box-preview-copy"><h3>{c.nombre}</h3><p>{c.descripcion}</p><p className="text-secondary small">{c.kilos} kg · Para {c.personas} personas</p>
     <div className="box-preview-bottom"><strong>{c.disponible?money(c.precio):'Sin stock'}</strong><Link to="/cajas" className="btn btn-outline-success btn-sm">Elegir caja</Link></div></div>
   </article>)}</div>
   {!ofertas.length&&<div className="box-preview-callout">🧺 <strong>Arma tu caja a medida</strong><p>Elige productos entre 0,25 kg y 12 kg, con descuentos visibles y stock actualizado.</p><Link to="/cajas">Explorar opciones</Link></div>}
 </div></section>;
}
