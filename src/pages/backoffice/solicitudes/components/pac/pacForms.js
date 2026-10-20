// Qué va en cada casilla de los impresos del PAC familiar, a partir del
// expediente y de cada acompañante. Las plantillas son los PDF oficiales de
// la UGE (public/formularios/): MI-F (solicitud de residencia de familiar),
// declaración responsable de suficiencia de recursos y declaración jurada de
// mantenimiento del vínculo. Los nombres de las casillas (Texto30, Casilla de
// verificación8…) se sacaron del propio PDF; si el Ministerio cambia la
// plantilla, hay que rehacer el mapa.
//
// Los textos van en MAYÚSCULAS, como piden los impresos.

export const REPRESENTANTE = {
  nombre: "CYNTHIA",
  apellidos: "ESCOBAR RODRIGUEZ",
  completo: "CYNTHIA ESCOBAR RODRIGUEZ",
  dni: "29505718F",
  colegiatura: "15.695",
};

export const RUTAS = {
  mif: "/formularios/mi-f-familiar.pdf",
  recursos: "/formularios/declaracion-recursos.pdf",
  vinculo: "/formularios/declaracion-vinculo.pdf",
};

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
  "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const may = (v) => String(v || "").toUpperCase().trim();

export function partesFecha(v) {
  const m = String(v || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? { dia: m[3], mes: m[2], anio: m[1] } : { dia: "", mes: "", anio: "" };
}

export function hoyPartes() {
  const d = new Date();
  return { dia: String(d.getDate()).padStart(2, "0"), mes: MESES[d.getMonth()], anio: String(d.getFullYear()), largo: `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}` };
}

export function nombreCompleto(p = {}) {
  return may([p.nombres, p.apellido1, p.apellido2].filter(Boolean).join(" "));
}

export function apellidos(p = {}) {
  return may([p.apellido1, p.apellido2].filter(Boolean).join(" "));
}

/** «Juan Pérez García» → { nombres: JUAN, apellidos: PÉREZ GARCÍA } cuando solo hay un texto. */
export function partirNombre(txt = "") {
  const t = may(txt).split(/\s+/).filter(Boolean);
  if (t.length <= 1) return { nombres: t[0] || "", apellidos: "" };
  if (t.length === 2) return { nombres: t[0], apellidos: t[1] };
  return { nombres: t.slice(0, t.length - 2).join(" "), apellidos: t.slice(-2).join(" ") };
}

/** NIE «Y1234567X» → { letra: Y, numero: 1234567, final: X }. */
export function partesNIE(v) {
  const m = String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "").match(/^([XYZ])(\d{7})([A-Z])$/);
  return m ? { letra: m[1], numero: m[2], final: m[3] } : { letra: "", numero: "", final: "" };
}

const edadDe = (fecha) => {
  const m = String(fecha || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const nac = new Date(+m[1], +m[2] - 1, +m[3]); const hoy = new Date();
  let a = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) a -= 1;
  return a;
};

/**
 * Una «persona» del expediente, en la misma forma venga de donde venga: el
 * solicitante (exp) o un acompañante (a). Así los mapas de abajo son uno.
 */
export function personaDe(exp = {}, a = null) {
  if (!a) {
    return {
      ...exp,
      pasaporte: exp.pasaporte_numero,
      vinculo_mif: exp.vinculo,          // CONYUGE | PAREJA | HIJO | ASCENDIENTE
      es_solicitante: true,
      dom: { calle: exp.esp_direccion || exp.dom_direccion, localidad: exp.esp_localidad || exp.dom_localidad, cp: exp.esp_cp || exp.dom_cp, provincia: exp.esp_provincia || exp.dom_provincia },
      fuera_de_espana: exp.pais_residencia && exp.pais_residencia !== "España",
      representante: exp.patria_potestad ? { nombre: "", doc: "" } : null,
      edad: edadDe(exp.fecha_nacimiento),
    };
  }
  const vinculo = a.vinculo === "HIJO_COMUN" || a.vinculo === "HIJO_NO_COMUN" ? "HIJO" : a.vinculo;
  const propio = a.dom_mismo === false;
  return {
    ...a,
    vinculo_mif: vinculo,
    es_solicitante: false,
    dom: propio
      ? { calle: a.dom_direccion, localidad: a.dom_localidad, cp: a.dom_cp, provincia: a.dom_provincia }
      : { calle: exp.esp_direccion || exp.dom_direccion, localidad: exp.esp_localidad || exp.dom_localidad, cp: exp.esp_cp || exp.dom_cp, provincia: exp.esp_provincia || exp.dom_provincia },
    fuera_de_espana: exp.pais_residencia && exp.pais_residencia !== "España",
    representante: a.repr_nombre ? { nombre: a.repr_nombre, doc: a.repr_doc } : null,
    edad: edadDe(a.fecha_nacimiento),
    telefono: a.telefono || exp.telefono,
    correo: a.correo || exp.correo,
  };
}

/** El titular del PAC que da derecho: el propio expediente si es titular, o lo que anotó el familiar. */
export function titularDe(exp = {}) {
  if (exp.rol !== "FAMILIAR") {
    return { nombres: exp.nombres, apellidos: apellidos(exp), completo: nombreCompleto(exp), pasaporte: exp.pasaporte_numero, nie: exp.nie, expediente: exp.expediente_numero, empresa: exp.emp_razon_social, salario: exp.con_retribucion };
  }
  const p = partirNombre(exp.titular_nombre);
  return { nombres: p.nombres, apellidos: p.apellidos, completo: may(exp.titular_nombre), pasaporte: exp.titular_pasaporte, nie: exp.titular_nie, expediente: exp.titular_expediente_uge, empresa: exp.titular_empresa, salario: null };
}

/* ── MI-F ────────────────────────────────────────────────────────────────── */

const CIVIL_MIF = { "Soltero/a": "Casilla de verificación23", "Casado/a": "Casilla de verificación24", "Viudo/a": "Casilla de verificación25", "Divorciado/a": "Casilla de verificación26", "Separado/a": "Casilla de verificación27", "Unión de hecho": "Casilla de verificación28" };
const VINCULO_MIF = { CONYUGE: "Casilla de verificación29", PAREJA: "Casilla de verificación30", HIJO_MENOR: "Casilla de verificación31", HIJO_MAYOR: "Casilla de verificación32", ASCENDIENTE: "Casilla de verificación33" };

/** Texto y casillas del MI-F para una persona. `textos` por nombre de casilla, `casillas` a marcar, `sueltos` a dibujar donde el impreso no tiene casilla. */
export function valoresMIF(exp, a = null) {
  const p = personaDe(exp, a);
  const t = titularDe(exp);
  const nac = partesFecha(p.fecha_nacimiento);
  const nie = partesNIE(p.nie);
  const nieT = partesNIE(t.nie);
  const hoy = hoyPartes();
  const abogado = exp.presentacion_via !== "CERTIFICADO_PROPIO";

  const textos = {
    Texto30: may(p.pasaporte), Texto31: nie.letra, Texto32: nie.numero, Texto33: nie.final,
    Texto34: apellidos(p), Texto35: may(p.nombres),
    Texto36: may(p.lugar_nacimiento),
    Texto37: nac.dia, Texto38: nac.mes, Texto39: nac.anio,
    Texto40: may(p.pais_nacimiento), Texto41: may(p.nacionalidad),
    Texto42: may(p.nombre_padre), Texto43: may(p.nombre_madre),
    Texto44: may(p.dom.calle),
    Texto47: p.telefono || "", Texto48: (p.correo || "").toLowerCase(),
    Texto49: p.representante ? may(p.representante.nombre) : "", Texto50: p.representante ? may(p.representante.doc) : "",
    // El familiar que da derecho
    Texto51: may(t.expediente), Texto52: may(t.pasaporte), Texto53: nieT.letra, Texto54: nieT.numero, Texto55: nieT.final,
    Texto56: t.apellidos, Texto57: may(t.nombres),
    // Quien presenta
    Texto58: abogado ? REPRESENTANTE.apellidos : "", Texto59: abogado ? REPRESENTANTE.nombre : "", Texto62: abogado ? REPRESENTANTE.dni : "",
    // Lugar y fecha
    Texto64: may(p.fuera_de_espana ? (exp.dom_localidad || "") : (p.dom.localidad || "")), Texto65: hoy.dia, Texto66: hoy.mes, Texto67: hoy.anio,
  };

  const casillas = ["Casilla de verificación8", "Casilla de verificación13"]; // familiar de PAC · inicial
  if (p.fuera_de_espana) casillas.push("Casilla de verificación15");
  if (p.sexo === "Hombre") casillas.push("Casilla de verificación21");
  if (p.sexo === "Mujer") casillas.push("Casilla de verificación22");
  if (CIVIL_MIF[p.estado_civil]) casillas.push(CIVIL_MIF[p.estado_civil]);
  const v = p.vinculo_mif === "HIJO" ? (p.edad !== null && p.edad >= 18 ? "HIJO_MAYOR" : "HIJO_MENOR") : p.vinculo_mif;
  if (VINCULO_MIF[v]) casillas.push(VINCULO_MIF[v]);

  // Localidad, C.P., provincia y país de residencia no tienen casilla en la
  // plantilla oficial: se escriben encima, en su sitio.
  const sueltos = [
    { x: 84, y: 383, texto: may(p.dom.localidad) },
    { x: 306, y: 383, texto: may(p.dom.cp) },
    { x: 400, y: 383, texto: may(p.dom.provincia) },
    { x: 160, y: 373, texto: p.fuera_de_espana ? may(exp.pais_residencia === "Otro" ? exp.dom_provincia : exp.pais_residencia) : "" },
  ];
  return { textos, casillas, sueltos, firma: "Texto68", nombre: `MI-F-${(p.apellido1 || "familiar").split(" ")[0].toLowerCase()}.pdf` };
}

/* ── Declaración responsable de suficiencia de recursos ──────────────────── */

const CIVIL_DECL = { "Soltero/a": "Casilla de verificación2", "Casado/a": "Casilla de verificación3", "Viudo/a": "Casilla de verificación4", "Divorciado/a": "Casilla de verificación5", "Separado/a": "Casilla de verificación6" };

function identidadDeclaracion(p) {
  const nac = partesFecha(p.fecha_nacimiento);
  return {
    Texto1: may(p.nombres), Texto2: may(p.apellido1), Texto3: may(p.apellido2),
    Texto4: may(p.nacionalidad), Texto5: may(p.nie), Texto6: may(p.pasaporte),
    Texto7: nac.dia, Texto8: nac.mes, Texto9: nac.anio,
    Texto10: may(p.lugar_nacimiento), Texto11: may(p.pais_nacimiento),
    Texto12: may(p.nombre_padre), Texto13: may(p.nombre_madre),
    Texto14: may(p.dom.calle), Texto17: may(p.dom.localidad), Texto18: may(p.dom.cp), Texto19: may(p.dom.provincia),
    Texto20: p.telefono || "", Texto21: (p.correo || "").toLowerCase(),
  };
}

export function valoresRecursos(exp, a = null) {
  const p = personaDe(exp, a);
  const t = titularDe(exp);
  const hoy = hoyPartes();
  const salario = t.salario ? `${t.salario} € BRUTOS/AÑO` : "";
  return {
    textos: {
      ...identidadDeclaracion(p),
      // Medios: el contrato del titular, en «Otros».
      Texto46: `CONTRATO DE TRABAJO DEL TITULAR ${t.completo}`.trim(), Texto50: t.empresa ? `EMPRESA ${may(t.empresa)}` : "", Texto54: salario,
      Texto47: a || exp.rol === "FAMILIAR" ? "NÓMINAS Y AHORROS DE LA UNIDAD FAMILIAR" : "",
      Texto58: may(p.dom.localidad), Texto59: hoy.dia, Texto60: hoy.mes, Texto61: hoy.anio,
    },
    casillas: ["Casilla de verificación11", ...(CIVIL_DECL[p.estado_civil] ? [CIVIL_DECL[p.estado_civil]] : [])],
    sueltos: [],
    firma: "Texto62",
    nombre: `Declaracion-recursos-${(p.apellido1 || "solicitante").split(" ")[0].toLowerCase()}.pdf`,
  };
}

/* ── Declaración jurada de mantenimiento del vínculo (la firma el titular) ── */

const PARENTESCO = { CONYUGE: "cónyuge", PAREJA: "pareja", HIJO: "hijo/a", HIJO_COMUN: "hijo/a", HIJO_NO_COMUN: "hijo/a", ASCENDIENTE: "ascendiente" };

export function valoresVinculo(exp, a = null) {
  // El declarante es el titular del PAC. Si el expediente es del titular, sus
  // datos salen enteros; si es de un familiar, solo lo que anotó del titular.
  const esTitular = exp.rol !== "FAMILIAR";
  const t = titularDe(exp);
  const declarante = esTitular ? personaDe(exp) : { nombres: t.nombres, apellido1: t.apellidos.split(" ")[0] || "", apellido2: t.apellidos.split(" ").slice(1).join(" "), pasaporte: t.pasaporte, nie: t.nie, dom: {}, fecha_nacimiento: "" };
  const familiar = a ? personaDe(exp, a) : personaDe(exp);
  const parentesco = PARENTESCO[a ? a.vinculo : exp.vinculo] || "familiar";
  const hoy = hoyPartes();
  return {
    textos: {
      ...identidadDeclaracion(declarante),
      Texto22: `${nombreCompleto(familiar)} (${parentesco.toUpperCase()})`,
      Texto23: may(familiar.dom?.localidad || exp.esp_localidad || ""), Texto24: hoy.dia, Texto25: hoy.mes, Texto26: hoy.anio,
    },
    casillas: CIVIL_DECL[declarante.estado_civil] ? [CIVIL_DECL[declarante.estado_civil]] : [],
    sueltos: [],
    firma: "Texto27",
    nombre: `Declaracion-vinculo-${(familiar.apellido1 || "familiar").split(" ")[0].toLowerCase()}.pdf`,
  };
}

/* ── Qué falta para que salgan completos ─────────────────────────────────── */

export function faltaParaMIF(exp, a = null) {
  const p = personaDe(exp, a);
  const t = titularDe(exp);
  const faltan = [];
  const pide = (v, l) => { if (!String(v || "").trim()) faltan.push(l); };
  pide(p.pasaporte, "pasaporte"); pide(p.apellido1, "apellidos"); pide(p.nombres, "nombre");
  pide(p.fecha_nacimiento, "fecha de nacimiento"); pide(p.nacionalidad, "nacionalidad");
  pide(p.vinculo_mif, "vínculo");
  pide(t.pasaporte, "pasaporte del titular"); pide(t.expediente, "nº de expediente del titular");
  if (p.edad !== null && p.edad < 18 && !p.representante) faltan.push("representante legal del menor");
  return faltan;
}
