// src/pages/backoffice/checklist/components/ChecklistItemsList.jsx
//
// Lista de documentos del checklist: una tarjeta por ítem con sus etiquetas,
// interruptores de obligatorio / archivo y menú de acciones.
import { useEffect, useRef, useState } from "react";

function Switch({ on, disabled, onClick, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "relative w-9 h-5 rounded-full transition-colors shrink-0",
        on ? "bg-gradient-to-r from-[#138257] to-[#27a16e]" : "bg-[#dbe3df]",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,.18)] transition-transform ${on ? "translate-x-4" : ""}`}
      />
    </button>
  );
}

function MenuAcciones({ item, onEditar, onDuplicar, onEliminar }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    function onClick(e) {
      if (!ref.current?.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [abierto]);

  function ejecutar(fn) {
    setAbierto(false);
    fn(item);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Más opciones"
        onClick={() => setAbierto((v) => !v)}
        className="w-[34px] h-[34px] rounded-[10px] border border-[#dfe7e2] bg-white grid place-items-center text-[#5a6a61] hover:border-[#c8d8cf] hover:bg-[#f7faf8]"
      >
        <svg viewBox="0 0 24 24" className="w-[17px] h-[17px]" fill="currentColor">
          <circle cx="12" cy="5" r="1.3" />
          <circle cx="12" cy="12" r="1.3" />
          <circle cx="12" cy="19" r="1.3" />
        </svg>
      </button>

      {abierto && (
        <div className="absolute right-0 top-10 z-20 min-w-[180px] p-1.5 rounded-xl bg-white border border-[#dfe7e2] shadow-[0_28px_80px_rgba(15,61,42,.16)]">
          <button
            type="button"
            onClick={() => ejecutar(onEditar)}
            className="w-full flex items-center gap-2 rounded-[9px] px-2.5 py-[9px] text-left text-[11px] font-semibold text-[#425148] hover:bg-[#f4f8f5]"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
            </svg>
            Editar
          </button>
          <button
            type="button"
            onClick={() => ejecutar(onDuplicar)}
            className="w-full flex items-center gap-2 rounded-[9px] px-2.5 py-[9px] text-left text-[11px] font-semibold text-[#425148] hover:bg-[#f4f8f5]"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="8" y="8" width="11" height="11" rx="2" />
              <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
            </svg>
            Duplicar
          </button>
          <button
            type="button"
            onClick={() => ejecutar(onEliminar)}
            className="w-full flex items-center gap-2 rounded-[9px] px-2.5 py-[9px] text-left text-[11px] font-semibold text-[#dc3d4f] hover:bg-[#fff1f3]"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" />
            </svg>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChecklistItemsList({
  items,
  mostrarDescripciones,
  puedeEditar,
  itemsEnCurso,
  onToggle,
  onEditar,
  onDuplicar,
  onEliminar,
}) {
  return (
    <div className="p-2">
      {items.map((item, idx) => {
        const ocupado = itemsEnCurso.has(item.id_item);
        return (
          <article
            key={item.id_item}
            style={{ animationDelay: `${Math.min(idx * 22, 220)}ms` }}
            className={[
              "group my-[7px] grid grid-cols-[minmax(0,1fr)_auto] max-sm:grid-cols-1 gap-3 items-start",
              "rounded-[15px] border border-[#e5ece8] bg-gradient-to-b from-white to-[#fdfefd] p-3.5",
              "transition-all hover:-translate-y-px hover:border-[#bfdccd] hover:bg-white hover:shadow-[0_10px_26px_rgba(16,78,53,.08)]",
              "motion-safe:animate-[bo-rise_.38s_ease_both]",
              ocupado ? "opacity-60" : "",
            ].join(" ")}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-extrabold leading-[1.35] text-[#12261c]">
                  {item.nombre_item}
                </span>
                <span
                  className={[
                    "inline-flex h-[23px] items-center rounded-full border px-2 text-[9px] font-extrabold uppercase tracking-[0.05em]",
                    item.obligatorio
                      ? "bg-[#fff1f3] text-[#dc3d4f] border-[#ffd9de]"
                      : "bg-[#fff8e7] text-[#bd7915] border-[#f5dfad]",
                  ].join(" ")}
                >
                  {item.obligatorio ? "Obligatorio" : "Opcional"}
                </span>
                {item.permite_archivo && (
                  <span className="inline-flex h-[23px] items-center rounded-full border border-[#dbe7ff] bg-[#eef4ff] px-2 text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#3674d9]">
                    Archivo
                  </span>
                )}
              </div>

              {mostrarDescripciones && item.descripcion && (
                <p className="mt-[5px] text-[11px] leading-[1.5] text-[#6e7c74]">{item.descripcion}</p>
              )}

              <div className="mt-2 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-[5px] text-[10px] text-[#78857e]">
                  <svg viewBox="0 0 24 24" className="w-[13px] h-[13px]" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3 8-8" />
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                  {item.permite_archivo ? "Requiere archivo adjunto" : "Solo verificación"}
                </span>
                <span className="inline-flex items-center gap-[5px] text-[10px] text-[#78857e]">
                  <svg viewBox="0 0 24 24" className="w-[13px] h-[13px]" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 2" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  Ítem #{item.id_item}
                </span>
              </div>
            </div>

            {puedeEditar && (
              <div className="flex items-center gap-1.5 pl-2 max-sm:pl-0 max-sm:justify-end max-sm:flex-wrap">
                <div className="flex items-center gap-[7px] mr-1">
                  <span className="hidden sm:inline text-[10px] whitespace-nowrap text-[#738078]">Obligatorio</span>
                  <Switch
                    on={item.obligatorio}
                    disabled={ocupado}
                    label="Cambiar obligatoriedad"
                    onClick={() => onToggle(item, "obligatorio")}
                  />
                </div>
                <div className="flex items-center gap-[7px] mr-1">
                  <span className="hidden sm:inline text-[10px] whitespace-nowrap text-[#738078]">Archivo</span>
                  <Switch
                    on={item.permite_archivo}
                    disabled={ocupado}
                    label="Cambiar si requiere archivo"
                    onClick={() => onToggle(item, "permite_archivo")}
                  />
                </div>
                <MenuAcciones
                  item={item}
                  onEditar={onEditar}
                  onDuplicar={onDuplicar}
                  onEliminar={onEliminar}
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
