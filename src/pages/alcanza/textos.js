// src/pages/alcanza/textos.js
// Los textos de «¿Te alcanza?» (/te-alcanza).
//
// Registro: aquí sí se tutea y se habla corto, porque es la puerta que se
// abre desde un vídeo. Lo que no cambia, venga de donde venga: las cifras son
// reales y se dice de dónde salen. Un gancho que miente no es un gancho, es
// un problema.
export const ALCANZA = {
  seo: {
    title: "¿Te alcanza para estudiar un máster en España? | Inspira Legal",
    description:
      "Desliza y descubre en qué comunidades españolas te alcanza para el primer año de un máster oficial: matrícula más el dinero que te exigen para la visa. Gratis y con cifras reales.",
    path: "/te-alcanza",
    imagen: "/og/mapa-estudiar-en-espana.jpg",
  },

  etiqueta: "6 cartas · 30 segundos",
  titulo: "¿Te alcanza para estudiar en España?",
  lead: "Cada carta es una comunidad de verdad, con lo que cuesta su primer año. Desliza y te decimos dónde sí puedes.",
  cargando: "Preparando las cartas…",
  error: "No pudimos cargar las cifras.",
  errorEnlace: "Mira el mapa",

  si: "Me alcanza",
  no: "No me alcanza",
  pista: "Arrastra la carta o usa los botones",
  progreso: (n, total) => `Carta ${n} de ${total}`,

  carta: {
    rotulo: "Tu primer año costaría",
    matricula: "Matrícula del máster",
    porMes: (importe) => `≈ ${importe}/mes`,
    vida: "Vivir un año",
    habitacion: (importe) => `Habitación ≈ ${importe}/mes`,
    // Dos cosas que no se pueden confundir: el gasto de vida se paga; los
    // 7.200 € de la visa se demuestran y son iguales en toda España.
    nota: "Matrícula a la universidad y vida de verdad: piso, comida y transporte. Aparte, la visa te pide demostrar 7.200 € en tu cuenta.",
  },

  resultado: {
    rotulo: "Tu resultado",
    titulo: (n, total) => (n === 1 ? `Te alcanza para 1 de ${total} comunidades` : `Te alcanza para ${n} de ${total} comunidades`),
    texto: "Estas son, de la más barata a la más cara. Toca cualquiera para ver sus universidades y sus plazos.",
    ningunaTitulo: "Todavía no llegas, y conviene decirlo",
    ningunaTexto: (importe, donde) =>
      `La comunidad más económica, ${donde}, pide ${importe} para el primer año. No es un no: es la cifra con la que hay que trabajar. Con una beca la cosa cambia, y ahí sí podemos ayudarte.`,
    cerca: (n, nombres) => `Estás a un paso de ${n === 1 ? "otra" : `otras ${n}`}: ${nombres}.`,
    whatsapp: (n) =>
      n > 0
        ? `Hola, hice el test del mapa y me alcanza para ${n} comunidades. ¿Me ayudan a elegir?`
        : "Hola, hice el test del mapa y todavía no me alcanza. ¿Qué opciones de beca tengo?",
    botonWhatsapp: "Que me ayuden a elegir",
    botonMapa: "Ver el mapa completo",
    botonSesion: "Reservar sesión",
    otraVez: "Jugar otra vez",
  },

  descargo:
    "Cifras aproximadas del curso 2027/2028: matrícula habitual de un máster oficial en cada comunidad más el gasto de vivir un año en su ciudad más económica. Para el visado, además, tienes que demostrar 7.200 € al año (600 € al mes): eso no se gasta, se acredita. El paquete de Inspira se paga aparte.",
};
