// src/components/common/BotonAsesoria.jsx
// Botón reutilizable que lleva a Calendly. Se usa en cada cierre de sección
// para que nunca haya una pantalla sin invitación a la primera asesoría.
import { CALENDLY_URL } from "../../config/contacto";

const ESTILOS = {
  primario:
    "bg-accent text-white hover:bg-accent-dark shadow-lg shadow-accent/25",
  oscuro: "bg-primary text-white hover:bg-primary-dark",
  contorno:
    "border-2 border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20",
  contornoOscuro:
    "border-2 border-primary text-primary hover:bg-secondary",
};

export default function BotonAsesoria({
  children = "Agenda tu primera asesoría",
  variante = "primario",
  className = "",
}) {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-extrabold transition ${ESTILOS[variante]} ${className}`}
    >
      📅 {children}
    </a>
  );
}
