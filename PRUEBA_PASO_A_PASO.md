# Validación guiada — Huerto Hogar

Este documento describe **pruebas que debes ejecutar en tu PC**; no afirma que las pruebas de navegador o de MySQL ya estén aprobadas.

## Inicio de la aplicación

1. Extraer todo el ZIP y abrir `HuertoHogar.code-workspace` en VS Code.
2. Ejecutar `INICIAR_TODO.bat` desde el Explorador de Windows; no cerrar las dos terminales.
3. Esperar que backend indique `Started HuertoHogarApplication` y frontend `VITE ready`.
4. Abrir <http://127.0.0.1:5173>, y Swagger en <http://127.0.0.1:8080/swagger-ui.html>.
5. Verificar en la terminal que las 10 imágenes y el video original se hayan recuperado (11/11); si no, repetir el script con conexión a internet.

## Caja preparada y personalizada

1. Ir al menú **Cajas**, comprobar que aparecen las 5 preparadas.
2. Abrir detalles de Caja Chica, registrar la composición y el precio.
3. Agregarla al carrito y verificar el resumen de caja y la reducción de disponibilidad de sus productos.
4. Volver a Cajas y armar una personalizada con 0,5 kg de manzanas y 0,5 kg de zanahorias.
5. Intentar agregar una caja que supera el stock; debe impedirse.
6. Confirmar un pedido con ambas cajas; el backend debe aplicar los descuentos vigentes y descontar el stock una sola vez.
7. Consultar **Mis pedidos** y verificar que se guarden los nombres y composiciones de las cajas.

## Reseñas verificadas

1. Antes de comprar, entrar en **Opiniones**: debe indicar que aún no hay compras valorables.
2. Con una cuenta CLIENTE que acaba de confirmar un pedido, entrar a **Opiniones de clientes** desde el pie de página.
3. Seleccionar el número de pedido y evaluar experiencia, calidad y variedad con estrellas.
4. Completar un comentario de al menos 15 caracteres y publicar.
5. Confirmar que la reseña aparece con «Compra verificada» y que esa compra ya no aparece en la lista para valorar de nuevo.
6. Ingresar con otra cuenta sin ese pedido e intentar usar su número en el endpoint: debe responder 403.
7. Verificar que las opiniones públicas sean reales y que no existan reseñas precargadas.

## Guía de temporada

1. Abrir **Guía de temporada y conservación** desde el pie de página.
2. Comprobar los filtros de primavera, verano, otoño e invierno y leer los consejos para conservar productos frescos.
3. Repetir las pruebas con vista móvil (375 px), tablet (768 px) y escritorio.

## Automatización

En una terminal de la carpeta `frontend`:

```powershell
npm install
npm run test:logic
npm test
npm run build
```

En una terminal de la carpeta `backend`:

```powershell
mvn test
```

Tomar capturas **reales** de pruebas, cobertura, Swagger, administración, compra y conexión MySQL. La ejecución rápida con H2 es para probar sin configurar MySQL, no sustituye la comprobación del perfil MySQL para la evaluación.

## Seguridad y entrega

No publicar `.local`, `node_modules`, `target`, contraseñas, cookies o JWT. Subir frontend y backend a repositorios públicos separados con commits reales y explicables. El proyecto no tiene suscripciones ni pagos/despachos reales.
