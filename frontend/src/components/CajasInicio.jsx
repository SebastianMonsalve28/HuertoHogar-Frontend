
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiPublica } from '../api';
import { money } from '../carrito';

const imagenesCajas = {
  CHICA: '/img/caja_chica.png',
  MEDIANA: '/img/caja_mediana.png',
  GRANDE: '/img/caja_grande.png',
  FRUTAS: '/img/caja_frutas.png',
  VERDURAS: '/img/caja_verduras.png'
};

export default function CajasInicio() {
  const [ofertas, setOfertas] = useState([]);

  useEffect(() => {
    let active = true;

    apiPublica('/cajas')
      .then((data) => {
        if (active) {
          setOfertas(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="boxes-home section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              TU HUERTO EN UNA CAJA
            </p>

            <h2>Una caja para cada hogar</h2>

            <p>
              Selecciona una lista para llevar o prepara
              una con tus frutas y verduras preferidas.
            </p>
          </div>

          <Link
            to="/cajas"
            className="btn btn-success"
          >
            Armar mi caja
          </Link>
        </div>

        <div className="box-preview-grid">
          {ofertas.slice(0, 4).map((caja) => (
            <article
              className="box-preview"
              key={caja.id}
            >
              <img
                src={
                  imagenesCajas[
                    String(caja.id).toUpperCase()
                  ] ||
                  '/' + String(caja.imagen || '').replace(/^\/+/, '')
                }
                alt={`Productos de ${caja.nombre}`}
                loading="lazy"
              />

              <div className="box-preview-copy">
                <h3>{caja.nombre}</h3>

                <p>{caja.descripcion}</p>

                <p className="text-secondary small">
                  {caja.kilos} kg · Para{' '}
                  {caja.personas} personas
                </p>

                <div className="box-preview-bottom">
                  <strong>
                    {caja.disponible
                      ? money(caja.precio)
                      : 'Sin stock'}
                  </strong>

                  <Link
                    to="/cajas"
                    className="btn btn-outline-success btn-sm"
                  >
                    Elegir caja
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!ofertas.length && (
          <div className="box-preview-callout">
             <strong>Arma tu caja a medida</strong>

            <p>
              Elige productos entre 0,25 kg y 12 kg,
              con descuentos visibles y stock actualizado.
            </p>

            <Link to="/cajas">
              Explorar opciones
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
