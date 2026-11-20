---
name: dashboard-pre-merge-qa
description: Puerta de QA antes de merge para el Financial Metrics Dashboard (Vite + React + FastAPI). Usar cuando se pida "revisar antes del merge", "preparar PR", "QA de la rama" o validar un cambio en frontend/ o backend/ de este repo.
metadata:
  scope: internal
  version: "1.0"
---

# Dashboard pre-merge QA

## Objetivo

Decidir con evidencia ejecutada si una rama de este repo puede mergearse. Cubre lo que las skills comunitarias (`accessibility`, `vercel-react-best-practices`, `vitest`) no conocen: el contrato duplicado backend/frontend, los comandos reales del repo, el presupuesto de bundle y el defecto de fechas documentado.

## Inputs

| Input | Origen | Obligatorio |
|-------|--------|-------------|
| Rama a revisar y rama base | `git branch --show-current`; base indicada por el usuario (por defecto la rama de la que salio) | Si |
| Archivos cambiados | `git diff --stat <base>...HEAD` y `git status --short --untracked-files=all` | Si |
| Docker disponible | `docker compose version` | No (si falta, usar comandos locales y declararlo) |

## Pasos

Ejecutar solo los checks cuya fila aplica a los archivos cambiados. No reintentar mas de 2 veces un check fallido: reportar y parar.

| # | Aplica si cambia | Check | Pasa si |
|---|------------------|-------|---------|
| 1 | cualquier cosa | `git status --short --untracked-files=all` y `git diff --check <base>...HEAD -- . ':!.agents/skills'` | Sin archivos inesperados sin rastrear (p. ej. `.claude/`, `agent/`, `dist/`, caches) ni errores de whitespace en codigo propio. Las skills vendorizadas en `.agents/skills/` se excluyen: editarlas rompe `computedHash` de `skills-lock.json` |
| 2 | `backend/app/routes.py` o `frontend/src/lib/financial-types.ts` | Comparar `OperationType`, `Category`, `BusinessType` (`Literal[...]` en routes.py, uniones en financial-types.ts) | Mismos valores en ambos lados; snake_case en campos JSON (`create_date`, `operation_type`, `business_type`) |
| 3 | `frontend/src/lib/**` | `docker compose run --rm --no-deps frontend npm test` (o `cd frontend && npm test`) | 0 fallos. El test `it.fails` de agrupacion `2024-02-01` sigue como *expected fail* salvo que el PR declare el fix y quite `.fails` |
| 4 | `frontend/**` (codigo, tipos, config) | `cd frontend && npm run build` y `npm run lint` | Exit 0, sin advertencias nuevas. Chunk inicial `dist/assets/index-*.js` < 500 kB (sin aviso de Vite); Recharts en chunk aparte |
| 5 | `frontend/src/components/**` | Revisar diff contra skill `accessibility`: icono solo decorativo sin nombre, charts con `title`/`desc`, mensajes dinamicos con `role="alert"`, texto en espanol con `lang="es"` | Ningun elemento nuevo rompe esos patrones |
| 6 | `backend/**` | `docker compose run --rm --no-deps backend pytest -q` | 0 fallos; tests de filtros con valores esperados, no solo status |
| 7 | README, reglas, procedimientos | Si cambia un comando o variable, comprobar que `README.md` y `README.es.md` dicen lo mismo | Paridad entre idiomas y enlaces relativos validos |

## Output esperado

Un informe breve en el chat (no un archivo nuevo) con esta forma:

```
Rama: <rama> vs <base>
| # | Check | Comando | Resultado | Evidencia |
|---|-------|---------|-----------|-----------|
Veredicto: LISTO PARA MERGE | BLOQUEADO (<check #>: <motivo>)
No verificado: <checks omitidos y por que>
```

Si la tarea lo pide, anadir la misma tabla a `verification.md` como comprobacion nueva, sin tocar resultados historicos.

## Criterios de aceptacion

- Cada fila del informe cita un comando realmente ejecutado y su salida relevante; nada se marca como pasado por inspeccion si existe un comando.
- Los checks omitidos aparecen en "No verificado" con motivo.
- El veredicto es BLOQUEADO si falla cualquier check aplicable, o si el paso 1 encuentra archivos sin rastrear sin decision del usuario.
- No modifica codigo de la app: solo reporta. Las correcciones van en una tarea aparte.
- No hace `git add .`, commit ni push.

## Fuentes en el repo

- [.agents/rules/testing-and-evidence.md](../../.agents/rules/testing-and-evidence.md): comandos aislados y registro de evidencia.
- [.agents/rules/documentation-and-workflow.md](../../.agents/rules/documentation-and-workflow.md): higiene de diff y commit.
- [README.md](../../README.md): contrato de datos y limitacion de agrupacion mensual.
- [frontend/package.json](../../frontend/package.json): scripts `build`, `lint`, `test`.
