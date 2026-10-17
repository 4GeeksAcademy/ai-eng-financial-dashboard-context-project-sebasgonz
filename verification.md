# Verificación del resumen del proyecto

## Resumen

- **Qué hace:** Dashboard en React y TypeScript que presenta ingresos, egresos, utilidad neta, porcentaje de utilidad y gráficos mensuales. El backend actual genera movimientos de muestra; el repo no configura una fuente financiera de producción ni una base de datos.
- **Cómo se conecta:** El frontend solicita `GET /api/metrics`. Vite hace proxy de `/api`; el destino se configura con `API_PROXY_TARGET`, y Compose lo dirige mediante `host.docker.internal:8000`. `VITE_API_BASE_URL` puede cambiar el origen de las solicitudes del navegador. FastAPI sirve la API y su documentación interactiva.
- **Cómo se ejecuta:** Desde la raíz, ejecutar `docker compose up --build`. Compose publica frontend `5173:5173`, backend `8000:8000` y depurador del backend `5678:5678`. En Codespaces, abrir los puertos reenviados; con Docker local, usar los puertos publicados en localhost. Detener con `Ctrl+C`.

## Contraste con el código

`[J]` coincide; `[X]` era un desajuste y quedó corregido; `[?]` no se puede establecer con este repo.

| Marca | Afirmación | Evidencia o corrección |
| --- | --- | --- |
| [J] | La app combina frontend React/TypeScript y backend FastAPI. | `frontend/src/App.tsx`, `backend/app/main.py` |
| [J] | La API de métricas devuelve datos de muestra generados, no registros financieros persistidos. | `backend/app/routes.py` genera 360 movimientos con semilla `42`; no hay una base de datos configurada. |
| [J] | El dashboard solicita `/api/metrics`; Vite reenvía `/api` al backend. | `frontend/src/App.tsx`, `frontend/vite.config.ts`, `docker-compose.yml` |
| [J] | Compose define frontend y backend, y publica los puertos `5173`, `8000` y `5678`. | `docker-compose.yml` |
| [X] | El dashboard mostraba el período fijo `2024 - Full Year`, aunque las fechas de la API dependen de la fecha actual. | `frontend/src/App.tsx` ahora deriva el período de las fechas inicial y final recibidas. |
| [X] | Ambos README mencionaban `frontend/.env.example`, que no existe. | Se corrigieron para indicar `VITE_API_BASE_URL` en `frontend/.env.local`. |
| [?] | Fuente de datos de producción, autenticación y entorno de despliegue. | No se especifican en la configuración del repo. |

## Verificaciones ejecutadas

- `docker compose config` — correcto.
- `docker compose run --rm frontend npm run build` — correcto; Vite avisa que un chunk supera 500 kB.
- `docker compose run --rm frontend npm test` — correcto, 5 tests.
- `docker compose run --rm backend pytest -q` — correcto, 15 tests; pytest informa una advertencia de deprecación de Starlette/httpx.
- `docker compose up --build -d` y requests HTTP a `/` y `/api/metrics` vía Vite — ambos devolvieron `200`; Compose informa ambos servicios activos.