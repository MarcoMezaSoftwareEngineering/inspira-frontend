// Preguntar al servidor cada cierto tiempo, sin bombardearlo.
//
// Hasta el 09/10/2026 cada sondeo de Core era un setInterval suelto: seguía
// preguntando con la pestaña oculta (la app instalada se queda abierta días),
// al volver disparaba dos veces —«focus» y «visibilitychange» llegan juntos—
// y, con el servidor caído, insistía al mismo ritmo. La campana de mensajes y
// el contador de tareas eran el 43 % de todas las peticiones del backend.
//
// Este hook hace lo mismo, con cuatro reglas:
//
//   1. Con la pestaña oculta no pregunta (salvo `pausarOculta: false`).
//   2. Al volver, UNA petición, y solo si la última tiene más de 10 s; si no,
//      se espera lo que le faltaba al intervalo.
//   3. Si ya hay una en vuelo, quien pida otra recibe esa misma promesa.
//   4. Si falla, espera el doble cada vez (hasta 16 veces el intervalo y
//      nunca más de 30 min). En cuanto sale bien, vuelve al ritmo normal.
//
// `fn` es lo que se hace en cada vuelta. Recibe `{ motivo, fuera }`: el motivo
// es "inicio", "intervalo", "volver" o "manual", y `fuera` los milisegundos
// que la pestaña estuvo oculta (solo al volver). Para que cuente como fallo
// tiene que lanzar (o devolver una promesa rechazada): una respuesta con
// `ok: false` que se queda en el `then` es, para el hook, un acierto.
//
// Devuelve `refrescar()`, para pedir ya (tras guardar, o desde un evento): se
// suma a la petición en vuelo si la hay y reinicia la cuenta del intervalo.
import { useCallback, useEffect, useRef } from "react";

const VOLVER_MIN_MS = 10 * 1000;
const TOPE_MS = 30 * 60 * 1000;

const oculta = () => typeof document !== "undefined" && document.visibilityState === "hidden";

/**
 * @param {(ctx: {motivo: string, fuera?: number}) => any} fn
 * @param {number} ms  cada cuánto, con la pestaña a la vista
 * @param {object} [op]
 * @param {boolean} [op.activo=true]       false: no pregunta (y suelta el temporizador)
 * @param {*} [op.clave]                   si cambia, empieza de cero (y pide ya)
 * @param {number|null} [op.primera=0]    ms hasta la primera vuelta; null = al cumplirse `ms`
 * @param {boolean} [op.pausarOculta=true] false para lo que no es leer datos (un «sigo aquí»)
 * @returns {() => Promise<any>} refrescar
 */
export function useSondeo(fn, ms, { activo = true, clave, primera = 0, pausarOculta = true } = {}) {
  const fnRef = useRef(fn);
  // La última versión de `fn` sin reiniciar el sondeo cada vez que se pinta.
  useEffect(() => { fnRef.current = fn; });

  const mando = useRef(null);

  useEffect(() => {
    if (!activo || !(ms > 0)) return undefined;
    let vivo = true;
    let temporizador = null;
    let fallos = 0;
    let ultima = 0;
    let enVuelo = null;
    let ocultaDesde = oculta() ? Date.now() : null;

    const espera = () => (fallos ? Math.min(ms * 2 ** fallos, Math.max(ms, Math.min(ms * 16, TOPE_MS))) : ms);

    const programar = (dentro) => {
      clearTimeout(temporizador);
      temporizador = null;
      if (!vivo || (pausarOculta && oculta())) return;
      temporizador = setTimeout(() => vuelta("intervalo"), dentro);
    };

    const ejecutar = (ctx) => {
      if (enVuelo) return enVuelo;
      ultima = Date.now();
      enVuelo = Promise.resolve()
        .then(() => fnRef.current(ctx))
        .then(
          (v) => { fallos = 0; return v; },
          (e) => { fallos += 1; throw e; },
        )
        .finally(() => { enVuelo = null; });
      return enVuelo;
    };

    // Una vuelta completa: pedir y, al terminar (bien o mal), programar la siguiente.
    const vuelta = (motivo, extra) => {
      const p = ejecutar({ motivo, ...extra });
      p.catch(() => {}).finally(() => programar(espera()));
      return p;
    };

    const alCambiar = () => {
      if (oculta()) {
        ocultaDesde = ocultaDesde ?? Date.now();
        if (pausarOculta) { clearTimeout(temporizador); temporizador = null; }
        return;
      }
      const fuera = ocultaDesde ? Date.now() - ocultaDesde : 0;
      ocultaDesde = null;
      if (!pausarOculta) return;
      if (enVuelo) return; // la que está en vuelo ya programará la siguiente
      const pasado = Date.now() - ultima;
      if (pasado >= Math.min(ms, VOLVER_MIN_MS)) vuelta("volver", { fuera });
      else programar(ms - pasado);
    };

    document.addEventListener("visibilitychange", alCambiar);
    if (primera === 0) vuelta("inicio");
    else programar(primera == null ? ms : primera);

    mando.current = { refrescar: () => vuelta("manual") };
    return () => {
      vivo = false;
      clearTimeout(temporizador);
      document.removeEventListener("visibilitychange", alCambiar);
      mando.current = null;
    };
  }, [activo, ms, clave, primera, pausarOculta]);

  return useCallback(() => mando.current?.refrescar() ?? Promise.resolve(), []);
}
