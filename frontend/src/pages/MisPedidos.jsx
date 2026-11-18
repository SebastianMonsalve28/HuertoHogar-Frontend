import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useStore } from "../Tienda";
import { money, quantityLabel } from "../carrito";

export default function MisPedidos() {
  const { api, user, userLoading } = useStore();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (userLoading || user?.role !== "cliente") return;
    let active = true;
    setLoading(true);
    api("/pedidos")
      .then(lista => { if (active) setPedidos(Array.isArray(lista) ? lista : []); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, userLoading, user?.role]);

  if (userLoading) return <section className="container section">Verificando sesión...</section>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "cliente") return <Navigate to={user.role === "admin" ? "/admin" : "/gestion"} replace />;

  return <section className="container section">
    <h1>Mis pedidos</h1>
    <p className="text-secondary">Aquí puedes revisar tus compras de demostración guardadas en la base de datos.</p>
    {loading && <p role="status">Cargando pedidos...</p>}
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    {!loading && !error && !pedidos.length && <p>No hay pedidos registrados. <Link to="/productos">Ver catálogo</Link></p>}
    {!loading && pedidos.length > 0 && <div className="table-responsive">
      <table className="table align-middle">
        <thead><tr><th>Número</th><th>Fecha</th><th>Estado</th><th>Total</th><th>Detalle</th></tr></thead>
        <tbody>{pedidos.map(p => <tr key={p.id}>
          <td>{p.id}</td>
          <td>{new Date(p.fecha).toLocaleString("es-CL")}</td>
          <td>{p.estado}</td>
          <td>{money(Number(p.total))}</td>
          <td><button className="btn btn-sm btn-outline-success" onClick={() => setSelected(selected?.id === p.id ? null : p)}>Ver detalle</button></td>
        </tr>)}</tbody>
      </table>
    </div>}
    {selected && <div className="summary">
      <h2 className="h5">Pedido #{selected.id}</h2>
      <ul>{selected.productos.map(i => <li key={i.codigo}>{i.nombre}: {quantityLabel(i.cantidad,i)} × {money(Number(i.precio))}/{i.unidadVenta}
        {i.descuentoAplicado>0 && ` (−${i.descuentoAplicado}%)`} = {money(Number(i.subtotal))}</li>)}</ul>
      {selected.cajas?.length>0 && <div><h3 className="h6">Cajas del pedido</h3>{selected.cajas.map((c,i)=><p key={i}><strong>{c.nombre}</strong> — {c.contenido}</p>)}</div>}
      <p>Entrega: {selected.entrega} · {selected.comuna}, {selected.region}</p>
      <strong>Total: {money(Number(selected.total))}</strong>
      <div><button className="btn btn-link" onClick={() => setSelected(null)}>Cerrar detalle</button></div>
    </div>}
  </section>;
}
