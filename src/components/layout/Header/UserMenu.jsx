import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { navigate } from "../../../services/navigate";
import Icono from "../../common/Icono";
import Avatar from "../../common/Avatar";
import { datosUsuario } from "../../common/usuario";

export default function UserMenu({ user }) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const botonRef = useRef(null);

  const { nombre, corto, iniciales, correo, foto } = datosUsuario(user);

  useEffect(() => {
    if (!open) return;

    const fuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    // Con Escape el foco vuelve al botón: si no, se queda suelto al final del
    // documento y el siguiente tabulador empieza desde cero.
    const tecla = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        botonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [open]);

  // El panel no lleva la pestaña en la URL: la lee de localStorage al montar.
  // Dejarla escrita antes de navegar es la única forma de abrirlo por una
  // sección concreta sin rehacer su enrutado.
  const ir = (e, href, tab) => {
    e.preventDefault();
    setOpen(false);
    if (tab) {
      try { localStorage.setItem("panel_tab", tab); } catch { /* noop */ }
    }
    navigate(href);
  };

  return (
    <div className="v4-user" ref={ref}>
      <button
        ref={botonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="v4-user-menu"
        aria-label={`Cuenta de ${nombre}`}
        className={`v4-user-btn${open ? " abierto" : ""}`}
      >
        <Avatar foto={foto} iniciales={iniciales} nombre={nombre} size={30} />
        <span className="v4-user-corto">{corto}</span>
        <span className="v4-user-caret" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="v4-user-menu" id="v4-user-menu">
          <div className="v4-user-cabecera">
            <Avatar foto={foto} iniciales={iniciales} nombre={nombre} size={42} />
            <div className="v4-user-datos">
              {/* `title` porque el nombre legal completo casi nunca cabe */}
              <span className="v4-user-nombre" title={nombre}>{nombre}</span>
              {correo && (
                <span className="v4-user-correo" title={correo}>{correo}</span>
              )}
            </div>
          </div>

          <a
            href="/panel"
            onClick={(e) => ir(e, "/panel", "servicios")}
            className="v4-user-item"
          >
            <Icono nombre="panel" size={17} />
            Mi panel
          </a>

          <a
            href="/panel"
            onClick={(e) => ir(e, "/panel", "perfil")}
            className="v4-user-item"
          >
            <Icono nombre="usuario" size={17} />
            Mis datos
          </a>

          <div className="v4-user-sep" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="v4-user-item v4-user-salir"
          >
            <Icono nombre="salir" size={17} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
