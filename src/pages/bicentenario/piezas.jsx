// src/pages/bicentenario/piezas.jsx
// Piezas de la página de la Beca Generación del Bicentenario 2026: aparición al
// hacer scroll, contadores, pestañas, acordeones, índice con emojis, cuenta
// atrás y el bloque «Descubre otras becas o elige un máster económico».
// Movimiento solo con CSS e IntersectionObserver; con prefers-reduced-motion
// todo aparece quieto y con su valor final.
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CALENDLY_URL } from "../../config/contacto";
import { navigate } from "../../services/navigate";
import { BECAS } from "../../config/paqueteMaster2027";
import { PRECIO_DESDE, eur } from "../../config/paqueteMaster2027Resumen";
import {
  AVISO_BECAS_UE,
  BANDERA_UE,
  BECAS_UE,
  IDS_BECAS_ESPANA,
  PLAN_B,
  estadoPostulacion,
} from "../../config/bicentenario2026";
import { Bandera, IlustracionBecas, IlustracionMaster } from "./ilustraciones";

const quietoAhora = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// ── Aparición al hacer scroll ───────────────────────────────────────────────
// Un solo IntersectionObserver para toda la página. Si el elemento ya está en
// pantalla al montarse, aparece en el siguiente frame (no depende del observer).
let observador = null;
const avisos = new WeakMap();

function observar(el, cb) {
  if (typeof IntersectionObserver === "undefined") {
    cb();
    return () => {};
  }
  if (!observador) {
    observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const f = avisos.get(e.target);
          observador.unobserve(e.target);
          avisos.delete(e.target);
          if (f) f();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 }
    );
  }
  avisos.set(el, cb);
  observador.observe(el);
  return () => {
    avisos.delete(el);
    observador?.unobserve(el);
  };
}

export function useEnPantalla() {
  const ref = useRef(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visto) return;
    if (quietoAhora()) {
      setVisto(true);
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      const t = requestAnimationFrame(() => setVisto(true));
      return () => cancelAnimationFrame(t);
    }
    return observar(el, () => setVisto(true));
  }, [visto]);
  return [ref, visto];
}

/** Envoltorio que aparece con fade/slide. efecto: "", "bic-izq", "bic-der", "bic-zoom". */
export function Revelar({ as: Tag = "div", className = "", efecto = "", retraso = 0, style, children, ...resto }) {
  const [ref, visto] = useEnPantalla();
  return (
    <Tag
      ref={ref}
      className={`bic-rev ${efecto} ${visto ? "bic-in" : ""} ${className}`}
      style={{ ...style, "--bic-d": `${retraso}ms` }}
      {...resto}
    >
      {children}
    </Tag>
  );
}

// ── Contadores ──────────────────────────────────────────────────────────────
export function useConteo(desde, hasta, ms = 1400, activo = true) {
  const [valor, setValor] = useState(desde);
  useEffect(() => {
    if (!activo) return;
    if (quietoAhora()) {
      setValor(hasta);
      return;
    }
    let raf;
    let t0;
    const paso = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / ms);
      setValor(desde + (hasta - desde) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [desde, hasta, ms, activo]);
  return valor;
}

/** Número que cuenta al entrar en pantalla. El lector de pantalla oye el valor final. */
export function Contador({ desde = 0, hasta, ms = 1600, formato = (v) => Math.round(v), className = "" }) {
  const [ref, visto] = useEnPantalla();
  const v = useConteo(desde, hasta, ms, visto);
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true" className="tabular-nums">{formato(v)}</span>
      <span className="sr-only">{formato(hasta)}</span>
    </span>
  );
}

// ── Básicos ─────────────────────────────────────────────────────────────────
export function Emoji({ children, className = "" }) {
  return <span aria-hidden="true" className={`bic-emoji-hover leading-none ${className}`}>{children}</span>;
}

export function Seccion({ id, fondo = "bg-white", children, className = "" }) {
  return (
    <section id={id} className={`scroll-mt-32 px-4 py-12 sm:px-6 sm:py-16 xl:scroll-mt-24 ${fondo} ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ emoji, children, claro = false }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] ${claro ? "bg-white/10 text-sun" : "bg-accent/15 text-primary"}`}>
      {emoji && <Emoji className="text-base">{emoji}</Emoji>}
      {children}
    </span>
  );
}

export function Titulo({ emoji, eyebrow, titulo, texto, centro = false }) {
  return (
    <Revelar className={`mb-8 max-w-3xl sm:mb-10 ${centro ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow emoji={emoji}>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 font-fraunces text-[1.7rem] font-bold leading-tight text-primary sm:text-4xl">{titulo}</h2>
      {texto && <p className="mt-3 text-base leading-relaxed text-neutral-700 sm:text-lg">{texto}</p>}
    </Revelar>
  );
}

export function Articulo({ children, claro = false, className = "" }) {
  if (!children) return null;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold ${claro ? "bg-white/15 text-white" : "bg-secondary text-primary"} ${className}`}>
      {children}
    </span>
  );
}

const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };

export function Check({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" {...trazo} /></svg>;
}
export function Cruz({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" {...trazo} /></svg>;
}
export function Alerta({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 8v5M12 16.5v.5" {...trazo} />
      <circle cx="12" cy="12" r="9" {...trazo} strokeWidth={2} />
    </svg>
  );
}
export function Chevron({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" {...trazo} /></svg>;
}

/** Enlace interno (SPA) o ancla de la misma página. */
export function irA(e, href) {
  e.preventDefault();
  if (href.startsWith("#")) {
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: quietoAhora() ? "auto" : "smooth", block: "start" });
    return;
  }
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
}

export function BotonCalendly({ children, className = "" }) {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`bic-press inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-center font-extrabold text-primary-dark shadow-lg shadow-accent/25 transition hover:bg-sun ${className}`}
    >
      {children}
    </a>
  );
}

/** Contenido desplegable con altura animada. */
export function Expandible({ abierto, id, children }) {
  return (
    <div id={id} className={`bic-expand ${abierto ? "bic-abierto" : ""}`}>
      <div>{children}</div>
    </div>
  );
}

/** Acordeón nativo (details) con emoji y flecha. */
export function Acordeon({ emoji, titulo, resumen, children, className = "" }) {
  return (
    <details className={`bic-acordeon group rounded-2xl border border-neutral-200 bg-white transition open:border-sky open:shadow-md ${className}`}>
      <summary className="flex cursor-pointer items-center gap-3 p-4 sm:p-5">
        {emoji && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">
            <Emoji>{emoji}</Emoji>
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-bold leading-snug text-primary">{titulo}</span>
          {resumen && <span className="mt-0.5 block text-sm leading-snug text-neutral-600">{resumen}</span>}
        </span>
        <span className="bic-flecha flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <Chevron />
        </span>
      </summary>
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
    </details>
  );
}

/** Selector tipo pestañas (botones con aria-pressed). */
export function Pestanas({ opciones, valor, onChange, etiqueta, className = "" }) {
  return (
    <div role="group" aria-label={etiqueta} className={`bic-chips inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-secondary p-1 ${className}`}>
      {opciones.map((o) => {
        const activo = o.v === valor;
        return (
          <button
            key={o.v}
            type="button"
            aria-pressed={activo}
            onClick={() => onChange(o.v)}
            className={`bic-press flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-extrabold transition ${activo ? "bg-primary text-white shadow" : "text-primary hover:bg-white/70"}`}
          >
            {o.emoji && <Emoji>{o.emoji}</Emoji>}
            {o.txt}
            {o.n != null && (
              <span className={`rounded-full px-1.5 py-px text-[11px] ${activo ? "bg-white/20 text-white" : "bg-white text-primary"}`}>{o.n}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Cuenta atrás ────────────────────────────────────────────────────────────
export function CuentaAtras() {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const e = estadoPostulacion(ahora);
  if (!e.objetivo) return <p className="text-lg font-bold text-white">{e.rotulo}</p>;
  const ms = Math.max(0, e.objetivo - ahora);
  const partes = [
    { n: Math.floor(ms / 86400000), u: "días" },
    { n: Math.floor(ms / 3600000) % 24, u: "horas" },
    { n: Math.floor(ms / 60000) % 60, u: "min" },
    { n: Math.floor(ms / 1000) % 60, u: "seg" },
  ];
  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/80">
        <Emoji className="text-base">⏳</Emoji>
        {e.rotulo}
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2" role="timer" aria-live="off">
        {partes.map((p) => (
          <div key={p.u} className="rounded-2xl bg-white/10 px-1 py-3 text-center ring-1 ring-white/15">
            <span className="block font-fraunces text-3xl font-black tabular-nums text-white sm:text-4xl">{String(p.n).padStart(2, "0")}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">{p.u}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Índice flotante con emojis ──────────────────────────────────────────────
// Móvil y tablet: chips horizontales pegados bajo la cabecera.
// Escritorio ancho: riel vertical a la izquierda (en un portal, para que
// ninguna animación de la página le cambie la referencia de position: fixed).
export function IndiceSecciones({ secciones }) {
  const [activa, setActiva] = useState(secciones[0]?.id);
  const [riel, setRiel] = useState(false);
  const barra = useRef(null);

  useEffect(() => {
    const els = secciones.map((s) => document.getElementById(s.id)).filter(Boolean);
    const onScroll = () => setRiel(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    let io;
    if (els.length && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (ents) => {
          const vis = ents.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (vis[0]) setActiva(vis[0].target.id);
        },
        { rootMargin: "-35% 0px -55% 0px" }
      );
      els.forEach((el) => io.observe(el));
    }
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [secciones]);

  useEffect(() => {
    const cont = barra.current;
    const chip = cont?.querySelector(`[data-sec="${activa}"]`);
    if (cont && chip) {
      cont.scrollTo({ left: chip.offsetLeft - cont.clientWidth / 2 + chip.clientWidth / 2, behavior: quietoAhora() ? "auto" : "smooth" });
    }
  }, [activa]);

  return (
    <>
      <nav aria-label="Secciones de la página" className="bic-indice border-b border-primary/10 bg-white/95 backdrop-blur xl:hidden">
        <div ref={barra} className="bic-chips mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
          {secciones.map((s) => (
            <a
              key={s.id}
              data-sec={s.id}
              href={`#${s.id}`}
              onClick={(e) => irA(e, `#${s.id}`)}
              aria-current={activa === s.id ? "true" : undefined}
              className={`bic-press flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition ${activa === s.id ? "bg-primary text-white shadow" : "bg-secondary text-primary"}`}
            >
              <Emoji>{s.emoji}</Emoji>
              {s.txt}
            </a>
          ))}
        </div>
      </nav>
      {typeof document !== "undefined" &&
        createPortal(
          <nav
            aria-label="Índice de la página"
            aria-hidden={!riel}
            className={`bic-riel fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-1 rounded-full bg-white/95 p-1.5 shadow-xl ring-1 ring-primary/10 backdrop-blur transition-opacity duration-300 xl:flex ${riel ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            {secciones.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                tabIndex={riel ? 0 : -1}
                onClick={(e) => irA(e, `#${s.id}`)}
                aria-label={s.txt}
                aria-current={activa === s.id ? "true" : undefined}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-full text-lg transition ${activa === s.id ? "bg-primary shadow" : "hover:bg-secondary"}`}
              >
                <span aria-hidden="true">{s.emoji}</span>
                <span className="pointer-events-none absolute left-12 whitespace-nowrap rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white opacity-0 shadow transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  {s.txt}
                </span>
              </a>
            ))}
          </nav>,
          document.body
        )}
    </>
  );
}

// ── Bloque «Descubre otras becas o elige un máster económico» ───────────────
function listaBecas() {
  const espana = IDS_BECAS_ESPANA.map((id) => BECAS.tarjetas.find((b) => b.id === id))
    .filter(Boolean)
    .map((b) => ({
      id: b.id,
      grupo: "espana",
      nombre: b.titulo,
      pais: "España",
      bandera: "es",
      texto: b.texto,
      ventana: b.ventana,
      lograda: !!b.chips?.some((c) => c.tipo === "lograda"),
      fuente: null,
    }));
  const ue = BECAS_UE.map((b) => ({
    id: b.id,
    grupo: "ue",
    nombre: b.nombre,
    pais: b.pais,
    bandera: BANDERA_UE[b.id] || "ue",
    texto: b.cubre,
    ventana: b.ventana,
    lograda: false,
    fuente: b.fuente,
  }));
  return [...espana, ...ue];
}

function TarjetaBeca({ b, abierta, onToggle, i }) {
  return (
    <li className="bic-entra" style={{ "--bic-d": `${i * 55}ms` }}>
      <div className={`bic-lift h-full rounded-2xl border-2 bg-white p-4 ${abierta ? "border-accent shadow-lg" : "border-neutral-200"}`}>
        <button type="button" onClick={onToggle} aria-expanded={abierta} aria-controls={`beca-${b.id}`} className="bic-press flex w-full items-start gap-3 text-left">
          <Bandera pais={b.bandera} titulo={b.pais} className="mt-1" />
          <span className="min-w-0 flex-1">
            <span className="block font-bold leading-snug text-primary">{b.nombre}</span>
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-primary">{b.pais}</span>
              {b.lograda && (
                <span className="rounded-full bg-sun/45 px-2 py-0.5 text-[11px] font-bold text-primary">
                  <span aria-hidden="true">🏅 </span>Lograda por asesorados en nuestra asesoría
                </span>
              )}
            </span>
          </span>
          <span className={`bic-flecha flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary ${abierta ? "bic-girada" : ""}`}>
            <Chevron />
          </span>
        </button>
        <p className="mt-3 flex gap-1.5 text-xs font-semibold leading-snug text-neutral-700">
          <span aria-hidden="true">🗓️</span>
          {b.ventana}
        </p>
        <Expandible abierto={abierta} id={`beca-${b.id}`}>
          <p className="mt-3 border-t border-neutral-200 pt-3 text-sm leading-relaxed text-neutral-700">{b.texto}</p>
          {b.fuente && (
            <a href={b.fuente} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary-light underline underline-offset-2">
              <span aria-hidden="true">🔗</span> Web oficial
            </a>
          )}
        </Expandible>
      </div>
    </li>
  );
}

function ExploradorBecas() {
  const todas = useMemo(listaBecas, []);
  const [filtro, setFiltro] = useState("todas");
  const [abierta, setAbierta] = useState(null);
  const filtros = [
    { v: "todas", txt: "Todas", emoji: "✨", n: todas.length },
    { v: "espana", txt: "España", bandera: "es", n: todas.filter((b) => b.grupo === "espana").length },
    { v: "ue", txt: "Unión Europea", bandera: "ue", n: todas.filter((b) => b.grupo === "ue").length },
    { v: "lograda", txt: "Logradas por asesorados", emoji: "🏅", n: todas.filter((b) => b.lograda).length },
  ];
  const lista = todas.filter((b) => filtro === "todas" || (filtro === "lograda" ? b.lograda : b.grupo === filtro));

  return (
    <div>
      <div role="group" aria-label="Filtrar becas" className="bic-chips -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {filtros.map((f) => {
          const activo = filtro === f.v;
          return (
            <button
              key={f.v}
              type="button"
              aria-pressed={activo}
              onClick={() => {
                setFiltro(f.v);
                setAbierta(null);
              }}
              className={`bic-press flex shrink-0 items-center gap-2 rounded-full border-2 px-3.5 py-2 text-sm font-bold transition ${activo ? "border-primary bg-primary text-white shadow" : "border-neutral-200 bg-white text-primary hover:border-primary/40"}`}
            >
              {f.bandera ? <Bandera pais={f.bandera} titulo={f.txt} /> : <Emoji>{f.emoji}</Emoji>}
              {f.txt}
              <span className={`rounded-full px-1.5 text-[11px] ${activo ? "bg-white/20" : "bg-secondary"}`}>{f.n}</span>
            </button>
          );
        })}
      </div>
      <ul key={filtro} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((b, i) => (
          <TarjetaBeca key={b.id} b={b} i={i} abierta={abierta === b.id} onToggle={() => setAbierta(abierta === b.id ? null : b.id)} />
        ))}
      </ul>
    </div>
  );
}

export function BloqueDescubre() {
  const nEs = IDS_BECAS_ESPANA.length;
  const nUe = BECAS_UE.length;
  return (
    <Seccion id="descubre" fondo="bg-white">
      <Titulo
        centro
        emoji="🧭"
        eyebrow="Sea cual sea tu resultado"
        titulo="Descubre otras becas o elige un máster económico"
        texto="¿No calificas o no quieres depender de 20 plazas? Tranquilo: tienes dos caminos."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Revelar efecto="bic-izq" className="h-full">
          <div className="bic-lift relative flex h-full flex-col overflow-hidden rounded-[2rem] border-2 border-sky bg-gradient-to-br from-secondary-light to-secondary p-6 sm:p-8">
            <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-black text-primary shadow">Camino 1</span>
            <IlustracionBecas className="mx-auto h-36 w-auto sm:h-44" />
            <h3 className="mt-3 font-fraunces text-2xl font-bold text-primary sm:text-3xl">
              <Emoji>🏅</Emoji> Otras becas para ti
            </h3>
            <p className="mt-2 text-neutral-700">
              {nEs} becas en España y {nUe} en la Unión Europea, con su ventana de postulación.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-primary">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm"><Bandera pais="es" titulo="España" /> España</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm"><Bandera pais="ue" titulo="Unión Europea" /> Unión Europea</span>
            </div>
            <div className="mt-auto pt-6">
              <a
                href="#explorador-becas"
                onClick={(e) => irA(e, "#explorador-becas")}
                className="bic-press inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-extrabold text-white transition hover:bg-primary-light sm:w-auto"
              >
                <Emoji>🔎</Emoji> Explorar las becas
              </a>
            </div>
          </div>
        </Revelar>

        <Revelar efecto="bic-der" retraso={120} className="h-full">
          <div className="bic-lift relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-primary p-6 text-white sm:p-8">
            <span className="absolute right-4 top-4 rounded-full bg-sun px-3 py-1 text-xs font-black text-primary shadow">Camino 2</span>
            <IlustracionMaster className="mx-auto h-36 w-auto sm:h-44" />
            <h3 className="mt-3 font-fraunces text-2xl font-bold sm:text-3xl">
              <Emoji>💶</Emoji> Un máster económico
            </h3>
            <p className="mt-2 text-white/80">¿Y si no es con beca? Másteres oficiales en España</p>
            <p className="mt-1 font-fraunces font-black leading-none">
              <span className="text-lg text-white/80">desde unos </span>
              <span className="text-5xl text-sun sm:text-6xl">{eur(PLAN_B.matriculaDesde)}</span>
              <span className="text-lg text-white"> al año</span>
            </p>
            <details className="bic-acordeon mt-3 text-sm">
              <summary className="inline-flex cursor-pointer items-center gap-1 font-bold text-sky">
                ¿De dónde sale esta cifra? <span className="bic-flecha"><Chevron size={14} /></span>
              </summary>
              <p className="mt-2 leading-relaxed text-white/80">{PLAN_B.nota}</p>
            </details>
            <div className="mt-auto pt-6">
              <a
                href={PLAN_B.hrefMapa}
                onClick={(e) => irA(e, PLAN_B.hrefMapa)}
                className="bic-press inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-extrabold text-primary-dark shadow-lg shadow-black/20 transition hover:bg-sun sm:w-auto"
              >
                <Emoji>🗺️</Emoji> Descúbrelo en el mapa
              </a>
              <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/85">
                <span aria-hidden="true">📦 </span>Paquetes de postulación <b className="text-sun">desde {eur(PRECIO_DESDE)}</b>{" · "}
                <a href={PLAN_B.hrefPaquete} onClick={(e) => irA(e, PLAN_B.hrefPaquete)} className="font-bold text-white underline underline-offset-4">
                  Ver los paquetes
                </a>
              </p>
            </div>
          </div>
        </Revelar>
      </div>

      <div id="explorador-becas" className="mt-12 scroll-mt-32 xl:scroll-mt-24">
        <Revelar className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h3 className="font-fraunces text-2xl font-bold text-primary">
            <Emoji>🔎</Emoji> Explora las becas
          </h3>
          <p className="text-sm text-neutral-600">Filtra y toca una tarjeta para ver qué cubre.</p>
        </Revelar>
        <ExploradorBecas />
        <p className="mt-5 flex gap-2 rounded-2xl bg-secondary-light p-4 text-sm leading-relaxed text-neutral-700">
          <span className="text-primary"><Alerta size={16} /></span>
          <span>{AVISO_BECAS_UE} Las ventanas de España son estimadas a partir del ciclo 2026-27.</span>
        </p>
      </div>
    </Seccion>
  );
}

/** Versión compacta, antes del CTA final. */
export function DescubreCompacto() {
  return (
    <div>
      <p className="font-fraunces text-xl font-bold text-primary sm:text-2xl">
        <Emoji>🧭</Emoji> Descubre otras becas o elige un máster económico
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <a href="#descubre" onClick={(e) => irA(e, "#descubre")} className="bic-lift bic-press group flex items-center gap-3 rounded-2xl border-2 border-sky bg-white p-3">
          <IlustracionBecas className="h-16 w-20 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-primary">Otras becas para ti</span>
            <span className="block text-sm text-neutral-700">España y Unión Europea</span>
          </span>
          <span aria-hidden="true" className="text-primary transition group-hover:translate-x-1">→</span>
        </a>
        <a href={PLAN_B.hrefMapa} onClick={(e) => irA(e, PLAN_B.hrefMapa)} className="bic-lift bic-press group flex items-center gap-3 rounded-2xl bg-primary p-3 text-white">
          <IlustracionMaster className="h-16 w-20 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Un máster económico</span>
            <span className="block text-sm text-white/80">Desde unos {eur(PLAN_B.matriculaDesde)} al año · paquetes de postulación desde {eur(PRECIO_DESDE)}</span>
          </span>
          <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
        </a>
      </div>
    </div>
  );
}
