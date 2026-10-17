# Verificación del resumen del proyecto

## Resumen

- **Qué hace:** Dashboard en React y TypeScript que presenta ingresos, egresos, utilidad neta, porcentaje de utilidad y gráficos mensuales. El backend actual genera movimientos de muestra; el repo no configura una fuente financiera de producción ni una base de datos.
- **Cómo se conecta:** El frontend solicita `GET /api/metrics`. Vite hace proxy de `/api`; el destino se configura con `API_PROXY_TARGET`, y Compose lo dirige mediante `host.docker.internal:8000`. `VITE_API_BASE_URL` puede cambiar el origen de las solicitudes del navegador. FastAPI sirve la API y su documentación interactiva.
- **Cómo se ejecuta:** Desde la raíz, ejecutar `docker compose up --build`. Compose publica frontend `5173:5173`, backend `8000:8000` y depurador del backend `5678:5678`. En Codespaces, abrir los puertos reenviados; con Docker local, usar los puertos publicados en localhost. Detener con `Ctrl+C`.

## Contraste con el código

Marcas asignadas por el agente a petición del usuario: `✅` confirmado, `❌` afirmación incorrecta o intento fallido, `﹖` evidencia insuficiente. Las marcas sobre intentos anteriores describen lo ocurrido entonces, no un fallo pendiente del estado final.

| Marca | Afirmación | Por qué se asigna y dónde contrastarla |
| --- | --- | --- |
| ✅ | La app combina frontend React/TypeScript y backend FastAPI. | [App.tsx](frontend/src/App.tsx) consume la API registrada en [main.py](backend/app/main.py). |
| ✅ | Los movimientos son de muestra, no datos financieros persistidos. | [routes.py](backend/app/routes.py) genera 360 movimientos con semilla `42` y fechas dependientes del día actual; no consulta una base de datos. |
| ✅ | El cliente calcula KPIs y agregados mensuales a partir de `/api/metrics`. | [App.tsx](frontend/src/App.tsx) llama a `computeKPIs` y `computeMonthlyData` de [financial-utils.ts](frontend/src/lib/financial-utils.ts). La pantalla no consume los demás endpoints analíticos del backend. |
| ✅ | Vite reenvía `/api` y Compose configura el destino por el gateway del host. | [vite.config.ts](frontend/vite.config.ts) lee `API_PROXY_TARGET`; [docker-compose.yml](docker-compose.yml) lo establece y agrega el alias `host.docker.internal`. Sin esa variable, el destino sigue siendo `http://backend:8000`. |
| ✅ | El período enviado al encabezado refleja los meses inicial y final recibidos. | [App.tsx](frontend/src/App.tsx) ordena las fechas y forma la etiqueta, en lugar de enviar el texto fijo `2024 - Full Year`. No se afirma que sean datos del año calendario actual. |
| ✅ | Compose declara dos servicios y publica `5173`, `8000` y `5678`. | [docker-compose.yml](docker-compose.yml) declara `frontend` y `backend`; `5678` es el depurador del backend, no otro servicio ni una URL HTTP. |
| ❌ | El mensaje de error demostraba que FastAPI no generaba o enviaba datos. | El endpoint directo respondió `200`; la petición por Vite devolvió `502`. El fallo observado estaba en el trayecto del proxy, no en la generación de movimientos. |
| ❌ | Los datos correspondían al período fijo `2024 - Full Year`. | La API usa fechas dinámicas. Se corrigió la etiqueta del dashboard para derivarla de la respuesta. |
| ❌ | Existía una plantilla `frontend/.env.example` que se podía copiar. | El archivo no se encontró. Ambos README se corrigieron para indicar `VITE_API_BASE_URL` en `frontend/.env.local`. |
| ❌ | El repo configura una fuente financiera de producción y autenticación. | La implementación revisada genera datos de muestra y no configura autenticación. Docker Compose permite ejecutar el entorno de desarrollo, pero no demuestra una infraestructura de producción. |
| ﹖ | Se conoce la causa de infraestructura exacta del timeout entre contenedores. | Se comprobó DNS correcto y timeout TCP entre servicios, pero no se aisló una regla de firewall, política o causa concreta del entorno Docker. |
| ﹖ | Se verificó visualmente el dashboard completo en el navegador. | Se ejecutaron comprobaciones HTTP, build y tests unitarios; no se realizó una prueba visual o de extremo a extremo en navegador. |

## Historial del trabajo y ajustes

### 1. Identificar cómo ejecutar el proyecto

✅ Se consultaron los README, Compose, los Dockerfile y los scripts del frontend. La instrucción respaldada por el repo era `docker compose up --build`, no iniciar servicios inventados ni asumir una base de datos. Las ubicaciones `.agents/` y `memory-bank/` indicadas por [AGENTS.md](AGENTS.md) no estaban presentes durante la revisión.

✅ `docker compose config` confirmó las asignaciones de puertos y `docker compose ps` confirmó los contenedores activos después del arranque. Los puertos de las URLs se obtuvieron de esa evidencia. `localhost` corresponde al entorno donde están publicados; en Codespaces, la URL accesible al usuario se obtiene del reenvío de puertos, y no se dedujo una dirección pública fija.

❌ La comprobación inicial de la página `/` y `/docs`, ambas con `200`, no era suficiente para afirmar que los datos financieros llegaban al frontend. Tras el error comunicado por el usuario, se añadió la prueba decisiva: solicitar `/api/metrics` por la misma entrada que usa la pantalla.

### 2. Diagnosticar por qué no llegaban los datos al frontend

El usuario veía: `No se pudo cargar la informacion financiera. Revisa la API de backend.` Ese texto es un mensaje genérico del `catch` de [App.tsx](frontend/src/App.tsx); por sí solo no identifica la causa.

| Marca | Prueba o intento | Resultado y conclusión |
| --- | --- | --- |
| ✅ | Petición directa a `http://127.0.0.1:8000/api/metrics`. | Respondió `200` con JSON. FastAPI y la ruta financiera estaban disponibles por el puerto publicado. |
| ❌ | La misma petición a `http://127.0.0.1:5173/api/metrics`. | Respondió `502 Bad Gateway`; el log de Vite mostró `connect ETIMEDOUT 172.18.0.2:8000`. El camino a través del proxy fallaba. |
| ✅ | Comparar la IP real del backend, el DNS dentro del frontend y la red de Compose. | `backend` resolvía a `172.18.0.2` y ambos contenedores compartían la red bridge. No se encontró un nombre equivocado ni una IP antigua. Estas IP son evidencia de esa sesión, no valores para fijar en la configuración. |
| ❌ | Conectar desde el frontend directamente a `backend:8000` y reiniciar el backend. | La conexión siguió expirando después del reinicio. Reiniciar el proceso no corrigió el problema. |
| ✅ | Conectar desde el frontend al gateway observado `172.18.0.1:8000`. | Tanto `/health` como `/api/metrics` respondieron `200`. Existía un camino funcional a través del puerto publicado en el host. |
| ❌ | Usar `host.docker.internal` antes del ajuste. | Ese nombre no resolvía en el contenedor. Fue necesario declarar el alias en Compose. |

Conclusión ajustada: no era que la API careciera de datos; Vite no conseguía conectar al backend por la dirección interna del servicio en ese entorno. La evidencia permitió localizar el fallo, pero no demostrar la causa de infraestructura exacta.

### 3. Recuperar la conexión sin cambiar la API

✅ En [docker-compose.yml](docker-compose.yml) se agregó `host.docker.internal:host-gateway` a `extra_hosts` del frontend y se definió `API_PROXY_TARGET=http://host.docker.internal:8000`. En [vite.config.ts](frontend/vite.config.ts), el destino del proxy pasó a leer esa variable, manteniendo `http://backend:8000` como alternativa cuando no está definida.

La ruta resultante en Compose es:

```text
Navegador -> frontend /api/metrics -> proxy de Vite
		 -> host.docker.internal:8000 -> backend /api/metrics
```

Se recreó el frontend para aplicar el alias y la variable. El primer request coincidió con el arranque y recibió una conexión cerrada; al repetir la prueba, la página y `/api/metrics` por Vite respondieron `200`. No fue necesario modificar las rutas de FastAPI ni activar una URL de backend distinta en el navegador.

Este ajuste es una alternativa comprobada para el entorno observado, no una reparación demostrada de la red interna de Docker. Depende del puerto `8000` publicado en Compose; si cambia ese puerto, debe actualizarse el destino del proxy. Una red interna funcional puede usar directamente `backend:8000`.

### 4. Contrastar el resumen y corregir desajustes

✅ Se redactó el resumen de propósito, conexión y ejecución, y se comparó con el código. Además de describir el flujo real, se corrigieron dos diferencias: el período fijo del dashboard y la referencia al archivo de entorno inexistente en los README en español e inglés.

❌ La primera interpretación del formato de revisión no coincidía con lo solicitado: el agente rellenó las marcas antes de que el usuario revisara el resumen. Después se dejaron vacías y se sustituyó `J/X/?` por `✅/❌/﹖`. En esta revisión, el usuario pidió explícitamente que el agente volviera a asignarlas y explicara el razonamiento; por eso ahora la tabla está evaluada y acompañada por este historial.

✅ Se creó el commit dedicado `5065c77` (`fix: verify dashboard summary and runtime`), con los ajustes de proxy pendientes de la fase anterior, el período dinámico, ambos README y la primera versión de esta nota. Git quedó limpio inmediatamente después de ese commit. Las revisiones posteriores de este documento, incluido este historial, no forman parte de aquel commit.

## Verificaciones ejecutadas

Los siguientes resultados corresponden a la fase anterior registrada en la conversación; esta ampliación documental no vuelve a ejecutar los servicios ni las pruebas.

- Los intentos iniciales de build con `docker compose exec` y directamente en el host fallaron: el frontend no estaba activo y el host no tenía `tsc`, respectivamente. Se usó un contenedor temporal con las dependencias del proyecto para validar, en lugar de interpretar esos fallos como errores del código.
- `docker compose config` — correcto.
- `docker compose run --rm frontend npm run build` — correcto; Vite avisa que un chunk supera 500 kB.
- `docker compose run --rm frontend npm test` — correcto, 5 tests.
- `docker compose run --rm backend pytest -q` — correcto, 15 tests; pytest informa una advertencia de deprecación de Starlette/httpx.
- `docker compose up --build -d` y requests HTTP a `/` y `/api/metrics` vía Vite — ambos devolvieron `200`; Compose informa ambos servicios activos.

Los tests existentes del frontend verifican utilidades financieras, no el nuevo texto del período ni la interacción visual. El build valida la compilación de ese cambio, pero no sustituye una prueba de comportamiento en navegador. Las advertencias de bundle y deprecación se registraron sin tratarlas como fallos ni corregir dependencias ajenas al alcance.

## Fase 2

### Objetivo y decisiones del usuario

Identificar convenciones útiles y patrones arriesgados para futuros contribuidores o agents, conservando solo hallazgos vinculados a archivos o comportamientos concretos. El usuario eligió revisar frontend, backend, Docker y documentación, sin restricciones adicionales, y guardar las reglas propuestas en `.agents/rules`. También pidió revisar las propuestas antes del commit y aprobó las 11 el 2026-10-17.

### Trabajo realizado

✅ Se contrastaron contratos, utilidades financieras, tests, Compose y Dockerfile con el código real y las referencias de la Fase 1. Se descartaron recomendaciones genéricas sin evidencia local.

✅ Se redactaron [11 reglas propuestas](.agents/rules/proposed-contributor-rules.md), agrupadas por categoría. Cada regla identifica un hecho del repo, su riesgo, una acción propuesta y un criterio de comprobación:

| Categoría | Reglas | Evidencia que motivó las propuestas |
| --- | --- | --- |
| Arquitectura y contratos | R01–R02 | Python y TypeScript definen el mismo contrato por separado; App calcula los indicadores en cliente aunque la API también ofrece agregados. |
| Naming y organización | R03 | Los campos del JSON usan snake_case, los resultados del cliente camelCase; existen carpetas separadas para componentes del dashboard y primitivas UI. |
| Datos, fechas y finanzas | R04–R06 | El generador usa reloj y estado aleatorio global; la agrupación mensual mezcla parseo UTC con getters locales; el formato USD oculta decimales que sí existen en los importes. |
| Docker y configuración | R07 | El origen del navegador y el destino de Vite usan variables distintas; el camino por el gateway depende del puerto publicado. |
| Testing | R08–R09 | Algunos tests comprueban respuesta y estructura, pero no el filtro o los importes que sugieren sus nombres; los tests unitarios no atraviesan el proxy ni renderizan App. |
| Documentación y DX | R10–R11 | Ambos README describen el mismo procedimiento; el arranque real usa Vite dev, recarga de Uvicorn y debugpy, no una configuración de producción validada. |

### Comprobaciones y límites

✅ Se validaron los enlaces locales y la presencia de hecho, riesgo, regla y comprobación en las 11 propuestas. Antes del cierre había 27 enlaces; se volvió a validar el documento tras registrar la aprobación.

✅ Se reprodujo el riesgo de R05 con Node bajo `TZ=America/Los_Angeles`: para `new Date("2024-02-01")`, el mes local fue `1` (enero) y el mes UTC `2` (febrero). Esto confirma el desplazamiento en la operación usada por la utilidad; no equivale a ejecutar toda la aplicación o su suite en esa zona horaria.

﹖ No se comprobó nuevamente el funcionamiento completo en navegador ni se repitieron build, tests o pruebas HTTP de la Fase 1. Esta fase es documental y no afirma que se hayan corregido los riesgos detectados.

### Resultado y commit dedicado

✅ El usuario aprobó el análisis y las propuestas. Solo se incorporaron el documento de reglas y esta sección de verificación, sin cambios funcionales ni activación automática de las reglas como instrucciones obligatorias.

Mensaje del commit de cierre: `Fase 2 — Identificar convenciones y patrones arriesgados (con el agent) completada`.