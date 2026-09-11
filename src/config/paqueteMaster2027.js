// src/config/paqueteMaster2027.js
// ─────────────────────────────────────────────────────────────────────────────
// PAQUETE MÁSTER 2027/2028 — contenido y precios de la landing de Ads
// /master-2027-2028 (pages/landing/master2027/).
//
// Fuente: contenido revisado del 10/09/2026, sobre las listas y los precios
// que decidió el cliente ese día y los hechos verificados en el repo.
//
// Reglas de este archivo:
// - Ningún importe se escribe a mano en el JSX: todo sale de aquí.
// - Cada precio de plan se escribe UNA vez (PRECIOS) y los textos que lo citan
//   se construyen con él. La sesión, la vía migratoria y las citas salen de
//   metodo.js, que no se toca.
// - Fechas del curso 2027-28: siempre estimadas («~» o «estimada»).
// - Respuestas del cliente del 10/09/2026 (tarde): el evento de Calendly se
//   llama «Sesión diagnóstico», se paga por transferencia, Plin o Mercado Pago
//   y las reuniones 1 a 1 van en todo paquete. No se publica tipo de cambio,
//   moneda de cobro ni política de devolución.
// - Cliente, 11/09/2026 (tarde): la sesión diagnóstico es un pago aparte y no
//   se descuenta del paquete. Una sola ventana emergente (la de la sesión).
// - No reutilizar aquí listas ni cifras de metodo.js o masterPlans.data.js:
//   siguen siendo las de 2026/2027.
// ─────────────────────────────────────────────────────────────────────────────
import { SESION_DIAGNOSTICO, PLANES_VISADO, ESTANCIA_ESTUDIOS, CITAS_ESPANA } from "./metodo";
import { TITULAR } from "./legal";
import { lineaDe, whatsappLinea } from "./contacto";

// ── Formato y precios ───────────────────────────────────────────────────────
// Viven en paqueteMaster2027Resumen.js, que usan también la portada, el menú y
// App.jsx sin cargar todo este archivo. Aquí se reexportan: una sola fuente.
import { NBSP, numero, eur, rangoEur, PRECIOS, PRECIO_DESDE } from "./paqueteMaster2027Resumen";

export { numero, eur, rangoEur, PRECIOS, PRECIO_DESDE };

const P = PRECIOS;

// Cifras externas que citan los textos (hechos verificados).
const MATRICULA_DESDE = 730;
const TASA_PREVIA = [27, 219];

const CITA = Object.fromEntries(CITAS_ESPANA.map((c) => [c.id, c.precio]));
const TOTAL_CITAS = CITAS_ESPANA.reduce((s, c) => s + c.precio, 0);

// ── Sesión diagnóstico (de metodo.js) ───────────────────────────────────────
export const SESION = {
  precio: SESION_DIAGNOSTICO.precio,
  precioAlt: SESION_DIAGNOSTICO.precioAlt,
  duracion: SESION_DIAGNOSTICO.duracion,
  // «30 minutos» → «30 min», para la barra fija.
  duracionCorta: SESION_DIAGNOSTICO.duracion.replace(/\s*minutos?$/, " min"),
  gancho: SESION_DIAGNOSTICO.gancho,
  incluye: SESION_DIAGNOSTICO.incluye,
};

// Una sola etiqueta de CTA en toda la landing (y en el PDF).
export const CTA = {
  principal: `Reservar mi sesión diagnóstico · ${eur(SESION.precio)}`,
  barra: `Reservar · ${eur(SESION.precio)}`,
  modal: `Reservar mi sesión · ${eur(SESION.precio)}`,
};

// Mismo texto que el PDF (láminas 7-9).
export const FORMAS_PAGO = "Pagas por transferencia a nuestra cuenta empresarial, por Plin o con Mercado Pago.";

export const WHATSAPP = {
  texto: "¿Dudas antes de reservar? Escríbenos por WhatsApp",
  url: whatsappLinea(
    lineaDe("citas"),
    "Hola Inspira, vi el Paquete Máster 2027/2028 y quiero reservar la sesión diagnóstico."
  ),
};

export const CABECERA = {
  salir: "Ver sitio completo →",
  tituloPagina: "Paquete Máster 2027/2028",
};

// ── A1 · Hero ───────────────────────────────────────────────────────────────
export const HERO = {
  pildora: `Paquete Máster 2027/2028 · desde ${eur(PRECIO_DESDE)}`,
  tituloInicio: "Estudia tu máster en España en 2027/2028: ",
  tituloResaltado: "las primeras ventanas para postular abren en noviembre.",
  subtitulo: `Seleccionamos tus opciones entre más de 3.000 másteres oficiales, preparamos tu candidatura y postulamos por ti. Planes desde ${eur(PRECIO_DESDE)}, con pago por etapas.`,
  secundario: "Ver listas y precios",
  chipFecha: "Primera ventana: Comunidad Valenciana ~17 nov 2026 · fecha estimada",
  microcopy: `${SESION.duracion} online con un abogado especialista · ${eur(SESION.precio)} (${SESION.precioAlt}). Te decimos si tu caso es viable antes de cobrarte un paquete y sales con un plan escrito.`,
  tarjeta: "+45 universidades públicas · 15 comunidades",
  imagenAlt: "Estudiante con el pasaporte en la mano frente al ventanal de un aeropuerto",
};

// ── A2 · Barra de prueba ────────────────────────────────────────────────────
export const PRUEBA = {
  cifras: [
    { id: "admision", valor: 98, sufijo: `${NBSP}%`, etiqueta: "admitidos a másteres oficiales*" },
    { id: "universidades", valor: 45, prefijo: "+", etiqueta: "universidades públicas españolas" },
    { id: "catalogo", valor: 3000, prefijo: "+", etiqueta: "másteres oficiales en nuestro catálogo" },
  ],
  becasTitulo: "Becas logradas",
  becasNombres: "Generación Bicentenario · U. de Jaén · Fundación Carolina · AUIP",
  pie: "*Registros internos de expedientes, actualizados a agosto de 2026. La admisión la decide cada universidad; Inspira no garantiza la admisión, el visado ni la beca.",
};

// ── A3 · Beneficios ─────────────────────────────────────────────────────────
export const BENEFICIOS = {
  eyebrow: "Lo que hay detrás de cada plan",
  titulo: "Postulamos con datos, no con listas de internet",
  intro: "Nuestro equipo trabaja con herramientas propias. Tú no tienes que buscar nada: recibes el resultado en tu informe y en tu panel.",
  tarjetas: [
    {
      id: "catalogo",
      icono: "libro",
      imagen: "documentos",
      titulo: "Catálogo de más de 3.000 másteres oficiales",
      texto: "Construido desde el registro oficial del Ministerio y las webs de 45 universidades públicas. Es nuestra herramienta interna: tú recibes el resultado.",
    },
    {
      id: "informe",
      icono: "documento",
      imagen: "portapapeles",
      titulo: "Informe personalizado de másteres",
      texto: "Tus finalistas y tus alternativas, con el precio de matrícula según la norma de cada comunidad, la beca posible y los plazos. Sobre ese informe eliges, y tu asesor confirma.",
    },
    {
      id: "becas",
      icono: "estrella",
      titulo: "Becas mapeadas según tu perfil",
      texto: "Cruzamos las convocatorias de Fundación Carolina, AUIP, TalentUnileón y la Universidad de Jaén con cada máster de tu informe. Lo que no está confirmado, tu asesor lo verifica contigo antes de postular.",
    },
    {
      id: "seguimiento",
      icono: "usuarios",
      titulo: "Seguimiento de becas por tu asesor, incluido",
      texto: "En cualquier paquete. Tu asesor revisa qué convocatorias encajan contigo y te dice cuándo y cómo postular.",
    },
  ],
  chips: [
    { texto: "Mapa interactivo de las tres listas", icono: "mapa", destino: "planes" },
    { texto: "Calculadora de costos gratuita", icono: "euro", destino: "calculadora" },
    { texto: "Panel que se instala como app en tu teléfono", icono: "laptop", destino: "rastreo" },
  ],
};

// ── Listas y planes 2027/2028 ───────────────────────────────────────────────
// `nombre` solo se enseña dentro del bloque de su lista; en cualquier otro
// sitio (panel del mapa, simulador, más elegidos) va `nombreCompleto`, para
// que tres «Plan A» a 219 € no se confundan.
const plan = (id, datos) => ({ id, precio: P[id], ...datos });

const LISTAS_BASE = [
  {
    id: "economicas",
    numero: 1,
    nombre: "Económicas",
    nombreLargo: "Comunidades económicas",
    comunidades: ["andalucia", "cantabria", "asturias", "castilla-la-mancha", "galicia", "castilla-y-leon", "navarra"],
    comunidadesTexto: "Andalucía, Cantabria, Asturias, Castilla-La Mancha, Galicia, Castilla y León y Navarra",
    frase: "Las matrículas públicas más asequibles de España.",
    queCompraDesde: "Andalucía, hasta 6 másteres",
    planes: [
      plan("l1-a", {
        nombre: "Plan A · Andalucía",
        nombreCompleto: "Plan A · Andalucía (Lista 1)",
        alcance: "Solo Andalucía",
        detalle: "Hasta 6 másteres en las 10 universidades públicas andaluzas, con una sola solicitud por el Distrito Único Andaluz.",
        desplegable: {
          titulo: "Ver las 10 universidades",
          texto: "Almería, Cádiz, Córdoba, Granada, Huelva, Internacional de Andalucía, Jaén, Málaga, Pablo de Olavide y Sevilla",
        },
      }),
      plan("l1-basico", {
        nombre: "Plan Básico",
        nombreCompleto: "Plan Básico · una comunidad económica (Lista 1)",
        alcance: "Una comunidad a elegir",
        detalle: "Sin límite de másteres ni universidades en una de estas comunidades: Cantabria, Asturias, Castilla-La Mancha o Navarra.",
      }),
      plan("l1-comfort", {
        nombre: "Plan Comfort",
        nombreCompleto: "Plan Comfort · Galicia y/o Castilla y León (Lista 1)",
        alcance: "Galicia y/o Castilla y León",
        detalle: "Sin límite de másteres ni universidades en esas dos comunidades: 7 universidades públicas.",
      }),
      plan("l1-full", {
        nombre: "Plan Full Económico",
        nombreCompleto: "Plan Full Económico · las siete comunidades (Lista 1)",
        alcance: "Las siete comunidades",
        detalle: "Sin límite de másteres ni universidades en las siete comunidades económicas: 21 universidades públicas.",
        destacado: true,
        masElegido: true,
      }),
    ],
  },
  {
    id: "intermedias",
    numero: 2,
    nombre: "Intermedias",
    nombreLargo: "Comunidades intermedias",
    comunidades: ["la-rioja", "pais-vasco", "murcia", "extremadura", "aragon"],
    comunidadesTexto: "La Rioja, País Vasco, Murcia, Extremadura y Aragón",
    frase: "Universidades con buena demanda internacional y matrículas intermedias.",
    queCompraDesde: "una comunidad entera",
    planes: [
      plan("l2-a", {
        nombre: "Plan A",
        nombreCompleto: "Plan A · una comunidad intermedia (Lista 2)",
        alcance: "Una comunidad",
        detalle: "Sin límite de másteres ni universidades en una de las cinco comunidades.",
      }),
      plan("l2-basico-full", {
        nombre: "Plan Básico Full",
        nombreCompleto: "Plan Básico Full · tres comunidades intermedias (Lista 2)",
        alcance: "Tres comunidades",
        detalle: "Sin límite de másteres ni universidades en tres comunidades a elegir de la lista.",
      }),
      plan("l2-full", {
        nombre: "Plan Full",
        nombreCompleto: "Plan Full · las cinco intermedias (Lista 2)",
        alcance: "Las cinco comunidades",
        detalle: "Sin límite de másteres ni universidades en las cinco comunidades intermedias: todas sus universidades públicas.",
        destacado: true,
        masElegido: true,
      }),
    ],
  },
  {
    id: "premium",
    numero: 3,
    nombre: "Premium",
    nombreLargo: "Comunidades premium",
    comunidades: ["comunidad-valenciana", "cataluna", "madrid"],
    comunidadesTexto: "Comunidad Valenciana, Cataluña y Madrid; públicas y privadas",
    frase: "Comunidades grandes, con proceso de admisión propio en cada universidad. Aquí postulamos también a privadas.",
    queCompraDesde: "una universidad",
    planes: [
      plan("l3-a", {
        nombre: "Plan A",
        nombreCompleto: "Plan A · una universidad premium (Lista 3)",
        alcance: "Una universidad",
        detalle: "Sin límite de másteres dentro de una universidad, pública o privada, de la Comunidad Valenciana, Cataluña o Madrid.",
      }),
      plan("l3-comfort", {
        nombre: "Plan Comfort",
        nombreCompleto: "Plan Comfort · una comunidad premium (Lista 3)",
        alcance: "Una comunidad completa",
        detalle: "Sin límite de másteres ni universidades en una comunidad entera: Madrid, Cataluña o Comunidad Valenciana.",
        masElegido: true,
      }),
      plan("l3-full", {
        nombre: "Plan Full",
        nombreCompleto: "Plan Full · dos comunidades premium (Lista 3)",
        alcance: "Dos comunidades",
        detalle: "Sin límite de másteres ni universidades en dos de las tres comunidades.",
      }),
      plan("l3-total", {
        nombre: "Plan Total",
        nombreCompleto: "Plan Total · las tres comunidades premium (Lista 3)",
        alcance: "Las tres comunidades",
        detalle: "Sin límite de másteres ni universidades en Madrid, Cataluña y Comunidad Valenciana: todas las públicas, más las privadas que elijas.",
        destacado: true,
      }),
    ],
  },
];

// Cabecera con el rango de la lista y qué compran los 219 €.
export const LISTAS = LISTAS_BASE.map((l) => {
  const precios = l.planes.map((p) => p.precio);
  const min = Math.min(...precios);
  const max = Math.max(...precios);
  return {
    ...l,
    etiqueta: `Lista ${l.numero} · ${l.nombre}`,
    rango: rangoEur(min, max),
    cabecera: `Lista ${l.numero} · ${l.nombre} · ${rangoEur(min, max)}`,
    lineaDesde: `${eur(min)} = ${l.queCompraDesde}`,
  };
});

export const listaPorId = (id) => LISTAS.find((l) => l.id === id) || null;

// ── A6 · Paquetes avanzados ─────────────────────────────────────────────────
export const AVANZADOS = {
  eyebrow: "Más cobertura",
  titulo: "Paquetes avanzados: más comunidades, más respaldo",
  intro: "Tres paquetes estándar para postular a varias listas a la vez, con el mismo trabajo que el resto de planes.",
  idealTitulo: "Ideal si:",
  masElegido: "Más elegido",
  planes: [
    plan("econ-intermedias-650", {
      nombre: "Económicas + Intermedias",
      nombreCompleto: "Paquete Económicas + Intermedias · 12 comunidades",
      alcance: "Las 12 comunidades de las Listas 1 y 2",
      puntos: [
        "Las siete económicas y las cinco intermedias: 12 comunidades",
        "27 universidades públicas, sin límite de másteres",
        "No incluye la Comunidad Valenciana (Lista 3)",
      ],
      frase: "Las matrículas públicas más asequibles, con el doble de universidades de respaldo.",
      ideal: [
        "Buscas universidad pública y cuidas el presupuesto de matrícula",
        "Quieres más opciones que las siete comunidades económicas",
        "No necesitas Madrid, Cataluña ni la Comunidad Valenciana",
      ],
    }),
    plan("premium-700", {
      nombre: "Paquete Premium",
      nombreCompleto: "Paquete Premium · hasta 6 comunidades",
      alcance: "Hasta 6 comunidades autónomas a elegir",
      puntos: [
        "Hasta 6 comunidades autónomas a elegir",
        "Sin límite de listas: mezclas económicas, intermedias y premium",
        "Públicas y privadas",
      ],
      frase: "Es el punto medio entre libertad y eficiencia.",
      ideal: [
        "Quieres postular a másteres muy específicos, no a una lista fija",
        "Necesitas plaza para cumplir plazos de visado o de beca y quieres más respaldo",
        "Buscas combinar comunidades económicas con universidades de prestigio",
      ],
      masElegido: true,
      destacado: true,
    }),
    plan("infinity-1100", {
      nombre: "Paquete Infinity",
      nombreCompleto: "Paquete Infinity · toda España",
      alcance: "Toda España: las 17 comunidades",
      puntos: [
        "Toda España: las 17 comunidades",
        "Sin límite de universidades ni de másteres",
        "Públicas y privadas, incluidas las de mejor ranking",
      ],
      frase: "Para quienes no quieren límites de cobertura.",
      ideal: [
        "Sí o sí necesitas migrar pronto: visado, familia o urgencia laboral",
        "No quieres quedarte sin plaza y buscas varios planes de respaldo",
        "Postulas a convocatorias exigentes, como Fundación Carolina o la AUIP",
        "Necesitas una estrategia acelerada para tener carta cuanto antes",
      ],
    }),
  ],
};

// ── A6b · Presupuesto personalizado (cliente, 11/09/2026; sin precio) ──────
export const PERSONALIZADO = {
  eyebrow: "Presupuesto personalizado",
  titulo: "Nuestros paquetes son los estándar y los más elegidos, pero te hacemos un presupuesto personalizado",
  intro: "Si ningún paquete encaja con tu caso, lo armamos contigo en la sesión diagnóstico: revisamos tu viabilidad y sales con un presupuesto y un plan escrito.",
  ejemplosTitulo: "Por ejemplo:",
  ejemplos: [
    { icono: "mapa", titulo: "Una sola comunidad o ciudad", texto: "Por ejemplo, solo Galicia, o solo las universidades de una ciudad concreta." },
    { icono: "brujula", titulo: "Otras combinaciones", texto: "Comunidades de listas distintas que no coinciden con ningún paquete estándar." },
    { icono: "usuarios", titulo: "Necesidades especiales", texto: "Plazos de beca o de visado muy ajustados, másteres muy específicos u otras situaciones de tu caso." },
  ],
  contexto: "Tu presupuesto personalizado empieza en la sesión.",
};

// ── A6c · Paquetes parciales, servicios individuales y asesorías puntuales ─
// Fuente única: public/portal-servicios-master.html (PARCIALES, COMBOS, SOLOS
// y las dos asesorías puntuales). No se usan los COMPLETOS del portal.
const servicio = (id, precio, datos) => ({ id, precio, ...datos });
const PRECIO_EXPLORADOR = 79;

export const OTROS_SERVICIOS = {
  eyebrow: "Solo una parte del proceso",
  titulo: "Paquetes parciales, servicios individuales y asesorías puntuales",
  intro: "Para quien ya tiene parte del proceso hecho o quiere un servicio concreto.",
  ariaPestanas: "Tipos de servicio",
  desde: "desde",
  condicionesTitulo: "Condiciones",
  // Tarjeta compacta en la página; las pestañas van en una ventana que abre el usuario.
  tarjeta: {
    pregunta: "¿Solo necesitas una parte del proceso?",
    boton: "Ver opciones",
  },
  cerrar: "Cerrar",
  condiciones: [
    "Los servicios individuales no se descuentan si luego contratas un paquete completo, salvo el Pack Explorador (ver su tarjeta).",
    "Combos y servicios sueltos: aplican a 1 universidad (2 según complejidad). Si necesitas más, se presupuesta aparte.",
    "El Soporte Post-Admisión te orienta; no incluye la gestión del visado.",
  ],
  pestanas: [
    {
      id: "parciales",
      etiqueta: "Parciales",
      aviso: "Solo Andalucía. No incluyen búsqueda de másteres y cubren una sola fase de convocatoria.",
      servicios: [
        servicio("check-in", 109, {
          nombre: "Pack Check-In Master",
          lema: "Revisión final + postulación correcta",
          para: "Ya tienes el máster definido y los documentos listos.",
          incluye: [
            "Revisión express del expediente y la documentación",
            "Documentos faltantes o a corregir",
            "Postulación oficial en el portal unificado de Andalucía",
            "Confirmación de envío y subsanaciones durante la fase",
          ],
        }),
        servicio("smart", 149, {
          nombre: "Pack Smart Master",
          lema: "Estrategia + documentos + postulación",
          para: "Ya tienes idea del máster y quieres validar tu elección.",
          incluye: [
            "Validación académica de los másteres que elegiste",
            "CV europeo, carta de motivación y cartas de recomendación",
            "Equivalencia y orientación de notas",
            "Postulación en el portal de Andalucía, subsanaciones y análisis de resultados",
          ],
        }),
      ],
    },
    {
      id: "combos",
      etiqueta: "Combos",
      aviso: "Agrupan varios servicios a mejor precio. Aplican a 1 universidad (2 según complejidad).",
      servicios: [
        servicio("explorador", PRECIO_EXPLORADOR, {
          nombre: "Pack Explorador",
          lema: "Solo búsqueda · informe personalizado",
          para: "No sabes qué másteres se ajustan a ti y quieres opciones reales antes de decidir.",
          incluye: [
            "Búsqueda en toda España o en las comunidades que elijas",
            "Públicas y/o privadas, títulos oficiales y/o propios",
            "Informe con requisitos, costos, plazos y fases",
          ],
          nota: `Si escalas a un paquete completo, los ${eur(PRECIO_EXPLORADOR)} se aplican a cuenta.`,
        }),
        servicio("listo", 149, {
          nombre: "Pack Listo",
          lema: "Revisión + postulación",
          para: "Ya elegiste el máster.",
          incluye: [
            "Revisión y optimización de CV y carta de motivación",
            "Checklist de documentos por universidad",
            "Postulación oficial, con confirmación de envío",
          ],
        }),
        servicio("seguro", 189, {
          nombre: "Pack Seguro",
          lema: "Revisión + postulación + subsanaciones",
          para: "Quieres que gestionemos todo hasta los resultados de admisión.",
          incluye: [
            "Revisión y optimización de la documentación completa",
            "Postulación oficial en el portal universitario",
            "Subsanaciones, apelaciones y acompañamiento hasta la resolución",
          ],
        }),
        servicio("completo", 229, {
          nombre: "Pack Completo",
          lema: "Documentación + postulación + matrícula",
          para: "Ya tienes 1 o 2 másteres escogidos y quieres llegar a la carta de admisión.",
          incluye: [
            "CV europeo, cartas de motivación y equivalencia",
            "Postulación en todas las fases, subsanaciones y alegaciones",
            "Matrícula y carta de admisión oficial",
          ],
          nota: "No incluye búsqueda.",
        }),
        servicio("todo-en-uno", 289, {
          nombre: "Pack Todo en Uno",
          lema: "Búsqueda + documentación + postulación + matrícula",
          para: "Quieres empezar desde cero, para un máster.",
          incluye: [
            "Búsqueda personalizada por tipo de universidad, título y presupuesto",
            "Documentación completa y postulación en todas las fases",
            "Subsanaciones, alegaciones, matrícula y carta de admisión",
          ],
          nota: "Aplica a 1 máster (2 según complejidad). Si empezaste con el Pack Explorador, pagas solo la diferencia.",
        }),
      ],
    },
    {
      id: "sueltos",
      etiqueta: "Sueltos",
      aviso: "Servicios a la carta. Aplican a 1 universidad (2 según complejidad).",
      servicios: [
        servicio("revision", 79, {
          nombre: "Solo Revisión Documentaria",
          lema: "CV europeo + cartas + equivalencia",
          para: "Ya sabes qué universidad y máster quieres.",
          incluye: [
            "Requisitos por máster y universidad",
            "CV europeo y carta de motivación personalizada",
            "Equivalencia de notas y guía para cartas de recomendación",
          ],
          nota: "No incluye postulación.",
        }),
        servicio("postulacion", 89, {
          nombre: "Solo Postulación",
          lema: "Tú tienes los documentos; nosotros postulamos",
          para: "Ya tienes todos tus documentos listos.",
          incluye: [
            "Presentación oficial en el portal universitario",
            "Confirmación de envío y credenciales",
            "Documentos adicionales si la universidad los pide",
          ],
        }),
        servicio("soporte-admision", 45, {
          nombre: "Soporte en Proceso de Admisión",
          lema: "Subsanaciones y alegaciones",
          para: "La universidad te pide documentos, tienes baja puntuación o quieres apelar.",
          incluye: [
            "Análisis de la notificación recibida",
            "Orientación: subsanación, documentos o lista de espera",
            "Presentamos tu escrito de subsanación o alegación",
          ],
          desde: true,
          nota: "El precio depende de la complejidad del caso.",
        }),
        servicio("post-admision", 45, {
          nombre: "Soporte Post-Admisión",
          lema: "Matrícula y confirmación de plaza",
          para: "Ya te admitieron y no sabes cómo confirmar plaza o matricularte.",
          incluye: [
            "Revisión de la carta de admisión",
            "Checklist paso a paso y revisión de documentos de matrícula",
            "Orientación sobre los trámites de visado",
          ],
          nota: "Orienta; no incluye la gestión del visado.",
        }),
      ],
    },
    {
      id: "asesorias",
      etiqueta: "Asesorías",
      aviso: "Sesiones de 30 minutos para quien ya está en proceso.",
      servicios: [
        servicio("consulta-puntual", 29, {
          nombre: "Consulta Puntual Acompañada",
          lema: "Orientación estratégica · 30 minutos",
          para: "Ya estás en proceso y quieres confirmar tus próximos pasos.",
          incluye: [
            "Revisión rápida de tu situación",
            "Etapas del proceso, plazos y errores frecuentes",
            "Recomendaciones prácticas para tu caso",
          ],
          nota: "No incluye revisión documentaria ni postulación.",
        }),
        servicio("sesion-acompanada", 45, {
          nombre: "Sesión Acompañada",
          lema: "En vivo, con pantalla compartida · 30 minutos",
          para: "Quieres revisar algo urgente o postular en ese momento con guía.",
          incluye: [
            "Revisión de documentos en tiempo real",
            "Navegación guiada por los portales universitarios",
            "Postulación asistida en vivo si hace falta",
          ],
        }),
      ],
    },
  ],
  contexto: "¿No sabes cuál necesitas? Lo vemos en la sesión.",
};

export const OTROS_DESDE = Math.min(...OTROS_SERVICIOS.pestanas.flatMap((t) => t.servicios.map((s) => s.precio)));
OTROS_SERVICIOS.tarjeta.texto = `Paquetes parciales, servicios individuales y asesorías puntuales desde ${eur(OTROS_DESDE)}`;

// ── Tres ideas de la casa (cliente, 11/09/2026) ─────────────────────────────
export const PROMESA = {
  eyebrow: "Por qué Inspira",
  titulo: "Un servicio serio, con precios claros y resultados que se pueden comprobar",
  pilares: [
    {
      id: "portal",
      icono: "panel",
      titulo: "Portal propio, no un chat",
      texto: "Tu expediente vive en nuestro sistema: calendario de plazos por universidad, una tarjeta por portal con su línea de tiempo, cada requerimiento anotado con su plazo y mensajes con constancia de lectura. Se instala como app en tu teléfono.",
      enlace: { texto: "Ver cómo funciona", destino: "rastreo" },
    },
    {
      id: "progresivo",
      icono: "euro",
      titulo: "Paquetes accesibles y progresivos",
      texto: `Desde ${eur(PRECIO_DESDE)}, con pago por etapas: el plan en dos cuotas cuando faltan más de dos meses para postular y, si luego quieres más cobertura, amplías al plan superior pagando solo la diferencia.`,
      enlace: { texto: "Ver cuánto pagas y cuándo", destino: "metodo" },
    },
    {
      id: "resultados",
      icono: "estrella",
      titulo: "No te vendemos humo, sino resultados",
      texto: "98 % de admitidos a másteres oficiales*, becas logradas de Generación Bicentenario, la Universidad de Jaén, Fundación Carolina y la AUIP, y opiniones reales de nuestros clientes en Google.",
      enlace: { texto: "Leer las opiniones", destino: "opiniones" },
    },
  ],
  descargo: "*Registros internos de expedientes, actualizados a agosto de 2026. La admisión la decide cada universidad: te decimos con claridad qué es viable y qué no, y no garantizamos la admisión, el visado ni la beca.",
};

// Nombre para el select del simulador: el `nombreCompleto` no cabe en el
// control cerrado (se cortaba el precio). El nombre completo va debajo.
const NOMBRE_SELECT = {
  "l1-a": "Plan A Andalucía",
  "l1-basico": "Plan Básico",
  "l1-comfort": "Plan Comfort",
  "l1-full": "Full Económico",
  "l2-a": "Plan A",
  "l2-basico-full": "Básico Full",
  "l2-full": "Plan Full",
  "l3-a": "Plan A",
  "l3-comfort": "Plan Comfort",
  "l3-full": "Plan Full",
  "l3-total": "Plan Total",
  "econ-intermedias-650": "Económicas + Intermedias",
  "premium-700": "Paquete Premium",
  "infinity-1100": "Paquete Infinity",
};

export const TODOS_LOS_PLANES = [
  ...LISTAS.flatMap((l) =>
    l.planes.map((p) => ({
      ...p,
      lista: l.id,
      grupo: l.etiqueta,
      opcion: `${NOMBRE_SELECT[p.id]} · L${l.numero} · ${eur(p.precio)}`,
    }))
  ),
  ...AVANZADOS.planes.map((p) => ({
    ...p,
    lista: null,
    grupo: "Paquetes avanzados",
    opcion: `${NOMBRE_SELECT[p.id]} · ${eur(p.precio)}`,
  })),
];

export const planPorId = (id) => TODOS_LOS_PLANES.find((p) => p.id === id) || null;

// ── A5 · Mapa: qué lista y qué planes cubren cada comunidad ────────────────
// Claves = ids de pages/landing/master2027/mapaEspana.data.js.
const PLANES_L1 = (propio) => [propio, "l1-full", "econ-intermedias-650", "premium-700", "infinity-1100"];
const PLANES_L2 = ["l2-a", "l2-basico-full", "l2-full", "econ-intermedias-650", "premium-700", "infinity-1100"];
const PLANES_L3 = ["l3-a", "l3-comfort", "l3-full", "l3-total", "premium-700", "infinity-1100"];
const FUERA_TEXTO = "Fuera de las tres listas. Entra en el Paquete Infinity; por separado, te hacemos un presupuesto personalizado en la sesión.";

export const COMUNIDADES_INFO = {
  andalucia: { lista: "economicas", universidades: "Almería, Cádiz, Córdoba, Granada, Huelva, Internacional de Andalucía, Jaén, Málaga, Pablo de Olavide y Sevilla", planes: PLANES_L1("l1-a") },
  cantabria: { lista: "economicas", universidades: "Universidad de Cantabria", planes: PLANES_L1("l1-basico") },
  asturias: { lista: "economicas", universidades: "Universidad de Oviedo", planes: PLANES_L1("l1-basico") },
  "castilla-la-mancha": { lista: "economicas", universidades: "Universidad de Castilla-La Mancha", planes: PLANES_L1("l1-basico") },
  galicia: { lista: "economicas", universidades: "A Coruña, Santiago de Compostela y Vigo", planes: PLANES_L1("l1-comfort") },
  "castilla-y-leon": { lista: "economicas", universidades: "Burgos, León, Salamanca y Valladolid", planes: PLANES_L1("l1-comfort") },
  navarra: { lista: "economicas", universidades: "Universidad Pública de Navarra", planes: PLANES_L1("l1-basico") },
  "la-rioja": { lista: "intermedias", universidades: "Universidad de La Rioja", planes: PLANES_L2 },
  "pais-vasco": { lista: "intermedias", universidades: "Universidad del País Vasco", planes: PLANES_L2 },
  murcia: { lista: "intermedias", universidades: "Murcia y Politécnica de Cartagena", planes: PLANES_L2 },
  extremadura: { lista: "intermedias", universidades: "Universidad de Extremadura", planes: PLANES_L2 },
  aragon: { lista: "intermedias", universidades: "Universidad de Zaragoza", planes: PLANES_L2 },
  "comunidad-valenciana": { lista: "premium", universidades: "Politécnica de Valencia, Valencia, Alicante, Miguel Hernández y Jaume I", planes: PLANES_L3 },
  cataluna: { lista: "premium", universidades: "Autónoma de Barcelona, Barcelona, Politécnica de Cataluña, Pompeu Fabra, Rovira i Virgili, Girona y Lleida", planes: PLANES_L3 },
  madrid: { lista: "premium", universidades: "Alcalá, Autónoma de Madrid, Carlos III, Complutense, Politécnica de Madrid, Rey Juan Carlos y la Menéndez Pelayo (UIMP)", planes: PLANES_L3 },
  baleares: { lista: null, texto: FUERA_TEXTO, planes: ["infinity-1100"] },
  canarias: { lista: null, texto: FUERA_TEXTO, planes: ["infinity-1100"] },
  ceuta: { lista: null, texto: "Sin universidad propia en nuestro catálogo.", planes: [] },
  melilla: { lista: null, texto: "Sin universidad propia en nuestro catálogo.", planes: [] },
};

export const COMUNIDADES_FUERA = ["baleares", "canarias", "ceuta", "melilla"];

export const MAPA = {
  eyebrow: "Tres listas, quince comunidades",
  titulo: "Elige por dónde postular",
  microcopy: "Toca o pasa el cursor por una comunidad, o elige de la lista.",
  intro: "Cada lista agrupa comunidades con un perfil parecido de matrícula pública, demanda y proceso de admisión.",
  selectEtiqueta: "Elige tu comunidad",
  selectPlaceholder: "Selecciona una comunidad",
  grupoFuera: "Fuera de las listas",
  leyendaFuera: "Fuera de las listas: Baleares y Canarias",
  ariaLeyenda: "Listas de comunidades",
  ariaMapa: "Mapa de España con las comunidades coloreadas por lista",
  canarias: "Canarias",
  panelVacio: "Elige una comunidad para ver su lista y sus planes.",
  universidadesRotulo: "Universidades públicas en nuestro catálogo:",
  privadas: "En esta comunidad también postulamos a universidades privadas, si las eliges.",
  planesRotulo: "Planes que la cubren",
  contexto: "Postular en esta comunidad empieza por la sesión.",
};

// ── Qué incluye todo paquete ────────────────────────────────────────────────
// Los 8 puntos de MASTER_INCLUYE (metodo.js) más las reuniones 1 a 1 (cliente,
// 10/09/2026), con el cuarto redactado con
// «Comprobamos» para no juntar «garantizamos» y «visado» en esta pieza.
export const INCLUYE = [
  "Búsqueda personalizada de centros oficiales",
  "Evaluación de precios y notas de corte",
  "Filtramos los requisitos según tu perfil y el máster",
  "Comprobamos que el centro es apto para el visado de estudios",
  "Revisión y ajuste de los documentos requeridos",
  "Postulación directa a másteres por universidad",
  "Seguimiento personalizado hasta obtener la vacante",
  "Reuniones 1 a 1 de seguimiento",
  "Asesoría para la matrícula y la carta de admisión",
];

export const ADEMAS = [
  "Informe personalizado de másteres: finalistas y alternativas, precio de matrícula según la norma de cada comunidad, beca posible y plazos.",
  "Becas mapeadas según tu perfil: cruzamos las convocatorias cargadas con cada máster de tu informe. Lo que no está confirmado, tu asesor lo verifica contigo antes de postular.",
  "Seguimiento de becas por tu asesor, incluido en cualquier paquete.",
  "Tu expediente en un sistema propio: calendario de plazos, una tarjeta por portal y mensajes con constancia de lectura.",
];

// ── Descargos (visibles, no en letra diminuta) ──────────────────────────────
export const DESCARGOS = {
  admision: "La admisión la decide cada universidad. Inspira no garantiza la admisión, el visado ni la beca; nuestro trabajo es preparar y presentar tu candidatura con la mejor estrategia posible.",
  precio: "Los planes cubren la asesoría y la gestión de Inspira. Las tasas de postulación y de estudio del título, la matrícula, la homologación o equivalencia, las apostillas y traducciones, la tasa consular, el seguro médico y los certificados los paga el postulante directamente a cada organismo.",
  fechas: "Las fechas del curso 2027-28 son estimadas a partir del calendario 2026-27. Cada universidad publica el suyo entre febrero y junio de 2027; te avisamos en cuanto salga.",
  becas: "Cada beca depende de su convocatoria: requisitos, plazos y cuantías cambian cada año y las decide la entidad que la otorga. Inspira no concede becas ni garantiza su obtención. Lo que no está confirmado, tu asesor lo verifica contigo antes de postular. La beca no sustituye la admisión, que decide la universidad. Las becas logradas se citan por la entidad que las otorgó, no por convocatoria.",
  calculadora: "Estimación referencial; no sustituye la sesión diagnóstico.",
};

export const PLANES_ENCABEZADO = {
  titulo: "Todos los planes incluyen el mismo trabajo. Solo cambia dónde postulamos.",
  verIncluye: "Ver qué incluye todo paquete",
  incluyeTitulo: "Incluye",
  ademasTitulo: "Además, en 2027/2028",
  noIncluyeTitulo: "No incluye",
  sinTasas: "Ningún plan incluye tasas de postulación ni de documentos.",
  // Sin tipo de cambio ni «puedes pagar en soles»: no lo confirmó el cliente.
  moneda: `Importes en euros. ${FORMAS_PAGO}`,
  masElegido: "Más elegido",
};

// ── A4 · Los más elegidos (orden del cliente, sin porcentajes) ─────────────
export const MAS_ELEGIDOS = {
  titulo: "Los planes que más eligieron nuestros asesorados en 2026/2027",
  subtitulo: "Por orden, según nuestra experiencia del ciclo 2026/2027. Precios del Paquete Máster 2027/2028.",
  etiquetaPrimero: "El más elegido",
  verLista: "Ver la lista →",
  verAvanzado: "Ver el plan →",
  alternativa: { plan: "l3-a", texto: `Solo una universidad: Plan A · ${eur(P["l3-a"])} →` },
  tarjetas: [
    { orden: "1.º", plan: "l1-full", titulo: "Plan Full Económico", texto: "Las siete comunidades económicas, 21 universidades públicas, sin límite de másteres." },
    { orden: "2.º", plan: "l1-a", titulo: "Plan A · Andalucía", texto: "Hasta 6 másteres en las 10 universidades públicas andaluzas, con una sola solicitud." },
    { orden: "3.º", plan: "l3-comfort", titulo: "Comunidad Valenciana completa", texto: "Todas las públicas valencianas (y privadas, si las eliges), sin límite de másteres.", conAlternativa: true },
    { orden: "4.º", plan: "l3-comfort", titulo: "Madrid completa", texto: "Todas las públicas de Madrid (y privadas, si las eliges), sin límite de másteres.", conAlternativa: true },
    { orden: "5.º", plan: "premium-700", titulo: "Paquete Premium", texto: "Hasta 6 comunidades a elegir, sin límite de listas, públicas y privadas." },
    { orden: "6.º", plan: "l2-full", titulo: "Plan Full Intermedias", texto: "Las cinco comunidades intermedias, todas sus universidades públicas, sin límite de másteres." },
  ],
  contexto: "¿No sabes cuál te conviene? Lo vemos en la sesión.",
  imagenAlt: "Ilustración de birretes lanzados al aire",
};

// ── A7 · Método por etapas y simulador de pagos ────────────────────────────
const PCT = (n) => `${n}${NBSP}%`;
const TASA_EXTRANJERIA = 11;
const VIA_TEXTO = `Visado: ${PLANES_VISADO.map(
  (v) => `${v.nombre} ${eur(v.precio)}${v.destacado ? " (recomendada)" : ""}`
).join(" · ")} · Estancia por estudios ${eur(ESTANCIA_ESTUDIOS.precio)}`;
const CITAS_TEXTO = `Empadronamiento ${eur(CITA.empadronamiento)} · Huellas / TIE ${eur(CITA.tie)}`;

export const METODO = {
  eyebrow: "Método Inspira",
  titulo: "Nadie paga un proceso migratorio de golpe",
  intro: "Pagas por etapas: primero la sesión diagnóstico, como pago aparte; después el paquete, en dos cuotas si faltan más de dos meses para tu postulación; la vía migratoria solo con carta de admisión; y las citas en España solo con la visa aprobada.",
  hitos: [
    { n: "0", icono: "balanza", etapa: "Sesión diagnóstico", importe: `${eur(SESION.precio)} (${SESION.precioAlt})`, cuando: `Hoy. ${SESION.duracion} online con un abogado especialista. Es un pago aparte del paquete.` },
    { n: "1", icono: "birrete", etapa: "Paquete máster", importe: `desde ${eur(PRECIO_DESDE)}`, cuando: `Si faltan más de dos meses para tu postulación, pagas el plan en dos cuotas: ${PCT(50)} al iniciar y ${PCT(50)} a los dos meses. Si falta menos, al contado. En todos los casos, el plan queda pagado antes de tu primera postulación.` },
    { n: "2", icono: "pasaporte", etapa: "Vía migratoria", importe: VIA_TEXTO, cuando: "Se paga al recibir la carta de admisión. Si no hay carta, no se abre esta etapa." },
    { n: "3", icono: "casa", etapa: "Citas en España", importe: CITAS_TEXTO, cuando: "Solo cuando tu visa ya está aprobada." },
  ],
  notas: [
    `La estancia por estudios se solicita ya en España, dentro de tu plazo como turista; no incluye la tasa de ${eur(TASA_EXTRANJERIA)} de Extranjería ni recursos. Cuál vía te toca lo definimos en la sesión diagnóstico.`,
    "Con tu permiso de estudiante puedes trabajar hasta 30 horas a la semana.",
  ],
  sesion: {
    titulo: `Sesión diagnóstico · ${SESION.duracion} · ${eur(SESION.precio)} (${SESION.precioAlt})`,
    gancho: SESION.gancho,
    incluye: SESION.incluye,
  },
};

export const SIMULADOR = {
  titulo: "Calcula cuánto pagas y cuándo",
  planEtiqueta: "Tu plan de máster",
  planPorDefecto: "l1-full",
  // Ejemplo por defecto: Full Económico + visado Integral + citas + sesión = 709 €.
  viaPorDefecto: "visado-integral",
  citasPorDefecto: true,
  viaEtiqueta: "Tu vía migratoria",
  // Solo dos vías en el simulador (cliente, 11/09/2026): visado con la
  // Asesoría Integral y estancia por estudios. El resto de la landing sigue
  // listando los tres planes de visado.
  vias: [
    ...PLANES_VISADO.filter((v) => v.id === "visado-integral").map((v) => ({
      id: v.id,
      precio: v.precio,
      texto: `Visado · ${eur(v.precio)}`,
    })),
    { id: ESTANCIA_ESTUDIOS.id, precio: ESTANCIA_ESTUDIOS.precio, texto: `Estancia por estudios · ${eur(ESTANCIA_ESTUDIOS.precio)}` },
  ],
  citasEtiqueta: `Añadir las citas en España (empadronamiento ${eur(CITA.empadronamiento)} + huellas/TIE ${eur(CITA.tie)})`,
  totalCitas: TOTAL_CITAS,
  precioSesion: SESION.precio,
  // Regla de pago del plan (cliente, 11/09/2026): dos cuotas solo con más de
  // dos meses por delante; si no, al contado.
  plazo: {
    pregunta: "¿Faltan más de dos meses para tu postulación?",
    si: "Sí: dos cuotas",
    no: "No: al contado",
  },
  filas: {
    hoy: "Hoy · sesión diagnóstico",
    inicio: `Al iniciar · ${PCT(50)} del plan`,
    dosMeses: `A los 2 meses · ${PCT(50)}`,
    contado: "Al iniciar · plan al contado",
    carta: "Al recibir la carta · vía migratoria",
    visa: "Con la visa aprobada · citas",
  },
  // La sesión es un pago aparte y suma al total (cliente, 11/09/2026, tarde).
  notaHoy: "Pago aparte del plan",
  // Regla de pago del plan (cliente, 11/09/2026).
  notaCuotas: `Si faltan más de dos meses para tu postulación, pagas el plan en dos cuotas: ${PCT(50)} al iniciar y ${PCT(50)} a los dos meses. Si falta menos, al contado. En todos los casos, el plan queda pagado antes de tu primera postulación.`,
  sinCitas: "sin añadir",
  totalRotulo: "Total con Inspira:",
  pie: `El total incluye los ${eur(SESION_DIAGNOSTICO.precio)} de la sesión diagnóstico, que es un pago aparte. ` + "Sin tasas de postulación, matrícula, apostillas, seguro ni tasa consular: se pagan aparte a cada organismo. Estimación referencial; el importe final se confirma en la sesión.",
};

// ── A8 · Rastreo y seguimiento (solo funciones verificadas) ────────────────
export const RASTREO = {
  eyebrow: "Tu expediente no va por WhatsApp: sistema propio",
  titulo: "Un sistema propio con cada plazo a la vista",
  // El asesorado entra a su panel con su correo de Google, no con usuario y
  // contraseña (pages/panel/components/Bienvenida.jsx): de ahí «acceso privado».
  intro: "Tu expediente vive en tu panel, con tu acceso privado. Del otro lado, tu asesor trabaja sobre el mismo expediente.",
  puntos: [
    { icono: "calendario", texto: "Calendario de plazos por universidad, cargado por nuestro equipo. El de 2027-28 es provisional hasta que cada universidad publique el suyo." },
    { icono: "reloj", texto: "En tu panel ves qué plazo cierra en las próximas dos semanas y, a tres días o menos, en rojo." },
    { icono: "panel", texto: "Una tarjeta por portal con su línea de tiempo: plazo, presentada, resultados, matrícula." },
    { icono: "usuarios", texto: "Tu asesor revisa los portales y anota cada requerimiento o notificación con su plazo y su estado." },
    { icono: "chat", texto: "Mensajes dentro del expediente, con constancia de lectura." },
    { icono: "laptop", texto: "Tu panel se instala como app en el teléfono." },
    { icono: "euro", texto: "Precio de matrícula por comunidad con la norma oficial que lo fija." },
  ],
  mock: {
    rotulo: "Vista de ejemplo",
    hoy: "Hoy · 2 plazos cierran en 14 días",
    portal: "Distrito Único Andaluz",
    pasos: ["Plazo", "Presentada", "Resultados", "Matrícula"],
  },
  contexto: "Tu expediente se abre después de la sesión.",
  imagenAlt: "Manos escribiendo en un portátil",
};

// ── A9 · Principales becas ──────────────────────────────────────────────────
const CHIP_CRUCE = { tipo: "cruce", texto: "La cruzamos con tu informe" };
// Las becas logradas se citan por entidad, no por convocatoria (el cliente no dijo cuál).
const lograda = () => ({ tipo: "lograda", texto: "Lograda por asesorados en nuestra asesoría" });

export const BECAS = {
  titulo: "Principales becas para hacer tu máster en España en 2027-28",
  subtitulo: "Las cruzamos con tu perfil y con cada máster de tu informe. Fechas estimadas a partir del ciclo 2026-27; cada convocatoria fija las suyas.",
  ventanaRotulo: "Ventana estimada:",
  tarjetas: [
    {
      id: "carolina",
      titulo: "Fundación Carolina · Becas de posgrado",
      chips: [CHIP_CRUCE, lograda()],
      texto: "Para nacionales de América Latina: matrícula total o parcial, ayuda mensual, pasaje y seguro, según el programa. Cada programa fija su cobertura.",
      ventana: "Enero – marzo de 2027",
    },
    {
      id: "auip-lorca",
      titulo: "AUIP · Becas Federico García Lorca (Andalucía)",
      chips: [CHIP_CRUCE, lograda()],
      texto: "Matrícula, alojamiento y manutención para másteres en nueve universidades públicas de Andalucía (convocatoria 2026). Nota media mínima de 7,5 y vinculación con una universidad latinoamericana asociada a la AUIP.",
      ventana: "Marzo – abril de 2027",
    },
    {
      id: "auip-universidades",
      titulo: "AUIP · Convocatorias por universidad",
      chips: [CHIP_CRUCE, lograda()],
      texto: "Becas de matrícula o de alojamiento en universidades de Valencia, Navarra, Cantabria, Galicia y Madrid, una convocatoria por universidad.",
      ventana: "Marzo – mayo de 2027",
    },
    {
      id: "erasmus-mundus",
      titulo: "Erasmus Mundus Joint Masters (Unión Europea)",
      chips: [{ tipo: "orientacion", texto: "Te orientamos; no la gestionamos" }],
      texto: `Másteres conjuntos europeos con matrícula cubierta y ${eur(1400)} al mes. Se estudia en al menos dos países. Para perfiles muy competitivos.`,
      ventana: "Octubre de 2026 – febrero de 2027, según el máster",
    },
    {
      id: "jaen",
      titulo: "Universidad de Jaén · Becas de Atracción del Talento",
      chips: [CHIP_CRUCE, lograda()],
      texto: `30 becas en 2026-27: matrícula completa y, en la modalidad A, ${eur(3190)} al año. Nota media mínima de 8. Encaja con el Plan A · Andalucía.`,
      ventana: "Noviembre de 2026 – febrero de 2027",
    },
    {
      id: "talentunileon",
      titulo: "Universidad de León · TalentUnileón",
      chips: [CHIP_CRUCE],
      texto: `10 becas en 2026-27: matrícula del primer curso y ${eur(1800)} para seguro y viaje. Nota media mínima de 8 y español nativo o B1. Castilla y León, Lista 1.`,
      ventana: "Abril – mayo de 2027",
    },
  ],
  paisTitulo: "Programas de tu país",
  paises: [
    { pais: "Perú", texto: "PRONABEC, Beca Generación del Bicentenario: nuestros asesorados la han logrado en convocatorias anteriores. Sin convocatoria en 2026; si se reabre para 2027, te avisamos." },
    { pais: "México", texto: "Secihti, becas de posgrado en el extranjero: mensualidad, seguro y ayuda de formación para maestrías presenciales en áreas prioritarias. Convocatoria estimada entre marzo y mayo de 2027." },
    { pais: "Colombia", texto: `Colfuturo, Crédito Beca: crédito de hasta ${numero(50000)}${NBSP}US$; el ${PCT(25)} se condona si te gradúas, vuelves a Colombia y te quedas allí tres años. Convocatoria estimada entre febrero y marzo de 2027.` },
  ],
  enlaceFechas: "Ver el calendario de postulación 2027-28 →",
  contexto: "En la sesión vemos qué becas encajan contigo.",
  imagenAlt: "Estudiante leyendo apuntes al aire libre",
  ariaCarrusel: "Principales becas",
};

// ── A10 · Calculadora ───────────────────────────────────────────────────────
export const CALCULADORA = {
  eyebrow: "Herramienta gratuita",
  titulo: "Calcula el costo real de tu máster en España",
  intro: `Matrícula, visa, apostillas, seguro y gastos de vida, en un minuto. Matrículas públicas desde ${eur(MATRICULA_DESDE)} al año, según programa y universidad.`,
  abrir: "Abrir la calculadora",
  cerrar: "Ocultar la calculadora",
  pestana: "Abrir en una pestaña nueva →",
  pestanaHref: "/calculadora-master",
  iframeSrc: "/calculadora-master.html",
  iframeTitulo: "Calculadora Máster — Inspira",
  imagenAlt: "Ilustración de una persona con portátil sobre una barra de búsqueda",
};

// ── A11 · Fechas 2027-28 (estimadas) ────────────────────────────────────────
// ── Matrícula orientativa por comunidad (curso 2026-27) ────────────────────
// Mismos datos que la lámina 10 del PDF, contrastados con
// BE/prisma/seeds/data/precios.json; Navarra, con la OF 63E/2026 de la UPNA.
// `ast`: la universidad puede fijar un precio distinto para no residentes
// extracomunitarios. `marca`: número del mapa para las comunidades pequeñas.
// Orden: de menor a mayor dentro de cada lista.
const matricula = (id, lista, datos) => ({ id, lista, ...datos });

export const MATRICULA = {
  eyebrow: "Matrícula orientativa",
  titulo: "¿Cuánto cuesta un máster al año en cada comunidad?",
  intro: "Matrícula orientativa de un máster de 60 créditos para estudiante extracomunitario, según la norma de precios de cada comunidad (curso 2026-27). Los de 2027-28 se publican en primavera y verano de 2027.",
  tablaTitulo: "De menor a mayor, por lista",
  columnas: ["Comunidad", "Al año"],
  segunRama: "según rama",
  cadaUniversidad: "Lo fija cada universidad",
  desde: "desde",
  asterisco: "* Importe de la norma; la universidad puede fijar un precio distinto para no residentes extracomunitarios.",
  nota: `Orientativo, 60 ECTS, curso 2026-27. En varias comunidades el precio varía por rama y la universidad puede fijar un precio distinto para no residentes; en algunas hay además una tasa previa de estudio del título (entre ${numero(TASA_PREVIA[0])} y ${eur(TASA_PREVIA[1])}). La matrícula la pagas directamente a la universidad.`,
  calculadora: "Calcula tu caso con la calculadora →",
  calculadoraHref: "/calculadora-master",
  ariaMapa: "Mapa de España con la matrícula orientativa de un máster por comunidad",
  filas: [
    matricula("galicia", "economicas", { min: 591, max: 836, ast: true, rama: true }),
    matricula("castilla-la-mancha", "economicas", { min: 728, max: 1132, ast: true, rama: true }),
    matricula("andalucia", "economicas", { min: 821 }),
    matricula("cantabria", "economicas", { min: 894, max: 1578, rama: true, marca: 1 }),
    matricula("asturias", "economicas", { min: 1310, ast: true }),
    matricula("castilla-y-leon", "economicas", { min: 1572 }),
    matricula("navarra", "economicas", { min: 1701, ast: true, marca: 2 }),
    matricula("extremadura", "intermedias", { min: 1375, max: 2468, rama: true }),
    matricula("pais-vasco", "intermedias", { min: 1538, max: 2143, rama: true, marca: 3 }),
    matricula("murcia", "intermedias", { min: 2227, desde: true, ast: true }),
    matricula("la-rioja", "intermedias", { min: 2876, marca: 4 }),
    matricula("aragon", "intermedias", { min: 3648 }),
    matricula("comunidad-valenciana", "premium", { min: 4241 }),
    matricula("madrid", "premium", { min: 5044, marca: 5 }),
    matricula("cataluna", "premium", { cadaUniversidad: true }),
  ],
};

// Importe de una fila tal como se lee en la tabla y en el mapa.
export function importeMatricula(f) {
  if (f.cadaUniversidad) return MATRICULA.cadaUniversidad;
  const asterisco = f.ast ? "*" : "";
  if (f.max) return `${rangoEur(f.min, f.max)}${asterisco}`;
  return `${f.desde ? `${MATRICULA.desde} ` : ""}${eur(f.min)}${asterisco}`;
}

// ── /servicios/master · Portal propio (solo funciones verificadas) ────────
export const PORTAL_PROPIO = {
  eyebrow: "Portal propio",
  titulo: "Tu máster vive en tu portal, no en un chat",
  intro: "Cada asesorado tiene su panel privado. Tú ves en qué punto está tu máster; tu asesor trabaja sobre el mismo expediente.",
  items: [
    {
      id: "inicio",
      titulo: "Todo en un lugar",
      texto: "Al entrar sabes en qué punto está tu máster, qué te toca hoy y quién es tu asesor. Entras con tu correo de Google y el panel se instala como app en tu teléfono.",
      alt: "Inicio del portal del asesorado, con los datos desenfocados",
    },
    {
      id: "expediente",
      titulo: "Tu máster, paso a paso",
      texto: "Documentos, perfil académico, informe, elección, postulaciones y cierre, con tu avance a la vista. Si un documento necesita cambios, tu asesor te lo explica en el propio documento.",
      alt: "Avance del expediente de máster, con los datos desenfocados",
    },
    {
      id: "informe",
      titulo: "Informe y elección con tu asesor",
      texto: "Un informe de másteres personalizado, con precio, plazos y beca posible de cada uno. Tú eliges tus favoritos y tu asesor te responde uno por uno.",
      alt: "Un máster del informe personalizado, con los datos desenfocados",
    },
    {
      id: "plazos",
      titulo: "Cada plazo y cada portal a la vista",
      texto: "Una línea de tiempo por postulación. Tu asesor revisa los portales y anota cada requerimiento o notificación con su plazo.",
      alt: "Línea de tiempo de una postulación, con los datos desenfocados",
    },
  ],
  nota: "Capturas del portal con datos de ejemplo desenfocados.",
  contexto: "Tu expediente se abre después de la sesión.",
};

// ── /servicios/master · textos propios de la página del sitio ──────────────
export const PAGINA_MASTER = {
  // Hero: títulos oficiales y dos botones secundarios a secciones de la página.
  heroOficial: "Solo másteres universitarios oficiales: títulos reconocidos en España y la UE y aptos para el visado de estudios",
  heroSecundarios: [
    // La calculadora muestra equivalencia de nota, costos y universidades compatibles con el perfil.
    { id: "calculadora", icono: "euro", texto: "Calcula a qué másteres puedes postular" },
    { id: "portal", icono: "panel", texto: "Portal Inspira: mira nuestro portal único" },
  ],
  // Formulado como alcance de los paquetes: hay unos pocos títulos propios
  // marcados en el catálogo que un asesor puede añadir si se piden expresamente.
  planesOficial: "Todos los paquetes son para másteres universitarios oficiales",
  faqOficial: {
    id: "titulos-oficiales",
    q: "¿Son títulos oficiales?",
    a: [
      "Sí. Nuestros paquetes son para másteres universitarios oficiales: títulos inscritos en el Registro de Universidades, Centros y Títulos (RUCT) del Ministerio, con validez en toda España y reconocidos en el Espacio Europeo de Educación Superior. Importa por dos motivos: el visado de estudios pide estar admitido en estudios aptos, y es el título oficial el que después puedes hacer valer o homologar en tu país. Los títulos propios de una universidad no son oficiales ni se pueden homologar, y para el visado exigen revisar cada caso; por eso trabajamos con másteres oficiales. Que el título sea oficial no asegura la plaza: la admisión la decide cada universidad.",
    ],
  },
  opinionesEyebrow: "Opiniones reales",
  opinionesTitulo: "Lo que dicen quienes ya trabajaron con nosotros",
};

export const FECHAS = {
  eyebrow: "Calendario 2027-28 · estimado",
  titulo: "Cuándo se postula para empezar en septiembre de 2027",
  mensaje: "Para empezar clases en septiembre u octubre de 2027, lo fuerte es postular entre noviembre de 2026 y febrero de 2027. La primera ventana abre en unas semanas.",
  etiquetaPrimero: "Abre en unas semanas",
  hitos: [
    {
      titulo: "Nov 2026 – feb 2027 · Fases para titulados extranjeros",
      texto: "Comunidad Valenciana, Fase 0 solo para titulados extracomunitarios (Politécnica de Valencia, Valencia, Alicante, Miguel Hernández y Jaume I, una sola solicitud): ~17 nov 2026 – 13 feb 2027. Andalucía, Distrito Único, fase solo para extranjeros en las 10 públicas: ~13 – 29 ene 2027, adjudicación ~19 feb. Las primeras universidades de Madrid (Carlos III desde ~1 dic 2026; Complutense, Politécnica, Autónoma y Rey Juan Carlos entre fin de enero y mediados de febrero) y de Cataluña (Autónoma de Barcelona y Barcelona desde ~2 feb) abren entre diciembre y febrero; el resto, entre marzo y junio.",
    },
    {
      titulo: "Feb – jul 2027 · Primeras fases del resto",
      texto: "Entre febrero y abril abren su primera fase la mayoría de universidades de la Lista 1 y las de Murcia; casi todas cierran entre abril y julio, pero Oviedo (~9 – 27 feb) y Santiago de Compostela (~18 feb – 10 mar) cierran antes. Aragón, La Rioja, Extremadura y País Vasco convocan entre mayo y julio. Entre marzo y mayo se solicitan casi todas las becas por universidad.",
    },
    {
      titulo: "Jun 2027 · Fases generales",
      texto: "Andalucía, segunda fase: ~17 – 26 jun (resultados ~22 jul). Comunidad Valenciana, segunda fase: ~15 – 26 jun. Cataluña y Madrid, fases de primavera y verano.",
    },
    {
      titulo: "Sep 2027 · Últimas fases y vacantes",
      texto: "Para empezar ese mismo curso: Andalucía ~8 – 15 sep (resultados ~29 sep); Comunidad Valenciana, vacantes ~24 ago – 4 sep. Es tarde para becas y ajustado para el visado.",
    },
    {
      titulo: "Sep – oct 2027 · Empieza el curso",
      texto: "Con la carta de admisión en mano, entre la carta y el primer día de clase van el visado o la estancia por estudios, el seguro, el viaje y las citas en España.",
    },
  ],
  consejo: "Si quieres beca, postula en las primeras fases: las exclusivas para extranjeros cierran en enero y febrero, y la mayoría de becas se solicitan entre noviembre y mayo con la preinscripción ya hecha.",
  contexto: "Llega a la primera ventana con todo listo.",
};

// ── A12 · Equipo y testimonios reales ───────────────────────────────────────
export const EQUIPO = {
  eyebrow: "Quién te acompaña",
  titulo: "Abogados especialistas en extranjería y asesores educativos",
  intro: "Combinamos derecho migratorio español con asesoría educativa y un sistema propio. Detrás de tu expediente hay personas, no un chatbot.",
  personas: [
    { id: "carina", nombre: "Carina Meza", cargo: "CEO y consultora legal", alt: "Carina Meza, CEO y consultora legal de Inspira Legal" },
    // Su cargo real es gestión contable y financiera (config/equipo.js): no
    // presentarlo como abogado ni como asesor.
    { id: "sebastian", nombre: "Sebastián Alpiste", cargo: "Gestión y administración · Madrid", alt: "Sebastián Alpiste, gestión y administración de Inspira Legal en Madrid" },
  ],
  razones: [
    { icono: "brujula", titulo: "Solo asumimos casos viables", texto: "Si tu vía no es la correcta te lo decimos en la sesión diagnóstico, antes de que pagues un paquete." },
    { icono: "balanza", titulo: "Abogados colegiados, no gestores", texto: "Tu expediente migratorio lo prepara y firma un abogado especializado en extranjería española." },
    { icono: "laptop", titulo: "Sistema propio, no un chat", texto: "Tu expediente vive en nuestra plataforma: panel privado, una tarjeta por portal y mensajes con constancia de lectura." },
  ],
};

// Opiniones reales: fuente única en config/testimonios.js (TESTIMONIOS y
// RESENAS_GOOGLE); las pinta pages/landing/master2027/Opiniones.jsx.

// ── A13 · Preguntas frecuentes ──────────────────────────────────────────────
// Las respuestas son listas de trozos: texto o { enlace, destino } (un enlace
// interno de la propia landing).
const VISADOS_TEXTO = `${PLANES_VISADO.slice(0, -1).map((v) => numero(v.precio)).join(", ")} o ${eur(PLANES_VISADO[PLANES_VISADO.length - 1].precio)}`;

export const FAQ = {
  eyebrow: "Preguntas frecuentes",
  titulo: "Antes de reservar",
  imagenAlt: "Ilustración de una persona revisando una página web con una lupa",
  preguntas: [
    {
      id: "que-incluye",
      q: "¿Qué incluye exactamente un plan?",
      a: [
        "Todos incluyen el mismo trabajo, de la búsqueda a la matrícula (ver ",
        { enlace: "qué incluye todo paquete", destino: "que-incluye" },
        " en la sección de planes), más informe personalizado, becas mapeadas y seguimiento de becas por tu asesor. Lo que cambia es dónde postulamos. No incluyen tasas de postulación ni de documentos.",
      ],
    },
    {
      id: "cuando-postular",
      q: "¿Cuándo tengo que postular para empezar en 2027?",
      a: ["Lo fuerte va de noviembre de 2026 a febrero de 2027: la Fase 0 valenciana para extracomunitarios (~17 nov – 13 feb) y la fase de extranjeros de Andalucía (~13 – 29 ene). Después vienen las fases generales de febrero a julio y las de junio y septiembre. Las fechas de 2027-28 son estimadas a partir del calendario 2026-27; cada universidad publica el suyo entre febrero y junio."],
    },
    {
      id: "cuanto-pago",
      q: "¿Cuánto pago y cuándo?",
      a: [
        `La sesión diagnóstico, ${eur(SESION.precio)}, hoy, como pago aparte del paquete. El plan: si faltan más de dos meses para tu postulación, en dos cuotas, ${PCT(50)} al iniciar y ${PCT(50)} a los dos meses; si falta menos, al contado. En todos los casos, el plan queda pagado antes de tu primera postulación. La asesoría de visado (${VISADOS_TEXTO}) o la estancia por estudios (${eur(ESTANCIA_ESTUDIOS.precio)}) se paga al recibir la carta de admisión. Las citas de empadronamiento (${eur(CITA.empadronamiento)}) y de huellas (${eur(CITA.tie)}), solo con la visa aprobada. Si más adelante quieres más cobertura, amplías al plan superior pagando solo la diferencia.`,
      ],
    },
    {
      id: "si-no-admiten",
      q: "¿Qué pasa si no me admiten?",
      a: ["No garantizamos la admisión: la decide la universidad. Lo que sí hacemos es no abrir la vía migratoria sin carta: si no hay carta de admisión, no pagas la asesoría de visado ni la estancia por estudios. Por eso existen los planes con más cobertura: más universidades postuladas, más respaldo."],
    },
    {
      id: "combinar",
      q: "¿Puedo combinar listas o postular solo a una ciudad?",
      a: [
        `Sí. Económicas + Intermedias es un paquete estándar: ${eur(P["econ-intermedias-650"])} por 12 comunidades y 27 universidades públicas; no incluye la Comunidad Valenciana (Lista 3). También están el Paquete Premium (${eur(P["premium-700"])}) y el Paquete Infinity (${eur(P["infinity-1100"])}). Para una sola comunidad o ciudad (por ejemplo, solo Galicia), otras combinaciones o necesidades especiales, te hacemos un `,
        { enlace: "presupuesto personalizado", destino: "personalizado" },
        " en la sesión diagnóstico.",
      ],
    },
    {
      id: "parcial",
      q: "¿Puedo contratar solo una parte del proceso?",
      a: [
        "Sí. Hay ",
        { enlace: "paquetes parciales, servicios individuales y asesorías puntuales", destino: "otros-servicios" },
        ` desde ${eur(OTROS_DESDE)}. Los servicios individuales no se descuentan si luego contratas un paquete completo, salvo el Pack Explorador.`,
      ],
    },
    {
      id: "matricula",
      q: "¿Cuánto cuesta la matrícula en una universidad pública?",
      a: [
        `Desde ${eur(MATRICULA_DESDE)} al año en las comunidades más económicas; en Madrid o la Comunidad Valenciana puede ser varias veces más para un estudiante extracomunitario. Cada comunidad lo fija por norma. En tu informe va el precio de cada máster con su norma, y la calculadora te da una estimación antes de la sesión.`,
      ],
    },
    {
      id: "becas",
      q: "¿Las becas están incluidas?",
      a: ["El seguimiento de becas por tu asesor está incluido en cualquier paquete. La beca la concede la entidad que la convoca, con sus requisitos y plazos. Lo que no está confirmado, tu asesor lo verifica contigo antes de postular. Nuestros asesorados han logrado becas de Generación Bicentenario, la Universidad de Jaén, Fundación Carolina y la AUIP."],
    },
    {
      id: "homologar",
      q: "¿Necesito homologar mi título?",
      a: [
        `Para postular a un máster oficial no necesitas homologar: la universidad comprueba que tu título equivale a un grado español. En varias comunidades ese estudio tiene una tasa previa, entre ${numero(TASA_PREVIA[0])} y ${eur(TASA_PREVIA[1])}, que paga el postulante. La homologación suele hacer falta para los másteres habilitantes de profesiones reguladas (abogacía, profesorado, ingenierías). Lo revisamos en la sesión.`,
      ],
    },
    {
      id: "trabajar",
      q: "¿Puedo trabajar mientras estudio?",
      a: ["Sí. El permiso de estudiante habilita a trabajar hasta 30 horas a la semana."],
    },
    {
      id: "como-pago",
      q: "¿Cómo pago?",
      a: ["Reservas tu sesión en Calendly y la pagas de una de estas dos formas: pago directo, por transferencia a la cuenta empresarial de Inspira o por Plin, o con Mercado Pago, que permite pagar hasta en 3 cuotas sin intereses con tarjeta de crédito. Desde el extranjero también puedes pagar por PayPal o con un link de pago que te enviamos. Los planes se pagan por las mismas vías."],
    },
  ],
};

// ── A14 · CTA final y pie ───────────────────────────────────────────────────
export const CTA_FINAL = {
  eyebrow: "Da el primer paso",
  titulo: "Reserva tu sesión diagnóstico y llega a la primera ventana con todo listo",
  texto: `${SESION.duracion} online con un abogado especialista. Revisamos tu perfil, tus plazos y tu presupuesto, y sales con un plan escrito: qué lista te conviene, qué mirar en becas y por dónde empezar.`,
  incluye: "Diagnóstico jurídico con un abogado especialista · Requisitos, plazos y medios económicos de tu consulado · Tu vía: visado, estancia por estudios u otra · Plan de acción escrito",
  pilares: [
    { icono: "panel", texto: "Portal propio, no un chat" },
    { icono: "euro", texto: `Desde ${eur(PRECIO_DESDE)}, por etapas y ampliable` },
    { icono: "estrella", texto: "No te vendemos humo, sino resultados" },
  ],
  admision: "La admisión la decide cada universidad: te decimos con claridad qué es viable antes de que contrates.",
  microcopy: `${SESION.duracion} · ${SESION.precioAlt} · Reunión online desde cualquier parte del mundo.`,
  imagenAlt: "Estudiante graduada con toga y birrete",
};

export const PIE = {
  marca: "Asesoría educativa y extranjería · © 2026",
  identificacion: `${TITULAR.razonSocial} · RUC ${TITULAR.ruc} · ${TITULAR.domicilioFiscal} · ${TITULAR.emailContacto}`,
  enlaces: [
    { texto: "Sitio completo", href: "/" },
    { texto: "Términos", href: "/legal/terminos" },
    { texto: "Privacidad", href: "/legal/privacidad" },
  ],
  lineaFinal: "Fechas del curso 2027-28 estimadas. La admisión la decide cada universidad. Las becas dependen de cada convocatoria.",
};

// ── Barra fija y ventanas emergentes ────────────────────────────────────────
export const BARRA = {
  titulo: `Sesión diagnóstico · ${SESION.duracionCorta} · ${eur(SESION.precio)}`,
  // En móvil el precio ya va en el botón.
  // En 390 px la línea larga se truncaba: la duración baja a la segunda línea.
  tituloMovil: "Sesión diagnóstico",
  subtituloMovil: `${SESION.duracionCorta} · ${SESION.precioAlt}`,
  subtitulo: `${SESION.precioAlt} · online`,
  cerrar: "Cerrar la barra de reserva",
};

// Una sola ventana emergente (cliente, 11/09/2026, tarde): la de la sesión.
export const MODALES = {
  sesion: {
    icono: "balanza",
    titulo: "Reserva tu sesión diagnóstico",
    texto: `Una asesoría personalizada de ${SESION.duracion} online con un abogado especialista: revisamos tu perfil, tus plazos y tu presupuesto, y sales con un plan escrito. ${eur(SESION.precio)} (${SESION.precioAlt}).`,
    ahoraNo: true,
  },
  textoAhoraNo: "Ahora no",
  textoCerrar: "Cerrar",
};
