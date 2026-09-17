// Cuando la sesión termina con el panel abierto.
//
// Antes, el primer clic tras caducar llevaba a la portada sin explicación.
// Ahora la pantalla se queda donde estaba, velada, y esta hoja explica qué ha
// pasado y ofrece volver a entrar: Google devuelve a esta misma URL.
import Icono from "../../../components/common/Icono";
import { loginGoogle } from "../../../components/layout/Header/LoginButton";
import { whatsappDesde } from "../../../config/contacto";

const TEXTOS = {
  caducada: {
    titulo: "Tu sesión ha caducado",
    texto: "Por seguridad, la sesión se cierra tras siete días sin entrar. Vuelve a entrar y seguirás justo donde estabas.",
  },
  cerrada: {
    titulo: "Se cerró tu sesión",
    texto: "Se cerró desde otra pestaña o desde otro dispositivo. Si no has sido tú, vuelve a entrar y avísanos.",
  },
  "otra-cuenta": {
    titulo: "Has entrado con otra cuenta",
    texto: "En otra pestaña se ha entrado con una cuenta distinta. Recarga para ver el expediente de esa cuenta.",
  },
  inactiva: {
    titulo: "Tu acceso está desactivado",
    texto: "Esta cuenta ya no tiene acceso al Expediente Digital. Si crees que es un error, escríbenos y lo revisamos.",
  },
  invalida: {
    titulo: "Vuelve a entrar",
    texto: "No hemos podido comprobar tu sesión. Entra de nuevo con tu correo de Google.",
  },
};

export default function AvisoSesion({ motivo }) {
  const t = TEXTOS[motivo] || TEXTOS.caducada;
  const icono = motivo === "inactiva" ? "escudo" : motivo === "otra-cuenta" ? "usuarios" : "reloj";

  return (
    <div className="pnl pnl-sesion" role="alertdialog" aria-modal="true" aria-labelledby="pnl-sesion-titulo">
      <div className="pnl-sesion-caja">
        <div className="pnl-sesion-icono"><Icono nombre={icono} size={26} /></div>
        <h2 id="pnl-sesion-titulo">{t.titulo}</h2>
        <p>{t.texto}</p>
        <div className="pnl-sesion-botones">
          {motivo === "otra-cuenta" ? (
            <button type="button" className="pnl-btn-cta" onClick={() => window.location.reload()} autoFocus>
              Recargar
            </button>
          ) : motivo === "inactiva" ? (
            <a className="pnl-btn-cta" href={whatsappDesde("panel-inactiva", "Mi acceso al Expediente Digital aparece desactivado.")} target="_blank" rel="noopener noreferrer">
              <Icono nombre="chat" size={15} />
              Escribir a Inspira
            </a>
          ) : (
            <button type="button" className="pnl-btn-cta" onClick={() => loginGoogle()} autoFocus>
              <Icono nombre="usuario" size={15} />
              Volver a entrar
            </button>
          )}
          <a href="/" className="pnl-btn">Ir a la web</a>
        </div>
        {motivo !== "inactiva" && motivo !== "otra-cuenta" && (
          <p className="pnl-sesion-nota">Al entrar volverás a esta misma pantalla.</p>
        )}
      </div>
    </div>
  );
}
