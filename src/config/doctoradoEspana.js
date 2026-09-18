// src/config/doctoradoEspana.js
// Contenido de /doctorado-en-espana (18/09/2026). Cifras verificadas en fuente
// oficial ese día; precios de Inspira confirmados por Carina el mismo día.
// La guía interna del equipo tiene el detalle y las fuentes:
// pages/backoffice/doctorado/guiaDoctorado.datos.js.

export const CIFRAS = [
  { valor: "1.199", texto: "programas de doctorado presenciales", detalle: "oficiales, en las 17 comunidades (RUCT)" },
  { valor: "desde 60 €", texto: "al año en una universidad pública", detalle: "tutela 2026-27, sin recargo para extranjeros" },
  { valor: "20 días", texto: "para resolver tu residencia", detalle: "y si no contestan, se entiende concedida" },
  { valor: "2 años", texto: "de residencia y puedes solicitar la nacionalidad", detalle: "para nacionales de países iberoamericanos" },
];

export const POR_QUE = [
  { icono: "casa", titulo: "Es residencia, no estancia", texto: "Desde agosto de 2026 el doctorado se tramita como autorización de residencia para investigación (Criterio DGGM 2/2026). Ya no es una estancia por estudios." },
  { icono: "bandera", titulo: "Cuenta para la nacionalidad", texto: "La estancia por estudios no computa para la nacionalidad; la residencia sí. Si eres iberoamericano, a los 2 años de residencia legal puedes solicitarla." },
  { icono: "usuarios", titulo: "Viene tu familia", texto: "Tu pareja, tus hijos y tus ascendientes a cargo pueden acompañarte con su propia autorización, a la vez o después." },
  { icono: "reloj", titulo: "Rápida y renovable", texto: "La resuelve la UGE en 20 días con silencio positivo. Dura 3 años, se renueva por 2 y, al terminar, tienes hasta 12 meses para buscar empleo o emprender." },
  { icono: "birrete", titulo: "Sin homologar tu título", texto: "Con tu maestría latinoamericana accedes sin homologarla: la universidad comprueba el nivel solo para el doctorado." },
  { icono: "euro", titulo: "Pública y asequible", texto: "Un año de tutela en la pública cuesta entre 60 € y 401 € según la comunidad. Ninguna aplica recargo a extranjeros en doctorado." },
];

export const NOS_ENCARGAMOS = [
  { icono: "lupa", titulo: "Diagnóstico de acceso", texto: "Revisamos tu título y tu maestría, pedimos a tiempo la carta de acceso de tu universidad y vemos si necesitas complementos." },
  { icono: "mapa", titulo: "Tu programa", texto: "Buscamos en nuestro catálogo de programas oficiales los que encajan con tu tema, tu ciudad y tu presupuesto, con sus plazos." },
  { icono: "usuario", titulo: "Director de tesis", texto: "Te damos un mapa de posibles directores y la plantilla del primer correo; en el Plus te acompañamos en cada contacto." },
  { icono: "documento", titulo: "Tu candidatura", texto: "Revisamos la forma de tu CV, tu carta de motivación y tu anteproyecto. El contenido científico es tuyo." },
  { icono: "check", titulo: "Admisión y matrícula", texto: "Comprobación de nivel, preinscripción y matrícula en cada programa, sin perder un plazo." },
  { icono: "pasaporte", titulo: "Residencia y visado", texto: "Preparamos y presentamos tu autorización ante la UGE y, si vienes de fuera, te guiamos en el visado." },
  { icono: "usuarios", titulo: "Tu familia", texto: "Tramitamos la autorización de cada familiar que venga contigo." },
  { icono: "panel", titulo: "Todo en tu portal", texto: "Plazos, documentos y mensajes en tu Expediente Digital, con seguimiento de becas." },
];

export const PAQUETES = [
  { nombre: "Doctorado", precio: 300, alcance: "Hasta 3 programas", puntos: ["Diagnóstico de acceso", "Selección de programas con plazos y precio", "Mapa de posibles directores y plantilla de contacto", "Revisión de forma de CV, carta y anteproyecto", "Preinscripción y matrícula"] },
  { nombre: "Doctorado Plus", precio: 450, alcance: "Hasta 5 programas", destacado: true, puntos: ["Todo lo del paquete Doctorado", "Acompañamiento en el contacto con directores", "Plan B de programas si un director no responde"] },
  { nombre: "Residencia para investigación", precio: 400, alcance: "Cuando tengas tu matrícula", puntos: ["Expediente ante la UGE", "Revisión de medios, seguro y antecedentes", "Guía para el visado si vienes de fuera"] },
  { nombre: "Por familiar", precio: 200, alcance: "Cada persona que venga contigo", puntos: ["Pareja, hijos o ascendientes a cargo"] },
];

export const PASOS = [
  ["Sesión diagnóstico", "Vemos tu perfil, tu maestría y la vía: desde tu país o desde España."],
  ["Programas y director", "Elegimos programas y preparamos el contacto con posibles directores."],
  ["Preinscripción", "La mayoría de universidades abre entre mayo y octubre."],
  ["Admisión y matrícula", "Casi siempre en octubre o noviembre: ahí empieza tu doctorado."],
  ["Residencia", "Autorización ante la UGE en 20 días y, si vienes de fuera, visado."],
  ["En España", "Empadronamiento, TIE y seguimiento anual hasta tu defensa."],
];

export const REQUISITOS = [
  "Título de grado o licenciatura y maestría (al menos 300 créditos entre ambos o equivalente). Sin maestría, lo vemos caso a caso: a veces conviene un máster en España antes.",
  "Carta de tu universidad que diga que tu título da acceso al doctorado en tu país (la pedimos contigo desde el primer día).",
  "Admisión y matrícula en un programa oficial de doctorado.",
  "Medios económicos: al menos 8.547 € al año (50 % del salario mínimo), o 17.094 € si viene tu familia. Un contrato predoctoral o una beca también sirven.",
  "Seguro médico sin copagos ni carencias y certificado de antecedentes penales.",
];

export const NACIONALIDAD = {
  titulo: "El camino más corto si ya tienes maestría",
  texto: "Tu doctorado es residencia, y a los 2 años puedes solicitar la nacionalidad española si eres de un país iberoamericano. Además de la residencia se pide el examen CCSE, y la resolución la da el Ministerio de Justicia: te acompañamos también en ese paso.",
};

export const FAQ = [
  ["¿Puedo hacer el doctorado sin homologar mi título?", "Sí. Con un título de fuera del Espacio Europeo, la universidad comprueba que equivale a un máster español y que da acceso al doctorado en tu país. Esa comprobación solo vale para el doctorado."],
  ["¿Necesito un director antes de postular?", "Muchos programas piden una carta de aval o compromiso de un director. Por eso el contacto con profesores es parte central del servicio."],
  ["¿Sirve un doctorado online?", "Para la residencia, no: hace falta matrícula en un programa presencial. Los programas solo a distancia no dan residencia."],
  ["¿Puedo trabajar durante el doctorado?", "Sí, en investigación y a tiempo completo: la autorización es de residencia y trabajo para actividades de formación, investigación, desarrollo e innovación, como un contrato predoctoral o un proyecto de investigación. No cubre empleos ajenos a la investigación; si es tu caso, lo vemos en la sesión."],
  ["¿Cuánto tengo que demostrar de dinero?", "Sin contrato, al menos 8.547 € al año (50 % del salario mínimo de 2026); con familiares, 17.094 €. Un contrato predoctoral lo cubre."],
  ["¿Puedo pedirlo desde España?", "Sí. Si ya estás en España en situación regular (por ejemplo, con estancia por estudios de máster), se pide ante la UGE sin volver a tu país."],
  ["¿Garantizan la admisión o la nacionalidad?", "No. La admisión la decide la comisión académica de cada programa y la residencia y la nacionalidad, la Administración. Nosotros preparamos todo para que tu solicitud llegue completa y a tiempo."],
];

export const DESCARGO = "Cifras de fuentes oficiales consultadas el 18/09/2026 (RUCT, decretos de precios públicos 2026-27, Ley 14/2013 y Criterio DGGM 2/2026). Los precios de tutela son de la universidad pública y pueden cambiar cada curso. Inspira no garantiza la admisión, la residencia ni la nacionalidad.";
