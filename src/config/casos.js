// src/config/casos.js
// Casos de éxito REALES de la empresa, tomados de las fichas de admisión que
// publica en sus redes. Se usa solo el nombre de pila, como en el material
// original: no publicar apellidos ni documentos sin autorización escrita.
//
// Las cifras de CIFRAS son las declaradas por la empresa sobre el total de
// expedientes gestionados; las fichas de CASOS son la muestra pública.
// ⚠️ Claims publicitarios: la empresa debe poder sustanciar estas cifras
// ante INDECOPI (ver inspira-backend/docs/legal/09-claims-publicitarios.md).

export const CATEGORIAS_CASOS = [
  {
    id: "admitidos-master",
    titulo: "Admitidos a máster",
    icono: "birrete",
    cifra: "+2.000",
    descripcion:
      "Cartas de admisión conseguidas en universidades españolas públicas y privadas.",
  },
  {
    id: "visas-aprobadas",
    titulo: "Visas aprobadas",
    icono: "pasaporte",
    cifra: "+500",
    descripcion:
      "Visados de estudios resueltos favorablemente en consulados de España.",
  },
  {
    id: "extranjeria-aprobada",
    titulo: "Extranjería aprobada",
    icono: "bandera",
    cifra: "+350",
    descripcion:
      "Estancias, residencias, renovaciones y modificaciones resueltas favorablemente.",
  },
  {
    id: "apelaciones-ganadas",
    titulo: "Apelaciones ganadas",
    icono: "balanza",
    cifra: "+200",
    descripcion:
      "Recursos de reposición que revirtieron una denegación de visado.",
  },
];

export const CASOS = [
  {
    id: "isabella-valencia",
    categoria: "admitidos-master",
    nombre: "Isabella",
    destacado: "Doble plaza asegurada",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat Jaume I + Universitat de València",
    programa: "Máster en Marketing e Investigación de Mercados",
    origen: "Administración y Marketing · ESAN",
    costo: "4.800 € / año aprox.",
    anio: "2026",
    texto:
      "Admitida en dos universidades a la vez con el mismo máster: plaza confirmada en la Universitat Jaume I y admisión en la Universitat de València. Postular en paralelo es lo que convierte una sola apuesta en dos oportunidades.",
    porQue: [
      "Ciudad con alta tasa de empleabilidad y centro de innovación y negocios.",
      "Dos universidades en ranking mundial entre las mejores de España y Europa.",
      "Costo de vida medio-alto, con calidad de vida excelente.",
    ],
  },
  {
    id: "eunice-cantabria",
    categoria: "admitidos-master",
    nombre: "Eunice",
    destacado: "Plaza asegurada",
    ciudad: "Santander",
    comunidad: "Cantabria",
    universidad: "Universidad de Cantabria",
    programa: "Máster Universitario en Investigación en Ciencias Odontológicas",
    origen: "Odontología",
    costo: "1.600 € / año aprox.",
    anio: "2026",
    texto:
      "Admisión confirmada en una universidad pública de prestigio, con todo el trámite gestionado desde Lima. Cantabria es de las comunidades con menor costo de matrícula de España.",
    porQue: [
      "Una de las comunidades con menor costo de matrícula en universidades públicas.",
      "Costo de vida medio: entre 800 € y 1.000 € mensuales aproximadamente.",
      "Entorno seguro y tranquilo, ciudad estudiantil y acogedora.",
    ],
  },
  {
    id: "diego-valencia",
    categoria: "admitidos-master",
    nombre: "Diego",
    destacado: "Ganador Beca Bicentenario 2025",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat Politècnica de València",
    programa: "Máster en Planificación y Gestión en Ingeniería Civil",
    origen: "Ingeniería Civil",
    anio: "2025",
    texto:
      "Admitido en la Universitat Politècnica de València y ganador de la Beca Generación del Bicentenario 2025. Acompañamiento en las dos cosas a la vez: la postulación al máster y el expediente de la beca, que tienen calendarios y requisitos distintos.",
    porQue: [
      "Universidad politécnica con máster oficial y presencia en el ranking mundial.",
      "La beca del Estado peruano cubre el máster; la admisión hay que conseguirla aparte.",
      "Valencia combina oferta técnica, costo de vida medio y buena vida estudiantil.",
    ],
  },
  {
    id: "elisabet-valencia",
    categoria: "admitidos-master",
    nombre: "Elisabet",
    destacado: "Beca AUIP 2026: matrícula cubierta",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat de València",
    programa: "Máster Universitario en Dirección y Planificación del Turismo",
    origen: "Turismo",
    costo: "4.274 € de matrícula · pagó 33 €",
    anio: "2026",
    texto:
      "Con 22 años y la beca AUIP 2026: la carta de pago de la Universitat de València suma 4.274 € de matrícula y la exención de la beca descuenta 4.240,80 €, así que acabó pagando 33,21 € de tasas. La beca cubre además alojamiento, alimentación y una dotación de 2.500 €.",
    porQue: [
      "La matrícula de un máster oficial se puede cubrir entera con una beca.",
      "La AUIP convoca becas para másteres de universidades españolas cada año.",
      "La admisión al máster y la beca son dos expedientes distintos: hay que ganar los dos.",
    ],
  },
  {
    id: "elias-malaga",
    categoria: "admitidos-master",
    nombre: "Elías",
    destacado: "Plaza asegurada",
    ciudad: "Málaga",
    comunidad: "Andalucía",
    universidad: "Universidad de Málaga",
    programa: "Máster en Recursos Hídricos y Medio Ambiente",
    origen: "Ingeniería Civil",
    costo: "850 € / año",
    anio: "2026",
    texto:
      "Plaza adjudicada en primera preferencia dentro del Distrito Único Andaluz. Con 850 € de matrícula al año, es la prueba de que estudiar un máster oficial en España es más accesible de lo que se cree.",
    porQue: [
      "Andalucía tiene de los costos de matrícula más bajos en universidades públicas.",
      "Costo de vida entre 700 € y 900 € mensuales aproximadamente.",
      "Ciudad costera, clima agradable todo el año y amplia oferta académica.",
    ],
  },
];
