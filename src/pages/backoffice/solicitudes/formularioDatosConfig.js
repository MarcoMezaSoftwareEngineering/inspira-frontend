// Configuración canónica de campos del formulario académico
// Sección → orden de aparición en el componente admin

const UBICACION = { tercio: "Tercio superior", quinto: "Quinto superior", decimo: "Décimo superior", ninguno: "No estuvo en ninguno" };
const INGLES    = { uni: "Cert. universitaria", intl: "Cert. internacional (IELTS/TOEFL…)", instituto: "Instituto (sin cert.)", sabe_sin_cert: "Sin certificar", no: "Sin inglés" };
const DURACION  = { "1": "Máx. 1 año", "1.5": "Máx. 1,5 años", "2": "Máx. 2 años", indiferente: "Me da igual" };
const PRACTICAS = { imprescindible: "Imprescindible", deseable: "Deseable", no_importante: "No es criterio" };
const MODALIDAD = { presencial: "Presencial", semipresencial: "Semipresencial", online: "Online", indiferente: "Me da igual" };
const INICIO    = { sep_2025: "Sep 2025", ene_2026: "Ene 2026", sep_2026: "Sep 2026", ene_2027: "Ene 2027", flexible: "Flexible / No sé" };

export const FIELD_CONFIG = {
  // ── Perfil académico ─────────────────────────────────────────────────
  carrera_titulo:              { label: "Carrera / título",             section: "Perfil académico" },
  area_carrera:                { label: "Área de la carrera",           section: "Perfil académico" },
  universidad_origen:          { label: "Universidad de origen",        section: "Perfil académico" },
  es_auip:                     { label: "Afiliada a AUIP",              section: "Perfil académico",
                                 format: (v) => ({ si: "Sí", no: "No" }[v] || v) },
  promedio_peru:               { label: "Promedio (conv. España)",       section: "Perfil académico",
                                 format: (v, extra) => {
                                   const nota  = parseFloat(v);
                                   if (isNaN(nota)) return v;
                                   const escala = extra?.escala || "20";
                                   const max    = { "20": 20, "10": 10, "5": 5, "4": 4, "100": 100 }[escala] || 20;
                                   const esp    = ((nota / max) * 10).toFixed(2).replace(".", ",");
                                   return `${esp} / 10`;
                                 } },
  ubicacion_grupo:             { label: "Posición académica",           section: "Perfil académico",
                                 format: (v) => UBICACION[v] || v },
  otra_maestria_tiene:         { label: "Tiene otra maestría",          section: "Perfil académico" },
  otra_maestria_detalle:       { label: "Detalle maestría",             section: "Perfil académico", fullWidth: true },

  // ── Experiencia profesional ──────────────────────────────────────────
  experiencia_anios:           { label: "Años de experiencia",          section: "Experiencia profesional" },
  experiencia_vinculada:       { label: "Vinculada al área del máster", section: "Experiencia profesional",
                                 format: (v) => ({ si: "Sí, directamente", parcial: "Parcialmente", no: "No directamente" }[v] || v) },
  experiencia_vinculada_detalle: { label: "Descripción de la experiencia", section: "Experiencia profesional", fullWidth: true },

  // ── Investigación y formación ────────────────────────────────────────
  investigacion_experiencia:   { label: "Experiencia en investigación", section: "Investigación y formación" },
  investigacion_detalle:       { label: "Publicaciones / grupos",       section: "Investigación y formación", fullWidth: true },
  formacion_diplomados:        { label: "Diplomados / cursos",          section: "Investigación y formación" },
  formacion_encuentros:        { label: "Encuentros / congresos",       section: "Investigación y formación" },
  formacion_otros:             { label: "Otras certificaciones",        section: "Investigación y formación" },
  formacion_otros_detalle:     { label: "Detalle otras formaciones",    section: "Investigación y formación", fullWidth: true },
  formacion_ninguna:           { label: "Sin formación complementaria", section: "Investigación y formación" },

  // ── Idiomas ──────────────────────────────────────────────────────────
  ingles_situacion:            { label: "Situación inglés",             section: "Idiomas",
                                 format: (v) => INGLES[v] || v },
  ingles_uni_nivel:            { label: "Nivel cert. universitaria",    section: "Idiomas" },
  ingles_intl_tipo:            { label: "Tipo cert. internacional",     section: "Idiomas" },
  ingles_intl_puntaje:         { label: "Puntaje / nivel",             section: "Idiomas" },
  idioma_master_es:            { label: "Acepta máster en español",     section: "Idiomas" },
  idioma_master_bilingue:      { label: "Acepta máster bilingüe",       section: "Idiomas" },
  idioma_master_ingles:        { label: "Acepta máster en inglés",      section: "Idiomas" },

  // ── Becas ─────────────────────────────────────────────────────────────
  beca_desea:                  { label: "Desea beca / ayuda",           section: "Becas" },
  beca_completa:               { label: "Becas completas",              section: "Becas" },
  beca_parcial:                { label: "Becas parciales / descuentos", section: "Becas" },
  beca_ayuda_uni:              { label: "Ayudas de la universidad",      section: "Becas" },
  beca_auip:                   { label: "Becas AUIP",                   section: "Becas" },

  // ── Preferencias del máster ──────────────────────────────────────────
  masteres_deseados:           { label: "Máster que busca",             section: "Preferencias del máster", fullWidth: true,
                                 format: (v) => Array.isArray(v) ? v.filter(Boolean).join(" · ") : v },
  especializaciones:           { label: "Especialización",              section: "Preferencias del máster",
                                 format: (v) => Array.isArray(v) ? v.filter(Boolean).join(" · ") : v },
  area_interes_master:         { label: "Rama del máster",              section: "Preferencias del máster" },
  sub_area_interes:            { label: "Sub-área de interés",          section: "Preferencias del máster" },
  duracion_preferida:          { label: "Duración",                     section: "Preferencias del máster",
                                 format: (v) => DURACION[v] || v },
  practicas_preferencia:       { label: "Prácticas",                    section: "Preferencias del máster",
                                 format: (v) => PRACTICAS[v] || v },
  modalidad_preferida:         { label: "Modalidad",                    section: "Preferencias del máster",
                                 format: (v) => MODALIDAD[v] || v },
  presupuesto_hasta:           { label: "Presupuesto hasta",            section: "Preferencias del máster",
                                 format: (v) => v ? `${Number(v).toLocaleString("es-ES")} €/año` : v },
  comunidades_preferidas:      { label: "Comunidades preferidas",       section: "Preferencias del máster",
                                 format: (v) => Array.isArray(v) ? v.join(" · ") : v },
  inicio_previsto:             { label: "Inicio previsto",              section: "Preferencias del máster",
                                 format: (v) => INICIO[v] || v },

  // ── Comentario especial ───────────────────────────────────────────────
  comentario_especial:         { label: "Comentario para IA / asesores", section: "Comentario especial", fullWidth: true },
};

export const SECTIONS_ORDER = [
  "Perfil académico",
  "Experiencia profesional",
  "Investigación y formación",
  "Idiomas",
  "Becas",
  "Preferencias del máster",
  "Comentario especial",
  "Otros datos",
];
