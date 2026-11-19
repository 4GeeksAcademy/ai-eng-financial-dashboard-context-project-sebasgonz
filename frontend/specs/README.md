# Especificaciones frontend — contratos de datos (Fase 4)

Documento de transferencia para una sesión nueva de implementación. Define las rutas y tipos observados, restricciones de parámetros y comportamiento obligatorio en casos límite para las tres funcionalidades. Las rutas se contrastaron con Swagger UI (`/docs`) y el esquema OpenAPI local; también se inspeccionó `backend/app/routes.py`. Los contratos describen el backend observado, no garantizan validación runtime desde TypeScript.

## Alcance y reglas comunes

- Esta fase documenta; no implementa componentes, fetches ni cambios de backend.
- Usar `snake_case` en query strings y payloads API. El estado UI `DateRangeFilter` de [`types.ts`](types.ts) usa `startDate`/`endDate` y debe mapearse a `start_date`/`end_date`.
- `ISODate` es un alias de `string`, no un validador. Validar fecha calendario real y serializar `YYYY-MM-DD` en runtime.
- Omitir parámetros opcionales sin selección. No enviar cadenas vacías ni `null`; un rango vacío significa todos los datos disponibles.
- Un query param inválido puede resultar en HTTP 422. El rango invertido no tiene una restricción de orden en OpenAPI: la UI debe validarlo antes de consultar.
- Los límites de fecha son inclusivos en las rutas de movimientos. Un error de red/HTTP no equivale a una respuesta exitosa vacía.
- Tipos fuente: [`types.ts`](types.ts) (primitivos, modelos compartidos/UI), [`api-types.ts`](api-types.ts) (respuestas) y [`param-types.ts`](param-types.ts) (parámetros específicos). Son definiciones documentales sin parsing/validación runtime.

## Funcionalidad 1 — Filtro de fechas del dashboard principal

### Endpoints y tipos

| Uso | Endpoint | Request/query TypeScript | Respuesta TypeScript |
| --- | --- | --- | --- |
| Obtener el rango global disponible y las facetas | `GET /api/metrics/facets` | Sin parámetros (`GET` sin body). | `FacetsResponse` de `api-types.ts`: `operation_types`, `business_types`, `categories`, `min_date`, `max_date`. |
| Cargar movimientos filtrados que alimentan KPIs/gráficos | `GET /api/metrics` | `DateRangeQuery` de `types.ts`; la ruta además acepta `category?: Category` y `operation_type?: OperationType`. Para esta funcionalidad de fecha, enviar solo los límites seleccionados. | `FinancialMovement[]` de `types.ts`. |
| Mantener el mismo rango en la tabla de alertas | `GET /api/metrics/alerts` | `AlertsParams` de `param-types.ts`; detalles en Funcionalidad 2. | `AlertsResponse` de `api-types.ts`; detalles en Funcionalidad 2. |

`DateRangeQuery` contiene `start_date?: ISODate` y `end_date?: ISODate`. Cada límite es opcional e inclusivo; sin ambos se consulta el dataset completo. `category` permite `suppliers | sales | operational | administrative | others`; `operation_type` permite `income | outcome`. No son necesarios para cambiar solo el intervalo. `/api/metrics/facets` no recibe filtros de fecha: sus `min_date`/`max_date` representan el rango disponible global, no el rango seleccionado.

### Casos límite y UI

1. **Ambas fechas omitidas o limpiadas:** pedir movimientos sin `start_date` ni `end_date`; mostrar todos los datos y las fechas globales de facets como referencia, no insertar límites por defecto.
2. **Solo un límite presente:** enviar únicamente `start_date` o `end_date`; mostrar movimientos desde esa fecha o hasta esa fecha, inclusive. La fecha ausente permanece abierta.
3. **Inicio posterior al fin:** conservar valores editables, mostrar validación asociada a los controles y no ejecutar/aplicar una consulta contradictoria. Fechas iguales son un rango válido de un solo día.
4. **Facets o movimientos fallan / movimientos devuelven `[]`:** mostrar error visible si falla una request y no inventar fechas. Si `/api/metrics` responde exitosamente `[]`, representar “sin movimientos para este rango” (y métricas vacías explícitas), no error ni datos anteriores como si fueran actuales.

## Funcionalidad 2 — Alertas de anomalías

### Endpoint y tipos

`GET /api/metrics/alerts` devuelve un array JSON (sin wrapper): `AlertsResponse = AlertEntry[]` en `api-types.ts`. Cada item contiene `period: string`, `outcome_total: number`, `baseline_average: number`, `increase_ratio: number`. El período se conserva como etiqueta string; `increase_ratio` es ratio fraccional y se multiplica por 100 solo para presentarlo como porcentaje.
La tabla permanece visible en éxito vacío y muestra explícitamente “No se detectaron anomalías para el rango y umbral seleccionados”; una carga muestra loading y un error muestra error, nunca el estado vacío.

El request es `AlertsParams` de `param-types.ts`:

| Parámetro | Valores válidos/restricción del backend observado | Decisión UI / default |
| --- | --- | --- |
| `threshold?: number` | Número `>= 0`, sin máximo documentado; default API `0.3`. | Control de producto `0.01`–`1.0`, ambos inclusivos, step recomendado `0.01`, inicial `0.3`. Enviar ratio: `0.3`, no `30`. |
| `group_by?: MetricsGroupBy` | `day`, `week`, `month`; default `month`. | UI usa `month`; no exponer granularidad alternativa por ahora. |
| `start_date?: string`, `end_date?: string` | Fecha calendario `YYYY-MM-DD`; opcional y sin validación de orden declarada. | Omitir si no está seleccionada, rechazar fechas inválidas/invertidas en UI; límites inclusivos. |
| `business_type?: BusinessType` | `B2B` o `B2C`; opcional. | Omitir para incluir ambos segmentos en el dashboard. |

El tipo compartido `BusinessType` es `"B2B" | "B2C"`; `MetricsGroupBy` es `"day" | "week" | "month"`. No se envía body en el GET. La respuesta exitosa vacía es `[]`; el error HTTP/red debe permanecer como estado de error, no convertirse a `[]`.

### Casos límite, presentación y desajustes conocidos

1. **Éxito sin alertas:** con respuesta `[]`, conservar sección/encabezados de tabla y mostrar “No se detectaron anomalías para el rango y umbral seleccionados”.
2. **Error de request:** mostrar error anunciable y no mostrar el mensaje de lista vacía ni reutilizar resultados previos como actuales.
3. **Umbral en los bordes:** permitir `0.01` y `1.0`; bloquear/validar valores menores o mayores en UI aunque API acepte `0` y no declare máximo. Comparar resultado API sin convertir la query a porcentaje.
4. **Sin rango / rango parcial:** omitir límites no seleccionados; la salida visible debe respetar el rango aplicado. Validar rango invertido sin request.

**Gap funcional que no debe darse por resuelto:** el requisito de producto define baseline como promedio móvil de exactamente los tres períodos inmediatamente anteriores y exige contexto anterior a `start_date`; la implementación actual calcula promedio acumulado de todos los períodos previos y filtra antes de calcular, por lo que puede perder contexto. `baseline_average` es el dato realmente devuelto y debe etiquetarse con cautela. Para cumplir la semántica de producto hace falta cambio backend o transformación aprobada; la UI no debe afirmar que el contrato actual ya lo cumple.

## Funcionalidad 3 — Comparación B2B vs B2C

### Endpoints y tipos

| Uso | Endpoint | Request/query TypeScript | Respuesta TypeScript |
| --- | --- | --- | --- |
| Facetas/rango global para filtros | `GET /api/metrics/facets` | Sin parámetros. | `FacetsResponse` (`api-types.ts`). |
| Top cinco categorías de ingreso B2B | `GET /api/metrics/categories/top` | `TopCategoriesParams` (`param-types.ts`): `operation_type: "income"`, `limit: 5`, `business_type: "B2B"` y límites de fecha seleccionados. | `TopCategoriesResponse = CategoryEntry[]` (`api-types.ts`). |
| Top cinco categorías de ingreso B2C | `GET /api/metrics/categories/top` | Igual, `business_type: "B2C"`; una request separada. | `TopCategoriesResponse = CategoryEntry[]`. |
| Ingresos completos por grupo para total y denominador | `GET /api/metrics/b2b` y `GET /api/metrics/b2c` | `DateRangeQuery` (`types.ts`) más `operation_type: "income"`. Ruta fija el grupo, acepta también `category?: Category`; no enviar categoría para total completo. | `FinancialMovement[]` (`types.ts`), agregar `amount` para formar `BusinessIncomeSummary` (`types.ts`). |

`TopCategoriesParams` tiene `operation_type?: OperationType` (`income | outcome`, default API `outcome`), `limit?: number` entero `1–20` inclusivo (default `5`), límites `start_date`/`end_date` opcionales `string` con formato `YYYY-MM-DD`, y `business_type?: BusinessType` (`B2B | B2C`). Para la funcionalidad se fijan explícitamente `income`, `5` y un grupo por llamada; fechas solo si están seleccionadas. Respuesta por fila `CategoryEntry`: `category: Category`, `operation_type: OperationType`, `total_amount: number`. La lista puede ser vacía o tener menos de cinco filas.

En tipos compartidos `Category = "suppliers" | "sales" | "operational" | "administrative" | "others"`, `OperationType = "income" | "outcome"`; `FinancialMovement` contiene `create_date`, `amount`, `operation_type`, `category`, `business_type`. Los porcentajes y resúmenes no los devuelve la API: `BusinessIncomeSummary` es view-model derivado con `businessType`, `totalIncome` (todos los ingresos del grupo), `topCategories`; cada `TopIncomeCategoryRow` tiene `category`, `totalAmount`, `percentageOfGroupIncome`. El gráfico recibe dos `BusinessIncomeChartDatum` (B2B/B2C) con el total completo. No sumar solo top cinco para total o denominador.

`GET /api/metrics/comparison` no es una fuente para este gráfico: requiere `start_date` y `end_date`, acepta `business_type` opcional y responde `MetricsComparison` (`current_period`, `previous_period`, `delta_abs`, `delta_pct: number | null`), comparación de neto temporal, no dos ingresos simultáneos. No consumirlo para sustituir las rutas anteriores.

### Casos límite y UI

1. **Top categorías `[]`, pero request de movimientos completa:** mostrar total del grupo (puede ser cero) y estado “sin categorías de ingreso”; no inventar filas ni considerar `[]` de top como error.
2. **Ingreso total cero:** presentar total `0`, porcentajes `0` o indicador equivalente; evitar división entre cero, `NaN` e infinito. El gráfico puede mostrar ambos grupos en cero solo tras confirmar éxito de ambas fuentes.
3. **Falla una ruta/grupo requerido:** marcar la comparación como error/no comparable; no graficar el grupo cargado contra `0` supuesto, y no sustituir fallo por lista vacía.
4. **Más resultados que el límite / empate:** presentar como máximo cinco, por importe descendente; empates estables por nombre ascendente según decisión de producto. Porcentajes se calculan contra el total completo del grupo, que puede ser mayor que la suma mostrada.
5. **Rango vacío/parcial/invertido:** vacío omite ambos límites e incluye todo; parcial envía un único límite inclusivo; invertido se valida antes de las solicitudes. Aplicar exactamente la misma selección a los dos grupos y ambas tablas, totales y gráfico.

### No equivalencias ni decisiones heredadas

- `FacetsResponse` alimenta opciones/rango disponibles, no listas hardcodeadas. Las categorías de la tabla son solo las que tengan ingreso en el rango.
- No hay un endpoint de top categorías que también entregue el total completo. Si las rutas completas por grupo se usan, sumar los movimientos con `operation_type === "income"`; cualquier nueva agregación requiere contrato aprobado.
- El gráfico se muestra solo con dos totales válidos del mismo rango. Si ambas fuentes concluyen con éxito y no hay movimientos, mostrar dos ceros y estado vacío coherente.

## Referencias de fases previas

- [Fase 1: exploración de endpoints, OpenAPI y desajustes](phase-1-api-exploration.md)
- [Requisitos: filtro de fechas](dashboard-date-range.md), [alertas](dashboard-anomaly-alerts.md) y [comparación B2B/B2C](b2b-vs-b2c-comparison.md)
- [Fase 2: tipos](types.ts), [respuestas](api-types.ts) y [parámetros](param-types.ts)
- [Fase 3: responsabilidades y composición de componentes](components.md)

Las muestras de fechas/payloads de sesiones anteriores son observaciones de un dataset sintético y no deben fijarse como valores de producto o pruebas.
