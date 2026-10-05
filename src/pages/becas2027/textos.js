// src/pages/becas2027/textos.js
//
// Datos y textos de /becas-espana-2027: la página que se envía por mensaje a
// quien comenta «BECA ESPAÑA 2027» en TikTok.
//
// La beca es el gancho. La página da el calendario completo y, sin mentir,
// deja claro que una beca depende del perfil; para quien no encaja, la segunda
// opción es un máster oficial económico, que es lo que Inspira gestiona.
//
// FECHAS: son las de la convocatoria 2026 (curso 2026-27), tomadas del panel
// de becas (pages/panel/BecasEspana.jsx) y de cat_beca. `exacta: false` marca
// las que solo conocemos por mes o por duración del plazo. Las de 2027 las
// publica cada entidad: nunca presentarlas como confirmadas.
import { TITULAR } from "../../config/legal";

const MEDIA = "https://www.inspira-legal.cloud/media";

// Etiquetas del filtro «¿cuál va contigo?».
export const FILTROS = [
  { id: "todas", texto: "Todas" },
  { id: "completa", texto: "Cubre más que la matrícula" },
  { id: "sin-auip", texto: "No piden AUIP" },
  { id: "nota-libre", texto: "Sin nota mínima de 8" },
  { id: "publico", texto: "Soy funcionario público" },
];

export const MESES = [
  { id: "ene-feb", titulo: "Enero y febrero", lema: "Las primeras en cerrar" },
  { id: "mar", titulo: "Marzo", lema: "Las más buscadas" },
  { id: "abr", titulo: "Abril", lema: "El mes más cargado" },
  { id: "jun-jul", titulo: "Junio y julio", lema: "Las últimas" },
];

export const BECAS = [
  {
    logo: "uja", perfil: "Estudiantes internacionales con muy buen expediente.",
    id: "jaen", mes: "ene-feb", sigla: "UJA", red: null, exacta: true, dia: "15", cuando: "feb",
    nombre: "U. de Jaén · Atracción del Talento",
    cubre: "Matrícula completa + 3.190 € al año",
    clave: "Nota media mínima de 8 sobre 10.",
    etiquetas: ["completa", "sin-auip"],
    url: "https://cep.ujaen.es/",
  },
  {
    logo: "aecid", perfil: "Funcionarios y empleados públicos fijos de su país.",
    id: "maec", mes: "ene-feb", sigla: "MAEC-AECID", red: null, exacta: false, dia: "2 sem.", cuando: "ene–feb",
    nombre: "MAEC-AECID · Programa Máster",
    cubre: "1.900 € al mes + seguro, durante diez meses",
    clave: "Solo para funcionarios y empleados públicos fijos. El plazo dura unas dos semanas.",
    etiquetas: ["completa", "sin-auip", "nota-libre", "publico"],
    url: "https://www.aecid.es",
  },
  {
    logo: "ue", perfil: "Buen expediente y buen inglés, de cualquier nacionalidad.",
    id: "erasmus", mes: "ene-feb", sigla: "UE", red: null, exacta: false, dia: "Enero", cuando: "muchos",
    nombre: "Erasmus Mundus · Másteres conjuntos",
    cubre: "Matrícula + hasta 1.400 € al mes + vuelo + seguro",
    clave: "Pide inglés (IELTS 6,5 o TOEFL 90) y se postula en la web de cada máster.",
    etiquetas: ["completa", "sin-auip", "nota-libre"],
    url: "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters",
  },
  {
    logo: "carolina", perfil: "Líderes y actores de la sociedad civil, con un proyecto vinculado a los Objetivos de Desarrollo Sostenible (ODS).",
    id: "carolina", mes: "mar", sigla: "Fundación Carolina", red: null, exacta: false, dia: "Marzo", cuando: "abre en ene",
    nombre: "Fundación Carolina · Becas de posgrado",
    cubre: "Matrícula + unos 1.200 € al mes + vuelo + seguro",
    clave: "La más completa y la más peleada. Valoran mucho tu proyecto y tu vínculo con el sector público o social.",
    etiquetas: ["completa", "sin-auip", "nota-libre"],
    url: "https://www.fundacioncarolina.es/",
  },
  {
    logo: "usc", perfil: "Egresados de universidades asociadas a la AUIP que no residan en España.",
    id: "usc", mes: "mar", sigla: "USC", red: "AUIP", exacta: true, dia: "20", cuando: "mar",
    nombre: "U. de Santiago de Compostela",
    cubre: "Hasta 5.000 €",
    clave: "Nota mayor de 8 y un B2 en un idioma distinto al tuyo.",
    etiquetas: ["completa"],
    url: "https://auip.org/es/becas-auip/3028-becas-auip324",
  },
  {
    logo: "usal", perfil: "Estudiantes latinoamericanos que no residan en España.",
    id: "usal", mes: "mar", sigla: "USAL", red: null, exacta: false, dia: "2 sem.", cuando: "mar–abr",
    nombre: "U. de Salamanca · Becas internacionales de máster",
    cubre: "Matrícula + alojamiento + manutención + seguro",
    clave: "Abre y cierra en unas dos semanas. Hay que estar pendiente desde enero.",
    etiquetas: ["completa", "sin-auip", "nota-libre"],
    url: "https://rel-int.usal.es",
  },
  {
    logo: "auip", perfil: "Egresados de universidades asociadas a la AUIP que no residan en España.",
    id: "lorca", mes: "abr", sigla: "Andalucía", red: "AUIP", exacta: true, dia: "8", cuando: "abr",
    nombre: "Becas Federico García Lorca",
    cubre: "Matrícula + alojamiento y manutención",
    clave: "56 becas en las universidades andaluzas. Nota media desde 7,5.",
    etiquetas: ["completa", "nota-libre"],
    url: "https://auip.org/es/becas-federico-garcia-lorca",
  },
  {
    logo: "upna", perfil: "Egresados de universidades asociadas a la AUIP que no residan en España.",
    id: "upna", mes: "abr", sigla: "UPNA", red: "AUIP", exacta: true, dia: "23", cuando: "abr",
    nombre: "U. Pública de Navarra",
    cubre: "8.000 € para matrícula, alojamiento y manutención",
    clave: "Muy pocas plazas (unas 3). Nota mínima de 8.",
    etiquetas: ["completa"],
    url: "https://auip.org/es/becas-auip/3058-becas-auip331",
  },
  {
    logo: "uv", perfil: "Egresados de universidades asociadas a la AUIP que no residan en España.",
    id: "uv", mes: "abr", sigla: "UV", red: "AUIP", exacta: true, dia: "24", cuando: "abr",
    nombre: "Universitat de València",
    cubre: "Matrícula + 2.500 € + alojamiento en colegio mayor",
    clave: "Nota mínima de 8. Ocho becas nuevas.",
    etiquetas: ["completa"],
    url: "https://auip.org/es/becas-auip/3032-becas-auip326",
  },
  {
    logo: "uc3m", perfil: "Egresados de universidades asociadas a la AUIP que no residan en España.",
    id: "uc3m", mes: "abr", sigla: "UC3M", red: "AUIP", exacta: true, dia: "30", cuando: "abr",
    nombre: "U. Carlos III de Madrid",
    cubre: "Matrícula + 1.500 €",
    clave: "15 ayudas. Antes hay que pedir la admisión y pagar la tasa de acceso.",
    etiquetas: ["completa", "nota-libre"],
    url: "https://www.uc3m.es/becas-ayudas",
  },
  {
    logo: "urjc", perfil: "Egresados de universidades asociadas a la AUIP que no residan en España.",
    id: "urjc", mes: "abr", sigla: "URJC", red: "AUIP", exacta: true, dia: "30", cuando: "abr",
    nombre: "U. Rey Juan Carlos",
    cubre: "Hasta 5.077 € en matrícula",
    clave: "No sale todos los años: en 2025 no hubo convocatoria.",
    etiquetas: ["nota-libre"],
    url: "https://auip.org/es/becas-auip/3038-becas-auip327",
  },
  {
    logo: "upv", perfil: "Egresados de universidades latinoamericanas que no residan en España.",
    id: "upv", mes: "abr", sigla: "UPV", red: "AUIP", exacta: true, dia: "30", cuando: "abr",
    nombre: "Universitat Politècnica de València",
    cubre: "Matrícula + 750 € de bolsa de viaje",
    clave: "33 ayudas. Tienes que haberte preinscrito antes en el máster.",
    etiquetas: ["sin-auip", "nota-libre"],
    url: "https://auip.org/es/becas-auip/3030-becas-auip325",
  },
  {
    logo: null, perfil: "Estudiantes internacionales con nota de 8 o más. No hace falta venir de una universidad de la AUIP.",
    id: "ule", mes: "abr", sigla: "ULE", red: null, exacta: true, dia: "30", cuando: "abr",
    nombre: "TalentUnileón · U. de León",
    cubre: "Matrícula + 1.800 € para seguro y viaje",
    clave: "Nota mínima de 8. No exige ser de la AUIP ni de ninguna red.",
    etiquetas: ["completa", "sin-auip"],
    url: "https://www.unileon.es/internacional/estudiantes/estudiantes-internacionales/becas-talentunileon",
  },
  {
    logo: "uah", perfil: "Egresados de universidades asociadas a la AUIP que no residan en España.",
    id: "uah", mes: "jun-jul", sigla: "UAH", red: "AUIP", exacta: true, dia: "19", cuando: "jun",
    nombre: "U. de Alcalá · Miguel de Cervantes",
    cubre: "Matrícula + 1.300 € de alojamiento",
    clave: "20 becas. Pide preinscripción y 250 € de reserva de plaza.",
    etiquetas: ["completa", "nota-libre"],
    url: "https://auip.org/es/becas-auip/3040-becas-auip328",
  },
  {
    logo: "ucm", perfil: "Egresados de universidades asociadas a la AUIP que no residan en España.",
    id: "ucm", mes: "jun-jul", sigla: "UCM", red: "AUIP", exacta: false, dia: "2 sem.", cuando: "julio",
    nombre: "U. Complutense de Madrid",
    cubre: "El 50, 75 o 100 % de la matrícula, según tu puntaje",
    clave: "Hasta 10 becas y un plazo de unas dos semanas.",
    etiquetas: ["nota-libre"],
    url: "https://www.ucm.es/becas-ayudas",
  },
  {
    logo: "uv", perfil: "Expediente excelente y pocos recursos económicos, de once países (el Perú entre ellos).",
    id: "luis-vives", mes: "jun-jul", sigla: "UV", red: null, exacta: false, dia: "Por salir", cuando: "fecha",
    nombre: "Becas Luis Vives · Universitat de València",
    cubre: "Beca completa: matrícula, vuelo, alojamiento, comida y seguro",
    clave: "Nota mínima de 9 y situación económica desfavorable. Perú está entre los 11 países.",
    etiquetas: ["completa", "sin-auip"],
    url: "https://www.uv.es/uvcooperation",
  },
];

export const BECAS2027 = {
  seo: {
    title: "Becas para estudiar un máster en España 2027: calendario y requisitos",
    description:
      "Las 16 becas para tu máster en España, mes a mes: cuándo cerraron en 2026, qué perfil busca cada una y qué cubren. Y si la beca no sale, másteres oficiales desde 570 €.",
    path: "/becas-espana-2027",
    imagen: "/og/becas-espana-2027.jpg",
  },
  retrato: `${MEDIA}/foto/carina-retrato.jpg`,
  tiktok: TITULAR.tiktok || TITULAR.redes?.tiktok || null,

  hero: {
    rotulo: "Becas · Máster en España 2027",
    titulo: "Las becas para tu máster en España,",
    tituloSol: "con fecha y todo",
    lead: "16 becas, mes a mes: cuándo cerró cada una en 2026, qué perfil busca y qué cubre. Para que en 2027 no llegues tarde.",
    sellos: ["16 becas", "Fechas de la convocatoria 2026", "Perfil que busca cada una"],
    cta: "Ver el calendario",
    ctaWa: "¿A cuál puedo postular?",
  },

  calendario: {
    titulo: "El calendario, mes a mes",
    referencia: "Fechas de referencia: así fue la convocatoria 2026",
    lead: "Las fechas de 2027 todavía no salen. Te damos las del año pasado, que es como se planifica: casi siempre se repiten. Filtra por lo que va contigo y toca una beca para ver qué pide.",
    perfil: "A quién buscan",
    vacio: "Ninguna beca cumple ese filtro. Prueba con otro.",
    cubre: "Cubre",
    web: "Ver la web oficial",
    cerro: "2026 · cerró",
    aviso: "Fechas y condiciones de la convocatoria 2026 (curso 2026-27). Las de 2027 las publica cada entidad y pueden cambiar: confírmalas siempre en su web oficial.",
  },

  verdad: {
    rotulo: "Te lo digo de frente",
    titulo: "Cada beca busca un perfil distinto",
    lead: "No basta con postular a tiempo. Antes de ilusionarte, mira en cuál encajas:",
    puntos: [
      { logo: "carolina", titulo: "Fundación Carolina", texto: "Busca líderes y actores de la sociedad civil, con un proyecto ligado a los Objetivos de Desarrollo Sostenible (ODS)." },
      { logo: "auip", titulo: "Becas AUIP", texto: "Están reservadas a quienes vienen de ciertas universidades: las asociadas a la AUIP. Revisa si la tuya está en la lista." },
      { logo: "aecid", titulo: "MAEC-AECID", texto: "Son para funcionarios y empleados públicos fijos. Si no trabajas en el Estado, no es para ti." },
      { logo: null, sigla: "ULE", titulo: "TalentUnileón (León)", texto: "Para estudiantes internacionales con nota de 8 o más. No te pide venir de ninguna universidad en particular." },
      { logo: "uja", titulo: "U. de Jaén", texto: "Premia el expediente: nota mínima de 8 sobre 10." },
      { logo: "uv", titulo: "Luis Vives (València)", texto: "La más completa y la más exigente: nota de 9 y situación económica desfavorable." },
    ],
    extra: "Y en casi todas: son pocas plazas, postula toda Latinoamérica y te piden no residir en España.",
    cierre: "Si encajas, vamos con todo por la beca. Y si no encajas, no pasa nada: hay otro camino.",
  },

  becados: {
    rotulo: "Sí se puede",
    titulo: "Becas que ya ganaron nuestros asesorados",
    lead: "No te hablamos de becas que leímos por ahí. Estas las postulamos con ellos.",
    video: "Mira su historia",
  },

  planB: {
    rotulo: "Sin beca también se puede",
    titulo: "Un máster oficial en España",
    tituloSol: "desde 570 €",
    lead: "En la universidad pública española hay másteres oficiales que cuestan menos que muchos diplomados aquí. No necesitas ganar nada: solo postular bien.",
    casoRotulo: "Caso real",
    casoTexto: "pagó de matrícula por su Máster Universitario en",
    casoEn: "en la",
    casoPie: "Curso 2025/26 · Máster oficial de 60 créditos",
    tablaTitulo: "Más matrículas reales de nuestros asesorados",
    tablaLead: "Lo que pagaron por todo el año, con las tasas de secretaría incluidas. Todos másteres oficiales.",
    dato: "Dato que casi nadie sabe: en la USC, si eres de fuera de la Unión Europea y te matriculas antes, te descuentan 400 € (curso 2026/27).",
    notaTabla: "Importes de las constancias y cartas de pago de cada universidad (cursos 2025/26 y 2026/27). Se muestra solo el nombre de pila. No incluyen visa, seguro ni gastos de vida, y los precios cambian cada curso.",
    enlaces: [
      { href: "/mapa-estudiar-en-espana", icono: "mapa", texto: "Mira el mapa de precios por ciudad" },
      { href: "/te-alcanza", icono: "euro", texto: "¿Te alcanza? Juega con seis ciudades" },
      { href: "/calculadora-master", icono: "grafico", texto: "Calcula tu presupuesto completo" },
    ],
  },

  ayuda: {
    titulo: "¿Beca o plan B? Lo vemos juntos",
    texto: "Soy Carina. Gané dos becas internacionales y sé lo que se siente esperar una respuesta. Cuéntame tu nota, tu carrera y tu presupuesto, y te digo con sinceridad a qué becas puedes postular y qué másteres económicos te convienen.",
    whatsapp: "Escríbeme por WhatsApp",
    sesion: "Reservar sesión",
    nota: "Inspira asesora y acompaña tu postulación. La beca y la admisión las decide cada entidad: no las garantizamos.",
  },
};
