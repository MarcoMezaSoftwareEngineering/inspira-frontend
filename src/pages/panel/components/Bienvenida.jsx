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

const QUE_HAY = [
  { icono: "documento", titulo: "Tus documentos", texto: "Súbelos desde el móvil y ve cuáles ya están revisados." },
  { icono: "reloj", titulo: "Tus plazos", texto: "Qué cierra y cuándo, sin tener que preguntarlo." },
  { icono: "brujula", titulo: "Tu trámite paso a paso", texto: "En qué punto está y qué te toca hacer hoy." },
];

export default function Bienvenida() {
  return (
    <div className="pnl min-h-dvh flex items-stretch sm:items-center justify-center p-0 sm:p-6">
      {/* En el teléfono, a sangre: ocupa la pantalla entera (cascara.css). */}
      <div className="pnl-vacio pnl-vacio-pantalla w-full max-w-md pnl-entra">
        <div className="pnl-side-logo pnl-vacio-logo">
          <img src={logo} alt="Inspira Legal" />
        </div>
        <h3>Expediente Digital Inspira</h3>
        <p className="ex-lema">No tienes una carpeta. Tienes un expediente.</p>
        <p>
          Aquí vive tu expediente con Inspira: lo que has entregado, lo que falta
          y lo que viene después. Entra con el correo de Google con el que te dimos
          el acceso.
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
          <button type="button" className="pnl-btn-cta pnl-btn-grande ux-tap" onClick={() => loginGoogle()}>
            <Icono nombre="usuario" size={16} />
            Entrar con tu correo de Google
          </button>
          <button type="button" className="pnl-btn-noche ux-tap" onClick={() => navigate("/")}>
            Ver la web
          </button>
        </div>

        <p className="pnl-vacio-pie">
          ¿Todavía no tienes acceso?{" "}
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
