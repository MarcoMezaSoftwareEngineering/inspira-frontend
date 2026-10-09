// ¿Se cumple una media query? Igual que en CSS, y al día si cambia el ancho.
//
// Para cuando una pantalla pinta dos versiones de lo mismo y esconde una con
// clases (`hidden lg:table` / `lg:hidden`): las dos se montaban enteras, con
// sus selectores y sus filas. Con esto se monta solo la que se ve. Mismo
// umbral que Tailwind: `lg` es 64rem (09/10/2026).
import { useCallback, useSyncExternalStore } from "react";

export const ANCHO_LG = "(min-width: 64rem)";

export function useMedia(consulta) {
  const suscribir = useCallback((avisar) => {
    const mq = window.matchMedia(consulta);
    mq.addEventListener("change", avisar);
    return () => mq.removeEventListener("change", avisar);
  }, [consulta]);
  const leer = useCallback(() => window.matchMedia(consulta).matches, [consulta]);
  return useSyncExternalStore(suscribir, leer, () => false);
}
