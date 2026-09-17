// Movimiento del panel: lo que hace que se sienta una app y no una página.
//
// Tres piezas pequeñas y sin dependencias:
//   · menosMovimiento()   — respeta «reducir movimiento» del sistema.
//   · useContador(n)      — las cifras suben hasta su valor en vez de aparecer.
//   · useTirarParaRecargar — en el teléfono, tirar hacia abajo desde arriba recarga.
import { useEffect, useRef, useState } from "react";

export function menosMovimiento() {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
}

/** Cuenta de 0 (o del valor anterior) hasta `valor` con una curva suave. */
export function useContador(valor, duracion = 700) {
  const objetivo = Number(valor) || 0;
  const quieto = menosMovimiento();
  const [mostrado, setMostrado] = useState(0);
  const desde = useRef(0);

  useEffect(() => {
    if (quieto) { desde.current = objetivo; return undefined; }
    const inicio = performance.now();
    const origen = desde.current;
    let id = 0;
    const paso = (t) => {
      const p = Math.min(1, (t - inicio) / duracion);
      const curva = 1 - Math.pow(1 - p, 3);
      setMostrado(Math.round(origen + (objetivo - origen) * curva));
      if (p < 1) id = requestAnimationFrame(paso);
      else desde.current = objetivo;
    };
    id = requestAnimationFrame(paso);
    return () => { cancelAnimationFrame(id); desde.current = objetivo; };
  }, [objetivo, duracion, quieto]);

  // Con «reducir movimiento», la cifra final directamente.
  return quieto ? objetivo : mostrado;
}

const UMBRAL = 72;   // px de tirón para soltar y recargar
const TOPE = 110;    // lo más que baja el indicador

/**
 * Tirar para recargar sobre un contenedor con scroll propio.
 *
 * El tirón no pasa por el estado de React: repintar el panel entero en cada
 * píxel del dedo se nota. Se escribe en la variable CSS `--tiron` del
 * contenedor y en `data-tiron="listo"`; solo `recargando` es estado.
 * Solo actúa con el dedo y con el contenedor arriba del todo: con ratón o a
 * mitad de lista no hace nada, así que no interfiere con el scroll normal.
 */
export function useTirarParaRecargar(ref, onRecargar, activo = true) {
  const [recargando, setRecargando] = useState(false);
  const estado = useRef({ y0: null, tiron: 0, ocupado: false });
  const cb = useRef(onRecargar);
  cb.current = onRecargar;

  useEffect(() => {
    const el = ref.current;
    if (!el || !activo) return undefined;

    const pintar = (px, fase) => {
      el.style.setProperty("--tiron", `${px}px`);
      if (fase) el.dataset.tiron = fase; else delete el.dataset.tiron;
    };
    const alEmpezar = (e) => {
      if (estado.current.ocupado || el.scrollTop > 0 || e.touches.length !== 1) return;
      estado.current.y0 = e.touches[0].clientY;
    };
    const alMover = (e) => {
      const s = estado.current;
      if (s.y0 == null) return;
      const d = e.touches[0].clientY - s.y0;
      if (d <= 0 || el.scrollTop > 0) {
        if (s.tiron) { s.tiron = 0; pintar(0, null); }
        return;
      }
      // Resistencia: cuanto más se tira, menos avanza.
      s.tiron = Math.min(TOPE, d * 0.5);
      pintar(s.tiron, s.tiron >= UMBRAL ? "listo" : "tirando");
      if (e.cancelable && d > 8) e.preventDefault();
    };
    const alSoltar = async () => {
      const s = estado.current;
      if (s.y0 == null) return;
      s.y0 = null;
      if (s.tiron >= UMBRAL && !s.ocupado) {
        s.ocupado = true;
        s.tiron = 0;
        pintar(UMBRAL * 0.75, "recargando");
        setRecargando(true);
        try { navigator.vibrate?.(8); } catch { /* sin vibración */ }
        try { await cb.current?.(); } finally {
          s.ocupado = false;
          setRecargando(false);
          pintar(0, null);
        }
        return;
      }
      s.tiron = 0;
      pintar(0, null);
    };

    el.addEventListener("touchstart", alEmpezar, { passive: true });
    el.addEventListener("touchmove", alMover, { passive: false });
    el.addEventListener("touchend", alSoltar);
    el.addEventListener("touchcancel", alSoltar);
    return () => {
      el.removeEventListener("touchstart", alEmpezar);
      el.removeEventListener("touchmove", alMover);
      el.removeEventListener("touchend", alSoltar);
      el.removeEventListener("touchcancel", alSoltar);
    };
  }, [ref, activo]);

  return { recargando };
}

/** Saludo según la hora del dispositivo. */
export function saludoDeHora(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return "Buenas noches";
  if (h < 13) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}
