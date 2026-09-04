// A quien ya tiene un expediente en marcha no se le cierra el paso.
//
// El asistente de perfil salía como modal sin botón de cerrar en cuanto
// faltaba un dato de once —el vencimiento del pasaporte, por ejemplo—, en
// cada entrada, justo después de Google. Para quien entra por primera vez y
// no tiene nada contratado sigue siendo obligatorio: es el paso previo a que
// un asesor le dé acceso. Para quien ya tiene servicio, es esto: un aviso que
// dice qué falta y lleva al perfil, sin bloquear nada.
import Icono from "../../../components/common/Icono";

export default function AvisoPerfil({ faltan, onIr, imprescindible = false }) {
  if (!faltan) return null;
  return (
    <div className="pnl-aviso" role="status">
      <span className="pnl-aviso-icono"><Icono nombre="usuario" size={16} /></span>
      <p className="pnl-aviso-texto">
        Te {faltan === 1 ? "falta un dato" : `faltan ${faltan} datos`} del perfil.
        {imprescindible
          ? " Con tu paquete de máster el perfil completo es imprescindible: con él preparamos tu informe y tu postulación."
          : " Nos hacen falta para los trámites."}
      </p>
      <button type="button" className="pnl-btn ux-tap" onClick={onIr}>
        Completar
      </button>
    </div>
  );
}
