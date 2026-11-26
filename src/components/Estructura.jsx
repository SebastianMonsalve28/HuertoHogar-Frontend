import React, { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { useStore } from "../Tienda";

export default function Layout() {
  const { items, user, userLoading, logout, notice, setNotice } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const vendedor = user?.role === "vendedor";
  const {cajas} = useStore();
  const cantidadLegible = String(items.length + cajas.length);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(id);
  }, [notice, setNotice]);

  async function salir() {
    try { await logout(); }
    catch (e) { setNotice(e.message); }
    navigate("/");
  }

  return <>
    <a className="visually-hidden-focusable" href="#contenido">Saltar al contenido</a>
    <header className="bg-white border-bottom site-header">
      <nav className="navbar navbar-expand-lg container py-3" aria-label="Navegación principal">
        <Link className="navbar-brand brand" to={vendedor ? "/gestion" : "/"}>
          Huerto<span>Hogar</span><small>DEL CAMPO A TU MESA</small>
        </Link>
        <button className="navbar-toggler" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span className="navbar-toggler-icon" />
        </button>
        <div className={"navbar-collapse " + (open ? "" : "collapse")}>
          <div className="navbar-nav ms-auto gap-lg-2 align-items-lg-center" onClick={() => setOpen(false)}>
            {!vendedor && [
              ["/", "Inicio"], ["/productos", "Productos"], ["/cajas", "Cajas"], ["/ofertas", "Ofertas"],
              ["/nosotros", "Nosotros"], ["/blog", "Blog"], ["/contacto", "Contacto"],
            ].map(([to, label]) => <NavLink end={to === "/"} key={to} className="nav-link" to={to}>{label}</NavLink>)}
            {user ? <>
              <span className="nav-link user-greeting">Hola, {user.nombre}</span>
              {user.role === "cliente" && <NavLink className="nav-link" to="/pedidos">Mis pedidos</NavLink>}
              {user.role === "admin" && <NavLink className="nav-link" to="/admin">Administrar</NavLink>}
              {vendedor && <NavLink className="nav-link" to="/gestion">Productos y pedidos</NavLink>}
              <button className="btn btn-link nav-link" onClick={salir}>Salir</button>
            </> : !userLoading && <NavLink className="nav-link" to="/login">Ingresar</NavLink>}
            {!vendedor && <NavLink className="cart-nav ms-lg-2" to="/carrito" aria-label={`Ir al carrito: ${cantidadLegible} artículos o cajas`} title="Ver tu carrito">
              <span className="cart-nav-symbol" aria-hidden="true">🛒</span>
              <span className="cart-nav-counter">{cantidadLegible}</span>
            </NavLink>}
          </div>
        </div>
      </nav>
    </header>

    {notice && <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1090, width: "min(420px,100vw)" }}>
      <div role="status" className="alert alert-info shadow-lg d-flex gap-3 justify-content-between">
        {notice}<button className="btn-close" aria-label="Cerrar aviso" onClick={() => setNotice("")} />
      </div>
    </div>}

    <main id="contenido" tabIndex="-1"><Outlet /></main>

    <footer className="footer footer-modern">
      <div className="container footer-main">
        <div className="footer-brand-block">
          <Link className="footer-logo" to={vendedor ? "/gestion" : "/"}>Huerto<span>Hogar</span></Link>
          <p>Productos frescos, compras simples y precios claros por kilo o unidad.</p>
          <span className="footer-motto">DEL CAMPO A TU MESA</span>
        </div>
        {!vendedor && <><div>
          <h2 className="footer-heading">Explora</h2>
          <nav className="footer-links" aria-label="Enlaces de pie de página">
            <Link to="/productos">Nuestros productos</Link>
            <Link to="/ofertas">Ofertas</Link>
            <Link to="/nosotros">Quiénes somos</Link>
            <Link to="/blog">Consejos del huerto</Link>
            <Link to="/guia-temporada">Temporada y conservación</Link>
            <Link to="/valoraciones">Opiniones de clientes</Link>
          </nav>
        </div>
        <div>
          <h2 className="footer-heading">Contacto</h2>
          <div className="footer-links">
            <a href="mailto:huertohogar@gmail.com">huertohogar@gmail.com</a>
            <span>+56 9 0000 0000</span>
            <span className="footer-note">Teléfono de demostración, no operativo.</span>
            <Link to="/contacto">Escríbenos en la web</Link>
          </div>
        </div>
        <div>
          <h2 className="footer-heading">Redes sociales</h2>
          <div className="footer-socials">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" title="Facebook; perfil de Huerto Hogar por configurar"><span className="social-mark" aria-hidden="true">f</span><span>Facebook <small>Huerto Hogar</small></span></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram; perfil de Huerto Hogar por configurar"><span className="social-mark" aria-hidden="true">◎</span><span>Instagram <small>Huerto Hogar</small></span></a>
          </div>
          <p className="footer-note">Perfiles oficiales aún no configurados.</p>
        </div></>}
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Huerto Hogar · Proyecto académico</span>
        <span>Creado por <strong>Sebastian Monsalve</strong> y <strong>Lucas Parra</strong> · Desarrollo Fullstack II</span>
      </div>
    </footer>
  </>;
}
