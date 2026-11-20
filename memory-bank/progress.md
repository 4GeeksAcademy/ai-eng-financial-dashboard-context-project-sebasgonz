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

## Fase de skills (rama `feature/agent-skills`, 2026-11-20)

Mejora dirigida vía skills; cada cambio cita la regla de la skill en su commit. Skills instaladas en `.agents/skills/` y fijadas en `skills-lock.json`.

### Skills aplicadas y cambios verificados

| Skill | Cambios | Commit |
|-------|---------|--------|
| `accessibility` (addyosmani/web-quality-skills) | `<title>` descriptivo (WCAG 2.4.2); error con `role="alert"` + `lang="es"` (3.1.2); `title`/`desc` en ambos `LineChart` (1.1.1); `:focus-visible` con `--ring` opaco (1.4.11). Sin cambio: iconos lucide ya `aria-hidden`; Recharts 3 ya navegable con teclado; contraste `muted-foreground`/`card` ≈5.2:1 estimado desde tokens OKLCH | `9af1190` |
| `vercel-react-best-practices` (vercel-labs/agent-skills) | `bundle-dynamic-imports`: charts con `React.lazy` + `Suspense` (equivalente Vite de `next/dynamic`), chunk inicial 585 kB → 188 kB y desaparece el aviso >500 kB; `ChartSkeleton` compartido como fallback para evitar layout shift; `js-min-max-loop` en el periodo. `next/image`, `next/font` y metadata de Next no aplican (SPA Vite, sin `<img>`, `Inter` no se carga) | `6ad12dd` |
| `vitest` (antfu/skills) — ecosistema | `test.env.TZ=America/New_York` en `vite.config.ts`; `it.fails` documenta el defecto de agrupación `2024-02-01` sin presentarlo como corregido | `e4e472a` |

Verificación ejecutada el 2026-11-20 en esta rama: `npm test` 5 passed + 1 expected fail; `npm run lint` exit 0; `npm run build` sin advertencias; `docker compose run --rm --no-deps backend pytest -q` 15 passed. No verificado: auditoría Lighthouse/axe ni prueba manual de teclado en navegador.

### Skill del ecosistema elegida y por qué

Búsquedas: `npx skills find accessibility`, `vercel-react-best-practices`, `vitest`, `typescript`. Se eligió `antfu/skills@vitest` (48.9K installs, evaluación Safe/Low Risk) porque el repo ya usa Vitest 4 y el riesgo conocido más concreto era que el resultado de los tests de fechas dependía de la zona horaria del host. Las candidatas de `typescript` (`typescript-advanced-types`, `typescript-pro`) se descartaron: genéricas y sin un problema actual del repo al que ligarlas.

### Skill interna creada

[`.skills/dashboard-pre-merge-qa/SKILL.md`](../.skills/dashboard-pre-merge-qa/SKILL.md): puerta de QA antes del merge con objetivo, inputs, pasos por tipo de archivo, formato de informe y criterios de aceptación. Cubre lo que ninguna skill comunitaria conoce: paridad `Literal` de `routes.py` ↔ uniones de `financial-types.ts`, comandos aislados Docker, presupuesto de bundle y el `it.fails` conocido. Probada sobre esta rama: detectó whitespace en skills vendorizadas (refinada para excluir `.agents/skills/`) y bloqueó por `.claude/` y `agent/` sin rastrear, creados por el instalador `npx skills`; pendiente de decisión del usuario.
