// src/config/legal.js
// ─────────────────────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE VERDAD de los datos legales del titular del sitio.
// Todo el footer, las políticas, el banner de cookies y el Libro de
// Reclamaciones leen de aquí. Si cambia un dato, se cambia SOLO en este archivo.
//
// ⚠️ Los valores marcados con "COMPLETAR" deben rellenarse antes de publicar.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * true si el valor sigue siendo un placeholder sin completar.
 * El footer y las páginas públicas usan esto para OCULTAR el campo en vez de
 * mostrar el texto "COMPLETAR:..." a los visitantes.
 */
export const pendiente = (v) => typeof v === "string" && v.startsWith("COMPLETAR");

export const TITULAR = {
  razonSocial: "PROYECTA PRODUCCIONES GROUP S.A.C.",
  nombreComercial: "Inspira Legal",
  ruc: "20610501941",
  // Domicilio fiscal declarado en SUNAT (obligatorio: deber de información al consumidor)
  domicilioFiscal:
    "Av. Dos de Mayo N.° 1545, Oficina 204, San Isidro, Lima, Perú",
  pais: "Perú",
  // Representante legal / responsable del sitio
  representanteLegal: "COMPLETAR: Nombres y apellidos del representante legal",
  // Canales oficiales de contacto
  emailContacto: "administracion@inspira-legal.cloud",
  // Canal único de contacto (también para protección de datos): la empresa
  // decidió no crear un buzón separado, así que todo llega a administración.
  emailDatosPersonales: "administracion@inspira-legal.cloud",
  telefono: "+51 908 945 354",
  whatsapp: "+51 908 945 354",
  web: "https://inspira-legal.cloud",
};

// Responsable interno de protección de datos (ODP o punto de contacto equivalente)
export const RESPONSABLE_DATOS = {
  designado: false, // cambiar a true cuando se formalice la designación
  nombre: "COMPLETAR: Nombres y apellidos",
  cargo: "Punto de contacto en materia de protección de datos personales",
  email: "administracion@inspira-legal.cloud",
};

// Versionado de documentos legales: cualquier cambio sustancial sube la versión
// y la fecha. La versión se guarda junto a cada consentimiento como prueba.
// ⚠️ Subir `cookies.version` invalida el consentimiento de cookies de TODOS los
// visitantes y les vuelve a mostrar el banner (lo comprueba `lib/consent.js`).
// Hacerlo solo cuando cambien de verdad las tecnologías del inventario, no por
// una corrección de redacción.
export const VERSIONES = {
  // 1.1 (27/08/2026): se aclara el tratamiento de datos de menores en el Libro
  // de Reclamaciones, que la normativa de consumo obliga a recoger.
  privacidad: { version: "1.1", fecha: "2026-08-27" },
  cookies: { version: "1.0", fecha: "2026-08-21" },
  // 1.1 (27/08/2026): precio total sin excepciones (art. 5.2 Ley 29571), la
  // limitación de responsabilidad deja fuera el dolo y la culpa inexcusable, y
  // el consumidor conserva el fuero de su propio domicilio.
  terminos: { version: "1.1", fecha: "2026-08-27" },
};

// Plazos legales aplicables (Ley N.° 29733 y su Reglamento)
export const PLAZOS = {
  acceso: "20 días hábiles",
  rectificacionCancelacionOposicion: "10 días hábiles",
  reclamoConsumidor: "15 días hábiles",
};

export const RUTAS_LEGALES = {
  privacidad: "/legal/privacidad",
  cookies: "/legal/cookies",
  terminos: "/legal/terminos",
  derechos: "/legal/derechos",
  reclamaciones: "/libro-de-reclamaciones",
};

// Autoridad de control
export const AUTORIDAD = {
  nombre:
    "Autoridad Nacional de Protección de Datos Personales (Ministerio de Justicia y Derechos Humanos)",
  web: "https://www.gob.pe/minjus",
  consumidor: "INDECOPI",
  consumidorWeb: "https://www.indecopi.gob.pe",
};
