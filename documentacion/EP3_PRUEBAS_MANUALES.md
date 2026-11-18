# Pruebas de integración EP3 — Huerto Hogar

Ejecutar con React en http://127.0.0.1:5173 y Spring Boot en http://127.0.0.1:8080.
Registrar los resultados y pantallazos en el informe. **No se afirman pruebas ejecutadas por adelantado**.

| Caso | Acción | Resultado esperado | Evidencia sugerida |
|---|---|---|---|
| P01 | Abrir `/api/v1/productos` | HTTP 200, siete productos originales | Swagger / navegador |
| P02 | Abrir Swagger UI | Endpoints agrupados visibles | Captura Swagger |
| P03 | Registro con RUN y correo válidos | HTTP 201, cliente en MySQL | Formulario y tabla `usuario` |
| P04 | Login con contraseña incorrecta | HTTP 401, mensaje sin revelar detalles | DevTools y UI |
| P05 | Iniciar sesión con cliente y recargar | Sesión restaurada mediante cookie HttpOnly | UI antes/después |
| P06 | Acceso de cliente a `/admin` | Redirección / HTTP 403 al intentar API protegida | UI y Network |
| P07 | Admin crea producto | HTTP 201, aparece en catálogo y MySQL | Swagger + UI |
| P08 | Admin modifica producto | HTTP 200, catálogo actualizado | UI y Swagger |
| P09 | Admin elimina producto sin pedidos | HTTP 204, desaparece del catálogo | UI y Network |
| P10 | Cliente compra 2 unidades | HTTP 201, crea boleta y detalle y descuenta stock | UI + MySQL |
| P11 | Compra con stock insuficiente | HTTP 409, no cambia stock ni crea boleta | Swagger + base de datos |
| P12 | Admin asigna rol VENDEDOR | HTTP 200 y nuevo menú solo de lectura | Panel vendedor |
| P13 | Vendedor lista y abre detalle de pedidos | HTTP 200 | Panel vendedor |
| P14 | Vendedor intenta crear/editar producto | HTTP 403 en backend, formulario no visible | Swagger + panel |
| P15 | Cerrar sesión y recargar | Sesión inválida, panel privado cerrado | UI + Network |
| P16 | Verificar JWT vencido con refresh vigente | Renovación de acceso; refresh cookie rota | Network (sin exponer secreto) |

Para pruebas automatizadas del backend: `mvn test` desde `backend/`.
Para comprobar integración real, revisar los códigos HTTP, las tablas y los logs. Adaptar las pruebas de Jasmine/Karma de la EP2: fueron construidas para `localStorage` y no deben presentarse como validación automática de la EP3 sin actualizarlas.
