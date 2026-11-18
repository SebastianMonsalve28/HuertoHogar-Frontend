# Huerto Hogar · ampliación: cajas, opiniones y guía de temporada

Versión de trabajo: 18 de noviembre de 2026.

## Funcionalidades incorporadas

### 1. Cajas de productos

- `GET /api/v1/cajas`: cinco cajas preparadas: Chica, Mediana, Grande, Frutas y Verduras. Las composiciones se definen en el servidor, y el precio es la suma de los productos con descuentos vigentes.
- `/cajas`: catálogo de cajas preparadas y módulo «Arma tu caja» con frutas y verduras por kilo, en pasos de 0,25 kg.
- Las cajas personalizadas requieren **2 a 6 productos diferentes** y **1 a 12 kg** en total; no se incluyen productos vendidos por unidad.
- Se pueden agregar cajas y productos sueltos al mismo carrito. El stock visible considera ambas reservas.
- `POST /api/v1/pedidos` admite `items` y `cajas`. El backend valida en una transacción el stock combinado; descuenta existencias solo cuando el pedido se confirma y guarda un resumen de las cajas.
- **No se implementan suscripciones, recurrencia, cobros o despachos reales.** Cada pedido de caja es una compra simulada independiente, claramente indicada en las pantallas.

### 2. Valoraciones y reseñas

- `/valoraciones`: formulario de dos pasos con estrellas (experiencia, calidad y variedad), un comentario de entre 15 y 800 caracteres y elección de una compra confirmada del usuario.
- Solo usuarios con rol CLIENTE pueden publicar; se comprueba en Spring Security y que la compra les pertenezca, esté confirmada y no tenga ya una valoración.
- `GET /api/v1/valoraciones` y `GET /api/v1/valoraciones/resumen` muestran reseñas reales, medias y un identificador de «compra verificada»; al principio no hay testimonios inventados.
- Solo ADMIN puede eliminar una valoración en el servidor. La información pública del autor muestra nombre y la inicial del apellido.

### 3. Guía de temporada y conservación

- `/guia-temporada` presenta una referencia orientativa de primavera, verano, otoño e invierno para Chile.
- La sección de conservación contiene recomendaciones para hojas verdes, hortalizas de raíz, manzanas, cítricos, plátanos y miel.
- La guía aclara que las temporadas varían según la zona y que el catálogo de la tienda no incluye necesariamente todos los productos mencionados.

### 4. Integración en la portada

La página principal ahora incluye cajas destacadas, el recorrido «¿Cómo funciona?», una invitación a la guía de temporada y testimonios de compradores cuando existan. Se mantienen la identidad de Huerto Hogar, fotografías originales recuperables, video, catálogo, descuentos y carrito.

## Ejemplos REST

`GET /api/v1/cajas` (público) devuelve composiciones, kilogramos, precio actual y disponibilidad.

`POST /api/v1/pedidos` (CLIENTE o ADMIN) — ejemplo de pedido combinado:

```json
{
  "nombre": "Cliente Ejemplo",
  "direccion": "Calle Principal 123",
  "region": "Región Metropolitana",
  "comuna": "Santiago",
  "entrega": "retiro",
  "items": [{"codigo":"PO001","cantidad":1}],
  "cajas": [
    {"tipo":"preparada","presetId":"CHICA"},
    {"tipo":"personalizada","productos":[
       {"codigo":"FR001","cantidad":0.5},
       {"codigo":"VR001","cantidad":0.5}
    ]}
  ]
}
```

`GET /api/v1/valoraciones` — público, lista de comentarios verificados.

`GET /api/v1/valoraciones/resumen` — público, total de opiniones y promedios.

`GET /api/v1/valoraciones/compras-disponibles` — CLIENTE con JWT, compras propias pendientes de valoración.

`POST /api/v1/valoraciones` — CLIENTE con JWT:

```json
{"boletaId":15,"experiencia":5,"calidad":4,"variedad":5,"comentario":"Productos frescos y una compra muy sencilla."}
```

`DELETE /api/v1/valoraciones/{id}` — ADMIN con JWT.

## Pruebas y evidencias

- Lógica Node: `cd frontend && npm run test:logic`, incluye tests de descuentos y reservas en cajas.
- Componentes frontend Jasmine/Karma: `cd frontend && npm test`; incluye pruebas de guía de temporada y funciones de cajas.
- Integración backend JUnit: `cd backend && mvn test`; incluye test de cajas, stock, roles y reseñas asociadas a una compra.
- Para la pauta del examen todavía se necesita **comprobar en Windows** React + Spring Boot + MySQL, ejecutar las suites completas, registrar cobertura y tomar capturas auténticas para el ERS/manual/test.
- La primera ejecución requiere dependencias en línea. No guardar credenciales reales dentro de GitHub.
