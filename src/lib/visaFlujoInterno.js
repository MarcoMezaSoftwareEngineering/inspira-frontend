// src/lib/visaFlujoInterno.js
//
// Flujo interno de gestión de un visado de estudios: los pasos que da el
// ASESOR, no el cliente. Sirve para que cualquiera del equipo abra un
// expediente y sepa en dos segundos dónde está y qué toca hacer.
//
// Va aparte de la interfaz porque es el procedimiento de la casa: cambia
// cuando cambia la forma de trabajar, no cuando cambia el diseño.

/* Etapas del proceso. Cada paso tiene:
     id      · clave estable (se guarda en base de datos, no renombrar)
     titulo  · qué hay que hacer
     pista   · el detalle que se olvida o se hace mal
     quien   · de quién depende avanzar */
export const ETAPAS = [
  {
    codigo: "arranque",
    nombre: "Arranque",
    pasos: [
      { id: "pago",        titulo: "Pago confirmado y servicio activo",       pista: "La solicitud se crea sola al aprobarse el pago.", quien: "Inspira" },
      { id: "bienvenida",  titulo: "Bienvenida y acceso al portal enviados",  pista: "Verifica que el cliente entró al menos una vez.", quien: "Inspira" },
      { id: "diagnostico", titulo: "Sesión de diagnóstico realizada",         pista: "Es la única obligatoria. Sale de aquí la estrategia económica.", quien: "Inspira" },
    ],
  },
  {
    codigo: "estrategia",
    nombre: "Estrategia económica",
    pasos: [
      { id: "via",       titulo: "Vía de solvencia definida",              pista: "Propios, aval o mixto. Desbloquea el checklist del cliente.", quien: "Cliente + asesor" },
      { id: "monto",     titulo: "Monto a acreditar calculado",            pista: "IPREM vigente del año en curso, más familiares y programa pendiente.", quien: "Inspira" },
      { id: "perfiles",  titulo: "Perfil de ingresos y casos especiales marcados", pista: "Es lo que determina qué documentos se le piden.", quien: "Cliente" },
      { id: "riesgos",   titulo: "Riesgos del caso identificados",         pista: "Depósitos sin justificar, cuentas nuevas, ingresos irregulares.", quien: "Inspira" },
    ],
  },
  {
    codigo: "expediente",
    nombre: "Armado del expediente",
    pasos: [
      { id: "datos",       titulo: "Datos del cliente completos y verificados", pista: "Pasaporte vigente 6+ meses y dirección real de la universidad.", quien: "Cliente" },
      { id: "docs_subidos", titulo: "Documentos subidos por el cliente",        pista: "Revisa también «Otros documentos»: ahí cae lo que no encajó.", quien: "Cliente" },
      { id: "docs_ok",     titulo: "Documentos revisados y aprobados",          pista: "Apostillas, vigencias y traducciones. Observa lo que haya que rehacer.", quien: "Inspira" },
      { id: "dj",          titulo: "Declaración jurada redactada",              pista: "Revisa que no quede ningún hueco en rojo antes de exportarla.", quien: "Inspira" },
      { id: "impreso",     titulo: "Impreso oficial generado",                  pista: "El punto 31 (firma) va manuscrito, en la cita.", quien: "Inspira" },
      { id: "juego",       titulo: "Juego completo armado: original + copia",   pista: "El consulado exige copia de todo.", quien: "Inspira" },
    ],
  },
  {
    codigo: "cita",
    nombre: "Cita en el consulado",
    pasos: [
      { id: "bls_cuenta", titulo: "Cuenta BLS creada o credenciales recibidas", pista: "Si el cliente no tiene, la crea Inspira y le comparte el acceso.", quien: "Inspira" },
      { id: "bls_cita",   titulo: "Cita agendada en BLS",                       pista: "Anota la referencia y la tasa consular.", quien: "Inspira" },
      { id: "precita",    titulo: "Repaso pre-cita con el cliente",             pista: "Qué lleva, efectivo para la tasa, llegar 15 min antes.", quien: "Inspira" },
      { id: "presentado", titulo: "Expediente presentado en la cita",           pista: "Confirma con el cliente que entregó todo el día de la cita.", quien: "Cliente" },
    ],
  },
  {
    codigo: "resolucion",
    nombre: "Resolución",
    pasos: [
      { id: "seguimiento", titulo: "Seguimiento del expediente en curso", pista: "Vigila el correo del cliente: los requerimientos llegan con plazo corto.", quien: "Inspira" },
      { id: "resuelto",    titulo: "Resultado recibido",                  pista: "Regístralo abajo, en el estado del visado.", quien: "Consulado" },
      { id: "entrega",     titulo: "Pasaporte recogido y originales devueltos", pista: "Devuelve al cliente todo original que se haya quedado Inspira.", quien: "Cliente" },
      { id: "cierre",      titulo: "Expediente cerrado y reseña pedida",  pista: "Buen momento para pedir el testimonio, con la visa en la mano.", quien: "Inspira" },
    ],
  },
];

export const TODOS_LOS_PASOS = ETAPAS.flatMap((e) => e.pasos.map((p) => ({ ...p, etapa: e.nombre, codigo: e.codigo })));

/** Cuántos pasos hay hechos y cuál es el siguiente pendiente. */
export function resumenFlujo(flujo = {}) {
  const hechos = TODOS_LOS_PASOS.filter((p) => flujo?.[p.id]?.hecho);
  const siguiente = TODOS_LOS_PASOS.find((p) => !flujo?.[p.id]?.hecho) || null;
  return {
    hechos: hechos.length,
    total: TODOS_LOS_PASOS.length,
    pct: Math.round((hechos.length / TODOS_LOS_PASOS.length) * 100),
    siguiente,
    etapaActual: siguiente ? siguiente.etapa : "Cerrado",
  };
}

/* ── Estado del visado (después de la cita) ──────────────────────────────── */

export const RESULTADOS = [
  { valor: "EN_ESPERA", etiqueta: "En espera",  icono: "⏳", tono: "sky"     },
  { valor: "FAVORABLE", etiqueta: "Favorable",  icono: "✅", tono: "emerald" },
  { valor: "DENEGADO",  etiqueta: "Denegación", icono: "❌", tono: "red"     },
];

export const VIAS_POSTERIORES = [
  { valor: "APELACION",         etiqueta: "Apelación",              pista: "Recurso ante la denegación, con plazo desde la notificación." },
  { valor: "ESTANCIA_ESTUDIOS", etiqueta: "Derivar a estancia por estudios", pista: "Reconducir el caso por la vía de estancia en lugar de insistir." },
];

export const REQUERIMIENTO = [
  { valor: "SOLICITADO", etiqueta: "Solicitado · pendiente de subsanar" },
  { valor: "SUBSANADO",  etiqueta: "Subsanado y presentado" },
];

/**
 * Estado del visado en una línea, para listados y cabeceras.
 * Refleja el punto más avanzado del proceso, no la suma de campos.
 */
export function estadoVisado(exp = {}) {
  if (exp.via_posterior === "APELACION") return { texto: "En apelación", tono: "amber", icono: "⚖️" };
  if (exp.via_posterior === "ESTANCIA_ESTUDIOS") return { texto: "Derivado a estancia", tono: "violet", icono: "↪️" };

  if (exp.visado_resultado === "FAVORABLE") return { texto: "Visa concedida", tono: "emerald", icono: "✅" };
  if (exp.visado_resultado === "DENEGADO") return { texto: "Denegado", tono: "red", icono: "❌" };

  if (exp.requerimiento_estado === "SOLICITADO") return { texto: "Requerimiento pendiente", tono: "red", icono: "⚠️" };
  if (exp.requerimiento_estado === "SUBSANADO") return { texto: "Subsanado · en espera", tono: "sky", icono: "⏳" };

  if (exp.visado_resultado === "EN_ESPERA") return { texto: "En espera de resolución", tono: "sky", icono: "⏳" };
  if (exp.cita_estado === "REALIZADA") return { texto: "Presentado en el consulado", tono: "sky", icono: "🏛️" };
  if (["AGENDADA", "CONFIRMADA"].includes(exp.cita_estado)) return { texto: "Cita programada", tono: "sky", icono: "📅" };
  if (exp.cita_estado === "REAGENDAR") return { texto: "Hay que reagendar", tono: "amber", icono: "🔁" };

  return { texto: "Sin cita aún", tono: "neutral", icono: "—" };
}

export const TONOS = {
  sky:     "bg-sky-50 border-sky-200 text-sky-800",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
  red:     "bg-red-50 border-red-200 text-red-800",
  amber:   "bg-amber-50 border-amber-200 text-amber-800",
  violet:  "bg-violet-50 border-violet-200 text-violet-800",
  neutral: "bg-neutral-50 border-neutral-200 text-neutral-500",
};
