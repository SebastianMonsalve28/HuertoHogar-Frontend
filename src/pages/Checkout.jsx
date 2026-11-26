import Impuestos from "../components/Impuestos";
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../Tienda";
import { validateCheckout, locations } from "../validaciones";
import { totalCart, originalTotal, money, quantityLabel, linePrice } from "../carrito";
import {totalCajas,originalCajas,totalCaja,cajaTexto} from "../cajas";

export function Checkout() {
  const { items, setItems, cajas, setCajas, products, user, userLoading, api, refreshProducts } = useStore();
  const subtotal=originalTotal(items)+originalCajas(cajas,products);
  const total=totalCart(items)+totalCajas(cajas,products);
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState({
        nombre: user?.nombre || "", correo: user?.correo || "", direccion: "",
    region: "", comuna: "", indicaciones: "", entrega: "domicilio",
    ...location.state?.datosEntrega, resultadoPago: "aprobado",
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (userLoading) return <section className="container section">Verificando sesión...</section>;
  if (!user) return <section className="container section"><h1>Inicia sesión para comprar</h1>
    <p>Tu carrito se conservará mientras ingresas a tu cuenta.</p>
    <Link className="btn btn-success" to="/login">Iniciar sesión</Link></section>;
  if (user.role === "vendedor") return <section className="container section"><h1>No autorizado</h1></section>;
  if (!items.length && !cajas.length) return <section className="container section"><h1>Finalizar compra</h1><p>Tu carrito está vacío.</p><Link to="/productos">Volver a productos</Link></section>;

  function change(e) {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value, ...(name === "region" ? { comuna: "" } : {}) }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    const values = { ...data, nombre: data.nombre || user.nombre, correo: user.correo };
    const fallos = validateCheckout(values);
    setErrors(fallos);
    if (Object.keys(fallos).length) return;
    setSending(true);
    try {
      const pedido = await api("/pedidos", {
        method: "POST", body: {
          nombre: values.nombre, direccion: values.direccion, region: values.region,
          comuna: values.comuna, entrega: values.entrega, indicaciones: values.indicaciones,
          resultadoPago: values.resultadoPago,
          items: items.map(i => ({ codigo: i.codigo, cantidad: i.cantidad })),
          cajas: cajas.map(c => c.tipo==='preparada'
            ? {tipo:'preparada',presetId:c.presetId}
            : {tipo:'personalizada',productos:c.productos.map(p=>({codigo:p.codigo,cantidad:p.cantidad}))}),
        },
      });
      setItems([]);
      setCajas([]);
      await refreshProducts().catch(() => {});
      navigate("/resultado", { state: { pedido } });
    } catch (err) {
      if (err.status === 402) navigate("/resultado", {state:{pagoFallido:true,datosEntrega:data}});
      else { setError(err.message); if (err.status === 409) await refreshProducts().catch(() => {}); }
    }
    finally { setSending(false); }
  }

  return <section className="container section"><h1>Finalizar compra</h1>
    <p className="text-secondary">Pedido académico: no hay cobro ni despacho real. La boleta y el stock se guardan en la base de datos del backend.</p>
    <div className="row g-4"><div className="col-lg-8"><form className="summary" noValidate onSubmit={submit}>
      <h2 className="h4">Datos de entrega</h2>
      <p>Cuenta: <strong>{user.correo}</strong></p>
      {[ ["nombre", "Nombre completo"], ["direccion", "Dirección de entrega"] ].map(([name, label]) =>
        <div className="mb-3" key={name}><label htmlFor={name}>{label}</label>
          <input className="form-control" id={name} name={name} required autoComplete={name === "nombre" ? "name" : "street-address"} value={data[name]}
            onChange={change} />
          {errors[name] && <p role="alert" className="text-danger small">{errors[name]}</p>}
        </div>)}
      <div className="row g-3 mb-3"><div className="col-md-6"><label htmlFor="region">Región</label>
        <select className="form-select" id="region" name="region" value={data.region} onChange={change}>
          <option value="">Selecciona región</option>
          {Object.keys(locations).map(r => <option key={r} value={r}>{r}</option>)}
        </select>{errors.region && <p className="text-danger small">{errors.region}</p>}</div>
        <div className="col-md-6"><label htmlFor="comuna">Comuna</label>
          <select className="form-select" id="comuna" name="comuna" value={data.comuna} onChange={change}>
            <option value="">Selecciona comuna</option>
            {(locations[data.region] || []).map(c => <option key={c} value={c}>{c}</option>)}
          </select>{errors.comuna && <p className="text-danger small">{errors.comuna}</p>}</div></div>
      <label htmlFor="indicaciones">Indicaciones (opcional)</label>
      <textarea className="form-control mb-3" id="indicaciones" name="indicaciones" maxLength="300"
        value={data.indicaciones} onChange={change} />
      <label htmlFor="entrega">Tipo de entrega</label>
      <select className="form-select mb-3" id="entrega" name="entrega" value={data.entrega} onChange={change}>
        <option value="domicilio">Despacho a domicilio (simulado)</option>
        <option value="retiro">Retiro en tienda (simulado)</option>
      </select>
      <label htmlFor="resultadoPago">Pago de prueba</label>
      <select className="form-select mb-3" id="resultadoPago" name="resultadoPago" value={data.resultadoPago} onChange={change}>
        <option value="aprobado">Pago aprobado (simulado)</option>
        <option value="rechazado">Pago rechazado (simulado)</option>
      </select>
      {error && <p role="alert" className="alert alert-danger">{error}</p>}
      <button type="submit" className="btn btn-success" disabled={sending}>
        {sending ? "Registrando pedido..." : "Pagar y confirmar compra de prueba"}
      </button>
      <Link className="btn btn-link" to="/carrito">Volver al carrito</Link>
    </form></div><aside className="col-lg-4"><div className="summary">
      <h2 className="h4">Resumen</h2>
      {items.map(i => <p className="summary-row" key={i.codigo}><span>{i.nombre} ({quantityLabel(i.cantidad,i)})</span><strong>{money(linePrice(i))}</strong></p>)}
      {cajas.map(c=><p className="summary-row" key={c.id}><span>{c.nombre} · {cajaTexto(c,products)}</span><strong>{money(totalCaja(c,products))}</strong></p>)}
      <hr/><p className="summary-row"><span>Subtotal original</span><span>{money(subtotal)}</span></p>
      <p className="summary-row savings"><span>Descuentos</span><strong>− {money(Math.max(0,subtotal-total))}</strong></p>
      <Impuestos total={total}/><p className="summary-row summary-total"><strong>Total estimado</strong><strong>{money(total)}</strong></p>
      <p className="text-secondary small">El servidor vuelve a calcular el total con los precios vigentes.</p>
    </div></aside></div>
  </section>;
}

export function Resultado() {
  const state = useLocation().state;
  const pedido = state?.pedido;
  if (state?.pagoFallido) return <section className="container section">
    <h1>Compra fallida</h1>
    <div className="alert alert-danger" role="alert">No se pudo realizar el pago de prueba. Tu carrito se conserva y no se registró ningún pedido ni se descontó stock.</div>
    <Link className="btn btn-success me-2" to="/checkout" state={{datosEntrega:state.datosEntrega}}>Volver a intentar el pago</Link>
    <Link className="btn btn-outline-success" to="/carrito">Volver al carrito</Link>
  </section>;
  return <section className="container section">
    <h1>{pedido ? "Compra exitosa" : "Resultado del pedido"}</h1>
    {pedido ? <div className="alert alert-success">
      <p>Tu pedido #{pedido.id} fue registrado en la base de datos.</p>
      <p>Pago de prueba aprobado. Pedido registrado.</p>
      <Impuestos total={pedido.total} neto={pedido.neto} iva={pedido.iva}/>
      <p>Total: <strong>{money(Number(pedido.total))}</strong></p>
      <div className="order-receipt">{pedido.productos?.map(i=><div className="summary-row" key={i.codigo}>
        <span>{i.nombre} ({quantityLabel(i.cantidad,i)}) {i.descuentoAplicado>0&&<small className="offer-chip">−{i.descuentoAplicado}%</small>}</span>
        <strong>{money(Number(i.subtotal))}</strong>
      </div>)}</div>
      {pedido.cajas?.length>0&&<div className="receipt-boxes"><h2 className="h5">Cajas incluidas</h2>{pedido.cajas.map((c,i)=><p key={i}><strong>{c.nombre}</strong>: {c.contenido}</p>)}</div>}
      <p>Estado: {pedido.estado}</p>
      <p>Es una compra de demostración sin pago ni despacho real.</p>
    </div> : <p>Consulta el estado de tus pedidos desde tu cuenta.</p>}
    <Link to="/productos" className="btn btn-success">Volver al catálogo</Link>
  </section>;
}
