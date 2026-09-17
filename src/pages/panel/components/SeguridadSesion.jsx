// Seguridad de la cuenta, al pie del perfil.
//
// Un expediente legal se abre a veces desde el ordenador de un familiar o de
// un locutorio. «Cerrar en todos los dispositivos» invalida en el servidor
// todas las sesiones abiertas con esta cuenta, incluida esta.
import { useState } from "react";
import Icono from "../../../components/common/Icono";
import { useAuth } from "../../../context/AuthContext";
import { datosToken } from "../../../services/sesion";
import { dialog } from "../../../services/dialogService";

function fechaLarga(ms) {
  if (!ms) return null;
  return new Date(ms).toLocaleString("es-PE", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

export default function SeguridadSesion() {
  const { logout } = useAuth();
  const [cerrando, setCerrando] = useState(false);
  const d = datosToken();

  async function cerrarTodas() {
    const ok = await dialog.confirm(
      "Se cerrará la sesión en este y en todos tus dispositivos. Tendrás que volver a entrar con Google.",
      "¿Cerrar la sesión en todas partes?",
    );
    if (!ok) return;
    setCerrando(true);
    await logout({ todos: true });
  }

  return (
    <section className="pnl-seguridad pnl-entra" aria-labelledby="pnl-seguridad-titulo">
      <span className="pnl-seguridad-icono"><Icono nombre="escudo" size={20} /></span>
      <div className="pnl-seguridad-cuerpo">
        <h3 id="pnl-seguridad-titulo">Seguridad de tu cuenta</h3>
        <p>
          Entras con tu cuenta de Google. La sesión se renueva sola mientras usas el panel
          {d?.exp ? <> y, si no entras, se cierra el <b>{fechaLarga(d.exp)}</b></> : null}.
        </p>
      </div>
      <div className="pnl-seguridad-botones">
        <button type="button" className="pnl-btn" onClick={() => logout()} disabled={cerrando}>
          <Icono nombre="salir" size={15} />
          Cerrar sesión
        </button>
        <button type="button" className="pnl-btn pnl-btn-peligro" onClick={cerrarTodas} disabled={cerrando}>
          {cerrando ? "Cerrando…" : "Cerrar en todos los dispositivos"}
        </button>
      </div>
    </section>
  );
}
