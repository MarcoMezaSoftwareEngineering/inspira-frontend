// src/pages/backoffice/checklist/components/ServicePicker.jsx
//
// Buscador de servicios estilo command palette: se abre con clic o Ctrl/Cmd+K,
// filtra por nombre o código, recuerda los últimos usados y se navega con el
// teclado (flechas + Enter + Esc).
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FILTROS_SERVICIO,
  inicialServicio,
  leerRecientes,
  metaServicio,
  puntuarServicio,
} from "../checklistUtils";

export default function ServicePicker({ servicios, selectedId, onSelect, loading }) {
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [filtro, setFiltro] = useState("all");
  const [activo, setActivo] = useState(0);
  const [recientes, setRecientes] = useState(leerRecientes);

  const contenedorRef = useRef(null);
  const inputRef = useRef(null);
  const listaRef = useRef(null);

  // Cada servicio llega del backend sin familia ni filtro: se derivan del nombre.
  const enriquecidos = useMemo(
    () => servicios.map((s) => ({ ...s, ...metaServicio(s) })),
    [servicios]
  );

  const seleccionado = enriquecidos.find((s) => s.id_servicio === selectedId) || null;

  // Resultados ordenados; cada uno sabe si abre una nueva cabecera de familia.
  const resultados = useMemo(() => {
    const q = consulta.trim();
    const sinAgrupar = Boolean(q) || filtro !== "all";

    const ordenados = enriquecidos
      .map((s) => ({ s, puntos: puntuarServicio(s, q, s.grupo) }))
      .filter(({ s, puntos }) => puntos >= 0 && (filtro === "all" || s.filtro === filtro))
      .sort((a, b) => {
        if (q && b.puntos !== a.puntos) return b.puntos - a.puntos;
        return a.s.nombre.localeCompare(b.s.nombre, "es");
      })
      .map(({ s }) => s);

    return ordenados.map((s, i) => ({
      ...s,
      mostrarGrupo: !sinAgrupar && (i === 0 || ordenados[i - 1].grupo !== s.grupo),
    }));
  }, [enriquecidos, consulta, filtro]);

  const serviciosRecientes = recientes
    .map((id) => enriquecidos.find((s) => s.id_servicio === id))
    .filter(Boolean);

  // Índice activo saneado: la lista puede encogerse al filtrar.
  const indiceActivo = Math.min(activo, Math.max(0, resultados.length - 1));

  function abrir() {
    setAbierto(true);
    setRecientes(leerRecientes());
    const idx = resultados.findIndex((s) => s.id_servicio === selectedId);
    setActivo(idx >= 0 ? idx : 0);
    setTimeout(() => inputRef.current?.select(), 20);
  }

  function cerrar() {
    setAbierto(false);
    setActivo(0);
  }

  function elegir(id) {
    onSelect(id);
    setConsulta("");
    setFiltro("all");
    cerrar();
    // onSelect ya guardó el reciente; releemos para reflejarlo en la próxima apertura
    setTimeout(() => setRecientes(leerRecientes()), 0);
  }

  // Ctrl/Cmd + K desde cualquier parte de la pantalla
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (abierto) cerrar();
        else abrir();
      } else if (e.key === "Escape" && abierto) {
        cerrar();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Clic fuera del buscador
  useEffect(() => {
    if (!abierto) return;
    function onClick(e) {
      if (!contenedorRef.current?.contains(e.target)) cerrar();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [abierto]);

  // Mantiene visible la opción activa al navegar con flechas
  useEffect(() => {
    listaRef.current
      ?.querySelector('[data-activo="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [indiceActivo, resultados.length]);

  function onKeyDownInput(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (resultados.length) setActivo((indiceActivo + 1) % resultados.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (resultados.length) setActivo((indiceActivo - 1 + resultados.length) % resultados.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const destino = resultados[indiceActivo];
      if (destino) elegir(destino.id_servicio);
    } else if (e.key === "Escape") {
      cerrar();
    }
  }

  return (
    <div className="relative min-w-0" ref={contenedorRef}>
      <label className="block mb-[7px] text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#77827d]">
        Buscar o cambiar servicio
      </label>

      <button
        type="button"
        onClick={() => (abierto ? cerrar() : abrir())}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className={[
          "w-full min-h-[64px] grid grid-cols-[40px_minmax(0,1fr)_auto_auto] items-center gap-2.5 px-[11px] py-[9px]",
          "rounded-[15px] border bg-white text-left transition-all",
          abierto
            ? "border-[#69c798] shadow-[0_0_0_4px_rgba(50,181,121,.11),0_14px_32px_rgba(16,93,62,.10)]"
            : "border-[#d6e5dc] hover:border-[#a9d7bf] hover:-translate-y-px hover:shadow-[0_10px_25px_rgba(17,101,67,.08)]",
        ].join(" ")}
      >
        <span className="w-10 h-10 rounded-xl grid place-items-center text-[#167a53] bg-gradient-to-br from-[#eaf8f0] to-[#f6fcf9] shadow-[inset_0_0_0_1px_#d8eee2]">
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.4-4.4" />
            <path d="M8.5 11h5" />
          </svg>
        </span>

        <span className="min-w-0">
          <span className="block truncate text-[13px] font-extrabold tracking-[-0.01em]">
            {loading && !seleccionado
              ? "Cargando servicios…"
              : seleccionado?.nombre || "Selecciona un servicio"}
          </span>
          <span className="mt-1 flex items-center gap-[7px] min-w-0 text-[10px] font-semibold text-[#748179]">
            <span className="truncate">{seleccionado?.grupo || "Ninguno seleccionado"}</span>
            {seleccionado && (
              <>
                <span>·</span>
                <span className="shrink-0 px-1.5 py-[3px] rounded-[7px] font-extrabold tracking-[0.05em] text-[#17744f] bg-[#edf8f2] border border-[#d9eee3]">
                  {seleccionado.codigo}
                </span>
              </>
            )}
          </span>
        </span>

        <span className="hidden sm:inline-flex min-w-[47px] h-[26px] px-[7px] items-center justify-center rounded-lg bg-[#f4f7f5] border border-[#e1e8e4] text-[#7b8880] shadow-[0_1px_0_#d7dfda] text-[9px] font-extrabold whitespace-nowrap">
          Ctrl K
        </span>

        <span className={`w-[30px] h-[30px] rounded-[9px] grid place-items-center transition-transform ${abierto ? "rotate-180 bg-[#f0f7f3] text-[#0f5e3f]" : "text-[#728079]"}`}>
          <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="m7 9 5 5 5-5" />
          </svg>
        </span>
      </button>

      {abierto && (
        <div
          className={[
            "absolute left-0 top-[calc(100%+10px)] z-50 overflow-hidden",
            "w-[min(760px,calc(100vw-80px))] max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-24 max-sm:w-auto",
            "rounded-[18px] border border-[#d7e3dc] bg-white/[0.98] backdrop-blur",
            "shadow-[0_28px_75px_rgba(9,63,40,.22),0_8px_25px_rgba(9,63,40,.10)]",
          ].join(" ")}
        >
          <div className="p-3 border-b border-[#e7ede9] bg-gradient-to-b from-[#fbfefc] to-white">
            <div className="grid grid-cols-[38px_minmax(0,1fr)_auto] items-center min-h-[52px] rounded-[13px] border border-[#cadfd3] bg-white shadow-[0_0_0_4px_rgba(48,172,116,.06)]">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] justify-self-center stroke-[#5b7868]" fill="none" strokeWidth="2">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-4.4-4.4" />
              </svg>
              <input
                ref={inputRef}
                autoFocus
                type="text"
                autoComplete="off"
                spellCheck="false"
                value={consulta}
                onChange={(e) => { setConsulta(e.target.value); setActivo(0); }}
                onKeyDown={onKeyDownInput}
                placeholder="Busca por nombre, código 015, comunidad, Premium, Visado…"
                className="w-full h-[50px] bg-transparent border-0 outline-none pr-2 text-sm font-semibold text-[#10251c] placeholder:font-normal placeholder:text-[#9aa59f]"
              />
              {consulta && (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  onClick={() => { setConsulta(""); setActivo(0); inputRef.current?.focus(); }}
                  className="mr-[7px] w-8 h-8 rounded-[9px] grid place-items-center text-[#8d9992] hover:bg-[#f0f5f2] hover:text-[#405248]"
                >
                  <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
            {FILTROS_SERVICIO.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => { setFiltro(f.id); setActivo(0); inputRef.current?.focus(); }}
                className={[
                  "rounded-full px-[9px] py-1.5 text-[10px] font-bold border transition-colors",
                  filtro === f.id
                    ? "bg-[#eaf7f0] text-[#116943] border-[#b9dfca]"
                    : "bg-white text-[#66736c] border-[#e0e8e3] hover:border-[#bddaca] hover:text-[#146b49]",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>

          {!consulta.trim() && serviciosRecientes.length > 0 && (
            <div className="px-3 pt-2.5">
              <div className="mb-[7px] flex items-center justify-between text-[9px] font-extrabold uppercase tracking-[0.10em] text-[#829088]">
                <span>Usados recientemente</span>
                <span className="hidden sm:inline">Acceso rápido</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {serviciosRecientes.map((s) => (
                  <button
                    key={s.id_servicio}
                    type="button"
                    title={s.nombre}
                    onClick={() => elegir(s.id_servicio)}
                    className="max-w-[210px] truncate rounded-[9px] border border-[#e1e9e4] bg-[#f9fbfa] px-2 py-1.5 text-[10px] font-bold text-[#435248] hover:bg-[#eef8f2] hover:border-[#c6dfd1] hover:text-[#116943]"
                  >
                    {s.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2.5 px-[13px] pt-2.5 pb-2 text-[9px] font-semibold text-[#87938c]">
            <strong className="text-[10px] text-[#4f6257]">
              {resultados.length} {resultados.length === 1 ? "servicio" : "servicios"}
            </strong>
            <span className="hidden sm:inline">↑ ↓ navegar · Enter elegir · Esc cerrar</span>
          </div>

          {resultados.length > 0 ? (
            <div
              ref={listaRef}
              role="listbox"
              className="max-h-[340px] max-sm:max-h-[45vh] overflow-auto px-2 pb-2"
            >
              {resultados.map((s, index) => {
                const esSeleccionado = s.id_servicio === selectedId;
                const esActivo = index === indiceActivo;
                return (
                  <div key={s.id_servicio}>
                    {s.mostrarGrupo && (
                      <div className="px-[9px] pt-2.5 pb-[5px] text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#8b9690]">
                        {s.grupo}
                      </div>
                    )}
                    <button
                      type="button"
                      role="option"
                      aria-selected={esSeleccionado}
                      data-activo={esActivo}
                      onMouseEnter={() => setActivo(index)}
                      onClick={() => elegir(s.id_servicio)}
                      className={[
                        "w-full grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl px-2.5 py-[9px] text-left border transition-colors",
                        esSeleccionado
                          ? "bg-gradient-to-r from-[#edf9f2] to-[#f8fcfa] border-[#cae5d6]"
                          : esActivo
                            ? "bg-[#f3faf6] border-[#d7eadf]"
                            : "border-transparent",
                        esActivo ? "shadow-[inset_3px_0_0_#36b777]" : "",
                      ].join(" ")}
                    >
                      <span className={`w-[34px] h-[34px] rounded-[10px] grid place-items-center border text-[10px] font-black text-[#1c7451] ${esSeleccionado ? "bg-[#dff3e8] border-[#c6e5d4]" : "bg-[#f1f6f3] border-[#e1eae5]"}`}>
                        {inicialServicio(s)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-bold leading-[1.3]">{s.nombre}</span>
                        <span className="mt-1 flex items-center gap-1.5 min-w-0 text-[9px] text-[#839087]">
                          <span className="truncate">{s.grupo}</span>
                          <span>·</span>
                          <span className="shrink-0">Servicio {s.codigo}</span>
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className={[
                          "hidden sm:inline-flex h-[21px] items-center rounded-full border px-[7px] text-[8px] font-extrabold uppercase tracking-[0.04em]",
                          s.activo
                            ? "bg-[#edf8f2] text-[#18734e] border-[#d6ebdf]"
                            : "bg-[#f3f4f4] text-[#808a85] border-[#e4e8e6]",
                        ].join(" ")}>
                          {s.activo ? "Activo" : "Inactivo"}
                        </span>
                        <span className="min-w-[37px] h-[23px] px-[7px] inline-grid place-items-center rounded-lg bg-[#f7f9f8] border border-[#e2e8e4] text-[9px] font-extrabold text-[#64736b]">
                          {s.codigo}
                        </span>
                        {esSeleccionado && (
                          <span className="w-5 h-5 rounded-[7px] grid place-items-center bg-[#178157] text-white">
                            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="m6 12 4 4 8-9" />
                            </svg>
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-5 pt-[38px] pb-[42px] text-center">
              <div className="w-[46px] h-[46px] mx-auto mb-2.5 rounded-[14px] grid place-items-center bg-[#f1f7f3] text-[#7a9184]">
                <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m20 20-4.4-4.4" />
                </svg>
              </div>
              <strong className="block text-xs">No encontramos ese servicio</strong>
              <p className="mt-[5px] text-[10px] leading-[1.45] text-[#8a9690]">
                Prueba con el código, una palabra del nombre o cambia el filtro.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-2.5 px-3 py-[9px] border-t border-[#e8edea] bg-[#fafcfa] text-[9px] text-[#8a958f]">
            <span>También puedes escribir solo el <b className="text-[#5d6f65]">código</b>, por ejemplo “015”.</span>
            <span className="hidden sm:inline"><b className="text-[#5d6f65]">Ctrl K</b> abre el buscador</span>
          </div>
        </div>
      )}
    </div>
  );
}
