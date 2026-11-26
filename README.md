# Huerto Hogar - Frontend

## Desarrollo Fullstack II - DUOC UC

### Integrantes

- Sebastian Monsalve
- Lucas Parra

## Descripción del proyecto

Huerto Hogar es una aplicación web de comercio electrónico dedicada a la venta de frutas, verduras y productos naturales.

La plataforma permite explorar productos, realizar compras de demostración, personalizar cajas, consultar ofertas, gestionar pedidos y administrar la tienda según los permisos de cada usuario.

Proyecto desarrollado para el Examen Final Transversal de Desarrollo Fullstack II (DSY1104).

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- React 19
- Vite
- Bootstrap 5
- React Router
- Jasmine
- Karma
- Testing Library
- Git y GitHub

## Funcionalidades principales

- Catálogo de 15 productos.
- Búsqueda y filtros por categorías.
- Compra de productos por kilogramo o unidad.
- Carrito de compras.
- Ofertas y descuentos.
- Cálculo y desglose del IVA del 19%.
- Registro e inicio de sesión.
- Autenticación mediante JWT.
- Validación de formularios.
- Cajas preparadas de frutas y verduras.
- Creación de cajas personalizadas.
- Guía de productos de temporada.
- Consejos de conservación.
- Valoraciones y comentarios.
- Historial de pedidos.
- Panel de administración.
- Control de acceso según roles.
- Video de portada con reproducción automática.
- Diseño responsivo.

## Roles de usuario

| Rol | Funcionalidades |
|---|---|
| Administrador | Administración de productos, usuarios y pedidos. |
| Vendedor | Consulta de productos, pedidos y sus detalles. |
| Cliente | Exploración del catálogo, compras, cajas y valoraciones. |

Los permisos se controlan tanto en el frontend como en el backend.

## Arquitectura del sistema

El proyecto está dividido en dos repositorios independientes que se comunican mediante una API REST.

```text
Frontend React
      |
      | HTTP / JSON / JWT
      |
Backend Spring Boot
      |
      | JPA / Hibernate
      |
Base de datos MySQL
```

## Repositorios GitHub

### Frontend

https://github.com/SebastianMonsalve28/HuertoHogar-Frontend

### Backend

https://github.com/SebastianMonsalve28/HuertoHogar-Backend

Ambos repositorios son públicos y corresponden al mismo proyecto académico.

## Estructura del frontend

```text
HuertoHogar-Frontend/
├── public/
│   ├── img/
│   └── video/
├── src/
│   ├── components/
│   ├── pages/
│   ├── api.js
│   ├── carrito.js
│   ├── principal.jsx
│   ├── styles.css
│   └── validaciones.js
├── tests/
├── documentacion/
├── .env.example
├── .gitignore
├── index.html
├── karma.conf.cjs
├── karma.ep3.conf.cjs
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Requisitos de instalación

- Node.js 22.12 o superior de una versión compatible con Vite.
- NPM.
- Git.
- Visual Studio Code.
- Google Chrome o Chromium para las pruebas.
- Backend de Huerto Hogar en ejecución.

Para ejecutar el sistema completo también se requiere:

- Java JDK 17 o superior.
- Apache Maven.
- Docker Desktop.
- MySQL mediante Docker Compose.

## Instalación y ejecución

### 1. Clonar el repositorio

```powershell
git clone https://github.com/SebastianMonsalve28/HuertoHogar-Frontend.git
cd HuertoHogar-Frontend
```

### 2. Instalar las dependencias

```powershell
npm ci
```

### 3. Configurar la conexión con el backend

Crear el archivo de configuración:

```powershell
Copy-Item .env.example .env
```

El archivo debe contener:

```env
VITE_API_URL=http://127.0.0.1:18082/api/v1
```

### 4. Iniciar el backend

Clonar el repositorio independiente del backend y seguir las instrucciones de su README.

https://github.com/SebastianMonsalve28/HuertoHogar-Backend

El backend debe estar en ejecución para utilizar las funcionalidades que requieren acceso a la API y a MySQL.

### 5. Iniciar el frontend

```powershell
npm run dev
```

Abrir la siguiente dirección en el navegador:

http://127.0.0.1:15173

## Inicio automático del proyecto completo

El ZIP completo de Huerto Hogar incluye los archivos necesarios para iniciar el frontend, el backend y la base de datos.

La estructura debe ser:

```text
HUERTO_HOGAR/
├── frontend/
├── backend/
├── INICIAR_TODO.bat
└── INICIAR_TODO_DOCKER.ps1
```

Desde la carpeta principal ejecutar:

```powershell
.\INICIAR_TODO.bat
```

Configurar las contraseñas solicitadas durante el inicio.

Los scripts de inicio se encuentran en el ZIP completo de entrega, no en este repositorio independiente.

## Puertos del sistema

| Servicio | Dirección |
|---|---|
| Frontend | http://127.0.0.1:15173 |
| Backend | http://127.0.0.1:18082 |
| API REST | http://127.0.0.1:18082/api/v1 |
| Swagger | http://127.0.0.1:18082/swagger-ui.html |
| MySQL | 127.0.0.1:13317 |

## Pruebas automatizadas

El frontend utiliza Jasmine y Karma para realizar pruebas unitarias y funcionales.

Las pruebas incluyen:

- Validación de formularios.
- Registro e inicio de sesión.
- Carrito de compras.
- Cálculo de precios.
- Descuentos e impuestos.
- Gestión de cantidades.
- Cajas preparadas y personalizadas.
- Permisos de usuarios.
- Administración de productos.
- Gestión de pedidos.
- Valoraciones.
- Manejo de errores de la API.

### Ejecutar pruebas del frontend

```powershell
npm test
```

### Ejecutar pruebas de lógica

```powershell
npm run test:logic
```

### Ejecutar todas las pruebas

```powershell
npm run test:all
```

## Cobertura de código

El proyecto tiene configurado un mínimo del 90% de cobertura en las cuatro métricas.

Último resultado registrado de la versión V3:

| Métrica | Cobertura | Objetivo |
|---|---:|---:|
| Statements | 98.55% | 90% |
| Branches | 94.21% | 90% |
| Functions | 98.71% | 90% |
| Lines | 99.85% | 90% |

### Estado de las pruebas V3

- Total de pruebas: 129.
- Pruebas aprobadas: 120.
- Pruebas fallidas: 9.

Se cumple el objetivo de cobertura, pero quedan pruebas pendientes de corrección antes de la validación definitiva.

### Consultar el informe de cobertura

Después de ejecutar las pruebas:

```powershell
Start-Process ".\coverage\ep3\html\index.html"
```

También se generan los siguientes archivos:

- coverage/ep3/coverage-summary.json
- coverage/ep3/coverage-final.json

## Compilación del proyecto

Para generar la versión compilada:

```powershell
npm run build
```

Los archivos compilados se generan en la carpeta dist.

## Seguridad

- Autenticación mediante JWT.
- Control de acceso según roles.
- Protección de rutas privadas.
- Validación de formularios.
- Manejo de sesiones.
- Comunicación con la API REST.
- Configuración mediante variables de entorno.

Las contraseñas, secretos JWT y archivos de configuración privados no deben publicarse en GitHub.

## Control de versiones

El desarrollo del proyecto se realiza utilizando Git y GitHub.

Se utilizan:

- Ramas de desarrollo.
- Commits descriptivos.
- Pull Requests.
- Integración de cambios en la rama main.
- Historial de contribuciones de los integrantes.

## Documentación

La documentación académica del proyecto contempla:

- Especificación de Requisitos de Software (ERS).
- Manual de usuario.
- Informe de pruebas y cobertura.
- Documentación de APIs REST.
- Documentación de integración entre frontend y backend.

## Contexto académico

Proyecto desarrollado para la asignatura Desarrollo Fullstack II de DUOC UC.

Huerto Hogar corresponde a una demostración académica y no realiza cobros reales.

## Desarrolladores

- Sebastian Monsalve
- Lucas Parra

2026 - Huerto Hogar
