# Checklist EP3 + examen final — Huerto Hogar

Marca con evidencia después de probar, no solo por existir código.

| Área | Comprobación | Evidencia |
|---|---|---|
| HTML5/CSS | Inicio, catálogo, detalle, Nosotros, Blogs 1/2, Contacto, carrito y checkout; footer y enlaces | Capturas escritorio/celular |
| Diseño | Pantallas proporcionadas, tarjetas, fotos originales, video reproducible, sin desbordes | Capturas 390, 768 y 1440 px |
| Formularios | RUN, correo, contraseñas, dirección, región/comuna, datos inválidos | Capturas errores |
| React | Props, state, rutas, carrito, navegación, Bootstrap | Demostración y fuentes |
| Pruebas frontend | `npm run test:logic`, `npm test`, cobertura Karma/Jasmine | Salida real y porcentaje |
| Backend + MySQL | Aplicación Spring Boot, JPA, tablas Usuario/Categoría/Producto/Boleta/Detalle | Conexión y modelo BD |
| CRUD + Swagger | GET/POST/PUT/DELETE /api/v1/productos, operaciones por roles | Swagger con respuestas |
| Roles | Admin todo; vendedor lectura de productos/pedidos; cliente tienda/pedidos propios | 401/403 comprobados |
| JWT/sesiones | Login JWT, cookie HttpOnly refresh, F5, logout | Network y pruebas |
| Stock por kg | Compra 1,5 kg, resta stock decimal persistente, 409 por exceso | API y tabla producto antes/después |
| Miel por unidad | Se rechaza 0,5 unidad y se acepta 1 unidad | Mensaje y HTTP 400 |
| Descuentos | Antes/tachado, % ahorro, checkout, boleta histórica | Capturas manzanas FR001 y miel PO001 |
| Documentos | ERS, manual con figuras, documentación APIs e integración, cobertura | Word/Excel completados |
| GitHub | 2 enlaces públicos, commits claros, colaboración, ZIP de ambos proyectos | Enlaces, historial y ZIP |
| Defensa | Explicar HTML/CSS, React, tests, modelos, API, JWT, roles, persistencia | Ensayo de exposición |

## Prueba demostrable de kg/descuento

- Manzanas Fuji FR001: precio base $1.200/kg, rebaja 15 %, precio final $1.020/kg. Para 0,5 kg: subtotal original $600, descuento $90, total $510.
- En una base nueva con FR001 = 150 kg, tras una compra confirmada de 0,5 kg el stock debe quedar en **149,5 kg**.
- Miel PO001: precio base $5.000/unidad, rebaja 20 %, precio final $4.000/unidad. La compra de 0,5 unidad devuelve **HTTP 400**.
- En el carrito las cantidades solo se restan visualmente del stock disponible; en el backend se restan al confirmar la boleta, no antes.

## Multimedia original

Ejecuta `RESTAURAR_RECURSOS_ORIGINALES.ps1` desde Windows con internet y verifica `RECURSOS ORIGINALES: 11 de 11`. El ZIP no contiene el MP4 original por tamaño; no marques video aprobado sin probarlo.

## Ampliación de la tienda: cajas, temporadas y opiniones

- [x] Código frontend de cajas preparadas y personalizadas.
- [x] Código backend para incluir cajas en pedidos y descontar stock combinado.
- [x] Código backend de reseñas con compra verificada y control por roles.
- [x] Guía orientativa de temporada y conservación en Chile.
- [x] Pruebas de lógica de cajas con Node (pasaron durante esta preparación).
- [ ] Verificar casos de cajas con test real Maven y MySQL.
- [ ] Verificar formulario de reseñas y permisos con navegador.
- [ ] Ejecutar Jasmine/Karma, registrar reporte de cobertura e incluir capturas.
- [ ] Actualizar el manual con capturas reales de cajas, reseñas y guía.
- [ ] Confirmar que imágenes y video originales se recuperaron correctamente.
- [ ] Publicar los dos repositorios GitHub y entregar enlaces definitivos.

Las funciones se describen en `ACTUALIZACION_CAJAS_RESENAS_TEMPORADAS.md`.
