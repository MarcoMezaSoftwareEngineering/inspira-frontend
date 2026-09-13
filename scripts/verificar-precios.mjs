// scripts/verificar-precios.mjs
// Comprueba que src/config/precios-inspira.json es copia exacta de la fuente
// única del backend (inspira-backend/src/modules/precios/precios-inspira.json).
//
// Uso:  npm run precios:verificar  [ruta-del-backend]
// Si el backend no está como carpeta hermana, avisa y sale sin error.
// Para corregir una diferencia: en el backend, `node scripts/sincronizar-precios.js`.
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const COPIA = resolve(aqui, "../src/config/precios-inspira.json");
const BACK = resolve(process.argv[2] || resolve(aqui, "../../inspira-backend"));
const ORIGEN = resolve(BACK, "src/modules/precios/precios-inspira.json");

JSON.parse(readFileSync(COPIA, "utf8"));

if (!existsSync(ORIGEN)) {
  console.log(`Sin backend en ${BACK}: no se puede comparar (se omite).`);
  process.exit(0);
}
if (readFileSync(ORIGEN, "utf8") !== readFileSync(COPIA, "utf8")) {
  console.error("Los precios del frontend difieren de la fuente única del backend.");
  console.error("Corrige con: cd inspira-backend && node scripts/sincronizar-precios.js");
  process.exit(1);
}
console.log("Precios del frontend = fuente única del backend.");
