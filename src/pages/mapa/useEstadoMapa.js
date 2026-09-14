// src/pages/mapa/useEstadoMapa.js
// Estado compartible del mapa: vive en la query de la URL, así un enlace abre
// el mapa ya enfocado y filtrado.
//
//   /mapa-estudiar-en-espana?comunidad=andalucia&universidad=ugr&lista=economicas,intermedias
//     &rama=CIENCIAS_SALUD&max=2000&titularidad=publica&ranking=top500&orden=ranking
//     &comparar=madrid,cataluna
//
// Se escribe con replaceState (no llena el historial al tocar el mapa) y se
// conservan los demás parámetros, como los utm_* de una campaña. Los ids que
// no existan se ignoran al pintar: un enlace viejo no rompe nada.
import { useCallback, useEffect, useRef, useState } from "react";

const CLAVES = [
  "comunidad",
  "ciudad",
  "universidad",
  "caso",
  "lista",
  "rama",
  "max",
  "titularidad",
  "ranking",
  "orden",
  "abre",
  "becas",
  "presupuesto",
  "comparar",
];

const lista = (valor) =>
  String(valor || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function leerUrl() {
  const p = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  const max = Number(p.get("max"));
  const presupuesto = Number(p.get("presupuesto"));
  return {
    comunidad: p.get("comunidad") || null,
    ciudad: p.get("ciudad") || null,
    universidad: p.get("universidad") || null,
    caso: p.get("caso") || null,
    listas: lista(p.get("lista")),
    rama: p.get("rama") || null,
    max: Number.isFinite(max) && max > 0 ? max : null,
    titularidad: p.get("titularidad") || null,
    ranking: p.get("ranking") || null,
    orden: p.get("orden") || null,
    abre: p.get("abre") || null,
    becas: p.get("becas") === "1",
    presupuesto: Number.isFinite(presupuesto) && presupuesto > 0 ? presupuesto : null,
    comparar: lista(p.get("comparar")).slice(0, 3),
  };
}

function escribirUrl(e) {
  const otros = new URLSearchParams(window.location.search);
  CLAVES.forEach((k) => otros.delete(k));
  const partes = [];
  const poner = (clave, valor) => {
    if (valor == null || valor === "" || (Array.isArray(valor) && !valor.length)) return;
    const texto = Array.isArray(valor) ? valor.map(encodeURIComponent).join(",") : encodeURIComponent(valor);
    partes.push(`${clave}=${texto}`);
  };
  poner("comunidad", e.comunidad);
  poner("ciudad", e.ciudad);
  poner("universidad", e.universidad);
  poner("caso", e.caso);
  poner("lista", e.listas);
  poner("rama", e.rama);
  poner("max", e.max);
  poner("titularidad", e.titularidad);
  poner("ranking", e.ranking);
  poner("orden", e.orden);
  poner("abre", e.abre);
  poner("becas", e.becas ? "1" : null);
  poner("presupuesto", e.presupuesto);
  poner("comparar", e.comparar);
  const query = [otros.toString(), partes.join("&")].filter(Boolean).join("&");
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  const actual = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (url !== actual) window.history.replaceState(window.history.state, "", url);
}

export function useEstadoMapa() {
  const [estado, setEstado] = useState(leerUrl);
  const primera = useRef(true);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return undefined;
    }
    // El deslizador cambia muchas veces por segundo: se escribe al parar.
    const t = setTimeout(() => escribirUrl(estado), 150);
    return () => clearTimeout(t);
  }, [estado]);

  useEffect(() => {
    const alVolver = () => setEstado(leerUrl());
    window.addEventListener("popstate", alVolver);
    return () => window.removeEventListener("popstate", alVolver);
  }, []);

  const actualizar = useCallback((cambios) => {
    setEstado((prev) => ({ ...prev, ...(typeof cambios === "function" ? cambios(prev) : cambios) }));
  }, []);

  return [estado, actualizar];
}
