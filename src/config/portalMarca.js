// src/config/portalMarca.js
// Nombre comercial del portal del asesorado (decisión del cliente, 11/09/2026).
// Toda la web pública lo lee de aquí (páginas, sello de servicios, pie,
// cabecera, SEO) y scripts/rutas-compartir.mjs lo importa para las vistas
// previas al compartir. La imagen de compartir (scripts/og-compartir.py) lleva
// el nombre horneado: al cambiarlo, edita NOMBRE_OG allí y vuelve a generarla.
//
// Este archivo no debe importar nada: lo lee también Node sin Vite.

/** Nombre completo: «tu Expediente Digital Inspira». */
export const NOMBRE_PORTAL = "Expediente Digital Inspira";

/** Forma corta: «Mi Expediente Digital», «Conoce el Expediente Digital». */
export const NOMBRE_CORTO = "Expediente Digital";

/** Lema. */
export const LEMA = "No tienes una carpeta. Tienes un expediente.";

/** Frase de apoyo (dos oraciones: la portada las pinta en dos líneas). */
export const FRASE_APOYO = ["Tu caso no vive en un chat.", "Vive en tu expediente."];

/** Subtítulo de /plataforma. Nunca «la primera». */
export const SUBTITULO = "La nueva generación de asesoría educativa y migratoria";

/**
 * Etiquetas de la cabecera. «Expediente digital» empuja «Agenda tu asesoría»
 * fuera de la barra a 1100 px; «Tu expediente» cabe (medido el 11/09/2026).
 * Entre 1024 y 1060 px la barra ya desbordaba antes, con «Nuestro sistema».
 */
export const MENU_ETIQUETA = "Tu expediente";

/**
 * Botón de entrar. «Mi expediente» tapa «Agenda tu asesoría» en todos los
 * anchos de escritorio (31 px a 1440); «Entrar» ocupa lo mismo que el antiguo
 * «Iniciar» y cabe desde 1280 px. En la cabecera de escritorio (lg y más) va
 * el corto; en móvil, en el cajón y en el menú de usuario, el largo.
 */
export const BOTON_ENTRAR = "Mi expediente";
export const BOTON_ENTRAR_CORTO = "Entrar";
