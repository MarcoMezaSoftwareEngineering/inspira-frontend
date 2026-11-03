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

// Desde el 03/11/2026 cualquiera crea su cuenta con Google y usa gratis las
// herramientas; el expediente sigue siendo para quien tiene un servicio.
const QUE_HAY = [
  { icono: "regalo", titulo: "Herramientas gratis", texto: "Presupuesto, tracker de becas, calendario, días Schengen y listas." },
  { icono: "birrete", titulo: "Todo guardado en tu cuenta", texto: "Lo que escribes te espera en el móvil y en el ordenador." },
  { icono: "documento", titulo: "Y si ya eres cliente, tu expediente", texto: "Documentos, plazos y tu trámite paso a paso." },
];

export default function Bienvenida() {
  return (
    <div className="pnl min-h-dvh flex items-stretch sm:items-center justify-center p-0 sm:p-6">
      {/* En el teléfono, a sangre: ocupa la pantalla entera (cascara.css). */}
      <div className="pnl-vacio pnl-vacio-pantalla w-full max-w-md pnl-entra">
        <div className="pnl-side-logo pnl-vacio-logo">
          <img src={logo} alt="Inspira Legal" />
        </div>
        <h3>App Inspira</h3>
        <p className="ex-lema">Prepara tu viaje a España. Gratis.</p>
        <p>
          Crea tu cuenta con tu correo de Google y usa las herramientas para
          estudiar, vivir o viajar a España. Si ya eres cliente, entra con el
          correo con el que te dimos el acceso.
        </p>

        <div className="pnl-lineas">
          {QUE_HAY.map((q) => (
            <div key={q.titulo} className="pnl-linea pnl-cristal-texto" data-fija="1">
              <span className="pnl-linea-tile">
                <Icono nombre={q.icono} size={18} />
              </span>
              <span className="pnl-linea-datos">
                <strong>{q.titulo}</strong>
                <small>{q.texto}</small>
              </span>
            </div>
          ))}
        </div>

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
          <button type="button" className="pnl-vacio-enlace" onClick={() => navigate("/")}>
            Ver la web
          </button>
        </div>

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
