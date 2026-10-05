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
  { id: "publico", texto: "Soy empleado público" },
];

export const MESES = [
  { id: "ene-feb", titulo: "Enero y febrero", lema: "Las primeras en cerrar" },
  { id: "mar", titulo: "Marzo", lema: "Las más buscadas" },
  { id: "abr", titulo: "Abril", lema: "El mes más cargado" },
  { id: "jun-jul", titulo: "Junio y julio", lema: "Las últimas" },
];

export const BECAS = [
  {
    id: "jaen", mes: "ene-feb", sigla: "UJA", red: null, exacta: true, dia: "15", cuando: "feb",
    nombre: "U. de Jaén · Atracción del Talento",
    cubre: "Matrícula completa + 3.190 € al año",
    clave: "Nota media mínima de 8 sobre 10.",
    etiquetas: ["completa", "sin-auip"],
    url: "https://cep.ujaen.es/",
  },
  {
    id: "maec", mes: "ene-feb", sigla: "MAEC-AECID", red: null, exacta: false, dia: "2 sem.", cuando: "ene–feb",
    nombre: "MAEC-AECID · Programa Máster",
    cubre: "1.900 € al mes + seguro, durante diez meses",
    clave: "Solo para empleados públicos fijos. El plazo dura unas dos semanas.",
    etiquetas: ["completa", "sin-auip", "nota-libre", "publico"],
    url: "https://www.aecid.es",
  },
  {
    id: "erasmus", mes: "ene-feb", sigla: "UE", red: null, exacta: false, dia: "Enero", cuando: "muchos",
    nombre: "Erasmus Mundus · Másteres conjuntos",
    cubre: "Matrícula + hasta 1.400 € al mes + vuelo + seguro",
    clave: "Pide inglés (IELTS 6,5 o TOEFL 90) y se postula en la web de cada máster.",
    etiquetas: ["completa", "sin-auip", "nota-libre"],
    url: "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters",
  },
  {
    id: "carolina", mes: "mar", sigla: "Fundación Carolina", red: null, exacta: false, dia: "Marzo", cuando: "abre en ene",
    nombre: "Fundación Carolina · Becas de posgrado",
    cubre: "Matrícula + unos 1.200 € al mes + vuelo + seguro",
    clave: "La más completa y la más peleada. Valoran mucho tu proyecto y tu vínculo con el sector público o social.",
    etiquetas: ["completa", "sin-auip", "nota-libre"],
    url: "https://www.fundacioncarolina.es/",
  },
  {
    id: "usc", mes: "mar", sigla: "USC", red: "AUIP", exacta: true, dia: "20", cuando: "mar",
    nombre: "U. de Santiago de Compostela",
    cubre: "Hasta 5.000 €",
    clave: "Nota mayor de 8 y un B2 en un idioma distinto al tuyo.",
    etiquetas: ["completa"],
    url: "https://auip.org/es/becas-auip/3028-becas-auip324",
  },
  {
    id: "usal", mes: "mar", sigla: "USAL", red: null, exacta: false, dia: "2 sem.", cuando: "mar–abr",
    nombre: "U. de Salamanca · Becas internacionales de máster",
    cubre: "Matrícula + alojamiento + manutención + seguro",
    clave: "Abre y cierra en unas dos semanas. Hay que estar pendiente desde enero.",
    etiquetas: ["completa", "sin-auip", "nota-libre"],
    url: "https://rel-int.usal.es",
  },
  {
    id: "lorca", mes: "abr", sigla: "Andalucía", red: "AUIP", exacta: true, dia: "8", cuando: "abr",
    nombre: "Becas Federico García Lorca",
    cubre: "Matrícula + alojamiento y manutención",
    clave: "56 becas en las universidades andaluzas. Nota media desde 7,5.",
    etiquetas: ["completa", "nota-libre"],
    url: "https://auip.org/es/becas-federico-garcia-lorca",
  },
  {
    id: "upna", mes: "abr", sigla: "UPNA", red: "AUIP", exacta: true, dia: "23", cuando: "abr",
    nombre: "U. Pública de Navarra",
    cubre: "8.000 € para matrícula, alojamiento y manutención",
    clave: "Muy pocas plazas (unas 3). Nota mínima de 8.",
    etiquetas: ["completa"],
    url: "https://auip.org/es/becas-auip/3058-becas-auip331",
  },
  {
    id: "uv", mes: "abr", sigla: "UV", red: "AUIP", exacta: true, dia: "24", cuando: "abr",
    nombre: "Universitat de València",
    cubre: "Matrícula + 2.500 € + alojamiento en colegio mayor",
    clave: "Nota mínima de 8. Ocho becas nuevas.",
    etiquetas: ["completa"],
    url: "https://auip.org/es/becas-auip/3032-becas-auip326",
  },
  {
    id: "uc3m", mes: "abr", sigla: "UC3M", red: "AUIP", exacta: true, dia: "30", cuando: "abr",
    nombre: "U. Carlos III de Madrid",
    cubre: "Matrícula + 1.500 €",
    clave: "15 ayudas. Antes hay que pedir la admisión y pagar la tasa de acceso.",
    etiquetas: ["completa", "nota-libre"],
    url: "https://www.uc3m.es/becas-ayudas",
  },
  {
    id: "urjc", mes: "abr", sigla: "URJC", red: "AUIP", exacta: true, dia: "30", cuando: "abr",
    nombre: "U. Rey Juan Carlos",
    cubre: "Hasta 5.077 € en matrícula",
    clave: "No sale todos los años: en 2025 no hubo convocatoria.",
    etiquetas: ["nota-libre"],
    url: "https://auip.org/es/becas-auip/3038-becas-auip327",
  },
  {
    id: "upv", mes: "abr", sigla: "UPV", red: "AUIP", exacta: true, dia: "30", cuando: "abr",
    nombre: "Universitat Politècnica de València",
    cubre: "Matrícula + 750 € de bolsa de viaje",
    clave: "33 ayudas. Tienes que haberte preinscrito antes en el máster.",
    etiquetas: ["sin-auip", "nota-libre"],
    url: "https://auip.org/es/becas-auip/3030-becas-auip325",
  },
  {
    id: "ule", mes: "abr", sigla: "ULE", red: null, exacta: true, dia: "30", cuando: "abr",
    nombre: "TalentUnileón · U. de León",
    cubre: "Matrícula + 1.800 € para seguro y viaje",
    clave: "Nota mínima de 8. No exige ser de la AUIP ni de ninguna red.",
    etiquetas: ["completa", "sin-auip"],
    url: "https://www.unileon.es/internacional/estudiantes/estudiantes-internacionales/becas-talentunileon",
  },
  {
    id: "uah", mes: "jun-jul", sigla: "UAH", red: "AUIP", exacta: true, dia: "19", cuando: "jun",
    nombre: "U. de Alcalá · Miguel de Cervantes",
    cubre: "Matrícula + 1.300 € de alojamiento",
    clave: "20 becas. Pide preinscripción y 250 € de reserva de plaza.",
    etiquetas: ["completa", "nota-libre"],
    url: "https://auip.org/es/becas-auip/3040-becas-auip328",
  },
  {
    id: "ucm", mes: "jun-jul", sigla: "UCM", red: "AUIP", exacta: false, dia: "2 sem.", cuando: "julio",
    nombre: "U. Complutense de Madrid",
    cubre: "El 50, 75 o 100 % de la matrícula, según tu puntaje",
    clave: "Hasta 10 becas y un plazo de unas dos semanas.",
    etiquetas: ["nota-libre"],
    url: "https://www.ucm.es/becas-ayudas",
  },
  {
    id: "luis-vives", mes: "jun-jul", sigla: "UV", red: null, exacta: false, dia: "Por salir", cuando: "fecha",
    nombre: "Becas Luis Vives · Universitat de València",
    cubre: "Beca completa: matrícula, vuelo, alojamiento, comida y seguro",
    clave: "Nota mínima de 9 y situación económica desfavorable. Perú está entre los 11 países.",
    etiquetas: ["completa", "sin-auip"],
    url: "https://www.uv.es/uvcooperation",
  },
];

// Segunda opción: matrícula de un máster oficial de 60 créditos para un
// estudiante de fuera de la UE, curso 2026/27. Sale de cat_master (mínimo por
// universidad, consultado el 05/10/2026).
export const ECONOMICOS = [
  { lugar: "Galicia", unis: "Santiago, Vigo y A Coruña", precio: 738.6, cuantos: 152 },
  { lugar: "Castilla-La Mancha", unis: "Toledo, Cuenca, Albacete y Ciudad Real", precio: 798.6, cuantos: 56 },
  { lugar: "Andalucía", unis: "Granada, Sevilla, Málaga, Córdoba y seis más", precio: 820.8, cuantos: 588 },
  { lugar: "Castilla y León", unis: "Salamanca, Valladolid, León y Burgos", precio: 840, cuantos: 182 },
];

// El caso de Luzmar lo dio Carina el 05/10/2026 (570 € en la USC).
// ⚠️ Por confirmar con ella: el máster, el curso y que Luzmar autoriza su
// nombre. El catálogo da 738,60 € para la USC en 2026/27.
export const PLAN_B = {
  desde: 570,
  caso: {
    nombre: "Luzmar",
    universidad: "Universidade de Santiago de Compostela",
    ciudad: "Santiago de Compostela, Galicia",
    matricula: 570,
  },
};

export const BECAS2027 = {
  seo: {
    title: "Becas para estudiar un máster en España 2027: calendario y requisitos",
    description:
      "Las 16 becas para tu máster en España, mes a mes: cuándo cerraron en 2026, qué cubre cada una y qué piden. Y si la beca no sale, másteres oficiales desde 570 €.",
    path: "/becas-espana-2027",
    imagen: "/og/becas-espana-2027.jpg",
  },
  retrato: `${MEDIA}/foto/carina-retrato.jpg`,
  tiktok: TITULAR.tiktok || TITULAR.redes?.tiktok || null,

  hero: {
    rotulo: "Becas · Máster en España 2027",
    titulo: "Las becas para tu máster en España,",
    tituloSol: "con fecha y todo",
    lead: "16 becas, mes a mes: cuándo cerró cada una en 2026, qué cubre y qué te pide. Para que en 2027 no llegues tarde.",
    sellos: ["16 becas", "Día exacto de cierre", "Web oficial de cada una"],
    cta: "Ver el calendario",
    ctaWa: "¿A cuál puedo postular?",
  },

  calendario: {
    titulo: "El calendario, mes a mes",
    lead: "Filtra por lo que va contigo y toca una beca para ver qué pide.",
    vacio: "Ninguna beca cumple ese filtro. Prueba con otro.",
    cubre: "Cubre",
    web: "Ver la web oficial",
    cerro: "cerró el",
    aviso: "Fechas y condiciones de la convocatoria 2026 (curso 2026-27). Las de 2027 las publica cada entidad y pueden cambiar: confírmalas siempre en su web oficial.",
  },

  verdad: {
    rotulo: "Te lo digo de frente",
    titulo: "Una beca depende de tu perfil",
    lead: "No basta con postular a tiempo. Antes de ilusionarte, mira si cumples esto:",
    puntos: [
      { icono: "grafico", titulo: "Tu nota", texto: "La mayoría pide una nota media de 8 sobre 10 o más. La Luis Vives pide 9." },
      { icono: "escudo", titulo: "Tu universidad", texto: "Las becas AUIP suelen exigir que tu universidad de origen esté asociada a esa red." },
      { icono: "usuarios", titulo: "Las plazas", texto: "Son pocas: unas 3 en Navarra, hasta 10 en la Complutense, 15 en la Carlos III. Y postula toda Latinoamérica." },
      { icono: "ubicacion", titulo: "Dónde vives", texto: "Casi todas piden que no residas en España cuando postulas." },
    ],
    cierre: "Si cumples, vamos con todo por la beca. Y si no cumples, no pasa nada: hay otro camino.",
  },

  planB: {
    rotulo: "Sin beca también se puede",
    titulo: "Un máster oficial en España",
    tituloSol: "desde 570 €",
    lead: "En la universidad pública española hay másteres oficiales que cuestan menos que muchos diplomados aquí. No necesitas ganar nada: solo postular bien.",
    casoRotulo: "Un caso real",
    casoTexto: "pagó de matrícula por su máster oficial en la",
    casoPie: "Sin beca. Con un máster bien elegido.",
    tablaTitulo: "Lo que cuesta la matrícula de un año",
    tablaLead: "Máster oficial de 60 créditos, para estudiantes de fuera de la Unión Europea. Tarifas del curso 2026/27.",
    masteres: "másteres",
    notaTabla: "Precio mínimo de matrícula por comunidad según nuestro catálogo. Cada máster puede costar más; no incluye tasas administrativas, visa ni gastos de vida.",
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
