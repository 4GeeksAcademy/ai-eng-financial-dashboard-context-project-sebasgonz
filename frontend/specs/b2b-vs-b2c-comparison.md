# Especificación: vista comparativa B2B vs B2C

## Objetivo

Añadir una página del dashboard para comparar ingresos y categorías principales de las líneas de negocio B2B y B2C dentro de un rango temporal seleccionable.

## Requisitos de producto

- Crear una nueva página de comparación accesible desde la navegación del dashboard, manteniendo el dashboard principal existente.
- Mostrar dos secciones paralelas: B2B y B2C.
- Cada sección presenta una tabla de hasta cinco categorías de ingreso, en orden descendente por total. Columnas: nombre de categoría, total de ingresos y porcentaje sobre el total de ingresos de ese grupo.
- Mostrar además el total de ingresos de cada grupo. El porcentaje por categoría se calcula como `category total / all income total for that business type in the selected range * 100`; si el total del grupo es cero, mostrar `0%` o un indicador equivalente sin dividir entre cero.
- Bajo las dos secciones, presentar un único gráfico que compare visualmente el total de ingresos de B2B y B2C para el mismo rango.
- Proveer filtro opcional de inicio y fin, formato `YYYY-MM-DD`; vacío en ambos representa todos los datos disponibles. Los límites no deben contradecirse y se aplican inclusivamente.
- Obtener las categorías/tipos disponibles desde `GET /api/metrics/facets`, en particular las categorías y tipos de negocio. No codificar las facetas disponibles como fuente de verdad. En el subconjunto de ingresos, mostrar solo las categorías que tengan datos.
- Aplicar cambios de rango a ambas tablas, totales y al gráfico; estados de carga, error y ausencia de resultados deben ser coherentes para ambos grupos.

## API y contrato observado

### Facetas

`GET /api/metrics/facets` no requiere parámetros y devuelve `business_types`, `categories`, `operation_types`, `min_date` y `max_date`. En la sesión local se observaron los tipos `B2B`, `B2C` y categorías `administrative`, `operational`, `others`, `sales`, `suppliers`; los datos/fechas son dinámicos y no deben fijarse en el código.

### Top categorías por grupo

`GET /api/metrics/categories/top` acepta:

- `operation_type` (`income` o `outcome`; default actual `outcome`).
- `limit` entero de 1 a 20; default `5`.
- `start_date` y `end_date` opcionales en formato date.
- `business_type` opcional `B2B` o `B2C`.

Para esta vista solicitar por grupo `operation_type=income`, `limit=5`, `business_type=B2B` o `B2C`, y los límites de fecha activos. Cada objeto de respuesta incluye `category`, `operation_type` y `total_amount`, y los resultados se ordenan en orden descendente. La endpoint devuelve solo categorías con movimientos; puede devolver menos de cinco.

### Totales para el gráfico y denominador de porcentajes

La endpoint de top categorías no devuelve el total general de income del grupo cuando `limit=5`, así que no se debe usar la suma de las cinco filas como denominador ni como total del gráfico.

Una fuente disponible es `GET /api/metrics` con `operation_type=income`, fechas activas y el grupo filtrado mediante `business_type` no es aceptado por esa ruta. Las rutas `/api/metrics/b2b` y `/api/metrics/b2c` aceptan fechas y tipo de operación, y pueden servir para obtener movimientos completos por grupo y agregarlos en el cliente. El endpoint `/api/metrics/comparison` no es sustituto del gráfico: exige ambas fechas y compara neto del período contra el período anterior, no ingresos B2B contra B2C.

La API observada no tiene un endpoint único que devuelva, para ambos grupos, ingreso total y porcentaje de categoría. La implementación debe usar respuestas completas por grupo o acordar/extender un contrato agregado que provea explícitamente el total de income de cada grupo. Mantener consistentes categorías, porcentajes, total y gráfico para el mismo rango.

## Criterios de aceptación

1. Hay una página distinta y navegable desde el dashboard con secciones B2B y B2C simultáneas.
2. Ambas tablas muestran hasta cinco categorías de income ordenadas descendentemente, con total de categoría y porcentaje calculado contra el total completo de income de su propio grupo.
3. El total mostrado por grupo representa todo el income del grupo en el rango, no solo la suma del top cinco.
4. El gráfico único compara los dos totales y se actualiza junto con ambas tablas al cambiar fechas.
5. Los requests usan `operation_type=income`, `limit=5`, el `business_type` correspondiente y solo los límites no vacíos en formato `YYYY-MM-DD`.
6. Las categorías y tipos se conocen consultando facets; no se asume una lista estática. Facets también determina y muestra el rango global disponible junto a los filtros.
7. Sin fechas, se incluyen todos los datos disponibles; con un límite o ambos, el filtro se aplica inclusive a ambas líneas de negocio.
8. Rango inválido, respuesta vacía y error de API se tratan claramente. Ningún cálculo produce `NaN` o división entre cero.

## Validación sugerida

- Usar datos de prueba distintos para B2B y B2C y más de cinco categorías para demostrar orden y corte del top cinco.
- Verificar el denominador con un grupo cuyo total de ingresos sea mayor que la suma de sus cinco primeras categorías.
- Comprobar totales y gráfico con ambos grupos, filtros parciales, rango completo y ningún dato.
- Confirmar categorías/tipos y fechas de referencia contra el payload de facets.

## Evidencia de exploración y límites

En Swagger y llamadas locales:

- `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B` y la variante B2C respondieron HTTP 200, con categorías `sales` y `others` para el dataset observado.
- `GET /api/metrics/comparison` requiere `start_date` y `end_date`; su esquema es `current_period`, `previous_period`, `delta_abs`, `delta_pct`, y la implementación calcula neto, no total de ingresos paralelo por B2B/B2C.
- `/api/metrics/categories/top` no ofrece por sí solo el total global de ingresos por grupo ni porcentaje de cada categoría; esos valores necesitan agregación adicional o ampliación del contrato.
