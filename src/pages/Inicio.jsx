
import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/TarjetaProducto';
import { useStore } from '../Tienda';
import CajasInicio from '../components/CajasInicio';
import { ResenasDestacadas } from './Valoraciones';

const pasos = [
  {
    numero: '1',
    titulo: 'Explora nuestros productos',
    descripcion:
      'Descubre frutas, verduras y productos naturales. Encuentra todo lo que necesitas para tu hogar.',
    imagen: '/img/paso_1.png',
    alt: 'Selección de productos frescos',
  },
  {
    numero: '2',
    titulo: 'Compra a tu medida',
    descripcion:
      'Elige productos por kilo o por unidad, selecciona una caja preparada o crea tu propia combinación.',
    imagen: '/img/paso_2.png',
    alt: 'Caja de frutas y verduras frescas',
  },
  {
    numero: '3',
    titulo: 'Descubre nuestras ofertas',
    descripcion:
      'Aprovecha los descuentos, compara precios y revisa la disponibilidad antes de agregar al carrito.',
    imagen: '/img/paso_3.png',
    alt: 'Productos frescos para comprar',
  },
  {
    numero: '4',
    titulo: 'Confirma y comparte',
    descripcion:
      'Revisa tu carrito, confirma tu pedido y comparte tu experiencia mediante opiniones y valoraciones.',
    imagen: '/img/paso_4.png',
    alt: 'Compra de productos naturales',
  },
];

export default function Home() {
  const { products, add } = useStore();

  const offers = products
    .filter((p) => Number(p.descuento) > 0)
    .slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <p className="eyebrow">
                ALIMENTOS FRESCOS · DEL CAMPO A TU MESA
              </p>

              <h1>
                Lo mejor del campo,
                <br />
                <em>en tu hogar.</em>
              </h1>

              <p className="lead my-4">
                Compra frutas y verduras por kilo, elige solo
                lo que necesitas y descubre productos
                naturales en Huerto Hogar.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link
                  className="btn btn-success btn-lg"
                  to="/productos"
                >
                  Explorar productos
                </Link>

                <Link
                  className="btn btn-outline-success btn-lg"
                  to="/ofertas"
                >
                  Descubrir ofertas
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-photo">
                <img
                  className="hero-image"
                  src="/img/portada-huerto.png"
                  alt="Frutas y verduras frescas de Huerto Hogar"
                />

                <div className="hero-photo-label">
                  Frescura que se nota
                  <strong>Huerto Hogar</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container section section-compact">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PARA CADA MESA</p>
            <h2>Encuentra lo que buscas</h2>
          </div>

          <Link to="/productos">
            Ver catálogo completo →
          </Link>
        </div>

        <div className="category-grid">
          <Link
            to="/productos?categoria=frutas"
            className="category-tile"
          >
            <img
              src="/img/manzanas.webp"
              alt="Manzanas frescas"
            />

            <span>
              <strong>Frutas</strong>
              <small>Compra por kilo</small>
            </span>
          </Link>

          <Link
            to="/productos?categoria=verduras"
            className="category-tile"
          >
            <img
              src="/img/zanahorias.webp"
              alt="Zanahorias frescas"
            />

            <span>
              <strong>Verduras</strong>
              <small>Elige la cantidad</small>
            </span>
          </Link>

          <Link
            to="/productos?categoria=organicos"
            className="category-tile"
          >
            <img
              src="/img/miel.webp"
              alt="Miel y productos naturales"
            />

            <span>
              <strong>Orgánicos</strong>
              <small>Productos seleccionados</small>
            </span>
          </Link>
        </div>
      </section>

      <section className="container section section-compact">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FAVORITOS DEL HUERTO</p>
            <h2>Para disfrutar esta semana</h2>
          </div>

          <Link to="/productos">
            Ver todos los productos →
          </Link>
        </div>

        <div className="row g-4">
          {products.slice(0, 3).map((p) => (
            <div
              key={p.codigo}
              className="col-sm-6 col-lg-4"
            >
              <ProductCard
                product={p}
                onAdd={add}
              />
            </div>
          ))}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="offers-band">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  OPORTUNIDADES PARA APROVECHAR
                </p>
                <h2>Ofertas de temporada</h2>
              </div>

              <Link
                className="btn btn-outline-success"
                to="/ofertas"
              >
                Todas las ofertas
              </Link>
            </div>

            <div className="row g-4">
              {offers.map((p) => (
                <div
                  key={p.codigo}
                  className="col-sm-6 col-lg-4"
                >
                  <ProductCard
                    product={p}
                    onAdd={add}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CajasInicio />

      <section className="hh-como-funciona">
        <div className="container py-lg-4">
          <div className="text-center mb-5">
            <p className="eyebrow">
              FRESCO · LOCAL · NATURAL
            </p>

            <h2
              className="mb-3"
              style={{
                color: '#193e2e',
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(30px, 4vw, 44px)',
              }}
            >
              ¿Cómo funciona Huerto Hogar?
            </h2>

            <p
              className="mx-auto"
              style={{
                maxWidth: '650px',
                color: '#65726a',
                fontSize: '16px',
                lineHeight: '1.8',
              }}
            >
              Comprar productos frescos nunca fue tan sencillo.
              Conoce todas las opciones que tenemos para ti
              y disfruta una experiencia de compra fácil,
              práctica y natural.
            </p>
          </div>

          <div className="row g-4">
            {pasos.map((paso) => (
              <div
                className="col-12 col-md-6 col-xl-3"
                key={paso.numero}
              >
                <article
                  className="card border-0 shadow-sm h-100 overflow-hidden"
                  style={{
                    borderRadius: '20px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div
                    className="position-relative"
                    style={{ height: '200px' }}
                  >
                    <img
                      src={paso.imagen}
                      alt={paso.alt}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />

                    <span
                      className="position-absolute d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        top: '15px',
                        left: '15px',
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        color: '#205e43',
                        boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                      }}
                    >
                      {paso.numero}
                    </span>
                  </div>

                  <div className="card-body p-4">
                    <h3
                      className="fw-bold mb-3"
                      style={{
                        fontSize: '20px',
                        lineHeight: '1.4',
                        color: '#193e2e',
                      }}
                    >
                      {paso.titulo}
                    </h3>

                    <p
                      className="mb-0"
                      style={{
                        fontSize: '14px',
                        lineHeight: '1.8',
                        color: '#65726a',
                      }}
                    >
                      {paso.descripcion}
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-center flex-wrap gap-3 mt-5">
            <Link
              to="/productos"
              className="btn btn-success btn-lg"
            >
              Explorar productos
            </Link>

            <Link
              to="/cajas"
              className="btn btn-outline-success btn-lg"
            >
              Conocer nuestras cajas
            </Link>
          </div>

          <p className="small text-secondary text-center mt-4 mb-0">
            Proyecto académico de demostración.
            No se realizan cobros ni despachos reales.
          </p>
        </div>
      </section>

      <section className="season-home">
        <div className="container season-home-grid">
          <div>
            <p className="eyebrow">
              APROVECHA CADA ESTACIÓN
            </p>

            <h2>¿Qué está de temporada?</h2>

            <p>
              Descubre productos característicos de
              primavera, verano, otoño e invierno en Chile,
              además de consejos para conservar mejor
              tu compra.
            </p>

            <Link
              className="btn btn-success"
              to="/guia-temporada"
            >
              Ver guía de temporada
            </Link>
          </div>

          <div className="season-home-photos">
            <img
              src="/img/sol.png"
              alt="sol"
              loading="lazy"
            />

            <img
              src="/img/invierno.png"
              alt="invierno"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <ResenasDestacadas compacto />

      <section className="story-strip">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <p className="eyebrow">
                CONOCE HUERTO HOGAR
              </p>

              <h2>
                Cerca del origen.
                <br />
                Cerca de ti.
              </h2>

              <p className="lead">
                Una tienda inspirada en la frescura de nuestros
                campos y en una forma de comprar fácil y cercana.
              </p>

              <Link
                className="btn btn-outline-success"
                to="/nosotros"
              >
                Conoce nuestra historia
              </Link>
            </div>

            <div className="col-lg-7">
              <video
                className="story-video"
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/img/huerto.webp"
              >
                <source
                  src="/video/video.mp4"
                  type="video/mp4"
                />
                Tu navegador no permite reproducir video.
              </video>

              <p className="video-caption">
                Un vistazo al campo y a los productos que
                inspiran nuestra tienda.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
