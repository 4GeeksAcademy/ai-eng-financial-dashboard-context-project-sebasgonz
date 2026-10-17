# Fase 2: convenciones y reglas propuestas

Estado: propuestas R01-R11 revisadas y aprobadas por el usuario el 2026-10-17 para cerrar la Fase 2. La aprobacion corresponde al analisis y su registro; no activa automaticamente instrucciones obligatorias ni autoriza modificar el codigo funcional.

Alcance acordado: frontend, backend, Docker y documentacion. Sin restricciones adicionales. El usuario autorizo el commit dedicado despues de revisar las propuestas.

Cada propuesta distingue un hecho observado, su riesgo y una accion verificable. Se omiten recomendaciones genericas sin evidencia local. Las validaciones descritas son criterios propuestos, no pruebas ya ejecutadas.

## Arquitectura y contratos

### R01. Mantener sincronizado el contrato de movimientos

- Hecho: [financial-types.ts](../../frontend/src/lib/financial-types.ts) declara `FinancialMovement` y las uniones de operaciones, categorias y negocios; [routes.py](../../backend/app/routes.py) mantiene sus equivalentes Pydantic y Literal. [App.tsx](../../frontend/src/App.tsx) devuelve `response.json()` sin validacion de estructura en tiempo de ejecucion.
- Riesgo: cambiar nombres, valores permitidos o tipos solo en un lado puede compilar y aun asi romper el consumo real.
- Regla propuesta: revisar ambos contratos cuando cambie un campo o valor de la API y actualizar los consumidores afectados. Conservar los nombres del JSON salvo migracion explicita; no suponer que la anotacion TypeScript valida la respuesta HTTP.
- Comprobacion: verificar una respuesta real de `/api/metrics` y los tests de rutas y utilidades afectados. Si cambia el contrato, agregar una comprobacion de los campos y valores modificados.

### R02. Respetar el lugar actual de los calculos

- Hecho: [App.tsx](../../frontend/src/App.tsx) consume `/api/metrics` y calcula KPIs y series mediante [financial-utils.ts](../../frontend/src/lib/financial-utils.ts); [routes.py](../../backend/app/routes.py) tambien ofrece endpoints de resumen, comparacion y alertas.
- Riesgo: modificar un endpoint analitico no cambia automaticamente los graficos actuales; agregar formulas en componentes puede duplicar la logica existente.
- Regla propuesta: para cambios del dashboard, seguir primero las llamadas reales de App a las utilidades. Reutilizar esas funciones; si se decide consumir agregados del backend, documentar la migracion y contrastar las formulas antes de cambiar el flujo.
- Comprobacion: identificar la peticion y funcion que alimentan el indicador modificado, no solo un endpoint de nombre parecido.

## Naming y organizacion

### R03. Conservar las convenciones locales por frontera

- Hecho: [financial-types.ts](../../frontend/src/lib/financial-types.ts) usa `create_date` y `operation_type` para el JSON, pero `totalIncome` y `profitPercent` para resultados del cliente. [kpi-row.tsx](../../frontend/src/components/dashboard/kpi-row.tsx) esta en `components/dashboard`, y [card.tsx](../../frontend/src/components/ui/card.tsx) en `components/ui`.
- Riesgo: renombrar campos a camelCase sin adaptador rompe el contrato; mezclar componentes especificos con primitivas dificulta localizar responsabilidades.
- Regla propuesta: conservar snake_case en los campos de transporte y camelCase en resultados del cliente, sin imponer una conversion global. Situar componentes del dashboard junto a sus vecinos y primitivas reutilizables junto a las de UI.
- Comprobacion: comparar con el tipo, importaciones y componente vecino del archivo tocado; evitar renombrados ajenos al cambio solicitado.

## Datos, fechas y finanzas

### R04. Tratar el generador como datos de muestra con reloj variable

- Hecho: [routes.py](../../backend/app/routes.py) genera 30 movimientos por cada uno de los 12 meses; usa `date.today()` y `random.seed(seed)`. La semilla no fija las fechas entre meses o anos y modifica el generador aleatorio global.
- Riesgo: snapshots con fechas fijas pueden caducar; pruebas de otras funciones aleatorias pueden depender del orden de ejecucion.
- Regla propuesta: no presentar la semilla `42` como una fecha congelada ni como persistencia. Para tests de fechas, controlar el reloj o derivar el rango de fixtures explicitos; si se toca el generador, evaluar aislar su estado aleatorio en vez de agregar mas dependencias del estado global.
- Comprobacion: cubrir un cambio de ano y comprobar que los tests no necesitan movimientos del ano actual para pasar.

### R05. Evitar agrupaciones mensuales dependientes de la zona horaria

- Hecho: [financial-utils.ts](../../frontend/src/lib/financial-utils.ts) convierte `create_date` con `new Date(...)` y extrae ano y mes con getters locales. [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts) incluye una fecha `2024-02-01`, pero no configura zonas horarias.
- Riesgo: una fecha ISO sin hora se interpreta en UTC; en una zona al oeste de UTC puede corresponder localmente al ultimo dia del mes anterior.
- Regla propuesta: al tocar esta agrupacion, tratar la fecha como fecha de calendario y usar una convencion coherente de extremo a extremo; no mezclar parseo UTC con getters locales. Agregar cobertura del primer dia del mes antes de considerar resuelto el riesgo.
- Comprobacion: probar el mismo conjunto en UTC y en `America/Los_Angeles`, incluyendo primer dia de mes y cruce de ano. Esta fase documenta el riesgo, no modifica la implementacion.

### R06. Conservar formulas y separar presentacion de precision

- Hecho: [financial-utils.ts](../../frontend/src/lib/financial-utils.ts) define utilidad como ingresos menos egresos, porcentaje sobre ingresos y cero si no hay ingresos. El formato de moneda muestra USD sin decimales; [routes.py](../../backend/app/routes.py) genera importes con dos decimales.
- Riesgo: sumar importes ya formateados pierde precision; cambiar la base del porcentaje altera el significado del KPI.
- Regla propuesta: calcular con importes numericos, aplicar formato solo para mostrar y mantener las formulas existentes salvo cambio de negocio explicito. No deducir de la etiqueta USD una garantia de integracion monetaria o precision contable de produccion.
- Comprobacion: ampliar los tests existentes para cero ingresos, egresos mayores a ingresos y centavos cuando el cambio afecte esos casos.

## Docker y configuracion

### R07. Distinguir origen del navegador y destino interno del proxy

- Hecho: [App.tsx](../../frontend/src/App.tsx) usa `VITE_API_BASE_URL`; [vite.config.ts](../../frontend/vite.config.ts) usa `API_PROXY_TARGET` con alternativa `http://backend:8000`. [docker-compose.yml](../../docker-compose.yml) establece el destino por `host.docker.internal:8000` y publica `8000:8000`.
- Riesgo: usar un nombre interno de Docker como origen del navegador falla fuera de esa red; cambiar el puerto publicado sin actualizar el proxy rompe el camino por el gateway.
- Regla propuesta: mantener separadas ambas variables y obtener servicios y puertos de la configuracion efectiva. Al cambiar el puerto del backend, revisar tambien el destino del proxy. Conservar el workaround del gateway mientras sea necesario y no afirmar que corrige la causa interna de red.
- Comprobacion: ejecutar `docker compose config`; probar `/api/metrics` directamente y por el puerto publicado de Vite. `/docs` o `/health` por si solos no prueban que la pantalla reciba movimientos. Usar URLs reenviadas de Codespaces cuando corresponda.

## Testing

### R08. Exigir aserciones que prueben el comportamiento nombrado

- Hecho: [test_routes.py](../../backend/tests/test_routes.py) contiene `test_metrics_summary_by_week_honors_business_type_filter`, que comprueba status y payload no vacio, pero no verifica el filtro. El test de comparacion verifica claves con fechas fijas, sin verificar los importes de los dos periodos.
- Riesgo: ignorar un filtro o calcular mal los deltas podria no hacer fallar esos tests.
- Regla propuesta: al cambiar filtros o comparaciones, agregar fixtures controlados y aserciones de valores esperados, no solo presencia de claves, respuesta no vacia o status `200`.
- Comprobacion: comprobar que un cambio local que ignore el filtro o altere el delta haria fallar la prueba correspondiente; no considerar el nombre del test evidencia de cobertura.

### R09. Elegir la validacion segun el cambio y declarar sus limites

- Hecho: [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts) prueba utilidades, no renderizado de App; [test_routes.py](../../backend/tests/test_routes.py) usa TestClient y no atraviesa el proxy de Vite. [package.json](../../frontend/package.json) ofrece `test`, `build` y `lint`.
- Riesgo: tests unitarios verdes no detectan un `502` entre contenedores ni una etiqueta incorrecta en pantalla.
- Regla propuesta: reutilizar las suites existentes para su logica; agregar build cuando cambien tipos o componentes, y prueba por el proxy cuando cambie conectividad. Para comportamiento visual o del fetch, aportar una prueba de ese comportamiento o declarar que queda sin verificar.
- Comprobacion: registrar comando, resultado y alcance real. Los comandos de contenedor temporal `docker compose run --rm frontend npm test` y `docker compose run --rm backend pytest -q` no requieren que el servicio objetivo este ya corriendo; `exec` si lo requiere. `run` puede iniciar dependencias declaradas y no es necesariamente libre de efectos sobre servicios.

## Documentacion y DX

### R10. Sincronizar instrucciones bilingues y referencias ejecutables

- Hecho: [README.md](../../README.md) y [README.es.md](../../README.es.md) describen el mismo arranque y configuracion de API; [verification.md](../../verification.md) registra que ambos referian antes a una plantilla de entorno inexistente.
- Riesgo: corregir un idioma y no el otro deja dos procedimientos incompatibles; copiar rutas no comprobadas bloquea a nuevos contribuidores.
- Regla propuesta: al cambiar ejecucion o variables, actualizar ambos README y comprobar que los archivos y comandos citados existen. Separar resultados historicos de afirmaciones sobre el estado actual de los servicios.
- Comprobacion: contrastar instrucciones con Compose, scripts y archivos presentes, y registrar fecha o fase de las pruebas sin presentarlas como una nueva ejecucion.

### R11. Tratar el entorno actual como desarrollo, no produccion validada

- Hecho: [backend/Dockerfile](../../backend/Dockerfile) arranca debugpy y Uvicorn con `--reload`; [frontend/Dockerfile](../../frontend/Dockerfile) ejecuta Vite en modo dev. [docker-compose.yml](../../docker-compose.yml) monta el codigo y publica el puerto de depuracion `5678`.
- Riesgo: reutilizar este arranque como despliegue de produccion expone herramientas de desarrollo y no aporta evidencia de endurecimiento ni autenticacion.
- Regla propuesta: describir Compose como entorno de desarrollo. No exponer el depurador publicamente ni anunciar este arranque como apto para produccion sin una configuracion y validacion separadas.
- Comprobacion: revisar comandos de los Dockerfile y puertos publicados antes de documentar un despliegue; no inventar requisitos de produccion ausentes del repo.

## Evidencia de esta revision

- Se leyeron contratos, utilidades, tests de frontend y backend, Compose y Dockerfile. Los demas puntos se contrastaron con los archivos revisados durante la Fase 1; no se repitieron sus pruebas HTTP ni se presentan como resultados nuevos.
- Se comprobaron automaticamente los 27 enlaces locales del borrador y las cuatro partes de cada una de las 11 propuestas: hecho, riesgo, regla y comprobacion. No se encontraron enlaces ausentes ni propuestas incompletas.
- Para R05 se ejecuto `TZ=America/Los_Angeles node -e 'const value = new Date("2024-02-01"); console.log(value.getMonth() + 1, value.getUTCMonth() + 1)'`. La reproduccion equivalente imprimio mes local `1` y mes UTC `2`: confirma el desplazamiento del mes en la operacion usada por la utilidad, no una ejecucion de toda la suite bajo esa zona.
- Esta fase es documental. No se ejecutaron nuevamente tests de aplicacion, build ni servicios; no se afirma haber corregido los riesgos detectados.

## Revision y cierre

- El usuario aprobo las 11 propuestas y solicito documentar el cierre en la seccion Fase 2 de [verification.md](../../verification.md).
- No se cambiaron contratos, calculos, tests ni configuracion funcional en esta fase.
- El commit dedicado incluye las propuestas y su registro de verificacion; no sustituye el commit de Fase 1 ni activa automaticamente estas reglas.