// Los datos del perfil que pide ESTE servicio, a la vista dentro de su
// expediente. Al entrar al panel no se pide ningún formulario: cada servicio
// dice qué necesita, con el nombre de cada dato, y no estorba si no falta nada.
import Icono from "../../../components/common/Icono";

export default function DatosDelServicio({ faltan = [], imprescindible = false, onIr }) {
  if (!faltan.length) return null;
  const n = faltan.length;
  return (
    <section className="pnl-datos-servicio" data-tono={imprescindible ? "alto" : "aviso"} aria-label="Datos que pide este servicio">
      <span className="pnl-datos-servicio-icono"><Icono nombre="usuario" size={18} /></span>
      <div className="pnl-datos-servicio-cuerpo">
        <h3>{n === 1 ? "Para este servicio falta 1 dato" : `Para este servicio faltan ${n} datos`}</h3>
        <p>
          {imprescindible
            ? "Con tu paquete de máster el perfil completo es imprescindible: con él preparamos tu informe y tu postulación."
            : "Los pide este servicio para avanzar con tu trámite. El resto del panel sigue disponible."}
        </p>
        <ul className="pnl-datos-servicio-chips">
          {faltan.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </div>
      <button type="button" className="pnl-btn-cta ux-tap" data-talla="s" onClick={onIr}>Completar</button>
    </section>
  );
}
