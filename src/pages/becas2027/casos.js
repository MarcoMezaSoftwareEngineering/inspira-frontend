// src/pages/becas2027/casos.js
//
// Casos reales para /becas-espana-2027. Solo nombre de pila, como en
// config/casos.js: no publicar apellidos ni documentos sin autorización
// escrita.
//
// MATRICULAS sale de las constancias y cartas de pago que envió Carina el
// 05/10/2026 (USC, Vigo, Córdoba, Granada y Málaga). El importe es el total
// del año con las tasas de secretaría, tal como figura en cada documento.
// ⚠️ Claims publicitarios: la empresa debe poder sustanciar estas cifras
// (inspira-backend/docs/legal/09-claims-publicitarios.md); los documentos los
// guarda Carina.
const MEDIA = "https://www.inspira-legal.cloud/media";

// Becas que ganaron asesorados de Inspira.
export const BECADOS = [
  {
    id: "elisabet", nombre: "Elisabet", logo: "uv",
    beca: "Beca AUIP · Universitat de València",
    master: "Máster en Dirección y Planificación del Turismo",
    cifra: "33 €",
    cifraPie: "pagó de una matrícula de 4.274 €",
    texto: "La beca le descontó 4.240,80 € de la matrícula. Además le cubre alojamiento, alimentación y una dotación de 2.500 €.",
    // ⚠️ Por confirmar con Carina que este vídeo es el de Elisabet.
    video: { id: "7", src: `${MEDIA}/video/carina-7.mp4`, poster: `${MEDIA}/video/carina-7.jpg`, titulo: "Beca AUIP para un máster en Valencia" },
  },
  {
    id: "diego", nombre: "Diego", logo: "upv",
    beca: "Beca Generación del Bicentenario · Perú",
    master: "Máster en Planificación y Gestión en Ingeniería Civil · UPV",
    cifra: "2 en 1",
    cifraPie: "la admisión y la beca, a la vez",
    texto: "Lo acompañamos en las dos cosas: la postulación al máster y el expediente de la beca del Estado peruano, que tienen calendarios distintos.",
    enlace: { href: "/beca-generacion-bicentenario-2026", texto: "Ver la Beca Bicentenario" },
  },
  {
    id: "erick", nombre: "Erick", logo: "uja",
    beca: "Beca de Atracción del Talento · U. de Jaén",
    master: null,
    cifra: "Becado",
    cifraPie: "por la Universidad de Jaén",
    texto: "Esta beca puede cubrir la matrícula completa y 3.190 € al año. Cierra pronto: en 2026, el 15 de febrero.",
  },
];

// Matrículas reales de asesorados, sin beca. Ordenadas de menor a mayor.
export const MATRICULAS = [
  { id: "luzmar", nombre: "Luzmar", logo: "usc", uni: "U. de Santiago de Compostela", master: "Investigación y Desarrollo de Medicamentos", total: 570.19, curso: "2025/26" },
  { id: "marina", nombre: "Marina", logo: "usc", uni: "U. de Santiago de Compostela", master: "Salud Pública", total: 692.58, curso: "2026/27", nota: "Con 400 € de descuento por matricularse antes" },
  { id: "luis", nombre: "Luis", logo: "uvigo", uni: "U. de Vigo", master: "Administración Integrada de Empresas y RSC", total: 767.45, curso: "2025/26" },
  { id: "giandira", nombre: "Giandira", logo: "uvigo", uni: "U. de Vigo", master: "Economía", total: 767.45, curso: "2025/26" },
  { id: "marly", nombre: "Marly", logo: null, sigla: "UCO", uni: "U. de Córdoba", master: "Nutrición Humana", total: 885.6, curso: "2026/27" },
  { id: "miluska", nombre: "Miluska", logo: "ugr", uni: "U. de Granada", master: "Gestión y Tecnologías de Procesos de Negocio", total: 885.6, curso: "2025/26" },
  { id: "marco", nombre: "Marco", logo: "uma", uni: "U. de Málaga", master: "Dirección Estratégica e Innovación en Comunicación", total: 889.5, curso: "2025/26" },
  { id: "luz", nombre: "Luz", logo: "uma", uni: "U. de Málaga", master: "Asesoría Jurídica de Empresas", total: 927.76, curso: "2025/26", nota: "63 créditos" },
];
