import Impuestos from "../components/Impuestos";
import React, { useEffect, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useStore } from "../Tienda";
import { money, unitOf, quantityLabel, offerPrice } from "../carrito";

const blank = {
  codigo: "", nombre: "", categoria: "frutas", precio: 0, stock: 0,
  descripcion: "", imagen: "img/manzanas.jpg", descuento: 0, unidadVenta: "kg",
};

function DetalleGestion({ detalle, onCerrar }) {
  const dialogo = useRef(null);

  useEffect(() => {
    const ventana = dialogo.current;
    const botonOrigen = document.activeElement;
    ventana.showModal();
    return () => {
      ventana.close();
      if (botonOrigen?.isConnected) botonOrigen.focus();
    };
  }, []);

  const producto = detalle.tipo === "producto";
  return <dialog ref={dialogo} aria-labelledby="titulo-detalle-gestion"
    className="rounded border-0 shadow p-4"
    style={{ width: "min(680px, calc(100vw - 32px))", maxHeight: "calc(100dvh - 32px)", overflowY: "auto" }}
    onCancel={e => { e.preventDefault(); onCerrar(); }}>
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <h2 className="h4 mb-0" id="titulo-detalle-gestion">
        {producto ? `Detalle de ${detalle.nombre}` : `Pedido #${detalle.id}`}
      </h2>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCerrar}>Cerrar detalle</button>
    </div>
    {producto ? <>
      {detalle.imagen && <img src={'/' + detalle.imagen.replace(/^\/+/, '')} alt={detalle.nombre}
        className="w-100 rounded mb-3" style={{ maxHeight: 220, objectFit: "contain" }}/>} 
      <p>Código: {detalle.codigo} · Categoría: {detalle.categoriaNombre}</p>
      <p>{detalle.descripcion}</p>
      <p>Stock: {quantityLabel(detalle.stock,detalle)} · Venta por {unitOf(detalle)}</p>
      <p>Descuento: {detalle.descuento || 0}%</p>
      <Impuestos total={offerPrice(detalle)}/>
      <p className="summary-row summary-total"><span>Precio final por {unitOf(detalle)}</span><strong>{money(offerPrice(detalle))}</strong></p>
    </> : <>
      <p>Cliente: {detalle.cliente}</p>
      <p>Estado: {detalle.estado}</p>
      <p>Entrega: {detalle.entrega} · {detalle.direccion}, {detalle.comuna}, {detalle.region}</p>
      <ul>{detalle.productos?.map(i => <li key={i.codigo}>
        {i.nombre} × {quantityLabel(i.cantidad,i)}: {money(Number(i.subtotal))} {i.descuentoAplicado>0 && `(−${i.descuentoAplicado}%)`}
      </li>)}</ul>
      {detalle.cajas?.length>0 && <div><h3 className="h6">Cajas incluidas</h3>{detalle.cajas.map((c,i)=><p key={i}><strong>{c.nombre}</strong>: {c.contenido}</p>)}</div>}
      <Impuestos total={detalle.total} neto={detalle.neto} iva={detalle.iva}/>
      <p className="summary-row summary-total"><span>Total</span><strong>{money(Number(detalle.total))}</strong></p>
    </>}
  </dialog>;
}

export default function Administracion() {
  const { user, userLoading, products, productsLoading, refreshProducts, api } = useStore();
  const [pantalla, setPantalla] = useSearchParams();
  const [busqueda, setBusqueda] = useState("");
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [selected, setSelected] = useState(null);
  const admin = user?.role === "admin";
  const vendedor = user?.role === "vendedor";
  const vistas = admin ? ["productos", "pedidos", "usuarios"] : ["inicio", "productos", "pedidos"];
  const tab = vistas.includes(pantalla.get("vista")) ? pantalla.get("vista") : vendedor ? "inicio" : "productos";
  const productosFiltrados = products.filter(p =>
    `${p.nombre} ${p.codigo} ${p.categoriaNombre}`.toLocaleLowerCase("es").includes(busqueda.trim().toLocaleLowerCase("es")));

  function setTab(vista) {
    setSelected(null);
    setPantalla({ vista });
  }

  async function cargar() {
    setCargandoPedidos(true);
    try {
      const pedidos = await api("/pedidos");
      setOrders(pedidos);
      if (admin) setUsers(await api("/usuarios"));
    } catch (e) { setError(e.message); }
    finally { setCargandoPedidos(false); }
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
    <p className="text-secondary">{admin ? "Gestiona los productos, pedidos y usuarios de la tienda." : "Consulta el catálogo y los pedidos de la tienda."}</p>
    <nav aria-label="Secciones del panel" className="d-flex flex-wrap gap-2 my-4">
      {vendedor && <button type="button" className={tab === "inicio" ? "btn btn-success" : "btn btn-outline-success"} aria-pressed={tab === "inicio"} onClick={() => setTab("inicio")}>Inicio</button>}
      <button type="button" className={tab === "productos" ? "btn btn-success" : "btn btn-outline-success"} aria-pressed={tab === "productos"} onClick={() => setTab("productos")}>Productos</button>
      <button type="button" className={tab === "pedidos" ? "btn btn-success" : "btn btn-outline-success"} aria-pressed={tab === "pedidos"} onClick={() => { setTab("pedidos"); cargar(); }}>Pedidos</button>
      {admin && <button type="button" className={tab === "usuarios" ? "btn btn-success" : "btn btn-outline-success"} aria-pressed={tab === "usuarios"} onClick={() => { setTab("usuarios"); cargar(); }}>Usuarios</button>}
    </nav>
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    {info && <p role="status" className="alert alert-success">{info}</p>}

    {vendedor && tab === "inicio" && <>
      <div className="summary mb-4">
        <p className="eyebrow">TU ESPACIO DE CONSULTA</p>
        <h2>Bienvenido, {user.nombre}</h2>
        <p className="mb-0">Revisa precios, disponibilidad y detalles de productos, o consulta las órdenes y sus datos de entrega.</p>
      </div>
      <div className="row g-4">
        <div className="col-md-6"><article className="card h-100 border-0 shadow-sm"><div className="card-body p-4">
          <p className="eyebrow">CATÁLOGO</p><h3 className="h4">Productos de la tienda</h3>
          <p>{productsLoading ? "Cargando catálogo..." : `${products.length} ${products.length === 1 ? "producto registrado" : "productos registrados"}`}</p>
          <p className="text-secondary">Fotografías, precios con IVA y stock por kilo o unidad.</p>
          <button type="button" className="btn btn-success" onClick={() => setTab("productos")}>Ver productos</button>
        </div></article></div>
        <div className="col-md-6"><article className="card h-100 border-0 shadow-sm"><div className="card-body p-4">
          <p className="eyebrow">ÓRDENES</p><h3 className="h4">Pedidos registrados</h3>
          <p>{cargandoPedidos ? "Cargando pedidos..." : `${orders.length} ${orders.length === 1 ? "pedido registrado" : "pedidos registrados"}`}</p>
          <p className="text-secondary">Cliente, productos, dirección de entrega y total con impuestos.</p>
          <button type="button" className="btn btn-success" onClick={() => { setTab("pedidos"); cargar(); }}>Ver pedidos</button>
        </div></article></div>
      </div>
    </>}

    {vendedor && tab === "productos" && <>
      <h2 className="h4">Catálogo de productos</h2>
      <div className="mb-4"><label htmlFor="buscar-producto-vendedor" className="form-label">Buscar por nombre, código o categoría</label>
        <input id="buscar-producto-vendedor" className="form-control" type="search" value={busqueda}
          placeholder="Por ejemplo: manzanas" onChange={e => setBusqueda(e.target.value)}/>
      </div>
      {productsLoading ? <p role="status">Cargando catálogo...</p> : <>
        <p className="text-secondary">{productosFiltrados.length} de {products.length} productos</p>
        {!productosFiltrados.length && <p role="status">No se encontraron productos.</p>}
        <div className="row g-4">{productosFiltrados.map(p => <div className="col-md-6 col-xl-4" key={p.codigo}>
          <article className="card h-100 overflow-hidden border-0 shadow-sm">
            <img src={'/' + p.imagen.replace(/^\/+/, '')} alt={p.nombre} loading="lazy" className="card-img-top" style={{ height: 190, objectFit: "cover" }}/>
            <div className="card-body d-flex flex-column p-4">
              <p className="eyebrow">{p.categoriaNombre}</p><h3 className="h4">{p.nombre}</h3>
              <p className="small text-secondary">Código: {p.codigo}</p>
              <p className="flex-grow-1">{p.descripcion}</p>
              <p className="mb-1"><strong className="price">{money(offerPrice(p))}</strong> / {unitOf(p)}</p>
              {Number(p.descuento)>0 && <p className="small text-secondary mb-1"><s>{money(p.precio)}</s> · Descuento: {p.descuento}%</p>}
              <Impuestos total={offerPrice(p)} compacto unidad={unitOf(p)}/>
              <p className="small mt-3">{Number(p.stock)>0 ? `Disponible: ${quantityLabel(p.stock,p)}` : "Sin stock"}</p>
              <button type="button" className="btn btn-outline-success w-100" onClick={() => setSelected({ ...p, tipo: "producto" })}>Ver detalle</button>
            </div>
          </article>
        </div>)}</div>
      </>}
    </>}

    {admin && tab === "productos" && <div className="row g-4">
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
      </div>
      {admin && <div className="col-lg-4"><form className="summary" onSubmit={guardar}>
        <h2 className="h4">{editing ? "Editar producto" : "Nuevo producto"}</h2>
        {[["codigo", "Código"], ["nombre", "Nombre"], ["precio", "Precio con IVA incluido"], ["stock", "Stock"],
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
      {cargandoPedidos && <p role="status">Cargando pedidos...</p>}
      {!cargandoPedidos && !orders.length && <p>No hay pedidos registrados.</p>}
      <div className="table-responsive"><table className="table">
        <thead><tr><th>N.º</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Detalle</th></tr></thead>
        <tbody>{orders.map(p => <tr key={p.id}>
          <td>{p.id}</td><td>{p.cliente}</td><td>{new Date(p.fecha).toLocaleString("es-CL")}</td>
          <td>{money(Number(p.total))}</td><td>{p.estado}</td>
          <td><button className="btn btn-sm btn-outline-secondary" onClick={() => setSelected({ tipo: "pedido", ...p })}>Ver</button></td>
        </tr>)}</tbody>
      </table></div>
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
    {selected && <DetalleGestion detalle={selected} onCerrar={() => setSelected(null)}/>}
  </section>;
}
