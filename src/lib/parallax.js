// src/lib/parallax.js
// La foto de la cabecera baja un poco más despacio que la página: un
// desplazamiento pequeño (tope 60px) que se nota sin marear. Escribe la
// variable --py en el elemento; el CSS (.lfx-parallax) la traduce a transform.
import { useEffect } from "react";

export function useParallax(ref, factor = 0.12, tope = 60) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let raf = 0;
    const mirar = () => {
      raf = 0;
      el.style.setProperty("--py", String(Math.min(tope, window.scrollY * factor)));
    };
    const alScroll = () => {
      if (!raf) raf = requestAnimationFrame(mirar);
    };
    mirar();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", alScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, factor, tope]);
}
