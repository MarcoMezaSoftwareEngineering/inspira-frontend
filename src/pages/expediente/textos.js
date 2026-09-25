// src/pages/expediente/textos.js
//
// El expediente de ejemplo (/expediente): un visado de estudios desde Lima,
// reconstruido documento a documento. Es la página que se enseña a quien
// pregunta «¿y qué papeles son?»: en vez de una lista, el expediente entero,
// con cada papel tal como tiene que quedar y con lo que hace que lo rechacen.
//
// Regla de la página: los DATOS son inventados y se tapan a la vista (nombre,
// pasaporte, cuentas, firmas), pero el FORMATO, las frases obligatorias y los
// requisitos son los reales. Lo que aquí se afirma como requisito ya está
// dicho en las páginas de servicios o en los modelos de public/modelos; si se
// cambia allí, cambia aquí. Ninguna cifra que no salga del config.
import { IPREM_REFERENCIA } from "../../config/costeVida";
import { PROCESOS } from "../../config/serviciosProceso";

const eur = (n) => `${Number(n).toLocaleString("es-ES")} €`;
export const IPREM_MES = eur(IPREM_REFERENCIA.mensual);
export const IPREM_ANIO = eur(IPREM_REFERENCIA.anual);

/** Los pasos del servicio, tal como están en la ficha del servicio. */
export const PASOS = PROCESOS["visa-estudios"];

export const EXPEDIENTE = {
  seo: {
    title: "Expediente de visado de estudios, documento por documento",
    description:
      "Un expediente de visado de estudios reconstruido papel por papel: carta de admisión, extracto bancario, antecedentes apostillados, certificado médico, seguro, formulario y el visado concedido. Cómo tiene que quedar cada uno y por qué se rechazan.",
    path: "/expediente",
    imagen: "/og/mapa-estudiar-en-espana.jpg",
    // Marco la retiró de los menús (25/09/2026): se mantiene para quien tenga
    // el enlace, sin indexar.
    noIndex: true,
  },

  rotulo: "Expediente de ejemplo · Visado de estudios",
  titulo: "Así se ve un expediente que se aprueba",
  lead:
    "Un expediente de una alumna de Inspira, reconstruido papel por papel con los datos tapados. Toca cada documento: verás cómo tiene que quedar el tuyo y qué es lo que hace que lo rechacen.",
  aviso:
    "Nombres, números y fechas son de ejemplo. El formato, las frases obligatorias y los requisitos son los reales.",

  caso: [
    { et: "Quién", valor: "Valeria, 24 años, Lima" },
    { et: "A qué", valor: "Máster oficial, 60 ECTS, curso 2026-27" },
    { et: "Dónde se presenta", valor: "Consulado General de España en Lima" },
    { et: "Resultado", valor: "Visado tipo D concedido" },
  ],

  cuenta: {
    titulo: "¿Cuántos tienes tú?",
    texto: "Marca los que ya tienes en la mano y te decimos qué te falta.",
    de: (n, total) => `${n} de ${total}`,
    ninguno: "Empieza por la carta de admisión: todo lo demás depende de ella.",
    faltan: (n) => (n === 1 ? "Te falta 1 documento." : `Te faltan ${n} documentos.`),
    completo: "Lo tienes todo. Ahora toca ordenarlo y revisarlo antes de la cita.",
    reiniciar: "Desmarcar todo",
  },

  doc: {
    ver: "Ver documento",
    tengo: "Ya lo tengo",
    loTengo: "Lo tengo",
    emite: "Lo emite",
    rechazo: "Lo que más se rechaza",
    comprueba: "Comprueba antes de entregarlo",
    rechazan: "Lo que hace que te lo rechacen",
    preguntar: "Preguntar",
    anterior: "Anterior",
    siguiente: "Siguiente",
    cerrar: "Cerrar",
    marca: "Ejemplo",
    tapado: "dato tapado",
  },

  cierre: {
    titulo: "Tu expediente no tiene por qué ser una apuesta",
    texto: "Nueve papeles, cada uno con su trampa. Nosotros los revisamos uno a uno antes de que pises el consulado.",
    whatsapp: "Escríbenos por WhatsApp",
    whatsappDetalle: (tengo, faltan) =>
      faltan.length
        ? `Vi el expediente de ejemplo. Tengo ${tengo} y me faltan: ${faltan.join(", ")}. ¿Cómo lo armamos?`
        : "Vi el expediente de ejemplo y quiero que revisen el mío.",
    preguntarDetalle: (nombre) => `Vi el expediente de ejemplo y tengo una duda con: ${nombre}.`,
    sesion: "Reservar sesión",
    servicio: "Ver el paquete Máster 2027/2028",
    juego: "¿Todavía sin ciudad? Juega a las cartas",
  },

  descargo:
    "Página informativa. Cada consulado puede pedir documentos adicionales o aceptar variantes; lo de arriba es lo que exige el Consulado General de España en Lima para un visado de estudios de larga duración, según la experiencia de los expedientes que Inspira ha presentado. No sustituye a la revisión de tu caso.",
};

/**
 * Los nueve documentos, en el orden en que se producen. `paso` es el índice
 * en PASOS; `tipo` decide cómo se pinta la reconstrucción.
 */
export const DOCUMENTOS = [
  {
    id: "admision",
    paso: 0,
    tipo: "carta",
    icono: "birrete",
    nombre: "Carta de admisión",
    corto: "Admisión",
    emite: "La universidad, tras la matrícula o la reserva de plaza.",
    rechazo:
      "Una carta condicional («admisión pendiente de matrícula») o sin fechas de inicio y fin. El consulado quiere ver un programa a tiempo completo con calendario cerrado.",
    comprueba: [
      "Papel o PDF oficial de la universidad, con firma y sello.",
      "Tu nombre exactamente como en el pasaporte.",
      "Nombre del máster, créditos ECTS y modalidad presencial.",
      "Fecha de inicio y de fin del curso.",
      "Que diga que estás admitida o matriculada, no preinscrita.",
    ],
    rechazan: [
      "Un correo de la universidad o una captura del portal.",
      "Una carta de preinscripción o de lista de espera.",
      "Un máster en línea o semipresencial.",
      "Un apellido con una letra cambiada.",
    ],
  },
  {
    id: "banco",
    paso: 1,
    tipo: "banco",
    icono: "euro",
    nombre: "Extracto bancario sellado",
    corto: "Solvencia",
    emite: "Tu banco, en ventanilla, con sello y firma.",
    rechazo:
      "Una captura de la app del banco, o un saldo que llega justo. Extranjería y los consulados piden acreditar como mínimo el 100 % del IPREM por mes: " +
      `${IPREM_MES} × 12 = ${IPREM_ANIO} para un curso completo.`,
    comprueba: [
      "Extracto impreso en la oficina, con sello y firma sobre el papel.",
      "Tu nombre como titular; si los fondos son de un familiar, su extracto más una carta de compromiso notarial y la prueba del vínculo.",
      `Saldo con margen sobre ${IPREM_ANIO}: si el banco cobra una comisión y te quedas por debajo, deja de valer.`,
      "Movimientos de los últimos tres meses, no solo el saldo de hoy.",
      "Fecha reciente: cuanto más cerca de la cita, mejor.",
    ],
    rechazan: [
      "Una captura de pantalla o un PDF de la banca en línea sin sello.",
      "Un ingreso grande de golpe la semana anterior, sin explicación.",
      "Una cuenta a nombre de otra persona sin carta de compromiso.",
      "Un extracto de hace meses.",
    ],
  },
  {
    id: "penales",
    paso: 2,
    tipo: "penales",
    icono: "balanza",
    nombre: "Antecedentes penales apostillados",
    corto: "Penales",
    emite: "El Poder Judicial del Perú; la apostilla, el Ministerio de Relaciones Exteriores.",
    rechazo:
      "Sin apostilla, o pedido demasiado pronto: tiene tres meses de vigencia y se cuenta hasta el día de la cita. Se pide pensando en la cita, no antes.",
    comprueba: [
      "Certificado oficial de antecedentes penales, no el de antecedentes policiales.",
      "Apostilla de La Haya adjunta, con sus diez campos rellenos.",
      "Menos de tres meses entre la emisión y la cita.",
      "Uno por cada país donde hayas vivido en los últimos cinco años.",
    ],
    rechazan: [
      "Antecedentes policiales o judiciales en vez de penales.",
      "Legalización consular en lugar de apostilla.",
      "Un certificado caducado el día de la cita.",
    ],
  },
  {
    id: "medico",
    paso: 2,
    tipo: "medico",
    icono: "salud",
    nombre: "Certificado médico",
    corto: "Médico",
    emite: "Un médico colegiado; se visa en el Colegio Médico y se apostilla.",
    rechazo:
      "Un certificado que dice «apto» o «goza de buena salud». No sirve. Tiene que aparecer la frase completa sobre el Reglamento Sanitario Internacional de 2005, palabra por palabra.",
    comprueba: [
      "Tu nombre completo, fecha de nacimiento, pasaporte y nacionalidad, iguales a los del pasaporte.",
      "La frase exacta sobre el Reglamento Sanitario Internacional de 2005.",
      "Número de colegiatura y sello del médico.",
      "Visado por el Colegio Médico y apostillado.",
      "Menos de tres meses de antigüedad el día de la cita.",
    ],
    rechazan: [
      "Un certificado en papel de la clínica o en receta, sin la frase.",
      "Que ponga solo «apto», «sano» o «sin patologías».",
      "Sin sello ni número de colegiatura.",
    ],
  },
  {
    id: "seguro",
    paso: 2,
    tipo: "seguro",
    icono: "escudo",
    nombre: "Seguro médico",
    corto: "Seguro",
    emite: "Una aseguradora autorizada en España; lo tramitamos nosotros.",
    rechazo:
      "Un seguro de viaje o uno con copagos. El consulado exige una cobertura muy concreta: sin copagos, sin carencias, con repatriación y equivalente a la sanidad pública española, durante toda la estancia.",
    comprueba: [
      "Certificado de la aseguradora a tu nombre, no solo el recibo.",
      "Sin copagos, sin carencias y con repatriación, dicho en el certificado.",
      "Cobertura en toda España durante los meses del curso.",
      "Aseguradora autorizada para operar en España.",
    ],
    rechazan: [
      "Un seguro de viaje o una tarjeta de asistencia.",
      "Una póliza con copagos «pequeños».",
      "Cobertura que termina antes que el curso.",
    ],
  },
  {
    id: "formulario",
    paso: 3,
    tipo: "formulario",
    icono: "documento",
    nombre: "Solicitud de visado nacional",
    corto: "Formulario",
    emite: "Lo rellenamos nosotros; tú lo firmas.",
    rechazo:
      "Una casilla en blanco, una fecha que no cuadra con la carta de admisión, o la firma que falta. Es el papel más tonto del expediente y el que más citas tira.",
    comprueba: [
      "Nombre y apellidos idénticos al pasaporte, en el mismo orden.",
      "Motivo: estudios; duración prevista igual al curso.",
      "Dirección en España, aunque sea provisional.",
      "Firmado a mano, con la fecha del día de la cita.",
      "Fotografía reciente, fondo claro, pegada donde toca.",
    ],
    rechazan: [
      "Campos vacíos o rellenados con «N/A».",
      "Fechas que no coinciden con la carta de admisión.",
      "Sin firma, o firmado por otra persona.",
    ],
  },
  {
    id: "pasaporte",
    paso: 3,
    tipo: "pasaporte",
    icono: "pasaporte",
    nombre: "Pasaporte y copias",
    corto: "Pasaporte",
    emite: "Migraciones. Se lleva el original y copia de todas las páginas con sellos.",
    rechazo:
      "Un pasaporte al que le queda menos de un año. El visado se pega en él y tiene que sobrevivir al curso; si caduca antes, se renueva primero.",
    comprueba: [
      "Vigencia mínima de un año desde la cita.",
      "Al menos dos páginas en blanco enfrentadas.",
      "Copia de la página de datos y de cada página con sello o visado.",
      "Que no esté dañado ni con la lámina despegada.",
    ],
    rechazan: [
      "Menos de un año de vigencia.",
      "Sin páginas en blanco.",
      "Copias cortadas o a las que les falta una página sellada.",
    ],
  },
  {
    id: "indice",
    paso: 4,
    tipo: "indice",
    icono: "maletin",
    nombre: "Hoja de ruta de la cita",
    corto: "Cita",
    emite: "Inspira: el índice del expediente en el orden en que lo piden en ventanilla.",
    rechazo:
      "Llegar con los papeles sueltos, sin copias o en otro orden. En ventanilla no hay tiempo de buscar; lo que no aparece, no existe.",
    comprueba: [
      "Cada documento en su posición, original y copia.",
      "Comprobante de la cita y de la tasa pagada.",
      "Originales en una funda, copias en otra.",
      "Nada grapado: en el consulado lo separan.",
    ],
    rechazan: [
      "Un documento sin su copia.",
      "Originales y copias mezclados.",
      "Una tasa pagada a nombre de otra persona.",
    ],
  },
  {
    id: "visado",
    paso: 5,
    tipo: "visado",
    icono: "check",
    nombre: "Visado concedido",
    corto: "Visado",
    emite: "El consulado, pegado en el pasaporte, unas semanas después de la cita.",
    rechazo:
      "Aquí ya no se rechaza nada, pero se pierde: el visado da 90 días para entrar, y dentro del primer mes en España hay que pedir la TIE. Ese plazo también lo llevamos nosotros.",
    comprueba: [
      "Tipo D, motivo estudios, y tu nombre igual que en el pasaporte.",
      "Fechas de validez: tienes que entrar dentro de ellas.",
      "Cita de huellas para la TIE en el primer mes.",
      "Empadronamiento nada más tener dirección.",
    ],
    rechazan: [],
  },
];

export const TOTAL = DOCUMENTOS.length;
