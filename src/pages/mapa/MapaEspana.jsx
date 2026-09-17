// src/pages/mapa/MapaEspana.jsx
// «Mapa para estudiar en España» (/mapa-estudiar-en-espana): web pública.
//
// Datos: GET /api/mapa (inspira-backend/src/modules/mapa). Geografía:
// pages/landing/master2027/mapaEspana.data.js por import dinámico, en paralelo
// con la petición, para que ni la página ni el mapa pesen en el paquete de la
// portada. Si la API no responde, estado de error con reintento.
//
// Identidad propia con el kit de marca (Noche, Cielo, Sol y Quicksand en los
// titulares): relieve por capas, ruta con avión desde Lima, cifras que suben y
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
import { cascada, useRevelar } from "../../lib/revelar";
import { ABRE_MESES, RANKING_TOPES, aplicarFiltros, casosEnMapa, crearIndice, hayRanking, hayTitularidad, prefiereMenosMovimiento } from "./indice";
import { useEstadoMapa } from "./useEstadoMapa";
import { useEsEscritorio } from "./useEsEscritorio";
import { CTA, HERO, PAQUETE, PIE, RANKING, RECOMENDAR, SEO, SESION, T, etiquetaLista } from "./mapaTextos";
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
import "../../styles/movimiento.css";
import "./mapa.css";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const MAX_COMPARAR = 3;
const EJEMPLO_COMPARAR = ["andalucia", "madrid", "cataluna"];
// Quicksand solo la necesita esta página: se pide al entrar, no en index.html.
const FUENTE_TITULARES = "https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap";

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

function useFuenteTitulares() {
  useEffect(() => {
    if (document.querySelector('link[data-fuente="quicksand"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FUENTE_TITULARES;
    link.dataset.fuente = "quicksand";
    document.head.appendChild(link);
  }, []);
}

const irSuave = (el) => el?.scrollIntoView({ behavior: prefiereMenosMovimiento() ? "auto" : "smooth", block: "start" });

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

function Pasos() {
  const paso = cascada(80);
  return (
    <ol className="mt-4 grid gap-2 sm:grid-cols-3">
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

function Cabecera({ totales, onRecomendar }) {
  return (
    <div className="mb-5" data-revelar>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="mapa-rotulo">
            <Icono nombre="mapa" size={14} />
            Explora · listas 2027/2028
          </p>
          <h2 className="mapa-titular mt-1.5 text-[28px] font-bold leading-tight text-[#003648] sm:text-[34px]">
            ¿Cuánto cuesta un máster aquí? Tócalo en el mapa
          </h2>
          <p className="mt-1.5 text-sm text-neutral-700">Matrícula de un máster al año en cada comunidad, ciudad y universidad, con su ranking QS.</p>
          <button
            type="button"
            onClick={onRecomendar}
            className="mapa-boton mov-toque mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#F09C48] px-5 py-2.5 text-sm font-extrabold text-[#003648] hover:bg-[#F4AD62] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003648]"
          >
            <Icono nombre="brujula" size={17} />
            {RECOMENDAR.boton}
          </button>
        </div>
        <dl className="flex flex-wrap gap-2" data-revelar="escala">
          {[
            { n: totales.masteres, t: "másteres oficiales", icono: "birrete" },
            { n: totales.universidades, t: "universidades", icono: "casa" },
            { n: totales.comunidades, t: "comunidades", icono: "mapa" },
          ].map((d) => (
            <div key={d.t} className="mapa-cifra rounded-2xl bg-[#003648] px-4 py-2.5 text-white">
              <dd className="mapa-titular flex items-center gap-2 text-xl font-bold leading-none">
                <span className="text-[#F09C48]">
                  <Icono nombre={d.icono} size={19} />
                </span>
                <Cifra n={d.n} />
              </dd>
              <dt className="mt-1.5 text-[12px] font-semibold text-[#96CCFC]">{d.t}</dt>
            </div>
          ))}
        </dl>
      </div>
      <Pasos />
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
            {etiquetaLista(l)}
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
        <path d="M10 150 Q260 -40 510 70" fill="none" stroke={SOL} strokeWidth="2.5" strokeDasharray="8 8" strokeLinecap="round" opacity="0.8" />
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
        <div className="flex flex-col gap-3 sm:flex-row" data-revelar="derecha">
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
    </section>
  );
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

  // Desde fuera del mapa (buscador, lista, comparador): elegir y llevar el mapa a la vista.
  const verEnMapa = useCallback(
    (tipo, id) => {
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
  useRevelar(zonaRef, [recomendador.abierto, filtros.activos, comparar.ids.length, foco.tipo, esEscritorio]);

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
    <div ref={zonaRef}>
      <Cabecera totales={indice.datos.totales} onRecomendar={abrirRecomendador} />

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

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div ref={mapaRef} className="scroll-mt-24" data-revelar="escala">
          <div className="mapa-mar mapa-marco relative overflow-hidden rounded-[28px] border border-[#CFE6FD] p-2 shadow-[0_30px_60px_-44px_rgba(0,54,72,0.55)] sm:p-4">
            <span className="pointer-events-none absolute right-3 top-3 z-[1] hidden items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-[#003648] ring-1 ring-[#CFE6FD] sm:inline-flex">
              <Icono nombre="calendario" size={12} className="text-[#F09C48]" />
              Listas {String(datos.curso || "").replace("-", "/")}
            </span>
            {/* En el teléfono el mapa no se ve como algo que se toca: se dice. */}
            {!esEscritorio && !foco.tipo && (
              <span className="mapa-pista pointer-events-none absolute bottom-4 left-1/2 z-[1] inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#003648] px-3.5 py-1.5 text-[12px] font-bold text-white shadow-lg">
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
              onElegir={elegir}
              onToda={() => elegir(null)}
              recomendadas={recomendador.abierto ? recomendador.ids : []}
            />
          </div>
          <Leyenda indice={indice} ranking={filtros.ranking} />
        </div>

        <HojaDetalle esEscritorio={esEscritorio} abierta={!!foco.tipo} clave={clave} titulo={titulo} onCerrar={() => elegir(null)}>
          <div key={clave} className="mapa-ficha-entra">
            {ficha}
          </div>
        </HojaDetalle>
      </div>

      {!esEscritorio && !foco.tipo && (
        <div className="mapa-tarjeta mt-6 p-5" data-revelar>
          <FichaInicio indice={indice} casos={casos} onElegir={verEnMapa} onRecomendar={abrirRecomendador} />
        </div>
      )}

      <ResultadosUniversidades indice={indice} filtros={filtros} orden={entrada.orden} onOrden={cambiarOrden} onElegir={verEnMapa} />

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

      <ListaComunidades indice={indice} geoPorId={geoPorId} filtros={filtros} foco={foco} orden={entrada.orden} onElegir={verEnMapa} />

      <PieFuentes fuentes={datos.fuentes} />

      <GuardarComparativa seleccion={guardar} indice={indice} filtros={entrada} onCerrar={() => setGuardar(null)} />

      {/* En móvil la hoja tapa la mitad inferior: hueco para poder leer el final. */}
      {!esEscritorio && foco.tipo && <div aria-hidden="true" className="h-[50vh]" />}
    </div>
  );
}

/* ── Página ──────────────────────────────────────────────────────────── */

export default function MapaEspana() {
  useSEO(SEO);
  useFuenteTitulares();
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
