# Contexto técnico

**Alcance:** resumen basado en dependencias y configuración del repositorio. Las versiones mencionadas como rangos son las declaradas, no necesariamente las resueltas en una instalación concreta.

## Tecnologías y herramientas

| Área | Stack declarado u observado | Evidencia |
| --- | --- | --- |
| Lenguajes | TypeScript/JavaScript en frontend; Python en backend | [package.json](../frontend/package.json), [routes.py](../backend/app/routes.py) |
| Frontend | React y React DOM `^19.2.4`; Vite `^8.0.4`; TypeScript `~6.0.2` | [package.json](../frontend/package.json) |
| Visualización e interfaz | Recharts `^3.8.1`, Tailwind CSS `^4.2.2` con plugin de Vite y lucide-react `^1.8.0` | [package.json](../frontend/package.json), [vite.config.ts](../frontend/vite.config.ts) |
| Calidad frontend | Vitest `^4.1.4`, ESLint `^9.39.4`; scripts `test`, `build` y `lint` | [package.json](../frontend/package.json) |
| API/backend | FastAPI, Uvicorn con extras estándar, Pydantic y debugpy | [requirements.txt](../backend/requirements.txt), [main.py](../backend/app/main.py), [routes.py](../backend/app/routes.py) |
| Pruebas backend | pytest, pytest-cov y httpx | [requirements.txt](../backend/requirements.txt), [test_routes.py](../backend/tests/test_routes.py) |
| Contenedores | Docker Compose; Node `24-alpine` para Vite y Python `3.13-slim` para API | [docker-compose.yml](../docker-compose.yml), [frontend/Dockerfile](../frontend/Dockerfile), [backend/Dockerfile](../backend/Dockerfile) |

Las dependencias Python están declaradas en [backend/requirements.txt](../backend/requirements.txt); las versiones npm declaradas son rangos de [frontend/package.json](../frontend/package.json). No convertir estos datos en afirmaciones sobre versiones instaladas sin verificar el entorno seleccionado.

## Arquitectura y recorrido de datos

1. [App.tsx](../frontend/src/App.tsx) solicita `GET /api/metrics`.
2. En Compose, el servidor Vite reenvía `/api` usando `API_PROXY_TARGET=http://host.docker.internal:8000`; la configuración alternativa de Vite usa `http://backend:8000` ([vite.config.ts](../frontend/vite.config.ts), [docker-compose.yml](../docker-compose.yml)).
3. FastAPI genera los movimientos sintéticos y ofrece también otras rutas ([routes.py](../backend/app/routes.py)).
4. Las utilidades financieras en cliente agregan KPI y series; los componentes del dashboard representan los resultados ([financial-utils.ts](../frontend/src/lib/financial-utils.ts), [components/dashboard](../frontend/src/components/dashboard)).

## Ejecución y configuración

- Arranque de desarrollo documentado: `docker compose up --build` ([README.es.md](../README.es.md)).
- Puertos configurados: frontend `5173`, API `8000` y depurador `5678` ([docker-compose.yml](../docker-compose.yml)).
- `VITE_API_BASE_URL` configura el origen de API visible para el navegador; `API_PROXY_TARGET` configura el destino del proxy del servidor Vite.
- Los Dockerfile inician Vite dev y Uvicorn con `--reload`; el backend inicia debugpy. Por tanto, la configuración revisada es de desarrollo, no evidencia de despliegue de producción ([frontend/Dockerfile](../frontend/Dockerfile), [backend/Dockerfile](../backend/Dockerfile)).
- El backend configura CORS con origen comodín y credenciales ([main.py](../backend/app/main.py)); no se afirma que sea adecuado para producción.

## Notas de compatibilidad y datos

- El backend usa `date.today()` y una semilla aleatoria; las fechas cambian con el calendario aunque exista una semilla fija ([routes.py](../backend/app/routes.py)).
- El contrato HTTP usa nombres snake_case, mientras el código de cliente puede producir resultados camelCase ([financial-types.ts](../frontend/src/lib/financial-types.ts)).
- La limitación observada en agrupación de fechas ISO está registrada en [progress.md](progress.md); todavía no se describe como corregida.
