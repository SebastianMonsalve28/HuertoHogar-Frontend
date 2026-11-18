# Huerto Hogar — Cambios de diseño solicitados

Se conserva la estructura de React + Spring Boot y la lógica de venta por kilogramos/unidades del paquete anterior. Los cambios de esta versión se concentran en presentación y navegación.

## Cambios implementados

- Footer: correo `huertohogar@gmail.com`, teléfono ficticio de demostración (`+56 9 0000 0000`), nombres Sebastian Monsalve y Lucas Parra, accesos visuales a Facebook e Instagram.
- Los enlaces de las redes van a los portales generales, no a supuestas cuentas de Huerto Hogar. Hay que sustituirlos por perfiles reales cuando existan.
- Barra superior `Cultivado cerca. Elegido para ti.` eliminada en todas las pantallas.
- Franja verde de tres mensajes promocionales eliminada del inicio.
- La sección genérica de tarjetas «¿Por qué elegirnos?» se reemplazó por un bloque editorial con fotografías de productos y pasos de compra.
- Nosotros: cabecera con fotografía del huerto, historia y mensajes de marca más integrados con la tienda.
- Blog: portada de dos artículos rediseñada; cada artículo ahora tiene imagen proporcionada, texto legible, ideas útiles y artículo relacionado.
- Registro: el formulario se alinea arriba de la pantalla en vez de quedar centrado verticalmente.
- Barra de navegación: ícono 🛒 con contador de productos distintos, en reemplazo del texto «Carrito».
- Se mantiene el enfoque de precios por kg para frutas y verduras, miel por unidad, descuentos y stock validado por backend.

## Medios y enlaces

El paquete contiene imágenes locales provisionales para que la aplicación se pueda abrir. El script `RESTAURAR_RECURSOS_ORIGINALES.ps1` intenta restaurar las imágenes y el video del repositorio GitHub original al arrancar. Antes de la entrega, verifica que sean las imágenes elegidas y que el video funcione. No se incluyen fotografías de terceros obtenidas sin licencia.

El correo se incluyó a solicitud del equipo, pero no se comprobó su titularidad ni recepción. El teléfono es deliberadamente ficticio y las redes aún requieren configurar sus URLs reales.

## Verificación

- Revisión de sintaxis: 19 archivos JS/JSX, sin errores de parseo detectados.
- `npm run test:logic`: 5 pruebas de lógica aprobadas en el entorno de preparación.
- `npm test`, compilación Vite y pruebas Java/Maven/MySQL: aún pendientes de ejecutar en tu computador.
- Las capturas definitivas del manual deben tomarse después de comprobar la aplicación real en VS Code.

## Cómo ejecutar

1. Extrae el ZIP completo.
2. Abre `HuertoHogar.code-workspace` desde VS Code.
3. Ejecuta `INICIAR_TODO.bat` en la carpeta principal (desde el Explorador de Windows o PowerShell).
4. Comprueba `http://127.0.0.1:5173` y `http://127.0.0.1:8080/swagger-ui.html`.
5. Después de validar las pantallas y los datos, ejecuta las pruebas con `EJECUTAR_PRUEBAS.bat`.

Esta versión es un avance del proyecto, no una certificación de cumplimiento total de la pauta hasta completar las pruebas y evidencias pendientes.
