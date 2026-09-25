// src/pages/alcanza/textos.js
// Textos del juego de cartas (/te-alcanza). Sin importes escritos: todos
// llegan de GET /api/mapa y del censo de másteres.
//
// Registro: aquí sí se tutea y se habla corto, porque es la puerta que se
// abre desde un vídeo. Lo que no cambia, venga de donde venga: las cifras son
// reales y se dice de dónde salen. Un gancho que miente no es un gancho, es
// un problema.
//
// Rediseño del 24/09/2026: de calculadora a gancho. Antes cada carta era una
// comunidad con su gasto anual y se deslizaba «me alcanza / no me alcanza».
// El total asustaba antes de tiempo. Ahora cada carta es una ciudad: lo que la
// hace distinta, sus universidades, UN máster de ejemplo con su matrícula, y
// cuántos más hay. Se desliza «me interesa / siguiente» y al final se llevan
// sus ciudades y una puerta para hablar. Que se queden con ganas de más.

export const ALCANZA = {
  seo: {
    title: "¿Dónde estudiar en España? Seis ciudades en 30 segundos | Inspira Legal",
    description:
      "Seis cartas, seis ciudades españolas: sus universidades, un máster de ejemplo con lo que cuesta la matrícula y cuántos más hay. Desliza y quédate con las que te llamen. Gratis y sin registro.",
    path: "/te-alcanza",
    imagen: "/og/te-alcanza.jpg",
  },

  etiqueta: "6 ciudades · 30 segundos",
  titulo: "¿Dónde te ves estudiando en España?",
  lead: "Cada carta es una ciudad de verdad: sus universidades, un máster de ejemplo y lo que cuesta. Desliza y quédate con las que te llamen.",

  cargando: "Buscando ciudades…",
  error: "No pudimos cargar las cifras.",
  errorEnlace: "Mira el mapa",

  progreso: (n, total) => `Ciudad ${n} de ${total}`,
  si: "Me interesa",
  no: "Siguiente",
  pista: "Arrastra la carta o usa los botones",

  carta: {
    masteres: (n) => (n === 1 ? "1 máster oficial" : `${n} másteres oficiales`),
    universidades: (n) => (n === 1 ? "universidad" : "universidades"),
    ejemplo: "Por ejemplo",
    matricula: "de matrícula al año",
    yMas: (n) => (n <= 0 ? "" : n === 1 ? "…y 1 máster más" : `…y ${n} másteres más`),
    vivir: (importe) => `Vivir ≈ ${importe}/mes`,
    ranking: (pos) => `QS ${pos}`,
    // Lo que no se puede confundir: es la matrícula de la universidad pública
    // para un año de máster oficial, no el coste total de irse.
    nota: "Matrícula de máster oficial en universidad pública, curso 2026-27. Aparte va vivir, y la visa pide demostrar 7.200 € en tu cuenta.",
  },

  resultado: {
    rotulo: "Tus ciudades",
    titulo: (n) => (n === 1 ? "Te quedaste con 1 ciudad" : `Te quedaste con ${n} ciudades`),
    texto: "Toca cualquiera para verla en el mapa, con todos sus másteres y plazos. O cuéntanos cuál te llama y te decimos cómo se entra.",
    ningunaTitulo: "Ninguna te convenció, y está bien",
    ningunaTexto: (total) => `Solo viste seis. Hay ${total} ciudades con universidad en el mapa: alguna es la tuya.`,
    verMapa: "Ver el mapa completo",
    whatsapp: "Cuéntame cuál te llama",
    whatsappDetalle: (nombres) =>
      nombres.length ? `Jugué a las cartas y me interesan: ${nombres.join(", ")}. ¿Cómo se entra?` : "Jugué a las cartas y quiero saber más.",
    sesion: "Reservar sesión",
    otraVez: "Jugar otra vez",
  },

  descargo:
    "Cifras aproximadas del curso 2026-27: matrícula de un año de máster oficial según las normas de precios públicos de cada comunidad (o el precio típico de la universidad donde la comunidad no fija uno) y el registro oficial de másteres (RUCT). Cada universidad fija su matrícula exacta. El paquete de Inspira se paga aparte.",
};
