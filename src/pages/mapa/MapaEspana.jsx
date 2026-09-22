// src/pages/mapa/MapaEspana.jsx
// «Mapa para estudiar en España» (/mapa-estudiar-en-espana): web pública.
//
// Datos: GET /api/mapa (inspira-backend/src/modules/mapa). Geografía:
// pages/landing/master2027/mapaEspana.data.js por import dinámico, en paralelo
// con la petición, para que ni la página ni el mapa pesen en el paquete de la
// portada. Si la API no responde, estado de error con reintento.
//
// Identidad propia con el kit de marca (Noche, Cielo, Sol y Merriweather en
// los titulares): relieve por capas, ruta con avión desde Lima, cifras que suben y
// fichas que entran con suavidad. Todo se apaga con prefers-reduced-motion.
//
// Rediseño del 17/09/2026: iconos de trazo propios en lugar de caracteres
// sueltos, entradas al asomar (lib/revelar.js) en vez de todas al cargar,
// esqueletos mientras llega la API y tres pasos que explican la página de un
// vistazo. Ningún control se movió ni se quitó.
//
// Estado compartible en la URL (useEstadoMapa.js). Lo que se pinta dentro va
// en un CercoErrores: un fallo de una ficha no deja la página en blanco y
// queda registrado en /api/errores-web.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageHero from "../../components/layout/PageHero";
import CercoErrores from "../../components/common/CercoErrores";
import Icono from "../../components/common/Icono";
import { useSEO } from "../../hooks/useSEO";
import { CASOS } from "../../config/casos";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";
import { cascada, revelarTodo, useRevelar } from "../../lib/revelar";
import { ABRE_MESES, RANKING_TOPES, aplicarFiltros, casosEnMapa, crearIndice, hayRanking, hayTitularidad, prefiereMenosMovimiento } from "./indice";
import { useEstadoMapa } from "./useEstadoMapa";
import { useEsEscritorio } from "./useEsEscritorio";
import { CONFIANZA, CTA, HERO, PAQUETE, PIE, RANKING, RECOMENDAR, SEO, SESION, T, etiquetaListaLarga, eur, plural } from "./mapaTextos";
import ResultadosUniversidades from "./ResultadosUniversidades";
import Recomendador from "./Recomendador";
import GuardarComparativa from "./GuardarComparativa";
import { eventoMapa } from "./eventosMapa";
import { NOCHE, SOL, tonoDe } from "./tonosMapa";
import MapaInteractivo from "./MapaInteractivo";
import Filtros from "./Filtros";
import HojaDetalle from "./HojaDetalle";
import { Cifra, FichaCaso, FichaCiudad, FichaComunidad, FichaFuera, FichaInicio, FichaUniversidad } from "./Fichas";
import Comparador from "./Comparador";
import ListaComunidades from "./ListaComunidades";
import IlustracionCiudad from "./IlustracionesMapa";
import CompartirMapa from "./compartirMapa";
import TarjetaMini from "./TarjetaMini";
import { useInteres } from "./useInteres";
import "../../styles/movimiento.css";
import "./mapa.css";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const MAX_COMPARAR = 3;
const EJEMPLO_COMPARAR = ["andalucia", "madrid", "cataluna"];
async function pedirMapa() {
  const control = new AbortController();
  const tope = setTimeout(() => control.abort(), 15000);
  try {
    const r = await fetch(`${API_URL}/api/mapa`, { signal: control.signal, headers: { Accept: "application/json" } });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j?.ok || !Array.isArray(j.comunidades)) throw new Error(j?.msg || `HTTP ${r.status}`);
    return j;
  } finally {
    clearTimeout(tope);
  }
}

const cargarGeografia = () => import("../landing/master2027/mapaEspana.data");

const irSuave = (el) => {
  revelarTodo(document);
  el?.scrollIntoView({ behavior: prefiereMenosMovimiento() ? "auto" : "smooth", block: "start" });
};

/* ── Estados de carga ────────────────────────────────────────────────── */

/**
 * Mientras llega GET /api/mapa se dibuja el hueco que van a ocupar las cosas
 * (barra de filtros, mapa y ficha), no la frase «Cargando el mapa…»: así la
 * página no da un salto al llegar los datos. El texto sigue ahí para quien
 * navega con lector de pantalla.
 */
function Esqueleto() {
  const paso = cascada(90);
  return (
    <div role="status" aria-live="polite" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
      <span className="sr-only">{T.cargando}</span>
      <div>
        <div className="mapa-esqueleto h-[132px] rounded-[28px] sm:h-[116px]" style={paso()} />
        <div className="mapa-mar mapa-marco relative mt-5 flex aspect-[1000/829] items-center justify-center overflow-hidden rounded-[28px] border border-[#CFE6FD]">
          <div className="mapa-esqueleto h-[62%] w-[66%] rounded-[46%_54%_48%_52%/52%_46%_54%_48%]" style={paso()} />
          <span
            aria-hidden="true"
            className="mapa-esqueleto absolute left-[26%] top-[38%] h-9 w-9 rounded-full"
            style={paso()}
          />
          <span
            aria-hidden="true"
            className="mapa-esqueleto absolute right-[28%] top-[52%] h-6 w-6 rounded-full"
            style={paso()}
          />
          <span className="absolute bottom-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-[12px] font-bold text-[#003648] shadow-sm ring-1 ring-[#CFE6FD]">
            <span className="text-[#F09C48] motion-safe:animate-pulse">
              <Icono nombre="avion" size={15} />
            </span>
            {T.cargando}
          </span>
        </div>
      </div>
      <div className="hidden rounded-3xl border border-[#E1EFFD] bg-white p-5 lg:block">
        <div className="mapa-esqueleto h-3 w-24 rounded-full" style={paso()} />
        <div className="mapa-esqueleto mt-3 h-7 w-4/5 rounded-lg" style={paso()} />
        <div className="mapa-esqueleto mt-3 h-24 rounded-2xl" style={paso()} />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="mapa-esqueleto h-16 rounded-2xl" style={paso()} />
          <div className="mapa-esqueleto h-16 rounded-2xl" style={paso()} />
          <div className="mapa-esqueleto h-16 rounded-2xl" style={paso()} />
        </div>
        <div className="mapa-esqueleto mt-4 h-40 rounded-2xl" style={paso()} />
      </div>
    </div>
  );
}

function ErrorCarga({ onReintentar }) {
  return (
    <div role="alert" className="mapa-mar mx-auto max-w-xl rounded-[28px] border border-[#CFE6FD] p-6 text-center sm:p-9">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#F09C48] shadow-sm">
        <Icono nombre="avion" size={26} />
      </span>
      <h2 className="mapa-titular mt-4 text-2xl font-bold text-[#003648]">{T.errorTitulo}</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">{T.errorTexto}</p>
      <button
        type="button"
        onClick={onReintentar}
        className="mapa-boton mov-toque mt-5 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#003648] px-6 py-3 text-sm font-extrabold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
      >
        <Icono nombre="rayo" size={16} className="text-[#F09C48]" />
        {T.reintentar}
      </button>
      <p className="mt-4 text-xs text-neutral-700">
        Mientras tanto, puedes{" "}
        <a
          href={whatsappDesde("mapa", T.errorWhatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[#0A5873] underline underline-offset-2"
        >
          escribirnos por WhatsApp
        </a>
        .
      </p>
    </div>
  );
}

/**
 * Acciones de la cabecera. Hasta ahora el único camino desde arriba era
 * bajar a ciegas; con esto la portada ofrece las dos cosas que la gente viene
 * a hacer: reservar o mirar el mapa. El salto al explorador es un ancla de
 * toda la vida, que funciona aunque el JavaScript aún no haya arrancado.
 */
function AccionesHero() {
  return (
    <>
      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => registrarEvento("mapa_sesion", { desde: "cabecera" })}
        className="mov-toque mov-brillo inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-extrabold text-primary hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
      >
        <Icono nombre="calendario" size={18} />
        {SESION}
      </a>
      <a
        href="#mapa-explorador"
        className="mov-toque inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 border-white/25 bg-white/10 px-5 py-3 text-sm font-extrabold text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent"
      >
        <Icono nombre="mapa" size={18} className="text-sky" />
        Ver el mapa
      </a>
    </>
  );
}

/* ── Piezas del explorador ───────────────────────────────────────────── */

// Los tres pasos: en tres segundos se entiende qué es esta página y qué se
// puede hacer con ella. Es texto, no controles: nada que pulsar aquí.
const PASOS = [
  { icono: "toque", titulo: "Toca una comunidad", texto: "o una ciudad, o una universidad." },
  { icono: "balanza", titulo: "Compara lo que cuesta", texto: "matrícula al año, vida, ranking QS y plazos." },
  { icono: "calendario", titulo: "Reserva tu sesión", texto: "y sales con un plan escrito para postular." },
];

function Pasos({ className = "" }) {
  const paso = cascada(80);
  return (
    <ol className={`mt-4 grid gap-2 sm:grid-cols-3 ${className}`}>
      {PASOS.map((p, i) => (
        <li
          key={p.titulo}
          data-revelar="suave"
          data-paso={i + 1}
          style={paso()}
          className="mapa-paso flex items-start gap-3 rounded-2xl border border-[#E1EFFD] bg-white px-3.5 py-3"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F2FE] text-[#0A5873]">
            <Icono nombre={p.icono} size={18} />
          </span>
          <span className="relative min-w-0">
            <span className="block text-[13px] font-extrabold leading-snug text-[#003648]">{p.titulo}</span>
            <span className="block text-[12px] leading-snug text-neutral-700">{p.texto}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Titular del explorador. Se deja solo: las cifras y el botón de la
 * recomendación se pintan aparte para poder bajarlos del mapa en el teléfono
 * (el DOM no cambia de orden, solo el sitio donde se dibujan).
 */
function Cabecera({ className = "" }) {
  return (
    <div className={`min-w-0 ${className}`} data-revelar>
      <p className="mapa-rotulo">
        <Icono nombre="mapa" size={14} />
        Explora · listas 2027/2028
      </p>
      <h2 className="mapa-titular mt-1.5 text-[26px] font-bold leading-tight text-[#003648] sm:text-[34px]">
        ¿Cuánto cuesta un máster aquí? Tócalo en el mapa
      </h2>
      <p className="mt-1.5 hidden text-sm text-neutral-700 sm:block">
        Matrícula de un máster al año en cada comunidad, ciudad y universidad, con su ranking QS.
      </p>
    </div>
  );
}

/** Las tres cifras y el botón que abre el recomendador. */
function CifrasAccion({ totales, onRecomendar, className = "" }) {
  return (
    <div className={`mb-5 mt-3 flex flex-wrap items-center gap-2 ${className}`} data-revelar="escala">
      <dl className="grid w-full min-w-0 grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-1 sm:flex-wrap">
        {[
          { n: totales.masteres, t: "másteres oficiales", icono: "birrete" },
          { n: totales.universidades, t: "universidades", icono: "casa" },
          { n: totales.comunidades, t: "comunidades", icono: "mapa" },
        ].map((d) => (
          <div key={d.t} className="mapa-cifra rounded-2xl bg-[#003648] px-3 py-2.5 text-white sm:px-4">
            <dd className="mapa-titular flex items-center gap-2 text-xl font-bold leading-none">
              <span className="text-[#F09C48]">
                <Icono nombre={d.icono} size={19} />
              </span>
              <Cifra n={d.n} />
            </dd>
            <dt className="mt-1.5 text-[11px] font-semibold leading-tight text-[#96CCFC] sm:text-[12px]">{d.t}</dt>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={onRecomendar}
        className="mapa-boton mov-toque inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#F09C48] px-5 py-2.5 text-sm font-extrabold text-[#003648] hover:bg-[#F4AD62] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003648] sm:w-auto"
      >
        <Icono nombre="brujula" size={17} />
        {RECOMENDAR.boton}
      </button>
    </div>
  );
}

function Leyenda({ indice, ranking }) {
  return (
    <div className="mt-3 rounded-3xl border border-[#E1EFFD] bg-white/70 px-4 py-3" data-revelar="suave">
      <p className="mapa-rotulo mb-2">
        <Icono nombre="brujula" size={14} />
        Cómo leer el mapa
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-700">
        {ranking && (
          <span className="inline-flex items-center gap-1.5 font-bold text-[#003648]">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <circle cx="9" cy="9" r="7.2" fill="none" stroke={SOL} strokeWidth="2.6" />
              <circle cx="9" cy="9" r="4" fill="#fff" stroke={NOCHE} strokeWidth="1.4" />
            </svg>
            {RANKING.anillo}
          </span>
        )}
        {indice.datos.listas.map((l) => (
          <span key={l.id} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={`h-3 w-3 rounded ${tonoDe(l.id).muestra}`} />
            {etiquetaListaLarga(l)}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded bg-[#E3E9EF] ring-1 ring-neutral-300" />
          {T.fuera}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" fill="#fff" stroke={NOCHE} strokeWidth="1.6" />
          </svg>
          {T.leyendaBurbuja}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="7" fill={NOCHE} stroke="#fff" strokeWidth="1.5" />
            <path d="M8 3.6 9.1 6.5 12.2 6.6 9.8 8.5 10.6 11.5 8 9.8 5.4 11.5 6.2 8.5 3.8 6.6 6.9 6.5Z" fill={SOL} />
          </svg>
          {T.leyendaCaso}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">
            <path d="M1 8 Q13 -2 25 5" fill="none" stroke={SOL} strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
          </svg>
          Ruta desde Lima
        </span>
      </div>
      {/* El mapa se mueve: si no se dice, casi nadie lo prueba. */}
      <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#E1EFFD] pt-2.5 text-[11px] font-semibold text-[#0A5873]">
        <span className="inline-flex items-center gap-1.5">
          <Icono nombre="toque" size={13} className="text-[#F09C48]" />
          Arrastra el mapa para moverlo
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icono nombre="lupa" size={13} className="text-[#F09C48]" />
          Rueda, pellizco o los botones + y − para acercar
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icono nombre="brujula" size={13} className="text-[#F09C48]" />
          La diana vuelve al encuadre
        </span>
      </p>
    </div>
  );
}

function PieFuentes({ fuentes = {} }) {
  const f = (t) => String(t || "").trim().replace(/\.+$/, "");
  return (
    <footer className="mt-14 border-t border-[#E1EFFD] pt-5 text-xs leading-relaxed text-neutral-700" data-revelar="suave">
      <p className="mapa-rotulo mb-2">
        <Icono nombre="documento" size={14} />
        De dónde salen estas cifras
      </p>
      <p>
        <strong className="text-[#003648]">{PIE.matricula}</strong> Fuente: {f(fuentes.matricula)}.
      </p>
      <p className="mt-1">
        Másteres oficiales: {f(fuentes.masteres)}.{fuentes.titularidad ? ` Titularidad: ${f(fuentes.titularidad)}.` : ""}
        {fuentes.ranking ? ` Ranking: ${f(fuentes.ranking)}.` : ""} Paquetes de postulación de Inspira: {f(fuentes.planes)}. {PIE.geografia}
      </p>
      <p className="mt-1">{PAQUETE.leyenda}</p>
      <p className="mt-1">{PIE.admision}</p>
    </footer>
  );
}

function CtaFinal() {
  return (
    <section className="relative overflow-hidden bg-[#003648] px-4 py-16 text-white sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ backgroundImage: "radial-gradient(rgba(150,204,252,0.35) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      />
      <svg aria-hidden="true" className="pointer-events-none absolute -bottom-6 right-0 hidden h-40 w-[520px] md:block" viewBox="0 0 520 160">
        <path d="M10 150 Q260 -40 510 70" fill="none" stroke={SOL} strokeWidth="2.5" strokeDasharray="8 8" strokeLinecap="round" opacity="0.8">
          <animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1.6s" repeatCount="indefinite" />
        </path>
      </svg>
      <div className="relative mx-auto flex max-w-[1180px] flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl" data-revelar="izquierda">
          <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#96CCFC]">
            <Icono nombre="avion" size={14} className="mov-flota text-[#F09C48]" />
            Lima <Icono nombre="flecha" size={12} className="text-[#96CCFC]" />
            <span className="sr-only">a</span> España
          </p>
          <h2 className="mapa-titular mt-2 text-3xl font-bold leading-tight sm:text-4xl">{CTA.titulo}</h2>
          <p className="mt-3 leading-relaxed text-white/80">{CTA.texto}</p>
        </div>
        <div className="flex flex-col gap-4" data-revelar="derecha">
          <div aria-hidden="true" className="hidden gap-2 sm:grid sm:grid-cols-3">
            {["barcelona", "madrid", "valencia"].map((id) => (
              <span key={id} className="mapa-postal overflow-hidden rounded-2xl ring-1 ring-white/25">
                <IlustracionCiudad ciudad={id} />
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registrarEvento("mapa_sesion", {})}
            className="mapa-boton mov-toque inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#F09C48] px-6 py-3.5 font-extrabold text-[#003648] hover:bg-[#F4AD62] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
          >
            <Icono nombre="calendario" size={18} />
            {SESION}
          </a>
          <a
            href={whatsappDesde("mapa", CTA.whatsappDetalle)}
            target="_blank"
            rel="noopener noreferrer"
            className="mapa-boton mov-toque inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-6 py-3.5 font-extrabold text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
          >
            <Icono nombre="chat" size={18} />
            {CTA.whatsapp}
          </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Índice de la página para el teléfono. La página mide más de nueve mil
 * píxeles de alto: sin esto, volver al mapa desde el comparador eran diez
 * pasadas de dedo. Se pega bajo la cabecera y marca en qué bloque estás.
 *
 * Son anclas de toda la vida (#id), así que funcionan aunque el observador no
 * exista; lo único que se pierde entonces es el resaltado.
 */
const SECCIONES = [
  { id: "mapa-zona", icono: "mapa", texto: "Mapa" },
  { id: "mapa-ciudades", icono: "ubicacion", texto: "Ciudades" },
  { id: "mapa-comparador", icono: "balanza", texto: "Comparar" },
  { id: "mapa-listas", icono: "libro", texto: "Listas" },
];

function BarraSecciones({ className = "" }) {
  const [activa, setActiva] = useState(SECCIONES[0].id);

  useEffect(() => {
    const nodos = SECCIONES.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!nodos.length || typeof IntersectionObserver !== "function") return undefined;
    const obs = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target?.id) setActiva(visible.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
    );
    nodos.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  return (
    <nav aria-label="Secciones del mapa" className={`mapa-indice sticky top-[60px] z-30 -mx-4 mb-3 px-4 py-2 lg:hidden ${className}`}>
      <ul className="flex gap-2 overflow-x-auto">
        {SECCIONES.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={() => revelarTodo(document)}
              aria-current={activa === s.id ? "true" : undefined}
              className={`mov-toque inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-extrabold ${
                activa === s.id ? "border-transparent bg-[#003648] text-white" : "border-[#CFE6FD] bg-white/90 text-[#003648]"
              }`}
            >
              <Icono nombre={s.icono} size={13} className={activa === s.id ? "text-[#F09C48]" : "text-[#0A5873]"} />
              {s.texto}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Las ciudades con más másteres oficiales, cada una con su ilustración de
 * marca. Es la puerta de entrada para quien no sabe por dónde empezar: en el
 * teléfono se deslizan como un carrusel y al tocar una se abre en el mapa.
 *
 * Las siluetas son dibujo propio (IlustracionesMapa.jsx), no fotos: la web no
 * tiene fotos con licencia de ninguna ciudad española.
 */
function CiudadesDestacadas({ indice, foco, onElegir }) {
  const paso = cascada(70);
  const ciudades = useMemo(
    () =>
      indice.datos.ciudades
        .filter((c) => c.masteres > 0)
        .slice()
        .sort((a, b) => b.masteres - a.masteres)
        .slice(0, 8),
    [indice]
  );
  if (!ciudades.length) return null;

  return (
    <section id="mapa-ciudades" aria-labelledby="mapa-ciudades-titulo" className="mt-14 scroll-mt-24" data-revelar>
      <p className="mapa-rotulo">
        <Icono nombre="ubicacion" size={14} />
        Dónde se estudia
      </p>
      <h2 id="mapa-ciudades-titulo" className="mapa-titular mt-1 text-[26px] font-bold leading-tight text-[#003648]">
        Las ciudades con más másteres oficiales
      </h2>
      <p className="mt-1 text-sm text-neutral-700">
        Toca una y el mapa vuela hasta ella. Verás sus universidades, cuánto cuesta la matrícula al año y su puesto en el ranking QS.
      </p>
      {/* Lo que más se confunde: la matrícula la cobra la universidad, el
          paquete lo cobra Inspira. Se dice antes de enseñar ninguna cifra. */}
      <p className="mapa-aviso-precio mt-3 flex items-start gap-2.5 text-[13px] leading-snug">
        <span className="mt-0.5 shrink-0 text-[#B8661F]">
          <Icono nombre="euro" size={16} />
        </span>
        <span>
          <strong className="text-[#003648]">Son dos pagos distintos.</strong> La universidad cobra la <strong>matrícula</strong> del máster.
          Inspira cobra por <strong>prepararte y presentar tu postulación</strong>. Ni se suman ni se pagan en el mismo sitio.
        </span>
      </p>

      <div className="mapa-carril mt-5">
        {ciudades.map((c) => {
          const com = indice.comunidades.get(c.comunidad);
          const precio = c.precioAnual || com?.precioAnual;
          // El paquete de la lista a la que pertenece su comunidad.
          const desde = com ? indice.listas.get(com.lista)?.desde : null;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={foco.ciudad === c.id}
              onClick={() => onElegir("ciudad", c.id)}
              className="mapa-ciudad mov-toque"
              data-revelar="escala"
              style={paso()}
            >
              <span className="mapa-ciudad-lienzo block">
                <IlustracionCiudad ciudad={c.id} />
                <span className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
                  <span className="mapa-titular text-base font-bold leading-tight text-white drop-shadow-sm">{c.nombre}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F09C48] px-2 py-0.5 text-[11px] font-extrabold text-[#003648]">
                    <Icono nombre="birrete" size={12} />
                    {c.masteres}
                  </span>
                </span>
              </span>
              <span className="block px-3.5 py-3">
                <span className="block text-[12px] font-semibold text-neutral-700">{com?.nombre || ""}</span>
                <span className="mt-1 block text-[13px] font-bold text-[#003648]">
                  {plural(c.universidades.length, "universidad", "universidades")}
                </span>
                <span className="mt-2 block border-t border-[#E1EFFD] pt-2 text-[12px] leading-snug">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-neutral-700">Matrícula universidad</span>
                    <strong className="shrink-0 text-[#003648]">{precio ? `≈ ${eur(Math.round(precio.tipico))}/año` : "según la universidad"}</strong>
                  </span>
                  <span className="mt-1 flex items-baseline justify-between gap-2">
                    <span className="text-neutral-700">Paquete de Inspira</span>
                    <strong className="shrink-0 text-[#B8661F]">{Number.isFinite(desde) ? `desde ${eur(desde)}` : "a medida"}</strong>
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Bloque de confianza: por qué fiarse de lo que se ve aquí. Va después del
 * mapa, cuando ya se han visto las cifras y toca la pregunta «¿y esto de
 * dónde sale?».
 */
function Confianza() {
  const paso = cascada(80);
  return (
    <section aria-labelledby="mapa-confianza-titulo" className="mt-14 scroll-mt-24" data-revelar>
      <div className="mapa-confianza overflow-hidden rounded-[26px] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
          <div className="min-w-0">
            <p className="mapa-rotulo mapa-rotulo-claro">
              <Icono nombre="escudo" size={14} />
              {CONFIANZA.rotulo}
            </p>
            <h2 id="mapa-confianza-titulo" className="mapa-titular mt-1.5 text-[26px] font-bold leading-tight text-white sm:text-[30px]">
              {CONFIANZA.titulo}
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/80">{CONFIANZA.texto}</p>
          </div>
          <ul className="grid min-w-0 gap-3 self-center">
            {CONFIANZA.puntos.map((p) => (
              <li
                key={p.titulo}
                data-revelar="suave"
                style={paso()}
                className="flex items-start gap-3 rounded-2xl bg-white/[0.07] p-3.5 ring-1 ring-white/10"
              >
                <span className="mt-0.5 shrink-0 text-[#F09C48]">
                  <Icono nombre={p.icono} size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold text-white">{p.titulo}</span>
                  <span className="block text-[13px] leading-snug text-white/70">{p.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** El nombre de algo marcado como interesante, sea del tipo que sea. */
function nombreDe(indice, { tipo, id }) {
  if (tipo === "universidad") return indice.universidades.get(id)?.sigla || null;
  if (tipo === "ciudad") return indice.ciudades.get(id)?.nombre || null;
  return indice.comunidades.get(id)?.nombre || null;
}

/**
 * La lista de interés, en lo que acepta el formulario de envío: o tres
 * universidades o tres comunidades. Una ciudad marcada viaja como su
 * comunidad, que es de lo que hay precio publicado.
 */
function paraGuardar(indice, interes) {
  const unis = interes.filter((x) => x.tipo === "universidad").map((x) => x.id);
  if (unis.length === interes.length && unis.length) return { tipo: "universidad", ids: unis.slice(0, MAX_COMPARAR) };
  const comunidades = interes
    .map((x) =>
      x.tipo === "comunidad" ? x.id : x.tipo === "ciudad" ? indice.ciudades.get(x.id)?.comunidad : indice.universidades.get(x.id)?.comunidad
    )
    .filter(Boolean);
  return { tipo: "comunidad", ids: [...new Set(comunidades)].slice(0, MAX_COMPARAR) };
}

/* ── Explorador ──────────────────────────────────────────────────────── */

function Explorador({ datos, geo }) {
  const indice = useMemo(() => crearIndice(datos), [datos]);
  const casos = useMemo(() => casosEnMapa(indice, CASOS), [indice]);
  const geoPorId = useMemo(() => new Map(geo.comunidades.map((g) => [g.id, g])), [geo]);
  const [estado, actualizar] = useEstadoMapa();
  const [capas, setCapas] = useState({ ciudades: true, casos: true });
  const [aviso, setAviso] = useState("");
  // Formulario «Guárdala y te la enviamos»: { tipo, ids } o null.
  const [guardar, setGuardar] = useState(null);
  // Recomendador: abierto y las comunidades que resalta en el mapa.
  const [recomendador, setRecomendador] = useState({ abierto: false, ids: [] });
  // Comunidad señalada desde la lista en texto: el mapa la contornea sin
  // abrirla, para que se vea de qué sitio se está hablando.
  const [resaltada, setResaltada] = useState(null);
  // En el teléfono, tocar el mapa enseña primero el cuadrito; la ficha entera
  // se abre desde él. Desde fuera del mapa (buscador, lista, ciudades) se abre
  // la ficha directamente, que es lo que se espera al pulsar.
  const [vista, setVista] = useState("hoja");
  const { interes, alternar: alternarInteres, vaciar: vaciarInteres } = useInteres();
  const esEscritorio = useEsEscritorio();
  const mapaRef = useRef(null);
  const zonaRef = useRef(null);

  // Filtros saneados: un enlace viejo o mal copiado no rompe nada.
  const entrada = useMemo(
    () => ({
      listas: estado.listas.filter((l) => indice.listas.has(l)),
      rama: indice.ramas.some((r) => r.id === estado.rama) ? estado.rama : null,
      max: estado.max,
      titularidad: ["publica", "privada"].includes(estado.titularidad) && hayTitularidad(indice) ? estado.titularidad : null,
      ranking: Object.hasOwn(RANKING_TOPES, estado.ranking || "") && hayRanking(indice) ? estado.ranking : null,
      orden: estado.orden === "ranking" && hayRanking(indice) ? "ranking" : "masteres",
      abre: Object.hasOwn(ABRE_MESES, estado.abre || "") && indice.hayPlazos ? estado.abre : null,
      becas: !!estado.becas && indice.hayBecas,
      presupuesto: estado.presupuesto != null && indice.limitesPresupuesto ? estado.presupuesto : null,
    }),
    [
      estado.listas,
      estado.rama,
      estado.max,
      estado.titularidad,
      estado.ranking,
      estado.orden,
      estado.abre,
      estado.becas,
      estado.presupuesto,
      indice,
    ]
  );
  const filtros = useMemo(() => aplicarFiltros(indice, entrada), [indice, entrada]);
  const cambiarOrden = useCallback((orden) => actualizar({ orden: orden === "ranking" ? "ranking" : null }), [actualizar]);

  // Qué está enfocado, del nivel más profundo al más general.
  const foco = useMemo(() => {
    const u = indice.universidades.get(estado.universidad);
    if (u) return { tipo: "universidad", comunidad: u.comunidad, ciudad: u.ciudad, universidad: u.id, caso: null };
    const k = casos.find((x) => x.id === estado.caso);
    if (k) return { tipo: "caso", comunidad: k.comunidadId, ciudad: k.ciudadId, universidad: null, caso: k.id };
    const ci = indice.ciudades.get(estado.ciudad);
    if (ci) return { tipo: "ciudad", comunidad: ci.comunidad, ciudad: ci.id, universidad: null, caso: null };
    if (estado.comunidad && (indice.comunidades.has(estado.comunidad) || geoPorId.has(estado.comunidad))) {
      return { tipo: "comunidad", comunidad: estado.comunidad, ciudad: null, universidad: null, caso: null };
    }
    return { tipo: null, comunidad: null, ciudad: null, universidad: null, caso: null };
  }, [estado.universidad, estado.caso, estado.ciudad, estado.comunidad, indice, casos, geoPorId]);

  const comparar = useMemo(() => {
    const validos = estado.comparar.filter((id) => indice.comunidades.has(id) || indice.universidades.has(id));
    const tipo = validos.length ? (indice.comunidades.has(validos[0]) ? "comunidad" : "universidad") : null;
    const ids = validos
      .filter((id) => (tipo === "comunidad" ? indice.comunidades.has(id) : indice.universidades.has(id)))
      .slice(0, MAX_COMPARAR);
    return { tipo, ids };
  }, [estado.comparar, indice]);

  const elegir = useCallback(
    (tipo, id) => {
      if (!tipo || !id) {
        actualizar({ comunidad: null, ciudad: null, universidad: null, caso: null });
        return;
      }
      if (tipo === "comunidad") {
        actualizar({ comunidad: id, ciudad: null, universidad: null, caso: null });
      } else if (tipo === "ciudad") {
        const c = indice.ciudades.get(id);
        if (!c) return;
        actualizar({ comunidad: c.comunidad, ciudad: id, universidad: null, caso: null });
      } else if (tipo === "universidad") {
        const u = indice.universidades.get(id);
        if (!u) return;
        actualizar({ comunidad: u.comunidad, ciudad: u.ciudad, universidad: id, caso: null });
      } else if (tipo === "caso") {
        const k = casos.find((x) => x.id === id);
        if (!k) return;
        actualizar({ comunidad: k.comunidadId, ciudad: k.ciudadId, universidad: null, caso: id });
      }
      registrarEvento("mapa_foco", { tipo, id });
      if (tipo === "comunidad" || tipo === "universidad") eventoMapa(`ver_${tipo}`, id);
    },
    [actualizar, indice, casos]
  );

  // Desde el propio mapa: primero el cuadrito.
  const elegirEnMapa = useCallback(
    (tipo, id) => {
      setVista(tipo ? "mini" : "hoja");
      elegir(tipo, id);
    },
    [elegir]
  );

  // Desde fuera del mapa (buscador, lista, comparador): elegir y llevar el mapa a la vista.
  const verEnMapa = useCallback(
    (tipo, id) => {
      setVista("hoja");
      elegir(tipo, id);
      requestAnimationFrame(() => {
        const caja = mapaRef.current?.getBoundingClientRect();
        if (caja && (caja.top < 60 || caja.top > window.innerHeight * 0.45)) irSuave(mapaRef.current);
      });
    },
    [elegir]
  );

  const subir = useCallback(() => {
    if (foco.tipo === "universidad" || foco.tipo === "caso") {
      if (foco.ciudad) elegir("ciudad", foco.ciudad);
      else elegir("comunidad", foco.comunidad);
    } else if (foco.tipo === "ciudad") {
      elegir("comunidad", foco.comunidad);
    } else {
      elegir(null);
    }
  }, [foco, elegir]);

  // Escape sube un nivel (universidad → ciudad → comunidad → España).
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key !== "Escape" || !foco.tipo) return;
      const t = e.target;
      if (t instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName)) return;
      subir();
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [foco.tipo, subir]);

  function alternarComparar(tipo, id) {
    if (comparar.ids.includes(id)) {
      actualizar({ comparar: comparar.ids.filter((x) => x !== id) });
      setAviso("");
      return;
    }
    if (comparar.tipo && comparar.tipo !== tipo) {
      actualizar({ comparar: [id] });
      setAviso(tipo === "comunidad" ? T.comparadorAhoraComunidades : T.comparadorAhoraUniversidades);
      return;
    }
    if (comparar.ids.length >= MAX_COMPARAR) return;
    actualizar({ comparar: [...comparar.ids, id] });
    setAviso("");
    registrarEvento("mapa_comparar", { tipo, id });
    eventoMapa("comparar", id);
  }

  // Desde una ficha se guarda la ficha abierta más lo que ya hay en el comparador
  // (si es del mismo tipo), hasta 3: es el tope que acepta POST /api/mapa/comparativa.
  function abrirGuardar(tipo, id) {
    const otros = comparar.tipo === tipo ? comparar.ids.filter((x) => x !== id) : [];
    setGuardar({ tipo, ids: [id, ...otros].slice(0, MAX_COMPARAR) });
  }

  function abrirRecomendador() {
    setRecomendador((r) => ({ ...r, abierto: true }));
    requestAnimationFrame(() => irSuave(document.getElementById("mapa-recomendador")));
  }

  // Los bloques que aparecen después (recomendador, resultados, comparador)
  // también tienen que entrar al asomar: se vuelve a barrer cuando cambian.
  useRevelar(zonaRef, [recomendador.abierto, filtros.activos, comparar.ids.length, foco.tipo, esEscritorio, indice]);

  const comparador = { tipo: comparar.tipo, ids: comparar.ids, maximo: MAX_COMPARAR, alternar: alternarComparar };
  const comunes = {
    indice,
    foco,
    geoPorId,
    rama: filtros.rama,
    orden: entrada.orden,
    onOrden: cambiarOrden,
    casos,
    comparador,
    onElegir: elegir,
    onGuardar: abrirGuardar,
  };

  let ficha = <FichaInicio indice={indice} casos={casos} onElegir={elegir} onRecomendar={abrirRecomendador} />;
  let titulo = "";
  let clave = "inicio";
  if (foco.tipo === "universidad") {
    const u = indice.universidades.get(foco.universidad);
    ficha = <FichaUniversidad u={u} {...comunes} />;
    titulo = `${u.sigla} · ${u.nombre}`;
    clave = `u-${u.id}`;
  } else if (foco.tipo === "caso") {
    const k = casos.find((x) => x.id === foco.caso);
    ficha = <FichaCaso k={k} {...comunes} />;
    titulo = `Caso de éxito · ${k.nombre}`;
    clave = `k-${k.id}`;
  } else if (foco.tipo === "ciudad") {
    const c = indice.ciudades.get(foco.ciudad);
    ficha = <FichaCiudad c={c} {...comunes} />;
    titulo = c.nombre;
    clave = `ci-${c.id}`;
  } else if (foco.tipo === "comunidad") {
    const c = indice.comunidades.get(foco.comunidad);
    ficha = c ? <FichaComunidad c={c} {...comunes} /> : <FichaFuera id={foco.comunidad} planFuera={datos.fueraDeListas.plan} {...comunes} />;
    titulo = c?.nombre || geoPorId.get(foco.comunidad)?.nombre || "";
    clave = `co-${foco.comunidad}`;
  }

  return (
    <div ref={zonaRef} className="flex flex-col">
      {/* En el teléfono el mapa va antes que los filtros: se entra a tocarlo,
          no a configurarlo. En escritorio se mantiene el orden de siempre. */}
      <Cabecera className="order-1" />

      <BarraSecciones className="order-2" />

      <CifrasAccion totales={indice.datos.totales} onRecomendar={abrirRecomendador} className="order-5 lg:order-1" />

      <Pasos className="order-6 lg:order-2" />

      <div className="order-5 lg:order-3">
      <Filtros
        indice={indice}
        entrada={entrada}
        filtros={filtros}
        capas={capas}
        onCapas={setCapas}
        onCambiar={actualizar}
        onBuscar={verEnMapa}
        comparados={comparar.ids.length}
        onVerComparador={() => irSuave(document.getElementById("mapa-comparador"))}
        onVerResultados={() => irSuave(document.getElementById("mapa-resultados"))}
      />
      </div>

      <div className="order-3">
      {recomendador.abierto && (
        <Recomendador
          indice={indice}
          onCerrar={() => setRecomendador({ abierto: false, ids: [] })}
          onResultado={(ids) => {
            setRecomendador({ abierto: true, ids });
            if (ids.length) eventoMapa("recomendar", ids.join(","));
          }}
          onElegir={verEnMapa}
          onGuardar={(tipo, ids) => setGuardar({ tipo, ids })}
          onComparar={(ids) => {
            actualizar({ comparar: ids.slice(0, MAX_COMPARAR) });
            setAviso("");
            requestAnimationFrame(() => irSuave(document.getElementById("mapa-comparador")));
          }}
        />
      )}
      </div>

      <div className="order-4 mt-5 grid items-start gap-6 lg:order-5 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div id="mapa-zona" ref={mapaRef} className="scroll-mt-24" data-revelar="escala">
          <div className="mapa-mar mapa-marco relative overflow-hidden rounded-[28px] border border-[#CFE6FD] p-2 shadow-[0_30px_60px_-44px_rgba(0,54,72,0.55)] sm:p-4">
            <span className="pointer-events-none absolute right-3 top-3 z-[1] hidden items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-[#003648] ring-1 ring-[#CFE6FD] sm:inline-flex">
              <Icono nombre="calendario" size={12} className="text-[#F09C48]" />
              Listas {String(datos.curso || "").replace("-", "/")}
            </span>
            {/* En el teléfono el mapa no se ve como algo que se toca: se dice. */}
            {!esEscritorio && !foco.tipo && (
              <span className="mapa-pista pointer-events-none absolute left-1/2 top-3 z-[1] inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#003648] px-3.5 py-1.5 text-[12px] font-bold text-white shadow-lg">
                <Icono nombre="toque" size={14} className="text-[#F09C48]" />
                Toca una comunidad
              </span>
            )}
            <MapaInteractivo
              geo={geo}
              indice={indice}
              foco={foco}
              filtros={filtros}
              capas={capas}
              casos={casos}
              onElegir={elegirEnMapa}
              onToda={() => elegir(null)}
              recomendadas={recomendador.abierto ? recomendador.ids : []}
              resaltada={resaltada}
            />
            {!esEscritorio && foco.tipo && vista === "mini" && (
              <TarjetaMini
                indice={indice}
                foco={foco}
                marcado={interes.some((x) => x.id === (foco.universidad || foco.ciudad || foco.comunidad))}
                onVerTodo={() => setVista("hoja")}
                onInteres={(tipo, id) => {
                  alternarInteres(tipo, id);
                  registrarEvento("mapa_interes", { tipo, id });
                }}
                onCerrar={() => elegir(null)}
              />
            )}
          </div>
          <Leyenda indice={indice} ranking={filtros.ranking} />
          <CompartirMapa geo={geo} indice={indice} foco={foco} />

          {interes.length > 0 && (
            <div className="mapa-tarjeta mt-3 flex flex-wrap items-center gap-3 p-4">
              <p className="min-w-0 flex-1 text-sm text-neutral-700">
                <strong className="text-[#003648]">
                  {interes.length === 1 ? "Has marcado 1 sitio" : `Has marcado ${interes.length} sitios`}
                </strong>{" "}
                · {interes.map((x) => nombreDe(indice, x)).filter(Boolean).join(", ")}
              </p>
              <button
                type="button"
                onClick={() => setGuardar(paraGuardar(indice, interes))}
                className="mapa-boton mov-toque inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#F09C48] px-4 py-2 text-xs font-extrabold text-[#003648] hover:bg-[#F4AD62] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003648]"
              >
                <Icono nombre="whatsapp" size={15} />
                Envíamelos
              </button>
              <button
                type="button"
                onClick={vaciarInteres}
                className="mov-toque inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-xs font-bold text-[#0A5873] underline underline-offset-2"
              >
                <Icono nombre="huella" size={13} />
                Vaciar
              </button>
            </div>
          )}
        </div>

        <HojaDetalle esEscritorio={esEscritorio} abierta={!!foco.tipo && (esEscritorio || vista === "hoja")} clave={clave} titulo={titulo} onCerrar={() => elegir(null)}>
          <div key={clave} className="mapa-ficha-entra">
            {ficha}
          </div>
        </HojaDetalle>
      </div>

      {!esEscritorio && !foco.tipo && (
        <div className="mapa-tarjeta order-7 mt-6 p-5" data-revelar>
          <FichaInicio indice={indice} casos={casos} onElegir={verEnMapa} onRecomendar={abrirRecomendador} />
        </div>
      )}

      <div className="order-8">
        <Confianza />
        <CiudadesDestacadas indice={indice} foco={foco} onElegir={verEnMapa} />
      </div>

      <div className="order-9">
        <ResultadosUniversidades indice={indice} filtros={filtros} orden={entrada.orden} onOrden={cambiarOrden} onElegir={verEnMapa} />
      </div>

      <div className="order-10">
      <Comparador
        indice={indice}
        comparar={comparar}
        aviso={aviso}
        ejemplo={EJEMPLO_COMPARAR}
        onQuitar={(id) => actualizar({ comparar: comparar.ids.filter((x) => x !== id) })}
        onVaciar={() => {
          actualizar({ comparar: [] });
          setAviso("");
        }}
        onVer={verEnMapa}
        onGuardar={() => setGuardar({ tipo: comparar.tipo, ids: comparar.ids })}
        onProbar={() => {
          actualizar({ comparar: EJEMPLO_COMPARAR.filter((id) => indice.comunidades.has(id)) });
          setAviso("");
        }}
      />

      </div>

      <div className="order-11">
      <ListaComunidades
        indice={indice}
        geoPorId={geoPorId}
        filtros={filtros}
        foco={foco}
        orden={entrada.orden}
        onElegir={verEnMapa}
        onResaltar={setResaltada}
        onEnviar={(ids) => setGuardar({ tipo: "comunidad", ids })}
      />

      </div>

      <div className="order-12">
      <PieFuentes fuentes={datos.fuentes} />

      </div>

      <GuardarComparativa seleccion={guardar} indice={indice} filtros={entrada} onCerrar={() => setGuardar(null)} />

      {/* En móvil la hoja tapa la mitad inferior: hueco para poder leer el final. */}
      {!esEscritorio && foco.tipo && <div aria-hidden="true" className="order-last h-[50vh]" />}
    </div>
  );
}

/* ── Página ──────────────────────────────────────────────────────────── */

export default function MapaEspana() {
  useSEO(SEO);
  const [carga, setCarga] = useState({ estado: "cargando" });
  const [intento, setIntento] = useState(0);
  const pagina = useRef(null);
  // Barrido de toda la página: cubre el cierre y lo que quede fuera del
  // explorador. Al cambiar de estado (cargando → listo) hay bloques nuevos.
  useRevelar(pagina, [carga.estado]);

  useEffect(() => {
    let vivo = true;
    Promise.all([pedirMapa(), cargarGeografia()])
      .then(([datos, geo]) => {
        if (vivo) setCarga({ estado: "listo", datos, geo });
      })
      .catch((error) => {
        console.error("[mapa] no se pudo cargar:", error);
        if (vivo) setCarga({ estado: "error" });
      });
    return () => {
      vivo = false;
    };
  }, [intento]);

  return (
    <main ref={pagina} className="mapa-premium w-full bg-white">
      <PageHero
        etiqueta={HERO.etiqueta}
        icono={HERO.icono}
        titulo={HERO.titulo}
        destacado={HERO.destacado}
        descripcion={HERO.descripcion}
        accesos={HERO.accesos}
      >
        <AccionesHero />
      </PageHero>
      <section id="mapa-explorador" aria-label="Explorador del mapa" className="px-4 pb-16 pt-10 sm:px-6 sm:pt-12">
        <div className="mx-auto max-w-[1180px]">
          {carga.estado === "cargando" && <Esqueleto />}
          {carga.estado === "error" && (
            <ErrorCarga
              onReintentar={() => {
                setCarga({ estado: "cargando" });
                setIntento((n) => n + 1);
              }}
            />
          )}
          {carga.estado === "listo" && (
            <CercoErrores donde="mapa-estudiar-en-espana" titulo="El mapa no se pudo mostrar">
              <Explorador datos={carga.datos} geo={carga.geo} />
            </CercoErrores>
          )}
        </div>
      </section>
      <CtaFinal />
    </main>
  );
}
