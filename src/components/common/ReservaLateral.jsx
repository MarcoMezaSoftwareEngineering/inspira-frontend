// src/components/common/ReservaLateral.jsx
// Tarjeta fija al costado derecho: recuerda la asesoría 1:1 de 30 min. Entra
// deslizándose tras el primer scroll para no tapar el hero (que ya lleva su
// propio botón). En móvil se colapsa a una pestaña estrecha.
import Icono from "./Icono";
import { ASESORIA_PRINCIPAL } from "../../config/asesorias";

export default function ReservaLateral({ onAbrir, visible = true }) {
  return (
    <div className={"reserva-lateral" + (visible ? " visible" : "")}>
      {/* Escritorio: tarjeta con el precio a la vista */}
      <button
        type="button"
        onClick={onAbrir}
        className="reserva-lateral-card"
        aria-label="Reservar asesoría de 30 minutos"
      >
        <span className="rl-icon">
          <Icono nombre="calendario" size={20} />
        </span>
        <span className="rl-txt">
          <small>Asesoría 1:1 · {ASESORIA_PRINCIPAL.duracion}</small>
          <b>Reserva ahora</b>
          <em>{ASESORIA_PRINCIPAL.precio}</em>
        </span>
      </button>

      {/* Móvil: pestaña estrecha */}
      <button
        type="button"
        onClick={onAbrir}
        className="reserva-lateral-tab"
        aria-label="Reservar asesoría"
      >
        <Icono nombre="calendario" size={17} />
      </button>
    </div>
  );
}
