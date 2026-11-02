#!/bin/bash
# Compila el frontend contra la API ficticia y captura el panel con los fixtures.
#   scripts/panel-qa/qa.sh <nombre> <puerto> <carpeta-salida> [--solo <nombre|ruta>[,…]] [--vista movil|escritorio|tableta[,…]]
# Compila en dist-qa-<nombre> con VITE_API_URL=http://localhost:<puerto>, lo sirve
# en ese puerto, captura y lo apaga. Puertos distintos permiten varias pasadas a la vez.
# Las opciones después de la carpeta pasan tal cual a capturar.mjs (ver su cabecera):
# sin --vista, móvil y escritorio; la tableta (834 px) solo si se pide.
set -uo pipefail
cd "$(dirname "$0")/../.."
BUN="${BUN:-$HOME/.openclaw/runtime/current/bin/bun}"
nombre="${1:?nombre}"; puerto="${2:?puerto}"; salida="${3:?salida}"; shift 3
out="dist-qa-$nombre"
VITE_API_URL="http://localhost:$puerto" "$BUN" x vite build --outDir "$out" --emptyOutDir --logLevel error || { echo "La compilación falló"; exit 2; }
lsof -ti "tcp:$puerto" | xargs kill 2>/dev/null; sleep 0.3
"$BUN" x vite preview --outDir "$out" --port "$puerto" --strictPort >/dev/null 2>&1 &
srv=$!
for _ in $(seq 1 60); do curl -s -o /dev/null "http://localhost:$puerto/" && break; sleep 0.25; done
"$BUN" scripts/panel-qa/capturar.mjs --base "http://localhost:$puerto" --salida "$salida" "$@"
rc=$?
kill "$srv" 2>/dev/null; lsof -ti "tcp:$puerto" | xargs kill 2>/dev/null
exit $rc
