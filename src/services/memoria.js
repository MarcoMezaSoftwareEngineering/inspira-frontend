// Memoria corta de peticiones: lo mismo, pedido desde varias pantallas, sale
// una vez del servidor.
//
// Es el patrón de pages/panel/novedades.js (promesa compartida + caducidad)
// hecho genérico. Tres reglas:
//
//   1. Mientras una petición está en vuelo, quien pide lo mismo recibe esa
//      misma promesa: no se lanza otra.
//   2. Lo que salió bien se recuerda `ms` milisegundos. Un fallo no se
//      recuerda nunca: el siguiente que pida vuelve a intentarlo.
//   3. Cada quien recibe su propia copia. Si una pantalla ordena o modifica la
//      lista que le llegó, la de la pantalla de al lado no cambia por debajo.
//
// No guarda nada en el navegador: vive lo que vive la pestaña.
// (09/10/2026, para Inspira Core: ver services/backofficeApi.js)

const memoria = new Map(); // clave → { t, ms, promesa }
const precargas = new Map(); // clave → { t, promesa }

/** Una copia independiente de una respuesta JSON. */
export function copiar(valor) {
  if (valor == null || typeof valor !== "object") return valor;
  try {
    return typeof structuredClone === "function" ? structuredClone(valor) : JSON.parse(JSON.stringify(valor));
  } catch {
    return valor;
  }
}

const esValido = (r) => Boolean(r?.ok);

/**
 * Lo que devuelve `cargar()`, compartido y recordado `ms` milisegundos.
 *
 * @param {string} clave       qué se pide (p. ej. la ruta de la API)
 * @param {() => Promise} cargar la petición de verdad
 * @param {object} [op]
 * @param {number} [op.ms=60000]  cuánto se recuerda lo que salió bien
 * @param {(r) => boolean} [op.valido]  qué cuenta como «salió bien» (por defecto, `r.ok`)
 */
export function recordar(clave, cargar, { ms = 60 * 1000, valido = esValido } = {}) {
  const previa = memoria.get(clave);
  if (previa && Date.now() - previa.t < previa.ms) return previa.promesa.then(copiar);

  const entrada = { t: Date.now(), ms, promesa: null };
  entrada.promesa = Promise.resolve()
    .then(cargar)
    .then((r) => {
      if (!valido(r) && memoria.get(clave) === entrada) memoria.delete(clave);
      return r;
    }, (e) => {
      if (memoria.get(clave) === entrada) memoria.delete(clave);
      throw e;
    });
  memoria.set(clave, entrada);
  return entrada.promesa.then(copiar);
}

/**
 * Olvida lo recordado: todo, o lo que empiece por `prefijo`. Se llama después
 * de escribir, para que la pantalla que se recarga vea lo recién guardado.
 */
export function olvidar(prefijo) {
  for (const mapa of [memoria, precargas]) {
    if (!prefijo) { mapa.clear(); continue; }
    for (const clave of [...mapa.keys()]) if (clave.startsWith(prefijo)) mapa.delete(clave);
  }
}

/**
 * Adelanta una petición que una pantalla va a hacer en cuanto se monte. La
 * primera que la pida en los próximos `ms` se lleva la respuesta; después se
 * olvida. Sirve para pedir los datos mientras aún se descarga el código.
 */
export function precargar(clave, cargar, { ms = 15 * 1000 } = {}) {
  if (precargas.has(clave)) return;
  const promesa = Promise.resolve().then(cargar);
  // Sin catch aquí, un fallo de red de algo que nadie llegó a pedir saldría
  // como promesa rechazada sin atender.
  promesa.catch(() => {});
  precargas.set(clave, { t: Date.now(), ms, promesa });
}

/** La promesa adelantada para `clave`, si la hay y no caducó. Solo una vez. */
export function tomarPrecarga(clave) {
  const p = precargas.get(clave);
  if (!p) return null;
  precargas.delete(clave);
  return Date.now() - p.t < p.ms ? p.promesa : null;
}
