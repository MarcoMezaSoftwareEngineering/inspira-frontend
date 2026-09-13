// src/pages/backoffice/dashboard/BarraHoy.jsx
//
// La barra «Hoy» de Inspira Core: cinco chips con lo que hay que atender hoy.
// Cada chip abre la lista corta (máx. 10) con enlace a la solicitud o a la
// sección correspondiente. Datos: GET /backoffice/hoy[?mio=1].
import { useCallback, useEffect, useRef, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import {
  AlarmClock, FileSearch, Wallet, Inbox, CalendarClock, ChevronDown, RefreshCw, X, ExternalLink,
} from "lucide-react";

const REFRESCO_MS = 5 * 60 * 1000;
const CLAVE_MIO = "bo_hoy_mio";

const TONOS = {
  rojo:   { borde: "#f1c4c4", fondo: "#fff5f5", acento: "#c53030", suave: "#fde8e8", texto: "#8f1f1f" },
  ambar:  { borde: "#f3dca0", fondo: "#fffaf0", acento: "#b7791f", suave: "#fff3d6", texto: "#7a5200" },
  neutro: { borde: "#e5e7e5", fondo: "#ffffff", acento: "#8a958f", suave: "#f1f4f2", texto: "#46564d" },
};

const CHIPS = [
  {
    clave: "requerimientos", etiqueta: "Requerimientos", icono: AlarmClock,
    sub: (b) => [b.vencidos ? `${b.vencidos} vencido${b.vencidos === 1 ? "" : "s"}` : null,
      b.proximos ? `${b.proximos} en ≤ 3 días` : null,
      b.sin_fecha ? `${b.sin_fecha} sin fecha legible` : null].filter(Boolean).join(" · ") || "≤ 3 días",
    tono: (b) => (b.vencidos ? "rojo" : b.total || b.sin_fecha ? "ambar" : "neutro"),
  },
  {
    clave: "documentos", etiqueta: "Docs por revisar", icono: FileSearch,
    sub: (b) => (b.items?.length ? `${b.items.length}${b.items.length >= 10 ? "+" : ""} expediente${b.items.length === 1 ? "" : "s"}` : "al día"),
    tono: (b) => (b.total ? "ambar" : "neutro"),
  },
  {
    clave: "pagos", etiqueta: "Pagos pendientes", icono: Wallet,
    sub: (b) => (b.vencidos ? `${b.vencidos} vencido${b.vencidos === 1 ? "" : "s"}` : b.total ? "sin vencer" : "al día"),
    tono: (b) => (b.vencidos ? "rojo" : b.total ? "ambar" : "neutro"),
  },
  {
    clave: "leads", etiqueta: "Leads sin responder", icono: Inbox,
    sub: () => "más de 24 h",
    tono: (b) => (b.total ? "ambar" : "neutro"),
  },
  {
    clave: "sesiones", etiqueta: "Sesiones hoy", icono: CalendarClock,
    sub: (b) => (b.items?.[0]?.hora ? `primera ${b.items[0].hora}` : "hora Lima"),
    tono: () => "neutro",
  },
];

function navegar(to) {
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function fmtFecha(iso) {
  if (!iso) return "";
  const d = iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

function textoDias(dias) {
  if (dias == null) return "";
  if (dias < 0) return `vencido hace ${-dias} d`;
  if (dias === 0) return "vence hoy";
  if (dias === 1) return "mañana";
  return `en ${dias} d`;
}

export default function BarraHoy() {
  const [mio, setMio] = useState(() => {
    try { return localStorage.getItem(CLAVE_MIO) === "1"; } catch { return false; }
  });
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [abierto, setAbierto] = useState(null);
  const raiz = useRef(null);

  const cargar = useCallback(() => {
    setCargando(true);
    boGET(`/backoffice/hoy${mio ? "?mio=1" : ""}`)
      .then((r) => {
        if (!r || r.ok === false) throw new Error(r?.msg || r?.message || "Sin respuesta");
        setDatos(r);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [mio]);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, REFRESCO_MS);
    return () => clearInterval(t);
  }, [cargar]);

  // Cerrar el desplegable al pulsar fuera o con Escape.
  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => { if (raiz.current && !raiz.current.contains(e.target)) setAbierto(null); };
    const esc = (e) => { if (e.key === "Escape") setAbierto(null); };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", fuera); document.removeEventListener("keydown", esc); };
  }, [abierto]);

  function cambiarMio(valor) {
    setMio(valor);
    setAbierto(null);
    try { localStorage.setItem(CLAVE_MIO, valor ? "1" : "0"); } catch { /* sin almacenamiento */ }
  }

  const bloques = datos?.bloques || {};
  const chipAbierto = CHIPS.find((c) => c.clave === abierto);

  return (
    <section ref={raiz} className="bg-white border border-neutral-200 rounded-2xl shadow-[0_2px_10px_rgba(20,35,27,0.045)] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-extrabold text-[#26352c]">Hoy</h2>
          {datos?.hoy && (
            <span className="text-[10px] font-bold text-neutral-500 bg-[#f6f8f6] border border-neutral-200 px-2 py-0.5 rounded-full capitalize">
              {new Date(`${datos.hoy}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Alcance" className="inline-flex bg-[#f1f4f2] border border-neutral-200 rounded-xl p-0.5">
            {[[true, "Solo lo mío"], [false, "Todo el equipo"]].map(([valor, txt]) => (
              <button
                key={txt}
                type="button"
                aria-pressed={mio === valor}
                onClick={() => cambiarMio(valor)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-[9px] transition-colors ${
                  mio === valor ? "bg-white text-[#147a4d] shadow-sm" : "text-neutral-500 hover:text-[#26352c]"
                }`}
              >
                {txt}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={cargar}
            title="Actualizar"
            className="w-8 h-8 border border-neutral-200 bg-white rounded-xl text-neutral-500 flex items-center justify-center hover:bg-[#f8faf8]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} strokeWidth={2} />
          </button>
        </div>
      </div>

      {error && !datos && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          No se pudo cargar la barra de hoy: {error}
        </p>
      )}

      {!datos && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {CHIPS.map((c) => <div key={c.clave} className="h-[74px] rounded-xl bg-neutral-100 animate-pulse" />)}
        </div>
      )}

      {datos && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {CHIPS.map((c) => {
            const b = bloques[c.clave] || { total: 0 };
            const t = TONOS[b.error ? "neutro" : c.tono(b)];
            const Icono = c.icono;
            const activo = abierto === c.clave;
            return (
              <button
                key={c.clave}
                type="button"
                aria-expanded={activo}
                onClick={() => setAbierto(activo ? null : c.clave)}
                className="text-left rounded-xl border px-3 py-2.5 transition-all hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-[#46b77f]"
                style={{ borderColor: activo ? t.acento : t.borde, background: t.fondo }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="w-7 h-7 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: t.suave, color: t.acento }}>
                    <Icono className="w-3.5 h-3.5" strokeWidth={2.2} />
                  </span>
                  <strong className="text-[24px] leading-none font-extrabold tracking-tight" style={{ color: b.total ? t.texto : "#9ca7a1" }}>
                    {b.error ? "—" : b.total}
                  </strong>
                </div>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="text-[11px] font-extrabold text-[#26352c] truncate">{c.etiqueta}</span>
                  <ChevronDown className={`w-3 h-3 text-neutral-400 shrink-0 transition-transform ${activo ? "rotate-180" : ""}`} />
                </div>
                <p className="text-[10px] text-neutral-500 truncate">{b.error ? b.error : c.sub(b)}</p>
              </button>
            );
          })}
        </div>
      )}

      {datos && chipAbierto && (
        <ListaChip chip={chipAbierto} bloque={bloques[chipAbierto.clave] || {}} mio={mio} onCerrar={() => setAbierto(null)} />
      )}
    </section>
  );
}

function ListaChip({ chip, bloque, mio, onCerrar }) {
  const items = bloque.items || [];
  const sinFecha = bloque.items_sin_fecha || [];
  return (
    <div className="mt-3 border border-neutral-200 rounded-xl bg-[#fbfcfb] overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-neutral-200">
        <span className="text-[11px] font-extrabold text-[#26352c]">
          {chip.etiqueta}
          {bloque.total > items.length && <span className="font-semibold text-neutral-400"> · mostrando {items.length} de {bloque.total}</span>}
          {mio && chip.clave === "leads" && <span className="font-semibold text-neutral-400"> · sin asignar: se ven los del equipo</span>}
        </span>
        <button type="button" onClick={onCerrar} title="Cerrar" className="w-6 h-6 rounded-lg text-neutral-400 hover:bg-neutral-100 flex items-center justify-center">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {!items.length && !sinFecha.length ? (
        <p className="text-xs text-neutral-400 px-3 py-3">Nada pendiente.</p>
      ) : (
        <ul className="divide-y divide-neutral-100 max-h-[320px] overflow-y-auto">
          {items.map((it, i) => <FilaItem key={`${chip.clave}-${i}`} chip={chip.clave} it={it} />)}
          {sinFecha.length > 0 && (
            <li className="px-3 pt-2.5 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#7a5200] bg-[#fffaf0]">
              Sin fecha legible ({bloque.sin_fecha})
            </li>
          )}
          {sinFecha.map((it, i) => <FilaItem key={`sf-${i}`} chip={chip.clave} it={it} sinFecha />)}
        </ul>
      )}
    </div>
  );
}

function FilaItem({ chip, it, sinFecha }) {
  let derecha = "";
  let rojo = false;
  if (sinFecha) derecha = it.plazo_texto ? `«${it.plazo_texto}»` : "sin plazo";
  else if (chip === "requerimientos") { derecha = `${fmtFecha(it.fecha)} · ${textoDias(it.dias)}`; rojo = it.vencido; }
  else if (chip === "pagos") { derecha = it.fecha ? `${it.vencido ? "venció" : "vence"} ${fmtFecha(it.fecha)}` : "sin vencimiento"; rojo = it.vencido; }
  else if (chip === "sesiones") derecha = it.hora || "hoy";
  else if (it.fecha) derecha = `desde ${fmtFecha(it.fecha)}`;

  const contenido = (
    <>
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-[#26352c] truncate">{it.cliente}</p>
        <p className="text-[11px] text-neutral-500 truncate">{it.texto}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`text-[10.5px] font-bold whitespace-nowrap ${rojo ? "text-[#c53030]" : "text-neutral-500"}`}>{derecha}</span>
        {it.href && <ExternalLink className="w-3 h-3 text-neutral-300" />}
      </div>
    </>
  );

  const clase = "w-full flex items-center justify-between gap-3 px-3 py-2 text-left";
  return (
    <li>
      {it.href ? (
        <a
          href={it.href}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
            e.preventDefault();
            navegar(it.href);
          }}
          className={`${clase} hover:bg-white`}
        >
          {contenido}
        </a>
      ) : (
        <div className={clase}>{contenido}</div>
      )}
    </li>
  );
}
