// Mapa del formulario EX-00 de estancia por estudios.
//
// El EX-00 que publica la Administración no es rellenable: los campos los
// añadió Inspira sobre él, y quedaron con nombres genéricos (Texto1, Texto2…).
// Este mapa se sacó leyendo un ejemplar ya relleno y comparando cada valor con
// su casilla, así que la fuente de verdad es ese ejemplar, no una suposición.
//
// Si algún día se rehace la plantilla, hay que rehacer este mapa: los números
// no significan nada por sí solos.

/** La letrada que representa. Es siempre la misma; lo que cambia es el cliente. */
export const REPRESENTANTE = {
  nombre: "CYNTHIA ESCOBAR RODRIGUEZ",
  dni: "29505718F",
  colegiatura: "15.695",
};

/** dd/mm/aaaa o aaaa-mm-dd → { dia, mes, anio } */
export function partesFecha(v) {
  if (!v) return { dia: "", mes: "", anio: "" };
  const iso = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return { dia: iso[3], mes: iso[2], anio: iso[1] };
  const dmy = String(v).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return { dia: dmy[1].padStart(2, "0"), mes: dmy[2].padStart(2, "0"), anio: dmy[3] };
  return { dia: "", mes: "", anio: "" };
}

/** aaaa-mm-dd → dd/mm/aaaa, que es como lo pide el impreso. */
export function aDMY(v) {
  if (!v) return "";
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v);
}

export function nombreCompleto(exp = {}) {
  const partes = [exp.nombres, exp.apellido1, exp.apellido2].filter(Boolean);
  return partes.length ? partes.join(" ").toUpperCase() : (exp.nombre_completo || "").toUpperCase();
}

/**
 * Qué texto va en cada casilla.
 *
 * El propio impreso repite los datos del solicitante en el apartado de
 * notificaciones (Texto77-86). No es un error del formulario: allí se declara
 * a efectos de plazos. Se rellenan los dos con lo mismo.
 */
export function valoresEX00(exp = {}) {
  const nac = partesFecha(exp.fecha_nacimiento);

  // Si no tiene piso propio todavía, vale la dirección de la universidad: lo
  // que extranjería mira es que la jurisdicción coincida.
  const usaUni = exp.dom_usa_universidad;
  const dom = {
    calle: usaUni ? exp.uni_direccion : exp.dom_direccion,
    numero: usaUni ? "" : exp.dom_numero,
    piso: usaUni ? "" : exp.dom_piso,
    localidad: usaUni ? exp.uni_localidad : exp.dom_localidad,
    cp: usaUni ? exp.uni_cp : exp.dom_cp,
    provincia: usaUni ? exp.uni_provincia : exp.dom_provincia,
  };

  const completo = nombreCompleto(exp);

  return {
    // ── Solicitante ──
    Texto1: exp.pasaporte_numero,
    Texto5: (exp.apellido1 || "").toUpperCase(),
    Texto6: (exp.apellido2 || "").toUpperCase(),
    Texto7: (exp.nombres || "").toUpperCase(),
    Texto8: nac.dia,
    Texto9: nac.mes,
    Texto10: nac.anio,
    Texto11: (exp.lugar_nacimiento || "").toUpperCase(),
    Texto12: (exp.pais_nacimiento || "").toUpperCase(),
    Texto13: (exp.nacionalidad || "").toUpperCase(),
    Texto14: (exp.nombre_padre || "").toUpperCase(),
    Texto15: (exp.nombre_madre || "").toUpperCase(),
    Texto16: (dom.calle || "").toUpperCase(),
    Texto17: dom.numero,
    Texto18: dom.piso,
    Texto19: (dom.localidad || "").toUpperCase(),
    Texto20: dom.cp,
    Texto21: (dom.provincia || "").toUpperCase(),
    Texto22: exp.dom_telefono || exp.telefono,
    Texto23: exp.dom_correo || exp.correo,

    // ── Centro de estudios ──
    Texto27: exp.uni_denominacion,
    Texto30: exp.uni_denominacion,
    Texto33: exp.uni_direccion,
    Texto36: exp.uni_localidad,
    Texto37: exp.uni_cp,
    Texto38: exp.uni_provincia,

    // ── Programa ──
    Texto42: exp.prog_denominacion,
    Texto43: exp.prog_codigo,
    Texto44: aDMY(exp.prog_inicio || exp.formacion_inicio),
    Texto45: aDMY(exp.prog_fin || exp.formacion_fin),

    // ── Representación ──
    Texto64: REPRESENTANTE.nombre,
    Texto65: REPRESENTANTE.dni,

    // ── Domicilio a efectos de notificaciones ──
    Texto77: completo,
    Texto78: exp.pasaporte_numero,
    Texto79: (dom.calle || "").toUpperCase(),
    Texto82: (dom.localidad || "").toUpperCase(),
    Texto83: dom.cp,
    Texto84: (dom.provincia || "").toUpperCase(),
    Texto85: exp.dom_telefono || exp.telefono,
    Texto86: exp.dom_correo || exp.correo,
  };
}

/**
 * Qué casillas se marcan.
 *
 * Al sacar el mapa del ejemplar de referencia, las casillas de sexo y estado
 * civil parecían fijas: estaban marcadas «H» y «C» porque el titular de aquel
 * ejemplar era un varón casado. Copiarlas tal cual habría mandado a
 * extranjería el sexo y el estado civil de otra persona en todos los impresos.
 * Se identificaron por su posición en la página y ahora salen de los datos.
 *
 * Las de la última página sí van fijas: describen el supuesto, que es siempre
 * el mismo —estancia por estudios solicitada desde España y con representante.
 */
const SEXO = { Hombre: 3, Mujer: 4 };
const CIVIL = { "Soltero/a": 5, "Casado/a": 6, "Viudo/a": 7, "Divorciado/a": 8, "Separado/a": 9 };
const REGISTRO = { RUCT: 10, RCD: 11, OTRO: 12 };
const MODALIDAD = { PRESENCIAL: 15, SEMIPRESENCIAL: 16 };

// Adscripción a Universidad: lo que se marca cuando no se ha indicado un
// registro concreto, que es el caso más común en los másteres.
const ADSCRIPCION = 13;

const FIJAS = [18, 19, 20];

export function casillasEX00(exp = {}) {
  const n = new Set(FIJAS);

  if (SEXO[exp.sexo]) n.add(SEXO[exp.sexo]);
  if (CIVIL[exp.estado_civil]) n.add(CIVIL[exp.estado_civil]);
  if (REGISTRO[exp.uni_registro_tipo]) n.add(REGISTRO[exp.uni_registro_tipo]);
  else n.add(ADSCRIPCION);
  if (MODALIDAD[exp.prog_modalidad]) n.add(MODALIDAD[exp.prog_modalidad]);

  return [...n].map((x) => `Casilla de verificación${x}`);
}

/** Qué le falta al expediente para que el impreso salga completo. */
export function faltaParaEX00(exp = {}) {
  const usaUni = exp.dom_usa_universidad;
  const req = [
    [exp.apellido1, "Primer apellido"],
    [exp.nombres, "Nombres"],
    [exp.pasaporte_numero, "Nº de pasaporte"],
    [exp.fecha_nacimiento, "Fecha de nacimiento"],
    [exp.lugar_nacimiento, "Lugar de nacimiento"],
    [exp.pais_nacimiento, "País de nacimiento"],
    [exp.nacionalidad, "Nacionalidad"],
    [exp.nombre_padre, "Nombre del padre"],
    [exp.nombre_madre, "Nombre de la madre"],
    [usaUni ? exp.uni_direccion : exp.dom_direccion, "Domicilio en España"],
    [usaUni ? exp.uni_localidad : exp.dom_localidad, "Localidad"],
    [usaUni ? exp.uni_cp : exp.dom_cp, "Código postal"],
    [usaUni ? exp.uni_provincia : exp.dom_provincia, "Provincia"],
    [exp.dom_telefono || exp.telefono, "Teléfono"],
    [exp.dom_correo || exp.correo, "Correo"],
    [exp.uni_denominacion, "Universidad"],
    [exp.prog_denominacion, "Programa"],
    [exp.prog_inicio || exp.formacion_inicio, "Inicio del programa"],
    [exp.prog_fin || exp.formacion_fin, "Fin del programa"],
  ];
  return req.filter(([v]) => !String(v || "").trim()).map(([, l]) => l);
}

/* ── El acompañante ──────────────────────────────────────────────────────── */

/**
 * El domicilio que se pone en su impreso.
 *
 * Si vive con el titular, el del titular —que a su vez puede ser el de la
 * universidad, cuando todavía no tiene piso.
 */
export function domicilioAcompanante(a = {}, exp = {}) {
  if (a.dom_mismo === false) {
    return {
      calle: a.dom_direccion, numero: a.dom_numero, piso: a.dom_piso,
      localidad: a.dom_localidad, cp: a.dom_cp, provincia: a.dom_provincia,
    };
  }
  const usaUni = exp.dom_usa_universidad;
  return {
    calle: usaUni ? exp.uni_direccion : exp.dom_direccion,
    numero: usaUni ? "" : exp.dom_numero,
    piso: usaUni ? "" : exp.dom_piso,
    localidad: usaUni ? exp.uni_localidad : exp.dom_localidad,
    cp: usaUni ? exp.uni_cp : exp.dom_cp,
    provincia: usaUni ? exp.uni_provincia : exp.dom_provincia,
  };
}

/**
 * El NIE va partido en tres casillas —letra, número, letra—, tal como está
 * impreso. Se acepta escrito de cualquier forma: «Y1234567Z», «Y-1234567-Z».
 */
export function partesNIE(v) {
  const txt = String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!txt) return { inicial: "", numero: "", final: "" };
  const m = txt.match(/^([A-Z]?)(\d*)([A-Z]?)$/);
  if (!m) return { inicial: "", numero: txt, final: "" };
  return { inicial: m[1], numero: m[2], final: m[3] };
}

/**
 * Qué va en el impreso del acompañante.
 *
 * Sólo el bloque 1: el resto del EX-00 describe los estudios del titular, que
 * no son los suyos. El acompañante se vincula a la autorización del
 * estudiante, no pide una estancia por estudios propia.
 */
export function valoresEX00Acompanante(a = {}, exp = {}) {
  const nac = partesFecha(a.fecha_nacimiento);
  const dom = domicilioAcompanante(a, exp);
  const nie = partesNIE(a.nie);

  return {
    Texto1: a.pasaporte,
    Texto2: nie.inicial,
    Texto3: nie.numero,
    Texto4: nie.final,
    Texto5: (a.apellido1 || "").toUpperCase(),
    Texto6: (a.apellido2 || "").toUpperCase(),
    Texto7: (a.nombres || "").toUpperCase(),
    Texto8: nac.dia,
    Texto9: nac.mes,
    Texto10: nac.anio,
    Texto11: (a.lugar_nacimiento || "").toUpperCase(),
    Texto12: (a.pais_nacimiento || "").toUpperCase(),
    Texto13: (a.nacionalidad || "").toUpperCase(),
    Texto14: (a.nombre_padre || "").toUpperCase(),
    Texto15: (a.nombre_madre || "").toUpperCase(),
    Texto16: (dom.calle || "").toUpperCase(),
    Texto17: dom.numero,
    Texto18: dom.piso,
    Texto19: (dom.localidad || "").toUpperCase(),
    Texto20: dom.cp,
    Texto21: (dom.provincia || "").toUpperCase(),
    Texto22: a.telefono || exp.dom_telefono || exp.telefono,
    Texto23: a.correo || exp.dom_correo || exp.correo,

    // Representante legal, sólo cuando es menor de edad.
    Texto24: (a.repr_nombre || "").toUpperCase(),
    Texto25: a.repr_doc,
    Texto26: (a.repr_titulo || "").toUpperCase(),
  };
}

/** Sólo las del bloque 1: sexo y estado civil. Las demás describen al titular. */
export function casillasEX00Acompanante(a = {}) {
  const n = [];
  if (SEXO[a.sexo]) n.push(SEXO[a.sexo]);
  if (CIVIL[a.estado_civil]) n.push(CIVIL[a.estado_civil]);
  return n.map((x) => `Casilla de verificación${x}`);
}

export function faltaParaEX00Acompanante(a = {}, exp = {}) {
  const dom = domicilioAcompanante(a, exp);
  const req = [
    [a.apellido1, "Primer apellido"],
    [a.nombres, "Nombres"],
    [a.pasaporte, "Nº de pasaporte"],
    [a.fecha_nacimiento, "Fecha de nacimiento"],
    [a.lugar_nacimiento, "Lugar de nacimiento"],
    [a.pais_nacimiento, "País de nacimiento"],
    [a.nacionalidad, "Nacionalidad"],
    [a.nombre_padre, "Nombre del padre"],
    [a.nombre_madre, "Nombre de la madre"],
    [dom.calle, "Domicilio en España"],
    [dom.localidad, "Localidad"],
    [dom.cp, "Código postal"],
    [dom.provincia, "Provincia"],
  ];
  return req.filter(([v]) => !String(v || "").trim()).map(([, etiqueta]) => etiqueta);
}

/** «NOMBRES APELLIDOS» del acompañante, en mayúsculas. */
export function nombreAcompanante(a = {}) {
  return [a.nombres, a.apellido1, a.apellido2].filter(Boolean).join(" ").toUpperCase();
}
