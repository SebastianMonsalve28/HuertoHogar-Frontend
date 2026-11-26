import {
  api, apiPublica, guardarToken, sesionPorCookie, cerrarSesion
} from "../src/api";

function response(status, data) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

describe("EP3 · comunicación HTTP React / API REST", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    guardarToken(null);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    guardarToken(null);
  });

  it("consulta catálogo público y usa credenciales para cookie HttpOnly", async () => {
    globalThis.fetch = jasmine.createSpy("fetch").and.returnValue(Promise.resolve(response(200, [
      { codigo: "FR001", nombre: "Manzanas" }
    ])));
    const productos = await apiPublica("/productos");
    expect(productos.length).toBe(1);
    const [ruta, opciones] = globalThis.fetch.calls.mostRecent().args;
    expect(ruta).toContain("/api/v1/productos");
    expect(opciones.credentials).toBe("include");
    expect(opciones.method).toBe("GET");
  });

  it("envía JWT en cabecera Authorization al crear un producto", async () => {
    guardarToken("jwt-academico-de-prueba");
    globalThis.fetch = jasmine.createSpy("fetch").and.returnValue(Promise.resolve(response(201, { codigo: "EP3001" })));
    const creado = await api("/productos", { method: "POST", body: { codigo: "EP3001" } });
    const [, opciones] = globalThis.fetch.calls.mostRecent().args;
    expect(creado.codigo).toBe("EP3001");
    expect(opciones.headers.Authorization).toBe("Bearer jwt-academico-de-prueba");
    expect(opciones.body).toContain("EP3001");
  });

  it("trata el error 403 como falta de permisos", async () => {
    globalThis.fetch = jasmine.createSpy("fetch").and.returnValue(Promise.resolve(response(403, { error: "Acceso denegado" })));
    let error;
    try { await api("/usuarios"); } catch (e) { error = e; }
    expect(error.status).toBe(403);
    expect(error.message).toBe("Acceso denegado");
  });

  it("renueva el token tras 401 y reintenta la petición", async () => {
    let llamada = 0;
    globalThis.fetch = jasmine.createSpy("fetch").and.callFake(async () => {
      llamada++;
      if (llamada === 1) return response(401, { error: "JWT caducado" });
      if (llamada === 2) return response(200, {
        accessToken: "jwt-renovado", user: { role: "cliente", correo: "demo@duoc.cl" }
      });
      return response(200, { datos: "ok" });
    });
    expect((await api("/pedidos")).datos).toBe("ok");
    const args = globalThis.fetch.calls.allArgs();
    expect(args.length).toBe(3);
    expect(args[1][0]).toContain("/auth/refresh");
    expect(args[2][1].headers.Authorization).toBe("Bearer jwt-renovado");
  });

  it("recupera sesión con cookie y sin guardar accessToken en localStorage", async () => {
    globalThis.fetch = jasmine.createSpy("fetch").and.returnValue(Promise.resolve(response(200, {
      accessToken: "jwt-cookie", user: { correo: "demo@duoc.cl", role: "cliente" }
    })));
    const datos = await sesionPorCookie();
    expect(datos.user.role).toBe("cliente");
    expect(localStorage.getItem("hh:token")).toBeNull();
  });

  it("cerrar sesión invalida el token de memoria", async () => {
    guardarToken("jwt-antiguo");
    globalThis.fetch = jasmine.createSpy("fetch").and.returnValues(
      Promise.resolve({ ok: true, status: 204 }),
      Promise.resolve(response(200, { ok: true }))
    );
    await cerrarSesion();
    await api("/productos");
    expect(globalThis.fetch.calls.mostRecent().args[1].headers.Authorization).toBeUndefined();
  });
});
