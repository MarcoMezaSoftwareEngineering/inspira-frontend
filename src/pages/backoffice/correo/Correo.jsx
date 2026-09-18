// Buzón de correo en Core.
//
// Las direcciones del equipo en pestañas; por defecto lo que espera respuesta,
// lo más antiguo arriba. Cada correo dice de qué cliente o lead es. Es la
// misma cuenta que Gmail: lo que se responde aquí se ve allí y al revés.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { Pagina, Cabecera, Cuerpo } from "../ui";
import VistaHilo from "./VistaHilo";
import Redactar from "./Redactar";
import { DESDE_BUZON } from "./desdeBuzon";
import { Boton } from "../ui";
import { Plus, Archive, ArchiveRestore } from "lucide-react";

// Por defecto, no leídos: ningún correo es pendiente por sí solo (16/09/2026).
// «Descartados»: relleno o ya resuelto; se recuperan desde aquí (18/09/2026).
const ESTADOS = [["no_leidos", "No leídos"], ["todos", "Todos"], ["descartados", "Descartados"]];
// Por defecto solo lo que escribe gente de fuera; lo que enviamos nosotros
// queda como respaldo en las otras dos vistas (18/09/2026).
const ORIGENES = [["externo", "Externos"], ["a_clientes", "Enviados a clientes"], ["interno", "Internos"], ["todos", "Todos"]];
const ETIQUETA_ORIGEN = { a_clientes: ["Enviado a cliente", "bg-[#e8f5ee] text-[#1d6a4a]"], interno: ["Interno", "bg-[#f3eefe] text-[#5b3fa0]"] };

function espera(h, ahora) {
  const desde = h.espera_desde || h.fecha;
  const horas = Math.floor((ahora - desde) / 3600000);
  if (horas < 1) return "ahora";
  if (horas < 24) return `${horas} h`;
  return `${Math.floor(horas / 24)} d`;
}

export default function Correo() {
  const [info, setInfo] = useState(null);
  const [buzon, setBuzon] = useState("");
  const [estado, setEstado] = useState("no_leidos");
  const [origen, setOrigen] = useState("externo");
  const [q, setQ] = useState("");
  const [busca, setBusca] = useState("");
  const [mios, setMios] = useState(false);
  const [redactar, setRedactar] = useState(false);
  const [hilos, setHilos] = useState(null);
  const [error, setError] = useState("");
  const [abierto, setAbierto] = useState(() => new URLSearchParams(window.location.search).get("hilo"));
  const [ancho, setAncho] = useState(() => window.innerWidth);
  // El reloj se lee una vez por carga, no en cada render.
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const r = () => setAncho(window.innerWidth);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    boGET("/backoffice/correo/buzones").then((r) => (r.ok ? setInfo(r) : setError(r.msg || "No se pudo conectar con el correo")));
  }, []);

  const cargar = useCallback(() => {
    const p = new URLSearchParams({ estado, origen });
    if (buzon) p.set("buzon", buzon);
    if (busca) p.set("q", busca);
    if (mios) p.set("mios", "1");
    boGET(`/backoffice/correo/hilos?${p}`).then((r) => {
      setAhora(Date.now());
      if (r.ok) { setHilos(r.hilos || []); setError(""); } else { setHilos([]); setError(r.msg || "No se pudieron cargar"); }
    });
  }, [buzon, estado, origen, busca, mios]);

  useEffect(() => { cargar(); }, [cargar]);

  // Descartar quita el hilo de la vista al momento; si falla, vuelve.
  async function descartar(h, recuperar = false) {
    const antes = hilos;
    setHilos((hs) => hs.filter((x) => x.id !== h.id));
    if (abierto === h.id) setAbierto(null);
    const r = await boPOST(`/backoffice/correo/hilo/${h.id}/descartar`, recuperar ? { quitar: true } : {});
    if (!r?.ok) { setHilos(antes); dialog.toast(r?.msg || "No se pudo", "error"); return; }
    dialog.toast(recuperar ? "Correo recuperado: vuelve a la bandeja" : "Correo descartado · lo encuentras en «Descartados»", "success");
  }

  const dividida = ancho >= 1100;
  const lista = hilos ? [...hilos].sort((a, b) => (estado === "sin_responder" ? (a.espera_desde || a.fecha) - (b.espera_desde || b.fecha) : b.fecha - a.fecha)) : null;
  const clientes = (hilos || []).filter((h) => h.cliente).length;

  const vista = abierto ? (
    <VistaHilo key={abierto} id={abierto} direcciones={info?.direcciones || []}
      onVolver={() => setAbierto(null)} onRespondido={cargar} />
  ) : null;

  if (abierto && !dividida) return <div className="fixed inset-0 z-[60] md:static md:z-auto h-[100dvh] md:h-[calc(100vh-24px)]">{vista}</div>;

  return (
    <Pagina>
      <Cabecera
        eyebrow="Correo"
        titulo="Buzón del equipo"
        acciones={<Boton tono="cta" icono={Plus} onClick={() => setRedactar(true)}>Redactar</Boton>}
        subtitulo={`Todas las direcciones de Inspira en un sitio. Es la cuenta ${info?.cuenta || "administracion@"}: lo que se responde aquí también se ve en Gmail.`}
        stats={hilos ? [
          { n: hilos.filter((h) => h.no_leido).length, l: "no leídos en esta vista", tono: "alerta" },
          { n: clientes, l: "son de clientes", tono: "cielo" },
          { n: hilos.filter((h) => h.asignado).length, l: "asignados a alguien", tono: "ok" },
        ] : undefined}
      />
      <Cuerpo className={dividida && abierto ? "!max-w-none" : ""}>
        <div className={dividida && abierto ? "grid grid-cols-[minmax(360px,440px)_1fr] gap-4 items-start" : ""}>
          <div className="space-y-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
              {[{ k: "", t: "Todos" }, ...(info?.buzones || [])].map((b) => (
                <button key={b.k || "todos"} type="button" onClick={() => setBuzon(b.k)}
                  className={`shrink-0 min-h-[38px] px-3 rounded-xl text-[12.5px] font-semibold border transition ${
                    buzon === b.k ? "bg-[#013446] border-[#013446] text-white" : "bg-white border-[#d8e4ef] text-[#0d2c3a]"}`}>
                  {b.t}{b.no_leidos ? <span className={`ml-1.5 text-[10.5px] font-bold px-1.5 rounded-full ${buzon === b.k ? "bg-white/20" : "bg-[#fa943a] text-white"}`}>{b.no_leidos}</span> : null}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-[#eef2f6] rounded-xl p-1 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
              {ORIGENES.map(([k, t]) => (
                <button key={k} type="button" onClick={() => setOrigen(k)} aria-pressed={origen === k}
                  className={`shrink-0 flex-1 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap ${origen === k ? "bg-white text-[#013446] shadow-sm" : "text-[#62808f]"}`}>{t}</button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="inline-flex bg-[#eef2f6] rounded-xl p-1">
                {ESTADOS.map(([k, t]) => (
                  <button key={k} type="button" onClick={() => setEstado(k)}
                    className={`text-[12.5px] font-semibold px-3 py-1.5 rounded-lg ${estado === k ? "bg-white text-[#013446] shadow-sm" : "text-[#62808f]"}`}>{t}</button>
                ))}
              </div>
              <button type="button" onClick={() => setMios((v) => !v)} aria-pressed={mios}
                className={`text-[12.5px] font-semibold px-3 rounded-xl border ${mios ? "bg-[#013446] border-[#013446] text-white" : "bg-white border-[#d8e4ef] text-[#0d2c3a]"}`}>
                Míos
              </button>
              <form className="flex-1 min-w-[180px]" onSubmit={(e) => { e.preventDefault(); setBusca(q.trim()); }}>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar (nombre, correo, asunto)…"
                  className="w-full text-[13.5px] bg-white border border-[#d8e4ef] rounded-xl px-3 py-2" />
              </form>
            </div>

            {error && <p className="text-[13px] text-[#c0392b] bg-[#fdedec] rounded-xl px-3 py-2">{error}</p>}

            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "var(--sombra)" }}>
              {lista === null ? (
                <div className="p-3 space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="ase-esq" style={{ height: 64 }} />)}</div>
              ) : !lista.length ? (
                <div className="ase-vacio"><p className="ase-vacio-t">{estado === "no_leidos" ? "Todo leído" : estado === "descartados" ? "Nada descartado" : "Nada por aquí"}</p><p className="ase-vacio-p">No hay correos en esta vista.</p></div>
              ) : lista.map((h) => {
                return (
                  <div key={h.id} role="button" tabIndex={0} onClick={() => setAbierto(h.id)}
                    onKeyDown={(e) => { if (e.key === "Enter") setAbierto(h.id); }}
                    className={`group relative w-full text-left px-4 py-3 pr-12 cursor-pointer border-b border-[#eef2f6] last:border-b-0 hover:bg-[#f7fafc] ${abierto === h.id ? "bg-[#e3f0fe]" : ""}`}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); descartar(h, estado === "descartados"); }}
                      title={estado === "descartados" ? "Recuperar" : "Descartar"} aria-label={estado === "descartados" ? "Recuperar" : "Descartar"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-lg text-[#8aa0ad] hover:bg-[#eef2f6] hover:text-[#013446] md:opacity-0 md:group-hover:opacity-100 focus:opacity-100">
                      {estado === "descartados" ? <ArchiveRestore size={17} /> : <Archive size={17} />}
                    </button>
                    <span className="flex items-center gap-2">
                      {h.no_leido && <span className="w-2 h-2 rounded-full bg-[#fa943a] shrink-0" />}
                      <span className={`text-[13.5px] truncate flex-1 ${h.no_leido ? "font-bold text-[#0d2c3a]" : "font-semibold text-[#0d2c3a]"}`}>
                        {h.cliente?.nombre || h.lead?.nombre || h.contacto?.nombre || h.contacto?.correo}
                      </span>
                      <span className="text-[11px] whitespace-nowrap text-[#62808f]">
                        {espera(h, ahora)}
                      </span>
                    </span>
                    <span className="block text-[12.5px] text-[#0d2c3a] truncate mt-0.5">{h.asunto}</span>
                    <span className="block text-[12px] text-[#62808f] truncate">{h.fragmento}</span>
                    <span className="flex flex-wrap gap-1 mt-1">
                      {h.cliente && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#e8f5ee] text-[#1d6a4a]">Cliente{h.cliente.proceso?.responsable ? ` · ${h.cliente.proceso.responsable.split(" ")[0]}` : ""}</span>}
                      {ETIQUETA_ORIGEN[h.origen] && origen === "todos" && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${ETIQUETA_ORIGEN[h.origen][1]}`}>{ETIQUETA_ORIGEN[h.origen][0]}</span>}
                      {h.lead && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#e3f0fe] text-[#013446]">Lead</span>}
                      {h.buzon && !buzon && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#eef2f6] text-[#62808f]">{info?.buzones?.find((b) => b.k === h.buzon)?.t}</span>}
                      {h.asignado && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#fef3e7] text-[#92400E]">→ {h.asignado.split(" ")[0]}</span>}
                      {h.atendiendo && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#fdedec] text-[#c0392b]">{h.atendiendo.nombre.split(" ")[0]} lo está respondiendo</span>}
                      {h.mensajes > 1 && <span className="text-[10px] text-[#62808f]">{h.mensajes} mensajes</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {dividida && abierto && (
            <div className="sticky top-3 h-[calc(100vh-24px)] rounded-2xl overflow-hidden" style={{ boxShadow: "var(--sombra)" }}>{vista}</div>
          )}
        </div>
      </Cuerpo>
      {redactar && <Redactar onCerrar={() => setRedactar(false)} onEnviado={cargar}
        desde={buzon && DESDE_BUZON[buzon] ? `${DESDE_BUZON[buzon]}@inspira-legal.cloud` : ""} />}
    </Pagina>
  );
}
