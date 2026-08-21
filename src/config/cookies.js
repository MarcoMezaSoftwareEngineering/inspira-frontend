// src/config/cookies.js
// ─────────────────────────────────────────────────────────────────────────────
// INVENTARIO REAL de cookies y almacenamiento local del sitio.
// Auditado sobre el código fuente (no es una plantilla genérica).
// Al añadir cualquier script, píxel o almacenamiento nuevo, DEBE registrarse
// aquí y en la Política de Cookies antes de desplegarlo a producción.
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIAS = {
  necesarias: {
    id: "necesarias",
    nombre: "Estrictamente necesarias",
    descripcion:
      "Imprescindibles para que el sitio funcione: iniciar sesión, mantener tu sesión abierta, procesar un pago y recordar tu decisión sobre cookies. No pueden desactivarse porque sin ellas el servicio no funciona.",
    obligatoria: true,
  },
  preferencias: {
    id: "preferencias",
    nombre: "Preferencias",
    descripcion:
      "Recuerdan elecciones que haces en el sitio (por ejemplo, el último paso completado en la calculadora) para no pedírtelas de nuevo.",
    obligatoria: false,
  },
  analitica: {
    id: "analitica",
    nombre: "Analítica y medición",
    descripcion:
      "Nos permiten medir de forma agregada cómo se usa el sitio para mejorarlo. Solo se activan si las aceptas.",
    obligatoria: false,
  },
  marketing: {
    id: "marketing",
    nombre: "Publicidad y remarketing",
    descripcion:
      "Permiten mostrarte publicidad de nuestros servicios en otras plataformas y medir su rendimiento. Solo se activan si las aceptas.",
    obligatoria: false,
  },
};

// Inventario detallado. `estado: "activo"` = presente hoy en producción.
// `estado: "no_usado"` = categoría declarada pero sin ninguna tecnología instalada.
export const INVENTARIO = [
  {
    categoria: "necesarias",
    estado: "activo",
    items: [
      {
        nombre: "connect.sid",
        tipo: "Cookie propia",
        titular: "Inspira Legal (api.inspira-legal.cloud)",
        finalidad:
          "Mantener la sesión del servidor durante el inicio de sesión con Google.",
        duracion: "Sesión (se borra al cerrar el navegador)",
      },
      {
        nombre: "token",
        tipo: "Local Storage",
        titular: "Inspira Legal",
        finalidad:
          "Guardar el identificador de sesión (JWT) que te mantiene autenticado en tu panel de cliente o en el backoffice.",
        duracion: "Hasta que cierras sesión o el token expira",
      },
      {
        nombre: "inspira_consent",
        tipo: "Local Storage",
        titular: "Inspira Legal",
        finalidad:
          "Guardar tu decisión sobre cookies (qué categorías aceptaste o rechazaste, la fecha y la versión de la política) para no volver a preguntarte y para poder acreditar tu elección.",
        duracion: "12 meses",
      },
      {
        nombre: "Cookies de Mercado Pago",
        tipo: "Cookie de tercero",
        titular: "Mercado Pago (MercadoPago Perú S.R.L. / MercadoLibre)",
        finalidad:
          "Procesar el pago y prevenir el fraude cuando reservas y pagas una cita. Solo se activan si inicias un pago.",
        duracion: "Según la política de Mercado Pago",
      },
    ],
  },
  {
    categoria: "preferencias",
    estado: "activo",
    items: [
      {
        nombre: "Almacenamiento de estado de la interfaz",
        tipo: "Local Storage",
        titular: "Inspira Legal",
        finalidad:
          "Recordar el estado de secciones desplegadas, filtros y pestañas dentro de tu panel para que no se reinicien al navegar.",
        duracion: "Hasta que borras los datos del navegador",
      },
    ],
  },
  {
    categoria: "analitica",
    estado: "no_usado",
    items: [],
  },
  {
    categoria: "marketing",
    estado: "no_usado",
    items: [],
  },
];

// Terceros que pueden recibir datos al usar funciones concretas del sitio.
export const TERCEROS_EN_PAGINA = [
  {
    nombre: "Google Fonts",
    finalidad: "Tipografías del sitio, servidas desde fonts.gstatic.com.",
    dato: "Dirección IP y datos técnicos del navegador al descargar la fuente.",
  },
  {
    nombre: "Calendly",
    finalidad:
      "Agendar una llamada de asesoría desde el resultado de la calculadora.",
    dato: "Nombre y correo, únicamente si haces clic en el botón de agendar.",
  },
  {
    nombre: "WhatsApp (Meta)",
    finalidad: "Continuar la conversación por WhatsApp si tú lo eliges.",
    dato: "El mensaje y tu número, únicamente si haces clic en el botón.",
  },
  {
    nombre: "Mercado Pago",
    finalidad: "Cobro de la reserva de cita y de los servicios contratados.",
    dato: "Datos de la transacción y de pago, gestionados por Mercado Pago.",
  },
];
