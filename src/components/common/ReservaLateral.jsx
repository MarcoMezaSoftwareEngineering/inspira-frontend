// src/components/common/ReservaLateral.jsx
// Tarjeta fija al costado derecho: recuerda la sesión diagnóstico de 30 min.
// Entra deslizándose tras el primer scroll para no tapar el hero (que ya lleva
// su propio botón). En pantallas más estrechas se colapsa a una pestaña.
// Abre Calendly directamente: es el único destino de reserva de la web
// (config/contacto.js).
import Icono from "./Icono";
import { ASESORIA_PRINCIPAL } from "../../config/asesorias";
import { CALENDLY_URL } from "../../config/contacto";

export default function ReservaLateral({ visible = true }) {
  return (
    <div className={"reserva-lateral" + (visible ? " visible" : "")}>
      {/* Escritorio: tarjeta con el precio a la vista */}
      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="reserva-lateral-card no-underline"
        aria-label="Reservar la sesión diagnóstico de 30 minutos"
      >
        <span className="rl-icon">
          <Icono nombre="calendario" size={20} />
        </span>
        <span className="rl-txt">
          <small>Asesoría 1:1 · {ASESORIA_PRINCIPAL.duracion}</small>
          <b>Reserva ahora</b>
          <em>{ASESORIA_PRINCIPAL.precio}</em>
        </span>
      </a>

      {/* Pestaña estrecha */}
      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="reserva-lateral-tab"
        aria-label="Reservar la sesión diagnóstico"
      >
        <Icono nombre="calendario" size={17} />
      </a>
    </div>
  );
}
