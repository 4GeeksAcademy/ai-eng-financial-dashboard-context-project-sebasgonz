# Arquitectura, contrato y naming

## Alcance

Cambios en `frontend/src/App.tsx`, `frontend/src/lib`, componentes y `backend/app`. Concreta R01-R03 de [Fase 2](proposed-contributor-rules.md). Regla aprobada tras la validacion de Fase 3; no autoriza refactorizaciones ajenas a la tarea.

## Justificacion

[financial-types.ts](../../frontend/src/lib/financial-types.ts) y [routes.py](../../backend/app/routes.py) mantienen por separado `FinancialMovement` y sus valores permitidos. [App.tsx](../../frontend/src/App.tsx) pide `/api/metrics` y calcula KPIs con [financial-utils.ts](../../frontend/src/lib/financial-utils.ts); no usa el endpoint de resumen para los graficos actuales. `response.json()` no valida en runtime el tipo TypeScript.

## Guia

1. Antes de cambiar un indicador, seguir su llamada desde App hasta la utilidad y componente que lo presenta. No modificar un endpoint de agregados suponiendo que alimenta la pantalla.
2. Si cambia el JSON, revisar los modelos Python, tipos TypeScript, consumidores y tests en la misma tarea. Conservar `create_date`, `amount`, `operation_type`, `category` y `business_type` salvo migracion explicita. No fijar que nunca puedan agregarse campos.
3. Mantener snake_case para transporte y camelCase para resultados locales como `totalIncome`. Las categorias, operaciones y tipos de negocio deben coincidir en ambos contratos.
4. Reutilizar calculos de `frontend/src/lib` y la separacion entre `components/dashboard` y `components/ui`. Seguir el estilo del vecino; no renombrar archivos o campos sin necesidad funcional.

## Validacion y criterio de salida

Para un ejemplo documental del endpoint, comprobar con FastAPI TestClient status `200`, lista no vacia, campos requeridos y semantica del filtro. Para cambios funcionales, agregar el test del contrato afectado y compilar los consumidores. Un `200` sin aserciones de payload no cierra la tarea.

Tarea real de esta fase: documentar en ambos README `GET /api/metrics?operation_type=income` y verificar que todos los movimientos devueltos sean ingresos. Evidencia y limites en [Fase 3](../../verification.md#fase-3).