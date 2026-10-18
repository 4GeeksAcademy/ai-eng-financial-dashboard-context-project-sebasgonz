# Memoria del proyecto

**Evidencia revisada:** 2026-10-18. Este documento describe el repositorio observado, no capacidades prometidas ni un plan de producto. Las rutas enlazadas son la fuente de verdad; si el código y este resumen difieren, prevalece el código.

## Overview del producto

Financial Metrics Dashboard es una aplicación de ejemplo para visualizar métricas financieras. El README la describe como un dashboard React/TypeScript con API FastAPI ([README.es.md](../README.es.md)); la implementación consume movimientos generados de muestra, no una fuente bancaria, contabilidad externa o base de datos ([App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py)).

### Flujo y comportamiento implementado

1. El frontend solicita `GET /api/metrics` al cargar la pantalla ([App.tsx](../frontend/src/App.tsx)).
2. En Compose, Vite reenvía `/api` a `API_PROXY_TARGET=http://host.docker.internal:8000`; sin la variable, su fallback es `http://backend:8000` ([vite.config.ts](../frontend/vite.config.ts), [docker-compose.yml](../docker-compose.yml)).
3. FastAPI devuelve movimientos con fecha ISO, importe, tipo de operación, categoría y tipo de negocio. El generador produce 30 movimientos por mes durante 12 meses y deriva el año de `date.today()` ([routes.py](../backend/app/routes.py), [financial-types.ts](../frontend/src/lib/financial-types.ts)).
4. El cliente calcula ingreso total, egreso total, utilidad, porcentaje sobre ingresos y agregados mensuales; la pantalla presenta cuatro KPI y dos gráficos ([financial-utils.ts](../frontend/src/lib/financial-utils.ts), [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx)).

La API también implementa salud, facetas, resumen, categorías principales, comparación, alertas y rutas B2B/B2C ([routes.py](../backend/app/routes.py)). La pantalla actual solo solicita `/api/metrics`; no asumir que usa los endpoints analíticos restantes.

## Stack tecnológico

| Área | Tecnología declarada o comprobada | Evidencia |
| --- | --- | --- |
| Lenguajes | TypeScript en frontend; Python en backend | [package.json](../frontend/package.json), [routes.py](../backend/app/routes.py) |
| Frontend | React y React DOM `^19.2.4`; Vite `^8.0.4`; TypeScript `~6.0.2` | [package.json](../frontend/package.json) |
| Gráficos e interfaz | Recharts `^3.8.1`, Tailwind CSS `^4.2.2` con plugin Vite, lucide-react `^1.8.0` | [package.json](../frontend/package.json), [vite.config.ts](../frontend/vite.config.ts) |
| Pruebas y calidad frontend | Vitest `^4.1.4`, ESLint `^9.39.4`; scripts `test`, `build`, `lint` | [package.json](../frontend/package.json) |
| Backend | FastAPI, Uvicorn con extras estándar y debugpy; Pydantic se usa para modelos | [requirements.txt](../backend/requirements.txt), [routes.py](../backend/app/routes.py), [main.py](../backend/app/main.py) |
| Pruebas backend | pytest, pytest-cov y httpx | [requirements.txt](../backend/requirements.txt), [test_routes.py](../backend/tests/test_routes.py) |
| Contenedores | Docker Compose; Node `24-alpine` para Vite y Python `3.13-slim` para API | [docker-compose.yml](../docker-compose.yml), [frontend/Dockerfile](../frontend/Dockerfile), [backend/Dockerfile](../backend/Dockerfile) |

Las versiones de Python listadas en `requirements.txt` no están fijadas. Las versiones npm son rangos declarados en `package.json`, no necesariamente las versiones resueltas en una instalación determinada.

## Estado actual

### Funcionalidad y verificaciones

- La ruta de métricas genera movimientos y aplica filtros de fecha, categoría y tipo de operación; el backend incluye endpoints analíticos adicionales ([routes.py](../backend/app/routes.py)).
- La interfaz implementa los KPI y gráficos descritos arriba. Los tests unitarios disponibles cubren utilidades financieras; no equivalen a una prueba completa en navegador ([financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts)).
- En esta revisión, `docker compose config --format json` pasó; `docker compose run --rm --no-deps frontend npm test` pasó con **5 tests**; `docker compose run --rm --no-deps backend pytest -q` pasó con **15 tests**.
- Se volvió a ejecutar `docker compose up --build -d`: la página frontend respondió HTTP `200`; `/api/metrics` a través del proxy respondió HTTP `200` y devolvió **360 movimientos**. Ambos contenedores quedaron activos.
- La ejecución de pytest mostró una advertencia de deprecación de `starlette.testclient` con httpx. No se cambió la dependencia en esta fase.
- La configuración Compose publica frontend `5173`, backend `8000` y depurador `5678`. Los puertos se verificaron en la configuración efectiva; en Codespaces se usan las URLs que genera el reenvío de puertos.

### Gaps observables

- Los datos son sintéticos y volátiles respecto del calendario; no se configura almacenamiento persistente ni una fuente financiera productiva ([routes.py](../backend/app/routes.py), [docker-compose.yml](../docker-compose.yml)).
- No se encontró autenticación ni configuración de despliegue de producción. Los Dockerfile arrancan Vite dev y Uvicorn con `--reload`; el backend además abre debugpy en `5678` ([frontend/Dockerfile](../frontend/Dockerfile), [backend/Dockerfile](../backend/Dockerfile)). FastAPI configura CORS con origen comodín y credenciales habilitadas ([main.py](../backend/app/main.py)); no se afirma que esta configuración sea apropiada para producción.
- Se reprodujo que `computeMonthlyData` puede agrupar `2024-02-01` como enero en `America/Los_Angeles`, por combinar parseo de fecha ISO con getters locales ([financial-utils.ts](../frontend/src/lib/financial-utils.ts), [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts)). El defecto está documentado, no corregido.
- La suite frontend no tiene pruebas de renderizado/fetch de App ni end-to-end; la suite backend no atraviesa el proxy. El test `test_metrics_summary_by_week_honors_business_type_filter` comprueba que haya respuesta, no que todos los resultados respeten el filtro ([test_routes.py](../backend/tests/test_routes.py)).
- No se verificó visualmente el dashboard en navegador en esta revisión. Tests unitarios y configuración válida no prueban por sí solos el flujo completo de usuario.

### Prioridades siguientes

El repositorio no declara un roadmap ni prioriza estos gaps. No se infiere aquí un orden de trabajo. Decidir si abordar persistencia/datos reales, autenticación y despliegue, manejo de fechas o cobertura de filtros requiere una decisión del responsable del producto; son áreas pendientes observables, no prioridades ya aprobadas.
