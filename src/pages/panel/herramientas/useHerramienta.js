// Lo que cada herramienta gratuita guarda en la cuenta (03/11/2026).
//
// Todas se piden de una vez (GET /cliente/herramientas) y se reparten desde
// aquí: abrir el calendario después del presupuesto no vuelve a preguntar.
// Al escribir se guarda solo, un momento después de la última tecla, con PUT
// de esa herramienta. No se gasta nada en IA: todo se calcula en el teléfono.
import { useCallback, useEffect, useRef, useState } from "react";
import { apiGET, apiPUT } from "../../../services/api";

let pedido = null; // la promesa compartida de GET /cliente/herramientas
const memoria = {};
let referido = null; // { codigo, invitados, contrataron } de «Invita a un amigo»

function cargarTodas() {
  if (!pedido) {
    pedido = apiGET("/cliente/herramientas").then((r) => {
      if (!r?.ok) { pedido = null; throw new Error(r?.message || "No se pudieron cargar tus herramientas"); }
      Object.assign(memoria, r.herramientas || {});
      referido = r.referido || null;
      return memoria;
    }, (e) => { pedido = null; throw e; });
  }
  return pedido;
}

/**
 * @returns {[object, (nuevo: object) => void, "cargando"|"listo"|"guardando"|"guardado"|"error"]}
 */
export function useHerramienta(clave, inicial) {
  const [datos, setDatos] = useState(() => ({ ...inicial, ...(memoria[clave] || {}) }));
  const [estado, setEstado] = useState(memoria[clave] ? "listo" : "cargando");
  const espera = useRef(null);

  useEffect(() => {
    let vivo = true;
    cargarTodas()
      .then((todas) => { if (vivo) { setDatos({ ...inicial, ...(todas[clave] || {}) }); setEstado("listo"); } })
      .catch(() => { if (vivo) setEstado("error"); });
    return () => { vivo = false; };
  }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lo que quede por guardar se manda al salir de la herramienta.
  const pendiente = useRef(null);
  const mandar = useCallback(async () => {
    const d = pendiente.current;
    if (!d) return;
    pendiente.current = null;
    try {
      const r = await apiPUT(`/cliente/herramientas/${clave}`, { datos: d });
      if (!r?.ok) throw new Error(r?.message);
      setEstado("guardado");
    } catch {
      setEstado("error");
    }
  }, [clave]);
  useEffect(() => () => { clearTimeout(espera.current); mandar(); }, [mandar]);

  const guardar = useCallback((nuevo) => {
    setDatos(nuevo);
    memoria[clave] = nuevo;
    pendiente.current = nuevo;
    setEstado("guardando");
    clearTimeout(espera.current);
    espera.current = setTimeout(mandar, 700);
  }, [clave, mandar]);

  return [datos, guardar, estado];
}

function resumen() {
  const viaje = memoria.calendario?.viaje;
  const dias = viaje ? Math.ceil((Date.parse(`${viaje}T12:00:00`) - Date.now()) / 864e5) : null;
  return { referido, usadas: Object.keys(memoria), dias };
}

/** Para la portada: qué herramientas ya usó, los días hasta su viaje y su código de amigo. */
export function useResumen() {
  const [r, setR] = useState(resumen);
  useEffect(() => {
    let vivo = true;
    cargarTodas().then(() => { if (vivo) setR(resumen()); }).catch(() => {});
    return () => { vivo = false; };
  }, []);
  return r;
}

/** Su código de amigo y cuántos entraron con él. */
export const useReferido = () => useResumen().referido;

/** «Guardado en tu cuenta», al lado del título de cada herramienta. */
export function textoEstado(estado) {
  if (estado === "cargando") return "Cargando…";
  if (estado === "guardando") return "Guardando…";
  if (estado === "guardado") return "✓ Guardado en tu cuenta";
  if (estado === "error") return "Sin conexión: no se guardó";
  return "Se guarda en tu cuenta";
}

export const uid = () => Math.random().toString(36).slice(2, 9);
