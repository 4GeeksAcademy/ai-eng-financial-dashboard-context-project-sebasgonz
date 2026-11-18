# Especificación: tabla de alertas de anomalías

## Objetivo

Resaltar períodos en los que el egreso/outcome registrado aumentó inesperadamente frente al promedio de los tres períodos inmediatamente anteriores.

## Requisitos de producto

- Colocar una tabla bajo los gráficos existentes del dashboard principal.
- La tabla tiene cuatro columnas: período, outcome registrado, media móvil de los tres períodos anteriores e incremento porcentual.
- El umbral se controla mediante un input numérico con mínimo `0.01`, máximo `1.0` y valor inicial `0.3`. El valor es un ratio: por ejemplo, `0.3` significa un aumento superior al 30%.
- Considerar anomalía cuando `(outcome actual - media de los 3 períodos anteriores) / media de los 3 períodos anteriores > threshold`. Mostrar el porcentaje como ratio multiplicado por 100 para el usuario.
- Los tres períodos de referencia deben ser los tres períodos cronológicos inmediatamente anteriores al período evaluado; no incluir el período actual. No emitir alerta si no hay tres períodos previos o si la media base es cero.
- Usar agrupación mensual de forma predeterminada, coherente con los gráficos actuales, salvo decisión de producto distinta.
- Aplicar el rango de fechas activo en el dashboard ([dashboard-date-range.md](dashboard-date-range.md)). El intervalo filtra los datos/alertas mostrados; para calcular la primera alerta del intervalo, se requiere disponer de los tres períodos cronológicos anteriores como contexto de cálculo, aunque sean anteriores a la fecha de inicio seleccionada. Asegurar que esos períodos previos no se presentan como alertas fuera del rango activo.
- Si no hay alertas para el umbral y rango actuales, conservar la tabla y mostrar un estado vacío explícito, por ejemplo: “No se detectaron anomalías para el rango y umbral seleccionados”.
- Mostrar estado de carga y error de consulta conforme a los patrones existentes, sin confundir error con lista vacía.

## API y contrato observado

`GET /api/metrics/alerts` acepta:

| Parámetro | Observación actual |
| --- | --- |
| `threshold` | Opcional, por defecto `0.3`; mínimo `0` sin máximo documentado. |
| `group_by` | Opcional; `day`, `week` o `month`; por defecto `month`. |
| `start_date`, `end_date` | Opcionales, formato date. |
| `business_type` | Opcional; `B2B` o `B2C`. |

Devuelve una lista de objetos con `period`, `outcome_total`, `baseline_average` e `increase_ratio`. La respuesta no proporciona explícitamente el porcentaje escalado a 100; la presentación debe multiplicar el ratio por 100.

## Diferencias entre requisito y backend actual

- **Ventana de cálculo:** el endpoint actual calcula `baseline_average` como el promedio de todos los outcome de períodos anteriores acumulados, no el promedio móvil de solo los tres períodos anteriores. Se necesita cambiar el endpoint o calcular la ventana correctamente en otra capa antes de que cumpla la especificación.
- **Rango y contexto:** el endpoint filtra los movimientos por fecha antes de agrupar y detectar alertas. Por tanto, al limitar fechas pierde períodos anteriores al inicio que podrían ser necesarios como contexto de la primera alerta del rango. La implementación debe preservar el contexto de cálculo y limitar la salida al rango solicitado.
- **Límite del umbral:** el endpoint acepta cualquier valor `>= 0`; no limita el valor a `1.0` ni aplica el mínimo `0.01`. El control de interfaz debe validar el rango solicitado; definir con el equipo de producto si el backend también debe rechazar fuera de rango.
- **Semántica de período inicial:** no se genera alerta para el primer período sin histórico; el requisito de tres períodos previos implica esperar tres períodos completos antes de evaluar.

## Criterios de aceptación

1. Debajo de los gráficos aparece una tabla persistente con las cuatro columnas especificadas.
2. El input arranca en `0.3` y no permite confirmar valores menores que `0.01` ni mayores que `1.0`.
3. Cambiar el umbral actualiza la lista usando ese ratio, sin tratar `30` como equivalente a `0.3`.
4. Cada fila incluye período, outcome, media de exactamente los tres períodos anteriores e incremento porcentual coherente con esos valores.
5. Períodos sin tres períodos anteriores y períodos cuya media previa sea cero no generan una alerta.
6. La fecha activa de inicio y fin limita las filas presentadas. El cálculo usa correctamente los datos previos necesarios, sin exponer como resultado períodos fuera del rango.
7. Si la respuesta es una lista vacía, se muestra el mensaje explícito de estado vacío. Si la solicitud falla, se muestra error y no el estado vacío.
8. Los importes y porcentajes tienen formato legible y consistente con las demás métricas.

## Validación sugerida

- Datos de prueba con una secuencia conocida de más de tres meses, para verificar baseline exacto, ratio, umbral y orden temporal.
- Casos de inicio de serie, baseline cero, ratio exactamente igual al umbral (no alerta, según condición estricta `>`), lista vacía y error HTTP.
- Fechas con contexto anterior al inicio del intervalo y último período incluido en el rango.

## Evidencia de exploración

En la exploración de Swagger local, la llamada `GET /api/metrics/alerts?threshold=0.3` devolvió HTTP 200 y cuatro alertas; sus campos fueron `period`, `outcome_total`, `baseline_average` e `increase_ratio`. La respuesta observada no demuestra la ventana de tres períodos exigida; el código y el contrato actual muestran que se usa todo el histórico anterior.
