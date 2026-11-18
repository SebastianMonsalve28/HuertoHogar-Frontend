const BASE_URL = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8080/api/v1";
let accessToken = null;
let refreshPromise = null;

export function guardarToken(token) {
  accessToken = token || null;
}

async function ejecutar(ruta, opciones = {}, token = null) {
  const headers = { Accept: "application/json", ...(opciones.body ? { "Content-Type": "application/json" } : {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  let respuesta;
  try {
    respuesta = await fetch(BASE_URL + ruta, {
      method: opciones.method || "GET",
      credentials: "include",
      headers,
      ...(opciones.body ? { body: JSON.stringify(opciones.body) } : {}),
    });
  } catch {
    throw new Error("No se pudo conectar con el backend. Revisa que Spring Boot esté iniciado.");
  }
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}));
    const error = new Error(datos.error || datos.detail || datos.message || `Error HTTP ${respuesta.status}`);
    error.status = respuesta.status;
    throw error;
  }
  if (respuesta.status === 204) return null;
  return respuesta.json();
}

export async function sesionPorCookie() {
  if (!refreshPromise) {
    refreshPromise = ejecutar("/auth/refresh", { method: "POST" })
      .then(datos => { guardarToken(datos.accessToken); return datos; })
      .catch(error => { guardarToken(null); throw error; })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function api(ruta, opciones = {}) {
  try {
    return await ejecutar(ruta, opciones, accessToken);
  } catch (error) {
    if (error.status !== 401 || ruta.startsWith("/auth/")) throw error;
    await sesionPorCookie();
    return ejecutar(ruta, opciones, accessToken);
  }
}

export async function apiPublica(ruta, opciones = {}) {
  return ejecutar(ruta, opciones);
}

export async function cerrarSesion() {
  try { await ejecutar("/auth/logout", { method: "POST" }); }
  finally { guardarToken(null); }
}
