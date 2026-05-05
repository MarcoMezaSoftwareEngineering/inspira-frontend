// src/constants/academico.js — Datos estáticos del dominio académico

export const AREAS_CARRERA = [
  { value: "Administración y Negocios", label: "Adm. y Negocios" },
  { value: "Derecho",                   label: "Derecho" },
  { value: "Ingeniería y Tecnología",   label: "Ingeniería / TI" },
  { value: "Ciencias Sociales",         label: "Ciencias Sociales" },
  { value: "Educación",                 label: "Educación" },
  { value: "Salud",                     label: "Salud" },
  { value: "Humanidades",               label: "Humanidades" },
  { value: "Medio Ambiente",            label: "Medio Ambiente / ODS" },
  { value: "Arte y Diseño",             label: "Arte y Diseño" },
  { value: "Otra",                      label: "Otra" },
];

// Comunidades autónomas españolas (fallback estático — se prefiere la API)
export const COMUNIDADES_FALLBACK = [
  "Andalucía", "Aragón", "Asturias", "Cantabria", "Castilla-La Mancha",
  "Castilla y León", "Cataluña", "Comunidad de Madrid", "Comunidad Valenciana",
  "Extremadura", "Galicia", "La Rioja", "Murcia", "Navarra", "País Vasco",
];

export const COMUNIDAD_INDIFERENTE = "Me da igual / No tengo preferencia";

// Universidades de origen más frecuentes (para autocomplete)
export const UNIS_SUGERENCIAS = [
  "Universidad Nacional Mayor de San Marcos", "Pontificia Universidad Católica del Perú",
  "Universidad de Lima", "Universidad Nacional de Ingeniería",
  "Universidad Peruana Cayetano Heredia", "Universidad Nacional Agraria La Molina",
  "Universidad del Pacífico", "Universidad ESAN",
  "Universidad Peruana de Ciencias Aplicadas", "Universidad César Vallejo",
  "Universidad Nacional Federico Villarreal", "Universidad Ricardo Palma",
  "Universidad San Ignacio de Loyola",
  "Universidad Nacional de Colombia", "Universidad de los Andes",
  "Universidad de Antioquia", "Pontificia Universidad Javeriana",
  "Universidad del Rosario", "Universidad del Valle", "Universidad Industrial de Santander",
  "Universidad Nacional Autónoma de México", "Instituto Politécnico Nacional",
  "Universidad de Guadalajara", "Universidad Autónoma de Nuevo León",
  "Benemérita Universidad Autónoma de Puebla", "Tecnológico de Monterrey",
  "Universidad de Buenos Aires", "Universidad Nacional de Córdoba",
  "Universidad Nacional de La Plata", "Universidad Nacional de Rosario",
  "Universidad de Chile", "Pontificia Universidad Católica de Chile",
  "Universidad Técnica Federico Santa María",
  "Universidade de São Paulo", "Universidade Federal do Rio de Janeiro",
  "Universidade Estadual de Campinas",
  "Universidad Central del Ecuador", "ESPOL – Escuela Politécnica del Litoral",
  "Universidad San Francisco de Quito",
  "Universidad Central de Venezuela", "Universidad del Zulia",
  "Universidad Mayor de San Andrés", "Universidad Nacional de Asunción",
  "Universidad de la República", "Universidad de Costa Rica",
  "Universidad de San Carlos de Guatemala", "Universidad Autónoma de Santo Domingo",
  "Universidade de Lisboa", "Universidade do Porto",
];

// Claves de universidades AUIP (para detectar convenio automáticamente)
export const AUIP_KEYS = [
  "universidad de lima", "universidad lima", "universidad nacional mayor de san marcos", "san marcos", "unmsm",
  "pontificia universidad católica del perú", "pucp", "católica del perú", "universidad nacional de ingeniería", "uni peru",
  "universidad peruana cayetano heredia", "cayetano heredia", "universidad nacional agraria la molina", "la molina",
  "universidad de buenos aires", "uba", "universidad nacional de córdoba", "unc argentina", "universidad nacional de la plata", "unlp",
  "universidad nacional de rosario", "universidad de chile", "pontificia universidad católica de chile", "puc chile",
  "universidad nacional de colombia", "unal", "universidad de antioquia", "universidad del valle", "univalle",
  "universidad industrial de santander", "uis", "universidad de los andes colombia", "universidad de costa rica", "ucr",
  "universidad central del ecuador", "espol", "politécnica del litoral", "universidad de cuenca",
  "universidad de san carlos", "usac", "universidad nacional autónoma de méxico", "unam",
  "instituto politécnico nacional", "ipn", "universidad de guadalajara", "udg", "universidad autónoma de nuevo León", "uanl",
  "benemérita universidad autónoma de puebla", "buap", "universidad de panamá", "universidad nacional de asunción", "una paraguay",
  "universidad autónoma de santo domingo", "uasd", "universidad de la república", "udelar",
  "universidad central de venezuela", "ucv", "universidad del zulia", "luz",
  "universidade de são paulo", "usp", "universidade federal do rio de janeiro", "ufrj", "universidade estadual de campinas", "unicamp",
  "universidade de lisboa", "universidade do porto",
];

// Pasos del formulario de datos académicos (para el wizard de 9 pasos)
export const STEPS_ACADEMICOS = [
  { label: "Carrera",       title: "Tu carrera universitaria",          icon: "🎓" },
  { label: "Universidad",   title: "Tu universidad y promedio",          icon: "🏛️" },
  { label: "Experiencia",   title: "Experiencia profesional",            icon: "💼" },
  { label: "Investigación", title: "Investigación y formación",          icon: "🔬" },
  { label: "Inglés",        title: "Certificación de inglés",            icon: "🗣️" },
  { label: "Idioma/Becas",  title: "Idioma del máster y becas",          icon: "💸" },
  { label: "Tipo máster",   title: "¿Qué tipo de máster?",              icon: "🎯" },
  { label: "Detalles",      title: "Duración, prácticas y presupuesto",  icon: "📋" },
  { label: "Final",         title: "Región y fechas",                   icon: "📍" },
];

export const PRESUPUESTO_MIN = 500;
export const PRESUPUESTO_MAX = 15000;
