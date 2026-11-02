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
import IconoPaso from "../../../../components/common/IconoPaso";
import { IconoLinea } from "./utils";

// El estado de cada sección, en el tono del panel.
const PUNTO = {
  completado: "ok",
  pendiente:  "aviso",
  cargando:   "info",
  observado:  "alto",
};

// Fuera del componente a propósito: definido dentro se recrearía en cada
// render y React lo desmontaría y montaría cada vez.
function Flecha({ onClick, disabled, label, d }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="pnl-btn-icono"
      aria-label={label}
    >
      <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
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
    <div className="pnl-selsec shrink-0 sticky bottom-0 z-[15] pt-2" style={{ paddingBottom: "calc(8px + var(--abajo, 0px))" }}>
      {abierto && (
        <>
          {/* Tocar fuera cierra. */}
          <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Cerrar"
            onClick={() => setAbierto(false)} />
          <div className="pnl-selsec-lista absolute bottom-full left-[var(--gutter)] right-[var(--gutter)] mb-2 z-20 pnl-entra">
            {secciones.map((s) => {
              const on = s.id === activa;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { onCambiar(s.id); setAbierto(false); }}
                  aria-current={on ? "page" : undefined}
                  className="pnl-selsec-fila"
                >
                  <span className="pnl-selsec-ico">{s.icono ? <IconoPaso nombre={s.icono} /> : s.num}</span>
                  <span className="pnl-selsec-txt">
                    <b>{s.titulo}</b>
                    {s.subtitulo && <small>{s.subtitulo}</small>}
                  </span>
                  {s.estado && (
                    <span className="pnl-punto" data-tono={PUNTO[s.estado] || "neutro"} aria-hidden="true" />
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
          className="pnl-selsec-actual"
          aria-expanded={abierto}
          aria-haspopup="listbox"
        >
          <span className="pnl-selsec-ico">
            {sec.icono ? <IconoPaso nombre={sec.icono} /> : sec.num}
          </span>
          <span className="pnl-selsec-txt">
            <b>{sec.titulo}</b>
            <small>Sección {indice + 1} de {secciones.length}</small>
          </span>
          {sec.estado && (
            <span className="pnl-punto" data-tono={PUNTO[sec.estado] || "neutro"} aria-hidden="true" />
          )}
          {/* Se abre hacia arriba: cerrado, el chevrón apunta arriba. */}
          <IconoLinea nombre="chevron" className="pnl-chev pnl-selsec-chev" />
        </button>

        <Flecha onClick={() => ir(1)} disabled={indice >= secciones.length - 1} label="Sección siguiente" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </div>
    </div>
  );
}
