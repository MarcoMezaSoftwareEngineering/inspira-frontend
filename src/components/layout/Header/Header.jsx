import { useState, useEffect } from "react";
import logo from "../../../assets/images/logo.png";
import { useAuth } from "../../../context/AuthContext";
import { navigate } from "../../../services/navigate";
import { navItems } from "./header.data";
import MobileMenu from "./MobileMenu";
import MegaMenu from "./MegaMenu";
import Icono from "../../common/Icono";
import UserMenu from "./UserMenu";
import { loginGoogle } from "./LoginButton";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Desplegable abierto (label del item). Controlado por estado y no solo por
  // :hover, para que también funcione con clic, teclado y en pantallas táctiles.
  const [abierto, setAbierto] = useState(null);
  const [path, setPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onPop = () => {
      setPath(window.location.pathname);
      setAbierto(null);
    };
    const onKey = (e) => e.key === "Escape" && setAbierto(null);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    navigate(href);
    setPath(href);
    setAbierto(null);
  };

  return (
    <>
      <div className={`v4-nav-wrap${scrolled ? " scrolled" : ""}`}>
        <header className="v4-nav">
          <a href="/" onClick={(e) => go(e, "/")} className="v4-logo-brand">
            <img src={logo} alt="Inspira Legal" />
          </a>

          <nav className="v4-navlinks">
            {navItems.map((item) => {
              // Como en el mockup: el estado activo solo se marca en las rutas
              // internas (servicios / calculadora), nunca en "Inicio".
              const active = item.href !== "/" && path === item.href;
              if (item.mega) {
                const open = abierto === item.label;
                return (
                  <div
                    className={`v4-mega-wrap${open ? " abierto" : ""}`}
                    key={item.label}
                    onMouseEnter={() => setAbierto(item.label)}
                    onMouseLeave={() => setAbierto(null)}
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setAbierto(open ? null : item.label)}
                      className={`v4-mega-trigger${active ? " route-active" : ""}`}
                    >
                      {item.label} <span className="caret">▼</span>
                    </button>
                    <MegaMenu
                      onNavigate={(href) => {
                        setPath(href);
                        setAbierto(null);
                      }}
                    />
                  </div>
                );
              }
              if (item.submenu) {
                const open = abierto === item.label;
                return (
                  <div
                    className={`v4-sub-wrap${open ? " abierto" : ""}`}
                    key={item.label}
                    onMouseEnter={() => setAbierto(item.label)}
                    onMouseLeave={() => setAbierto(null)}
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setAbierto(open ? null : item.label)}
                      className="v4-mega-trigger"
                    >
                      {item.label} <span className="caret">▼</span>
                    </button>
                    <div className="v4-sub">
                      {item.submenu.map((s) => (
                        <a
                          key={s.href}
                          href={s.href}
                          onClick={(e) => go(e, s.href)}
                        >
                          <Icono nombre={s.icono} size={17} />
                          {s.label}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }
              if (item.externo) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={item.cta ? "v4-nav-cta" : undefined}
                  >
                    {item.cta && "📅 "}
                    {item.label}
                  </a>
                );
              }
              if (item.ia) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => go(e, item.href)}
                    className={`v4-pill-ia${active ? " route-active" : ""}`}
                  >
                    <Icono nombre="robot" size={16} />
                    {item.label}
                  </a>
                );
              }
              if (item.badge) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => go(e, item.href)}
                    className={`v4-pill-free${active ? " route-active" : ""}`}
                  >
                    <span className="v4-pulse" />
                    {item.label}
                  </a>
                );
              }
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => go(e, item.href)}
                  className={active ? "route-active" : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="v4-nav-actions">
            {!user && (
              <button className="v4-login-btn" type="button" onClick={loginGoogle}>
                <span className="v4-login-long">Iniciar con Google</span>
                <span className="v4-login-short">Iniciar</span>
              </button>
            )}
            {user && <UserMenu user={user} />}
            <button
              className="v4-menu-btn"
              type="button"
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </button>
          </div>
        </header>
      </div>

      {/* En Home el hero ya reserva el espacio del nav flotante (padding-top 160px),
          igual que en el mockup. En el resto de rutas hace falta el spacer. */}
      {path !== "/" && <div className="v4-route-spacer" />}

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
