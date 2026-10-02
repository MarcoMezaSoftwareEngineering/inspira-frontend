// La pantalla de «tuvimos un inconveniente»: la misma caja de marca que el
// acceso con Google (acceso.css), para el login fallido y para un fallo que
// tumba la página entera. Siempre con salida: reintentar, WhatsApp e inicio.
import { whatsappDesde } from "../../config/contacto";
import logo from "../../assets/images/logo.png";
import "../../styles/acceso.css";

/**
 * @param {string}   texto       qué pasó, en una frase
 * @param {string}   [referencia] número de registro, para citarlo por WhatsApp
 * @param {Array}    [acciones]  [{ etiqueta, onClick, fuerte }] antes de WhatsApp e inicio
 * @param {string}   [paraWhatsApp] lo que el mensaje de WhatsApp dice que pasó
 */
export default function PantallaError({ texto, referencia, acciones = [], paraWhatsApp = "Tuve un problema en la web." }) {
  const detalle = referencia ? `${paraWhatsApp} Referencia ${referencia}.` : paraWhatsApp;
  return (
    <div className="acc">
      <div className="acc-caja">
        <div className="acc-logo"><img src={logo} alt="Inspira Legal" /></div>
        <p className="acc-titulo">Tuvimos un inconveniente</p>
        <p className="acc-texto">{texto}</p>
        {referencia && <p className="acc-nota">Referencia: {referencia}</p>}
        <div className="acc-acciones">
          {acciones.map((a) => (
            <button
              key={a.etiqueta}
              type="button"
              className={`acc-btn${a.fuerte ? " acc-btn--fuerte" : ""}`}
              onClick={a.onClick}
            >
              {a.etiqueta}
            </button>
          ))}
          <a className="acc-btn" href={whatsappDesde("pantalla-error", detalle)} target="_blank" rel="noopener noreferrer">
            Escribir por WhatsApp
          </a>
          <a href="/" className="acc-btn">Volver al inicio</a>
        </div>
      </div>
    </div>
  );
}
