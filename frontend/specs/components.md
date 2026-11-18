# Especificación de componentes frontend — Fase 3

Este documento define responsabilidades, props conceptuales y decisiones de producto pendientes para las tres funcionalidades. Es una especificación, no una implementación: no crear componentes React, no conectarlos al árbol actual ni añadir solicitudes HTTP en esta fase.

## Convenciones y contratos

- Se conservan los nombres de transporte `snake_case` en los tipos API. Los estados de UI y modelos derivados usan `camelCase`.
- Tipos de respuesta: [`api-types.ts`](api-types.ts). Parámetros aceptados por los endpoints: [`param-types.ts`](param-types.ts). Tipos compartidos y de presentación: [`types.ts`](types.ts).
- Las props de los componentes visuales reciben datos y callbacks; el contenedor/página futuro coordinará las consultas, cancelaciones, errores y estado compartido. Este documento no prescribe la tecnología para esa capa.
- Los estados de carga, error, vacío y datos son distintos. Un error no se presenta como una respuesta vacía.
- `ISODate` es un alias TypeScript de `string`, no valida fechas en runtime. La capa de UI debe validar y serializar fechas `YYYY-MM-DD`.

## Funcionalidad 1 — Filtro de fechas del dashboard principal

### `DashboardDateRangeFilter`

**Ubicación propuesta:** `frontend/src/components/dashboard/date-range-filter.tsx`.

**Responsabilidad:** editar el intervalo activo y mostrar el rango disponible informado por facets. No consulta la API ni filtra datos por sí mismo.

**Props conceptuales:**

| Prop | Tipo | Semántica |
| --- | --- | --- |
| `value` | `DateRangeFilter` | Estado actual de UI; `startDate` y `endDate` son opcionales. |
| `facets` | `FacetsResponse \| null` | Rango disponible (`min_date`, `max_date`) y facetas observadas; `null` mientras no estén disponibles. |
| `onChange` | `(next: DateRangeFilter) => void` | Emite el estado completo cuando el usuario edita o limpia un límite. |
| `disabled` | `boolean` | Deshabilita inputs durante carga u otra condición definida por el contenedor. |
| `errorMessage` | `string \| null` | Mensaje de validación del rango, asociado al grupo de controles. |

**Decisiones resueltas:**

- Ambos límites son opcionales; vacíos significa todo el rango disponible. Se emite solo el límite con valor, sin enviar cadenas vacías ni `null` en la query.
- Los límites son inclusivos según el contrato de `/api/metrics`.
- Si `startDate > endDate`, conservar la selección visible, comunicar el error e impedir que el contenedor aplique/consulte ese rango. Fechas iguales son válidas.
- Se permite limpiar cada campo de forma independiente. Limpiar ambos restablece el conjunto completo.
- El control muestra `facets.min_date` y `facets.max_date` como referencia, no como valores iniciales obligatorios. No inventar rango cuando falla la consulta de facetas.
- Etiquetas visibles: “Fecha inicial” y “Fecha final”; indicar errores con texto y asociación accesible al campo/grupo.

### `MainDashboardPage` (contenedor existente)

**Ubicación propuesta:** responsabilidades del dashboard principal actual; no implica crear una página nueva.

**Responsabilidad:** coordinar el filtro con los datos actuales de KPIs, gráficos y alertas; asegurar que todo lo mostrado use exactamente el mismo intervalo válido. Los hijos no construyen URLs ni deciden qué datos solicitar.

**Modelo de estado conceptual:**

- `dateRange: DateRangeFilter` para estado de UI.
- Al construir parámetros de `/api/metrics` o `/api/metrics/alerts`, mapear `startDate` → `start_date` y `endDate` → `end_date`, con formato `ISODate` (`YYYY-MM-DD`). Los parámetros opcionales ausentes se omiten.
- Estado de carga/error de movimientos y facets separado o claramente atribuible; los datos de facets fallidos no se reemplazan con valores fijos.

## Funcionalidad 2 — Alertas de anomalías

### `AnomalyAlertsSection`

**Ubicación propuesta:** `frontend/src/components/dashboard/anomaly-alerts-section.tsx`.

**Responsabilidad:** agrupar el umbral, la explicación contextual y la tabla de resultados bajo los gráficos del dashboard. No solicita ni calcula anomalías.

**Props conceptuales:**

| Prop | Tipo | Semántica |
| --- | --- | --- |
| `alerts` | `AlertsResponse \| null` | Lista de `AlertEntry`; `null` mientras no hay resultado disponible, array vacío solo cuando una consulta exitosa no encontró alertas. |
| `threshold` | `number` | Umbral actual como ratio fraccional, por ejemplo `0.3` = 30%. |
| `onThresholdChange` | `(next: number) => void` | Notifica un valor validado en rango de producto. |
| `status` | `"loading" \| "error" \| "success"` | Estado inequívoco de la consulta. |
| `errorMessage` | `string \| null` | Mensaje mostrado cuando `status === "error"`. |
| `disabled` | `boolean` | Deshabilita control durante carga si así lo decide el contenedor. |

### `AnomalyThresholdControl`

Control interno de la sección; usa el concepto de [`AnomalyThresholdControl`](types.ts) para el estado del control y `AlertsParams.threshold` para el parámetro API.

- El rango de producto es `0.01`–`1.0`, inclusive; valor inicial `0.3`; step visual recomendado `0.01`.
- El valor es una fracción, no porcentaje entero: `0.3` representa 30%. No convertir a `30` al solicitar el endpoint.
- Aunque OpenAPI acepta cualquier número `>= 0` sin máximo, la UI restringe a las reglas de producto más estrictas. El backend no se asume modificado.
- Label visible “Umbral de alerta”; anunciar el valor como porcentaje para comprensión, manteniendo el ratio como valor interno.

### `AnomalyAlertsTable`

**Ubicación propuesta:** componente interno; extraer a `frontend/src/components/dashboard/anomaly-alerts-table.tsx` solo si hay reutilización real.

**Datos:** recibe `AlertEntry[]`; cada fila usa `period`, `outcome_total`, `baseline_average` e `increase_ratio` sin cambiar los nombres del contrato.

**Presentación y estados:**

- Columnas semánticas: período, egreso (`outcome_total`), baseline (`baseline_average`) e incremento.
- Mostrar `increase_ratio * 100` como porcentaje legible; los valores de dinero usan el formato monetario acordado con las métricas existentes.
- `status="success"` y array vacío muestra el mensaje: “No se detectaron anomalías para el rango y umbral seleccionados”. `loading` muestra carga; `error` comunica el fallo y no muestra estado vacío.
- Ordenar por período cronológico ascendente si el endpoint ya proporciona orden cronológico; no inferir ni recomputar orden/alertas desde la vista.
- No afirmar que `baseline_average` es el promedio móvil de exactamente tres períodos: el backend observado no cumple esa semántica. La UI presenta el valor recibido sin fabricarlo. Resolver el gap requiere decisión/cambio backend o una capa de datos aprobada fuera del alcance visual de esta fase.

### `MainDashboardPage` y parámetros de alertas

El contenedor deriva `AlertsParams` usando el `threshold` actual, `group_by: "month"` por defecto y los límites válidos compartidos. `business_type` se omite para incluir ambos grupos. Solo se muestran períodos de salida correspondientes al rango seleccionado; preservar períodos previos como contexto de cálculo requiere soporte en la capa de datos/backend, y no autoriza a mostrarlos fuera del rango.

La agrupación mensual es la decisión inicial para coincidir con los gráficos existentes. Las opciones `day` y `week` existen en la API, pero no se exponen en UI hasta que producto solicite elegir granularidad.

## Funcionalidad 3 — Comparación B2B vs B2C

### `BusinessComparisonPage`

**Ubicación propuesta:** página bajo `frontend/src/components/dashboard/` o ubicación de páginas/rutas que se acuerde cuando se implemente navegación.

**Responsabilidad:** presentar una nueva vista navegable separada del dashboard principal, con un solo filtro de fecha compartido y resultados sincronizados para B2B y B2C. No se ha identificado una convención existente de routing que deba imponerse ahora.

**Composición:**

1. `DashboardDateRangeFilter` (o el mismo contrato visual) usando facets como fuente del rango disponible.
2. Dos `BusinessIncomeSection`, una para `B2B` y otra para `B2C`.
3. Un `BusinessIncomeComparisonChart` con exactamente un total completo por grupo.

### `BusinessIncomeSection`

**Ubicación propuesta:** `frontend/src/components/dashboard/business-income-section.tsx`.

**Props conceptuales:** `summary: BusinessIncomeSummary | null`, `status: "loading" | "error" | "success"`, y `errorMessage: string | null`. `summary` es `null` mientras no exista un resultado válido; no usar un resumen vacío para representar una carga o error.

**Responsabilidad y presentación:**

- Mostrar `summary.businessType`, `summary.totalIncome` y tabla de `summary.topCategories` (hasta cinco filas), ordenada por importe descendente.
- Columnas: categoría, total de ingresos y porcentaje del ingreso completo del grupo (`percentageOfGroupIncome`). La fila usa `TopIncomeCategoryRow`; el porcentaje no viene de la API.
- El total representa todos los movimientos `income` del grupo y rango, no la suma del top cinco.
- `success` con cero ingresos muestra total `0` y un estado sin categorías; porcentaje `0` cuando el denominador es cero. No representar `NaN`/infinito.
- Un error o carga afecta/identifica el grupo correspondiente. El contenedor coordina ambos grupos y explica si el resultado global no es comparable por fallo parcial.

### `BusinessIncomeComparisonChart`

**Ubicación propuesta:** `frontend/src/components/dashboard/business-income-comparison-chart.tsx`.

**Props conceptuales:** `data: BusinessIncomeChartDatum[] | null`, `status: "loading" | "error" | "success"` compartido y `errorMessage: string | null`. En estado `success`, los datos contienen exactamente las entradas `B2B` y `B2C` del mismo rango, aunque uno o ambos totales sean cero; `null` no se convierte en cero.

**Responsabilidad:** comparar los totales completos de ingreso de ambos grupos. No solicita datos ni deriva los totales de las cinco categorías.

### Decisiones de datos para la comparación

- Las solicitudes a `/api/metrics/categories/top` se describen con `TopCategoriesParams`: `operation_type: "income"`, `limit: 5` y un `business_type` específico; se incluyen `start_date` y/o `end_date` únicamente si esos límites están seleccionados (si ambos están vacíos, se consultan todos los datos). La API responde `TopCategoriesResponse` (array de `CategoryEntry`).
- La prop `BusinessIncomeSummary` no se puede construir solo desde ese top 5: el endpoint no devuelve el total general. La fuente para total y denominador debe ser movimientos completos de la ruta por grupo (`/api/metrics/b2b` y `/api/metrics/b2c`) filtrados como income y agregados en una capa de datos aprobada, o un futuro endpoint agregado explícito. Esta especificación no decide ni implementa fetch/transformación.
- No tratar `/api/metrics/comparison` como comparación de negocios: representa comparación temporal neta y tiene otro contrato (`MetricsComparison`).
- `FacetsResponse` es fuente de las categorías/tipos y fechas disponibles; las listas observadas no deben codificarse como datos dinámicos. La funcionalidad muestra solo categorías con ingreso en el rango.
- Para reducir ambigüedad: máximo cinco categorías, ingresos únicamente, orden descendente y empate estable por nombre de categoría ascendente. Un rango vacío usa todos los datos; las fechas son inclusivas y la misma selección se aplica a ambos grupos y al gráfico.
- Si falla una de las fuentes requeridas, marcar la comparación completa como error/no comparable (no graficar un grupo como si el otro fuera cero). Si ambas consultas tienen éxito pero no hay movimientos, mostrar ambos grupos con total cero y estado vacío.

## Layout, accesibilidad y estados compartidos

- En pantallas amplias, B2B y B2C se muestran en paralelo; en pantallas estrechas se apilan en orden B2B, B2C y gráfico.
- Cada filtro tiene label visible. Errores de rango se asocian al control; errores de carga se exponen en una región anunciable (`role="status"` o equivalente para carga/éxito, `role="alert"` para error).
- Tablas usan encabezados y estructura semántica; números mantienen formatos consistentes con el dashboard. No depender solo del color para anomalías o diferencias.
- Mantener estados coherentes entre componentes que comparten rango. Loading, error, éxito vacío y éxito con datos no deben solaparse de forma ambigua.

## Matriz de alineación con los tipos de Fase 2

| Componente/flujo | Tipos vinculados | Nota |
| --- | --- | --- |
| Filtro y facets | `DateRangeFilter` de `types.ts`, `ISODate`, `FacetsResponse` | UI camelCase; se adapta a `start_date`/`end_date` de `DateRangeFilter` en `param-types.ts` (misma etiqueta, tipo distinto). |
| Alertas | `AlertsParams`, `AlertsResponse`, `AlertEntry` | Ratio de threshold permanece fraccional; respuesta es array. |
| Categorías por grupo | `TopCategoriesParams`, `TopCategoriesResponse`, `CategoryEntry` | `operation_type: "income"`, `limit: 5` y un grupo por solicitud. |
| Tablas y gráfico de comparación | `BusinessIncomeSummary`, `TopIncomeCategoryRow`, `BusinessIncomeChartDatum` | View-model derivado; requiere total completo, no top-5 sumado. |

## Fuera de alcance

- Implementar componentes, routing, diseño visual final o fetches.
- Alterar endpoints/backend para ventana móvil de anomalías o totales agregados.
- Decidir la capa definitiva de datos/estado global. Los gaps de contrato quedan explícitos para que se resuelvan antes o durante una fase de implementación aprobada.