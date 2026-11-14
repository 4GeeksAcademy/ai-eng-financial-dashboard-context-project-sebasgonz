# Brief del producto

## Propósito

Financial Metrics Dashboard es una aplicación de ejemplo que presenta métricas financieras a partir de movimientos sintéticos. No se describe como un producto conectado a bancos ni como un sistema contable con datos persistentes. La descripción general está en [README.es.md](../README.es.md).

## Usuario y flujo implementado

La pantalla carga movimientos con `GET /api/metrics` ([App.tsx](../frontend/src/App.tsx)). El frontend calcula ingresos, egresos, utilidad, porcentaje de utilidad sobre ingresos y agregados mensuales ([financial-utils.ts](../frontend/src/lib/financial-utils.ts)); muestra cuatro KPI y dos gráficos ([kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx)).

El contrato del movimiento incluye fecha, importe, tipo de operación, categoría y tipo de negocio; sus tipos se representan en [financial-types.ts](../frontend/src/lib/financial-types.ts) y la API en [routes.py](../backend/app/routes.py). El backend también ofrece endpoints analíticos adicionales; la interfaz descrita aquí solicita `/api/metrics` y calcula los KPI en el cliente. No se debe asumir que consume los otros endpoints.

## Límites conocidos del alcance

- La API genera 360 movimientos de muestra y no configura persistencia ni una fuente financiera externa ([routes.py](../backend/app/routes.py), [docker-compose.yml](../docker-compose.yml)).
- No se afirma que existan autenticación ni una configuración de despliegue productivo; los gaps observables se detallan en [progress.md](progress.md).
- La presentación de moneda no implica garantía de precisión contable de producción.

## Fuentes de contexto

- [README de ejecución y contrato](../README.es.md)
- [Estado, verificaciones y gaps](progress.md)
- [Stack y entorno técnico](techContext.md)
