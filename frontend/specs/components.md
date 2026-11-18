# Especificación de componentes frontend

Este documento define una propuesta de componentes y responsabilidades para las tres funcionalidades. Es diseño, no implementación: no crear componentes React, no añadir imports al árbol actual y no conectar llamadas HTTP en esta fase.

## Convenciones

- Mantener el dashboard principal existente y añadir la nueva vista comparativa como una página accesible desde navegación.
- Mantener componentes específicos del dashboard en `frontend/src/components/dashboard/` y reutilizar componentes genéricos de `frontend/src/components/ui/` cuando existan.
- Las interfaces de contrato y view-models se describen en [`types.ts`](types.ts). Los campos API conservan snake_case; los modelos derivados de presentación usan camelCase.
- Las responsabilidades de solicitud, loading/error y estado de filtros pertenecen a la página o a una capa de datos acordada posteriormente; las piezas visuales reciben datos y callbacks por props. Este documento no prescribe ni implementa el mecanismo de fetch.
- Los diseños deben prever estados loading, error, vacío y datos, y usar etiquetas accesibles para los controles.

## Dashboard principal

### `DateRangeFilter`

**Ubicación propuesta:** `components/dashboard/date-range-filter.tsx`

**Responsabilidad:** presentar inputs de fecha inicial/final y el rango disponible `min_date`–`max_date` recibido desde facets. Emitir cambios de filtro al contenedor sin hacer solicitudes de red.

**Datos/props conceptuales:**

- `value: DateRangeFilter`
- `minDate: ISODate`, `maxDate: ISODate`
- `onChange(next: DateRangeFilter): void`
- estado deshabilitado o indicación de error, si el contenedor lo requiere.

**Comportamiento requerido:** permitir límites opcionales; fechas en formato `YYYY-MM-DD`; impedir o comunicar rango invertido; permitir limpiar los campos; mostrar rango válido del dataset próximo a los inputs. La validación de formato de tipo string requiere validación runtime en la UI y no la garantiza el tipo TS.

### `AnomalyAlertsSection`

**Ubicación propuesta:** `components/dashboard/anomaly-alerts-section.tsx`

**Responsabilidad:** agrupar control de umbral, título y tabla/estado vacío de las alertas debajo de los gráficos.

**Datos/props conceptuales:**

- `alerts: MetricsAlert[]`
- `threshold: number`, `onThresholdChange(value: number): void`
- estados `loading`, `error` y texto de error presentacional.

**Comportamiento requerido:** control numérico `0.01–1.0`, inicial `0.3`; tabla persistente con período, `outcome_total`, `baseline_average` e `increase_ratio * 100`; estado vacío explícito cuando la lista sea válida y vacía; distinguirlo de error. `baseline_average` en la API actual no cumple todavía el promedio de los tres períodos, como se detalla en [dashboard-anomaly-alerts.md](dashboard-anomaly-alerts.md).

### `AnomalyAlertsTable`

**Ubicación propuesta:** componente interno de la sección o `components/dashboard/anomaly-alerts-table.tsx` si se justifica reutilización.

**Responsabilidad:** representar cada alerta y dar encabezados accesibles para las cuatro columnas. No recalcular o inferir el baseline desde otras filas de respuesta si la API no soporta la semántica requerida.

## Página comparativa

### `BusinessComparisonPage`

**Ubicación propuesta:** `components/dashboard/business-comparison-page.tsx` o ruta de página del frontend cuando exista una convención de routing.

**Responsabilidad:** componer el filtro de fechas, ambas secciones por negocio y el gráfico, y mantenerlos en el mismo estado de fecha/loading/error.

**Contenido:**

1. `DateRangeFilter` compartido (o variante reutilizable), con facets como fuente de rango disponible.
2. Dos `BusinessIncomeSection`, una para B2B y otra para B2C.
3. Un `BusinessIncomeComparisonChart` debajo de las secciones.

No se ha encontrado una biblioteca de routing ni navegación multi-página en el `App.tsx` actual; seleccionar la integración de navegación/ruta durante una fase de diseño/implementación posterior, sin introducirla en estos entregables.

### `BusinessIncomeSection`

**Ubicación propuesta:** `components/dashboard/business-income-section.tsx`

**Responsabilidad:** presentar el nombre del grupo, el total completo de ingresos y la tabla de hasta cinco categorías.

**Datos/props conceptuales:** `summary: BusinessIncomeSummary` más estado y error aplicable al grupo. La fila incluye nombre de categoría, total y porcentaje del total completo del grupo. No mostrar la suma top-5 como total del grupo.

### `BusinessIncomeComparisonChart`

**Ubicación propuesta:** `components/dashboard/business-income-comparison-chart.tsx`

**Responsabilidad:** renderizar un único gráfico de comparación con exactamente los totales de income B2B y B2C para las fechas seleccionadas. Recibe `BusinessIncomeChartDatum[]`; no realiza fetch ni agrega datos por sí mismo.

## Relación de responsabilidades y datos

| Componente | Datos principales | No debe hacer |
| --- | --- | --- |
| `DateRangeFilter` | `DateRangeFilter`, `min_date`, `max_date` | Solicitar API o decidir cómo filtrar movimientos |
| `AnomalyAlertsSection` / tabla | `MetricsAlert[]`, ratio del threshold | Disfrazar error como estado vacío; asumir baseline de tres en respuesta actual |
| `BusinessIncomeSection` | `BusinessIncomeSummary` | Calcular porcentajes usando solo top 5 |
| `BusinessIncomeComparisonChart` | Dos totales completos | Usar `/api/metrics/comparison` como si fueran ingresos B2B/B2C |
| Páginas/contenedores | estados y datos para todos los hijos | Cambiar contrato de API sin decisión separada |

## Accesibilidad y layout

- Asociar cada input con label visible (“Fecha inicial”, “Fecha final”, “Umbral de alerta”).
- Informar errores de rango y de carga de manera perceptible y asociada al control o región relevante.
- En desktop, las dos secciones B2B/B2C aparecen en paralelo; en viewports estrechos se apilan, preservando el orden B2B, B2C y luego gráfico.
- La tabla de alertas y las tablas de categorías conservan encabezados semánticos y estados vacíos comprensibles.
