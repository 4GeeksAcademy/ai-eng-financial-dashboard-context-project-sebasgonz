# Especificaciones de funcionalidades del frontend

Especificaciones de producto y criterios de aceptación para las funcionalidades solicitadas. Se revisó Swagger UI en `http://localhost:8000/docs` y el esquema OpenAPI servido por la instancia local antes de redactar estos documentos. Los contratos documentados aquí describen lo observado; los requisitos de producto y las diferencias con la implementación se señalan por separado.

**Alcance de estos entregables:** especificación de la capa frontend únicamente. `types.ts` contiene definiciones TypeScript de contratos y modelos de presentación; `components.md` especifica responsabilidades propuestas. No crear componentes React, no integrar endpoints ni alterar backend como parte de esta fase.

- [Filtro de rango de fechas en el dashboard principal](dashboard-date-range.md)
- [Tabla de alertas de anomalías](dashboard-anomaly-alerts.md)
- [Vista comparativa B2B vs B2C](b2b-vs-b2c-comparison.md)
- [Fase 1 — exploración de endpoints, payloads y desajustes](phase-1-api-exploration.md)
- [Tipos TypeScript de contratos y view-models](types.ts)
- [Especificación de componentes y composición](components.md)

El documento de exploración registra la consulta a `/docs`, parámetros/respuestas OpenAPI, muestras HTTP y contraste con el fetch actual del frontend. La implementación no se modificó.

## Nota sobre datos observados

En esta ejecución, `GET /api/metrics/facets` respondió con `min_date: 2025-11-01` y `max_date: 2026-10-28`. El backend genera movimientos de muestra dependientes de la fecha actual; esos valores son una observación de esta sesión, no fechas fijas para las pruebas ni para la interfaz.
