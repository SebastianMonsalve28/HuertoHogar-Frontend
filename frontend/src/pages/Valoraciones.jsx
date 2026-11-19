
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiPublica } from '../api';
import { useStore } from '../Tienda';

const etiquetas = [
  ['experiencia', 'Experiencia de compra'],
  ['calidad', 'Calidad de productos'],
  ['variedad', 'Variedad de productos']
];

const prom = (n) =>
  Number(n || 0).toFixed(1).replace('.', ',');

function Estrellas({ valor, onChange, nombre }) {
  return (
    <div
      className="rating-stars"
      role="group"
      aria-label={nombre}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          className={
            'rating-star ' + (n <= valor ? 'active' : '')
          }
          aria-label={`${nombre}: ${n} ${
            n === 1 ? 'estrella' : 'estrellas'
          }`}
          aria-pressed={valor === n}
          onClick={() => onChange(n)}
        >
          {n <= valor ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

export function ResenasDestacadas({ compacto = false }) {
  const [resenas, setResenas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      apiPublica('/valoraciones'),
      apiPublica('/valoraciones/resumen')
    ])
      .then(([datos, estadisticas]) => {
        if (!active) return;

        setResenas(Array.isArray(datos) ? datos : []);
        setResumen(estadisticas);
        setError('');
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

  const hayResenas = resenas.length > 0;

  return (
    <section
      className={
        compacto
          ? 'reviews-home hhrev'
          : 'container section section-compact hhrev'
      }
    >
      <div className={compacto ? 'container' : undefined}>

        <div className="hhrev-header">
          <div>
            <p className="eyebrow">
              EXPERIENCIAS REALES
            </p>

            <h2>
              {hayResenas
                ? 'Lo que opinan nuestros clientes'
                : 'Tu experiencia también cuenta'}
            </h2>

            <p>
              Cada opinión nos ayuda a mejorar y permite
              que otros clientes conozcan Huerto Hogar.
            </p>
          </div>

          {hayResenas && (
            <Link
              className="btn btn-outline-success"
              to="/valoraciones"
            >
              Dejar mi opinión
            </Link>
          )}
        </div>

        {cargando && (
          <p
            className="hhrev-loading"
            role="status"
          >
            Cargando experiencias...
          </p>
        )}

        {error && (
          <p
            className="alert alert-warning"
            role="alert"
          >
            No pudimos cargar las opiniones: {error}
          </p>
        )}

        {!cargando && !error && !hayResenas && (
          <div className="hhrev-empty">

            <div className="hhrev-photo">
              <img
                src="/img/portada-huerto.png"
                alt="Frutas y verduras frescas de Huerto Hogar"
                loading="lazy"
              />

              <span className="hhrev-photo-label">
                Frescura para compartir
              </span>
            </div>

            <div className="hhrev-content">

              <span className="hhrev-kicker">
                COMUNIDAD HUERTO HOGAR
              </span>

              <h3>
                Las buenas experiencias se comparten.
              </h3>

              <p>
                Queremos conocer tu opinión.
                Cuéntanos cómo fue tu experiencia
                con nuestros productos y ayuda
                a otros clientes a elegir sus favoritos.
              </p>

              <div className="hhrev-features">
                <span>✓ Experiencia de compra</span>
                <span>✓ Calidad de productos</span>
                <span>✓ Variedad de productos</span>
              </div>

              <div className="hhrev-actions">
                <Link
                  to="/valoraciones"
                  className="btn btn-success"
                >
                  Compartir mi experiencia
                </Link>

                <Link
                  to="/productos"
                  className="hhrev-link"
                >
                  Explorar productos →
                </Link>
              </div>

              <p className="hhrev-note">
                Los clientes registrados pueden publicar
                opiniones. Las reseñas asociadas a pedidos
                confirmados muestran el sello de compra
                verificada.
              </p>

            </div>
          </div>
        )}

        {!cargando && !error && hayResenas && (
          <>
            {resumen?.total > 0 && (
              <div className="ratings-summary">
                <strong>
                  ★ {prom(
                    (
                      resumen.experiencia +
                      resumen.calidad +
                      resumen.variedad
                    ) / 3
                  )}/5
                </strong>

                <span>
                  {resumen.total}{' '}
                  {resumen.total === 1
                    ? 'valoración publicada'
                    : 'valoraciones publicadas'}
                </span>
              </div>
            )}

            <div className="reviews-grid">
              {resenas
                .slice(0, compacto ? 3 : 24)
                .map((r) => (
                  <article
                    className="review-card"
                    key={r.id}
                  >

                    <div className="review-top">
                      <strong>{r.nombre}</strong>

                      {r.compraVerificada && (
                        <span className="verified-chip">
                          ✓ Compra verificada
                        </span>
                      )}
                    </div>

                    <p className="review-date">
                      {new Date(r.fecha)
                        .toLocaleDateString('es-CL')}
                    </p>

                    <div
                      className="review-stars"
                      aria-label={
                        `Experiencia: ${r.experiencia} de 5 estrellas`
                      }
                    >
                      {'★'.repeat(r.experiencia)}
                      {'☆'.repeat(5 - r.experiencia)}
                    </div>

                    <blockquote>
                      “{r.comentario}”
                    </blockquote>

                    <p className="review-categories">
                      Calidad {r.calidad}/5 ·
                      Variedad {r.variedad}/5
                    </p>

                  </article>
                ))}
            </div>
          </>
        )}

      </div>
    </section>
  );
}

export default function Valoraciones() {
  const { user, userLoading, api } = useStore();

  const [compras, setCompras] = useState([]);
  const [respuesta, setRespuesta] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    boletaId: '',
    experiencia: 0,
    calidad: 0,
    variedad: 0,
    comentario: ''
  });

  const [paso, setPaso] = useState(1);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'cliente') {
      setCompras([]);
      return;
    }

    let active = true;

    api('/valoraciones/compras-disponibles')
      .then((datos) => {
        if (active) {
          setCompras(datos);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
        }
      });

    return () => {
      active = false;
    };
  }, [api, user?.role, user?.correo, reload]);

  const todas = etiquetas.every(
    ([key]) => form[key] >= 1 && form[key] <= 5
  );

  async function enviar(e) {
    e.preventDefault();

    setError('');
    setRespuesta('');

    if (
      !todas ||
      form.comentario.trim().length < 15 ||
      form.comentario.length > 800
    ) {
      setError(
        'Completa las tres valoraciones y escribe entre 15 y 800 caracteres.'
      );
      return;
    }

    setLoading(true);

    try {
      await api('/valoraciones', {
        method: 'POST',
        body: {
          ...form,
          boletaId: form.boletaId
            ? Number(form.boletaId)
            : null
        }
      });

      setRespuesta(
        'Tu valoración se guardó correctamente. Gracias por compartirla.'
      );

      setForm({
        boletaId: '',
        experiencia: 0,
        calidad: 0,
        variedad: 0,
        comentario: ''
      });

      setPaso(1);
      setReload((x) => x + 1);

    } catch (err) {
      setError(err.message);

    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="page-intro">
        <div className="container">
          <p className="eyebrow">
            TU VOZ ES IMPORTANTE
          </p>

          <h1>Ayúdanos a mejorar</h1>

          <p>
            Comparte una opinión real de tus compras
            y descubre las experiencias de otros clientes.
          </p>
        </div>
      </section>

      <section className="container section section-compact">
        <div className="rating-layout">

          <div className="rating-form-shell">

            <div className="rating-form-header">
              <h2>Cuéntanos tu experiencia</h2>

              <p>
                Puedes opinar en general o seleccionar
                una compra para verificarla.
              </p>

              <div
                className="rating-progress"
                aria-label={`Paso ${paso} de 2`}
              >
                <span className="active" />
                <span
                  className={
                    paso === 2 ? 'active' : ''
                  }
                />
              </div>
            </div>

            {userLoading ? (
              <p className="p-4">
                Verificando sesión...
              </p>

            ) : !user ? (
              <div className="p-4">
                <p>
                  Inicia sesión para valorar una compra.
                </p>

                <Link
                  className="btn btn-success"
                  to="/login"
                >
                  Ingresar
                </Link>
              </div>

            ) : user.role !== 'cliente' ? (
              <p className="p-4">
                Solo los clientes pueden dejar reseñas
                de sus compras.
              </p>

            ) : (
              <form
                onSubmit={enviar}
                className="rating-form"
                noValidate
              >

                <label
                  className="form-label"
                  htmlFor="resena-pedido"
                >
                  Asocia una compra (opcional)
                </label>

                <select
                  className="form-select"
                  id="resena-pedido"
                  value={form.boletaId}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      boletaId: e.target.value
                    }))
                  }
                >
                  <option value="">
                    Opinión general de la tienda
                    (sin compra vinculada)
                  </option>

                  {compras.map((c) => (
                    <option
                      key={c.id}
                      value={c.id}
                    >
                      Pedido #{c.id} ·{' '}
                      {new Date(c.fecha)
                        .toLocaleDateString('es-CL')}
                    </option>
                  ))}
                </select>

                {paso === 1 ? (
                  <>
                    {etiquetas.map(([key, label]) => (
                      <div
                        className="rating-field"
                        key={key}
                      >
                        <label>{label} *</label>

                        <Estrellas
                          nombre={label}
                          valor={form[key]}
                          onChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              [key]: v
                            }))
                          }
                        />
                      </div>
                    ))}

                    <button
                      className="btn btn-success w-100"
                      type="button"
                      disabled={!todas}
                      onClick={() => setPaso(2)}
                    >
                      Continuar
                    </button>
                  </>

                ) : (
                  <>
                    <label
                      className="form-label mt-3"
                      htmlFor="resena-texto"
                    >
                      Tu comentario *
                    </label>

                    <textarea
                      id="resena-texto"
                      className="form-control"
                      rows={5}
                      minLength={15}
                      maxLength={800}
                      required
                      placeholder="¿Qué te pareció la experiencia y la calidad de los productos?"
                      value={form.comentario}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          comentario: e.target.value
                        }))
                      }
                    />

                    <small className="text-secondary">
                      {form.comentario.length}/800
                      caracteres · Mínimo 15
                    </small>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={() => setPaso(1)}
                      >
                        Volver
                      </button>

                      <button
                        type="submit"
                        className="btn btn-success flex-grow-1"
                        disabled={
                          loading ||
                          form.comentario.trim().length < 15
                        }
                      >
                        {loading
                          ? 'Guardando...'
                          : 'Publicar mi reseña'}
                      </button>
                    </div>
                  </>
                )}

              </form>
            )}

            {respuesta && (
              <p
                role="status"
                className="alert alert-success m-3"
              >
                {respuesta}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="alert alert-danger m-3"
              >
                {error}
              </p>
            )}

          </div>

          <div className="rating-side">
            <span aria-hidden="true">💚</span>

            <h2>
              Tu opinión ayuda a crecer al huerto
            </h2>

            <p>
              Nos interesa saber cómo fue tu compra,
              la calidad y la variedad de productos.
              La opinión general está disponible para
              cuentas registradas; las compras confirmadas
              obtienen el sello de verificación.
            </p>

            <Link to="/mis-pedidos">
              Revisar mis pedidos
            </Link>
          </div>

        </div>
      </section>

      <ResenasDestacadas key={reload} />
    </>
  );
}
