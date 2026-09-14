// src/pages/bicentenario/piezas.jsx
// Piezas de la página de la Beca Generación del Bicentenario 2026.
import { useEffect, useRef, useState } from "react";
import Icono from "../../components/common/Icono";
import { CALENDLY_URL } from "../../config/contacto";
import { navigate } from "../../services/navigate";
import { BECAS } from "../../config/paqueteMaster2027";
import { PRECIO_DESDE, eur } from "../../config/paqueteMaster2027Resumen";
import {
  AVISO_BECAS_UE,
  BECAS_UE,
  IDS_BECAS_ESPANA,
  PLAN_B,
  estadoPostulacion,
} from "../../config/bicentenario2026";

// ── Básicos ─────────────────────────────────────────────────────────────────
export function Seccion({ id, fondo = "bg-white", children, className = "" }) {
  return (
    <section id={id} className={`scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20 ${fondo} ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, claro = false }) {
  return (
    <span className={`text-xs font-bold uppercase tracking-[0.18em] ${claro ? "text-sun" : "text-accent"}`}>
      {children}
    </span>
  );
}

export function Titulo({ eyebrow, titulo, texto, centro = false }) {
  return (
    <div className={`mb-8 max-w-3xl sm:mb-10 ${centro ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 font-fraunces text-[1.75rem] font-bold leading-tight text-primary sm:text-4xl">{titulo}</h2>
      {texto && <p className="mt-3 text-base leading-relaxed text-neutral-700 sm:text-lg">{texto}</p>}
    </div>
  );
}

export function Articulo({ children }) {
  if (!children) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10.5px] font-bold text-primary/70">
      {children}
    </span>
  );
}

const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };

export function Check({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" {...trazo} /></svg>
  );
}
export function Cruz({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" {...trazo} /></svg>
  );
}
export function Alerta({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5M12 16.5v.5" {...trazo} /><circle cx="12" cy="12" r="9" {...trazo} strokeWidth={2} /></svg>
  );
}

/** Enlace interno (SPA) o ancla de la misma página. */
export function irA(e, href) {
  if (href.startsWith("#")) {
    e.preventDefault();
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
}

export function BotonCalendly({ children, className = "" }) {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-center font-extrabold text-white shadow-lg shadow-accent/25 transition hover:scale-[1.02] hover:bg-accent-dark active:scale-95 ${className}`}
    >
      {children}
    </a>
  );
}

// ── Animaciones pequeñas ────────────────────────────────────────────────────
/** true cuando el elemento entra en pantalla (con red de seguridad a 1,5 s). */
export function useVisible() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const io = new IntersectionObserver((entradas) => {
      if (entradas.some((x) => x.isIntersecting)) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(el);
    const t = setTimeout(() => setVisible(true), 1500);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  return [ref, visible];
}

/** Cuenta de `desde` a `hasta` en `ms`, con salida suave. */
export function useConteo(desde, hasta, ms = 1400, activo = true) {
  const [valor, setValor] = useState(desde);
  useEffect(() => {
    if (!activo) return;
    let raf;
    let t0;
    const paso = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      setValor(desde + (hasta - desde) * e);
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [desde, hasta, ms, activo]);
  return valor;
}

// ── Cuenta atrás ────────────────────────────────────────────────────────────
export function CuentaAtras() {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const e = estadoPostulacion(ahora);
  if (!e.objetivo) {
    return <p className="text-lg font-bold text-white">{e.rotulo}</p>;
  }
  const ms = Math.max(0, e.objetivo - ahora);
  const partes = [
    { n: Math.floor(ms / 86400000), u: "días" },
    { n: Math.floor(ms / 3600000) % 24, u: "horas" },
    { n: Math.floor(ms / 60000) % 60, u: "min" },
    { n: Math.floor(ms / 1000) % 60, u: "seg" },
  ];
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">{e.rotulo}</p>
      <div className="mt-3 grid grid-cols-4 gap-2" role="timer" aria-live="off">
        {partes.map((p) => (
          <div key={p.u} className="rounded-2xl bg-white/10 px-1 py-3 text-center ring-1 ring-white/15">
            <span className="block font-fraunces text-3xl font-black tabular-nums text-white sm:text-4xl">
              {String(p.n).padStart(2, "0")}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/55">{p.u}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bloque «Descubre otras becas o elige un máster económico» ───────────────
const becasEspana = () =>
  IDS_BECAS_ESPANA.map((id) => BECAS.tarjetas.find((b) => b.id === id)).filter(Boolean);

function TarjetaBecaEspana({ b }) {
  const lograda = b.chips?.some((c) => c.tipo === "lograda");
  return (
    <li className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="font-bold leading-snug text-primary">{b.titulo}</p>
      <p className="mt-1 text-sm leading-snug text-neutral-700">{b.texto}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-primary">
          <Icono nombre="calendario" size={12} /> {b.ventana}
        </span>
        {lograda && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sun/30 px-2.5 py-1 text-[11px] font-bold text-primary">
            <Check size={11} /> Lograda por asesorados en nuestra asesoría
          </span>
        )}
      </div>
    </li>
  );
}

function TarjetaBecaUE({ b }) {
  return (
    <li className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-bold leading-snug text-primary">{b.nombre}</p>
        <span className="rounded-full bg-primary px-2 py-0.5 text-[10.5px] font-bold text-white">{b.pais}</span>
      </div>
      <p className="mt-1 text-sm leading-snug text-neutral-700">{b.cubre}</p>
      <p className="mt-1.5 text-xs leading-snug text-neutral-500">{b.ventana}</p>
      <a href={b.fuente} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-block text-xs font-bold text-sky-dark underline underline-offset-2">
        Web oficial
      </a>
    </li>
  );
}

export function BloqueDescubre() {
  return (
    <Seccion id="descubre" fondo="bg-white">
      <Titulo
        eyebrow="Sea cual sea tu resultado"
        titulo="Descubre otras becas o elige un máster económico"
        texto="¿No calificas o no quieres depender de 20 plazas? Tranquilo: tienes dos caminos."
      />
      {/* En móvil los dos caminos van uno debajo del otro: atajos a cada uno. */}
      <div className="-mt-4 mb-6 grid grid-cols-2 gap-2 lg:hidden">
        <a href="#camino-becas" onClick={(e) => irA(e, "#camino-becas")} className="flex items-center justify-center gap-1.5 rounded-xl bg-sky/40 px-3 py-3 text-center text-sm font-extrabold text-primary">
          <Icono nombre="estrella" size={16} /> Otras becas
        </a>
        <a href="#camino-master" onClick={(e) => irA(e, "#camino-master")} className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-3 text-center text-sm font-extrabold text-white">
          <Icono nombre="euro" size={16} /> Máster económico
        </a>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Camino 1 */}
        <div id="camino-becas" className="scroll-mt-24 rounded-3xl border-2 border-sky bg-secondary-light p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky text-primary"><Icono nombre="estrella" size={22} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-dark">Camino 1</p>
              <h3 className="font-fraunces text-2xl font-bold text-primary">Otras becas para ti</h3>
            </div>
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-wider text-neutral-500">En España</p>
          <ul className="mt-2 grid gap-3">
            {becasEspana().map((b) => <TarjetaBecaEspana key={b.id} b={b} />)}
          </ul>

          <p className="mt-6 text-xs font-black uppercase tracking-wider text-neutral-500">En la Unión Europea</p>
          <ul className="mt-2 grid gap-3">
            {BECAS_UE.map((b) => <TarjetaBecaUE key={b.id} b={b} />)}
          </ul>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-neutral-600">
            <span className="mt-0.5 text-accent"><Alerta /></span>
            <span>{AVISO_BECAS_UE} Las ventanas de España son estimadas a partir del ciclo 2026-27.</span>
          </p>
        </div>

        {/* Camino 2 */}
        <div id="camino-master" className="flex scroll-mt-24 flex-col rounded-3xl bg-primary p-5 text-white sm:p-7 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sun text-primary"><Icono nombre="euro" size={22} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-sun">Camino 2</p>
              <h3 className="font-fraunces text-2xl font-bold">Un máster económico</h3>
            </div>
          </div>
          <p className="mt-6 text-sm font-semibold text-white/70">¿Y si no es con beca? Másteres oficiales en España</p>
          <p className="mt-1 font-fraunces font-black leading-none">
            <span className="align-middle text-xl text-white/70">desde unos </span>
            <span className="text-6xl text-sun sm:text-7xl">{eur(PLAN_B.matriculaDesde)}</span>
          </p>
          <p className="mt-1 text-lg font-bold">al año de matrícula</p>
          <p className="mt-3 text-xs leading-relaxed text-white/55">{PLAN_B.nota}</p>
          <a
            href={PLAN_B.hrefMapa}
            onClick={(e) => irA(e, PLAN_B.hrefMapa)}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-extrabold text-white transition hover:bg-accent-dark"
          >
            <Icono nombre="mapa" size={18} /> Descúbrelo en el mapa
          </a>
          <div className="mt-6 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <p className="text-sm text-white/70">Paquetes de postulación</p>
            <p className="font-fraunces text-3xl font-black">desde {eur(PRECIO_DESDE)}</p>
            <p className="mt-1 text-sm leading-snug text-white/70">Seleccionamos tus másteres, preparamos tu candidatura y postulamos por ti. La matrícula se paga aparte.</p>
            <a
              href={PLAN_B.hrefPaquete}
              onClick={(e) => irA(e, PLAN_B.hrefPaquete)}
              className="mt-3 inline-block text-sm font-bold text-sky underline underline-offset-4 hover:text-white"
            >
              Ver los paquetes de postulación
            </a>
          </div>
        </div>
      </div>
    </Seccion>
  );
}

/** Versión compacta, antes del CTA final. */
export function DescubreCompacto() {
  return (
    <div>
      <p className="font-fraunces text-xl font-bold text-primary sm:text-2xl">Descubre otras becas o elige un máster económico</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <a href="#descubre" onClick={(e) => irA(e, "#descubre")} className="group flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky hover:shadow-md">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky/40 text-primary"><Icono nombre="estrella" size={20} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-primary">Otras becas para ti</span>
            <span className="block text-sm text-neutral-500">España y Unión Europea</span>
          </span>
          <span className="text-neutral-300 transition group-hover:translate-x-1 group-hover:text-accent">→</span>
        </a>
        <a href={PLAN_B.hrefMapa} onClick={(e) => irA(e, PLAN_B.hrefMapa)} className="group flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky hover:shadow-md">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sun/40 text-primary"><Icono nombre="euro" size={20} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-primary">Un máster económico</span>
            <span className="block text-sm text-neutral-500">Desde unos {eur(PLAN_B.matriculaDesde)} al año · paquetes desde {eur(PRECIO_DESDE)}</span>
          </span>
          <span className="text-neutral-300 transition group-hover:translate-x-1 group-hover:text-accent">→</span>
        </a>
      </div>
    </div>
  );
}
