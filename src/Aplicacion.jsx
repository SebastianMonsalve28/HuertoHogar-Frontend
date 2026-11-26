import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider, useStore } from "./Tienda";
import Layout from "./components/Estructura";
import Home from "./pages/Inicio";
import Catalog from "./pages/Catalogo";
import Detail from "./pages/Detalle";
import Cart from "./pages/Carrito";
import { Checkout, Resultado } from "./pages/Checkout";
import Ofertas from "./pages/Ofertas";
import AccountForm from "./components/FormularioCuenta";
import Admin from "./pages/Administracion";
import MisPedidos from "./pages/MisPedidos";
import Cajas from "./pages/Cajas";
import GuiaTemporada from "./pages/GuiaTemporada";
import Valoraciones from "./pages/Valoraciones";
import { About, Blog, NotFound } from "./pages/Contenido";

function AccesoTienda({ children }) {
  const { user, userLoading } = useStore();
  if (userLoading) return <section className="container section">Verificando sesión...</section>;
  if (user?.role === "vendedor") return <Navigate to="/gestion" replace />;
  return children;
}

function AccesoGestion({ children, soloAdmin = false }) {
  const { user, userLoading } = useStore();
  if (userLoading) return <section className="container section">Verificando sesión...</section>;
  if (!user) return <Navigate to="/login" replace />;
  if (!(["admin", "vendedor"].includes(user.role))) return <Navigate to="/" replace />;
  if (soloAdmin && user.role !== "admin") return <Navigate to="/gestion" replace />;
  return children;
}

export default function App() {
  return <StoreProvider><HashRouter><Routes><Route element={<Layout />}>
    <Route index element={<AccesoTienda><Home /></AccesoTienda>} />
    <Route path="cajas" element={<AccesoTienda><Cajas /></AccesoTienda>} />
    <Route path="guia-temporada" element={<AccesoTienda><GuiaTemporada /></AccesoTienda>} />
    <Route path="valoraciones" element={<AccesoTienda><Valoraciones /></AccesoTienda>} />
    <Route path="productos" element={<AccesoTienda><Catalog /></AccesoTienda>} />
    <Route path="productos/:code" element={<AccesoTienda><Detail /></AccesoTienda>} />
    <Route path="carrito" element={<AccesoTienda><Cart /></AccesoTienda>} />
    <Route path="pedidos" element={<AccesoTienda><MisPedidos /></AccesoTienda>} />
    <Route path="checkout" element={<AccesoTienda><Checkout /></AccesoTienda>} />
    <Route path="resultado" element={<AccesoTienda><Resultado /></AccesoTienda>} />
    <Route path="mis-pedidos" element={<AccesoTienda><MisPedidos /></AccesoTienda>} />
    <Route path="ofertas" element={<AccesoTienda><Ofertas /></AccesoTienda>} />
    <Route path="nosotros" element={<AccesoTienda><About /></AccesoTienda>} />
    <Route path="blog" element={<AccesoTienda><Blog /></AccesoTienda>} />
    <Route path="blog/:id" element={<AccesoTienda><Blog /></AccesoTienda>} />
    <Route path="contacto" element={<AccesoTienda><AccountForm key="contact" mode="contact" /></AccesoTienda>} />
    <Route path="login" element={<AccesoTienda><AccountForm key="login" mode="login" /></AccesoTienda>} />
    <Route path="registro" element={<AccesoTienda><AccountForm key="register" mode="register" /></AccesoTienda>} />
    <Route path="admin" element={<AccesoGestion soloAdmin><Admin /></AccesoGestion>} />
    <Route path="gestion" element={<AccesoGestion><Admin /></AccesoGestion>} />
    <Route path="*" element={<NotFound />} />
  </Route></Routes></HashRouter></StoreProvider>;
}
