// src/pages/bicentenario/SimuladorBicentenario.jsx
//
// «¿Calificas y cuánto puntaje tendrías?» — el corazón de la página.
// Cuatro pasos (requisitos, perfil, universidad, situación) y el resultado.
// Todo se calcula en el navegador con config/bicentenario2026.js; no se envía
// ni se guarda nada. Solo WhatsApp, si el visitante lo pulsa.
// Los atributos data-pregunta, data-v y data-accion los usa el script de
// capturas para rellenar el simulador; no los quites.
import { useEffect, useMemo, useRef, useState } from "react";
import { whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";
import {
  CIFRAS,
  COMPARACION_2025,
  EMOJIS,
  FUENTES_RANKING,
  IMPEDIMENTOS,
  OPCIONES,
  PUNTOS,
  RANKING_EJEMPLOS,
  TRAMOS_INGRESO,
  calcularPuntaje,
  comparacionLista,
  evaluarRequisitos,
  lectura,
  mejoras,
  numeroPe,
  preguntasRequisitos,
  puntosIngreso,
} from "../../config/bicentenario2026";
import { Alerta, Articulo, BotonCalendly, Check, Chevron, Cruz, Emoji, Pestanas, irA } from "./piezas";
import { usePrefiereQuieto } from "./ilustraciones";

const PASOS = [
  { txt: "Requisitos", emoji: "📋" },
  { txt: "Tu perfil", emoji: "👤" },
  { txt: "Tu universidad", emoji: "🏛️" },
  { txt: "Tu situación", emoji: "💰" },
  { txt: "Resultado", emoji: "🎯" },
];

// ── Piezas del formulario ───────────────────────────────────────────────────
function Opciones({ opciones, valor, onChange, puntos, columnas = false }) {
  return (
    <div className={`mt-3 ${columnas ? "grid gap-2 sm:grid-cols-2" : "flex flex-wrap gap-2"}`}>
      {opciones.map((o) => {
        const activo = valor === o.v;
        const p = puntos ? puntos(o.v) : null;
        return (
          <button
            key={o.v}
            type="button"
            data-v={o.v}
            aria-pressed={activo}
            onClick={() => onChange(o.v)}
            className={`bic-press flex items-center justify-between gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left text-sm font-bold transition ${
              activo ? "border-accent bg-accent/10 text-primary shadow-sm" : "border-neutral-200 bg-white text-primary hover:border-accent/60 hover:bg-secondary-light"
            }`}
          >
            <span className="flex items-center gap-2 leading-snug">
              {activo && (
                <span className="bic-pop flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-primary-dark">
                  <Check size={11} />
                </span>
              )}
              {o.txt}
            </span>
            {p !== null && (
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${activo ? "bg-primary text-white" : "bg-secondary text-primary"}`}>+{p}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Pregunta({ id, emoji, titulo, ayuda, art, children, estado }) {
  const aro =
    estado === "no" ? "border-neutral-400 bg-neutral-50" : estado === "pend" ? "border-accent/70 bg-accent/5" : estado === "ok" ? "border-green-600/50 bg-green-50/70" : "border-neutral-200 bg-white";
  return (
    <div data-pregunta={id} className={`rounded-2xl border-2 p-4 transition-colors sm:p-5 ${aro}`}>
      <div className="flex items-start gap-3">
        {emoji && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm ring-1 ring-primary/10">
            <Emoji>{emoji}</Emoji>
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold leading-snug text-primary">{titulo}</p>
            {estado === "ok" && <span key="ok" className="bic-pop mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-700 text-white"><Check size={13} /></span>}
            {estado === "no" && <span key="no" className="bic-pop mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-600 text-white"><Cruz size={12} /></span>}
            {estado === "pend" && <span key="pend" className="bic-pop mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-primary-dark"><Alerta size={14} /></span>}
          </div>
          {ayuda && <p className="mt-1 text-sm leading-snug text-neutral-600">{ayuda}</p>}
        </div>
      </div>
      {children}
      {art && <div className="mt-2.5"><Articulo>{art}</Articulo></div>}
    </div>
  );
}

function CalculadoraPercapita({ onResultado }) {
  const [total, setTotal] = useState("");
  const [miembros, setMiembros] = useState("");
  const pc = Number(total) > 0 && Number(miembros) > 0 ? Number(total) / Number(miembros) : null;
  useEffect(() => {
    if (pc !== null) onResultado(pc <= CIFRAS.percapitaMax ? "si" : "no");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pc]);
  return (
    <details className="bic-acordeon mt-3 rounded-xl bg-white p-3 ring-1 ring-primary/10">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-primary-light">
        <Emoji>🧮</Emoji> Calcúlalo aquí <span className="bic-flecha ml-auto"><Chevron size={14} /></span>
      </summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-neutral-700">
          Ingreso bruto mensual del hogar (S/)
          <input type="number" inputMode="decimal" min={0} value={total} onChange={(e) => setTotal(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-base font-bold text-primary focus:border-accent focus:outline-none" placeholder="Ej. 9000" />
        </label>
        <label className="block text-xs font-semibold text-neutral-700">
          Personas del hogar (contigo)
          <input type="number" inputMode="numeric" min={1} value={miembros} onChange={(e) => setMiembros(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-base font-bold text-primary focus:border-accent focus:outline-none" placeholder="Ej. 3" />
        </label>
      </div>
      {pc !== null && (
        <p key={pc <= CIFRAS.percapitaMax ? "si" : "no"} className={`bic-pop mt-3 text-sm font-bold ${pc <= CIFRAS.percapitaMax ? "text-green-800" : "text-neutral-700"}`}>
          {pc <= CIFRAS.percapitaMax ? "✅" : "❌"} Per cápita: S/ {numeroPe(pc)} {pc <= CIFRAS.percapitaMax ? "· dentro del tope" : "· supera el tope"}
        </p>
      )}
      <p className="mt-2 text-xs text-neutral-600">Promedio mensual de 2025. Solo cuentan quienes tienen tu mismo domicilio en RENIEC.</p>
    </details>
  );
}

function Navegacion({ onAtras, onSiguiente, siguiente = "Siguiente", deshabilitado = false, nota, accion = "siguiente" }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {onAtras && (
        <button type="button" onClick={onAtras} className="bic-press rounded-xl px-4 py-3 text-sm font-bold text-neutral-700 hover:text-primary">
          ← Atrás
        </button>
      )}
      <button
        type="button"
        data-accion={accion}
        onClick={onSiguiente}
        disabled={deshabilitado}
        className="bic-press ml-auto inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-extrabold text-primary-dark shadow-lg shadow-accent/25 transition hover:bg-sun disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-600 disabled:shadow-none"
      >
        {siguiente} →
      </button>
      {nota && <p className="w-full text-right text-xs font-semibold text-neutral-600">{nota}</p>}
    </div>
  );
}

function Subtotal({ letra, emoji, valor, max, texto }) {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-white">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl"><Emoji>{emoji}</Emoji></span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-white/85"><b className="mr-1 text-sun">{letra}</b>{texto}</span>
      <span key={valor} className="bic-pop font-fraunces text-2xl font-black tabular-nums">
        {valor}<span className="text-base text-white/60">/{max}</span>
      </span>
    </div>
  );
}

function Pasos({ paso, maximo, onIr }) {
  return (
    <div>
      <ol className="flex items-start justify-between gap-1">
        {PASOS.map((p, i) => {
          const hecho = i < paso;
          const actual = i === paso;
          const puede = i <= maximo && !actual;
          return (
            <li key={p.txt} className="relative flex flex-1 flex-col items-center">
              {i > 0 && (
                <span aria-hidden="true" className={`absolute right-1/2 top-5 h-1 w-full -translate-y-1/2 rounded-full transition-colors duration-500 sm:top-[22px] ${i <= paso ? "bg-accent" : "bg-neutral-200"}`} />
              )}
              <button
                type="button"
                disabled={!puede}
                onClick={() => onIr(i)}
                aria-current={actual ? "step" : undefined}
                aria-label={`Paso ${i + 1}: ${p.txt}`}
                className={`bic-press relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-lg ring-4 transition sm:h-11 sm:w-11 ${
                  actual ? "bic-pulso bg-accent ring-accent/30" : hecho ? "bg-primary text-white ring-primary/15" : "bg-white ring-neutral-200"
                } ${puede ? "cursor-pointer hover:scale-105" : "cursor-default"}`}
              >
                {hecho ? <Check size={16} /> : <Emoji>{p.emoji}</Emoji>}
              </button>
              <span className={`mt-1.5 hidden text-center text-[11px] font-bold leading-tight sm:block ${actual ? "text-primary" : "text-neutral-600"}`}>{p.txt}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-center text-sm font-bold text-primary sm:hidden">
        Paso {paso + 1} de {PASOS.length} · {PASOS[paso].txt}
      </p>
    </div>
  );
}

// ── Paso 1: requisitos ──────────────────────────────────────────────────────
function PasoRequisitos({ nivel, req, setReq, onSeguir }) {
  const preguntas = useMemo(() => preguntasRequisitos(nivel), [nivel]);
  const ev = evaluarRequisitos(nivel, req);
  const [revisado, setRevisado] = useState(false);
  const veredicto = useRef(null);
  const set = (id, v) => {
    setReq((r) => ({ ...r, [id]: v }));
    setRevisado(false);
  };
  const respondidas = preguntas.length - ev.faltan;

  function revisar() {
    setRevisado(true);
    registrarEvento("bicentenario_requisitos", { nivel, estado: ev.estado });
    requestAnimationFrame(() => veredicto.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  return (
    <div>
      <div className="mb-4 rounded-2xl bg-secondary-light p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 text-sm font-bold text-primary">
          <span><span aria-hidden="true">✅ </span>{respondidas}/{preguntas.length} respondidas</span>
          {ev.faltan === 0 && <span className="bic-pop"><span aria-hidden="true">🎉 </span>¡Listo!</span>}
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-gradient-to-r from-sky to-green-600 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(respondidas / preguntas.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {preguntas.map((p) => {
          const op = p.opciones.find((o) => o.v === req[p.id]);
          return (
            <Pregunta key={p.id} id={p.id} emoji={EMOJIS[p.id]} titulo={p.texto} ayuda={p.ayuda} art={p.art} estado={op?.efecto}>
              <Opciones opciones={p.opciones} valor={req[p.id]} onChange={(v) => set(p.id, v)} />
              {p.calculadora && <CalculadoraPercapita onResultado={(v) => set(p.id, v)} />}
              {p.verImpedimentos && (
                <details className="bic-acordeon mt-3 rounded-xl bg-white p-3 ring-1 ring-primary/10">
                  <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-primary-light">
                    <Emoji>📄</Emoji> Ver la lista <span className="bic-flecha ml-auto"><Chevron size={14} /></span>
                  </summary>
                  <ul className="mt-2 space-y-1.5">
                    {IMPEDIMENTOS.filter((i) => i.art !== "14.1.9").map((i) => (
                      <li key={i.art} className="flex gap-2 text-sm leading-snug text-neutral-700">
                        <span aria-hidden="true">🚫</span>
                        {i.texto}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </Pregunta>
          );
        })}
      </div>

      {!revisado && (
        <Navegacion
          accion="revisar"
          onSiguiente={revisar}
          siguiente="Ver si califico"
          deshabilitado={ev.faltan > 0}
          nota={ev.faltan > 0 ? `Te falta${ev.faltan === 1 ? "" : "n"} ${ev.faltan} pregunta${ev.faltan === 1 ? "" : "s"}` : null}
        />
      )}

      {revisado && (
        <div ref={veredicto} className="bic-entra mt-6">
          {ev.estado === "cumple" && (
            <div className="rounded-2xl border-2 border-green-600 bg-green-50 p-5 sm:p-6">
              <p className="font-fraunces text-xl font-bold text-green-900"><span aria-hidden="true">🎉 </span>Cumples los requisitos que indicaste</p>
              <p className="mt-1 text-sm text-neutral-700">Ahora veamos cuánto puntaje tendrías. PRONABEC lo verificará con tus documentos.</p>
              <Navegacion accion="seguir" onSiguiente={onSeguir} siguiente="Calcular mi puntaje" />
            </div>
          )}
          {ev.estado === "pendiente" && (
            <div className="rounded-2xl border-2 border-accent bg-accent/[0.06] p-5 sm:p-6">
              <p className="font-fraunces text-xl font-bold text-primary"><span aria-hidden="true">⚠️ </span>Podrías calificar, pero te falta confirmar esto</p>
              <ul className="mt-3 space-y-2">
                {ev.pendientes.map((m) => (
                  <li key={m.id} className="flex gap-2 text-sm leading-snug text-neutral-700">
                    <span aria-hidden="true">{EMOJIS[m.id] || "•"}</span>
                    <span>{m.texto} <Articulo>{m.art}</Articulo></span>
                  </li>
                ))}
              </ul>
              <Navegacion accion="seguir" onSiguiente={onSeguir} siguiente="Calcular mi puntaje" />
            </div>
          )}
          {ev.estado === "no" && (
            <div className="rounded-2xl border-2 border-neutral-300 bg-white p-5 sm:p-6">
              <p className="font-fraunces text-xl font-bold text-primary"><span aria-hidden="true">🧭 </span>Con lo que indicaste, hoy no calificas por esto:</p>
              <ul className="mt-3 space-y-2">
                {ev.fallos.map((m) => (
                  <li key={m.id} className="flex gap-2 text-sm leading-snug text-neutral-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-700"><Cruz size={11} /></span>
                    <span>{m.texto} <Articulo>{m.art}</Articulo></span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl bg-primary p-5 text-white">
                <p className="font-fraunces text-lg font-bold"><span aria-hidden="true">💙 </span>Tranquilo: hay otras becas para ti y másteres económicos</p>
                <p className="mt-1 text-sm text-white/80">Fundación Carolina, AUIP, Universidad de Jaén, becas de la Unión Europea… o másteres oficiales en España desde unos 730 € al año.</p>
                <a href="#descubre" onClick={(e) => irA(e, "#descubre")} className="bic-press mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-extrabold text-primary-dark hover:bg-sun">
                  <span aria-hidden="true">🧭</span> Ver mis otros caminos
                </a>
              </div>
              <button type="button" data-accion="seguir" onClick={onSeguir} className="mt-4 text-sm font-bold text-primary underline underline-offset-4 hover:text-primary-light">
                Calcular mi puntaje de todos modos
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Paso 3: ayuda del ranking ───────────────────────────────────────────────
function AyudaRanking({ seleccionado }) {
  return (
    <details className="bic-acordeon mt-3 rounded-xl bg-white p-3 ring-1 ring-primary/10 sm:p-4">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-primary-light">
        <Emoji>🏆</Emoji> ¿En qué tramo está mi universidad? Ejemplos en QS 2027
        <span className="bic-flecha ml-auto"><Chevron size={14} /></span>
      </summary>
      <div className="mt-3 space-y-2">
        {OPCIONES.ranking.filter((o) => o.v !== "nose").map((o) => {
          const ej = RANKING_EJEMPLOS[o.v] || [];
          return (
            <div key={o.v} className={`rounded-xl border-2 p-3 transition ${seleccionado === o.v ? "border-accent bg-accent/5" : "border-transparent bg-secondary-light"}`}>
              <p className="flex items-center justify-between gap-2 text-sm font-bold text-primary">
                <span>{o.txt}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-primary">+{PUNTOS.ranking[o.v]}</span>
              </p>
              {ej.length ? (
                <p className="mt-1 text-xs leading-relaxed text-neutral-700">{ej.map((u) => `${u.nombre} (${u.pais}, ${u.puesto})`).join(" · ")}</p>
              ) : (
                <p className="mt-1 text-xs italic text-neutral-600">Sin ejemplo verificado en la Unión Europea.</p>
              )}
            </div>
          );
        })}
      </div>
      <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-neutral-700">
        <li><span aria-hidden="true">🥇 </span>Cuenta el <b>mejor puesto en QS, ARWU o THE en los últimos 5 años</b>: tu universidad puede sumar más por otro ranking u otro año.</li>
        <li><span aria-hidden="true">🇪🇺 </span>Muchas universidades españolas son elegibles, pero suman 0 a 2 puntos por ranking. Universidades europeas mejor situadas pueden sumar más.</li>
        <li><span aria-hidden="true">📋 </span>La lista oficial de universidades elegibles la publica PRONABEC hasta un día antes de la postulación <Articulo>art. 6.6</Articulo></li>
      </ul>
      <p className="mt-2 text-[11px] leading-relaxed text-neutral-600">
        Fuentes:{" "}
        {FUENTES_RANKING.map((f, i) => (
          <span key={f.url}>
            {i > 0 && " · "}
            <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline">{f.nombre}</a>
          </span>
        ))}
      </p>
    </details>
  );
}

// ── Resultado ───────────────────────────────────────────────────────────────
function Gauge({ valor, max }) {
  const quieto = usePrefiereQuieto();
  const [anim, setAnim] = useState(quieto ? valor : 0);
  useEffect(() => {
    if (quieto) {
      setAnim(valor);
      return;
    }
    let raf;
    let t0;
    const paso = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / 1500);
      setAnim(valor * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [valor, quieto]);
  const L = Math.PI * 90;
  const pct = max ? Math.min(1, anim / max) : 0;
  const angulo = Math.PI * (1 - pct);
  const px = 110 + Math.cos(angulo) * 90;
  const py = 112 - Math.sin(angulo) * 90;
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <svg viewBox="0 0 220 124" className="w-full overflow-visible" role="img" aria-label={`Puntaje orientativo: ${valor} de ${max}`}>
        <defs>
          <linearGradient id="bic-gauge" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#88C4FC" />
            <stop offset="60%" stopColor="#F9C846" />
            <stop offset="100%" stopColor="#FA943A" />
          </linearGradient>
        </defs>
        <path d="M20 112 A90 90 0 0 1 200 112" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="18" strokeLinecap="round" />
        <path d="M20 112 A90 90 0 0 1 200 112" fill="none" stroke="url(#bic-gauge)" strokeWidth="18" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - pct)} />
        <circle cx={px} cy={py} r="11" fill="#fff" stroke="#013446" strokeWidth="4" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <span className="font-fraunces text-6xl font-black tabular-nums text-white">{Math.round(anim)}</span>
        <span className="ml-1 text-lg font-bold text-white/70">/{max}</span>
      </div>
    </div>
  );
}

function BarraConcepto({ letra, emoji, nombre, valor, max }) {
  const [ancho, setAncho] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAncho(max ? (valor / max) * 100 : 0), 200);
    return () => clearTimeout(t);
  }, [valor, max]);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-bold text-white"><span aria-hidden="true">{emoji} </span><span className="mr-1 text-sun">{letra}</span>{nombre}</span>
        <span className="font-black tabular-nums text-white">{valor}<span className="text-white/60">/{max}</span></span>
      </div>
      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-sky via-sun to-accent transition-[width] duration-1000 ease-out motion-reduce:transition-none" style={{ width: `${ancho}%` }} />
      </div>
    </div>
  );
}

function Confeti() {
  const piezas = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        x: `${(i * 37.7) % 100}%`,
        d: `${(i % 9) * 0.13}s`,
        r: `${(i % 2 ? 1 : -1) * (200 + ((i * 53) % 320))}deg`,
        c: ["#F9C846", "#FA943A", "#88C4FC", "#FFFFFF"][i % 4],
      })),
    []
  );
  return (
    <div className="bic-confeti" aria-hidden="true">
      {piezas.map((p, i) => (
        <i key={i} style={{ "--x": p.x, "--d": p.d, "--r": p.r, "--c": p.c }} />
      ))}
    </div>
  );
}

const ESTADO_TXT = { cumple: "cumplo los que indiqué", pendiente: "me falta confirmar alguno", no: "no cumplo alguno" };
const REACCION = { alto: "🚀", medio: "💪", bajo: "🌱" };
const emojiMejora = (t) => (/RENACYT/.test(t) ? "🔬" : /beca/i.test(t) ? "🎓" : /carta|licencia/i.test(t) ? "📄" : "🌍");

function Resultado({ nivel, req, resp, onEditar, onReiniciar }) {
  const quieto = usePrefiereQuieto();
  const doc = nivel === "doctorado";
  const r = calcularPuntaje(nivel, resp);
  const ev = evaluarRequisitos(nivel, req);
  const lec = lectura(r.total, r.max.total);
  const lista = mejoras(nivel, resp);
  const becas = doc ? CIFRAS.doctorado : CIFRAS.maestria;
  const ant = COMPARACION_2025.anterior;

  useEffect(() => {
    registrarEvento("bicentenario_resultado", { nivel, requisitos: ev.estado, tramo: lec.nivel });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mensaje =
    `Hice el simulador de la Beca Generación del Bicentenario 2026 (${doc ? "doctorado" : "maestría"}). ` +
    `Puntaje orientativo: ${r.total}/${r.max.total} (A ${r.A}/${r.max.A} · B ${r.B}/${r.max.B} · C ${r.C}/${r.max.C}). ` +
    `Requisitos: ${ESTADO_TXT[ev.estado]}. Quiero asesoría para postular.`;

  return (
    <div id="bic-resultado" className="bic-entra">
      <div className="relative overflow-hidden rounded-3xl bg-primary text-white">
        {lec.nivel === "alto" && !quieto && <Confeti />}
        <div className="relative grid gap-6 p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center">
          <div>
            <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-sun md:text-left">
              <span aria-hidden="true">🎯 </span>Tu puntaje orientativo · {doc ? "doctorado" : "maestría"}
            </p>
            <div className="mt-4"><Gauge valor={r.total} max={r.max.total} /></div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="bic-pop flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-3xl ring-1 ring-white/20" aria-hidden="true">{REACCION[lec.nivel]}</span>
              <p className="font-fraunces text-2xl font-bold leading-tight sm:text-3xl">{lec.titulo}</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{lec.texto}</p>
            <div className="mt-5 space-y-3">
              <BarraConcepto letra="A" emoji="👤" nombre="Perfil profesional y académico" valor={r.A} max={r.max.A} />
              <BarraConcepto letra="B" emoji="🏛️" nombre="Universidad de destino" valor={r.B} max={r.max.B} />
              <BarraConcepto letra="C" emoji="💰" nombre="Condiciones priorizables" valor={r.C} max={r.max.C} />
            </div>
          </div>
        </div>
        <div className="relative border-t border-white/10 bg-white/[0.05] px-5 py-4 text-sm leading-relaxed text-white/85 sm:px-8">
          <span aria-hidden="true">🔥 </span><b className="text-white">Con solo {becas} becas de {doc ? "doctorado" : "maestría"}, la competencia será muy alta.</b>{" "}
          {comparacionLista() && ant.postulantes ? `En 2025 postularon ${numeroPe(ant.postulantes)} personas con registro completo por ${ant.becasTotal} becas; en 2026 hay ${CIFRAS.total}. ` : ""}
          Tu puntaje es orientativo: PRONABEC lo asigna con tus documentos y selecciona por orden de mérito.
        </div>
      </div>

      {ev.estado !== "cumple" && (
        <p className={`mt-4 flex gap-2 rounded-2xl p-4 text-sm leading-snug ${ev.estado === "no" ? "bg-neutral-100 text-neutral-800" : "bg-accent/10 text-primary"}`}>
          <span aria-hidden="true">⚠️</span>
          {ev.estado === "no"
            ? "Ojo: con lo que indicaste no cumples algún requisito, así que este puntaje no llegaría a asignarse. Mira tus otros caminos justo debajo."
            : "Recuerda: te falta confirmar algún requisito (por ejemplo, la carta de aceptación definitiva). Sin él no puedes postular."}
        </p>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
          <p className="font-fraunces text-xl font-bold text-primary"><span aria-hidden="true">📈 </span>Qué puedes mejorar</p>
          {lista.length ? (
            <ul className="mt-4 space-y-3">
              {lista.map((m, i) => (
                <li key={m.titulo} className="bic-entra flex gap-3" style={{ "--bic-d": `${300 + i * 120}ms` }}>
                  <span className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-accent/15 text-primary">
                    <span aria-hidden="true" className="text-lg leading-none">{emojiMejora(m.titulo)}</span>
                    <span className="text-xs font-black">+{m.suma}</span>
                  </span>
                  <span className="text-sm leading-snug text-neutral-700">
                    <b className="block text-primary">{m.titulo}</b>
                    {m.texto} <Articulo>{m.art}</Articulo>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-neutral-700">Ya sumas el máximo en lo que todavía se puede mejorar.</p>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border-2 border-sky bg-secondary-light p-5 sm:p-6">
            <p className="font-fraunces text-lg font-bold text-primary"><span aria-hidden="true">💼 </span>Prioridad por carreras de alta demanda</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {doc
                ? "En doctorado se selecciona primero, por mérito, a quien viene de una maestría del Top 10 de demanda ocupacional de posgrado (EDO 2026 del MTPE)."
                : "En maestría se selecciona primero, por mérito, a quien viene de una carrera del Top 10 de demanda ocupacional para profesionales universitarios o técnicos (EDO 2026 del MTPE)."}{" "}
              Si tu carrera no está en esa lista, compites por las becas que queden. <Articulo>art. 17.3</Articulo>
            </p>
          </div>

          <details className="bic-acordeon rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
            <summary className="flex cursor-pointer items-center gap-2 font-bold text-primary">
              <span aria-hidden="true">🧾</span> Ver el desglose punto por punto
              <span className="bic-flecha ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-secondary"><Chevron /></span>
            </summary>
            {["A", "B", "C"].map((k) => (
              <div key={k} className="mt-4">
                <p className="text-xs font-black uppercase tracking-wider text-neutral-600">{k} · {r[k]}/{r.max[k]}</p>
                <ul className="mt-1.5 divide-y divide-neutral-200">
                  {r.detalle[k].map((d) => (
                    <li key={d.id} className="flex justify-between gap-3 py-1.5 text-sm">
                      <span className="text-neutral-700">{d.criterio}</span>
                      <span className="font-bold tabular-nums text-primary">{d.puntos}/{d.max}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="mt-3"><Articulo>{r.max.art} · art. 16.2: puntaje = A + B + C</Articulo></p>
          </details>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <a
          href={whatsappDesde("bicentenario-2026", mensaje)}
          target="_blank"
          rel="noopener noreferrer"
          className="bic-press inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3.5 font-extrabold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800"
        >
          <span aria-hidden="true">💬</span> Recibir mi resultado por WhatsApp
        </a>
        <BotonCalendly><span aria-hidden="true">📅</span> Reservar sesión diagnóstico</BotonCalendly>
        <button type="button" onClick={onEditar} className="bic-press px-2 py-2 text-sm font-bold text-primary underline underline-offset-4 hover:text-primary-light">
          ✏️ Cambiar respuestas
        </button>
        <button type="button" onClick={onReiniciar} className="bic-press px-2 py-2 text-sm font-bold text-neutral-700 underline underline-offset-4 hover:text-primary">
          🔄 Empezar de nuevo
        </button>
      </div>
      <p className="mt-3 text-xs text-neutral-600"><span aria-hidden="true">🔒 </span>No guardamos tus respuestas: el cálculo se hace en tu navegador. WhatsApp solo se abre si pulsas el botón, y tú decides si envías el mensaje.</p>
    </div>
  );
}

// ── Simulador ───────────────────────────────────────────────────────────────
export default function SimuladorBicentenario() {
  const [nivel, setNivel] = useState("maestria");
  const [paso, setPaso] = useState(0);
  const [maximo, setMaximo] = useState(0);
  const [req, setReq] = useState({});
  const [pt, setPt] = useState({});
  const caja = useRef(null);
  const doc = nivel === "doctorado";

  // El rendimiento del paso 1 se reutiliza en el puntaje (se puede cambiar).
  const rendReq = ["puesto", "decimo", "quinto", "tercio"].includes(req.rendimiento) ? req.rendimiento : undefined;
  const resp = { ...pt, rendimiento: pt.rendimiento ?? rendReq };
  const r = calcularPuntaje(nivel, resp);
  const set = (id) => (v) => setPt((x) => ({ ...x, [id]: v }));

  function ir(n) {
    setPaso(n);
    setMaximo((m) => Math.max(m, n));
    requestAnimationFrame(() => caja.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  function cambiarNivel(n) {
    if (n === nivel) return;
    setNivel(n);
    setReq({});
    setPt({});
    setPaso(0);
    setMaximo(0);
  }

  const tramosIngreso = TRAMOS_INGRESO[doc ? "doctorado" : "maestria"];
  const ptsIngreso = puntosIngreso(doc ? "doctorado" : "maestria", resp.ingreso);

  return (
    <div ref={caja} data-simulador="" className="mx-auto max-w-4xl scroll-mt-32 xl:scroll-mt-24">
      <div className="rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-2xl shadow-primary/10 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Pestanas
            etiqueta="Nivel de estudios"
            valor={nivel}
            onChange={cambiarNivel}
            opciones={[
              { v: "maestria", emoji: "🎓", txt: "Maestría", n: CIFRAS.maestria },
              { v: "doctorado", emoji: "🔬", txt: "Doctorado", n: CIFRAS.doctorado },
            ]}
          />
          <span className="rounded-full bg-secondary-light px-3 py-1 text-xs font-bold text-primary">Máximo {r.max.total} puntos</span>
        </div>

        <div className="mt-6">
          <Pasos paso={paso} maximo={maximo} onIr={ir} />
        </div>

        <div key={`${nivel}-${paso}`} className="bic-entra mt-6">
          {paso === 0 && (
            <>
              <p className="mb-4 text-sm text-neutral-700">Primero, los requisitos que no se pueden saltar. Si alguno falla, te decimos cuál y qué otros caminos tienes.</p>
              <PasoRequisitos nivel={nivel} req={req} setReq={setReq} onSeguir={() => ir(1)} />
            </>
          )}

          {paso === 1 && (
            <>
              <Subtotal letra="A" emoji="👤" valor={r.A} max={r.max.A} texto="Perfil profesional y académico" />
              <div className="grid gap-3">
                <Pregunta id="rendimiento" emoji="🏅" titulo="Rendimiento académico" ayuda="Lo indicaste en el paso anterior; puedes corregirlo." art="Tabla 5">
                  <Opciones
                    columnas
                    opciones={[
                      { v: "puesto", txt: "1.er o 2.º puesto" },
                      { v: "decimo", txt: "Décimo superior" },
                      { v: "quinto", txt: "Quinto superior" },
                      { v: "tercio", txt: "Tercio superior" },
                    ]}
                    valor={resp.rendimiento}
                    onChange={set("rendimiento")}
                    puntos={(v) => PUNTOS.rendimiento[v]}
                  />
                </Pregunta>
                <Pregunta id="iesPublica" emoji="🏫" titulo={doc ? "¿Tu maestría es de una universidad pública peruana?" : "¿Tu bachiller o título es de una universidad o instituto público peruano?"} art="Tabla 5">
                  <Opciones columnas opciones={OPCIONES.iesPublica} valor={resp.iesPublica} onChange={set("iesPublica")} puntos={(v) => PUNTOS.iesPublica[v]} />
                </Pregunta>
                <Pregunta id="sectorPublico" emoji="🏛️" titulo="¿Cuánto tiempo has trabajado en el sector público?" art="Tabla 5">
                  <Opciones columnas opciones={OPCIONES.sectorPublico} valor={resp.sectorPublico} onChange={set("sectorPublico")} puntos={(v) => PUNTOS.sectorPublico[v]} />
                </Pregunta>
                {doc && (
                  <>
                    <Pregunta id="renacyt" emoji="🔬" titulo="¿Estás calificado en RENACYT?" art="Tabla 6">
                      <Opciones opciones={OPCIONES.renacyt} valor={resp.renacyt} onChange={set("renacyt")} puntos={(v) => PUNTOS.renacyt[v]} />
                    </Pregunta>
                    <Pregunta id="articulos" emoji="📰" titulo="Artículos en revistas indexadas" art="Tabla 6">
                      <Opciones columnas opciones={OPCIONES.articulos} valor={resp.articulos} onChange={set("articulos")} puntos={(v) => PUNTOS.articulos[v]} />
                    </Pregunta>
                    <Pregunta id="libros" emoji="📚" titulo="Libros publicados" art="Tabla 6">
                      <Opciones columnas opciones={OPCIONES.libros} valor={resp.libros} onChange={set("libros")} puntos={(v) => PUNTOS.libros[v]} />
                    </Pregunta>
                  </>
                )}
                <Pregunta id="carta" emoji="📄" titulo="¿Tienes carta de compromiso de contratación al volver o licencia por estudios?" ayuda="Firmada por tu empleador." art="Tabla 5 · art. 12">
                  <Opciones columnas opciones={OPCIONES.carta} valor={resp.carta} onChange={set("carta")} puntos={(v) => PUNTOS.carta[v]} />
                </Pregunta>
              </div>
              <Navegacion onAtras={() => ir(0)} onSiguiente={() => ir(2)} />
            </>
          )}

          {paso === 2 && (
            <>
              <Subtotal letra="B" emoji="🏛️" valor={r.B} max={r.max.B} texto="Universidad de destino" />
              <div className="grid gap-3">
                <Pregunta id="ranking" emoji="🌍" titulo="¿En qué tramo de ranking está tu universidad?" ayuda="España, la Unión Europea o cualquier país: vale el mejor puesto en QS, ARWU o THE de los últimos 5 años." art="Tabla 5 · art. 6.1">
                  <Opciones columnas opciones={OPCIONES.ranking} valor={resp.ranking} onChange={set("ranking")} puntos={(v) => PUNTOS.ranking[v]} />
                  <AyudaRanking seleccionado={resp.ranking} />
                </Pregunta>
                <Pregunta id="latam" emoji="🌎" titulo="¿Tu universidad está en Latinoamérica?" art="Tabla 5">
                  <Opciones columnas opciones={OPCIONES.latam} valor={resp.latam} onChange={set("latam")} puntos={(v) => PUNTOS.latam[v]} />
                </Pregunta>
                <Pregunta id="becaAcad" emoji="🎓" titulo="¿Tienes una beca académica sobre matrícula o pensión?" ayuda="De la universidad de destino u otra institución. PRONABEC descuenta su monto." art="Tabla 5 · art. 12">
                  <Opciones columnas opciones={OPCIONES.becaAcad} valor={resp.becaAcad} onChange={set("becaAcad")} puntos={(v) => PUNTOS.becaAcad[v]} />
                </Pregunta>
              </div>
              <Navegacion onAtras={() => ir(1)} onSiguiente={() => ir(3)} />
            </>
          )}

          {paso === 3 && (
            <>
              <Subtotal letra="C" emoji="💰" valor={r.C} max={r.max.C} texto="Condiciones priorizables" />
              <div className="grid gap-3">
                <Pregunta id="ingreso" emoji="💵" titulo="¿Cuál es tu ingreso individual bruto mensual?" ayuda="En soles. Si no tienes ingresos, pon 0." art={doc ? "Tabla 6" : "Tabla 5"}>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="relative block w-full max-w-[220px]">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-600">S/</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={resp.ingreso ?? ""}
                        onChange={(e) => set("ingreso")(e.target.value)}
                        aria-label="Ingreso individual bruto mensual en soles"
                        className="w-full rounded-xl border-2 border-neutral-200 py-3 pl-10 pr-3 text-lg font-bold text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                        placeholder="0"
                      />
                    </label>
                    {resp.ingreso !== undefined && resp.ingreso !== "" && (
                      <span key={ptsIngreso} className="bic-pop rounded-full bg-accent px-3 py-1 text-sm font-black text-primary-dark">+{ptsIngreso}</span>
                    )}
                  </div>
                  <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {tramosIngreso.map((t) => (
                      <li key={t.hasta} className="flex justify-between gap-2 rounded-lg bg-secondary-light px-3 py-1.5 text-xs font-semibold text-neutral-700">
                        <span>{t.texto}</span><b className="text-primary">+{t.puntos}</b>
                      </li>
                    ))}
                    <li className="flex justify-between gap-2 rounded-lg bg-secondary-light px-3 py-1.5 text-xs font-semibold text-neutral-700">
                      <span>Más de S/ {numeroPe(tramosIngreso[tramosIngreso.length - 1].hasta)}</span><b className="text-primary">+0</b>
                    </li>
                  </ul>
                </Pregunta>
                <Pregunta id="condicion" emoji="🤲" titulo="¿Te aplica alguna de estas condiciones?" ayuda="Suman 5 puntos como máximo, aunque tengas más de una." art="Tabla 5 · art. 13">
                  <Opciones columnas opciones={OPCIONES.condicion} valor={resp.condicion} onChange={set("condicion")} puntos={(v) => PUNTOS.condicion[v]} />
                </Pregunta>
              </div>
              <Navegacion accion="resultado" onAtras={() => ir(2)} onSiguiente={() => ir(4)} siguiente="Ver mi resultado" />
            </>
          )}

          {paso === 4 && (
            <Resultado
              nivel={nivel}
              req={req}
              resp={resp}
              onEditar={() => ir(1)}
              onReiniciar={() => {
                setReq({});
                setPt({});
                setMaximo(0);
                ir(0);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
