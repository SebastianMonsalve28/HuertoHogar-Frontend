# Huerto Hogar — EP3 y Examen Final (revisión integral)

**Base visual:** rama `sebastian` del repositorio original, con su paleta verde, tipografías e identidad. Esta entrega es una carpeta independiente; no se hizo ningún cambio en GitHub.

## Inicio en Visual Studio Code (Windows)

1. **Extrae completamente** el ZIP en una carpeta nueva (no reemplaces la carpeta de la versión anterior).
2. Haz doble clic en `HuertoHogar.code-workspace` para abrir el espacio de trabajo. Confía en él únicamente si reconoces este proyecto.
3. Abre el Explorador de archivos de Windows en la carpeta principal y ejecuta `INICIAR_TODO.bat`. El archivo abrirá una ventana PowerShell para el **backend** y otra para **React**. La primera vez descargará dependencias y las imágenes/video originales (requiere internet).
4. Cuando aparezca `Started HuertoHogarApplication`, abre <http://127.0.0.1:8080/api/v1/productos>. Luego, cuando aparezca `VITE ready`, abre <http://127.0.0.1:5173>.
5. Swagger: <http://127.0.0.1:8080/swagger-ui.html>.

Si falla el inicio automático, abre terminales distintas en VS Code:

- Backend: abre terminal en carpeta **backend** y ejecuta `powershell -ExecutionPolicy Bypass -File .\INICIAR_BACKEND_LOCAL.ps1`.
- Frontend: abre terminal en carpeta **frontend** y ejecuta `npm install` (primera vez), luego `npm run dev`.

**No ejecutes `npm` dentro de `backend`** ni `mvn` dentro de `frontend`.

## Recuperar las fotos y el video originales

`INICIAR_TODO.bat` ejecuta `RESTAURAR_RECURSOS_ORIGINALES.ps1` para descargar exactamente los **10 archivos de imágenes y el MP4** de la rama `sebastian`. El MP4 no está incluido en el ZIP por tamaño. Verifica que la consola indique `RECURSOS ORIGINALES: 11 de 11`. Si no aparece, comprueba internet y ejecuta el recuperador nuevamente. Hasta entonces las imágenes incluidas son provisionales y el video puede no verse.

## Base de datos H2 para demostración, MySQL para entregar

`INICIAR_BACKEND_LOCAL.ps1` inicia Spring Boot con H2 en `backend/.local/datos` para probar sin MySQL. No publiques la carpeta `.local`, que contiene datos de la demostración y credenciales. El comando muestra en pantalla la clave local generada para `admin@duoc.cl`. Usuarios cliente se crean por el formulario Registro.

**La pauta EP3 pide una base de datos relacional MySQL, Oracle Cloud o Firebase.** Para MySQL inicia un servidor con la base `huerto_hogar`, configura las credenciales con variables de entorno y usa `backend/INICIAR_BACKEND.ps1`; comprueba la conexión y captura las evidencias antes de presentar. El backend tiene perfil MySQL en `application.yml`.

Si usas una copia vieja de H2 que tenía el stock como entero, puede requerir una migración de esquema a decimal. Para una **demo nueva sin datos que conservar**, detén Spring Boot y elimina únicamente `backend/.local/datos` para recrear la base. Nunca hagas esto con datos reales.

## Cambios de negocio

- Manzanas, naranjas, plátanos, zanahorias, espinacas y pimientos: **kg**, múltiplos de 0,25 kg, stock decimal.
- Miel: **unidad** entera.
- Los descuentos se muestran en tarjetas, carrito y checkout; el backend vuelve a calcular precios y guarda el descuento aplicado en el detalle de la boleta.
- El carrito muestra **stock disponible para agregar** restando lo que hay en el carrito. Solo al confirmar la compra se descuenta stock en el backend.
- El backend usa `BigDecimal` y bloqueo de stock; rechaza cantidades inválidas y sobreventa.
- Estética con inicio más completo, Nosotros y dos blogs proporcionados, además de carrito, login, contacto y detalle mejorados.
- Mantiene roles: admin con CRUD; vendedor puede **solo leer** productos/pedidos; cliente puede comprar y ver sus propios pedidos.

## Validar antes de entregar

### Frontend

```powershell
cd frontend
npm install
npm run build
npm run test:logic
npm test
```

### Backend

```powershell
cd backend
mvn test
```

Si Maven no está en PATH, puedes usar el `mvn.cmd` que quedó en `backend/.local/herramientas` después de ejecutar el iniciador.

Revisa `CHECKLIST_PRUEBA3_EXAMEN.md`, `documentacion/ESTADO_DE_VERIFICACION.md` y la documentación Word/Excel actualizada. Adjunta **capturas reales** de ambas bases de datos y resultados de pruebas. No se ha verificado Maven/MySQL end-to-end en este entorno; tampoco se modificó el repositorio remoto.

## Entrega

Contiene frontend React, backend Spring Boot, documentos académicos, scripts de arranque y ZIP de frontend/backend con código fuente. Debes subir ambos proyectos a **repositorios públicos separados**, con commits descriptivos, y entregar los enlaces. Antes del examen inserta capturas reales en Word y los porcentajes obtenidos de cobertura.

## Cambios posteriores: diseño del 18 de noviembre de 2026

Lee `CAMBIOS_DISENO_18_NOV_2026.md` para revisar las nuevas pantallas, el footer,
el carrito con ícono, el registro superior y el rediseño de Nosotros/Blog.
El teléfono mostrado es de ejemplo, y los enlaces sociales se deben cambiar
por los perfiles auténticos antes de publicar la tienda.

## Nuevas funcionalidades: cajas y reseñas (18-11-2026)

- Abre **Cajas** desde el menú para ver cinco opciones preparadas o armar una caja con 2 a 6 productos entre 1 y 12 kg.
- Los precios y descuentos se calculan por producto. Los kilos de las cajas también se descuentan del inventario al confirmar el pedido.
- Abre **Guía de temporada** desde el pie de página para ver productos orientativos por estación y consejos de conservación.
- Abre **Opiniones de clientes** desde el pie de página para consultar reseñas y publicar una propia. Primero debes ingresar como CLIENTE y haber confirmado al menos un pedido; una compra se valora una sola vez.
- No hay testimonios precargados ni suscripciones automáticas. El proyecto es una demostración académica sin pagos o entregas reales.
- Lee `ACTUALIZACION_CAJAS_RESENAS_TEMPORADAS.md` para ver los endpoints y pruebas de esta ampliación.

Para comprobar esta ampliación:

```powershell
cd frontend
npm install
npm run test:logic
npm test
npm run build
```

```powershell
cd backend
mvn test
```

**Advertencia:** estos comandos requieren tener las dependencias descargadas. La ejecución completa con MySQL y evidencias del examen sigue siendo necesaria antes de entregar.
