// src/components/layout/Header/MobileMenu.jsx
import { useAuth } from "../../../context/AuthContext";
import MobileMenuHeader from "./MobileMenuHeader";
import MobileMenuNavLinks from "./MobileMenuNavLinks";
import MobileMenuUserSection from "./MobileMenuUserSection";
import { loginGoogle } from "./LoginButton";

export default function MobileMenu({ open, onClose }) {
  const { user, logout } = useAuth();

  if (!open) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Mismo arranque que el botón de la cabecera: quien pulsa «Iniciar» va a su
  // panel, no a la página donde estaba el botón.
  const handleLogin = () => loginGoogle();

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Ancho algo mayor y scroll interno: el catálogo completo cabe sin
          comprimirse, y la sección de usuario queda anclada abajo. */}
      <div className="absolute left-0 top-0 flex h-full w-[min(21rem,88vw)] flex-col gap-3 overflow-y-auto bg-white p-5 shadow-xl">
        <MobileMenuHeader onClose={onClose} />

        <MobileMenuNavLinks onClose={onClose} />

        <MobileMenuUserSection
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
