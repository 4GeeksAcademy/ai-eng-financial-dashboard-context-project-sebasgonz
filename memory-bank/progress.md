# Progreso y estado actual

**Base del resumen:** implementación, configuración y resultados de validación registrados en [verification.md](../verification.md). Los resultados históricos se citan como tales; no representan ejecuciones realizadas durante la actualización de esta memoria.

## Funcionalidad observada

- `GET /api/metrics` devuelve movimientos sintéticos y admite filtros; el backend contiene además rutas de salud y analíticas ([routes.py](../backend/app/routes.py)).
- La interfaz consume `/api/metrics`, calcula cuatro KPI y presenta dos gráficos ([App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [components/dashboard](../frontend/src/components/dashboard)).
- La memoria general del producto se encuentra en [projectbrief.md](projectbrief.md); el entorno y las dependencias se detallan en [techContext.md](techContext.md).

## Validaciones previamente registradas

La sección de Fase 4 de [verification.md](../verification.md) registra los siguientes resultados del 2026-10-18:

- `docker compose config --format json`: configuración válida, con dos servicios y puertos `5173`, `8000` y `5678`.
- `docker compose run --rm --no-deps frontend npm test`: 5 tests aprobados.
- `docker compose run --rm --no-deps backend pytest -q`: 15 tests aprobados; se observó advertencia de deprecación relacionada con Starlette/httpx.
- `docker compose up --build -d`: frontend respondió HTTP `200`; `/api/metrics` por proxy respondió HTTP `200` con 360 movimientos. Esta evidencia de disponibilidad no implica prueba visual completa en navegador.

Estas pruebas pertenecen a la validación histórica anotada en verification.md; no se volvieron a ejecutar al redactar este documento.

## Gaps y riesgos observables

- Los datos son sintéticos y no se configura persistencia ni una fuente financiera productiva ([routes.py](../backend/app/routes.py), [docker-compose.yml](../docker-compose.yml)).
- No se encontró autenticación ni configuración de producción. La configuración actual usa servidores de desarrollo, recarga y debugpy; CORS permite origen comodín con credenciales ([Dockerfiles](../frontend/Dockerfile), [backend/Dockerfile](../backend/Dockerfile), [main.py](../backend/app/main.py)).
- `computeMonthlyData` puede agrupar `2024-02-01` como enero en `America/Los_Angeles`, debido a la combinación de parseo ISO y getters locales ([financial-utils.ts](../frontend/src/lib/financial-utils.ts), [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts)). Se registró como defecto reproducido; no como corrección.
- Los tests frontend cubren utilidades, no el renderizado/fetch de la aplicación ni un flujo end-to-end. Los tests backend no atraviesan el proxy. La revisión anterior señala aserciones incompletas en algunas pruebas de filtros ([test_routes.py](../backend/tests/test_routes.py)).
- La validación no incluyó inspección visual del dashboard en navegador.

## Prioridades y decisiones pendientes

El repositorio no contiene un roadmap ni un orden aprobado para estos gaps. No se asigna prioridad ni se afirma que una opción ya haya sido decidida. El responsable del producto debe definir si abordar primero fuentes/persistencia de datos, seguridad y despliegue, fechas o cobertura de pruebas.

## Estado de esta actualización documental

Esta división responde a la observación del rubric: reglas bajo `.agents/rules` y memoria separada en brief, contexto técnico y progreso. No modifica código funcional ni declara que las validaciones históricas se hayan repetido.
