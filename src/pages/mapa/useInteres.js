// src/pages/mapa/useInteres.js
// La lista de «me interesa» del mapa, guardada en el propio teléfono.
// Vive aparte de TarjetaMini.jsx para que ese archivo solo exporte su
// componente (regla de la recarga en caliente del proyecto).
import { useCallback, useEffect, useState } from "react";

const LLAVE = "mapa_interes";
export const MAX_INTERES = 3;

function leerGuardado() {
  try {
    const v = JSON.parse(localStorage.getItem(LLAVE) || "[]");
    return Array.isArray(v) ? v.filter((x) => x && typeof x.id === "string").slice(0, MAX_INTERES) : [];
  } catch {
    return [];
  }
}

export function useInteres() {
  const [interes, setInteres] = useState(leerGuardado);

  useEffect(() => {
    try {
      localStorage.setItem(LLAVE, JSON.stringify(interes));
    } catch {
      /* en privado o con el almacenamiento bloqueado, se queda en memoria */
    }
  }, [interes]);

  const alternar = useCallback((tipo, id) => {
    setInteres((lista) => {
      const fuera = lista.filter((x) => x.id !== id);
      if (fuera.length !== lista.length) return fuera;
      return [...lista, { tipo, id }].slice(-MAX_INTERES);
    });
  }, []);

  const vaciar = useCallback(() => setInteres([]), []);
  return { interes, alternar, vaciar, maximo: MAX_INTERES };
}

