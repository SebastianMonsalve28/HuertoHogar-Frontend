import React from 'react';
import { Link, useParams } from 'react-router-dom';

export function About() {
  return <>
    <section className="about-hero"><div className="container"><div className="row align-items-center g-5">
      <div className="col-lg-6">
        <p className="eyebrow">NUESTRA HISTORIA</p>
        <h1>Una tienda que nace del gusto por lo fresco.</h1>
        <p className="lead">En Huerto Hogar queremos acercar frutas, verduras y productos naturales a las personas, con una experiencia simple y cercana.</p>
        <p>Nos inspira el esfuerzo de quienes trabajan la tierra y la idea de que una buena compra también empieza por saber qué llevamos a casa.</p>
        <Link className="btn btn-success mt-3" to="/productos">Explorar productos</Link>
      </div>
      <div className="col-lg-6"><div className="about-hero-media">
        <img src="/img/huerto.webp" alt="Canasta con verduras y frutas frescas"/>
        <span>Del campo a tu mesa.</span>
      </div></div>
    </div></div></section>

    <section className="container about-story-section"><div className="row align-items-center g-5">
      <div className="col-lg-5"><div className="about-story-photos">
        <img src="/img/manzanas.jpg" alt="Manzanas frescas"/>
        <img src="/img/espinacas.jpg" alt="Hojas de espinaca"/>
      </div></div>
      <div className="col-lg-7">
        <p className="eyebrow">LO QUE NOS MUEVE</p>
        <h2>Elegir bien también es elegir cuánto.</h2>
        <p className="lead">Creemos que una tienda debe mostrar sus productos con claridad y permitir que cada hogar compre a su propio ritmo.</p>
        <div className="about-list">
          <div><strong>Productos para la mesa diaria</strong><p>Frutas, verduras y alimentos naturales con información clara.</p></div>
          <div><strong>Cantidades a tu medida</strong><p>Compra por kilo o por unidad según el tipo de producto.</p></div>
          <div><strong>Precios sin sorpresas</strong><p>Revisa las ofertas, el ahorro y el total antes de confirmar.</p></div>
        </div>
      </div>
    </div></section>

    <section className="about-closing"><div className="container about-closing-inner">
      <div><p className="eyebrow">HUERTO HOGAR</p><h2>Una forma más sencilla de llevar frescura a tu hogar.</h2></div>
      <Link className="btn btn-success btn-lg" to="/productos">Ver nuestro catálogo</Link>
    </div></section>
  </>;
}

const posts = [
  {
    id: '1', categoria: 'ALIMENTACIÓN',
    titulo: 'Comer saludable es más fácil de lo que crees',
    intro: 'Ideas sencillas para sumar más variedad y frescura a tus comidas cotidianas.',
    foto: 'comersaludable.png',
    parrafos: [
      'Una alimentación variada no necesita cambios drásticos. Un buen comienzo puede ser agregar fruta al desayuno, probar una verdura distinta en el almuerzo o incorporar más colores en el plato.',
      'Elegir alimentos de temporada ayuda a organizar mejor las comidas. Antes de comprar, revisa lo que ya tienes en casa y piensa cuáles ingredientes usarás durante los próximos días.',
      'Comprar la cantidad adecuada también importa. Si necesitas solo medio kilo de una fruta o verdura, puedes planificar esa porción y evitar acumular alimentos que no alcanzarás a consumir.',
      'El objetivo no es buscar una mesa perfecta, sino construir hábitos prácticos que puedas mantener. Explora nuevas preparaciones, conserva los alimentos correctamente y disfruta de opciones variadas.'
    ],
    ideas: ['Prueba frutas y verduras de diferentes colores.', 'Planifica las porciones antes de comprar.', 'Prefiere cambios pequeños y sostenibles.']
  },
  {
    id: '2', categoria: 'VIDA LOCAL',
    titulo: 'Del huerto a tu mesa',
    intro: 'Una mirada al recorrido de los alimentos y al valor de escoger productos frescos.',
    foto: 'huerto.webp',
    parrafos: [
      'Detrás de cada fruta y verdura hay tiempo, cuidado y trabajo. Desde el cultivo y la cosecha hasta la selección de los productos, cada etapa influye en lo que llega a nuestra cocina.',
      'Conocer los alimentos que consumimos nos ayuda a tomar mejores decisiones. Observar su aspecto, revisar sus características y comparar las opciones disponibles es parte de una compra informada.',
      'Las frutas y verduras de temporada ofrecen oportunidades para variar las comidas. Comprar por kilo permite elegir la cantidad que necesita tu hogar y organizar mejor el consumo.',
      'Huerto Hogar se inspira en ese recorrido para ofrecer un catálogo claro y una compra sencilla. Nuestro propósito es acercar los productos del campo a la mesa, con información visible sobre precios, cantidades y ofertas.'
    ],
    ideas: ['Conoce la procedencia de lo que compras.', 'Revisa la temporada y la frescura.', 'Elige cantidades que realmente usarás.']
  }
];

export function Blog() {
  const { id } = useParams();
  const post = posts.find(p => p.id === id);
  if (id && !post) return <section className="container section"><h1>Artículo no encontrado</h1><Link to="/blog">Volver al blog</Link></section>;

  if (post) {
    const related = posts.find(p => p.id !== post.id);
    return <article className="article-page">
      <div className="container article-hero">
        <Link className="back-link" to="/blog">← Volver a historias y consejos</Link>
        <div className="row align-items-center g-5">
          <div className="col-lg-5"><p className="eyebrow">{post.categoria} · HUERTO HOGAR</p><h1>{post.titulo}</h1><p className="lead">{post.intro}</p></div>
          <div className="col-lg-7"><img className="article-featured-image" src={'/img/' + post.foto} alt={post.titulo}/></div>
        </div>
      </div>
      <div className="container article-content-grid">
        <div className="article-body">{post.parrafos.map((text, i) => <p key={i}>{text}</p>)}
          <div className="article-endnote"><span aria-hidden="true"></span><p>En Huerto Hogar encuentras frutas, verduras y productos naturales para elegir a tu medida.</p></div>
        </div>
        <aside className="article-aside"><p className="eyebrow">PARA RECORDAR</p><h2 className="h4">Pequeñas ideas</h2><ul>{post.ideas.map(item => <li key={item}>{item}</li>)}</ul><Link to="/productos" className="btn btn-success w-100">Explorar productos</Link></aside>
      </div>
      <div className="container related-post"><p className="eyebrow">SIGUE EXPLORANDO</p><h2>También te puede interesar</h2><Link to={'/blog/' + related.id} className="related-post-link"><img src={'/img/' + related.foto} alt=""/><span><small>{related.categoria}</small><strong>{related.titulo}</strong><span>Leer artículo →</span></span></Link></div>
    </article>;
  }

  return <section className="container section blog-index">
    <div className="section-heading"><div><p className="eyebrow">IDEAS PARA EL DÍA A DÍA</p><h1>Historias del huerto</h1><p className="lead text-secondary">Consejos, productos frescos y una forma más cercana de llevarlos a tu mesa.</p></div></div>
    <div className="blog-grid">{posts.map(p => <article className="blog-story" key={p.id}>
      <Link to={'/blog/' + p.id} className="blog-story-image"><img src={'/img/' + p.foto} alt={p.titulo}/></Link>
      <div className="blog-story-content"><p className="eyebrow">{p.categoria} · {p.lectura}</p><h2><Link to={'/blog/' + p.id}>{p.titulo}</Link></h2><p>{p.intro}</p><Link className="blog-read-more" to={'/blog/' + p.id}>Descubrir la historia →</Link></div>
    </article>)}</div>
  </section>;
}

export function NotFound() { return <section className="container section"><h1>Página no encontrada</h1><p>La sección que buscas no existe.</p><Link to="/">Volver al inicio</Link></section>; }
