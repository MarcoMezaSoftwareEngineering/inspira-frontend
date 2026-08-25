// src/pages/panel/components/mis-servicios/sections/visaSolvencia.js
//
// Reglas de solvencia económica del visado de estudios (consulado de España).
// Viven aparte de la interfaz porque son conocimiento de negocio: cambian
// cuando cambia el criterio consular, no cuando cambia el diseño.

/* Perfiles de quien financia. Cada uno añade documentos a la lista. */
export const PERFILES = [
  {
    key: "dep", icono: "💼", nombre: "Trabajador dependiente", sub: "En planilla",
    docs: ["Boletas de pago de los últimos 6 meses"],
  },
  {
    key: "indep", icono: "🧾", nombre: "Independiente", sub: "Recibos por honorarios",
    docs: [
      "Ficha RUC",
      "Declaración anual del ejercicio fiscal anterior",
      "Declaraciones de los últimos 3 meses",
    ],
  },
  {
    key: "socio", icono: "🏢", nombre: "Socio de una empresa", sub: "Participación societaria",
    docs: [
      "Ficha RUC",
      "Declaración personal de impuestos del último año fiscal",
      "Declaraciones de los últimos 3 meses",
      "Comprobantes del reparto de utilidades, dietas, bonos o gratificaciones",
    ],
  },
  {
    key: "alq", icono: "🏘️", nombre: "Recibe alquileres", sub: "Rentas de propiedades",
    docs: [
      "Certificado positivo de propiedades (SUNARP, últimos 90 días)",
      "Pago de impuestos del mes anterior a la solicitud",
      "Declaración de impuestos del último ejercicio fiscal",
    ],
  },
];

/* Ingresos repentinos o significativos: el consulado pide justificar su origen. */
export const ESPECIALES = [
  {
    key: "venta", icono: "🚗", nombre: "Venta de un bien", sub: "Auto, propiedad",
    docs: [
      "Minuta o inscripción en SUNARP de la compraventa",
      "Facturas relacionadas",
      "Documentación bancaria (sellos y firmas) del abono",
    ],
  },
  {
    key: "donacion", icono: "🎁", nombre: "Donación de dinero", sub: "Un familiar te transfiere",
    docs: [
      "Escritura de donación (notarial)",
      "Documentación bancaria con sellos y firmas del abono",
    ],
  },
  {
    key: "afpcts", icono: "🏦", nombre: "Disposición de AFP / CTS", sub: "Retiro de aportes",
    docs: [
      "Documentación bancaria (sellos y firmas) que acredite la disposición de AFP o rescate de CTS",
    ],
  },
  {
    key: "plazos", icono: "📈", nombre: "Depósito a plazo / fondos", sub: "Inversiones",
    docs: [
      "Documentación bancaria (sellos y firmas) de depósitos a plazo o fondos de inversión",
    ],
  },
];

export const VIAS = [
  { key: "PROPIOS", icono: "🙋", nombre: "Medios propios", desc: "Con tu propio dinero e ingresos" },
  { key: "AVAL",    icono: "👪", nombre: "Con avalista",   desc: "Un familiar directo financia tus estudios" },
  { key: "MIXTO",   icono: "🤝", nombre: "Mixto",          desc: "Combinas tu dinero con un avalista" },
];

export const VIA_ETIQUETA = {
  PROPIOS: "medios propios",
  AVAL: "avalista",
  MIXTO: "mixto",
};

/* Documento base: siempre se pide, sea cual sea el perfil. */
const DOC_BASE =
  "Extractos ORIGINALES de cuenta de ahorro y/o corriente, últimos 6 meses, con firma y sello del banco";

/**
 * Arma la lista de solvencia a partir de la vía elegida y los perfiles marcados.
 * Devuelve documentos únicos y en orden estable: base → perfiles → especiales → aval.
 */
export function listaSolvencia(via, perfiles = {}, especiales = {}) {
  const lista = [DOC_BASE];
  PERFILES.forEach((p) => { if (perfiles[p.key]) lista.push(...p.docs); });
  ESPECIALES.forEach((e) => { if (especiales[e.key]) lista.push(...e.docs); });
  if (via === "AVAL" || via === "MIXTO") {
    lista.push("Carta aval ante notario, legalizada por el Colegio de Notarios y apostillada");
    lista.push("Documentos que acrediten el vínculo familiar directo, apostillados");
    lista.push("Toda la documentación económica anterior, referida al avalista / financiador");
  }
  return [...new Set(lista)];
}

/* Valores por defecto de la calculadora. El IPREM se deja editable porque se
   actualiza cada año y el consulado puede exigir el vigente. */
export const CALC_INICIAL = {
  larga: true,
  meses: 12,
  familiares: 0,
  programa: 0,
  pagado: 0,
  incluirVuelo: true,
  vuelo: 1000,
  alojPagado: 0,
  ipremMes: 600,
  anual: 7200,
};

/**
 * Monto a acreditar ante el consulado.
 *
 * Manutención: 100% del IPREM (anual en estancias largas, mensual × meses en
 * las cortas). Cada familiar que acompaña suma: +75% el primero, +50% cada uno
 * de los siguientes. A eso se añade lo que falte por pagar del programa y el
 * vuelo de regreso, y se descuenta el alojamiento ya abonado.
 */
export function calcularMedios(c) {
  const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const periodo = c.larga ? n(c.anual) : n(c.ipremMes) * n(c.meses);

  const fam = Math.max(0, Math.trunc(n(c.familiares)));
  let familiares = 0;
  if (fam >= 1) familiares += 0.75 * periodo;
  if (fam > 1) familiares += 0.5 * periodo * (fam - 1);

  const manutencion = periodo + familiares;
  const programa = Math.max(0, n(c.programa) - n(c.pagado));
  const vuelo = c.incluirVuelo ? n(c.vuelo) : 0;
  const alojamiento = n(c.alojPagado);

  return {
    periodo,
    familiares,
    manutencion,
    programa,
    vuelo,
    alojamiento,
    total: Math.max(0, manutencion + programa + vuelo - alojamiento),
  };
}

export const eur = (n) => Math.round(n).toLocaleString("es-ES");
