// Los portales de postulación (09/09/2026). En Andalucía se postula UNA vez
// por el Distrito Único Andaluz con los másteres en orden de preferencia; en
// el resto, cada universidad tiene su portal. Por eso las postulaciones se
// enseñan por portal, con sus opciones dentro, en el panel y en Core.
//
// Cada postulación guardada lleva `comunidad`, `id_comunidad`,
// `id_universidad` y `sigla` (los anota el servidor al devolverlas).

const ANDALUCIA = /andaluc/i;

export function esDistritoUnico(p) {
  if (p?.sistema_postulacion) return String(p.sistema_postulacion).toUpperCase() === "DUA";
  return ANDALUCIA.test(String(p?.comunidad || "")) || Number(p?.id_comunidad) === 1;
}

export function portalDe(p) {
  if (esDistritoUnico(p)) {
    return {
      id: "dua",
      nombre: "Distrito Único Andaluz",
      organismo: "Junta de Andalucía · una sola solicitud para todas las universidades andaluzas",
      icono: "globe",
      compartido: true,
    };
  }
  return {
    id: `uni-${p?.id_universidad || p?.universidad || p?.id_master}`,
    nombre: p?.universidad || "Portal de la universidad",
    organismo: [p?.sigla, p?.ciudad].filter(Boolean).join(" · ") || "Portal de admisión de la universidad",
    icono: "cap",
    compartido: false,
  };
}

// Qué postulación «lleva» los datos del portal: claves, plazos, avisos,
// resguardos y notas. La primera que tenga claves; si ninguna, la primera.
export function titularDe(posts) {
  return posts.find((p) => p.portal_usuario || p.portal_url || p.portal_password) || posts[0];
}

// Lo que se junta de todas las opciones del portal (resguardos, avisos…).
export function unirCampo(posts, campo) {
  const out = [];
  for (const p of posts) for (const x of (Array.isArray(p?.[campo]) ? p[campo] : [])) out.push(x);
  return out;
}

export function agruparPorPortal(posts) {
  const grupos = new Map();
  for (const p of posts || []) {
    const portal = portalDe(p);
    if (!grupos.has(portal.id)) grupos.set(portal.id, { portal, posts: [] });
    grupos.get(portal.id).posts.push(p);
  }
  return [...grupos.values()].map((g) => {
    const ordenadas = [...g.posts].sort((a, b) => (a.prioridad || 99) - (b.prioridad || 99));
    return { ...g, posts: ordenadas, titular: titularDe(ordenadas), ids: ordenadas.map((p) => p.id_master) };
  });
}

// El estado del portal a partir de sus opciones.
const PRESENTADA = ["postulado", "admitido", "lista", "denegado"];
const CON_RESULTADO = ["admitido", "lista", "denegado"];
export function estadoPortal(posts) {
  const estados = (posts || []).map((p) => p.estado);
  if (estados.some((e) => e === "admitido")) return "admitida";
  if (estados.some((e) => CON_RESULTADO.includes(e))) return "resultado";
  if (estados.some((e) => PRESENTADA.includes(e))) return "presentada";
  if (estados.some((e) => e === "proceso")) return "preparando";
  return "pendiente";
}

// Los plazos del portal: los de la titular, o los primeros que haya.
export function fechasPortal(posts) {
  const con = (campo) => (posts || []).map((p) => p?.[campo]).find(Boolean) || "";
  const t = titularDe(posts || []) || {};
  return {
    fecha_apertura: t.fecha_apertura || con("fecha_apertura"),
    fecha_cierre: t.fecha_cierre || con("fecha_cierre"),
    fecha_resultados: t.fecha_resultados || con("fecha_resultados"),
    fase_nombre: t.fase_nombre || con("fase_nombre"),
    fase_curso: t.fase_curso || con("fase_curso"),
  };
}
