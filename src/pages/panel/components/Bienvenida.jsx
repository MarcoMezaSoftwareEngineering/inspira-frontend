// Lo que se ve al abrir la app sin sesión.
//
// Antes se iba derecho a la pantalla de Google: sin marca, sin decir qué es
// esto ni para qué sirve. Quien instala la app y la abre por primera vez
// merece que se le reciba antes de pedirle nada. El acceso sigue siendo la
// cuenta de Google del asesorado —no hay otra puerta—, así que el botón lo
// dice con sus palabras: entrar con su correo.
//
// Si se llegó aquí por un enlace a un expediente, `loginGoogle` conserva esa
// URL y se vuelve a ella después de Google.
import logo from "../../../assets/images/logo.png";
import Icono from "../../../components/common/Icono";
import { loginGoogle } from "../../../components/layout/Header/LoginButton";
import { navigate } from "../../../services/navigate";
import { whatsappDesde } from "../../../config/contacto";
import { marcarRegistroApp } from "../herramientas/referido";
import "../../../styles/panel/herramientas.css";

// Lo que da la app gratis, en una lista corrida: sin tarjetas, que el botón de
// entrar se vea sin bajar (03/11/2026).
const GRATIS = [
  "Con cuántos másteres haces match",
  "Tus becas, con aviso antes del cierre",
  "Calendario, presupuesto y días Schengen",
];

export default function Bienvenida() {
  return (
    <div className="pnl min-h-dvh flex items-stretch sm:items-center justify-center p-0 sm:p-6">
      {/* En el teléfono, a sangre: ocupa la pantalla entera (cascara.css). */}
      <div className="pnl-vacio pnl-vacio-pantalla w-full max-w-md pnl-entra">
        <div className="pnl-side-logo pnl-vacio-logo">
          <img src={logo} alt="Inspira Legal" />
        </div>
        <h3>Tu viaje a España, en tu celular</h3>
        <p className="ex-lema">App Inspira · gratis</p>

        <div className="pnl-vacio-acciones">
          {/* Dos puertas a la misma cuenta de Google: la primera deja anotado
              que llegó por la app gratuita (origen «App Inspira»). */}
          <button type="button" className="pnl-btn-cta pnl-btn-grande ux-tap" onClick={() => { marcarRegistroApp(); loginGoogle(); }}>
            <Icono nombre="regalo" size={16} />
            Crear mi cuenta gratis
          </button>
          <button type="button" className="pnl-btn-noche ux-tap" onClick={() => loginGoogle()}>
            <Icono nombre="usuario" size={16} />
            Ya soy cliente: entrar a mi expediente
          </button>
        </div>
        <p className="pnl-bienvenida-nota">Entras con tu cuenta de Google, sin contraseña ni tarjeta.</p>

        <ul className="pnl-bienvenida-lista">
          {GRATIS.map((t) => <li key={t}><span className="pnl-bienvenida-check"><Icono nombre="check" size={15} /></span><span>{t}</span></li>)}
        </ul>

        <button type="button" className="pnl-vacio-enlace" onClick={() => navigate("/")}>Ver la web</button>

        <p className="pnl-vacio-pie">
          ¿Quieres tu Expediente Digital con un asesor?{" "}
          <a
            href={whatsappDesde("panel-bienvenida", "Quiero información para acceder a mi panel.")}
            target="_blank" rel="noopener noreferrer"
            className="pnl-vacio-enlace"
          >
            Escríbenos
          </a>
          .
        </p>
      </div>
    </div>
  );
}
