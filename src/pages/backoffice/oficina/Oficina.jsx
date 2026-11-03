// Oficina Inspira: lo pendiente del equipo, repartido entre seis personajes. Cada uno atiende un
// área de Core (tareas, expedientes, leads, agenda, pagos) y su mesa muestra lo que de verdad hay:
// trabaja si tiene cosas, avisa si algo venció, celebra cuando se resuelve algo. Tocar un personaje
// abre su oficina, con su lista y el botón a la pantalla donde se trabaja. No gasta nada: lee Core.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";
import { horaLimaPE } from "../../../lib/formatos";
import { useAuth } from "../context/AuthContext";
import { Chip } from "../crm/kit";
import { BOTON } from "../crm/estilos";
import { ESTADO_TEXTO, PERSONAJES, porId } from "./personajes";
import Plano from "./Plano";
import Sala from "./Sala";
import "./oficina.css";

const TONO = { libre: "ok", trabajando: "marca", urgente: "ojo" };
const VACIO = { estado: "libre", cuenta: 0, urgentes: 0, items: [], mas: 0, resumen: "" };

function relojLima(d) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const v = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  const y = Number(v.year); const m = Number(v.month) - 1;
  return {
    hora: { h: Number(v.hour), m: Number(v.minute) },
    fecha: { dia: Number(v.day), mes: m, diasMes: new Date(Date.UTC(y, m + 1, 0)).getUTCDate(), primerDia: (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7 },
  };
}

function cuando(x) {
  if (x.hora && x.dias === 0) return `hoy ${x.hora}`;
  if (x.dias === null || x.dias === undefined) return x.hora || "";
  if (x.dias < 0) return `venció hace ${-x.dias} ${x.dias === -1 ? "día" : "días"}`;
  if (x.dias === 0) return "hoy";
  if (x.dias === 1) return "mañana";
  return `en ${x.dias} días`;
}

function Fila({ x }) {
  const sub = [x.etiqueta || x.area, x.detalle, cuando(x)].filter(Boolean).join(" · ");
  const contenido = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-bold text-neutral-900">{x.titulo}</span>
        {sub && <span className={`mt-0.5 block text-[12.5px] ${x.vencido ? "font-semibold text-[#b4530a]" : "text-[#4f6672]"}`}>{sub}</span>}
      </span>
      {x.href && <span aria-hidden className="h-2.5 w-2.5 shrink-0 rotate-45 border-r-2 border-t-2 border-neutral-400" />}
    </>
  );
  const clase = `flex min-h-[52px] items-center gap-3 rounded-xl p-3 text-left ring-1 ${x.vencido ? "bg-[#fff6ec] ring-[#FA943A]/50" : "bg-white ring-neutral-200/80"}`;
  return x.href
    ? <li><button type="button" onClick={() => navigate(x.href)} className={`${clase} w-full hover:bg-neutral-50`}>{contenido}</button></li>
    : <li className={clase}>{contenido}</li>;
}

export default function Oficina() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [sala, setSala] = useState(() => {
    try { const id = new URLSearchParams(window.location.search).get("sala"); return porId(id) ? id : null; } catch { return null; }
  });
  const [celebra, setCelebra] = useState({});
  const [mensajes, setMensajes] = useState({ total: 0, items: [] });
  const [hedwig, setHedwig] = useState(false);
  const { user } = useAuth();
  const [ahora, setAhora] = useState(() => new Date());
  const previo = useRef(null);
  const temporizadores = useRef([]);

  const cargar = useCallback(async () => {
    const r = await boGET("/backoffice/oficina");
    if (r?.ok === false || !r?.puestos) { setError(r?.msg || "No se pudo cargar la oficina"); setCargando(false); return; }
    setError("");
    const resueltos = {};
    if (previo.current) {
      for (const id of Object.keys(r.puestos)) {
        if ((r.puestos[id]?.cuenta ?? 0) < (previo.current[id] ?? 0)) resueltos[id] = true;
      }
    }
    previo.current = Object.fromEntries(Object.entries(r.puestos).map(([id, p]) => [id, p.cuenta]));
    if (Object.keys(resueltos).length) {
      setCelebra(resueltos);
      temporizadores.current.push(setTimeout(() => setCelebra({}), 3600));
    }
    setDatos(r); setCargando(false);
    // Hedwig: lo que los asesorados han escrito y nadie ha leído (la misma fuente que la campana).
    const m = await boGET("/backoffice/solicitudes/mensajes/pendientes");
    if (m?.ok) setMensajes({ total: m.total || 0, items: m.items || [] });
  }, []);

  useEffect(() => { cargar(); }, [cargar]); // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => {
    const t = setInterval(cargar, 60000);
    const reloj = setInterval(() => setAhora(new Date()), 30000);
    const visible = () => { if (document.visibilityState === "visible") cargar(); };
    document.addEventListener("visibilitychange", visible);
    const lista = temporizadores.current;
    return () => { clearInterval(t); clearInterval(reloj); document.removeEventListener("visibilitychange", visible); lista.forEach(clearTimeout); };
  }, [cargar]);

  function elegir(id) {
    setSala(id); setHedwig(false);
    try {
      const url = new URL(window.location.href);
      if (id) url.searchParams.set("sala", id); else url.searchParams.delete("sala");
      window.history.replaceState({}, "", url);
    } catch { /* sin URL: no pasa nada */ }
    window.scrollTo?.({ top: 0 });
  }

  const { hora, fecha } = useMemo(() => relojLima(ahora), [ahora]);
  const noche = hora.h >= 19 || hora.h < 6;
  const personajes = useMemo(() => PERSONAJES.map((p) => ({ ...p, ...VACIO, ...(datos?.puestos?.[p.id] || {}) })), [datos]);
  const actual = sala ? personajes.find((p) => p.id === sala) : null;
  const pendientes = personajes.filter((p) => p.id !== "albus").reduce((s, p) => s + p.cuenta, 0);
  const urgentes = personajes.filter((p) => p.id !== "albus").reduce((s, p) => s + p.urgentes, 0);
  const luna = personajes.find((p) => p.id === "luna");
  const tablero = [["Pendientes", pendientes, "#cfe6ff", 268, -112], ["Urgentes", urgentes, "#ffe0c2", 328, -112], ["Citas hoy", luna?.cuenta ?? 0, "#d6f5df", 268, -76]];

  return (
    <div className="mx-auto w-full max-w-6xl p-3 sm:p-5">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold leading-tight text-primary-dark">{actual ? `Oficina de ${actual.nombre}` : "Oficina Inspira"}</h1>
          <p className="text-[13px] text-[#4f6672]">
            {actual ? `${actual.rol} · ${ESTADO_TEXTO[actual.estado]}` : "Lo pendiente del equipo, repartido por áreas. Se actualiza solo."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {datos?.generado && <span className="hidden text-[12px] text-[#4f6672] sm:inline">Actualizado {horaLimaPE(datos.generado)}</span>}
          <button type="button" onClick={() => { setCargando(true); cargar(); }} aria-label="Actualizar la oficina" className={`${BOTON.secundario} !px-3`}>
            <span aria-hidden className={cargando ? "animate-spin" : ""}>↻</span>
          </button>
        </div>
      </header>

      {error && <div role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-[13px] text-red-700 ring-1 ring-red-200">{error}</div>}

      {actual && (
        <nav aria-label="Oficinas" className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          <button type="button" onClick={() => elegir(null)} className={`${BOTON.secundario} shrink-0`}>← Oficina Inspira</button>
          {personajes.map((p) => (
            <button key={p.id} type="button" onClick={() => elegir(p.id)} aria-current={p.id === sala ? "true" : undefined}
              className={`${BOTON.secundario} shrink-0 ${p.id === sala ? "!border-primary-dark !bg-primary-dark !text-white" : ""}`}>
              {p.nombre}{p.cuenta > 0 && <span className={`ml-1 rounded-full px-1.5 text-[11px] ${p.id === sala ? "bg-white/20" : p.estado === "urgente" ? "bg-[#FA943A] text-[#2b1500]" : "bg-sky-light text-primary-dark"}`}>{p.cuenta}</span>}
            </button>
          ))}
        </nav>
      )}

      {!actual ? (
        <div className="grid gap-4">
          <div className="overflow-hidden rounded-3xl bg-primary-dark ring-1 ring-primary-dark/30">
            <Plano personajes={personajes} onElegir={elegir} onHedwig={() => setHedwig((v) => !v)} mensajes={mensajes.total} celebra={celebra} tablero={tablero} noche={noche} nombreYo={(user?.nombre || "Tú").split(" ")[0]} />
          </div>
          <p className="-mt-2 px-1 text-[12.5px] text-[#4f6672]">Toque una oficina o a una persona para ver su mesa. Toque el suelo para caminar: si entra a una oficina, se abre. Hedwig lleva los mensajes de los asesorados.</p>
          {hedwig && (
            <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200/80" aria-label="Mensajes de Hedwig">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[16px] font-bold text-primary-dark">Hedwig · mensajes sin leer</h2>
                <Chip tono={mensajes.total ? "ojo" : "ok"}>{mensajes.total}</Chip>
              </div>
              {mensajes.items.length === 0
                ? <p className="mt-2 text-[13.5px] text-neutral-700">Nadie ha escrito nada nuevo. Hedwig descansa.</p>
                : (
                  <ul className="mt-3 grid gap-2">
                    {mensajes.items.map((m) => (
                      <li key={m.id_solicitud}>
                        <button type="button" onClick={() => navigate(`/backoffice/solicitudes/${m.id_solicitud}`)} className="flex min-h-[52px] w-full items-center gap-3 rounded-xl bg-white p-3 text-left ring-1 ring-neutral-200/80 hover:bg-neutral-50">
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] font-bold text-neutral-900">{m.cliente}</span>
                            <span className="mt-0.5 block truncate text-[12.5px] text-[#4f6672]">{m.ultimo?.texto || m.titulo}</span>
                          </span>
                          <Chip tono="ojo">{m.sin_leer}</Chip>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
            </section>
          )}
          <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {personajes.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => elegir(p.id)} className="of-tarjeta flex w-full items-start gap-3 rounded-2xl bg-white p-3.5 text-left shadow-sm ring-1 ring-neutral-200/80">
                  <span aria-hidden className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white" style={{ background: p.color, boxShadow: `inset 0 0 0 2px ${p.acento}` }}>{p.nombre[0]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[15px] font-bold text-neutral-900">{p.nombre} · {p.rol}</span>
                      <Chip tono={TONO[p.estado]}>{p.cuenta > 0 ? p.cuenta : "0"}</Chip>
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-[#4f6672]">{cargando && !datos ? "Cargando…" : p.resumen}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-3xl bg-primary-dark ring-1 ring-primary-dark/30">
            <Sala p={actual} celebra={!!celebra[actual.id]} fecha={fecha} hora={hora} noche={noche} />
          </div>
          <section className="grid gap-3" aria-label={`Mesa de ${actual.nombre}`}>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200/80">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[16px] font-bold text-primary-dark">{actual.rol}</h2>
                <Chip tono={TONO[actual.estado]}>{ESTADO_TEXTO[actual.estado]}</Chip>
              </div>
              <p className="mt-1 text-[14px] font-semibold text-neutral-800">{actual.resumen || "Cargando…"}</p>
              <p className="mt-1 text-[12.5px] text-[#4f6672]">{actual.pie}</p>
              <button type="button" onClick={() => navigate(actual.abre.href)} className={`${BOTON.principal} mt-3 w-full`}>{actual.abre.texto}</button>
            </div>
            {actual.items.length > 0 && (
              <ul className="grid gap-2">
                {actual.items.map((x, i) => <Fila key={`${x.titulo}-${i}`} x={x} />)}
                {actual.mas > 0 && <li className="px-1 text-[12.5px] text-[#4f6672]">y {actual.mas} más en {actual.abre.texto.replace("Abrir ", "")}.</li>}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
