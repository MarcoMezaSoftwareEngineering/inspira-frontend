// El selector de sección del móvil, el mismo para máster y visado.
//
// Con nueve o diez bloques, una tira deslizable obliga a buscar a ciegas; un
// desplegable los enseña todos de una vez, con su estado, y las flechas dejan
// avanzar paso a paso. Vivía solo en el visado; el máster tenía la tira.
//
// Va abajo. El móvil se sostiene por abajo, y la barra de secciones arriba a
// la izquierda es la esquina más lejos del pulgar. El desplegable se abre
// hacia arriba por lo mismo.
import { useState } from "react";

const PUNTO = {
  completado: "bg-emerald-500",
  pendiente:  "bg-amber-400",
  cargando:   "bg-blue-400 animate-pulse",
  observado:  "bg-red-400",
};

// Fuera del componente a propósito: definido dentro se recrearía en cada
// render y React lo desmontaría y montaría cada vez.
function Flecha({ onClick, disabled, label, d }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ux-tap shrink-0 w-11 h-11 rounded-xl border border-neutral-200 bg-white grid place-items-center text-neutral-500 disabled:opacity-30"
      aria-label={label}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
    </button>
  );
}

export default function SelectorSeccionMovil({ secciones, activa, onCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const indice = Math.max(0, secciones.findIndex((s) => s.id === activa));
  const sec = secciones[indice] || secciones[0];
  if (!sec) return null;

  const ir = (paso) => {
    const destino = secciones[indice + paso];
    if (destino) { onCambiar(destino.id); setAbierto(false); }
  };

  return (
    <div className="md:hidden shrink-0 relative pt-2" style={{ paddingBottom: "var(--abajo, 0px)" }}>
      {abierto && (
        <>
          {/* Tocar fuera cierra. */}
          <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Cerrar"
            onClick={() => setAbierto(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-2 z-20 bg-white border border-neutral-200 rounded-2xl shadow-lg p-1.5 max-h-[60vh] overflow-y-auto pnl-entra">
            {secciones.map((s) => {
              const on = s.id === activa;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { onCambiar(s.id); setAbierto(false); }}
                  aria-current={on ? "page" : undefined}
                  className={`ux-tap w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-left ${
                    on ? "bg-primary" : "active:bg-neutral-100"
                  }`}
                >
                  <span className={`shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[11px] font-black ${
                    on ? "bg-white/20 text-white" : "bg-primary-light/10 text-primary-light"
                  }`}>{s.num}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[13px] font-semibold truncate ${on ? "text-white" : "text-neutral-800"}`}>
                      {s.titulo}
                    </span>
                    {s.subtitulo && (
                      <span className={`block text-[10.5px] truncate ${on ? "text-white/60" : "text-neutral-400"}`}>
                        {s.subtitulo}
                      </span>
                    )}
                  </span>
                  {s.estado && (
                    <span className={`shrink-0 w-2 h-2 rounded-full ${on ? "bg-white/40" : (PUNTO[s.estado] || "bg-neutral-300")}`} />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <Flecha onClick={() => ir(-1)} disabled={indice <= 0} label="Sección anterior" d="M15.75 19.5L8.25 12l7.5-7.5" />

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="ux-tap flex-1 min-w-0 flex items-center gap-2.5 bg-white border border-neutral-200 rounded-xl shadow-sm px-3 py-2.5 text-left"
          aria-expanded={abierto}
          aria-haspopup="listbox"
        >
          <span className="shrink-0 w-7 h-7 rounded-lg bg-primary-light/10 text-primary-light grid place-items-center text-[11px] font-black">
            {sec.num}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold text-neutral-900 truncate">{sec.titulo}</span>
            <span className="block text-[10.5px] text-neutral-400 truncate">
              Sección {indice + 1} de {secciones.length}
            </span>
          </span>
          {sec.estado && (
            <span className={`shrink-0 w-2 h-2 rounded-full ${PUNTO[sec.estado] || "bg-neutral-300"}`} />
          )}
          <svg className={`shrink-0 w-4 h-4 text-neutral-400 transition-transform ${abierto ? "" : "rotate-180"}`}
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <Flecha onClick={() => ir(1)} disabled={indice >= secciones.length - 1} label="Sección siguiente" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </div>
    </div>
  );
}
