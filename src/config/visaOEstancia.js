// src/config/visaOEstancia.js
// ─────────────────────────────────────────────────────────────────────────────
// VISA O ESTANCIA — reglas del test rápido de /visa-o-estancia.
//
// Vive aparte de la interfaz porque es conocimiento de negocio: cambia cuando
// cambia el criterio consular o el de Extranjería, no cuando cambia el diseño.
//
// Lo que de verdad separa las dos vías:
//
//   · DÓNDE se presenta. El visado, en el consulado de tu país. La estancia,
//     estando ya en España dentro de tus 90 días de turista.
//   · EL DINERO. El consulado pide 6 meses de extractos, el saldo que sale de
//     la fórmula y el ORIGEN LÍCITO acreditado. Extranjería no pide ese
//     historial: le basta el monto en una cuenta abierta en España, con fondos
//     propios (admite aval, pero conviene que esté a nombre del estudiante).
//   · EL PLAZO. Las dos quieren dos meses de antelación al inicio de clases, y
//     las dos tienen salida si no se llega — pero no la misma salida.
//
// ⚠️ Esto es una orientación, no un dictamen. El resultado siempre remata en
// la sesión diagnóstico: nunca decimos "no calificas" a secas.
// ─────────────────────────────────────────────────────────────────────────────

import {
  PLANES_VISADO,
  ESTANCIA_ESTUDIOS,
  SESION_DIAGNOSTICO,
} from "./metodo";
import { PRECIO_DESDE } from "./paqueteMaster2027Resumen";

// ── Preguntas ───────────────────────────────────────────────────────────────
// Cinco, y ninguna de relleno. Es un test para mandar por WhatsApp: si pide
// más, se abandona a la mitad.

export const PREGUNTAS = [
  {
    id: "donde",
    titulo: "Dónde estás",
    pregunta: "¿Dónde estás ahora mismo?",
    ayuda: "Es lo que más pesa: cada vía se presenta ante una oficina distinta.",
    opciones: [
      {
        valor: "pais",
        txt: "En mi país de origen",
        desc: "Y prefiero viajar con el permiso ya resuelto",
        icono: "mapa",
      },
      {
        valor: "viajo",
        txt: "En mi país, pero puedo viajar",
        desc: "Podría entrar a España como turista y tramitar allá",
        icono: "avion",
      },
      {
        valor: "espana",
        txt: "Ya estoy en España",
        desc: "Entré como turista o estoy por entrar",
        icono: "bandera",
      },
    ],
  },
  {
    id: "admision",
    titulo: "Tu admisión",
    pregunta: "¿Ya tienes carta de admisión de un centro español?",
    ayuda: "Sin admisión no arranca ninguna de las dos vías.",
    opciones: [
      {
        valor: "si",
        txt: "Sí, la tengo",
        desc: "Carta de admisión o matrícula en la mano",
        icono: "documento",
      },
      {
        valor: "proceso",
        txt: "Estoy postulando",
        desc: "Todavía espero respuesta de las universidades",
        icono: "reloj",
      },
      {
        valor: "no",
        txt: "Todavía no",
        desc: "Aún no he postulado a ningún máster",
        icono: "brujula",
      },
    ],
  },
  {
    id: "clases",
    titulo: "Tus fechas",
    pregunta: "¿Cuándo empiezan tus clases?",
    ayuda: "Las dos vías quieren dos meses de antelación. Con la fecha calculamos si llegas.",
    tipo: "fecha",
  },
  {
    id: "dinero",
    titulo: "El dinero",
    pregunta: "¿Cómo vas a acreditar los medios económicos?",
    ayuda: "Aquí se decide casi todo: es lo que más se deniega y donde más se diferencian las dos vías.",
    opciones: [
      {
        valor: "propios6m",
        txt: "Está en mi cuenta desde hace 6 meses o más",
        desc: "Y puedo explicar de dónde salió: sueldo, honorarios, rentas…",
        icono: "escudo",
      },
      {
        valor: "reciente",
        txt: "Tengo el monto, pero entró hace poco",
        desc: "O no puedo documentar bien de dónde vino",
        icono: "reloj",
      },
      {
        valor: "familiar",
        txt: "El dinero lo pone un familiar",
        desc: "Padre, madre, hermano u otro familiar directo",
        icono: "usuarios",
      },
      {
        valor: "cuentaEspana",
        txt: "Puedo tenerlo en una cuenta en España",
        desc: "Abrir cuenta allá y depositar el monto a mi nombre",
        icono: "casa",
      },
      {
        valor: "noTengo",
        txt: "Todavía no reúno el monto",
        desc: "Estoy juntándolo o buscando beca",
        icono: "euro",
      },
    ],
  },
  {
    id: "denegada",
    titulo: "Antecedentes",
    pregunta: "¿Te han denegado alguna vez el visado de estudios?",
    ayuda: "Una denegación no te cierra la puerta, pero cambia por dónde conviene entrar.",
    opciones: [
      { valor: "no", txt: "No, nunca", desc: "Es mi primera solicitud", icono: "destello" },
      {
        valor: "reciente",
        txt: "Sí, hace menos de un mes",
        desc: "Todavía estoy en plazo de recurrir",
        icono: "balanza",
      },
      {
        valor: "antigua",
        txt: "Sí, hace más de un mes",
        desc: "El plazo de recurso ya pasó",
        icono: "reloj",
      },
    ],
  },
];

// ── Cuánto dinero hay que acreditar ─────────────────────────────────────────
// El monto es prácticamente el mismo para las dos vías: 100 % del IPREM por el
// periodo de estudios. Lo que cambia es CÓMO se demuestra, no cuánto.
// La fórmula es la misma que usa el equipo por dentro (visaSolvencia.js).

export const IPREM_ANUAL = 7200; // 100 % del IPREM, estancias de más de 6 meses
export const IPREM_MES = 600;
export const VUELO_REFERENCIA = 1000;

/**
 * Monto orientativo a acreditar.
 * @param {object} d
 * @param {boolean} d.larga        programa de más de 6 meses
 * @param {number}  d.meses        duración si es corta
 * @param {number}  d.matricula    lo que falta por pagar del programa
 * @param {boolean} d.incluirVuelo
 */
export function montoAcreditar({
  larga = true,
  meses = 12,
  matricula = 0,
  incluirVuelo = true,
} = {}) {
  const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const manutencion = larga ? IPREM_ANUAL : IPREM_MES * Math.max(1, n(meses));
  const programa = Math.max(0, n(matricula));
  const vuelo = incluirVuelo ? VUELO_REFERENCIA : 0;
  return {
    manutencion,
    programa,
    vuelo,
    total: manutencion + programa + vuelo,
  };
}

// ── Plazos ──────────────────────────────────────────────────────────────────

/** Días entre hoy y el inicio de clases. `null` si no hay fecha. */
export function diasHastaClases(fechaISO, hoy = new Date()) {
  if (!fechaISO) return null;
  const m = String(fechaISO).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const clases = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const ahora = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
  return Math.round((clases - ahora) / 86400000);
}

// Dos meses de antelación, contados como los cuenta la Administración.
export const DIAS_ANTELACION = 60;
// La estancia se tramita entrando como turista: entre que llegas, abres cuenta,
// te empadronas y resuelve Extranjería pasan unos tres meses.
export const DIAS_PROCESO_ESTANCIA = 90;

// ── Evaluación ──────────────────────────────────────────────────────────────
// Cada vía sale con un nivel y con los porqués. Nunca con un "no" a secas.

const NIVEL_ORDEN = { verde: 3, ambar: 2, rojo: 1 };
const peor = (a, b) => (NIVEL_ORDEN[a] <= NIVEL_ORDEN[b] ? a : b);

const ETIQUETA_NIVEL = {
  verde: "Sí, calificas",
  ambar: "Calificas con condiciones",
  rojo: "Hoy no es tu vía",
};

function evaluarVisa(r, dias) {
  const motivos = [];
  const pendientes = [];
  let nivel = "verde";

  // ── Dónde estás ──
  if (r.donde === "espana") {
    nivel = "rojo";
    pendientes.push(
      "El visado se solicita en el consulado de España de tu país de residencia. Estando ya en España tendrías que volver para pedirlo."
    );
  } else {
    motivos.push(
      "Estás en tu país: puedes presentarte al consulado y viajar con el permiso ya resuelto en el pasaporte."
    );
  }

  // ── Admisión ──
  if (r.admision === "si") {
    motivos.push("Tienes carta de admisión, que es el documento que abre el trámite.");
  } else {
    nivel = peor(nivel, "ambar");
    pendientes.push(
      r.admision === "proceso"
        ? "Todavía esperas la admisión. El expediente de visado no se puede presentar sin la carta."
        : "Aún no tienes admisión. Antes del visado hay que conseguir plaza en un centro oficial apto."
    );
  }

  // ── El dinero: aquí es donde el consulado es más exigente ──
  if (r.dinero === "propios6m") {
    motivos.push(
      "Tienes el monto con seis meses de historial y puedes explicar su origen: es exactamente lo que pide el consulado."
    );
  } else if (r.dinero === "familiar") {
    motivos.push(
      "Un familiar directo puede financiarte: el consulado lo acepta como carta aval."
    );
    pendientes.push(
      "La carta aval va ante notario, legalizada por el Colegio de Notarios y apostillada — y tu avalista debe presentar TODA su documentación económica: extractos de 6 meses, declaración de impuestos y prueba del origen de sus ingresos."
    );
    nivel = peor(nivel, "ambar");
  } else if (r.dinero === "reciente") {
    nivel = peor(nivel, "ambar");
    pendientes.push(
      "El consulado pide extractos de los últimos 6 meses y que el origen del dinero esté acreditado. Un saldo que apareció de golpe sin respaldo es la causa número uno de denegación: hay que construir la justificación antes de presentar."
    );
  } else if (r.dinero === "cuentaEspana") {
    nivel = peor(nivel, "ambar");
    pendientes.push(
      "Una cuenta abierta en España no sustituye lo que pide el consulado: necesita ver seis meses de extractos y el origen lícito del dinero. Esa opción encaja mejor con la estancia."
    );
  } else {
    nivel = "rojo";
    pendientes.push(
      "Sin el monto reunido no hay expediente que presentar. Es el requisito que no admite excepción."
    );
  }

  // ── Plazo ──
  if (dias !== null) {
    if (dias < 0) {
      nivel = "rojo";
      pendientes.push("Tus clases ya empezaron. Hay que replantear el calendario académico.");
    } else if (dias < DIAS_ANTELACION) {
      nivel = peor(nivel, "ambar");
      pendientes.push(
        `Quedan ${dias} días para el inicio de clases y el consulado tarda entre uno y dos meses en resolver. Se puede intentar pidiendo cita urgente y justificando la premura, pero va muy justo.`
      );
    } else {
      motivos.push(
        `Quedan ${dias} días hasta el inicio de clases: hay margen para la cita consular y la resolución.`
      );
    }
  }

  // ── Denegación previa ──
  if (r.denegada === "reciente") {
    nivel = peor(nivel, "ambar");
    pendientes.push(
      "Estás dentro del plazo para presentar un recurso de reposición, y ese plazo es corto y perentorio. Conviene decidirlo esta semana."
    );
  } else if (r.denegada === "antigua") {
    pendientes.push(
      "Hubo una denegación anterior: el consulado la verá. Hay que corregir la causa concreta antes de volver a presentar."
    );
    nivel = peor(nivel, "ambar");
  }

  return { via: "visa", nivel, etiqueta: ETIQUETA_NIVEL[nivel], motivos, pendientes };
}

function evaluarEstancia(r, dias) {
  const motivos = [];
  const pendientes = [];
  let nivel = "verde";

  // ── Dónde estás ──
  if (r.donde === "espana") {
    motivos.push(
      "Ya estás en España: es justo desde donde se presenta, dentro de tus 90 días de estancia como turista."
    );
  } else if (r.donde === "viajo") {
    motivos.push(
      "Puedes entrar a España como turista y tramitarla allá, sin pasar por el consulado."
    );
    pendientes.push(
      "Hay que planificar el viaje: la solicitud se presenta estando en España y en situación regular."
    );
  } else {
    nivel = peor(nivel, "ambar");
    pendientes.push(
      "La estancia se solicita estando en España. Es tu vía solo si estás dispuesto a viajar primero como turista."
    );
  }

  // ── Admisión ──
  if (r.admision === "si") {
    motivos.push("Tienes carta de admisión reciente, que es lo que exige Extranjería.");
  } else {
    nivel = peor(nivel, "ambar");
    pendientes.push(
      r.admision === "proceso"
        ? "Todavía esperas la admisión. Sin la carta no se puede presentar el expediente."
        : "Aún no tienes admisión. Primero hay que conseguir plaza en un centro oficial."
    );
  }

  // ── El dinero: Extranjería no pide el historial del consulado ──
  if (r.dinero === "cuentaEspana") {
    motivos.push(
      "Puedes tener el monto en una cuenta abierta en España a tu nombre: es exactamente lo que Extranjería quiere ver, y no te pedirá seis meses de extractos ni justificar el origen."
    );
  } else if (r.dinero === "propios6m") {
    motivos.push(
      "Tienes el monto con fondos propios. Solo hay que trasladarlo a una cuenta abierta en España; el historial de seis meses aquí no hace falta."
    );
  } else if (r.dinero === "reciente") {
    motivos.push(
      "Esta es la ventaja de la estancia en tu caso: Extranjería no exige el historial de seis meses ni acreditar el origen del dinero como hace el consulado. Basta con tenerlo en una cuenta en España."
    );
  } else if (r.dinero === "familiar") {
    nivel = peor(nivel, "ambar");
    pendientes.push(
      "También se admite con aval, pero funciona bastante mejor con fondos propios a tu nombre en la cuenta española. Conviene ver en la sesión si el familiar puede transferírtelo antes."
    );
  } else {
    nivel = "rojo";
    pendientes.push(
      "Sin el monto reunido no hay expediente. Es el requisito que no admite excepción."
    );
  }

  // ── Plazo ──
  if (dias !== null) {
    if (dias < 0) {
      nivel = "rojo";
      pendientes.push("Tus clases ya empezaron. Hay que replantear el calendario académico.");
    } else if (dias < DIAS_ANTELACION) {
      nivel = peor(nivel, "ambar");
      pendientes.push(
        `Quedan ${dias} días y la estancia se presenta dos meses antes del inicio de clases. Todavía se puede presentar adjuntando un escrito de excepcionalidad que explique por qué se hace con menos antelación.`
      );
    } else if (dias < DIAS_PROCESO_ESTANCIA && r.donde !== "espana") {
      nivel = peor(nivel, "ambar");
      pendientes.push(
        `Quedan ${dias} días. Entre viajar, abrir cuenta, empadronarte y que Extranjería resuelva pasan unos tres meses: es viable, pero hay que arrancar ya.`
      );
    } else {
      motivos.push(
        `Quedan ${dias} días hasta el inicio de clases: entras dentro de los dos meses de antelación que pide Extranjería.`
      );
    }
  }

  // ── Denegación previa ──
  if (r.denegada === "reciente" || r.denegada === "antigua") {
    motivos.push(
      "Una denegación consular anterior no bloquea esta vía: es el camino legal habitual para quien no logró el visado."
    );
  }

  return { via: "estancia", nivel, etiqueta: ETIQUETA_NIVEL[nivel], motivos, pendientes };
}

// ── Qué paquete recomendar ──────────────────────────────────────────────────

const integral = PLANES_VISADO.find((p) => p.id === "visado-integral");
// Desde: el plan más barato del Paquete Máster 2027/2028 (fuente única).
const masterDesde = PRECIO_DESDE;

export const PAQUETES = {
  visado: {
    id: "visado-integral",
    nombre: "Asesoría Full Visado",
    subtitulo: integral.subtitulo,
    precio: integral.precio,
    incluye: integral.incluye,
    href: "/servicios/visa-estudios",
  },
  estancia: {
    id: "estancia",
    nombre: "Paquete Estancia por Estudios",
    subtitulo: ESTANCIA_ESTUDIOS.subtitulo,
    precio: ESTANCIA_ESTUDIOS.precio,
    incluye: ESTANCIA_ESTUDIOS.incluye,
    href: "/servicios/estancia-estudios",
  },
  master: {
    id: "master",
    nombre: "Paquete Máster",
    subtitulo: "Primero la plaza; el permiso viene después",
    precio: masterDesde,
    desde: true,
    incluye: [
      "Búsqueda personalizada de centros oficiales aptos para el visado",
      "Revisión y ajuste de los documentos requeridos",
      "Postulación directa a másteres por universidad",
      "Seguimiento hasta obtener la vacante",
      "Asesoría para la matrícula y la carta de admisión",
    ],
    href: "/servicios/master#pago-por-etapas",
  },
  diagnostico: {
    id: "diagnostico",
    nombre: SESION_DIAGNOSTICO.nombre,
    subtitulo: "Tu caso necesita mirarse con calma",
    precio: SESION_DIAGNOSTICO.precio,
    incluye: SESION_DIAGNOSTICO.incluye,
    href: "/servicios/master#pago-por-etapas",
  },
};

/**
 * Cuánto encaja cada vía con este caso.
 *
 * No basta con mirar el semáforo: "ámbar" cubre desde «necesitas un escrito
 * de excepcionalidad» hasta «esto es un problema serio», y exigir un verde
 * para recomendar dejaba sin respuesta a casos obvios — alguien ya en España,
 * con el dinero en una cuenta española y las clases en dos meses — que solo
 * estaban en ámbar por el plazo. Así que a la base del semáforo se le suma
 * lo que de verdad inclina la balanza: dónde está y cómo tiene el dinero.
 */
const BASE_NIVEL = { verde: 100, ambar: 60, rojo: -1 };

function puntuar(r, visa, estancia) {
  let v = BASE_NIVEL[visa.nivel];
  let e = BASE_NIVEL[estancia.nivel];

  if (v >= 0) {
    if (r.donde === "pais") v += 25;      // quiere viajar con todo resuelto
    if (r.donde === "viajo") v += 10;
    if (r.dinero === "propios6m") v += 20; // justo lo que pide el consulado
    if (r.dinero === "familiar") v += 10;  // la carta aval es cosa consular
    if (r.dinero === "reciente") v -= 25;  // sin origen acreditado, se deniega
    if (r.dinero === "cuentaEspana") v -= 20;
  }

  if (e >= 0) {
    if (r.donde === "espana") e += 30;
    if (r.donde === "viajo") e += 10;
    if (r.donde === "pais") e -= 20;       // tendría que cambiar de plan
    if (r.dinero === "cuentaEspana") e += 30;
    if (r.dinero === "reciente") e += 30;  // Extranjería no pide el origen
    if (r.dinero === "propios6m") e += 10;
    if (r.dinero === "familiar") e -= 10;  // se admite, pero mejor fondos propios
    if (r.denegada !== "no") e += 15;      // es la salida habitual tras una negativa
  }

  return { v, e };
}

/**
 * Evalúa las dos vías y recomienda un paquete.
 * @param {object} r respuestas: {donde, admision, clases, dinero, denegada}
 */
export function evaluar(r = {}, hoy = new Date()) {
  const dias = diasHastaClases(r.clases, hoy);
  const visa = evaluarVisa(r, dias);
  const estancia = evaluarEstancia(r, dias);
  const { v, e } = puntuar(r, visa, estancia);

  const salida = (paquete, titular, porque) => ({
    visa,
    estancia,
    paquete,
    titular,
    porque,
    dias,
    puntos: { visa: v, estancia: e },
  });

  // 1. Sin admisión no hay trámite migratorio que presentar.
  if (r.admision !== "si") {
    return salida(
      PAQUETES.master,
      "Antes que el permiso, la plaza",
      "Ninguna de las dos vías se puede presentar sin carta de admisión. El primer paso es conseguirla — y de eso se encarga el Paquete Máster."
    );
  }

  // 2. Sin dinero no avanza nada, y no es algo que resuelva un paquete.
  if (r.dinero === "noTengo") {
    return salida(
      PAQUETES.diagnostico,
      "El dinero es lo primero que hay que resolver",
      "Ninguna vía avanza sin acreditar los medios económicos. En la sesión vemos cuánto necesitas exactamente y qué formas de acreditarlo admite cada una."
    );
  }

  // 3. Con una denegación reciente manda el reloj del recurso.
  if (r.denegada === "reciente") {
    return salida(
      PAQUETES.visado,
      "Primero, el recurso — y el plazo corre",
      "Con una denegación de hace menos de un mes todavía cabe recurso de reposición, y el plazo es corto y perentorio. La Asesoría Full Visado lo incluye; si no prospera, reconducimos tu caso a la estancia."
    );
  }

  // 4. Las dos bloqueadas: no hay recomendación honesta que dar por aquí.
  if (v < 0 && e < 0) {
    return salida(
      PAQUETES.diagnostico,
      "Tu caso necesita mirarse con calma",
      "Ninguna de las dos vías encaja tal como está hoy tu situación. No es un no: es que hay que ordenar antes lo que falta, y eso se hace con tu caso delante."
    );
  }

  // 5. Gana la que más encaja. Si van muy parejas, se dice — pero igual se
  //    recomienda una: dejar al visitante eligiendo es dejarlo sin respuesta.
  const ganaVisa = v >= e;
  const paquete = ganaVisa ? PAQUETES.visado : PAQUETES.estancia;
  const parejas = Math.abs(v - e) < 20 && v >= 0 && e >= 0;
  const nivelGanador = ganaVisa ? visa.nivel : estancia.nivel;

  let titular;
  if (parejas) {
    titular = ganaVisa
      ? "Las dos te sirven, y el visado te conviene más"
      : "Las dos te sirven, y la estancia te conviene más";
  } else if (nivelGanador === "verde") {
    titular = ganaVisa
      ? "Tu vía es el visado de estudios"
      : "Tu vía es la estancia por estudios";
  } else {
    titular = ganaVisa
      ? "Tu vía es el visado, con cosas que resolver antes"
      : "Tu vía es la estancia, con cosas que resolver antes";
  }

  // El porqué cita el factor que de verdad decidió, no una frase genérica.
  let porque;
  if (ganaVisa) {
    porque =
      r.dinero === "familiar"
        ? "Un familiar directo puede financiarte, y la carta aval es una figura que el consulado acepta expresamente. Además llegas a España con el permiso ya resuelto."
        : "Puedes acreditar tu solvencia como la pide el consulado, y el visado te deja llegar a España con todo resuelto en el pasaporte, sin vivir el trámite a contrarreloj.";
  } else if (r.donde === "espana") {
    porque =
      "Ya estás en España, que es justo desde donde se presenta esta vía. Es 100 % telemática y no te exige el historial bancario de seis meses que pide el consulado.";
  } else if (r.dinero === "reciente" || r.dinero === "cuentaEspana") {
    porque =
      "Tu dinero encaja mucho mejor aquí: Extranjería no te va a pedir seis meses de extractos ni justificar el origen, que es justo donde el consulado deniega. La condición es entrar a España como turista y tramitarla desde allá.";
  } else {
    porque =
      "Se presenta desde España, es 100 % telemática y evita la cita consular. La condición es entrar como turista y tramitarla dentro de tus 90 días.";
  }

  if (!ganaVisa && visa.nivel === "rojo" && r.donde !== "espana") {
    porque += " El visado hoy no es opción para ti, así que esta es la vía.";
  }

  return salida(paquete, titular, porque);
}

// ── Lo que siempre hay que dejar dicho ──────────────────────────────────────

export const DESCARGO =
  "Este test es una orientación, no un dictamen jurídico. La vía definitiva se confirma en la sesión diagnóstico, con tus documentos delante. No garantizamos la concesión del permiso: la resuelve el consulado o Extranjería.";

export const COMPARATIVA = [
  {
    criterio: "Dónde se presenta",
    icono: "mapa",
    visa: "En el consulado de España de tu país.",
    estancia: "En España, ante Extranjería, por vía telemática.",
  },
  {
    criterio: "El dinero",
    icono: "euro",
    visa: "Extractos de los últimos 6 meses, saldo según la fórmula y origen lícito acreditado: impuestos, rentas o justificación documentada.",
    estancia:
      "El monto en una cuenta abierta en España, con fondos propios. No se exige el historial de 6 meses ni justificar el origen.",
  },
  {
    criterio: "Si el dinero lo pone otro",
    icono: "usuarios",
    visa: "Se admite con carta aval notarial, legalizada y apostillada, más toda la documentación económica del avalista.",
    estancia: "También se admite aval, pero funciona mejor con fondos propios a tu nombre.",
  },
  {
    criterio: "Cuándo hay que presentar",
    icono: "calendario",
    visa: "Dos meses antes del inicio de clases. Con menos margen se puede pedir cita urgente justificando la premura.",
    estancia:
      "Dos meses antes del inicio de clases. Con menos margen se presenta igual, adjuntando un escrito de excepcionalidad.",
  },
  {
    criterio: "Cuánto tarda",
    icono: "reloj",
    visa: "Entre 1 y 2 meses de resolución consular.",
    estancia: "Unos 3 meses desde que entras como turista hasta la resolución.",
  },
  {
    criterio: "Cómo llegas a España",
    icono: "avion",
    visa: "Viajas con el visado ya en el pasaporte.",
    estancia: "Entras como turista y regularizas allá, dentro de tus 90 días.",
  },
  {
    criterio: "Permiso de trabajo",
    icono: "maletin",
    visa: "Hasta 30 horas semanales.",
    estancia: "Hasta 30 horas semanales.",
  },
];
