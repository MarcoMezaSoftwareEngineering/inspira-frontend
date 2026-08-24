import { useState, useEffect } from "react";
import logo from "../../../assets/images/logo.png";
import { useAuth } from "../../../context/AuthContext";
import { navigate } from "../../../services/navigate";
import { navItems } from "./header.data";
import MobileMenu from "./MobileMenu";
import MegaMenu from "./MegaMenu";
import UserMenu from "./UserMenu";
import { loginGoogle } from "./LoginButton";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [path, setPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    navigate(href);
    setPath(href);
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
                return (
                  <div className="v4-mega-wrap" key={item.label}>
                    <a
                      href={item.href}
                      onClick={(e) => go(e, item.href)}
                      className={`v4-mega-trigger${active ? " route-active" : ""}`}
                    >
                      {item.label} <span className="caret">▼</span>
                    </a>
                    <MegaMenu onNavigate={(href) => setPath(href)} />
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
