// Quién es quién en la Oficina Inspira. Cada personaje atiende un área de Core: su estado sale de
// lo que de verdad hay en esa mesa (GET /backoffice/oficina), no de un guion.
export const PERSONAJES = [
  {
    id: "hermione", nombre: "Hermione", rol: "Expedientes", casa: "Gryffindor", color: "#7a1f2b", acento: "#eeba30",
    celda: [1.4, 1.6], abre: { texto: "Abrir Procesos", href: "/backoffice/procesos" },
    pie: "Requerimientos con plazo, documentos que subieron los asesorados e informes de asesoría por aprobar.",
  },
  {
    id: "harry", nombre: "Harry", rol: "Tareas", casa: "Gryffindor", color: "#8f1d2c", acento: "#eeba30",
    celda: [4.6, 1.4], abre: { texto: "Abrir Tareas", href: "/backoffice/tareas" },
    pie: "Las tareas del equipo que vencen hoy o ya vencieron.",
  },
  {
    id: "ron", nombre: "Ron", rol: "Leads", casa: "Gryffindor", color: "#a3541a", acento: "#eeba30",
    celda: [1.4, 4.6], abre: { texto: "Abrir Leads", href: "/backoffice/leads" },
    pie: "Gente que dejó sus datos y todavía nadie ha contactado.",
  },
  {
    id: "luna", nombre: "Luna", rol: "Agenda", casa: "Ravenclaw", color: "#1d3f73", acento: "#b08d57",
    celda: [4.4, 4.4], abre: { texto: "Abrir Agenda", href: "/backoffice/agenda" },
    pie: "Las asesorías y sesiones de hoy, hora de Lima.",
  },
  {
    id: "neville", nombre: "Neville", rol: "Pagos", casa: "Hufflepuff", color: "#3f6b2a", acento: "#c9b36a",
    celda: [6.6, 2.8], abre: { texto: "Abrir Pagos", href: "/backoffice/pagos" },
    pie: "Cobros vencidos y comprobantes que esperan que alguien los valide.",
  },
  {
    id: "albus", nombre: "Albus", rol: "Dirección", casa: "", color: "#4a2a85", acento: "#e8d9a8",
    celda: [3.3, 6.9], abre: { texto: "Abrir Inicio", href: "/backoffice/dashboard" },
    pie: "Lo urgente de todas las áreas, junto.",
  },
];

export const porId = (id) => PERSONAJES.find((p) => p.id === id) || null;

export const ESTADO_TEXTO = {
  libre: "Al día",
  trabajando: "Con trabajo",
  urgente: "Algo urgente",
};
