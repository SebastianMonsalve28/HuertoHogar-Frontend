# Inventario de endpoints — API Huerto Hogar v1

Base: `http://127.0.0.1:8080/api/v1`
Documentación interactiva: `/swagger-ui.html`; JSON Swagger: `/v3/api-docs`.

| Método | Endpoint | Autenticación / rol | Función |
|---|---|---|---|
| POST | `/auth/registro` | Público | Crea CLIENTE, devuelve JWT y cookie refresh |
| POST | `/auth/login` | Público | Comprueba contraseña BCrypt y devuelve JWT |
| POST | `/auth/refresh` | Cookie HttpOnly | Rota refresh, devuelve nuevo JWT |
| POST | `/auth/logout` | Cookie HttpOnly | Invalida refresh |
| GET | `/auth/me` | Token válido | Información de la cuenta |
| GET | `/categorias` | Público | Lista categorías |
| GET | `/productos` | Público | Lista productos |
| GET | `/productos/{codigo}` | Público | Detalle producto |
| POST | `/productos` | ADMIN | Crea producto |
| PUT | `/productos/{codigo}` | ADMIN | Edita producto |
| DELETE | `/productos/{codigo}` | ADMIN | Borra producto sin boletas asociadas |
| POST | `/pedidos` | CLIENTE / ADMIN | Registra boleta; valida stock y total |
| GET | `/pedidos` | Autenticado | Cliente: su historial; vendedor/admin: todos |
| GET | `/pedidos/{id}` | Autenticado | Detalle propio o detalle de staff |
| GET | `/usuarios` | ADMIN | Lista usuarios sin contraseñas |
| PATCH | `/usuarios/{id}/rol` | ADMIN | Actualiza rol (CLIENTE, VENDEDOR, ADMIN) |
| DELETE | `/usuarios/{id}` | ADMIN | Elimina usuario sin registros relacionados |

## Códigos relevantes

- `200 OK`: lectura, actualización y login.
- `201 Created`: registro, creación de producto y pedido.
- `204 No Content`: eliminación o cierre de sesión.
- `400 Bad Request`: campos inválidos / reglas de negocio.
- `401 Unauthorized`: falta autenticación / JWT ausente o inválido.
- `403 Forbidden`: usuario autenticado sin permiso.
- `404 Not Found`: recurso inexistente.
- `409 Conflict`: duplicados, stock insuficiente o recurso relacionado.

## Flujo comprobable

1. El cliente consulta `GET /productos` desde React.
2. Se registra por `POST /auth/registro` y recibe JWT corto + cookie `HttpOnly`.
3. Envía `POST /pedidos` con `Authorization: Bearer TOKEN`, dirección y productos.
4. Spring Boot consulta MySQL, bloquea productos para validar stock, calcula precios y crea Boleta y DetalleBoleta dentro de una transacción.
5. La respuesta muestra `201`, número, total y detalle. React actualiza catálogo y vacía el carrito.
6. Al recargar, React solicita `POST /auth/refresh` con la cookie y restaura la sesión sin guardar el JWT en `localStorage`.
7. El administrador consulta `GET /pedidos`, el vendedor consulta sin editar y el cliente ve solo sus boletas.

Las evidencias deben obtenerse de ejecuciones reales; no se incluyen capturas ficticias.

## Funciones nuevas del 18 de noviembre de 2026

| Método | Endpoint | Rol | Descripción |
|---|---|---|---|
| GET | `/api/v1/cajas` | Público | Cajas preparadas y disponibilidad calculada |
| POST | `/api/v1/pedidos` | CLIENTE/ADMIN | Acepta también `cajas[]` preparadas/personalizadas |
| GET | `/api/v1/valoraciones` | Público | Reseñas verificadas, sin datos ficticios |
| GET | `/api/v1/valoraciones/resumen` | Público | Contador y medias de tres notas |
| GET | `/api/v1/valoraciones/compras-disponibles` | CLIENTE | Boletas confirmadas del usuario aún sin valorar |
| POST | `/api/v1/valoraciones` | CLIENTE | Estrellas de 1–5 y comentario de 15–800 caracteres |
| DELETE | `/api/v1/valoraciones/{id}` | ADMIN | Eliminación de reseña |

Ver ejemplos completos en `../ACTUALIZACION_CAJAS_RESENAS_TEMPORADAS.md`.
