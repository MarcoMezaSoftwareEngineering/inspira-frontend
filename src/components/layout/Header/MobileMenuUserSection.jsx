// src/components/layout/Header/MobileMenuUserSection.jsx
import Avatar from "./Avatar";
import { datosUsuario } from "./usuario";

export default function MobileMenuUserSection({ user, onLogin, onLogout }) {
  const { nombre, iniciales, correo, foto } = datosUsuario(user);

  return (
    <div className="mt-auto flex flex-col gap-4">
      {!user && (
        <button
          type="button"
          onClick={onLogin}
          className="w-full text-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light transition"
        >
          Iniciar con Google
        </button>
      )}

      {user && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
            <Avatar foto={foto} iniciales={iniciales} nombre={nombre} size={40} />

            {/* min-w-0 es lo que permite que truncate funcione dentro del flex:
                sin él, un nombre legal completo ensancha el cajón del menú. */}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-primary" title={nombre}>
                {nombre}
              </div>
              {correo && (
                <div className="truncate text-xs text-neutral-500" title={correo}>
                  {correo}
                </div>
              )}
            </div>
          </div>

          <a
            href="/panel"
            className="w-full text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition"
          >
            Mi Panel
          </a>

          <button
            type="button"
            onClick={onLogout}
            className="w-full text-left rounded-lg px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100 transition"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
