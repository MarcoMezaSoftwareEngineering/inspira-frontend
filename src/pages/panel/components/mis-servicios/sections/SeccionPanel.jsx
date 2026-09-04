// src/pages/panel/components/mis-servicios/sections/SeccionPanel.jsx
import { createContext, useContext, useState } from "react";

// Cuando este contexto es true, los SeccionPanel se abren automáticamente
// y no permiten colapsar (para el panel de detalle de dos columnas)
export const SeccionSiempreAbiertoCtx = createContext(false);

const ESTADO_CFG = {
  pendiente:  { label: "Pendiente",  bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
  completado: { label: "Completado", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  observado:  { label: "Observado",  bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500"     },
  cargando:   { label: "Cargando…",  bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200",    dot: "bg-blue-400 animate-pulse" },
};

export default function SeccionPanel({
  numero,
  titulo,
  subtitulo,
  estado,
  children,
  defaultOpen = false,
  sectionId,
  contentClassName,
  grow,
  open: openProp,
  onToggle: onToggleProp,
}) {
  const siempreAbierto = useContext(SeccionSiempreAbiertoCtx);
  const [openInternal, setOpenInternal] = useState(defaultOpen || siempreAbierto);

  const open   = siempreAbierto ? true : (openProp !== undefined ? openProp : openInternal);
  const toggle = siempreAbierto ? () => {} : (openProp !== undefined ? onToggleProp : () => setOpenInternal((v) => !v));

  const cfg = estado ? ESTADO_CFG[estado] : null;

  // En modo siempreAbierto: header es un div no interactivo
  const Header = siempreAbierto ? "div" : "button";
  const headerProps = siempreAbierto
    ? {}
    : { type: "button", onClick: toggle };

  return (
    <section className={`border border-neutral-200 rounded-2xl bg-white shadow-sm overflow-hidden ${siempreAbierto ? "flex-1 min-h-0 flex flex-col" : ""}`}>
      <Header
        {...headerProps}
        className={`shrink-0 w-full text-left px-5 py-4 flex items-center justify-between gap-4 ${
          !siempreAbierto ? "hover:bg-neutral-50/60 transition-colors" : ""
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{numero}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-900">{titulo}</p>
            {subtitulo && (
              <p className="text-xs text-neutral-500 mt-0.5 truncate">{subtitulo}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {cfg && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          )}
          {/* Solo mostrar chevron en modo acordeón (no siempreAbierto) */}
          {!siempreAbierto && (
            open ? (
              <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            )
          )}
        </div>
      </Header>

      {open && (
        <div className={`border-t border-neutral-100 ${
          siempreAbierto
            ? (contentClassName !== undefined
                ? contentClassName
                : "flex-1 min-h-0 overflow-y-auto flex flex-col px-5 py-4")
            : (contentClassName !== undefined
                ? contentClassName
                : "px-5 py-4 overflow-y-auto max-h-[calc(100vh-200px)]")
        }`}>
          {children}
        </div>
      )}
    </section>
  );
}
