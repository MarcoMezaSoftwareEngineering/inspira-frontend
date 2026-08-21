import { useState, useEffect } from "react";
import logo from "../../../assets/images/logo.png";
import { useAuth } from "../../../context/AuthContext";
import { navigate } from "../../../services/navigate";
import { navItems } from "./header.data";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";
import LoginButton, { loginGoogle } from "./LoginButton";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <>
      <div
        className={`fixed left-0 right-0 z-40 px-3.5 transition-all duration-300 ${
          scrolled ? "top-2" : "top-3"
        }`}
      >
        <header
          className={`max-w-[1180px] mx-auto border border-[#063f50]/10 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_12px_34px_rgba(20,50,60,.08)] flex items-center justify-between transition-all duration-300 pl-4 pr-3.5 ${
            scrolled ? "h-[60px] shadow-[0_15px_34px_rgba(20,50,60,.12)]" : "h-[68px]"
          }`}
        >
          {/* Logo */}
          <a href="/" onClick={(e) => go(e, "/")} className="flex-shrink-0 flex items-center">
            <img src={logo} alt="Inspira" className="h-8 w-auto object-contain" />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.badge) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => go(e, item.href)}
                    className="flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-semibold text-white rounded-full transition-all hover:opacity-90 hover:scale-105"
                    style={{ background: "#1D6A4A" }}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-400" />
                    </span>
                    {item.label}
                  </a>
                );
              }
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => go(e, item.href)}
                  className={`px-3 py-2.5 text-[13px] font-semibold rounded-lg transition-colors ${
                    item.highlight
                      ? "text-accent hover:text-accent-dark hover:bg-orange-50"
                      : "text-[#34515a] hover:text-primary hover:bg-[#f2f6f7]"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right: Login */}
          <div className="hidden md:flex items-center gap-3">
            {!user && <LoginButton />}
            {user && <UserMenu user={user} />}
          </div>

          {/* Mobile: calculadora + login/panel + hamburguesa */}
          <div className="md:hidden flex items-center gap-1.5">
            <a
              href="/calculadora-master"
              onClick={(e) => { e.preventDefault(); navigate("/calculadora-master"); }}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full whitespace-nowrap text-white"
              style={{ background: "#1D6A4A" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-400" />
              </span>
              Calculadora
            </a>
            {!user && (
              <button
                type="button"
                onClick={loginGoogle}
                className="bg-[#1D6A4A] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap"
              >
                Iniciar
              </button>
            )}
            {user && (
              <button
                type="button"
                onClick={() => navigate("/panel")}
                className="bg-[#1D6A4A] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap"
              >
                Mi Panel
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="w-[38px] h-[38px] grid place-items-center rounded-xl bg-[#edf4f5] text-[#34515a]"
              aria-label="Abrir menú"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[92px]" />

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
