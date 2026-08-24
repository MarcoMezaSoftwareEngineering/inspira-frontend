// src/components/layout/Header/MobileMenuNavLinks.jsx
// Navegación del menú móvil. El bloque de servicios despliega el catálogo
// COMPLETO por categoría y subgrupo (igual que el mega-menú de escritorio),
// con acordeones para que quepa sin comprimir nada.
import { useState } from "react";
import { navItems } from "./header.data";
import { CATEGORIAS, hrefServicio } from "../../../config/servicios";
import { navigate } from "../../../services/navigate";
import Icono from "../../common/Icono";

const ICONO_CAT = {
  extranjeria: "pasaporte",
  "tramites-espana": "huella",
  educativa: "birrete",
};

export default function MobileMenuNavLinks({ onClose }) {
  // Todas las categorías arrancan abiertas: el visitante debe poder ver el
  // catálogo entero (incluidas homologaciones y los otros destinos) sin
  // tener que descubrir que hay algo plegado. El panel tiene scroll propio.
  const [cerradas, setCerradas] = useState(() => new Set());
  const alternar = (id) =>
    setCerradas((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const go = (e, href) => {
    e.preventDefault();
    navigate(href);
    window.scrollTo({ top: 0, behavior: "instant" });
    onClose?.();
  };

  const resto = navItems.filter((i) => !i.mega);

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {/* Catálogo completo de servicios */}
      <span className="px-1 pb-1 pt-2 text-[11px] font-extrabold uppercase tracking-widest text-accent">
        Migra a España
      </span>

      <a
        href="/servicios"
        onClick={(e) => go(e, "/servicios")}
        className="mb-1 flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5 text-sm font-extrabold text-primary"
      >
        Ver todos los servicios
        <span aria-hidden>→</span>
      </a>

      {CATEGORIAS.map((cat) => {
        const open = !cerradas.has(cat.id);
        return (
          <div key={cat.id} className="border-b border-neutral-200 last:border-0">
            <button
              type="button"
              onClick={() => alternar(cat.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-2.5 py-2.5 text-left text-sm font-bold text-primary"
            >
              <Icono nombre={ICONO_CAT[cat.id] || "documento"} size={17} />
              <span className="flex-1">{cat.titulo}</span>
              <span
                className={`text-accent transition-transform ${
                  open ? "rotate-45" : ""
                }`}
                aria-hidden
              >
                +
              </span>
            </button>

            {open && (
              <div className="pb-2 pl-1">
                {cat.grupos.map((grupo) => (
                  <div key={grupo.id} className="mb-2">
                    <p className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-neutral-500">
                      {grupo.titulo}
                    </p>
                    <ul className="border-l-2 border-secondary pl-2">
                      {grupo.servicios.map((s) => {
                        const href = hrefServicio(s);
                        return (
                          <li key={s.id}>
                            <a
                              href={href}
                              onClick={(e) => go(e, href)}
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] leading-snug text-neutral-900 active:bg-secondary"
                            >
                              {s.nombre}
                              {s.etiqueta && (
                                <em className="not-italic rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-primary">
                                  {s.etiqueta}
                                </em>
                              )}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Resto de secciones */}
      <span className="px-1 pb-1 pt-3 text-[11px] font-extrabold uppercase tracking-widest text-accent">
        Explora
      </span>
      <ul className="flex flex-col">
        {resto.map((item) =>
          item.externo ? (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className={
                  item.cta
                    ? "mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-3 text-sm font-extrabold text-white"
                    : "block py-2 text-sm font-semibold text-primary"
                }
              >
                {item.cta && "📅"} {item.label}
              </a>
            </li>
          ) : (
            <li key={item.label}>
              <a
                href={item.href}
                onClick={(e) => go(e, item.href)}
                className="flex items-center gap-2 py-2 text-sm font-semibold text-primary"
              >
                {item.ia && <Icono nombre="robot" size={16} />}
                {item.label}
              </a>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
