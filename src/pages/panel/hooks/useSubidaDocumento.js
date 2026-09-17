// El recorrido de una subida en el panel: elegir → preparar → avisar → subir.
//
// Cada tarjeta de documento tenía su propio `subir(archivo)` que mandaba lo
// elegido tal cual. Este hook se pone delante sin cambiar a dónde ni cómo se
// manda: la tarjeta sigue diciendo el endpoint (en `enviar`), y aquí solo se
// decide QUÉ se manda y si antes hay que decirle algo.
//
// Los avisos (borrosa, una sola cara, pesa mucho) no bloquean: la última
// palabra es suya, porque a veces la foto está bien y el documento es de una
// página. Lo que sí bloquea es lo que el servidor iba a rechazar igualmente.
import { useCallback, useEffect, useRef, useState } from "react";
import { prepararArchivos } from "../lib/prepararArchivo";

/** Cuánto se queda a la vista el «Recibido» antes de irse solo. */
const DURA_RECIBIDO = 9000;

export default function useSubidaDocumento({ texto = "", varios = false, tope, enviar, onHecho }) {
  const [preparando, setPreparando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [pendiente, setPendiente] = useState(null);
  const [recibido, setRecibido] = useState(false);
  // Lo que eligió, sin preparar: para poder añadir otra foto y rehacer el PDF.
  const origen = useRef([]);

  // Las props cambian en cada render (textos, callbacks en línea): se leen
  // del ref para no rehacer las funciones del hook en cada vuelta.
  const props = useRef({ texto, varios, tope, enviar, onHecho });
  useEffect(() => { props.current = { texto, varios, tope, enviar, onHecho }; });

  useEffect(() => {
    if (!recibido) return undefined;
    const t = setTimeout(() => setRecibido(false), DURA_RECIBIDO);
    return () => clearTimeout(t);
  }, [recibido]);

  const mandar = useCallback(async (archivos) => {
    setSubiendo(true); setError(""); setPendiente(null);
    try {
      await props.current.enviar(archivos);
      origen.current = [];
      setRecibido(true);
      props.current.onHecho?.();
    } catch (e) {
      setError(e?.message || "No se pudo subir. Inténtalo de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }, []);

  const procesar = useCallback(async (lista) => {
    if (!lista.length) return;
    origen.current = lista;
    setPreparando(true); setError(""); setPendiente(null); setRecibido(false);
    let r;
    try {
      const { texto: t, varios: v, tope: tp, convertir: cv } = props.current;
      r = await prepararArchivos(lista, { texto: t, varios: v, ...(tp ? { tope: tp } : {}), ...(cv === false ? { convertir: false } : {}) });
    } catch {
      // Si algo falla al preparar, se sube lo elegido tal cual, como antes.
      r = { archivos: lista, avisos: [], bloqueo: null, desdeFotos: false };
    } finally {
      setPreparando(false);
    }
    if (r.bloqueo) { setError(r.bloqueo); return; }
    if (r.avisos.length) { setPendiente(r); return; }
    await mandar(r.archivos);
  }, [mandar]);

  /** Lo que llega del selector, de la cámara o del arrastre. */
  const elegir = useCallback((archivos) => procesar(Array.from(archivos || [])), [procesar]);

  /** Añade fotos a las que ya eligió y rehace el PDF: la otra cara del DNI. */
  const anadir = useCallback(
    (archivos) => procesar([...origen.current, ...Array.from(archivos || [])]),
    [procesar],
  );

  const confirmar = useCallback(() => { if (pendiente) mandar(pendiente.archivos); }, [pendiente, mandar]);
  const descartar = useCallback(() => { setPendiente(null); origen.current = []; }, []);
  const cerrarRecibido = useCallback(() => setRecibido(false), []);

  return {
    ocupado: preparando || subiendo,
    preparando, subiendo, error, pendiente, recibido,
    elegir, anadir, confirmar, descartar, cerrarRecibido, setError,
  };
}
