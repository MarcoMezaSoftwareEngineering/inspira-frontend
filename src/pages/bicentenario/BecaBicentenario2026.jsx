// src/pages/bicentenario/BecaBicentenario2026.jsx
//
// BECA GENERACIÓN DEL BICENTENARIO 2026 — página pública sin enlace en menús.
// Nuevas bases (RDE N.º 149-2026-MINEDU/VMGI-PRONABEC) en claro, comparación
// con la Convocatoria 2025, simulador de requisitos y puntaje, otros caminos
// (otras becas y máster económico) y asesoría de becas para España y la UE.
//
// Datos: config/bicentenario2026.js (cada dato con su artículo). Aquí solo se
// pintan. Nada de garantías: la beca la otorga PRONABEC.
import PageHero from "../../components/layout/PageHero";
import Icono from "../../components/common/Icono";
import CercoErrores from "../../components/common/CercoErrores";
import { useSEO } from "../../hooks/useSEO";
import { ASESORIA, whatsappDesde } from "../../config/contacto";
import {
  BECAS_LOGRADAS,
  BENEFICIOS,
  CIFRAS,
  COMPARACION_2025,
  COMPARACION_ACTUAL,
  CRONOGRAMA,
  FAQ,
  FUENTE,
  IMPEDIMENTOS,
  LO_NUEVO,
  PIE_LEGAL,
  REQUISITOS,
  RUTA,
  comparacionLista,
  numeroPe,
} from "../../config/bicentenario2026";
import SimuladorBicentenario from "./SimuladorBicentenario";
import {
  Alerta,
  Articulo,
  BloqueDescubre,
  BotonCalendly,
  Check,
  CuentaAtras,
  Cruz,
  DescubreCompacto,
  Seccion,
  Titulo,
  irA,
  useConteo,
  useVisible,
} from "./piezas";

export const SEO = {
  title: "Beca Generación del Bicentenario 2026: nuevas bases y simulador",
  description:
    "Solo 20 becas. Las nuevas bases de PRONABEC explicadas en claro, un simulador para saber si calificas y cuánto puntaje tendrías, la comparación con 2025 y otras becas para España y la Unión Europea.",
  path: RUTA,
  imagen: "/og/beca-generacion-bicentenario-2026.jpg",
};

const HAY_COMPARACION = comparacionLista(COMPARACION_2025);
const ANT = COMPARACION_2025.anterior;

// ── 1. Hero ─────────────────────────────────────────────────────────────────
function Hero() {
  const desde = HAY_COMPARACION ? ANT.becasTotal : 0;
  const n = useConteo(desde, CIFRAS.total, 1800);
  return (
    <PageHero
      etiqueta="PRONABEC · Convocatoria 2026"
      icono="birrete"
      titulo="Generación del Bicentenario 2026:"
      destacado="nuevas bases"
      descripcion="Te asesoramos para postular a la beca con universidades top 400 de España y de la Unión Europea."
    >
      <div className="w-full">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-3xl bg-white/[0.07] p-5 ring-1 ring-white/15 backdrop-blur sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
              {HAY_COMPARACION ? "Se reducen significativamente las plazas" : "Muy pocas plazas"}
            </p>
            <div className="mt-1 flex items-end gap-3">
              <span className="font-fraunces text-[5.5rem] font-black leading-none tabular-nums text-sun sm:text-[7rem]">
                {Math.round(n)}
              </span>
              <span className="pb-3 text-xl font-bold leading-tight text-white sm:text-2xl">
                becas
                <br />
                en total
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/12 px-3 py-1 text-sm font-bold text-white ring-1 ring-white/20">{CIFRAS.maestria} maestría</span>
              <span className="rounded-full bg-white/12 px-3 py-1 text-sm font-bold text-white ring-1 ring-white/20">{CIFRAS.doctorado} doctorado</span>
              {HAY_COMPARACION && (
                <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-bold text-white ring-1 ring-accent/50">En 2025 fueron {ANT.becasTotal}</span>
              )}
            </div>
          </div>
          <div className="rounded-3xl bg-white/[0.07] p-5 ring-1 ring-white/15 backdrop-blur sm:p-6">
            <CuentaAtras />
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <p className="rounded-xl bg-white/5 px-3 py-2 text-white/70">Abre<b className="block text-white">30/10/2026</b></p>
              <p className="rounded-xl bg-white/5 px-3 py-2 text-white/70">Cierra<b className="block text-white">13/11/2026 · 23:59</b></p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href="#simulador"
            onClick={(e) => irA(e, "#simulador")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-lg font-extrabold text-white shadow-lg shadow-accent/30 transition hover:scale-[1.02] hover:bg-accent-dark"
          >
            ¿Calificas? Descúbrelo en 2 minutos →
          </a>
          <a
            href="#bases"
            onClick={(e) => irA(e, "#bases")}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold text-white ring-1 ring-white/30 transition hover:bg-white/10"
          >
            Ver las bases en claro
          </a>
        </div>
      </div>
    </PageHero>
  );
}

// ── 2. Las nuevas bases en 60 segundos ──────────────────────────────────────
function LoNuevo() {
  return (
    <Seccion id="en-60-segundos">
      <Titulo eyebrow="En 60 segundos" titulo="Las nuevas bases, en seis claves" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LO_NUEVO.map((c, i) => (
          <div key={c.titulo} className={`group relative overflow-hidden rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-xl sm:p-6 ${i === 0 ? "border-transparent bg-primary text-white" : "border-neutral-200 bg-white"}`}>
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${i === 0 ? "bg-sun text-primary" : "bg-secondary text-primary group-hover:bg-accent group-hover:text-white"} transition`}>
              <Icono nombre={c.icono} size={24} />
            </span>
            <p className={`mt-4 font-fraunces text-xl font-bold leading-snug ${i === 0 ? "text-white" : "text-primary"}`}>{c.titulo}</p>
            <p className={`mt-1.5 text-sm leading-relaxed ${i === 0 ? "text-white/75" : "text-neutral-700"}`}>{c.texto}</p>
            <p className="mt-3"><Articulo>{c.art}</Articulo></p>
          </div>
        ))}
      </div>
    </Seccion>
  );
}

// ── 3. 2025 vs 2026 ─────────────────────────────────────────────────────────
const TIPO = {
  mas: { txt: "Cambia", clase: "bg-accent/15 text-accent-dark" },
  nuevo: { txt: "Nuevo", clase: "bg-sky/30 text-primary" },
  menos: { txt: "Se quita", clase: "bg-neutral-200 text-neutral-700" },
  igual: { txt: "Igual", clase: "bg-green-100 text-green-800" },
};

function Barras() {
  const [ref, visible] = useVisible();
  const filas = [
    { t: "Total", a: ANT.becasTotal, b: COMPARACION_ACTUAL.becasTotal },
    { t: "Maestría", a: ANT.maestria, b: COMPARACION_ACTUAL.maestria },
    { t: "Doctorado", a: ANT.doctorado, b: COMPARACION_ACTUAL.doctorado },
  ];
  const max = Math.max(...filas.map((f) => f.a));
  return (
    <div ref={ref} className="rounded-3xl bg-primary p-5 text-white sm:p-7">
      <p className="font-fraunces text-xl font-bold">Número de becas</p>
      <div className="mt-2 flex gap-4 text-xs font-bold">
        <span className="flex items-center gap-1.5 text-white/60"><span className="h-2.5 w-2.5 rounded-sm bg-white/35" /> 2025</span>
        <span className="flex items-center gap-1.5 text-white"><span className="h-2.5 w-2.5 rounded-sm bg-sun" /> 2026</span>
      </div>
      <div className="mt-5 space-y-5">
        {filas.map((f) => (
          <div key={f.t}>
            <p className="text-sm font-bold text-white/80">{f.t}</p>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-white/35 transition-[width] duration-1000 ease-out" style={{ width: visible ? `${(f.a / max) * 100}%` : "0%" }} />
              </div>
              <span className="w-10 text-right font-black tabular-nums text-white/70">{f.a}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-white/5">
                <div className="h-full min-w-[6px] rounded-full bg-sun transition-[width] delay-300 duration-1000 ease-out" style={{ width: visible ? `${(f.b / max) * 100}%` : "0%" }} />
              </div>
              <span className="w-10 text-right font-black tabular-nums text-sun">{f.b}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-white/70">
        <b className="text-white">−{Math.round((1 - COMPARACION_ACTUAL.becasTotal / ANT.becasTotal) * 100)} %</b> de becas frente a la Convocatoria 2025.
      </p>
    </div>
  );
}

function FilaCambio({ c }) {
  const t = TIPO[c.tipo] || TIPO.mas;
  return (
    <li className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center sm:gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold leading-snug text-primary">{c.tema}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-black uppercase tracking-wide ${t.clase}`}>{t.txt}</span>
      </div>
      <p className="text-sm leading-snug text-neutral-500"><span className="mr-1 text-[10px] font-black uppercase text-neutral-400">2025</span>{c.tipo === "igual" ? c.antes : <s className="decoration-neutral-300">{c.antes}</s>}</p>
      <p className="text-sm font-semibold leading-snug text-primary"><span className="mr-1 text-[10px] font-black uppercase text-accent">2026</span>{c.ahora}</p>
    </li>
  );
}

function Comparacion() {
  if (!HAY_COMPARACION) return null;
  const C = COMPARACION_2025;
  const millones = (n) => `S/ ${(n / 1e6).toFixed(2).replace(".", ",")} M`;
  const datos = [
    { icono: "euro", t: "Presupuesto", a: millones(ANT.presupuesto), b: millones(COMPARACION_ACTUAL.presupuesto), nota: "2026: con cargo al año fiscal 2027" },
    { icono: "calendario", t: "Postulación", a: `${ANT.semanas} semanas`, b: `${COMPARACION_ACTUAL.semanas} semanas`, nota: COMPARACION_ACTUAL.postulacion },
    { icono: "usuarios", t: "Competencia", a: `${numeroPe(ANT.postulantes)} por ${ANT.seleccionados}`, b: `${CIFRAS.total} becas`, nota: "Postulantes con registro completo en 2025" },
  ];
  return (
    <Seccion id="antes-y-ahora" fondo="bg-secondary-light">
      <Titulo
        eyebrow="Antes y ahora"
        titulo="Convocatoria 2025 frente a 2026"
        texto={`En 2025 hubo ${ANT.becasTotal} becas y postularon ${numeroPe(ANT.postulantes)} personas con registro completo. En 2026 hay ${CIFRAS.total}.`}
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Barras />
        <div className="grid gap-3">
          {datos.map((d) => (
            <div key={d.t} className="flex items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-4 sm:p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary"><Icono nombre={d.icono} size={22} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{d.t}</p>
                <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                  <s className="text-base font-bold text-neutral-400 decoration-neutral-300">{d.a}</s>
                  <span className="text-neutral-300">→</span>
                  <span className="font-fraunces text-2xl font-black text-primary">{d.b}</span>
                </p>
                <p className="text-xs text-neutral-500">{d.nota}</p>
              </div>
            </div>
          ))}
          <div className="rounded-3xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700 sm:p-5">
            <p className="font-bold text-primary">Ranking exigido: igual</p>
            <p className="mt-0.5">{COMPARACION_ACTUAL.ranking}.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
          <p className="font-fraunces text-xl font-bold text-primary">Requisitos y beneficios</p>
          <ul className="mt-2 divide-y divide-neutral-100">{C.cambiosRequisitos.map((c) => <FilaCambio key={c.tema} c={c} />)}</ul>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
          <p className="font-fraunces text-xl font-bold text-primary">Puntaje de maestría</p>
          <ul className="mt-2 divide-y divide-neutral-100">{C.cambiosPuntaje.map((c) => <FilaCambio key={c.tema} c={c} />)}</ul>
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-neutral-500">
        {C.contexto}{" "}
        Fuentes oficiales:{" "}
        <a className="underline" href={ANT.fuente} target="_blank" rel="noopener noreferrer">bases 2025 ({ANT.norma})</a> ·{" "}
        <a className="underline" href={ANT.fuenteResultados} target="_blank" rel="noopener noreferrer">resultados 2025 (RJ N.º 1685-2025)</a> ·{" "}
        <a className="underline" href={C.fuenteContexto} target="_blank" rel="noopener noreferrer">El Peruano, 28/04/2026</a> · bases 2026 ({FUENTE.norma}).
      </p>
    </Seccion>
  );
}

// ── 4. Bases amigables ──────────────────────────────────────────────────────
function Cronograma() {
  const hoy = new Date().toISOString().slice(0, 10);
  const proxima = CRONOGRAMA.findIndex((f) => f.fin >= hoy);
  return (
    <ol className="relative grid gap-0 lg:grid-cols-7 lg:gap-3">
      {CRONOGRAMA.map((f, i) => {
        const estado = f.fin < hoy ? "pasada" : f.inicio <= hoy ? "actual" : i === proxima ? "proxima" : "futura";
        const punto = estado === "pasada" ? "bg-neutral-300" : estado === "actual" ? "bg-green-600 ring-4 ring-green-600/20" : f.destacado ? "bg-accent" : estado === "proxima" ? "bg-accent ring-4 ring-accent/20" : "bg-sky";
        return (
          <li key={f.id} className="relative flex gap-4 pb-6 lg:block lg:pb-0">
            {i < CRONOGRAMA.length - 1 && <span className="absolute left-[9px] top-5 h-full w-0.5 bg-sky/50 lg:left-5 lg:top-[9px] lg:h-0.5 lg:w-full" aria-hidden />}
            <span className={`relative z-10 mt-0.5 h-5 w-5 shrink-0 rounded-full border-4 border-white ${punto}`} />
            <div className="lg:mt-4">
              {(estado === "proxima" || estado === "actual") && (
                <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white ${estado === "actual" ? "bg-green-600" : "bg-accent"}`}>{estado === "actual" ? "En curso" : "Lo próximo"}</span>
              )}
              <p className={`font-bold leading-snug ${f.destacado ? "text-accent-dark" : "text-primary"}`}>{f.fase}</p>
              <p className="text-sm font-semibold text-neutral-600">{f.texto}</p>
              {f.nota && <p className="text-xs text-neutral-500">{f.nota}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function BasesAmigables() {
  return (
    <Seccion id="bases">
      <Titulo eyebrow="Bases amigables" titulo="Lo que te piden, en una línea" texto="Toca «ver detalle» para leer lo que dice cada artículo." />

      <div className="grid gap-3 md:grid-cols-2">
        {REQUISITOS.map((r) => (
          <details key={r.id} className="group rounded-2xl border border-neutral-200 bg-white p-4 open:border-sky open:bg-secondary-light">
            <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Icono nombre={r.icono} size={20} /></span>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white"><Check size={11} /></span>
              <span className="min-w-0 flex-1 font-bold leading-snug text-primary">{r.corto}</span>
              <span className="shrink-0 text-xs font-bold text-sky-dark group-open:hidden">Ver detalle</span>
              <span className="hidden shrink-0 text-xs font-bold text-neutral-500 group-open:inline">Cerrar</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">{r.detalle}</p>
            <p className="mt-2"><Articulo>{r.art}</Articulo></p>
          </details>
        ))}
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border-2 border-green-600/30 bg-green-50/60 p-5 sm:p-6">
          <p className="font-fraunces text-2xl font-bold text-primary">Qué cubre la beca</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {BENEFICIOS.incluye.map((b) => (
              <li key={b} className="flex gap-2 text-sm font-semibold leading-snug text-neutral-800">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white"><Check size={11} /></span>{b}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-neutral-600">{BENEFICIOS.notaIncluye}</p>
        </div>
        <div className="rounded-3xl border-2 border-neutral-200 bg-neutral-50 p-5 sm:p-6">
          <p className="font-fraunces text-2xl font-bold text-primary">Qué no cubre</p>
          <ul className="mt-4 grid gap-2">
            {BENEFICIOS.noIncluye.map((b) => (
              <li key={b} className="flex gap-2 text-sm font-semibold leading-snug text-neutral-800">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-400 text-white"><Cruz size={10} /></span>{b}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 rounded-xl bg-accent/10 p-3 text-sm font-semibold text-primary"><span className="text-accent"><Alerta /></span>{BENEFICIOS.notaNoIncluye}</p>
          <p className="mt-3"><Articulo>{BENEFICIOS.art}</Articulo></p>
        </div>
      </div>

      <div className="mt-12">
        <p className="font-fraunces text-2xl font-bold text-primary">No puedes postular si…</p>
        <ul className="mt-4 grid gap-2.5 md:grid-cols-2">
          {IMPEDIMENTOS.map((i) => (
            <li key={i.art} className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-3.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-dark"><Cruz size={12} /></span>
              <span className="text-sm leading-snug text-neutral-800">{i.texto} <Articulo>art. {i.art}</Articulo></span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 rounded-3xl bg-secondary-light p-5 sm:p-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-fraunces text-2xl font-bold text-primary">Cronograma</p>
          <Articulo>art. 9.3</Articulo>
        </div>
        <Cronograma />
      </div>
    </Seccion>
  );
}

// ── 5. Simulador ────────────────────────────────────────────────────────────
function Simulador() {
  return (
    <Seccion id="simulador" fondo="bg-secondary-light">
      <Titulo
        centro
        eyebrow="Simulador gratis · 2 minutos"
        titulo="¿Calificas y cuánto puntaje tendrías?"
        texto="Responde con lo que tienes hoy. Se calcula en tu navegador: no guardamos nada."
      />
      <CercoErrores donde="bicentenario-simulador" titulo="El simulador no se pudo mostrar">
        <SimuladorBicentenario />
      </CercoErrores>
    </Seccion>
  );
}

// ── 8. Paquetes, becas logradas y CTA ───────────────────────────────────────
function AsesoriaBecas() {
  return (
    <Seccion id="asesoria-becas">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <div>
          <Titulo
            eyebrow="Plan A y plan B"
            titulo="Todos nuestros paquetes incluyen asesoría de becas y un plan B con maestrías económicas"
            texto="Mapeamos las becas que encajan con tu perfil y hacemos su seguimiento contigo. Y si la beca no llega, ya tienes másteres oficiales asequibles en tu plan."
          />
          <p className="text-xs font-black uppercase tracking-wider text-neutral-500">Becas logradas por asesorados en nuestra asesoría</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BECAS_LOGRADAS.map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 rounded-full bg-sun/30 px-3.5 py-2 text-sm font-bold text-primary">
                <Check size={13} /> {b}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-neutral-500">Registros internos de expedientes. Cada beca la decide la entidad que la convoca; Inspira no garantiza la admisión ni la beca.</p>
          <div className="mt-8"><DescubreCompacto /></div>
        </div>

        <div className="rounded-3xl bg-primary p-6 text-white shadow-2xl shadow-primary/20 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white"><Icono nombre="birrete" size={24} /></span>
          <p className="mt-4 font-fraunces text-3xl font-bold leading-tight">Asesoría de becas para España y la Unión Europea</p>
          <p className="mt-3 leading-relaxed text-white/75">
            En la sesión diagnóstico ({ASESORIA.duracion}, online) revisamos tu perfil, si te conviene la Generación del Bicentenario, qué otras becas encajan contigo y tu plan B de másteres.
          </p>
          <p className="mt-5 font-fraunces text-2xl font-black text-sun">{ASESORIA.precioEur} · {ASESORIA.precioUsd} · {ASESORIA.precioPen}</p>
          <div className="mt-5 flex flex-col gap-3">
            <BotonCalendly className="w-full">Reservar sesión diagnóstico</BotonCalendly>
            <a
              href={whatsappDesde("bicentenario-2026", "Quiero asesoría de becas para postular a la Generación del Bicentenario 2026 u otras becas.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-extrabold text-white ring-2 ring-white/40 transition hover:bg-white/10"
            >
              <Icono nombre="chat" size={18} /> Escribir por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </Seccion>
  );
}

// ── 9. FAQ y pie legal ──────────────────────────────────────────────────────
function Preguntas() {
  return (
    <Seccion id="preguntas" fondo="bg-secondary-light">
      <Titulo eyebrow="Preguntas frecuentes" titulo="Lo que más nos preguntan" />
      <div className="grid gap-3 md:grid-cols-2">
        {FAQ.map((f) => (
          <details key={f.q} className="group rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 font-bold leading-snug text-primary [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="mt-0.5 shrink-0 text-accent transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">{f.a}</p>
            {f.art && <p className="mt-2"><Articulo>{f.art}</Articulo></p>}
          </details>
        ))}
      </div>
      <p className="mt-10 rounded-2xl border border-neutral-200 bg-white p-5 text-xs leading-relaxed text-neutral-600">
        {PIE_LEGAL}{" "}
        <a href={FUENTE.url} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline">gob.pe/pronabec</a>
      </p>
    </Seccion>
  );
}

export default function BecaBicentenario2026() {
  useSEO(SEO);
  return (
    <main className="w-full overflow-x-hidden bg-white">
      <Hero />
      <LoNuevo />
      <Comparacion />
      <BasesAmigables />
      <Simulador />
      <BloqueDescubre />
      <AsesoriaBecas />
      <Preguntas />
    </main>
  );
}
