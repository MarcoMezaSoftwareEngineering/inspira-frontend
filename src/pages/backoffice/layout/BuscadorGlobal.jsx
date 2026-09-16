// Buscador global de Core: un cliente por nombre, DNI, correo o teléfono,
// desde cualquier pantalla. Botón con lupa junto a la campana; también con
// Ctrl/Cmd + K. Elegir un resultado abre su ficha.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { boGET } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";

const SERVICIO = { master: "Máster", visa: "Visado", ee: "Estancia", mod: "Modificatoria", fp: "FP", legal: "Extranjería" };

export default function BuscadorGlobal() {
  const [abierto, setAbierto] = useState(false);
  const [q, setQ] = useState("");
  const [res, setRes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const temporizador = useRef(null);

  useEffect(() => {
    const tecla = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setAbierto(true); }
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, []);

  function buscar(v) {
    setQ(v);
    clearTimeout(temporizador.current);
    if (v.trim().length < 2) { setRes([]); return; }
    temporizador.current = setTimeout(async () => {
      setCargando(true);
      const r = await boGET(`/backoffice/clientes?q=${encodeURIComponent(v.trim())}&pageSize=10&orden=recientes`);
      setCargando(false);
      setRes(r.ok ? r.clientes || [] : []);
    }, 250);
  }

  function elegir(c) {
    setAbierto(false); setQ(""); setRes([]);
    navigate(`/backoffice/clientes?cliente=${c.id_cliente}`);
    // Si ya estábamos en Clientes, la pantalla no se remonta: forzarlo.
    if (window.location.pathname === "/backoffice/clientes") window.location.reload();
  }

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)} aria-label="Buscar cliente (Ctrl+K)" title="Buscar cliente (Ctrl+K)"
        className="fixed top-2.5 right-[108px] md:top-3 md:right-[64px] z-50 w-10 h-10 rounded-xl bg-white/95 border border-neutral-200 shadow-sm grid place-items-center text-[#1A3557] hover:bg-white">
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M20 20l-3.5-3.5" />
        </svg>
      </button>

      {abierto && createPortal(
        <div className="fixed inset-0 z-[95] bg-[#011c26]/50 backdrop-blur-sm p-3 sm:pt-[12vh]" onClick={() => setAbierto(false)} role="presentation">
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()} role="presentation">
            <div className="flex items-center gap-2 px-4 border-b border-neutral-200">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M20 20l-3.5-3.5" />
              </svg>
              <input autoFocus value={q} onChange={(e) => buscar(e.target.value)}
                placeholder="Nombre, DNI, correo o teléfono…"
                className="flex-1 py-4 text-[15px] outline-none bg-transparent" />
              {cargando && <span className="text-[11px] text-neutral-400">buscando…</span>}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {q.trim().length >= 2 && !cargando && !res.length && (
                <p className="px-4 py-6 text-center text-[13px] text-neutral-400">Sin resultados</p>
              )}
              {res.map((c) => (
                <button key={c.id_cliente} type="button" onClick={() => elegir(c)}
                  className="w-full text-left px-4 py-3 hover:bg-[#F3F8F5] border-b border-neutral-100 last:border-b-0">
                  <span className="block text-[14px] font-semibold text-neutral-900">{c.nombre || c.email_contacto}</span>
                  <span className="block text-[11.5px] text-neutral-500 truncate">
                    {[c.dni && `DNI ${c.dni}`, c.telefono, c.email_contacto].filter(Boolean).join(" · ")}
                  </span>
                  {c.etapas?.length > 0 && (
                    <span className="flex gap-1 mt-1 flex-wrap">
                      {c.etapas.map((e) => (
                        <span key={e.id_solicitud} className="text-[10px] font-semibold bg-[#EEF2F8] text-[#1A3557] rounded px-1.5 py-0.5">
                          {SERVICIO[e.servicio] || e.servicio}{e.etapa ? ` · ${e.etapa}` : ""}
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
