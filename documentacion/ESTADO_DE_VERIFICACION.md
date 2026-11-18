# Estado de verificación — 18 de noviembre de 2026

## Comprobado en este entorno

- ✅ Archivos React y Spring Boot reorganizados en carpetas separadas de VS Code; 19 archivos JS/JSX analizados y sin errores de sintaxis detectados.
- ✅ Las pruebas rápidas de Node pasaron: 5 pruebas Node en total, incluyendo cálculo de 0,5 kg, descuentos, unidades de miel y reconciliación de stock. **No son pruebas de integración Spring Boot.**
- ✅ Los archivos Java y pruebas de integración se actualizaron para trabajar con `BigDecimal`, precio/descuento en boleta y venta por kg/unidad.
- ✅ Documentos Word ampliados y manual/ERS renderizados para revisión de formato; Excel ampliado con hoja de productos y reglas de venta.

## Pendientes que debes comprobar en tu PC antes de declarar cumplimiento total

- ⚠️ No fue posible ejecutar `mvn test`, ni `npm install`, `npm run build`, `npm test` de Jasmine/Karma porque este entorno no dispone de Maven ni de acceso a paquetes de internet. Los resultados no se deben inventar.
- ⚠️ El perfil H2 se ha iniciado anteriormente en el equipo del usuario, pero **esta versión modificada** todavía debe probarse allí, incluyendo migración de stock a decimal.
- ⚠️ Falta verificar MySQL real o la base de datos admitida por la pauta y documentar conexión.
- ⚠️ Falta recuperar **11 de 11 recursos originales** en tu PC y probar reproducción del video; estos binarios no pudieron descargarse desde este entorno.
- ⚠️ Falta demostrar JWT, refresh y logout, las restricciones de admin/vendedor/cliente, CRUD, stock y descuentos de punta a punta, y capturar resultados Swagger.
- ⚠️ Los documentos Word todavía contienen espacios para capturas reales, fecha, integrantes finales y resultados de pruebas. Deben completarse antes de entregar.
- ⚠️ No se han publicado los repositorios frontend/backend en GitHub ni creado commits de colaboración; hacerlo con el equipo.

**Resumen:** material de implementación y documentación preparados; el 100 % de la pauta no está certificado hasta completar lo anterior.

## Ampliación: estado de verificación (18-11-2026)

- Código de cinco cajas preparadas, caja personalizada, endpoint de cajas y compra con stock combinado: IMPLEMENTADO, pendiente de compilar/ejecutar con Maven en PC.
- Sistema de reseñas vinculadas a compras verificadas, dos pasos y 3 valoraciones: IMPLEMENTADO, pendiente de ejecutar endpoints y pruebas JUnit con Maven.
- Guía de temporada y consejos de conservación en Chile: IMPLEMENTADO en frontend.
- Comprobación Node de cálculo de cajas, stock, kg/unidad y descuentos: 8 pruebas **pasaron**.
- Análisis sintáctico de 28 archivos JS/JSX: sin errores de parseo.
- CSS: sin errores de parseo.
- `npm run build`, `npm test`, `mvn test` y MySQL: **NO VERIFICADOS** en este entorno; requieren ejecutar pruebas en Windows con dependencias instaladas.
- Documentos Word/Excel actualizados con secciones de cajas, valoración y guía; capturas reales de la versión nueva pendientes.
