// Dónde está el asesorado dentro del panel, leído de la URL.
//
//   /panel                        → sus servicios
//   /panel/perfil                 → su perfil
//   /panel/guia, /panel/becas…    → un recurso (guía, becas, apostilla)
//   /panel/servicios/155          → un expediente
//   /panel/servicios/155/post     → una sección de ese expediente
//
// Antes la pestaña vivía en localStorage y el expediente abierto en memoria.
// Eso hacía que «atrás» en el móvil sacara del panel en vez de volver a la
// sección anterior, que recargar a mitad de faena devolviera a la lista, y
// que ningún correo pudiera enlazar a «suba aquí su justificante». La URL es
// la única verdad; todo lo demás se deriva de ella.

export const PESTANAS = [
  "servicios", "perfil", "becas", "guia", "apostilla", "estancia", "modificatoria",
];

/** @returns {{tab: string|null, idServicio: number|null, seccion: string|null}} */
export function leerRuta(path) {
  const partes = String(path || "")
    .replace(/^\/panel\/?/, "")
    .split("/")
    .filter(Boolean);

  if (!partes.length) return { tab: "servicios", idServicio: null, seccion: null };

  if (partes[0] === "servicios") {
    const id = Number(partes[1]);
    return {
      tab: "servicios",
      idServicio: Number.isInteger(id) && id > 0 ? id : null,
      seccion: partes[2] || null,
    };
  }

  if (PESTANAS.includes(partes[0])) return { tab: partes[0], idServicio: null, seccion: null };

  // Una ruta que no es de nadie: quien la lee decide adónde mandar.
  return { tab: null, idServicio: null, seccion: null };
}

export function rutaDe({ tab = "servicios", idServicio = null, seccion = null } = {}) {
  if (idServicio) return `/panel/servicios/${idServicio}${seccion ? `/${seccion}` : ""}`;
  return tab === "servicios" ? "/panel" : `/panel/${tab}`;
}
