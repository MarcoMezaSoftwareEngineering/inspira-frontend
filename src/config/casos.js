// src/config/casos.js
// Casos de éxito REALES de la empresa, tomados de las fichas de admisión que
// publica en sus redes. Se usa solo el nombre de pila, como en el material
// original: no publicar apellidos ni documentos sin autorización escrita.
//
// Las cifras de CIFRAS son las declaradas por la empresa sobre el total de
// expedientes gestionados; las fichas de CASOS son la muestra pública.
// ⚠️ Claims publicitarios: la empresa debe poder sustanciar estas cifras
// ante INDECOPI (ver inspira-backend/docs/legal/09-claims-publicitarios.md).
//
// FORMA DE UN CASO
// El destino principal (`ciudad`, `universidad`, `programa`) es donde el mapa
// planta el marcador: una persona, una estrella, aunque la hayan admitido en
// varias. Las demás admisiones van en `destinos`, que la ficha enseña como
// «también admitida en». Contar a la misma persona en tres ciudades inflaría
// el mapa y haría que la suma de marcadores no cuadrara con la gente real.
//
// Los campos narrativos (`destacado`, `costo`, `texto`, `porQue`) son
// OPCIONALES: las fichas se dibujan igual sin ellos. Un caso entra al mapa con
// lo que se sabe de cierto y se enriquece después; no se rellenan a ojo.
// `ciudad` tiene que coincidir con una ciudad de GET /api/mapa o el caso se
// descarta en silencio al cruzar los datos (pages/mapa/indice.js).

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
  // ── Con ficha completa ────────────────────────────────────────────────
  {
    id: "isabella-valencia",
    categoria: "admitidos-master",
    nombre: "Isabella",
    destacado: "Doble plaza asegurada",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat de València",
    programa: "Máster Universitario en Marketing e Investigación de Mercados",
    costo: "4.800 € / año aprox.",
    anio: "2026-2027",
    destinos: [
      { universidad: "Universitat de València", ciudad: "Valencia", programa: "Máster Universitario en Marketing e Investigación de Mercados" },
      { universidad: "Universitat Jaume I", ciudad: "Castellón", programa: "Máster Universitario en Marketing e Investigación de Mercados" },
    ],
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
    costo: "1.600 € / año aprox.",
    anio: "2026-2027",
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
    costo: "4.274 € de matrícula · pagó 33 €",
    anio: "2026-2027",
    destinos: [
      { universidad: "Universitat de València", ciudad: "Valencia", programa: "Máster Universitario en Dirección y Planificación del Turismo" },
      { universidad: "Universidad de A Coruña", ciudad: "A Coruña", programa: "Máster Universitario en Dirección y Administración de Empresas" },
    ],
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
    costo: "850 € / año",
    anio: "2026-2027",
    texto:
      "Plaza adjudicada en primera preferencia dentro del Distrito Único Andaluz. Con 850 € de matrícula al año, es la prueba de que estudiar un máster oficial en España es más accesible de lo que se cree.",
    porQue: [
      "Andalucía tiene de los costos de matrícula más bajos en universidades públicas.",
      "Costo de vida entre 700 € y 900 € mensuales aproximadamente.",
      "Ciudad costera, clima agradable todo el año y amplia oferta académica.",
    ],
  },

  // ── Promoción 2026-2027 ───────────────────────────────────────────────
  {
    id: "patricia-murcia",
    categoria: "admitidos-master",
    nombre: "Patricia",
    ciudad: "Murcia",
    comunidad: "Región de Murcia",
    universidad: "Universidad de Murcia",
    programa: "Máster en Gestión Hotelera",
    anio: "2026-2027",
  },
  {
    id: "bexy-santiago",
    categoria: "admitidos-master",
    nombre: "Bexy",
    ciudad: "Santiago de Compostela",
    comunidad: "Galicia",
    universidad: "Universidad de Santiago de Compostela",
    programa: "Máster en Derecho Empresarial Transnacional y de las Tecnologías Digitales",
    anio: "2026-2027",
    destinos: [
      { universidad: "Universidad de Santiago de Compostela", ciudad: "Santiago de Compostela", programa: "Máster en Derecho Empresarial Transnacional y de las Tecnologías Digitales" },
      { universidad: "Universidad de Cantabria", ciudad: "Santander", programa: "Máster Universitario en Derechos Humanos y Mecanismos de Protección Nacional e Internacional" },
    ],
  },
  {
    id: "renato-santiago",
    categoria: "admitidos-master",
    nombre: "Renato",
    ciudad: "Santiago de Compostela",
    comunidad: "Galicia",
    universidad: "Universidad de Santiago de Compostela",
    programa: "Máster en Derecho Empresarial Transnacional y de las Tecnologías Digitales",
    anio: "2026-2027",
    destinos: [
      { universidad: "Universidad de Santiago de Compostela", ciudad: "Santiago de Compostela", programa: "Máster en Derecho Empresarial Transnacional y de las Tecnologías Digitales" },
      { universidad: "Universidad de Córdoba", ciudad: "Córdoba", programa: "Máster Universitario en Derecho Digital" },
    ],
  },
  {
    id: "fernando-malaga",
    categoria: "admitidos-master",
    nombre: "Fernando",
    destacado: "Tres admisiones",
    ciudad: "Málaga",
    comunidad: "Andalucía",
    universidad: "Universidad de Málaga",
    programa: "Máster en Finanzas, Banca y Seguros",
    anio: "2026-2027",
    destinos: [
      { universidad: "Universidad de Málaga", ciudad: "Málaga", programa: "Máster en Finanzas, Banca y Seguros" },
      { universidad: "Universidad de Santiago de Compostela", ciudad: "Santiago de Compostela", programa: "Máster en Contabilidad, Gestión Financiera y Dirección" },
      { universidad: "Universidad de Valladolid", ciudad: "Valladolid", programa: "Máster en Contabilidad y Gestión Financiera" },
    ],
  },
  {
    id: "estrella-vigo",
    categoria: "admitidos-master",
    nombre: "Estrella",
    ciudad: "Vigo",
    comunidad: "Galicia",
    universidad: "Universidad de Vigo",
    programa: "Máster Universitario en Comunicación en Medios Sociales y Creación de Contenidos Digitales",
    anio: "2026-2027",
    destinos: [
      { universidad: "Universidad de Vigo", ciudad: "Vigo", programa: "Máster Universitario en Comunicación en Medios Sociales y Creación de Contenidos Digitales" },
      { universidad: "Universidad de Santiago de Compostela", ciudad: "Santiago de Compostela", programa: "Máster Universitario en Comunicación Multimedia" },
    ],
  },
  {
    id: "melani-coruna",
    categoria: "admitidos-master",
    nombre: "Melani",
    ciudad: "A Coruña",
    comunidad: "Galicia",
    universidad: "Universidad de A Coruña",
    programa: "Máster Universitario en Derecho Digital y de la Inteligencia Artificial",
    anio: "2026-2027",
  },
  {
    id: "patricia-valencia",
    categoria: "admitidos-master",
    nombre: "Patricia",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat de València",
    programa: "Máster Universitario en Dirección de Empresas (MBA)",
    anio: "2026-2027",
    destinos: [
      { universidad: "Universitat de València", ciudad: "Valencia", programa: "Máster Universitario en Dirección de Empresas (MBA)" },
      { universidad: "Universidad de A Coruña", ciudad: "A Coruña", programa: "Máster Universitario en Dirección Integrada de Proyectos – Sistemas de Información" },
    ],
  },
  {
    id: "claudia-valencia",
    categoria: "admitidos-master",
    nombre: "Claudia",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat de València",
    programa: "Máster Universitario en Dirección de Empresas (MBA)",
    anio: "2026-2027",
  },
  {
    id: "ana-valencia",
    categoria: "admitidos-master",
    nombre: "Ana",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat Politècnica de València",
    programa: "Máster Universitario en Diseño Arquitectónico de Interiores",
    anio: "2026-2027",
  },
  {
    id: "sandra-valencia",
    categoria: "admitidos-master",
    nombre: "Sandra",
    destacado: "Dos másteres admitidos",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat de València",
    programa: "Máster Universitario en Derecho de la Empresa: Asesoría Mercantil, Laboral y Fiscal",
    anio: "2026-2027",
    destinos: [
      { universidad: "Universitat de València", ciudad: "Valencia", programa: "Máster Universitario en Derecho de la Empresa: Asesoría Mercantil, Laboral y Fiscal" },
      { universidad: "Universitat de València", ciudad: "Valencia", programa: "Máster Universitario en Derecho, Empresa y Justicia" },
    ],
  },
  {
    id: "marly-cordoba",
    categoria: "admitidos-master",
    nombre: "Marly",
    ciudad: "Córdoba",
    comunidad: "Andalucía",
    universidad: "Universidad de Córdoba",
    programa: "Máster Universitario en Nutrición Humana",
    anio: "2026-2027",
  },
  {
    id: "karen-cordoba",
    categoria: "admitidos-master",
    nombre: "Karen",
    ciudad: "Córdoba",
    comunidad: "Andalucía",
    universidad: "Universidad de Córdoba",
    programa: "Máster Universitario en Transformación Digital del Sector Agroalimentario y Forestal (DIGITAL-AGRI)",
    anio: "2026-2027",
  },
  {
    id: "saul-coruna",
    categoria: "admitidos-master",
    nombre: "Saúl",
    ciudad: "A Coruña",
    comunidad: "Galicia",
    universidad: "Universidad de A Coruña",
    programa: "Máster de Formación Permanente en BIM (Building Information Modeling)",
    anio: "2026-2027",
  },
  {
    id: "michiel-valencia",
    categoria: "admitidos-master",
    nombre: "Michiel",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat Politècnica de València",
    programa: "Máster Universitario en Tecnología Energética para Desarrollo Sostenible",
    anio: "2026-2027",
  },
  {
    id: "anggela-valencia",
    categoria: "admitidos-master",
    nombre: "Anggela",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universidad Católica de Valencia",
    programa: "Máster Universitario en Dirección de Negocios en un Entorno Global",
    anio: "2026-2027",
  },
  {
    id: "javier-sevilla",
    categoria: "admitidos-master",
    nombre: "Javier",
    ciudad: "Sevilla",
    comunidad: "Andalucía",
    universidad: "Universidad Pablo de Olavide",
    programa: "Máster en Derechos Humanos, Interculturalidad y Desarrollo",
    anio: "2026-2027",
  },
  {
    id: "libte-valencia",
    categoria: "admitidos-master",
    nombre: "Libte",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat de València",
    programa: "Máster Universitario en Ciencias Odontológicas",
    anio: "2026-2027",
    destinos: [
      { universidad: "Universitat de València", ciudad: "Valencia", programa: "Máster Universitario en Ciencias Odontológicas" },
      { universidad: "Universidad de Alcalá", ciudad: "Alcalá de Henares", programa: "Máster en Investigación en Ciencias Sociosanitarias" },
    ],
  },
  {
    id: "cecilia-valencia",
    categoria: "admitidos-master",
    nombre: "Cecilia",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universitat de València",
    programa: "Máster Universitario en Educación Especial",
    anio: "2026-2027",
    destinos: [
      { universidad: "Universitat de València", ciudad: "Valencia", programa: "Máster Universitario en Educación Especial" },
      { universidad: "Universidad de Santiago de Compostela", ciudad: "Santiago de Compostela", programa: "Máster en Investigación en Educación, Diversidad Cultural y Desarrollo Comunitario" },
    ],
  },
  {
    id: "andrea-zaragoza",
    categoria: "admitidos-master",
    nombre: "Andrea",
    ciudad: "Zaragoza",
    comunidad: "Aragón",
    universidad: "Zaragoza Logistics Center · Universidad de Zaragoza",
    programa: "Máster de Formación Permanente en Dirección de Supply Chain (MDSC)",
    anio: "2026-2027",
  },
  {
    id: "gabriela-coruna",
    categoria: "admitidos-master",
    nombre: "Gabriela",
    ciudad: "A Coruña",
    comunidad: "Galicia",
    universidad: "Universidad de A Coruña",
    programa: "Máster Universitario en Banca y Finanzas",
    anio: "2026-2027",
  },
  {
    id: "marina-santiago",
    categoria: "admitidos-master",
    nombre: "Marina",
    ciudad: "Santiago de Compostela",
    comunidad: "Galicia",
    universidad: "Universidad de Santiago de Compostela",
    programa: "Máster Universitario en Salud Pública",
    anio: "2026-2027",
  },
  {
    id: "kelly-valencia",
    categoria: "admitidos-master",
    nombre: "Kelly",
    ciudad: "Valencia",
    comunidad: "Comunidad Valenciana",
    universidad: "Universidad Católica de Valencia",
    programa: "Máster Universitario en Dirección de Operaciones",
    anio: "2026-2027",
  },
  {
    id: "denisse-madrid",
    categoria: "admitidos-master",
    nombre: "Denisse",
    ciudad: "Madrid",
    comunidad: "Comunidad de Madrid",
    universidad: "Universidad Rey Juan Carlos",
    programa: "Máster Universitario en Alta Dirección",
    anio: "2026-2027",
  },
  {
    id: "john-alcala",
    categoria: "admitidos-master",
    nombre: "John",
    ciudad: "Alcalá de Henares",
    comunidad: "Comunidad de Madrid",
    universidad: "Universidad de Alcalá",
    programa: "Máster Universitario en Dirección de Empresas (MBA) / Business Administration",
    anio: "2026-2027",
  },
];
