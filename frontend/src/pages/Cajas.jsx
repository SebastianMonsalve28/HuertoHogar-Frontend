
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../Tienda';
import { apiPublica } from '../api';
import { money, quantityLabel } from '../carrito';
import { cajaValida, totalCaja } from '../cajas';

const pasos = [
  '0', '0.25', '0.5', '0.75', '1',
  '1.25', '1.5', '2', '2.5', '3'
];

const id = () =>
  `caja-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const imagenesCajas = {
  CHICA: '/img/caja_chica.png',
  MEDIANA: '/img/caja_mediana.png',
  GRANDE: '/img/caja_grande.png',
  FRUTAS: '/img/caja_frutas.png',
  VERDURAS: '/img/caja_verduras.png'
};

function imagenDeCaja(oferta) {
  const codigo = String(oferta.id || '').toUpperCase();

  return (
    imagenesCajas[codigo] ||
    '/' + String(oferta.imagen || '').replace(/^\/+/, '')
  );
}

export default function Cajas() {
  const {
    products,
    productsLoading,
    items,
    cajas,
    addCaja,
    disponible
  } = useStore();

  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [seleccion, setSeleccion] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    apiPublica('/cajas')
      .then((data) => {
        if (active) {
          setOfertas(Array.isArray(data) ? data : []);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (active) {
          setCargando(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const aGranel = useMemo(
    () => products.filter((p) => p.unidadVenta === 'kg'),
    [products]
  );

  const lineas = Object.entries(seleccion)
    .filter(([, cantidad]) => Number(cantidad) > 0)
    .map(([codigo, cantidad]) => ({
      codigo,
      cantidad: Number(cantidad)
    }));

  const peso = lineas.reduce(
    (total, linea) => total + linea.cantidad,
    0
  );

  const cajaPersonalizada = {
    id: id(),
    tipo: 'personalizada',
    nombre: 'Caja a tu gusto',
    productos: lineas
  };

  const total = totalCaja(cajaPersonalizada, products);

  const personalValida =
    lineas.length >= 2 &&
    lineas.length <= 6 &&
    peso >= 1 &&
    peso <= 12 &&
    cajaValida(cajaPersonalizada, products, items, cajas);

  function agregar(caja) {
    setError('');
    setAviso('');

    try {
      addCaja(caja);
      setAviso(`¡${caja.nombre} se agregó al carrito!`);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }

  function agregarPreparada(oferta) {
    agregar({
      id: id(),
      tipo: 'preparada',
      presetId: oferta.id,
      nombre: oferta.nombre,
      productos: oferta.productos
    });
  }

  function elegir(codigo, nueva) {
    setError('');
    setAviso('');

    setSeleccion((prev) => ({
      ...prev,
      [codigo]: Number(nueva)
    }));
  }

  return (
    <>
      <section className="page-intro">
        <div className="container">
          <p className="eyebrow">COMPRAS A TU MEDIDA</p>

          <h1>Una caja llena de frescura</h1>

          <p>
            Elige una de nuestras selecciones o arma tu caja
            con tus frutas y verduras favoritas. Sin suscripciones
            ni cargos automáticos: cada pedido se confirma
            por separado.
          </p>
        </div>
      </section>

      <section
        className="container section section-compact"
        id="preparadas"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">LISTAS PARA TU MESA</p>
            <h2>Cajas preparadas</h2>
          </div>

          <p className="text-secondary">
            Precios calculados con los productos
            y descuentos vigentes
          </p>
        </div>

        {cargando && (
          <p role="status">Cargando cajas...</p>
        )}

        <div className="box-catalog">
          {ofertas.map((oferta, index) => (
            <article
              className="box-product"
              key={oferta.id}
            >
              <div className="box-product-image">
                <img
                  src={imagenDeCaja(oferta)}
                  alt={`Productos de ${oferta.nombre}`}
                  loading="lazy"
                />

                {index === 1 && (
                  <span className="popular-tag">
                    La más elegida
                  </span>
                )}
              </div>

              <div className="box-product-content">
                <h3>{oferta.nombre}</h3>

                <p>{oferta.descripcion}</p>

                <p className="box-product-facts">
                  Para {oferta.personas} personas ·{' '}
                  {oferta.kilos} kg
                </p>

                <details>
                  <summary>¿Qué incluye?</summary>

                  <ul>
                    {oferta.productos.map((item) => {
                      const producto = products.find(
                        (p) => p.codigo === item.codigo
                      );

                      return (
                        <li key={item.codigo}>
                          {producto?.nombre || item.codigo}
                          {' — '}
                          {quantityLabel(
                            item.cantidad,
                            producto || { unidadVenta: 'kg' }
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </details>

                <div className="box-product-bottom">
                  <strong>
                    {oferta.disponible
                      ? money(oferta.precio)
                      : 'No disponible'}
                  </strong>

                  <button
                    className="btn btn-success"
                    disabled={
                      !oferta.disponible || productsLoading
                    }
                    onClick={() => agregarPreparada(oferta)}
                  >
                    {oferta.disponible
                      ? 'Agregar caja'
                      : 'Sin stock'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="custom-box-zone"
        id="personalizada"
      >
        <div className="container section section-compact">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                TU COMBINACIÓN IDEAL
              </p>

              <h2>Arma tu propia caja</h2>

              <p>
                Elige al menos 2 productos y entre
                1 y 12 kg en total. Puedes seleccionar
                cantidades en pasos de 250 g.
              </p>
            </div>
          </div>

          <div className="custom-box-layout">
            <div className="custom-box-grid">
              {aGranel.map((p) => (
                <article
                  className="custom-box-item"
                  key={p.codigo}
                >
                  <img
                    src={
                      '/' + p.imagen.replace(/^\/+/, '')
                    }
                    alt={p.nombre}
                    loading="lazy"
                  />

                  <div>
                    <h3>{p.nombre}</h3>

                    <p>
                      {money(p.precio)} / kg{' '}

                      {p.descuento > 0 && (
                        <span className="offer-chip">
                          −{p.descuento}%
                        </span>
                      )}
                    </p>

                    <p className="text-secondary small">
                      Disponible:{' '}
                      {quantityLabel(
                        disponible(p.codigo),
                        p
                      )}
                    </p>
                  </div>

                  <label htmlFor={'caja-' + p.codigo}>
                    Kilos
                  </label>

                  <select
                    className="form-select"
                    id={'caja-' + p.codigo}
                    value={seleccion[p.codigo] ?? 0}
                    onChange={(e) =>
                      elegir(p.codigo, e.target.value)
                    }
                  >
                    {pasos
                      .filter(
                        (v) =>
                          Number(v) <= disponible(p.codigo)
                      )
                      .map((cantidad) => (
                        <option
                          key={cantidad}
                          value={cantidad}
                        >
                          {Number(cantidad).toLocaleString(
                            'es-CL'
                          )} kg
                        </option>
                      ))}
                  </select>
                </article>
              ))}
            </div>

            <aside className="custom-box-summary">
              <p className="eyebrow">
                TU CAJA PERSONALIZADA
              </p>

              <h3>Resumen</h3>

              <img
                src="/img/caja_grande.png"
                alt="Caja personalizada de frutas y verduras"
                loading="lazy"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '190px',
                  objectFit: 'cover',
                  borderRadius: '14px',
                  marginBottom: '22px'
                }}
              />

              {lineas.length ? (
                lineas.map((linea) => {
                  const producto = products.find(
                    (p) => p.codigo === linea.codigo
                  );

                  return (
                    <p
                      className="summary-row"
                      key={linea.codigo}
                    >
                      <span>
                        {producto?.nombre} ·{' '}
                        {quantityLabel(
                          linea.cantidad,
                          producto
                        )}
                      </span>
                    </p>
                  );
                })
              ) : (
                <p className="text-secondary">
                  Selecciona tus primeros productos.
                </p>
              )}

              <hr />

              <p className="summary-row">
                <span>Peso total</span>

                <strong>
                  {peso.toLocaleString('es-CL')} kg
                </strong>
              </p>

              <p className="summary-row">
                <span>Productos distintos</span>

                <strong>{lineas.length}</strong>
              </p>

              <p className="summary-row summary-total">
                <span>Precio estimado</span>

                <strong>{money(total)}</strong>
              </p>

              <p className="small text-secondary">
                El servidor comprueba nuevamente stock
                y precios antes de registrar el pedido.
              </p>

              <button
                className="btn btn-success w-100"
                disabled={!personalValida}
                onClick={() => {
                  if (agregar(cajaPersonalizada)) {
                    setSeleccion({});
                  }
                }}
              >
                Agregar mi caja
              </button>

              {!personalValida && (
                <p className="small mt-2">
                  Necesitas 2 productos, entre 1 y 12 kg,
                  y stock suficiente.
                </p>
              )}
            </aside>
          </div>

          {error && (
            <p
              role="alert"
              className="alert alert-danger mt-3"
            >
              {error}
            </p>
          )}

          {aviso && (
            <div
              role="status"
              className="alert alert-success mt-3"
            >
              {aviso}{' '}

              <button
                className="btn btn-link"
                onClick={() => navigate('/carrito')}
              >
                Ver mi carrito
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="container section section-compact">
        <div className="section-heading">
          <div>
            <h2>¿Cómo funciona?</h2>

            <p>
              Una forma fácil de preparar tu próxima compra.
            </p>
          </div>
        </div>

        <div className="steps-grid steps-illustrated">
          {[
            [
              '01',
              '/img/paso-1.webp',
              'Elige tu caja',
              'Selecciona una caja lista o crea tu combinación.'
            ],
            [
              '02',
              '/img/paso-2.webp',
              'Ajusta cantidades',
              'Elige kilos y variedad para tu próxima compra.'
            ],
            [
              '03',
              '/img/paso-3.webp',
              'Confirma los detalles',
              'Revisa el total, el ahorro y la dirección.'
            ],
            [
              '04',
              '/img/paso-4.webp',
              'Consulta tu pedido',
              'Tu selección queda guardada en tu cuenta.'
            ]
          ].map(([numero, imagen, titulo, descripcion]) => (
            <article
              className="step-card step-illustrated"
              key={numero}
            >
              <div className="step-picture">
                <img
                  src={imagen}
                  alt=""
                  loading="lazy"
                />

                <span className="step-number">
                  {numero}
                </span>
              </div>

              <div className="step-copy">
                <h3>{titulo}</h3>
                <p>{descripcion}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="small text-secondary mt-3">
          Proyecto académico: no se procesan pagos
          ni despachos reales.
        </p>
      </section>
    </>
  );
}
