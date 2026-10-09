// src/lib/hidratacion.js
//
// Las páginas públicas principales llegan prerenderizadas (scripts/prerender.mjs,
// 09/10/2026): el HTML trae ya el contenido y main.jsx lo hidrata en vez de
// pintarlo de cero. Para hidratar, el primer render del navegador tiene que
// ser idéntico al del servidor; si no, React tira el HTML y vuelve a pintar
// (parpadeo y LCP perdido).
//
// Lo que depende del navegador (localStorage, la URL con sus utm_*, la fecha
// de hoy, document.body para un portal) se pinta en dos tiempos: durante la
// hidratación, el valor del servidor; justo después, el real. Es el patrón de
// React para esto (useSyncExternalStore con getServerSnapshot): en un montaje
// normal, sin prerender, se usa el valor real desde el principio.
import { useSyncExternalStore } from "react";

const sinSuscripcion = () => () => {};

/**
 * true en el servidor y durante la hidratación del HTML prerenderizado; false
 * después, y siempre en un montaje normal. Tras hidratar, React vuelve a
 * pintar el componente con false.
 */
export function useHidratando() {
  return useSyncExternalStore(sinSuscripcion, () => false, () => true);
}

/** "2026-10-09" en la hora local de quien ejecuta (navegador o servidor). */
export function diaLocal(fecha = new Date()) {
  const dos = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

// El día con el que se pintó el HTML. En el servidor lo fija entry-server.jsx
// antes de pintar; en el navegador viaja en <html data-prerender-dia>.
let diaDelServidor = null;

/** Solo para el prerender (src/entry-server.jsx). */
export function fijarDiaDelPrerender(dia) {
  diaDelServidor = dia;
}

function diaDelPrerender() {
  if (diaDelServidor) return diaDelServidor;
  if (typeof document !== "undefined") {
    const dia = document.documentElement.dataset.prerenderDia;
    if (dia) return dia;
  }
  return diaLocal();
}

/**
 * El día de hoy ("aaaa-mm-dd") para lo que se pinta según la fecha: el año
 * del pie, la promoción vigente. Durante la hidratación es el día en que se
 * generó el HTML, para que coincida con él; después, el del navegador.
 */
export function useDiaDeHoy() {
  return useSyncExternalStore(sinSuscripcion, diaLocal, diaDelPrerender);
}
