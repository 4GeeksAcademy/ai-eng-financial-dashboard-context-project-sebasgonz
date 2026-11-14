# Documentacion, descubrimiento e higiene de cambios

## Alcance

`AGENTS.md`, README bilingue, `.agents/rules`, memory-bank, registro de verificacion y preparacion de commits. Concreta R10 de [Fase 2](proposed-contributor-rules.md) y el cierre documental acordado con el usuario. Regla aprobada tras la validacion de Fase 3.

## Justificacion

[AGENTS.md](../../AGENTS.md) es el punto de entrada para agents. [README.md](../../README.md) y [README.es.md](../../README.es.md) describen la misma ejecucion en dos idiomas. Las reglas aprobadas y el analisis historico se mantienen en el unico directorio `.agents/rules`. La memoria se indexa desde [memory-bank/README.md](../../memory-bank/README.md) y se divide por propósito. [verification.md](../../verification.md) separa resultados historicos de comprobaciones nuevas.

## Guia

1. Mantener `AGENTS.md` apuntando a `.agents/rules`. Distinguir reglas candidatas, reglas aprobadas e historial; no asumir que cualquier herramienta carga automaticamente archivos Markdown por estar en esa carpeta.
2. Si cambia un procedimiento, variable, contrato documentado o ubicacion de reglas, actualizar ambos README con el mismo significado y comprobar enlaces relativos desde cada documento. No crear directorios opcionales como skills o memory-bank solo para que un dibujo parezca existente.
3. En verification registrar tarea, regla aplicada, comprobacion, resultado y limite. Diferenciar defecto reproducido y corregido; no actualizar resultados historicos como si fueran una nueva ejecucion.
4. Antes de preparar el commit, revisar `git status --short --untracked-files=all` y el diff. Comprobar tambien archivos nuevos: `git diff --check` no los cubre mientras no esten rastreados; revisar con `git diff --no-index --check /dev/null <archivo>`, cuyo codigo `1` por diferencias no implica por si solo un error de whitespace.
5. No revertir cambios previos ajenos. Preparar rutas explicitas solo despues de la aprobacion requerida; revisar `git diff --cached --check` y `git diff --cached --stat` antes del commit dedicado. No usar `git add .` ni incluir caches generadas por comprobaciones.

## Validacion y criterio de salida

Tarea real: corregir las referencias de descubrimiento en AGENTS y los dos arboles README, enlazar las reglas y la memoria, y revisar todos los enlaces y el alcance del diff. La documentacion debe permitir llegar desde AGENTS a cada regla y desde cada regla a su evidencia real.

Esta tarea se considera validada con enlaces existentes, paridad de comandos y variables entre idiomas y ausencia de cambios fuera de la lista documental prevista. La higiene de commit se valida hasta el diff; crear el commit sigue bloqueado por la revision final del usuario.