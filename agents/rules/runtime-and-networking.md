# Ejecucion, red y configuracion

## Alcance

`docker-compose.yml`, ambos Dockerfile, `frontend/vite.config.ts`, configuracion de solicitudes y documentacion de arranque. Concreta R07 y R11 de [Fase 2](../../.agents/rules/proposed-contributor-rules.md). Regla candidata pendiente de aprobacion final.

## Justificacion

[App.tsx](../../frontend/src/App.tsx) usa `VITE_API_BASE_URL` en el navegador; [vite.config.ts](../../frontend/vite.config.ts) usa `API_PROXY_TARGET` en el servidor Vite. [Compose](../../docker-compose.yml) publica puertos y configura el gateway. [backend/Dockerfile](../../backend/Dockerfile) inicia debugpy y Uvicorn con recarga; [frontend/Dockerfile](../../frontend/Dockerfile) inicia Vite dev.

## Guia

1. Obtener servicios y puertos de `docker compose config`, no de defaults recordados. Antes de actuar, consultar `docker compose ps`; no reiniciar servicios ajenos a la tarea.
2. Usar `VITE_API_BASE_URL` para un origen accesible al navegador y `API_PROXY_TARGET` para el destino accesible desde Vite. Un nombre de servicio Docker no es una URL publica del navegador. La variable VITE requiere reiniciar Vite para releer el entorno y recompilar si se cambia un build ya generado.
3. Al cambiar el puerto publicado `8000`, revisar `API_PROXY_TARGET`. El alias `host.docker.internal:host-gateway` permite el workaround observado; no demuestra haber arreglado la red interna. No fijar IP de contenedor ni deducir URLs publicas de Codespaces.
4. Si cambia conectividad, comparar `/api/metrics` directo y por Vite con timeout acotado. Revisar logs si difieren. Un `200` de `/docs` o `/health` no prueba que lleguen los movimientos a la pantalla.
5. Describir este Compose como desarrollo; no abrir debugpy a una red publica ni presentarlo como produccion validada. Para una tarea solo documental, validar la configuracion no exige iniciar servidores.

## Validacion y criterio de salida

Para documentacion de variables, contrastar sus consumidores, destino y alias con `docker compose config --format json`, y los comandos de desarrollo con los Dockerfile. Declarar si no se probo HTTP. Para cambios reales de conectividad, exigir ademas prueba HTTP del endpoint por ambos caminos; ante el arranque, distinguir disponibilidad del contenedor y disponibilidad de la aplicacion.

Inspeccionar la estructura JSON antes de escribir aserciones: la version de Compose validada devuelve `extra_hosts` como lista con `host.docker.internal=host-gateway`, no como mapa. Si otra version lo representa de otra forma, adaptar el lector estructurado sin cambiar Compose para satisfacer el validador.

Tarea real: agregar tabla bilingue de variables, advertencia sobre debugpy y alcance de las URLs; verificar los valores efectivos sin arrancar servicios. Evidencia en [Fase 3](../../verification.md#fase-3).