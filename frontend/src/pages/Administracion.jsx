import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useStore } from "../Tienda";
import { money, unitOf, quantityLabel, validQuantity } from "../carrito";

const blank = {
  codigo: "", nombre: "", categoria: "frutas", precio: 0, stock: 0,
  descripcion: "", imagen: "img/manzanas.jpg", descuento: 0, unidadVenta: "kg",
};

export default function Administracion() {
  const { user, userLoading, products, refreshProducts, api } = useStore();
  const [tab, setTab] = useState("productos");
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const admin = user?.role === "admin";
  const vendedor = user?.role === "vendedor";

  async function cargar() {
    try {
      const pedidos = await api("/pedidos");
      setOrders(pedidos);
      if (admin) setUsers(await api("/usuarios"));
    } catch (e) { setError(e.message); }
  }

  useEffect(() => {
    if (admin || vendedor) cargar();
  }, [admin, vendedor]);

  async function guardar(e) {
    e.preventDefault(); setError(""); setInfo("");
    const body = {
      ...draft, precio: Number(draft.precio), stock: Number(draft.stock),
      descuento: Number(draft.descuento),
    };
    if (!/^[A-Z0-9]{3,12}$/.test(body.codigo) || !body.nombre.trim() ||
        !body.descripcion.trim() || !(body.precio > 0) ||
        body.stock < 0 || (body.unidadVenta === "kg" ? Math.abs(body.stock*4-Math.round(body.stock*4))>0.00001 : !Number.isInteger(body.stock)) ||
        !Number.isInteger(body.descuento) || body.descuento < 0 || body.descuento > 90) {
      setError("Revisa código, nombre, descripción, precio, stock y descuento."); return;
    }
    try {
      await api(editing ? `/productos/${encodeURIComponent(draft.codigo)}` : "/productos", {
        method: editing ? "PUT" : "POST", body,
      });
      await refreshProducts();
      setDraft(blank); setEditing(false); setInfo("Producto guardado en la base de datos.");
    } catch (e) { setError(e.message); }
  }

  async function eliminarProducto(codigo) {
    if (!window.confirm(`¿Eliminar producto ${codigo}?`)) return;
    try {
      await api(`/productos/${encodeURIComponent(codigo)}`, { method: "DELETE" });
      await refreshProducts(); setInfo("Producto eliminado."); setError("");
    } catch (e) { setError(e.message); }
  }

  async function cambiarRol(id, rol) {
    try {
      await api(`/usuarios/${id}/rol`, { method: "PATCH", body: { rol: rol.toUpperCase() } });
      setUsers(await api("/usuarios")); setInfo("Rol actualizado."); setError("");
    } catch (e) { setError(e.message); }
  }

  async function eliminarUsuario(id) {
    if (!window.confirm("¿Eliminar esta cuenta?")) return;
    try {
      await api(`/usuarios/${id}`, { method: "DELETE" });
      setUsers(await api("/usuarios")); setInfo("Usuario eliminado."); setError("");
    } catch (e) { setError(e.message); }
  }

  if (userLoading) return <section className="container section">Verificando sesión...</section>;
  if (!user) return <Navigate to="/login" replace />;
  if (!admin && !vendedor) return <section className="container section"><h1>Acceso restringido</h1></section>;

  return <section className="container section">
    <p className="eyebrow">HUERTOHOGAR · DATOS REALES</p>
    <h1>{admin ? "Administración" : "Panel del vendedor"}</h1>
    <p className="text-secondary">Productos y pedidos obtenidos desde Spring Boot y la base de datos configurada (H2 local o MySQL).</p>
    <div className="d-flex flex-wrap gap-2 my-4">
      <button className="btn btn-outline-success" onClick={() => setTab("productos")}>Productos</button>
      <button className="btn btn-outline-success" onClick={() => { setTab("pedidos"); cargar(); }}>Pedidos</button>
      {admin && <button className="btn btn-outline-success" onClick={() => { setTab("usuarios"); cargar(); }}>Usuarios</button>}
    </div>
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    {info && <p role="status" className="alert alert-success">{info}</p>}

    {tab === "productos" && <div className="row g-4">
      <div className={admin ? "col-lg-8" : "col-12"}>
        <h2 className="h4">Catálogo</h2>
        <div className="table-responsive"><table className="table align-middle">
          <thead><tr><th>Código</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Detalle</th>{admin && <th>Acciones</th>}</tr></thead>
          <tbody>{products.map(p => <tr key={p.codigo}>
            <td>{p.codigo}</td><td>{p.nombre}</td><td>{money(Number(p.precio))}/{unitOf(p)}</td><td>{quantityLabel(p.stock,p)}</td>
            <td><button className="btn btn-sm btn-outline-secondary" onClick={() => setSelected({ tipo: "producto", ...p })}>Ver detalle</button></td>
            {admin && <td>
              <button className="btn btn-sm btn-outline-success me-2" onClick={() => { setDraft(p); setEditing(true); }}>Editar</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarProducto(p.codigo)}>Eliminar</button>
            </td>}
          </tr>)}</tbody>
        </table></div>
        {selected?.tipo === "producto" && <div className="alert alert-light">
          <strong>{selected.nombre}</strong> ({selected.categoriaNombre})<p>{selected.descripcion}</p>
          <p>Precio: {money(Number(selected.precio))}/{unitOf(selected)} · Stock: {quantityLabel(selected.stock,selected)} · Descuento: {selected.descuento}%</p>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
        </div>}
      </div>
      {admin && <div className="col-lg-4"><form className="summary" onSubmit={guardar}>
        <h2 className="h4">{editing ? "Editar producto" : "Nuevo producto"}</h2>
        {[["codigo", "Código"], ["nombre", "Nombre"], ["precio", "Precio"], ["stock", "Stock"],
          ["descuento", "Descuento (%)"], ["descripcion", "Descripción"]].map(([key, label]) => <div className="mb-3" key={key}>
          <label htmlFor={`admin-${key}`}>{label}</label>
          <input id={`admin-${key}`} className="form-control" value={draft[key]}
            type={["precio", "stock", "descuento"].includes(key) ? "number" : "text"} 
            step={key === "stock" ? (draft.unidadVenta === "kg" ? "0.25" : "1") : key === "descuento" ? "1" : "any"}
            min={["stock", "descuento"].includes(key) ? "0" : undefined}
            disabled={editing && key === "codigo"}
            onChange={e => setDraft({ ...draft, [key]: e.target.value })} />
        </div>)}
        <label htmlFor="admin-unidadVenta">Forma de venta</label>
        <select id="admin-unidadVenta" className="form-select mb-3" value={draft.unidadVenta || "kg"}
          onChange={e=>setDraft({...draft, unidadVenta:e.target.value,stock:0})}>
          <option value="kg">Por kilo (pasos de 0,25 kg)</option><option value="unidad">Por unidad (enteros)</option>
        </select>
        <label htmlFor="admin-categoria">Categoría</label>
        <select id="admin-categoria" className="form-select mb-3" value={draft.categoria}
          onChange={e => setDraft({ ...draft, categoria: e.target.value })}>
          <option value="frutas">Frutas</option><option value="verduras">Verduras</option><option value="organicos">Orgánicos</option>
        </select>
        <label htmlFor="admin-imagen">Imagen</label>
        <select id="admin-imagen" className="form-select mb-3" value={draft.imagen}
          onChange={e => setDraft({ ...draft, imagen: e.target.value })}>
          {["manzanas", "naranjas", "platanos", "zanahorias", "espinacas", "pimientos", "miel"].map(nombre =>
            <option key={nombre} value={`img/${nombre}.jpg`}>{nombre}</option>)}
        </select>
        <button className="btn btn-success" type="submit">Guardar producto</button>
        <button className="btn btn-link" type="button" onClick={() => { setDraft(blank); setEditing(false); }}>Cancelar</button>
      </form></div>}
    </div>}

    {tab === "pedidos" && <>
      <h2 className="h4">Órdenes registradas</h2>
      <div className="table-responsive"><table className="table">
        <thead><tr><th>N.º</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Detalle</th></tr></thead>
        <tbody>{orders.map(p => <tr key={p.id}>
          <td>{p.id}</td><td>{p.cliente}</td><td>{new Date(p.fecha).toLocaleString("es-CL")}</td>
          <td>{money(Number(p.total))}</td><td>{p.estado}</td>
          <td><button className="btn btn-sm btn-outline-secondary" onClick={() => setSelected({ tipo: "pedido", ...p })}>Ver</button></td>
        </tr>)}</tbody>
      </table></div>
      {selected?.tipo === "pedido" && <div className="summary">
        <h3>Pedido #{selected.id}</h3><p>Cliente: {selected.cliente}</p>
        <p>Entrega: {selected.entrega} · {selected.direccion}, {selected.comuna}, {selected.region}</p>
        <ul>{selected.productos.map(i => <li key={i.codigo}>{i.nombre} × {quantityLabel(i.cantidad,i)}: {money(Number(i.subtotal))} {i.descuentoAplicado>0 && `(−${i.descuentoAplicado}%)`}</li>)}</ul>
        <strong>Total: {money(Number(selected.total))}</strong>
        <div><button className="btn btn-link" onClick={() => setSelected(null)}>Cerrar detalle</button></div>
      </div>}
    </>}

    {tab === "usuarios" && admin && <>
      <h2 className="h4">Usuarios</h2>
      <p>Solo el administrador puede cambiar roles o eliminar cuentas.</p>
      <div className="table-responsive"><table className="table"><thead>
        <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr>
      </thead><tbody>{users.map(u => <tr key={u.id}>
        <td>{u.nombre}</td><td>{u.correo}</td>
        <td><select aria-label={`Rol de ${u.correo}`} className="form-select" value={u.role}
          disabled={u.id === user.id} onChange={e => cambiarRol(u.id, e.target.value)}>
          <option value="cliente">Cliente</option><option value="vendedor">Vendedor</option><option value="admin">Administrador</option>
        </select></td>
        <td><button className="btn btn-sm btn-outline-danger" disabled={u.id === user.id}
          onClick={() => eliminarUsuario(u.id)}>Eliminar</button></td>
      </tr>)}</tbody></table></div>
    </>}
  </section>;
}
