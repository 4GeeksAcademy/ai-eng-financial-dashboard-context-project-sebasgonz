# Especificaciones de funcionalidades del frontend

Especificaciones de producto y criterios de aceptación para las funcionalidades solicitadas. Se revisó Swagger UI en `http://localhost:8000/docs` y el esquema OpenAPI servido por la instancia local antes de redactar estos documentos. Los contratos documentados aquí describen lo observado; los requisitos de producto y las diferencias con la implementación se señalan por separado.

**Alcance de estos entregables:** especificación de la capa frontend únicamente. No crear componentes React, no integrar endpoints ni alterar backend como parte de estas fases.

## Fase 1 — Requisitos y exploración de API

Especificaciones funcionales y registro de cómo los requisitos se relacionan con la API observada.

- [Filtro de rango de fechas en el dashboard principal](dashboard-date-range.md)
- [Tabla de alertas de anomalías](dashboard-anomaly-alerts.md)
- [Vista comparativa B2B vs B2C](b2b-vs-b2c-comparison.md)
- [Especificación de componentes y composición](components.md)
- [Fase 1 — exploración de endpoints, payloads y desajustes](phase-1-api-exploration.md)

La exploración registra la consulta a `/docs`, parámetros y respuestas OpenAPI, muestras HTTP y contraste con el fetch actual del frontend. Los requisitos y diferencias respecto al contrato real se detallan en sus especificaciones; la implementación no se modificó.

## Fase 2 — Tipos y diseño de componentes

Definiciones de tipos TypeScript para los contratos observados y modelos de presentación, además de la propuesta de responsabilidades y composición de componentes. Son documentos de diseño, no implementación.

- [Tipos TypeScript de contratos y view-models](types.ts)
- [Tipos TypeScript de respuestas de API](api-types.ts)
- [Tipos TypeScript de parámetros de consulta](param-types.ts)

## Nota sobre datos observados

En esta ejecución, `GET /api/metrics/facets` respondió con `min_date: 2025-11-01` y `max_date: 2026-10-28`. El backend genera movimientos de muestra dependientes de la fecha actual; esos valores son una observación de esta sesión, no fechas fijas para las pruebas ni para la interfaz.
