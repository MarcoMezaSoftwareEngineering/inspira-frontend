// Mapa del impreso EX-03.
//
// «Solicitud de autorización de residencia temporal y trabajo por cuenta ajena
// o autorización de trabajo por cuenta ajena» (LO 4/2000 y RD 1155/2024).
//
// Las casillas se llaman Texto1…Texto120 y «Casilla de verificación27…123», que
// no significan nada por sí solas. El mapa se sacó leyendo la posición de cada
// widget en la página y cruzándola con el texto impreso al lado, no copiando un
// ejemplar relleno: así no se hereda el sexo ni el estado civil de nadie.
//
// Si algún día se cambia la plantilla, hay que rehacer este mapa.

/** La letrada que presenta. Es siempre la misma; lo que cambia es el cliente. */
export const REPRESENTANTE = {
  nombre: "CYNTHIA ESCOBAR RODRIGUEZ",
  dni: "29505718F",
  colegiatura: "15.695",
};

/** aaaa-mm-dd → { dia, mes, anio } */
export function partesFecha(v) {
  if (!v) return { dia: "", mes: "", anio: "" };
  const iso = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return { dia: iso[3], mes: iso[2], anio: iso[1] };
  const dmy = String(v).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return { dia: dmy[1].padStart(2, "0"), mes: dmy[2].padStart(2, "0"), anio: dmy[3] };
  return { dia: "", mes: "", anio: "" };
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

export function nombreCompleto(exp = {}) {
  const partes = [exp.nombres, exp.apellido1, exp.apellido2].filter(Boolean);
  return partes.length ? partes.join(" ").toUpperCase() : "";
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
  "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/**
 * Qué texto va en cada casilla.
 *
 * El bloque 4 —representante a efectos de presentación— es Inspira: quien
 * presenta la solicitud es la letrada, y ese bloque describe justamente eso.
 *
 * El bloque 5 —domicilio a efectos de notificaciones— lleva los datos del
 * asesorado, que es a quien tienen que llegarle las comunicaciones.
 *
 * Lo que se deja en blanco a propósito: el representante legal de la empresa
 * (no se pide en el portal), el de la persona extranjera (sólo para menores o
 * tutelados) y la oficina de destino del pie de página, que la pone quien
 * presenta porque depende de dónde se registre.
 */
export function valoresEX03(exp = {}) {
  const nac = partesFecha(exp.fecha_nacimiento);
  const nie = partesNIE(exp.nie);
  const hoy = new Date();

  return {
    // ── 1 · La persona extranjera ──
    Texto1: exp.pasaporte_numero,
    Texto2: nie.inicial,
    Texto3: nie.numero,
    Texto4: nie.final,
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
    Texto16: (exp.dom_direccion || "").toUpperCase(),
    Texto17: exp.dom_numero,
    Texto18: exp.dom_piso,
    Texto19: (exp.dom_localidad || "").toUpperCase(),
    Texto20: exp.dom_cp,
    Texto21: (exp.dom_provincia || "").toUpperCase(),
    Texto22: exp.telefono,
    Texto23: exp.correo,
    // Texto24/25/26: representante legal del extranjero. Sólo para menores o
    // personas tuteladas, que no es el caso de este servicio.

    // ── 2 · El empleador ──
    Texto37: (exp.emp_razon_social || "").toUpperCase(),
    Texto38: exp.emp_nif,
    Texto39: (exp.emp_actividad || "").toUpperCase(),
    Texto40: exp.emp_cnae,
    Texto41: (exp.emp_direccion || "").toUpperCase(),
    Texto42: exp.emp_numero,
    Texto43: exp.emp_piso,
    Texto44: (exp.emp_localidad || "").toUpperCase(),
    Texto45: exp.emp_cp,
    Texto46: (exp.emp_provincia || "").toUpperCase(),
    Texto47: exp.emp_telefono,
    Texto48: exp.emp_correo,
    // Texto49/50/51: representante legal de la empresa. No se pide en el portal.

    // ── 3 · El contrato ──
    Texto52: (exp.con_puesto || "").toUpperCase(),
    Texto53: exp.con_grupo_cotizacion,
    Texto54: exp.con_cno_sepe,
    Texto55: exp.con_codigo_convenio,
    Texto56: (exp.con_denom_convenio || "").toUpperCase(),
    Texto57: exp.con_codigo_contrato,
    Texto58: (exp.con_denom_contrato || "").toUpperCase(),
    Texto59: exp.con_cuenta_cotizacion,
    Texto60: exp.con_retribucion,
    Texto61: (exp.con_centro_direccion || "").toUpperCase(),
    Texto62: exp.con_centro_numero,
    Texto63: exp.con_centro_piso,
    Texto64: (exp.con_centro_localidad || "").toUpperCase(),
    Texto65: exp.con_centro_cp,
    Texto66: (exp.con_centro_provincia || "").toUpperCase(),

    // ── 4 · Quién presenta la solicitud ──
    Texto67: REPRESENTANTE.nombre,
    Texto68: REPRESENTANTE.dni,

    // ── 5 · Domicilio a efectos de notificaciones ──
    Texto80: nombreCompleto(exp),
    Texto81: exp.nie || exp.pasaporte_numero,
    Texto82: (exp.dom_direccion || "").toUpperCase(),
    Texto83: exp.dom_numero,
    Texto84: exp.dom_piso,
    Texto85: (exp.dom_localidad || "").toUpperCase(),
    Texto86: exp.dom_cp,
    Texto87: (exp.dom_provincia || "").toUpperCase(),
    Texto88: exp.telefono,
    Texto89: exp.correo,

    // ── Lugar y fecha de la firma ──
    Texto113: (exp.dom_localidad || exp.con_centro_localidad || "").toUpperCase(),
    Texto114: String(hoy.getDate()),
    Texto115: MESES[hoy.getMonth()],
    Texto116: String(hoy.getFullYear()),
  };
}

/**
 * Qué casillas se marcan.
 *
 * Sólo las que se deducen sin interpretar nada: sexo, estado civil, hijos a
 * cargo, que es una autorización inicial y si el contrato llega o no al año.
 *
 * Lo que NO se marca solo, y es deliberado: las exenciones de la situación
 * nacional de empleo —incluida la de los convenios con Chile y Perú—, la
 * ocupación de difícil cobertura y los supuestos especiales. Decidir que un
 * expediente entra en una exención es criterio jurídico, y una casilla marcada
 * de más en un impreso oficial la firma alguien.
 */
const SEXO = { Hombre: 28, Mujer: 29, X: 27 };
const CIVIL = {
  "Soltero/a": 30, "Casado/a": 31, "Viudo/a": 32, "Divorciado/a": 33, "Separado/a": 34,
};
const HIJOS = { si: 35, no: 36 };

/** Autorización inicial: es de lo que va este trámite, no de una renovación. */
const INICIAL = 93;
const CONTRATO_MENOR_ANIO = 91;
const CONTRATO_ANIO_O_MAS = 92;

/** Firma el representante legal, que es quien presenta. */
const FIRMA_REPRESENTANTE = 123;

export function casillasEX03(exp = {}) {
  const n = new Set([INICIAL, FIRMA_REPRESENTANTE]);

  if (SEXO[exp.sexo]) n.add(SEXO[exp.sexo]);
  if (CIVIL[exp.estado_civil]) n.add(CIVIL[exp.estado_civil]);

  if (exp.hijos_escolarizacion === true) n.add(HIJOS.si);
  else if (exp.hijos_escolarizacion === false) n.add(HIJOS.no);

  if (exp.con_duracion === "1 año" || exp.con_duracion === "Indefinido") {
    n.add(CONTRATO_ANIO_O_MAS);
  } else if (exp.con_duracion) {
    n.add(CONTRATO_MENOR_ANIO);
  }

  return [...n].map((x) => `Casilla de verificación${x}`);
}

/** Qué le falta al expediente para que el impreso salga completo. */
export function faltaParaEX03(exp = {}) {
  const req = [
    [exp.apellido1, "Primer apellido"],
    [exp.nombres, "Nombres"],
    [exp.pasaporte_numero, "Nº de pasaporte"],
    [exp.nie, "NIE"],
    [exp.fecha_nacimiento, "Fecha de nacimiento"],
    [exp.lugar_nacimiento, "Lugar de nacimiento"],
    [exp.pais_nacimiento, "País de nacimiento"],
    [exp.nacionalidad, "Nacionalidad"],
    [exp.nombre_padre, "Nombre del padre"],
    [exp.nombre_madre, "Nombre de la madre"],
    [exp.dom_direccion, "Domicilio en España"],
    [exp.dom_localidad, "Localidad"],
    [exp.dom_cp, "Código postal"],
    [exp.dom_provincia, "Provincia"],
    [exp.telefono, "Teléfono"],
    [exp.correo, "Correo"],
    [exp.emp_razon_social, "Razón social de la empresa"],
    [exp.emp_nif, "NIF de la empresa"],
    [exp.emp_actividad, "Actividad de la empresa"],
    [exp.emp_direccion, "Domicilio social"],
    [exp.emp_localidad, "Localidad de la empresa"],
    [exp.emp_cp, "C.P. de la empresa"],
    [exp.emp_provincia, "Provincia de la empresa"],
    [exp.con_puesto, "Puesto de trabajo"],
    [exp.con_retribucion, "Retribución"],
    [exp.con_duracion, "Duración del contrato"],
    [exp.con_centro_direccion, "Dirección del centro de trabajo"],
    [exp.con_centro_localidad, "Localidad del centro de trabajo"],
    [exp.con_centro_provincia, "Provincia del centro de trabajo"],
  ];
  return req.filter(([v]) => !String(v || "").trim()).map(([, etiqueta]) => etiqueta);
}

/**
 * Las casillas que el impreso tiene y nadie ha decidido: se las enseña al
 * asesor para que las repase antes de firmar, en vez de que las descubra
 * Extranjería.
 */
export function casillasPendientes(exp = {}) {
  const pendientes = [];
  if (/per[uú]|chile/i.test(String(exp.nacionalidad || ""))) {
    pendientes.push(
      "Exención de la situación nacional de empleo por convenio internacional " +
      "(Chile y Perú, art. 74.2). Si aplica a este expediente, márcala a mano."
    );
  }
  if (!exp.con_cno_sepe) {
    pendientes.push("El código CNO-SEPE 2011 de la ocupación está vacío.");
  }
  pendientes.push(
    "El pie de página —oficina de destino, código DIR3 y provincia— lo pone " +
    "quien registra la solicitud."
  );
  return pendientes;
}
