// Kit de diseño del CRM de Inspira Core (Agenda y Leads, 03/11/2026).
// Un solo lenguaje para listas y fichas, pensado primero para el celular:
//   · Avatar: iniciales con color estable por persona.
//   · Hoja: ficha de registro a pantalla completa (portal sobre la app) con cabecera fija,
//     pestañas fijas y UNA acción principal fija abajo. Volver, Esc y sin scroll de fondo.
//   · Segmentado: pestañas o filtros en píldoras con contador, desplazables.
//   · Seccion, Dato, Progreso: bloques de contenido.
// Tamaños: texto ≥ 12 px, objetivos táctiles ≥ 44 px, grises con contraste AA (#4f6672 sobre blanco).
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icono from "../../../components/common/Icono";
import { iniciales } from "./estilos";

const PALETA = ["#013446", "#02506b", "#1d6a4a", "#7d3c98", "#b45309", "#0f766e", "#9a3412", "#1e40af"];
export function Avatar({ nombre, tam = 40 }) {
  const t = String(nombre || "?");
  let h = 0;
  for (let i = 0; i < t.length; i += 1) h = (h * 31 + t.charCodeAt(i)) >>> 0;
  return (
    <span aria-hidden className="grid shrink-0 place-items-center rounded-full font-bold text-white"
      style={{ width: tam, height: tam, fontSize: tam * 0.38, background: PALETA[h % PALETA.length] }}>
      {iniciales(t)}
    </span>
  );
}

export function Chip({ tono = "neutro", children }) {
  const tonos = {
    neutro: "bg-neutral-100 text-neutral-700",
    ok: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
    ojo: "bg-amber-50 text-amber-900 ring-1 ring-amber-200",
    mal: "bg-red-50 text-red-700 ring-1 ring-red-200",
    info: "bg-sky-50 text-sky-900 ring-1 ring-sky-200",
    marca: "bg-primary/10 text-primary ring-1 ring-primary/20",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold ${tonos[tono]}`}>{children}</span>;
}

/** Pestañas o filtros: [{ id, texto, n? }] */
export function Segmentado({ opciones, valor, onCambio, etiqueta, oscuro = false }) {
  return (
    <div role="tablist" aria-label={etiqueta} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
      {opciones.map((o) => {
        const on = o.id === valor;
        const base = oscuro
          ? (on ? "bg-white text-primary-dark" : "bg-white/10 text-white/85 hover:bg-white/20")
          : (on ? "bg-primary-dark text-white" : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50");
        return (
          <button key={o.id} type="button" role="tab" aria-selected={on} onClick={() => onCambio(o.id)}
            className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition ${base}`}>
            {o.texto}
            {o.n != null && <span className={`rounded-full px-1.5 text-[11px] ${on ? (oscuro ? "bg-primary/10" : "bg-white/20") : (oscuro ? "bg-white/15" : "bg-neutral-100")}`}>{o.n}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Seccion({ titulo, extra, children }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200/70">
      {(titulo || extra) && (
        <div className="mb-3 flex items-baseline justify-between gap-2">
          {titulo && <h3 className="text-[14px] font-bold text-primary-dark">{titulo}</h3>}
          {extra && <span className="text-[12px] text-[#4f6672]">{extra}</span>}
        </div>
      )}
      <div className="text-[13.5px] text-neutral-800">{children}</div>
    </section>
  );
}

export const Dato = ({ k, v, ancho }) => (v ? (
  <div className={ancho ? "col-span-2" : "min-w-0"}>
    <p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#4f6672]">{k}</p>
    <p className="mt-0.5 break-words text-[14px] font-semibold leading-snug text-neutral-900">{v}</p>
  </div>
) : null);
export const Datos = ({ children }) => <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">{children}</div>;

/** Avance en pasos con línea: [{ texto, hecho }] */
export function Progreso({ pasos }) {
  const hechos = pasos.filter((p) => p.hecho).length;
  return (
    <div>
      <div className="flex items-center">
        {pasos.map((p, i) => (
          <div key={p.texto} className="flex flex-1 items-center last:flex-none">
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${p.hecho ? "bg-emerald-600 text-white" : "bg-neutral-200 text-neutral-600"}`}>
              {p.hecho ? <Icono nombre="check" size={13} /> : i + 1}
            </span>
            {i < pasos.length - 1 && <span className={`mx-1 h-0.5 flex-1 rounded ${pasos[i + 1].hecho || p.hecho ? "bg-emerald-500" : "bg-neutral-200"}`} />}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between gap-1">
        {pasos.map((p) => <span key={p.texto} className={`flex-1 text-center text-[10.5px] font-semibold last:flex-none ${p.hecho ? "text-emerald-800" : "text-[#4f6672]"}`}>{p.texto}</span>)}
      </div>
      <p className="sr-only">{hechos} de {pasos.length} pasos hechos</p>
    </div>
  );
}

/**
 * Ficha de registro a pantalla completa.
 * cabecera: { eyebrow, titulo, subtitulo, chips, contacto (nodos) }
 * pestanas: [{ id, texto, n? }] · pie: nodo con la acción principal (fijo abajo)
 */
export function Hoja({ etiqueta, cabecera, pestanas, pestana, onPestana, pie, onCerrar, children }) {
  const cerrarRef = useRef(onCerrar);
  useEffect(() => { cerrarRef.current = onCerrar; }, [onCerrar]);
  const cuerpo = useRef(null);
  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tecla = (e) => { if (e.key === "Escape") cerrarRef.current?.(); };
    window.addEventListener("keydown", tecla);
    return () => { document.body.style.overflow = antes; window.removeEventListener("keydown", tecla); };
  }, []);
  // Al cambiar de pestaña se vuelve arriba.
  useEffect(() => { cuerpo.current?.scrollTo?.({ top: 0 }); }, [pestana]);

  return createPortal(
    <div className="fixed inset-0 flex justify-center bg-black/50 sm:p-6" style={{ zIndex: 2000 }} onClick={onCerrar}>
      <div role="dialog" aria-modal="true" aria-label={etiqueta}
        className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-[#F2F6FA] shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <header className="shrink-0 bg-gradient-to-br from-[#013446] to-[#01283a] px-4 pb-3 text-white" style={{ paddingTop: "max(10px, env(safe-area-inset-top))" }}>
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={onCerrar} className="-ml-1 inline-flex min-h-[44px] items-center gap-1 rounded-xl px-2 text-[14px] font-bold hover:bg-white/10">
              <span aria-hidden className="text-[18px]">‹</span> Volver
            </button>
            {cabecera.eyebrow && <span className="text-[11px] font-bold uppercase tracking-[.12em] text-white/65">{cabecera.eyebrow}</span>}
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <Avatar nombre={cabecera.titulo} tam={46} />
            <div className="min-w-0">
              <h2 className="truncate text-[19px] font-bold leading-tight">{cabecera.titulo}</h2>
              {cabecera.subtitulo && <p className="mt-0.5 truncate text-[13px] text-white/80">{cabecera.subtitulo}</p>}
            </div>
          </div>
          {cabecera.chips && <div className="mt-2.5 flex flex-wrap gap-1.5">{cabecera.chips}</div>}
          {cabecera.contacto && <div className="mt-3 flex flex-wrap gap-2">{cabecera.contacto}</div>}
          {pestanas && <div className="mt-3"><Segmentado opciones={pestanas} valor={pestana} onCambio={onPestana} etiqueta="Secciones de la ficha" oscuro /></div>}
        </header>
        <div ref={cuerpo} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 p-3 sm:p-4">{children}</div>
        </div>
        {pie && (
          <footer className="shrink-0 border-t border-neutral-200 bg-white px-3 pt-2.5" style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
            <div className="flex gap-2 [&>*]:flex-1">{pie}</div>
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
}

/** Botón de contacto rápido en la cabecera oscura. */
export function Contacto({ href, icono, texto, onClick }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}
      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-white/12 px-3.5 text-[12.5px] font-bold text-white ring-1 ring-white/20 hover:bg-white/20"
      style={{ background: "rgba(255,255,255,.12)" }}>
      <Icono nombre={icono} size={15} />{texto}
    </a>
  );
}
