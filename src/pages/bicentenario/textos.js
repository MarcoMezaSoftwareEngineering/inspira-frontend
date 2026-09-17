// src/pages/bicentenario/textos.js
//
// Rótulos, iconos y datos de presentación de la página de la beca.
//
// 17/09/2026: al pasar de emojis a iconos propios hacía falta un sitio donde
// vivieran los mapas «id → nombre de icono». Van aquí y no en
// config/bicentenario2026.js porque eso es la fuente de los datos oficiales
// (cada uno con su artículo) y esto es solo cómo se pintan. Tampoco pueden ir
// en un archivo con componentes: Vite solo recarga en caliente los archivos que
// exportan componentes y nada más.
import { COMPARACION_2025, RUTA, comparacionLista } from "../../config/bicentenario2026";

export const SEO = {
  title: "Beca Generación del Bicentenario 2026: nuevas bases y simulador",
  description:
    "Solo 20 becas. Las nuevas bases de PRONABEC explicadas en claro, un simulador para saber si calificas y cuánto puntaje tendrías, la comparación con 2025 y otras becas para España y la Unión Europea.",
  path: RUTA,
  imagen: "/og/beca-generacion-bicentenario-2026.jpg",
};

/** ¿Hay datos verificados de 2025 para comparar? */
export const HAY_COMPARACION = comparacionLista(COMPARACION_2025);

export const SECCIONES = [
  { id: "en-60-segundos", icono: "rayo", txt: "Claves" },
  ...(HAY_COMPARACION ? [{ id: "antes-y-ahora", icono: "grafico", txt: "2025 vs 2026" }] : []),
  { id: "bases", icono: "portapapeles", txt: "Bases" },
  { id: "simulador", icono: "calculadora", txt: "Simulador" },
  { id: "aviso", icono: "campana", txt: "Aviso" },
  { id: "descubre", icono: "brujula", txt: "Otros caminos" },
  { id: "asesoria-becas", icono: "usuarios", txt: "Asesoría" },
  { id: "preguntas", icono: "pregunta", txt: "Preguntas" },
];

// ── Iconos por lista ────────────────────────────────────────────────────────
// Los requisitos y las claves traen su icono en config/bicentenario2026.js
// (campo `icono`). Aquí solo van los ids que el simulador añade y que no son
// requisitos de la lista publicada.
export const ICONO_REQ = {
  nacionalidad: "pasaporte",
  grado: "birrete",
  rendimiento: "medalla",
  carta: "sobre",
  inicio: "calendario",
  perfil: "libro",
  experiencia: "maletin",
  ingresos: "casa",
  percapita: "casa",
  sbs: "institucion",
  salud: "salud",
  declaraciones: "laptop",
  previa: "prohibido",
  impedimentos: "prohibido",
};

export const ICONO_INCLUYE = ["birrete", "documento", "microscopio", "avion", "casa", "bus", "salud", "carpeta"];
export const ICONO_NO_INCLUYE = ["maleta", "usuarios", "chat", "documento"];
export const ICONO_FASE = {
  postulacion: "lapiz",
  subsanacion: "herramienta",
  revision: "lupa",
  puntajes: "calculadora",
  resultados: "trofeo",
  aceptacion: "firma",
  becarios: "fiesta",
};
export const ICONO_FAQ = ["sobre", "globo", "calendario", "prohibido", "calculadora", "candado", "usuarios"];

/** Tipos de cambio de la tabla 2025 → 2026. */
export const TIPO_CAMBIO = {
  mas: { icono: "intercambio", txt: "Cambia", clase: "bg-accent/20 text-primary" },
  nuevo: { icono: "destello", txt: "Nuevo", clase: "bg-sky/40 text-primary" },
  menos: { icono: "tijeras", txt: "Se quita", clase: "bg-neutral-200 text-neutral-800" },
  igual: { icono: "igual", txt: "Igual", clase: "bg-green-100 text-green-900" },
};

/** Pasos del simulador. */
export const PASOS = [
  { txt: "Requisitos", icono: "portapapeles" },
  { txt: "Tu perfil", icono: "usuario" },
  { txt: "Tu universidad", icono: "institucion" },
  { txt: "Tu situación", icono: "billete" },
  { txt: "Resultado", icono: "diana" },
];

/** Reacción del resultado según el tramo de puntaje. */
export const ICONO_REACCION = { alto: "cohete", medio: "llama", bajo: "brote" };

/** Icono de cada consejo de mejora, por lo que dice su título. */
export function iconoMejora(titulo = "") {
  if (/RENACYT/.test(titulo)) return "microscopio";
  if (/beca/i.test(titulo)) return "birrete";
  if (/carta|licencia/i.test(titulo)) return "documento";
  return "globo";
}

/** Lo que incluye cualquier paquete de Inspira (bloque de asesoría). */
export const INCLUIDO_PAQUETES = [
  { icono: "lupa", txt: "Becas mapeadas según tu perfil" },
  { icono: "calendario", txt: "Seguimiento de becas por tu asesor" },
  { icono: "euro", txt: "Plan B con másteres económicos en España" },
];

/** Canales y niveles del formulario de aviso. */
export const CANALES_AVISO = [
  ["tiktok", "tiktok", "TikTok"],
  ["instagram", "instagram", "Instagram"],
  ["facebook", "facebook", "Facebook"],
  ["whatsapp", "whatsapp", "WhatsApp"],
  ["google", "lupa", "Google"],
  ["otro", "destello", "Otro"],
];
export const NIVELES_AVISO = [
  ["maestria", "birrete", "Maestría"],
  ["doctorado", "microscopio", "Doctorado"],
];
