// src/components/common/BarraProgreso.jsx
// Barra superior que indica cuánto llevas leído de la página. Da sensación de
// avance al recorrer las secciones largas.
import { useEffect, useState } from "react";

export default function BarraProgreso() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      setPct(alto > 0 ? Math.min(100, (window.scrollY / alto) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div className="v4-progress" style={{ width: `${pct}%` }} aria-hidden />;
}
