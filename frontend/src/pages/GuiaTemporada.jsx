import React, {useState} from 'react';
import {Link} from 'react-router-dom';
const temporadas = [
 {nombre:'Primavera',imagen:'/img/temporada-primavera.webp',meses:'Septiembre a noviembre',productos:['Frutillas','Espárragos','Alcachofas','Arvejas','Lechugas','Rábanos'],texto:'Tiempo de hojas tiernas, hortalizas frescas y primeras frutas.'},
 {nombre:'Verano',imagen:'/img/temporada-verano.webp',meses:'Diciembre a febrero',productos:['Tomates','Duraznos','Melones','Sandías','Ciruelas','Pimientos'],texto:'Frutas jugosas y hortalizas de colores intensos para aprovechar.'},
 {nombre:'Otoño',imagen:'/img/temporada-otono.webp',meses:'Marzo a mayo',productos:['Manzanas','Peras','Uvas','Zapallos','Zanahorias','Brócoli'],texto:'La cosecha de manzanas, peras y productos para cocinar en casa.'},
 {nombre:'Invierno',imagen:'/img/temporada-invierno.webp',meses:'Junio a agosto',productos:['Naranjas','Mandarinas','Kiwi','Espinacas','Acelgas','Repollo'],texto:'Cítricos y hojas verdes para los días más fríos.'}
];
const consejos = [
 {imagen:'/img/espinacas.webp',titulo:'Hojas verdes',detalle:'Guarda espinacas y acelgas secas, en un recipiente ventilado en el refrigerador. Lava justo antes de consumir.'},
 {imagen:'/img/zanahorias.webp',titulo:'Verduras de raíz',detalle:'Mantén las zanahorias limpias de hojas, en el cajón de verduras del refrigerador para conservar su textura.'},
 {imagen:'/img/manzanas.webp',titulo:'Manzanas y peras',detalle:'Refrigera para prolongar su frescura y sepáralas de frutas muy maduras cuando sea posible.'},
 {imagen:'/img/naranjas.webp',titulo:'Cítricos',detalle:'Consérvalos en un lugar fresco y ventilado; si hace mucho calor, el refrigerador ayuda a que duren más.'},
 {imagen:'/img/platanos.webp',titulo:'Plátanos',detalle:'Déjalos a temperatura ambiente mientras maduran. No refrigeres los plátanos verdes.'},
 {imagen:'/img/miel.webp',titulo:'Miel',detalle:'Mantén el envase bien cerrado, en un lugar seco y protegido del sol. No necesita refrigeración.'},
];
export default function GuiaTemporada(){
 const [seleccion,setSeleccion]=useState('Todas');
 const visibles=seleccion==='Todas'?temporadas:temporadas.filter(t=>t.nombre===seleccion);
 return <>
 <section className="page-intro"><div className="container"><p className="eyebrow">APRENDE CON EL HUERTO</p><h1>Guía de temporada y frescura</h1><p>Ideas para elegir, conservar y aprovechar mejor las frutas y verduras a lo largo del año en Chile.</p></div></section>
 <section className="container section section-compact"><div className="section-heading"><div><p className="eyebrow">EL AÑO EN NUESTRA MESA</p><h2>Productos según la estación</h2></div><div className="season-buttons" role="group" aria-label="Filtrar estaciones">{['Todas',...temporadas.map(t=>t.nombre)].map(t=><button key={t} className={'btn btn-sm '+(seleccion===t?'btn-success':'btn-outline-success')} onClick={()=>setSeleccion(t)} aria-pressed={seleccion===t}>{t}</button>)}</div></div>
 <div className="seasons-grid">{visibles.map(t=><article className="season-card" key={t.nombre}><img loading="lazy" className="season-photo" src={t.imagen} alt={`Productos representativos del ${t.nombre.toLowerCase()}`}/><p className="eyebrow">{t.meses}</p><h3>{t.nombre}</h3><p>{t.texto}</p><div className="season-tags">{t.productos.map(p=><span key={p}>{p}</span>)}</div></article>)}</div>
 <p className="small text-secondary mt-4">Calendario orientativo: las cosechas varían según la región, el clima y la disponibilidad del productor. No todos estos productos están actualmente a la venta.</p></section>
 <section className="guide-tips-zone"><div className="container section section-compact"><p className="eyebrow">EVITA EL DESPERDICIO</p><h2>Consejos para conservar productos frescos</h2><p className="text-secondary mb-4">Pequeños hábitos pueden ayudar a cuidar tu compra.</p><div className="tips-grid">{consejos.map(c=><article className="tip-card" key={c.titulo}><img loading="lazy" className="tip-photo" src={c.imagen} alt=""/><div><h3>{c.titulo}</h3><p>{c.detalle}</p></div></article>)}</div>
 <div className="guide-cta"><div><h3>Llévate lo mejor de cada estación</h3><p>Elige productos individuales o prepara una caja a tu medida.</p></div><Link className="btn btn-success" to="/cajas">Explorar cajas</Link></div></div></section>
 </>;
}
