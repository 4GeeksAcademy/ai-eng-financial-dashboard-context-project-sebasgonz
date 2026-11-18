# Especificación: filtro de rango de fechas del dashboard principal

## Objetivo

Permitir al equipo de finanzas enfocar los datos y las visualizaciones existentes en un período concreto, con referencia al rango que realmente está disponible en el dataset.

## Alcance de producto

- Añadir dos controles de fecha en la parte superior del dashboard principal: fecha inicial y fecha final.
- Cada valor se transporta a la API con formato de fecha calendario `YYYY-MM-DD`.
- Ambos controles son opcionales. Si ambos están vacíos, se presenta el conjunto completo de datos disponible.
- Mostrar junto a los controles la fecha más antigua y más reciente disponible, presentadas a partir de las facetas de la API.
- Al seleccionar uno o ambos límites, filtrar todos los datos y elementos ya mostrados en la página principal, incluidos KPI, gráficos y la tabla de alertas de la especificación [dashboard-anomaly-alerts.md](dashboard-anomaly-alerts.md).
- Enviar solo los límites que tengan valor; conservar el otro extremo como abierto. Los límites son inclusivos, según el comportamiento actual del backend.
- La fecha inicial no puede ser posterior a la final. Si se permite limpiar cualquiera de los controles, actualizar la vista de acuerdo con el límite restante; al limpiar ambos se recuperan todos los datos.

## API y contrato observado

### Facetas

`GET /api/metrics/facets` no requiere parámetros. Devuelve un objeto `MetricsFacets` con:

- `operation_types`: tipos de operación disponibles.
- `business_types`: tipos de negocio disponibles.
- `categories`: categorías disponibles.
- `min_date` y `max_date`: fecha mínima y máxima en formato `YYYY-MM-DD`.

Los valores actuales observados en una llamada local fueron `min_date: 2025-11-01` y `max_date: 2026-10-28`; son datos dinámicos, no valores que deban codificarse en la interfaz.

### Movimientos filtrados

`GET /api/metrics` acepta opcionalmente `start_date`, `end_date`, `category` y `operation_type`. El contrato documenta fechas como formato date y el backend filtra con `create_date >= start_date` y `create_date <= end_date`. Enviar los parámetros de fecha definidos por los controles y continuar usando la respuesta filtrada como fuente de las métricas de la página.

## Criterios de aceptación

1. Al cargar la página, se consultan y muestran `min_date`/`max_date` de `/api/metrics/facets` como referencia cercana a los controles.
2. Con ambos controles vacíos, el dashboard conserva todos los movimientos disponibles y no añade límites artificiales a la consulta.
3. Al introducir solo fecha inicial o solo fecha final, se envía únicamente ese límite y las visualizaciones reflejan los movimientos a partir de / hasta esa fecha, inclusive.
4. Al introducir ambas fechas válidas, se envían ambas en `YYYY-MM-DD`, y todos los componentes existentes muestran resultados del mismo intervalo.
5. La tabla de alertas, cuando esté implementada, usa los mismos límites activos.
6. Una fecha inicial posterior a la final no debe causar una consulta contradictoria: bloquear la combinación o mostrar validación clara y no aplicar el rango inválido.
7. Si la consulta de facetas o movimientos falla, la página comunica el error conforme al patrón de interfaz existente y no presenta límites de fecha inventados.

## Validación sugerida

- Probar ambos campos vacíos, solo inicio, solo fin y rango completo.
- Verificar que cada request usa los valores `YYYY-MM-DD` y que se propagan a KPI, gráficos y alertas.
- Comparar `min_date`/`max_date` renderizados con el payload de facets.
- Cubrir rango invertido, fechas iguales y limpieza de filtros.

## Observaciones y límites

- El backend actual ya acepta `start_date` y `end_date` para `/api/metrics`, aplica límites inclusivos y expone `min_date`/`max_date` en facets.
- El frontend observado aún carga `/api/metrics` sin filtros de fecha y no muestra estas facetas; el requisito implica trabajo de interfaz.
- Los movimientos son sintéticos y las fechas disponibles cambian con la fecha del sistema. No fijar en pruebas las fechas observadas durante la exploración.
