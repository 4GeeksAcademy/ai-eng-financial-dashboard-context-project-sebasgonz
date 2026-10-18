# Datos financieros, fechas y precision

## Alcance

Generacion de movimientos en `backend/app/routes.py`, calculos de `frontend/src/lib` y textos de periodos. Concreta R04-R06 de [Fase 2](proposed-contributor-rules.md). Regla aprobada tras la validacion de Fase 3.

## Justificacion

[routes.py](../../backend/app/routes.py) usa `date.today()` y `random.seed`, genera 360 movimientos y redondea importes a dos decimales. [financial-utils.ts](../../frontend/src/lib/financial-utils.ts) agrupa fechas con getters locales tras `new Date(create_date)`, calcula porcentaje sobre ingresos y presenta USD sin decimales. Una semilla fija no congela el reloj ni da precision contable de produccion.

## Guia

1. Describir los movimientos como muestra, no persistencia. No asumir un ano fijo por usar semilla `42`. En tests de fechas, controlar el reloj o usar fechas explicitas; no alterar el generador global fuera de la tarea autorizada.
2. Mantener utilidad = ingresos - egresos y porcentaje = utilidad / ingresos * 100; sin ingresos, la utilidad sigue siendo calculable y el porcentaje actual es cero. Calcular antes de formatear, sin sumar etiquetas USD ni redondeos visuales.
3. Tratar `YYYY-MM-DD` como fecha de calendario. Si se modifica la agrupacion, evitar mezclar parseo UTC con getters locales y cubrir primer dia del mes y cruce de ano en UTC y `America/Los_Angeles`.
4. Distinguir reproduccion de un defecto de su correccion. Un test que espera la salida defectuosa solo prueba que el riesgo existe; no es un criterio de aceptacion para una futura correccion.

## Validacion y criterio de salida

Para documentar formulas, ejecutar `computeKPIs` con ingresos `1000` y egresos `250`: utilidad `750`, porcentaje `75`; comprobar tambien el caso sin ingresos. Para fechas, ejecutar `computeMonthlyData` con `2024-02-01` bajo ambas zonas. Una correccion futura solo estara lista si conserva febrero en ambas; si no hay permiso para cambiar comportamiento, registrar la diferencia como pendiente.

Ejecutar las utilidades mediante Vitest o transpilar en memoria con el paquete TypeScript existente. La importacion directa de este modulo con Node falla por la resolucion del import de tipos sin extension; no modificar los imports del proyecto para acomodar una comprobacion puntual ni instalar un runner adicional sin necesidad.

Tarea real: agregar al README bilingue semantica de los datos, ejemplo numerico y advertencia de fechas; contrastarlos con las funciones exportadas reales. Evidencia en [Fase 3](../../verification.md#fase-3).