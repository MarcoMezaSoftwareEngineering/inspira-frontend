// Los iconos de línea del expediente, los mismos en el panel del asesorado y
// en Inspira Core: un paso se reconoce por su icono antes que por su número.
// Trazo de 24×24 en color del texto; el tamaño lo pone la clase.
const TRAZOS = {
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 20a8 8 0 0116 0",
  folder: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
  fileText: "M8 3h6l5 5v11a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2zM14 3v5h5M9 13h6M9 17h6",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  checkCircle: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM8.5 12.5l2.5 2.5 4.5-5",
  cap: "M12 4L2 9l10 5 10-5-10-5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  message: "M21 12a8 8 0 01-8 8H7l-4 3V12a8 8 0 018-8h2a8 8 0 018 8z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  search: "M18 11a7 7 0 11-14 0 7 7 0 0114 0zM20 20l-4-4",
  coins: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM15 8.5A4 4 0 0010.5 8 4 4 0 0010 12a4 4 0 00.5 4 4 4 0 004.5-.5M7 11h6M7 13h6",
  edit: "M4 20h4l11-11-4-4L4 16v4zM13 7l4 4",
  globe: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18",
  home: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z",
  lock: "M5 11h14v9H5zM8 11V7a4 4 0 018 0v4",
  bell: "M6 16V11a6 6 0 0112 0v5l2 2H4l2-2zM10 20a2 2 0 004 0",
  info: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 11v5M12 8h.01",
  check: "M5 12l5 5L20 7",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6L6 18",
  clip: "M8 12l6-6a3 3 0 014 4l-8 8a5 5 0 01-7-7l8-8",
  briefcase: "M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M3 12h18",
  send: "M3 11l18-8-8 18-2-8-8-2z",
  idCard: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM9 14.2a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4zM14 10h4M14 14h4M5.5 17c.6-1.6 2-2.5 3.5-2.5s2.9.9 3.5 2.5",
  arrowLeft: "M19 12H5M11 18l-6-6 6-6",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  sparkles: "M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z",
  upload: "M12 16V4M6 10l6-6 6 6M4 20h16",
  download: "M12 4v12M6 10l6 6 6-6M4 20h16",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  external: "M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h5",
  award: "M17 9a5 5 0 11-10 0 5 5 0 0110 0zM9 13l-1.5 8L12 18l4.5 3L15 13",
  scroll: "M6 3h12a2 2 0 012 2v13a3 3 0 01-3 3H5a2 2 0 01-2-2v-1h12v1a1 1 0 002 0V5H6zM8 8h7M8 12h7",
  language: "M4 6h9M8.5 4v2M7 6c0 4 3 7 6 8M11 6c-1 4-4 7-7 8M13 20l3.5-8 3.5 8M14.5 17h4",
  book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM4 19a2 2 0 002 2h13",
  trophy: "M8 4h8v5a4 4 0 01-8 0V4zM8 6H5a3 3 0 003 3M16 6h3a3 3 0 01-3 3M12 13v4M8 21h8M9 17h6v4",
  mail: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 7l9 6 9-6",
  star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
  pin: "M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM14.5 10a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
  calendar: "M3 7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 10h18M8 3v4M16 3v4",
};

/** Icono por nombre de bloque o sección; cae en «info» si no lo conoce. */
export const ICONO_POR_BLOQUE = {
  // Panel del asesorado
  docs: "folder", form: "fileText", informe: "chart", eleccion: "checkCircle", post: "cap", cierre: "flag", mensajes: "message",
  // Inspira Core · máster
  cliente: "user", checklist: "folder", formulario: "fileText", programacion: "cap",
  // Visado, estancia y modificatoria
  proceso: "list", diagnostico: "search", solvencia: "coins", declaracion: "edit", impreso: "fileText", seguimiento: "search", precita: "search", cita: "idCard", portales: "lock",
  flujo: "list", invitados: "user", datos: "fileText", documentos: "folder", acompanantes: "user", carpeta: "folder", generadores: "edit", extranjeria: "globe",
};

export default function IconoPaso({ nombre, className = "w-4 h-4", strokeWidth = 1.8 }) {
  const d = TRAZOS[nombre] || TRAZOS.info;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
