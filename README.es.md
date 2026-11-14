# Panel de Métricas Financieras

<!-- hide -->

Por [@marcogonzalo](https://github.com/marcogonzalo) y [otros contribuidores](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) en [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_These instructions are [available in English](./README.md)._

**Antes de empezar**: 📗 [Lee las instrucciones](https://4geeks.com/es/lesson/como-comenzar-un-proyecto-de-codificacion) sobre cómo comenzar un proyecto de programación.

<!-- endhide -->

---

_Dashboard de métricas financieras con frontend en React + TypeScript y backend en FastAPI._

## Pasos recomendados

1. Haz un fork de este repositorio a tu cuenta.
2. Abre tu fork en GitHub Codespaces o clónalo y ejecútalo en tu entorno local.
3. Ejecuta tu agente de IA para inspeccionar frontend y backend.
4. Documenta las reglas propuestas y el banco de memoria en tu fork.
5. Ajusta y valida las reglas hasta que sean aplicables al flujo real del proyecto.

## Estructura esperada del directorio para agentes

```text
.agents/
├─ rules/
│  ├─ <nombre-regla>.md
│  └─ proposed-contributor-rules.md (análisis histórico de Fase 2)
agents/
└─ skills/ (opcional)
   └─ <nombre-skill>/SKILL.md
memory-bank/
├─ projectbrief.md
├─ techContext.md
└─ progress.md
```

Las reglas aprobadas y el análisis histórico de Fase 2 están en [.agents/rules](.agents/rules); [AGENTS.md](AGENTS.md) los indexa. La carpeta opcional de skills, si se crea, va en `agents/skills`. El contexto del proyecto se divide en [brief del producto](memory-bank/projectbrief.md), [contexto técnico](memory-bank/techContext.md) y [progreso](memory-bank/progress.md), indexados por [memory-bank/README.md](memory-bank/README.md).

## Cómo ejecutar en local

```bash
docker compose up --build
```

Con Docker Compose, el frontend usa el proxy de Vite para `/api` y no requiere variables adicionales.
Si ejecutas Vite fuera de Compose o necesitas otro origen de API, define `VITE_API_BASE_URL` en `frontend/.env.local`.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Documentación API: http://localhost:8000/docs

En Codespaces, usa las URLs de los puertos reenviados; los enlaces localhost anteriores corresponden a una ejecución local con esos puertos publicados. Este Compose es de desarrollo: Vite dev, Uvicorn con recarga y debugpy en `5678`, que no debe exponerse públicamente.

| Variable | Consumidor | Uso actual |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Navegador, mediante Vite | Origen opcional de API; vacío usa `/api/metrics` en el mismo origen. |
| `API_PROXY_TARGET` | Servidor Vite | Compose define `http://host.docker.internal:8000` y el alias del gateway; sin variable, Vite usa `http://backend:8000`. |

Si cambia el puerto publicado del backend, revisa también el destino del proxy. Los nombres internos de Docker no son direcciones públicas para el navegador.

## Contrato que consume el dashboard

El dashboard pide `GET /api/metrics` y calcula KPIs y series mensuales en el cliente; no consume `/api/metrics/summary` para esos gráficos. Cada movimiento incluye `create_date` (fecha ISO), `amount`, `operation_type`, `category` y `business_type`, con los nombres del JSON en snake_case.

Por ejemplo, `GET /api/metrics?operation_type=income` devuelve solo ingresos. Los valores permitidos están definidos tanto en [routes.py](backend/app/routes.py) como en [financial-types.ts](frontend/src/lib/financial-types.ts); al cambiar el contrato hay que revisar ambos y sus consumidores.

## Datos y cálculos

La API genera 360 movimientos de muestra con fechas dependientes del reloj; una semilla fija no fija el año. Con ingresos de `1000` y egresos de `250`, la utilidad es `750` y su porcentaje sobre ingresos es `75%`. Sin ingresos, el porcentaje es `0`. El formato USD sin decimales es solo presentación.

Limitación conocida: la agrupación mensual convierte fechas ISO a `Date` y lee el mes local; `2024-02-01` puede agruparse como enero al oeste de UTC. Se ha reproducido, pero no corregido en esta fase documental.

## Validación aislada

Desde la raíz, con Docker e imágenes con las dependencias disponibles:

```bash
docker compose run --rm --no-deps frontend npm test
docker compose run --rm --no-deps backend pytest -q
```

No requieren servicios activos ni arrancan sus dependencias. Comprueban utilidades del frontend y rutas del backend, no el navegador ni el proxy. Los contenedores usan los volúmenes del repo y pueden generar cachés. Para seleccionar una tarea de backend se puede agregar `-k` a pytest; si cambian tipos o componentes, validar también el build.

---

Este y muchos otros proyectos son construidos por estudiantes como parte de los [Coding Bootcamps](https://4geeksacademy.com/) de 4Geeks Academy. Encuentra más acerca de los [cursos](https://4geeksacademy.com/es/comparar-programas) de [Ingeniería de IA](https://4geeksacademy.com/es/coding-bootcamps/ingenieria-ia), [Data Science & Machine Learning](https://4geeksacademy.com/es/coding-bootcamps/curso-datascience-machine-learning), [Ciberseguridad](https://4geeksacademy.com/es/coding-bootcamps/curso-ciberseguridad) y [Full-Stack Software Developer con IA](https://4geeksacademy.com/es/coding-bootcamps/programador-full-stack).
