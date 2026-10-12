// src/lib/tramites.js
//
// Los trámites por pasos (12/10/2026): grado, FP, homologación escolar,
// homologación de título y recurso de reposición. Lo comparten el panel del
// asesorado (DetalleSolicitudTramite) y Core (TramiteAdmin).
//
// La ficha de cada servicio —pasos, campos, documentos, etapas— NO vive aquí:
// la sirve el backend (GET /api/tramites/definiciones, de
// modules/tramites/definiciones.js) y aquí solo se lee una vez y se cachea.
// Así no hay dos copias que se desactualicen, que es justo lo que pasó con el
// doctorado y la FP.
import { apiGET } from "../services/api";

/** Las claves de `panel_servicio` que son trámites por pasos. Espejo del backend. */
export const CLAVES_TRAMITE = ["grado", "fp", "homesc", "homuni", "recurso"];

export const esTramite = (clave) => CLAVES_TRAMITE.includes(String(clave || ""));

let cache = null;

/** Todas las fichas, { clave: definicion }. Una sola petición por sesión. */
export function cargarDefiniciones() {
  if (!cache) {
    cache = apiGET("/api/tramites/definiciones")
      .then((r) => {
        if (!r?.ok || !r.tramites) throw new Error(r?.msg || "Sin definiciones");
        return r.tramites;
      })
      .catch((e) => { cache = null; throw e; });
  }
  return cache;
}

/* ── Documentos del checklist, repartidos por paso ───────────────────────── */

const regexps = new Map();
function regexDe(patron) {
  if (!regexps.has(patron)) regexps.set(patron, new RegExp(patron, "i"));
  return regexps.get(patron);
}

const nombreItem = (it) => String(it?.item?.nombre_item || "");

/** El documento de la ficha al que corresponde un ítem del checklist, o null. */
export function docDeItem(def, it) {
  const n = nombreItem(it);
  return (def?.docs || []).find((d) => regexDe(d.patron).test(n)) || null;
}

/** El paso en el que se pide un ítem: el de su documento o, si no se reconoce, el de documentos. */
export function pasoDeItem(def, it) {
  const paso = docDeItem(def, it)?.paso;
  if (paso && def.pasos.some((p) => p.id === paso)) return paso;
  return (def.pasos.find((p) => p.id === "documentos") || def.pasos[0]).id;
}

/** El checklist repartido por pasos: { documentos: [...], presentacion: [...] }. */
export function checklistPorPaso(def, checklist = []) {
  const out = {};
  for (const it of checklist || []) (out[pasoDeItem(def, it)] ||= []).push(it);
  return out;
}

const ESTADOS_LISTOS = ["aprobado", "no_aplica"];

/** Cómo va cada documento de la ficha en un paso: listo, revisión, corregir, falta o sin pedir. */
export function docsDelPaso(def, paso, checklist = []) {
  return (def?.docs || []).filter((d) => d.paso === paso).map((d) => {
    const items = (checklist || []).filter((it) => docDeItem(def, it)?.clave === d.clave);
    const estados = items.map((it) => String(it.estado_item || "pendiente").toLowerCase());
    let estado = "sin_pedir";
    if (items.length) {
      if (estados.some((e) => e === "observado" || e === "rechazado")) estado = "corregir";
      else if (estados.every((e) => ESTADOS_LISTOS.includes(e))) estado = "listo";
      else if (estados.some((e) => e === "enviado")) estado = "revision";
      else estado = "falta";
    }
    return { ...d, estado };
  });
}

export const ETIQUETA_DOC = {
  listo: { texto: "Listo", tono: "ok" },
  revision: { texto: "En revisión", tono: "info" },
  corregir: { texto: "Por corregir", tono: "alto" },
  falta: { texto: "Falta", tono: "aviso" },
  sin_pedir: { texto: "Te lo pedirá tu asesor", tono: "tipo" },
};

/* ── Dónde está ──────────────────────────────────────────────────────────── */

/**
 * El paso actual según la etapa que mueve el equipo, y cómo va.
 * @returns {{ indice:number, hecho:boolean, pausa:boolean, malResultado:boolean }}
 */
export function situacionDe(def, etapa) {
  const e = String(etapa || "").trim();
  const i = def?.pasoDeEtapa?.[e];
  return {
    indice: Number.isInteger(i) ? Math.min(i, def.pasos.length - 1) : 0,
    hecho: e === "Finalizado",
    pausa: e === "Suspendido",
    malResultado: /^(No admitido|Denegada|Desestimado|No viable)$/.test(e),
  };
}

/* ── Candidaturas ────────────────────────────────────────────────────────── */

const ELEGIDAS = new Set(["Elegida", "Postulada", "Lista de espera", "Admitida", "No admitida", "Matriculada"]);

/** Las candidaturas que enseña un paso según `lista.enPasos` (todas o solo las elegidas). */
export function candidaturasDelPaso(def, pasoId, candidaturas = []) {
  const modo = def?.lista?.enPasos?.[pasoId];
  if (!modo) return null;
  const lista = Array.isArray(candidaturas) ? candidaturas : [];
  return modo === "elegidas" ? lista.filter((c) => ELEGIDAS.has(c.estado)) : lista;
}

/* ── Campos ──────────────────────────────────────────────────────────────── */

/** Los campos de un paso agrupados por su `grupo` (el primero de cada grupo lo nombra). */
export function gruposDe(campos = []) {
  const grupos = [];
  let actual = { titulo: null, campos: [] };
  for (const c of campos) {
    if (c.grupo) {
      if (actual.campos.length) grupos.push(actual);
      actual = { titulo: c.grupo, campos: [] };
    }
    actual.campos.push(c);
  }
  if (actual.campos.length) grupos.push(actual);
  return grupos;
}

/** Fecha ISO → «12 oct 2026». */
export function fechaCorta(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
  if (!m) return iso || "";
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

/** Un valor tal como se enseña: fechas legibles, claves tapadas, vacíos como «—». */
export function mostrarValor(campo, valor, { revelar = false } = {}) {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (campo?.tipo === "fecha") return fechaCorta(valor);
  if (campo?.tipo === "secreto" && !revelar) return "••••••••";
  return String(valor);
}
