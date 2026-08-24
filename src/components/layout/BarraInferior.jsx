// src/components/layout/BarraInferior.jsx
// Barra de navegación inferior tipo app. Da acceso permanente a lo esencial
// sin obligar a volver arriba: es la navegación primaria en móvil.
import { useEffect, useState } from "react";
import Icono from "../common/Icono";
import { navigate } from "../../services/navigate";

const ITEMS = [
  { href: "/", icono: "casa", label: "Inicio" },
  { href: "/servicios", icono: "brujula", label: "Servicios" },
  { href: "/asistente", icono: "robot", label: "Asistente", destacado: true },
  { href: "/casos-de-exito", icono: "estrella", label: "Casos" },
];

export default function BarraInferior({ onReservar }) {
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

  const activo = (href) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <nav className="barra-inferior" aria-label="Navegación principal">
      {ITEMS.map((it) => (
        <a
          key={it.href}
          href={it.href}
          onClick={(e) => go(e, it.href)}
          className={`bi-item${activo(it.href) ? " activo" : ""}${
            it.destacado ? " destacado" : ""
          }`}
        >
          <Icono nombre={it.icono} size={21} />
          <span>{it.label}</span>
        </a>
      ))}

      <button type="button" onClick={onReservar} className="bi-item bi-cta">
        <Icono nombre="calendario" size={21} />
        <span>Reservar</span>
      </button>
    </nav>
  );
}
