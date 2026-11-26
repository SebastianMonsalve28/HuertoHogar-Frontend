
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validate, locations, normalizeRun } from "../validaciones";
import { storage } from "../almacenamiento";
import { useStore } from "../Tienda";

function ImagenCuenta({ mode }) {
  const nombre =
    mode === "contact"
      ? "contactoo"
      : mode === "login"
      ? "ingresar"
      : "huerto";

  const rutas =
    mode === "register"
      ? ["/img/contactoo.png"]
      : [
          `/img/${nombre}.png`,
          `/img/${nombre}.jpg`,
          `/img/${nombre}.jpeg`,
          `/img/${nombre}.webp`,
          `/img/${nombre}.jfif`,
          "/img/contactoo.png",
        ];

  const [indice, setIndice] = useState(0);

  if (indice >= rutas.length) {
    return null;
  }

  return (
    <img
      src={rutas[indice]}
      alt={
        mode === "contact"
          ? "Atención y contacto de Huerto Hogar"
          : mode === "login"
          ? "Compra de productos frescos en Huerto Hogar"
          : "Frutas y verduras frescas del huerto"
      }
      onError={() => setIndice(i => i + 1)}
    />
  );
}

export default function AccountForm({ mode }) {
  const { login, registrar } = useStore();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmPassword: "",
    run: "",
    region: "",
    comuna: "",
    direccion: "",
    comentario: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  const title =
    mode === "contact"
      ? "Conversemos"
      : mode === "login"
      ? "Bienvenido de nuevo"
      : "Crea tu cuenta";

  function change(event) {
    const { name, value } = event.target;

    setValues(prev => ({
      ...prev,
      [name]: value,
      ...(name === "region" ? { comuna: "" } : {})
    }));

    setErrors(prev => ({
      ...prev,
      [name]: undefined,
      general: undefined
    }));
  }

  async function submit(event) {
    event.preventDefault();

    const fallos = validate(values, mode);
    setErrors(fallos);
    setSuccess("");

    if (Object.keys(fallos).length) return;

    const correo = values.correo.trim().toLowerCase();
    setSending(true);

    try {
      if (mode === "contact") {
        const old = storage.read("messages", []);

        const ok = storage.write("messages", [
          ...(Array.isArray(old) ? old : []),
          {
            nombre: values.nombre,
            correo,
            comentario: values.comentario,
            fecha: new Date().toISOString()
          }
        ]);

        if (!ok) {
          throw new Error(
            "No se pudo guardar el mensaje localmente."
          );
        }

        setSuccess(
          "Mensaje guardado en esta demostración. No se envió un correo."
        );

        setValues(v => ({
          ...v,
          comentario: ""
        }));

        return;
      }

      let user;

      if (mode === "register") {
        user = await registrar({
          nombre: values.nombre.trim(),
          correo,
          password: values.password,
          run: normalizeRun(values.run),
          region: values.region,
          comuna: values.comuna,
          direccion: values.direccion.trim()
        });
      } else {
        user = await login(correo, values.password);
      }

      navigate(
        user.role === "admin"
          ? "/admin"
          : user.role === "vendedor"
          ? "/gestion"
          : "/"
      );

    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setSending(false);
    }
  }

  function field(name, label, type = "text", maxLength = 100) {
    const autocomplete = {
      nombre: "name",
      correo: "email",
      password:
        mode === "login"
          ? "current-password"
          : "new-password",
      confirmPassword: "new-password",
      direccion: "street-address",
      run: "off"
    };

    return (
      <div className="mb-3">
        <label className="form-label" htmlFor={name}>
          {label}
        </label>

        <input
          id={name}
          name={name}
          type={type}
          maxLength={maxLength}
          required
          autoComplete={autocomplete[name] || "off"}
          className={
            "form-control " +
            (errors[name] ? "is-invalid" : "")
          }
          value={values[name]}
          onChange={change}
          aria-invalid={!!errors[name]}
        />

        {errors[name] && (
          <p role="alert" className="text-danger small">
            {errors[name]}
          </p>
        )}
      </div>
    );
  }

  return (
    <section
      className={`container section account-section account-${mode}`}
    >
      <div className="account-layout">

        <aside className="account-aside">
          <p className="eyebrow">
            FRESCO · LOCAL · NATURAL
          </p>

          <h2>
            {mode === "contact"
              ? "Estamos para ayudarte"
              : mode === "register"
              ? "Bienvenido a una compra más fresca"
              : "Tu mesa comienza aquí"}
          </h2>

          <p>
            {mode === "contact"
              ? "Envíanos tu consulta. Te mostramos una confirmación de demostración para que puedas comprobar el formulario."
              : "Explora productos del campo chileno, elige tus kilos y descubre ofertas para tu hogar."}
          </p>

          <ImagenCuenta mode={mode} />
        </aside>

        <div className="form-shell">
          <p className="eyebrow">
            HUERTOHOGAR
          </p>

          <h1>{title}</h1>

          <p className="text-secondary">
            {mode === "contact"
              ? "Cuéntanos cómo podemos ayudarte."
              : "Tu próxima compra comienza aquí."}
          </p>

          <form noValidate onSubmit={submit}>

            {mode !== "login" &&
              field("nombre", "Nombre completo")}

            {mode === "register" &&
              field("run", "RUN (con dígito verificador)")}

            {field(
              "correo",
              "Correo electrónico",
              "email"
            )}

            {mode !== "contact" &&
              field(
                "password",
                "Contraseña",
                "password",
                72
              )}

            {mode === "register" &&
              field(
                "confirmPassword",
                "Confirmar contraseña",
                "password",
                72
              )}

            {mode === "register" && (
              <>
                <div className="mb-3">
                  <label htmlFor="region">
                    Región
                  </label>

                  <select
                    className="form-select"
                    id="region"
                    name="region"
                    value={values.region}
                    onChange={change}
                  >
                    <option value="">
                      Selecciona una región
                    </option>

                    {Object.keys(locations).map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  {errors.region && (
                    <p className="text-danger small">
                      {errors.region}
                    </p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="comuna">
                    Comuna
                  </label>

                  <select
                    className="form-select"
                    id="comuna"
                    name="comuna"
                    value={values.comuna}
                    onChange={change}
                  >
                    <option value="">
                      Selecciona una comuna
                    </option>

                    {(locations[values.region] || []).map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {errors.comuna && (
                    <p className="text-danger small">
                      {errors.comuna}
                    </p>
                  )}
                </div>

                {field(
                  "direccion",
                  "Dirección",
                  "text",
                  200
                )}
              </>
            )}

            {mode === "contact" && (
              <div className="mb-3">
                <label htmlFor="comentario">
                  Mensaje
                </label>

                <textarea
                  className="form-control"
                  id="comentario"
                  name="comentario"
                  rows="5"
                  maxLength="500"
                  aria-invalid={!!errors.comentario}
                  value={values.comentario}
                  onChange={change}
                />

                <small className="d-block text-secondary mt-1">
                  {values.comentario.length}/500 caracteres
                </small>

                {errors.comentario && (
                  <p role="alert" className="text-danger small">
                    {errors.comentario}
                  </p>
                )}
              </div>
            )}

            {errors.general && (
              <p
                className="alert alert-danger"
                role="alert"
              >
                {errors.general}
              </p>
            )}

            {success && (
              <p
                className="alert alert-success"
                role="status"
              >
                {success}
              </p>
            )}

            <button
              disabled={sending}
              type="submit"
              className="btn btn-success w-100"
            >
              {sending
                ? "Guardando..."
                : mode === "contact"
                ? "Guardar mensaje"
                : mode === "login"
                ? "Iniciar sesión"
                : "Registrarme"}
            </button>
          </form>

          {mode === "login" && (
            <p className="mt-3">
              ¿Aún no tienes cuenta?{" "}
              <Link to="/registro">
                Regístrate
              </Link>
            </p>
          )}
        </div>

      </div>
    </section>
  );
}
