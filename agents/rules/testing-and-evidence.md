# Testing y evidencia proporcional

## Alcance

Validacion de tareas que afectan documentacion, utilidades, API, interfaz o red. Concreta R08-R09 de [Fase 2](../../.agents/rules/proposed-contributor-rules.md). Regla candidata pendiente de aprobacion final.

## Justificacion

[financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts) prueba calculos, no renderizado ni fetch. [test_routes.py](../../backend/tests/test_routes.py) usa TestClient sin proxy Vite; su prueba de resumen por negocio solo exige payload no vacio. [package.json](../../frontend/package.json) ofrece comandos separados para test, build y lint. Un titulo de test no garantiza la semantica que sugiere.

## Guia

1. Elegir primero la comprobacion que podria refutar el cambio: enlaces para documentacion, test de utilidad para formula, TestClient con aserciones para filtros, HTTP a traves de Vite para red. No sustituir una prueba de comportamiento por `git diff` si existe una comprobacion ejecutable adecuada.
2. Reutilizar los tests y helpers cercanos antes de crear infraestructura. Para filtros o comparacion, exigir valores esperados sobre datos controlados; verificar solo claves o status no demuestra esos calculos.
3. Desde la raiz, con Docker e imagenes y dependencias disponibles, usar `docker compose run --rm --no-deps frontend npm test` y `docker compose run --rm --no-deps backend pytest -q`. No necesitan servicios activos, no publican puertos por defecto y `--no-deps` evita iniciar dependencias. No afirmar que son libres de todo efecto: ejecutan procesos con los volumenes del repo y pueden generar caches.
4. Si faltan imagenes o dependencias, informar del requisito y preparar el entorno solo dentro del alcance autorizado. `exec` requiere el servicio activo; no iniciar servidores solo para ejecutar una prueba unitaria si `run` basta.
5. En cambios de tipos o componentes ejecutar tambien build; para renderizado, interacciones y red aportar comprobacion especifica o declarar el limite. Un build no es prueba visual. Para cambios solo documentales no exigir build de la app por rutina.
6. Registrar comando, salida relevante, advertencias y que no se verifico. Un test esperado como fallido puede documentar un defecto pendiente, pero no debe presentarse como comportamiento corregido.

## Validacion y criterio de salida

Tarea real: agregar comandos aislados en ambos README y ejecutarlos, seleccionando los dos tests de filtros del backend con `-k` para el caso documental. Cerrar cuando el lector pueda repetirlos desde la raiz y los resultados indiquen alcance: utilidades o rutas, no navegador ni proxy.

La matriz de tareas y resultados de [Fase 3](../../verification.md#fase-3) distingue las comprobaciones nuevas de los resultados historicos; no exigir repetir todas las suites por cada edicion de texto.