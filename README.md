
# 🌱 Huerto Hogar

## Desarrollo Fullstack II — DUOC UC

Proyecto académico desarrollado por:

- Sebastian Monsalve
- Lucas Parra

**Tecnologías:** React, Vite, JavaScript, Bootstrap, Java, Spring Boot, Spring Security, MySQL, Docker, JWT, Swagger y Jasmine/Karma.

## Descripción

Huerto Hogar es una aplicación web de comercio electrónico enfocada en frutas, verduras y productos naturales.

Permite consultar un catálogo, realizar compras de demostración, personalizar cajas, gestionar pedidos y administrar productos mediante una API REST.

El sistema se desarrolla como parte de la Prueba 3 y el Examen Final de Desarrollo Fullstack II.

## Estructura del proyecto

```text
Tienda_Huerto_Hogar/
├── frontend/
├── backend/
├── documentacion/
├── INICIAR_TODO.bat
├── INICIAR_TODO_DOCKER.ps1
├── .gitignore
└── README.md
```

El frontend, backend y documentación están integrados en un único repositorio GitHub.

## Funcionalidades del frontend

- Catálogo de 15 productos.
- Fotografías de frutas, verduras y productos naturales.
- Búsqueda y filtros por categorías.
- Venta por kilogramo o por unidad según el producto.
- Carrito de compras.
- Descuentos y ofertas.
- Validación de cantidades y formularios.
- Registro e inicio de sesión.
- Cajas preparadas de frutas y verduras.
- Cajas personalizadas.
- Guía de productos de temporada.
- Consejos de conservación.
- Valoraciones y comentarios de clientes.
- Video de portada con reproducción automática en bucle.
- Diseño adaptable a diferentes pantallas.

## Funcionalidades del backend

- API REST con Spring Boot.
- Persistencia de datos mediante JPA.
- Base de datos MySQL.
- Operaciones CRUD.
- Autenticación JWT.
- Spring Security.
- Control de acceso por roles.
- Registro y consulta de pedidos.
- Validación de stock.
- Cálculo de precios y descuentos.
- Gestión de cajas y reseñas.
- Documentación de API con Swagger.

## Roles

**Administrador:** acceso a funciones de administración.

**Vendedor:** acceso autorizado a consultas de productos y pedidos.

**Cliente:** acceso a la tienda y operaciones de compra.

Los permisos efectivos deben comprobarse mediante pruebas de integración.

## Requisitos para ejecutar

- Windows 10 u 11.
- Node.js compatible con Vite.
- Java JDK 17 o superior.
- Apache Maven.
- Docker Desktop con WSL 2.
- Visual Studio Code.

## Inicio automático

1. Abrir Docker Desktop o permitir que el iniciador lo abra.
2. Configurar `backend/.env` con las contraseñas de MySQL.
3. Ejecutar `INICIAR_TODO.bat`.
4. Crear la contraseña del administrador durante la primera ejecución.
5. Comprobar que Spring Boot y React se inicien correctamente.

El iniciador utiliza Docker Compose y abre la tienda una vez que React y la API respondan.

### Direcciones locales

Frontend:

http://127.0.0.1:5173

Backend:

http://127.0.0.1:8080

Swagger:

http://127.0.0.1:8080/swagger-ui.html

## Seguridad

El archivo `backend/.env` contiene configuración privada y no debe publicarse.

Las contraseñas no deben incorporarse al código fuente ni a GitHub.

La carpeta `backend/.local` contiene configuraciones generadas para desarrollo local y también debe permanecer excluida del repositorio.

## Prueba 3 — Requisitos

La evaluación contempla:

- Backend y base de datos.
- API REST y operaciones CRUD.
- Documentación con Swagger.
- Integración React / Spring Boot.
- Autenticación mediante JWT.
- Gestión de sesiones.
- Restricciones de acceso según roles.

## Examen Final — Requisitos

La evaluación considera:

- Estructura HTML5 y estilos CSS.
- Formularios y validaciones.
- Control de versiones con GitHub.
- Componentes React y diseño responsivo.
- Pruebas Jasmine y Karma.
- Backend con lógica de negocio.
- Persistencia en base de datos.
- Integración mediante API REST.
- Autenticación y autorización.
- Documentación técnica.
- Presentación y defensa del proyecto.

## Pruebas

### Pruebas del frontend

Desde la carpeta `frontend`:

```powershell
npm install
npm run test:logic
npm test
npm run build
```

### Pruebas del backend

Desde la carpeta `backend`, con Maven disponible:

```powershell
mvn test
```

### Pruebas de integración

Comprobar manualmente:

- Conexión entre React y Spring Boot.
- Registro e inicio de sesión.
- Acceso según roles.
- Operaciones CRUD.
- Compra de productos por kg y unidad.
- Cálculo de descuentos.
- Actualización de stock al confirmar pedidos.
- Compra de cajas preparadas y personalizadas.
- Envío y visualización de reseñas.
- Persistencia real en MySQL.

La cobertura y resultados finales deben registrarse con evidencias reales.

## Documentación del examen

La carpeta `documentacion` contiene los entregables académicos:

- Especificación de Requisitos de Software (ERS).
- Manual de usuario.
- Documentación de APIs.
- Documentación de integración.
- Informe de testing y cobertura.
- Material de apoyo para la defensa.

Los documentos deben incorporar las correcciones realizadas durante el semestre.

## Repositorio GitHub

Repositorio:

https://github.com/SebastianMonsalve28/tienda_HUERTO_HOGAR

Rama de desarrollo:

`sebastian`

Frontend:

https://github.com/SebastianMonsalve28/tienda_HUERTO_HOGAR/tree/sebastian/frontend

Backend:

https://github.com/SebastianMonsalve28/tienda_HUERTO_HOGAR/tree/sebastian/backend

## Estado de verificación

Este README documenta el diseño y las funciones previstas del proyecto.

Antes de la entrega es necesario comprobar la ejecución completa en Windows, el funcionamiento de MySQL, las pruebas automatizadas, los permisos y las evidencias de cobertura.

El proyecto corresponde a una demostración académica. No procesa pagos reales ni garantiza servicios de despacho.
