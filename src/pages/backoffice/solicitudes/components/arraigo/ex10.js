// Mapa del formulario EX-10 (autorización de residencia por circunstancias
// excepcionales) para el ARRAIGO SOCIOFORMATIVO.
//
// De los seis apartados del impreso solo se rellenan tres, que son los que
// toca el asesorado en este arraigo:
//   1) datos de la persona extranjera
//   4) domicilio a efectos de notificaciones
//   6) centro de formación
// Quedan en blanco el 2 (familiar UE, solo arraigo familiar), el 3
// (representante) y el 5 (empleador, solo arraigo sociolaboral).
//
// La plantilla (public/formularios/ex10-arraigo-socioformativo.pdf) es el
// impreso oficial rellenable, con campos de nombre genérico (Texto1…). El mapa
// se hizo rellenando cada campo con su propio nombre y mirando el resultado,
// no suponiendo: ver ex10.test.js, que comprueba que cada campo existe.
import { partesFecha, aDMY } from "../estancia/ex00";
import { partesNIE } from "../estancia/ex00";

export const RUTA_EX10 = "/formularios/ex10-arraigo-socioformativo.pdf";

const may = (v) => String(v || "").toUpperCase();

/**
 * Los datos del expediente que usa el impreso. Mismos nombres que el resto de
 * expedientes de extranjería (estancia, PAC) y, para el apartado 6:
 *
 *   form_tipo        secundaria | certificado | adultos | spe
 *   form_entidad     entidad que imparte la formación
 *   form_denominacion, form_codigo, form_nif_entidad, form_direccion,
 *   form_provincia, form_horas, form_inicio, form_fin
 *   form_modalidad   PRESENCIAL | A_DISTANCIA | MIXTA
 */
export const TIPOS_FORMACION = [
  { clave: "secundaria", etiqueta: "Educación secundaria postobligatoria" },
  { clave: "certificado", etiqueta: "Obtención de certificado profesional" },
  { clave: "adultos", etiqueta: "Oferta presencial de las enseñanzas obligatorias (educación de personas adultas)" },
  { clave: "spe", etiqueta: "Formación promovida por los Servicios Públicos de Empleo" },
];

export const MODALIDADES = [
  { clave: "PRESENCIAL", etiqueta: "Presencial" },
  { clave: "A_DISTANCIA", etiqueta: "A distancia" },
  { clave: "MIXTA", etiqueta: "Mixta" },
];

/** El domicilio en España del solicitante (el del expediente, sin más). */
function domicilio(exp) {
  return {
    calle: exp.dom_direccion, numero: exp.dom_numero, piso: exp.dom_piso,
    localidad: exp.dom_localidad, cp: exp.dom_cp, provincia: exp.dom_provincia,
  };
}

export function valoresEX10(exp = {}) {
  const nac = partesFecha(exp.fecha_nacimiento);
  const nie = partesNIE(exp.nie);
  const dom = domicilio(exp);
  const completo = [exp.nombres, exp.apellido1, exp.apellido2].filter(Boolean).join(" ").toUpperCase();
  const tel = exp.dom_telefono || exp.telefono;
  const correo = exp.dom_correo || exp.correo;

  return {
    // ── 1) Datos de la persona extranjera ──
    Texto1: exp.pasaporte_numero,
    Texto2: nie.inicial,
    Texto3: nie.numero,
    Texto4: nie.final,
    Texto5: may(exp.apellido1),
    Texto6: may(exp.apellido2),
    Texto7: may(exp.nombres),
    Texto8: nac.dia,
    Texto9: nac.mes,
    Texto10: nac.anio,
    Texto11: may(exp.lugar_nacimiento),
    Texto12: may(exp.pais_nacimiento),
    Texto13: may(exp.nacionalidad),
    Texto14: may(exp.nombre_padre),
    Texto15: may(exp.nombre_madre),
    Texto16: may(dom.calle),
    Texto17: dom.numero,
    Texto18: dom.piso,
    Texto19: may(dom.localidad),
    Texto20: dom.cp,
    Texto21: may(dom.provincia),
    Texto22: tel,
    Texto23: correo,

    // ── 4) Domicilio a efectos de notificaciones: el del propio solicitante ──
    Texto61: completo,
    Texto62: exp.pasaporte_numero,
    Texto63: may(dom.calle),
    Texto64: dom.numero,
    Texto65: dom.piso,
    Texto66: may(dom.localidad),
    Texto67: dom.cp,
    Texto68: may(dom.provincia),
    Texto69: tel,
    Texto70: correo,

    // ── 6) Centro de formación ──
    Texto87: may(exp.form_entidad),
    Texto88: may(exp.form_denominacion),
    Texto89: exp.form_codigo,
    Texto90: may(exp.form_nif_entidad),
    Texto91: may(exp.form_direccion),
    Texto92: may(exp.form_provincia),
    Texto93: exp.form_horas,
    Texto94: aDMY(exp.form_inicio),
    Texto95: aDMY(exp.form_fin),
  };
}

// Casillas, identificadas por su posición en la página. Sexo y estado civil
// del apartado 1; el X del sexo es «no consta» y no se marca nunca.
const SEXO = { Hombre: 97, Mujer: 98 };
const CIVIL = { "Soltero/a": 99, "Casado/a": 100, "Viudo/a": 101, "Divorciado/a": 102, "Separado/a": 103 };
const TIPO = { secundaria: 112, certificado: 113, adultos: 114, spe: 115 };
const MODALIDAD = { PRESENCIAL: 116, A_DISTANCIA: 117, MIXTA: 118 };

// La casilla de consentimiento de notificación por Dehú (Casilla 261) no se
// marca: es una decisión del solicitante y de su representante, no un dato.

export function casillasEX10(exp = {}) {
  const n = [SEXO[exp.sexo], CIVIL[exp.estado_civil], TIPO[exp.form_tipo], MODALIDAD[exp.form_modalidad]];
  return n.filter(Boolean).map((x) => `Casilla de verificación${x}`);
}

/** Qué le falta al expediente para que el EX-10 salga completo. */
export function faltaParaEX10(exp = {}) {
  const req = [
    [exp.apellido1, "Primer apellido"],
    [exp.nombres, "Nombres"],
    [exp.pasaporte_numero, "Nº de pasaporte"],
    [exp.sexo, "Sexo"],
    [exp.estado_civil, "Estado civil"],
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
    [exp.dom_telefono || exp.telefono, "Teléfono"],
    [exp.dom_correo || exp.correo, "Correo"],
    [exp.form_tipo, "Tipo de formación"],
    [exp.form_entidad, "Entidad que imparte la formación"],
    [exp.form_denominacion, "Denominación de la formación"],
    [exp.form_direccion, "Dirección de la entidad"],
    [exp.form_provincia, "Provincia de la entidad"],
    [exp.form_horas, "Duración (horas)"],
    [exp.form_inicio, "Inicio de la formación"],
    [exp.form_fin, "Fin de la formación"],
    [exp.form_modalidad, "Modalidad"],
  ];
  return req.filter(([v]) => !String(v || "").trim()).map(([, l]) => l);
}
