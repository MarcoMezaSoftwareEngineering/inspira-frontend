// La regla 90/180 del espacio Schengen, en días naturales: en cualquier
// ventana de 180 días seguidos no se puede pasar más de 90 dentro. El día de
// entrada y el de salida cuentan los dos.
const DIA = 86400000;

/** "2026-11-03" → número de día (UTC), para contar sin husos horarios. */
export const diaDe = (iso) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / DIA);
export const isoDe = (n) => new Date(n * DIA).toISOString().slice(0, 10);

/** Los días que pasó dentro, como conjunto: dos viajes solapados no suman doble. */
function diasDentro(estancias) {
  const dias = new Set();
  for (const e of estancias) {
    if (!e.entrada || !e.salida) continue;
    const a = diaDe(e.entrada), b = diaDe(e.salida);
    if (!(b >= a)) continue;
    for (let d = a; d <= b; d++) dias.add(d);
  }
  return dias;
}

/** Días usados en los 180 que terminan en `hasta` (incluido). */
export function usados(estancias, hasta) {
  const fin = diaDe(hasta);
  let n = 0;
  for (const d of diasDentro(estancias)) if (d > fin - 180 && d <= fin) n++;
  return n;
}

/**
 * Si entra el día `entrada`, ¿hasta qué día puede quedarse sin pasarse?
 * Devuelve null si ese mismo día ya no puede entrar.
 */
export function salidaMaxima(estancias, entrada) {
  const dias = diasDentro(estancias);
  const inicio = diaDe(entrada);
  const enVentana = (fin) => { let n = 0; for (let d = fin - 179; d <= fin; d++) if (dias.has(d)) n++; return n; };
  let ultimo = null;
  for (let d = inicio; d < inicio + 90; d++) {
    dias.add(d);
    if (enVentana(d) > 90) break;
    ultimo = d;
  }
  return ultimo === null ? null : isoDe(ultimo);
}
