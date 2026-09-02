// src/components/common/BarraProgreso.jsx
// Barra superior que indica cuánto llevas leído de la página. Da sensación de
// avance al recorrer las secciones largas.
//
// El ancho se escribe directamente en el nodo, una vez por frame: el scroll
// dispara decenas de eventos por segundo y pasar cada uno por el estado de
// React obligaba a re-renderizar la página entera en cada uno de ellos.
import { useEffect, useRef } from "react";

export default function BarraProgreso() {
  const ref = useRef(null);

  useEffect(() => {
    let frame = 0;
    const pintar = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      const pct = alto > 0 ? Math.min(100, (window.scrollY / alto) * 100) : 0;
      el.style.width = `${pct}%`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(pintar);
    };
    pintar();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div ref={ref} className="v4-progress" style={{ width: 0 }} aria-hidden />;
}
