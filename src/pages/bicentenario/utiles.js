// src/pages/bicentenario/utiles.js
//
// Los hooks y utilidades de la página de la beca. 17/09/2026: estaban repartidos
// entre piezas.jsx e ilustraciones.jsx; al vivir junto a componentes, Vite no
// podía recargar en caliente esos archivos y eslint lo marcaba. Aquí no hay
// ningún componente, así que los dos problemas desaparecen y el comportamiento
// es exactamente el de antes.
import { useEffect, useRef, useState } from "react";
import { navigate } from "../../services/navigate";

/** ¿El sistema pide no animar? Lectura puntual, para usar fuera del render. */
export function quietoAhora() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Lo mismo, pero atento a que el visitante cambie la preferencia del sistema. */
export function usePrefiereQuieto() {
  const consulta = "(prefers-reduced-motion: reduce)";
  const [quieto, setQuieto] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.(consulta).matches);
  useEffect(() => {
    const m = window.matchMedia?.(consulta);
    if (!m) return;
    const f = () => setQuieto(m.matches);
    m.addEventListener?.("change", f);
    return () => m.removeEventListener?.("change", f);
  }, []);
  return quieto;
}

// ── Aparición al hacer scroll ───────────────────────────────────────────────
// Un solo IntersectionObserver para toda la página. Si el elemento ya está en
// pantalla al montarse, aparece en el siguiente frame (no depende del observer).
let observador = null;
const avisos = new WeakMap();

function observar(el, cb) {
  if (typeof IntersectionObserver === "undefined") {
    cb();
    return () => {};
  }
  if (!observador) {
    observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const f = avisos.get(e.target);
          observador.unobserve(e.target);
          avisos.delete(e.target);
          if (f) f();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 }
    );
  }
  avisos.set(el, cb);
  observador.observe(el);
  return () => {
    avisos.delete(el);
    observador?.unobserve(el);
  };
}

export function useEnPantalla() {
  const ref = useRef(null);
  // Con movimiento reducido se da por visto desde el primer pintado: así no hay
  // ni un frame en blanco ni un setState dentro del efecto.
  const [visto, setVisto] = useState(quietoAhora);
  useEffect(() => {
    const el = ref.current;
    if (!el || visto) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      const t = requestAnimationFrame(() => setVisto(true));
      return () => cancelAnimationFrame(t);
    }
    return observar(el, () => setVisto(true));
  }, [visto]);
  return [ref, visto];
}

// ── Contadores ──────────────────────────────────────────────────────────────
/** Cuenta de `desde` a `hasta`. Con movimiento reducido devuelve el final. */
export function useConteo(desde, hasta, ms = 1400, activo = true) {
  const quieto = usePrefiereQuieto();
  const [valor, setValor] = useState(desde);
  useEffect(() => {
    if (!activo || quieto) return;
    let raf;
    let t0;
    const paso = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / ms);
      setValor(desde + (hasta - desde) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [desde, hasta, ms, activo, quieto]);
  return quieto ? hasta : valor;
}

/**
 * Número que persigue a su valor: cada vez que cambia, sale del valor que
 * enseñaba y llega al nuevo. Es lo que hace que el puntaje del simulador suba
 * mientras se responde, en vez de saltar de golpe.
 */
export function useNumeroAnimado(valor, ms = 650) {
  const quieto = usePrefiereQuieto();
  const [pintado, setPintado] = useState(valor);
  const ultimo = useRef(valor);
  useEffect(() => {
    if (quieto) {
      ultimo.current = valor;
      return;
    }
    const inicio = ultimo.current;
    if (inicio === valor) return;
    let raf;
    let t0;
    const paso = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / ms);
      const actual = inicio + (valor - inicio) * (1 - Math.pow(1 - k, 3));
      ultimo.current = k < 1 ? actual : valor;
      setPintado(ultimo.current);
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [valor, ms, quieto]);
  return quieto ? valor : pintado;
}

// ── Navegación ──────────────────────────────────────────────────────────────
/** Enlace interno (SPA) o ancla de la misma página. */
export function irA(e, href) {
  e.preventDefault();
  if (href.startsWith("#")) {
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: quietoAhora() ? "auto" : "smooth", block: "start" });
    return;
  }
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
}

// ── Fechas ──────────────────────────────────────────────────────────────────
/** Fecha de hoy en Lima (UTC-5), AAAA-MM-DD. */
export const hoyPeru = () => new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);

export const diasEntre = (desde, hasta) =>
  Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86400000);

/** 2026-10-30 → 30/10/2026. */
export const fechaCorta = (iso) => iso.split("-").reverse().join("/");
