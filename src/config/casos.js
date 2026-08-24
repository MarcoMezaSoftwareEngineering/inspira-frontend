// src/config/casos.js
// Casos de éxito. Cada entrada debe corresponder a un expediente REAL de la
// empresa; el detalle se publica de forma anonimizada (iniciales o solo país)
// salvo que el cliente autorice por escrito el uso de su nombre.
//
// ⚠️ Los contadores de `CATEGORIAS_CASOS` deben cuadrar con los expedientes
// registrados: son claims publicitarios sustanciables ante INDECOPI.

export const CATEGORIAS_CASOS = [
  {
    id: "admitidos-master",
    titulo: "Admitidos a máster",
    icono: "🎓",
    descripcion:
      "Cartas de admisión conseguidas en universidades españolas públicas y privadas.",
  },
  {
    id: "visas-aprobadas",
    titulo: "Visas aprobadas",
    icono: "🛂",
    descripcion:
      "Visados de estudios resueltos favorablemente en consulados de España.",
  },
  {
    id: "apelaciones-ganadas",
    titulo: "Apelaciones ganadas",
    icono: "⚖️",
    descripcion:
      "Recursos de reposición que revirtieron una denegación de visado.",
  },
  {
    id: "estancias-aprobadas",
    titulo: "Estancias aprobadas",
    icono: "🇪🇸",
    descripcion:
      "Estancias por estudios concedidas por Extranjería, presentadas de forma telemática.",
  },
  {
    id: "extranjeria-aprobada",
    titulo: "Extranjería aprobada",
    icono: "📄",
    descripcion:
      "Residencias, renovaciones, modificaciones y nacionalidades resueltas favorablemente.",
  },
];

// ⚠️ PENDIENTE: reemplazar por los casos reales de la empresa.
// Formato: { id, categoria (id de arriba), titulo, cliente, pais, programa,
//            texto, fecha }
export const CASOS = [];
