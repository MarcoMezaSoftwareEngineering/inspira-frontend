// Lo pendiente del asesorado, calculado en un solo sitio: lo usa la portada
// para la lista «Hoy» y el menú para el contador.
import { rutaDe } from "./ruta";
import { SERVICIO, servicioDe } from "./servicios";
import { datosQueFaltan } from "./hooks/usePerfilIncompletoBool";

function diasHasta(iso) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const [a, m, d] = iso.split("-").map(Number);
  return Math.round((new Date(a, m - 1, d) - hoy) / 86400000);
}

function cuando(dias) {
  if (dias <= 0) return "hoy";
  if (dias === 1) return "mañana";
  return `en ${dias} días`;
}

export const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// El nombre del servicio arrastra el plan y las comunidades («Postulación a
// Máster · Plan Full Económico · Andalucía, Castilla…»): en una línea de
// pendientes basta con saber de cuál es.
export const recorta = (t, n = 44) => (t && t.length > n ? t.slice(0, n - 1).trim() + "…" : t);

/**
 * Lo pendiente, con su peso: 0 es lo que no puede esperar. Solo entra lo que
 * depende del asesorado; lo que está en manos de Inspira —un informe en
 * preparación— no es una tarea suya y no se le pone en la lista.
 */
export function pendientesDe(servicios, perfil, conAcademico) {
  const items = [];

  const faltan = datosQueFaltan(perfil, conAcademico);
  if (faltan > 0) {
    items.push({
      clave: "perfil", peso: 3, tono: "aviso", icono: "usuario",
      texto: `Te ${faltan === 1 ? "falta un dato" : `faltan ${faltan} datos`} del perfil`,
      accion: "Completar", href: rutaDe({ tab: "perfil" }),
    });
  }

  for (const s of servicios || []) {
    const r = s.resumen || {};
    const tipo = servicioDe(s);
    // Estancia y modificatoria no tienen secciones con URL: se abre el expediente.
    const conSecciones = !r.servicio_propio;
    const ir = (seccion) => rutaDe({ idServicio: s.id_solicitud, seccion: conSecciones ? seccion : null });
    const de = recorta(s.invitado ? `Expediente de ${s.titular}` : s.titulo);
    const id = s.id_solicitud;

    for (const q of r.requerimientos || []) {
      items.push({
        clave: `req-${id}-${q.titulo}`, peso: 0, tono: "alto", icono: "escudo",
        texto: `Requerimiento de Extranjería: ${q.titulo}`,
        detalle: q.plazo ? `Plazo: ${q.plazo}` : null, servicio: de,
        accion: "Ver", href: ir(null),
      });
    }
    if (r.docs_observados > 0) {
      items.push({
        clave: `obs-${id}`, peso: 1, tono: "alto", icono: "documento",
        texto: plural(r.docs_observados, "documento observado", "documentos observados"),
        detalle: "Hay que volver a subirlos corregidos", servicio: de,
        accion: "Corregir", href: ir("docs"),
      });
    }
    for (const p of r.plazos || []) {
      const d = diasHasta(p.cierra);
      items.push({
        clave: `plazo-${id}-${p.id_master}`, peso: d <= 3 ? 0 : 2, tono: d <= 3 ? "alto" : "aviso",
        icono: "reloj",
        texto: `${p.universidad || "Postulación"}: cierra ${cuando(d)}`,
        detalle: p.nombre, servicio: de,
        accion: "Ver plazos", href: ir("post"),
      });
    }
    if (r.datos_faltan > 0) {
      items.push({
        clave: `datos-${id}`, peso: 3, tono: "aviso", icono: "usuario",
        texto: `${plural(r.datos_faltan, "dato del expediente", "datos del expediente")} por completar`,
        servicio: de, accion: "Completar", href: ir(null),
      });
    }
    // En el máster «pendiente» es lo que el asesor aún no revisó, y eso no es
    // tarea del asesorado. En los expedientes propios es lo que falta por subir.
    if (r.servicio_propio && r.docs_pendientes > 0) {
      items.push({
        clave: `docs-${id}`, peso: 3, tono: "aviso", icono: "documento",
        texto: `${plural(r.docs_pendientes, "documento", "documentos")} por subir`,
        servicio: de, accion: "Subir", href: ir("docs"),
      });
    }
    if (r.formulario_completo === false) {
      items.push({
        clave: `form-${id}`, peso: 4, tono: "info", icono: "documento",
        texto: "Formulario académico pendiente",
        detalle: "Con él preparamos tu informe de másteres", servicio: de,
        accion: "Rellenar", href: ir("form"),
      });
    }
    if (r.eleccion_completa === false && r.informe_disponible && tipo !== SERVICIO.VISADO) {
      items.push({
        clave: `elec-${id}`, peso: 4, tono: "info", icono: "brujula",
        texto: "Elige tus másteres", detalle: "Tu informe ya está listo", servicio: de,
        accion: "Elegir", href: ir("eleccion"),
      });
    }
  }

  return items.sort((a, b) => a.peso - b.peso);
}
