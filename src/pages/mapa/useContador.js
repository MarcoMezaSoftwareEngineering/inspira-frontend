// src/pages/mapa/useContador.js
// Cifra que sube hasta su valor (0,65 s, con frenada al final). Al cambiar el
// objetivo parte del valor que enseña. Con prefers-reduced-motion salta.
import { useEffect, useRef, useState } from "react";
import { prefiereMenosMovimiento } from "./indice";

export function useContador(objetivo, duracion = 650) {
  const [valor, setValor] = useState(() => (prefiereMenosMovimiento() ? objetivo : 0));
  const actual = useRef(valor);

  useEffect(() => {
    const origen = actual.current;
    if (origen === objetivo) return undefined;
    const reducir = prefiereMenosMovimiento();
    const inicio = performance.now();
    let raf = requestAnimationFrame(function paso(t) {
      const k = reducir ? 1 : Math.min(1, (t - inicio) / duracion);
      const v = Math.round(origen + (objetivo - origen) * (1 - Math.pow(1 - k, 3)));
      actual.current = v;
      setValor(v);
      if (k < 1) raf = requestAnimationFrame(paso);
    });
    return () => cancelAnimationFrame(raf);
  }, [objetivo, duracion]);

  return valor;
}
