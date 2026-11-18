# Fase 1 — Exploración de la API para las especificaciones

## Alcance y comprobación

Se revisó Swagger UI (`GET http://localhost:8000/docs`) y el OpenAPI servido por el backend (`GET http://localhost:8000/openapi.json`) antes de documentar los contratos. El servicio backend de Docker estaba activo; ambos recursos respondieron HTTP `200`. Las solicitudes siguientes son lecturas de endpoints locales y no modifican el repositorio ni el dataset.

Las fechas de las muestras (`2025-11-01` a `2026-10-28`) corresponden a esta ejecución del dataset sintético, no son valores constantes.

## Patrón de fetch del frontend existente

En `frontend/src/App.tsx`, la única llamada de red encontrada es `fetchFinancialData()`:

- Construye la URL como ``${API_BASE_URL}/api/metrics``, con `API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""`.
- Llama `fetch`, comprueba `response.ok` y lanza error HTTP si no es OK.
- Devuelve `response.json()` tipado como `FinancialMovement[]`.
- El `useEffect` de `App` consume el resultado, calcula KPIs/series localmente y gestiona `catch`/`finally` para error y carga.
- No hay en este patrón helper para query params ni filtrado de fechas; la llamada actual a `/api/metrics` no envía parámetros.

Este es un patrón de referencia, no una instrucción para cambiar código durante la fase de exploración.

## Mapa de endpoints observado

### 1. Filtro de rango del dashboard principal

#### `GET /api/metrics/facets`

- Query params: ninguno.
- Respuesta: objeto `MetricsFacets` con campos requeridos:
  - `operation_types: string[]` (`income`, `outcome`)
  - `business_types: string[]` (`B2B`, `B2C`)
  - `categories: string[]` (`suppliers`, `sales`, `operational`, `administrative`, `others`)
  - `min_date: YYYY-MM-DD`
  - `max_date: YYYY-MM-DD`
- Muestra HTTP 200 observada: `min_date=2025-11-01`, `max_date=2026-10-28`.

#### `GET /api/metrics`

- Query params opcionales:
  - `start_date`: fecha ISO `YYYY-MM-DD`.
  - `end_date`: fecha ISO `YYYY-MM-DD`.
  - `category`: una de las categorías permitidas.
  - `operation_type`: `income` o `outcome`.
- Respuesta: array de movimientos `FinancialMovement`; cada elemento tiene `create_date`, `amount`, `operation_type`, `category`, `business_type`.
- La implementación aplica límites inclusivos a `create_date`. Con ambos límites de la muestra consultada, respondió HTTP 200 y 360 movimientos.
- Frontend actual: pide `/api/metrics` sin filtros; la especificación requiere agregar estado/controles y aplicar el rango también a las alertas.

### 2. Alertas de anomalías

#### `GET /api/metrics/alerts`

- Query params opcionales:
  - `threshold`: number, default `0.3`, mínimo documentado `0`; no hay máximo documentado.
  - `group_by`: `day`, `week` o `month`; default `month`.
  - `start_date`, `end_date`: formato date.
  - `business_type`: `B2B` o `B2C`.
- Respuesta: array de `MetricsAlert`; cada elemento contiene `period: string`, `outcome_total: number`, `baseline_average: number`, `increase_ratio: number`.
- Muestra HTTP 200 observada para `threshold=0.3`, `group_by=month` y el rango de facets: 4 objetos; primero `period=2025-12`, `outcome_total=103378.98`, `baseline_average=41404.44`, `increase_ratio=1.4968`.
- Interpretación de presentación: `increase_ratio` es ratio fraccional; como porcentaje se muestra multiplicado por 100. `baseline_average` es el valor usado como baseline en backend.
- **Desajuste funcional:** el requerimiento pide media móvil de exactamente tres períodos previos; la implementación real calcula el promedio de todos los outcome de períodos anteriores disponibles. Además, filtra movimientos por fechas antes de crear la serie, lo que puede eliminar contexto previo al inicio seleccionado. La especificación conserva el requisito de tres períodos, explicita el campo de transporte (`baseline_average`) y exige respetar el rango de presentación con contexto de cálculo. No se modificó la implementación en esta fase.

### 3. Comparación B2B vs B2C

#### `GET /api/metrics/categories/top`

- Query params:
  - `operation_type`: `income` o `outcome`; default actual `outcome`.
  - `limit`: entero, default `5`, mínimo `1`, máximo `20`.
  - `start_date`, `end_date`: opcionales, formato date.
  - `business_type`: opcional `B2B` o `B2C`.
- Respuesta: array de `TopCategoryItem` con `category`, `operation_type`, `total_amount`. Orden descendente; puede haber menos filas que el límite si hay menos categorías presentes.
- Para la vista se consulta dos veces, con `operation_type=income`, `limit=5`, un grupo en cada request y fechas coincidentes.
- Muestras HTTP 200 observadas: B2B devolvió `sales=557903.97`, `others=57636.75`; B2C devolvió `sales=574193.41`, `others=68412.74` (ambos con el rango de ejemplo).
- **Límite de contrato:** no devuelve el total completo de income del grupo ni porcentaje por categoría. No usar la suma del top cinco como total/denominador si hay más categorías.

#### `GET /api/metrics/b2b` y `GET /api/metrics/b2c`

- Query params opcionales: `start_date`, `end_date`, `category`, `operation_type`.
- Respuesta: arrays de `FinancialMovement`; la ruta selecciona su grupo por sí misma y permite traer todos los movimientos de income para sumar el total completo del grupo en el cliente.
- Muestras HTTP 200 observadas con `operation_type=income` y el rango: 101 movimientos B2B y 96 movimientos B2C.
- Alternativa de producto: derivar totales completos de esas respuestas, o acordar un endpoint agregado nuevo en una futura fase. Fase 1 no cambia contratos.

#### `GET /api/metrics/comparison` (endpoint cercano, no equivalente)

- `start_date` y `end_date` son obligatorios; `business_type` opcional.
- Respuesta: objeto `MetricsComparison` con `current_period`, `previous_period`, `delta_abs`, `delta_pct` (nullable).
- La implementación compara utilidad neta del rango con el rango anterior; no devuelve dos totales de ingresos B2B/B2C ni categorías. Una solicitud sin fechas respondió HTTP 422; con fechas de ejemplo respondió HTTP 200 y `delta_pct=null` cuando el neto previo fue cero.

## Resolución de wording frente a campos reales

| Wording del requisito | Campo/contrato real | Resolución en la especificación |
| --- | --- | --- |
| Rango disponible, fecha más antigua y reciente | `MetricsFacets.min_date`, `MetricsFacets.max_date` | La UI presenta esos campos; no inventa nombres `earliest/latest` ni fechas fijas. |
| Outcome registrado | `MetricsAlert.outcome_total` | Mostrar como “Outcome registrado”/egreso del período. |
| Media móvil de 3 períodos | Campo existente `MetricsAlert.baseline_average` | El campo nombra la baseline pero el algoritmo actual no cumple la ventana de tres; la spec exige semántica de tres períodos y señala el desajuste sin declararlo resuelto en backend. |
| Incremento porcentual | `MetricsAlert.increase_ratio` | Multiplicar por 100 para presentación; request `threshold` sigue siendo ratio, default `0.3`. |
| Top categorías e importes | `TopCategoryItem.category`, `total_amount` | Solicitar `operation_type=income`, filtrar cada grupo y usar límite 5. |
| Total del grupo/porcentaje | No existe en `TopCategoryItem` | Derivar el total desde movimientos completos `/b2b` y `/b2c` filtrados por `operation_type=income`, fechas, o requerir endpoint agregado; nunca calcular denominador desde solo top 5. |
| Comparación de ingresos B2B vs B2C | `/api/metrics/comparison` calcula neto actual vs anterior | No es equivalente; la spec solicita comparar el total completo de income de los dos grupos. |

## Límites de esta fase

- Se exploraron `/docs`, el esquema OpenAPI local, llamadas de lectura a los endpoints relevantes y el fetch actual en frontend.
- No se implementaron cambios en React, FastAPI ni contratos; no se hizo prueba visual ni se ejecutaron suites de tests.
- Las especificaciones de producto y criterios de aceptación están en los tres documentos enlazados desde [README.md](README.md).
