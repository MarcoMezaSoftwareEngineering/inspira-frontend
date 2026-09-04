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
import { LINEAS, whatsappLinea } from "../../../config/contacto";

const QUE_HAY = [
  { icono: "documento", titulo: "Tus documentos", texto: "Súbelos desde el móvil y ve cuáles ya están revisados." },
  { icono: "reloj", titulo: "Tus plazos", texto: "Qué cierra y cuándo, sin tener que preguntarlo." },
  { icono: "brujula", titulo: "Tu trámite paso a paso", texto: "En qué punto está y qué te toca hacer hoy." },
];

export default function Bienvenida() {
  const citas = LINEAS.find((l) => l.id === "citas") || LINEAS[0];
  return (
    <div className="pnl min-h-dvh flex items-center justify-center p-4 sm:p-6">
      <div className="pnl-vacio w-full max-w-md pnl-entra">
        <div className="pnl-side-logo" style={{ margin: "0 auto 22px" }}>
          <img src={logo} alt="Inspira Legal" />
        </div>
        <h3>Bienvenido a tu panel</h3>
        <p>
          Aquí vive tu expediente con Inspira: lo que has entregado, lo que falta
          y lo que viene después. Entra con el correo de Google con el que te dimos
          el acceso.
        </p>

        <div className="pnl-lineas" style={{ marginBottom: 24 }}>
          {QUE_HAY.map((q) => (
            <div key={q.titulo} className="pnl-linea" style={{ cursor: "default" }}>
              <Icono nombre={q.icono} size={16} />
              <span className="pnl-linea-datos">
                <strong style={{ fontSize: 13.5 }}>{q.titulo}</strong>
                <small>{q.texto}</small>
              </span>
            </div>
          ))}
        </div>

        <div className="pnl-vacio-acciones">
          <button type="button" className="pnl-btn-cta ux-tap" onClick={() => loginGoogle()}>
            <Icono nombre="usuario" size={15} />
            Entrar con tu correo de Google
          </button>
          <button type="button" className="pnl-vacio-fantasma ux-tap" onClick={() => navigate("/")}>
            Ver la web
          </button>
        </div>

        <p style={{ marginTop: 22, marginBottom: 0, fontSize: 12 }}>
          ¿Todavía no tienes acceso?{" "}
          <a
            href={whatsappLinea(citas, "Hola Inspira, quiero información para acceder a mi panel.")}
            target="_blank" rel="noopener noreferrer"
            style={{ color: "#fff", fontWeight: 700, textDecoration: "underline" }}
          >
            Escríbenos
          </a>
          .
        </p>
      </div>
    </div>
  );
}
