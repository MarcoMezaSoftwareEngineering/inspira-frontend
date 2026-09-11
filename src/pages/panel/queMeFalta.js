// «¿Qué me falta?»: lo que le queda al asesorado en un expediente, dicho con
// los datos del propio expediente. Sin IA y sin llamadas nuevas: cada
// expediente ya carga su checklist, sus datos y sus plazos; aquí solo se
// cuentan y se redactan. Si un dato no está, no se menciona.
import { fechaCorta } from "../../lib/horas";

const lista = (nombres, max = 3) => {
  const n = nombres.filter(Boolean);
  if (n.length <= max) return n.join(", ").replace(/, ([^,]*)$/, " y $1");
  return `${n.slice(0, max).join(", ")} y ${n.length - max} más`;
};

/** «2027-01-29» → «29 ene 2027». Si no es una fecha, el texto tal cual. */
export function fechaLegible(valor) {
  if (!valor) return "";
  const t = String(valor);
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return fechaCorta(`${t}T12:00:00Z`);
  if (/^\d{4}-\d{2}-\d{2}T/.test(t)) return fechaCorta(t);
  return t;
}

const estadoDe = (it) => String(it?.estado_item || "pendiente").toLowerCase();
const nombreDe = (it) => it?.item?.nombre_item || "Documento";

/** Cuentas del checklist de máster y visado. */
export function cuentasChecklist(checklist = []) {
  const items = checklist || [];
  const conArchivo = (it) => (it.documentos || []).length > 0;
  return {
    total: items.filter((it) => estadoDe(it) !== "no_aplica").length,
    aprobados: items.filter((it) => estadoDe(it) === "aprobado").length,
    porCorregir: items.filter((it) => ["observado", "rechazado"].includes(estadoDe(it))),
    pedidos: items.filter((it) => estadoDe(it) === "solicitado" && !conArchivo(it)),
    enRevision: items.filter((it) => estadoDe(it) === "enviado" || (["pendiente", "solicitado"].includes(estadoDe(it)) && conArchivo(it))),
    sinSubir: items.filter((it) => estadoDe(it) === "pendiente" && !conArchivo(it) && it.item?.obligatorio !== false),
  };
}

/** Las filas de documentos, comunes a máster y visado. */
function filasChecklist(c, irDocs) {
  const filas = [];
  for (const it of c.porCorregir) {
    filas.push({
      clave: `obs-${it.id_solicitud_item}`, tono: "alto", icono: "edit",
      texto: `Corregir «${nombreDe(it)}»`,
      detalle: it.comentario_asesor ? `Tu asesor: ${it.comentario_asesor}` : null,
      accion: "Corregir", onIr: irDocs, nombres: [`${nombreDe(it)} (por corregir)`],
    });
  }
  if (c.pedidos.length) {
    filas.push({
      clave: "pedidos", tono: "alto", icono: "plus",
      texto: `Tu asesor te pidió: ${lista(c.pedidos.map(nombreDe))}`,
      detalle: c.pedidos.map((it) => it.comentario_asesor).filter(Boolean)[0] || null,
      nombres: c.pedidos.map((it) => `${nombreDe(it)} (te lo pidió tu asesor)`),
      accion: "Subir", onIr: irDocs,
    });
  }
  if (c.sinSubir.length) {
    filas.push({
      clave: "sinsubir", tono: "aviso", icono: "upload",
      texto: `Por subir: ${lista(c.sinSubir.map(nombreDe))}`, nombres: c.sinSubir.map(nombreDe),
      accion: "Subir", onIr: irDocs,
    });
  }
  if (c.enRevision.length) {
    filas.push({
      clave: "revision", tono: "info", icono: "eye",
      texto: `En revisión por tu asesor: ${lista(c.enRevision.map(nombreDe))}`,
      detalle: "No tienes que hacer nada con estos.",
    });
  }
  return filas;
}

function filasComunes({ faltanPerfil, resumen, irPerfil, irPlazos, irRequerimientos }) {
  const filas = [];
  if (faltanPerfil > 0) {
    filas.push({
      clave: "perfil", tono: "aviso", icono: "user",
      texto: `Te ${faltanPerfil === 1 ? "falta un dato" : `faltan ${faltanPerfil} datos`} del perfil`,
      accion: "Completar", onIr: irPerfil,
    });
  }
  for (const q of resumen?.requerimientos || []) {
    filas.push({
      clave: `req-${q.titulo}`, tono: "alto", icono: "bell",
      texto: `Requerimiento de Extranjería: ${q.titulo}`,
      detalle: q.plazo ? `Plazo para responder: ${fechaLegible(q.plazo)}` : null,
      accion: "Ver", onIr: irRequerimientos,
    });
  }
  const plazos = [...(resumen?.plazos || [])].sort((a, b) => String(a.cierra).localeCompare(String(b.cierra)));
  if (plazos.length) {
    const p = plazos[0];
    filas.push({
      clave: "plazo", tono: "aviso", icono: "calendar",
      texto: `Plazo más cercano: ${p.universidad || p.nombre || "postulación"}, ~${fechaLegible(p.cierra)}`,
      detalle: plazos.length > 1 ? `Y ${plazos.length - 1} plazo(s) más en las próximas dos semanas` : p.nombre || null,
      accion: "Ver plazos", onIr: irPlazos,
    });
  }
  return filas;
}

function frase(partes) {
  return partes.filter(Boolean).join(" ");
}

/** Máster. */
export function queMeFaltaMaster({ checklist, formGuardado, compat, elecciones, resumen, faltanPerfil, ir }) {
  const c = cuentasChecklist(checklist);
  const filas = filasChecklist(c, () => ir.seccion("docs"));
  if (!formGuardado) {
    filas.push({
      clave: "form", tono: "aviso", icono: "fileText", texto: "Formulario académico sin terminar",
      detalle: "Con él preparamos tu informe de másteres", accion: "Rellenar", onIr: () => ir.seccion("form"),
    });
  }
  const elegidos = (elecciones || []).filter((e) => e.id_master).length;
  if (compat?.total && !elegidos) {
    filas.push({
      clave: "eleccion", tono: "aviso", icono: "checkCircle", texto: "Elegir tus másteres",
      detalle: "Tu informe ya está listo", accion: "Elegir", onIr: () => ir.seccion("informe"),
    });
  }
  filas.push(...filasComunes({
    faltanPerfil, resumen, irPerfil: ir.perfil, irPlazos: () => ir.seccion("post"), irRequerimientos: () => ir.seccion("post"),
  }));
  return { resumen: resumenTexto(c, filas, faltanPerfil, resumen), filas };
}

/** Visado. */
export function queMeFaltaVisado({ checklist, datosCompletos, viaElegida, djCompleta, resumen, faltanPerfil, ir }) {
  const c = cuentasChecklist(checklist);
  const filas = [];
  if (!datosCompletos) {
    filas.push({
      clave: "datos", tono: "aviso", icono: "idCard", texto: "Tus datos del visado sin completar",
      detalle: "Pasaporte, fecha de nacimiento, domicilio y dirección del centro", accion: "Completar", onIr: () => ir.seccion("datos"),
    });
  }
  if (!viaElegida) {
    filas.push({
      clave: "via", tono: "aviso", icono: "coins", texto: "Elegir tu vía de medios económicos",
      detalle: "Decide qué documentos de solvencia se te piden", accion: "Elegir", onIr: () => ir.seccion("economicos"),
    });
  } else if (!djCompleta) {
    filas.push({
      clave: "dj", tono: "aviso", icono: "coins", texto: "Describir tu situación laboral para la declaración jurada",
      accion: "Completar", onIr: () => ir.seccion("economicos"),
    });
  }
  filas.push(...filasChecklist(c, () => ir.seccion("docs")));
  filas.push(...filasComunes({
    faltanPerfil, resumen, irPerfil: ir.perfil, irPlazos: () => ir.seccion("estado"), irRequerimientos: () => ir.seccion("estado"),
  }));
  return { resumen: resumenTexto(c, filas, faltanPerfil, resumen), filas };
}

/** Estancia: sus ranuras de documentos, su revisión de datos y Extranjería. */
export function queMeFaltaEstancia({ revision, docs, extranjeria, faltanPerfil, ir }) {
  const filas = [];
  const faltanDatos = revision?.faltan || [];
  if (faltanDatos.length) {
    filas.push({
      clave: "datos", tono: "aviso", icono: "idCard",
      texto: `Te ${faltanDatos.length === 1 ? "falta un dato" : `faltan ${faltanDatos.length} datos`} del expediente`,
      detalle: lista(faltanDatos, 4), accion: "Completar", onIr: () => ir.bloque(1),
    });
  }
  const ranuras = docs?.ranuras || {};
  const etiqueta = (k) => ranuras[k]?.etiqueta || k;
  for (const k of docs?.observados || []) {
    const archivos = ranuras[k]?.archivos || [];
    const obs = [...archivos].reverse().find((a) => a.observacion)?.observacion;
    filas.push({
      clave: `obs-${k}`, tono: "alto", icono: "edit", texto: `Corregir «${etiqueta(k)}»`,
      detalle: obs ? `Tu asesor: ${obs}` : null, accion: "Corregir", onIr: () => ir.bloque(3),
      nombres: [`${etiqueta(k)} (por corregir)`],
    });
  }
  if ((docs?.faltan || []).length) {
    filas.push({
      clave: "faltan", tono: "aviso", icono: "upload",
      texto: `Por subir: ${lista(docs.faltan.map(etiqueta))}`, accion: "Subir", onIr: () => ir.bloque(3),
      nombres: docs.faltan.map(etiqueta),
    });
  }
  const deCliente = Object.entries(ranuras).filter(([, d]) => d.de === "cliente" && !d.varios);
  const enRevision = deCliente.filter(([, d]) => d.estado === "PENDIENTE" && (d.archivos || []).length);
  if (enRevision.length) {
    filas.push({
      clave: "revision", tono: "info", icono: "eye",
      texto: `En revisión por tu asesor: ${lista(enRevision.map(([, d]) => d.etiqueta))}`,
      detalle: "No tienes que hacer nada con estos.",
    });
  }
  for (const r of (extranjeria || []).filter((x) => x.tipo === "REQUERIMIENTO")) {
    filas.push({
      clave: `req-${r.id_registro}`, tono: "alto", icono: "bell", texto: `Requerimiento de Extranjería: ${r.titulo}`,
      detalle: r.plazo ? `Plazo para responder: ${fechaLegible(r.plazo)}` : null, accion: "Ver", onIr: () => ir.bloque(5),
    });
  }
  if (faltanPerfil > 0) {
    filas.push({
      clave: "perfil", tono: "aviso", icono: "user",
      texto: `Te ${faltanPerfil === 1 ? "falta un dato" : `faltan ${faltanPerfil} datos`} del perfil`,
      accion: "Completar", onIr: ir.perfil,
    });
  }
  const pl = revision?.plazos;
  const plazos = [
    pl?.antelacion?.limite ? { t: "Presentar antes de", d: pl.antelacion } : null,
    pl?.tope?.limite ? { t: "Tope desde tu llegada", d: pl.tope } : null,
  ].filter(Boolean).sort((a, b) => String(a.d.limite).localeCompare(String(b.d.limite)));
  if (plazos.length && !revision?.etapa?.clave?.match(/PRESENTADO|REQUERIDO|FAVORABLE|DESFAVORABLE/)) {
    const p = plazos[0];
    filas.push({
      clave: "plazo", tono: p.d.a_tiempo === false ? "alto" : "aviso", icono: "calendar",
      texto: `Plazo más cercano: ${p.t.toLowerCase()} ~${fechaLegible(p.d.limite)}`,
      detalle: p.d.dias_restantes != null ? (p.d.a_tiempo === false ? `Pasado hace ${Math.abs(p.d.dias_restantes)} día(s)` : `Quedan ${p.d.dias_restantes} día(s)`) : null,
      accion: "Ver", onIr: () => ir.bloque(1),
    });
  }
  const aprobados = deCliente.filter(([, d]) => d.estado === "APROBADO").length;
  const c = { total: deCliente.length, aprobados };
  return { resumen: resumenTexto(c, filas, 0, null), filas };
}

function resumenTexto(c, filas, faltanPerfil, resumen) {
  const accionables = filas.filter((f) => f.onIr);
  const docs = c.total ? `Tienes ${c.aprobados} de ${c.total} documentos aprobados.` : null;
  if (!accionables.length) {
    return frase([docs, "Ahora mismo no te falta nada: tu asesor sigue el expediente y te avisará si hace falta algo."]);
  }
  const nombres = filas.flatMap((f) => f.nombres || []);
  const perfil = faltanPerfil > 0 ? `Te ${faltanPerfil === 1 ? "falta un dato" : `faltan ${faltanPerfil} datos`} del perfil.` : null;
  const plazo = filas.find((f) => f.clave === "plazo");
  const conRequerimiento = filas.some((f) => f.clave.startsWith("req-")) || resumen?.requerimientos?.length;
  return frase([
    docs,
    nombres.length ? `Pendientes: ${lista(nombres, 4)}.` : null,
    perfil,
    plazo ? `${plazo.texto}.` : null,
    conRequerimiento ? "Tienes un requerimiento de Extranjería abierto." : null,
  ]);
}
