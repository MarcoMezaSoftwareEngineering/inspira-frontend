// src/pages/mapa/useEsEscritorio.js
// ¿Pantalla de escritorio? Decide si la ficha del mapa va en panel lateral
// (escritorio) o en hoja inferior (móvil y tablet).
import { useEffect, useState } from "react";

export function useEsEscritorio(consulta = "(min-width: 1024px)") {
  const [es, setEs] = useState(() => typeof window !== "undefined" && window.matchMedia(consulta).matches);
  useEffect(() => {
    const mq = window.matchMedia(consulta);
    const cambio = () => setEs(mq.matches);
    mq.addEventListener?.("change", cambio);
    return () => mq.removeEventListener?.("change", cambio);
  }, [consulta]);
  return es;
}
