// src/components/layout/BarraInferior.jsx
// Barra de navegación inferior tipo app: la navegación primaria en el móvil y
// la tableta (se oculta desde 1100 px). Cinco destinos, aprobados por el
// cliente el 14/09/2026: Inicio · Servicios · Máster · Mi portal · Reservar.
//
// «Mi portal» lleva a su panel a quien ya entró y a la presentación del portal
// (/plataforma) a quien todavía no. «Reservar» abre Calendly directamente,
// igual que todos los botones de reservar de la web (config/contacto.js).
import { useEffect, useState } from "react";
import Icono from "../common/Icono";
import { navigate } from "../../services/navigate";
import { useAuth } from "../../context/AuthContext";
import { CALENDLY_URL } from "../../config/contacto";
import { BARRA_ETIQUETA } from "../../config/portalMarca";

// «Servicios» se enciende en el catálogo y en cada servicio, salvo el máster,
// que tiene su propio botón.
const esMaster = (p) => p.startsWith("/servicios/master") || p.startsWith("/master-");
const esServicios = (p) => p === "/servicios" || (p.startsWith("/servicios/") && !esMaster(p));

export default function BarraInferior() {
  const { user } = useAuth();
  const [path, setPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    navigate(href);
    window.scrollTo({ top: 0, behavior: "instant" });
    setPath(href);
  };

  const items = [
    { href: "/", icono: "casa", label: "Inicio", activo: path === "/" },
    { href: "/servicios", icono: "brujula", label: "Servicios", activo: esServicios(path) },
    { href: "/servicios/master", icono: "birrete", label: "Máster", activo: esMaster(path) },
    {
      href: user ? "/panel" : "/plataforma",
      icono: "panel",
      label: BARRA_ETIQUETA,
      activo: path.startsWith("/plataforma"),
    },
  ];

  return (
    <nav className="barra-inferior" aria-label="Navegación principal">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          onClick={(e) => go(e, it.href)}
          aria-current={it.activo ? "page" : undefined}
          className={`bi-item${it.activo ? " activo" : ""}`}
        >
          <Icono nombre={it.icono} size={21} />
          <span>{it.label}</span>
        </a>
      ))}

      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Reservar la sesión diagnóstico"
        className="bi-item bi-cta"
      >
        <Icono nombre="calendario" size={21} />
        <span>Reservar</span>
      </a>
    </nav>
  );
}
