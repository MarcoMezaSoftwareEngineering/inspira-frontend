// src/pages/bicentenario/BecaBicentenario2026.jsx
//
// BECA GENERACIÓN DEL BICENTENARIO 2026 — página pública sin enlace en menús.
// Nuevas bases (RDE N.º 149-2026-MINEDU/VMGI-PRONABEC) en claro, comparación
// con la Convocatoria 2025, simulador de requisitos y puntaje, otros caminos
// (otras becas y máster económico) y asesoría de becas para España y la UE.
//
// Rediseño del 17/09/2026 (la clienta: «de la beca puedes hacerlo mejor» y
// «con iconos»): fuera los emojis, iconos propios de trazo en su medallón
// (iconos.jsx), estado de la convocatoria a la vista en el hero, entradas al
// asomar de lib/revelar.js y los gestos comunes de styles/movimiento.css.
//
// Datos: config/bicentenario2026.js (cada dato con su artículo) y los rótulos
// en textos.js. Aquí solo se pintan. Nada de garantías: la beca la da PRONABEC.
import { useEffect, useRef, useState } from "react";
import PageHero from "../../components/layout/PageHero";
import CercoErrores from "../../components/common/CercoErrores";
import { useSEO } from "../../hooks/useSEO";
import { cascada, useRevelar } from "../../lib/revelar";
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
  REQUISITOS_DOCTORADO,
  estadoPostulacion,
  numeroPe,
} from "../../config/bicentenario2026";
import SimuladorBicentenario from "./SimuladorBicentenario";
import AvisoApertura, { BarraMovil } from "./AvisoApertura";
import {
  Acordeon,
  Articulo,
  BloqueDescubre,
  BotonCalendly,
  Check,
  Chevron,
  Contador,
  CuentaAtras,
  DescubreCompacto,
  Eyebrow,
  Expandible,
  IndiceSecciones,
  Medallon,
  Pestanas,
  Revelar,
  Seccion,
  Titulo,
} from "./piezas";
import IconoBic from "./iconos";
import {
  HAY_COMPARACION,
  ICONO_FASE,
  ICONO_FAQ,
  ICONO_INCLUYE,
  ICONO_NO_INCLUYE,
  ICONO_REQ,
  INCLUIDO_PAQUETES,
  SECCIONES,
  SEO,
  TIPO_CAMBIO,
} from "./textos";
import { diasEntre, fechaCorta, hoyPeru, irA, useConteo, useEnPantalla } from "./utiles";
import { IlustracionAsesoria, IlustracionHero, IlustracionSimulador, Separador } from "./ilustraciones";
import "../../styles/movimiento.css";
import "./bicentenario.css";

const ANT = COMPARACION_2025.anterior;
const BLANCO = "#FFFFFF";
const CLARO = "#F2F8FF";

// ── 1. Hero ─────────────────────────────────────────────────────────────────
/** Lo primero que hay que entender: ¿está abierta la postulación o no? */
function EstadoConvocatoria() {
  // Date.now() en el render ensucia el pintado: se congela al montar y la
  // cuenta atrás de al lado es la que lleva los segundos.
  const [ahora] = useState(() => Date.now());
  const e = estadoPostulacion(ahora);
  const abierta = e.fase === "abierta";
  const cerrada = e.fase === "cerrada";
  const tono = abierta
    ? "bg-green-500/20 text-white ring-green-300/60"
    : cerrada
      ? "bg-white/10 text-white/80 ring-white/25"
      : "bg-sun/20 text-white ring-sun/50";
  const punto = abierta ? "bg-green-400" : cerrada ? "bg-white/50" : "bg-sun";
  const rotulo = abierta
    ? "Postulación abierta hasta el 13/11/2026"
    : cerrada
      ? "Postulación cerrada · resultados el 15/12/2026"
      : "Todavía no abre · del 30/10 al 13/11/2026";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold ring-1 ${tono}`}>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${punto} ${cerrada ? "" : "mov-latido"}`} aria-hidden="true" />
      {rotulo}
    </span>
  );
}

function Hero() {
  const desde = HAY_COMPARACION ? ANT.becasTotal : 0;
  const n = useConteo(desde, CIFRAS.total, 1900);
  const caja = useRef(null);
  useRevelar(caja);
  const paso = cascada(90);
  return (
    <PageHero
      etiqueta="PRONABEC · Convocatoria 2026"
      icono="birrete"
      titulo="Generación del Bicentenario 2026:"
      destacado="nuevas bases"
      descripcion="Te asesoramos para postular a la beca con universidades top 400 de España y de la Unión Europea."
    >
      <div ref={caja} className="grid w-full items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,25rem)]">
        <div className="order-2 min-w-0 lg:order-1">
          <div data-revelar="suave" style={paso()} className="mb-4">
            <EstadoConvocatoria />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div data-revelar="escala" style={paso()} className="bic-vidrio rounded-3xl bg-white/[0.08] p-5 ring-1 ring-white/15 backdrop-blur sm:p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-sun">
                <IconoBic nombre="tendencia-baja" size={17} className="shrink-0" />
                {HAY_COMPARACION ? "Se reducen significativamente las plazas" : "Muy pocas plazas"}
              </p>
              <div className="mt-1 flex items-end gap-3">
                <span className="bic-dorado font-fraunces text-[5.2rem] font-black leading-none tabular-nums text-sun sm:text-[6.5rem]" aria-hidden="true">
                  {Math.round(n)}
                </span>
                <span className="pb-3 text-xl font-bold leading-tight text-white">
                  <span className="sr-only">{CIFRAS.total} </span>becas
                  <br />
                  en total
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white ring-1 ring-white/20">
                  <IconoBic nombre="birrete" size={15} className="shrink-0 text-sky" />
                  {CIFRAS.maestria} maestría
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white ring-1 ring-white/20">
                  <IconoBic nombre="microscopio" size={15} className="shrink-0 text-sky" />
                  {CIFRAS.doctorado} doctorado
                </span>
                {HAY_COMPARACION && (
                  <span className="rounded-full bg-accent/25 px-3 py-1 text-sm font-bold text-white ring-1 ring-accent/60">En 2025 fueron {ANT.becasTotal}</span>
                )}
              </div>
            </div>
            <div data-revelar="escala" style={paso()} className="bic-vidrio rounded-3xl bg-white/[0.08] p-5 ring-1 ring-white/15 backdrop-blur sm:p-6">
              <CuentaAtras />
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <p className="rounded-xl bg-white/5 px-3 py-2 text-white/80">
                  <IconoBic nombre="puerta" size={15} className="mb-1 text-sky" />
                  <span className="block">Abre</span>
                  <b className="block text-white">30/10/2026</b>
                </p>
                <p className="rounded-xl bg-white/5 px-3 py-2 text-white/80">
                  <IconoBic nombre="candado" size={15} className="mb-1 text-sky" />
                  <span className="block">Cierra</span>
                  <b className="block text-white">13/11/2026 · 23:59</b>
                </p>
              </div>
            </div>
          </div>
          {/* Los botones y el aviso legal no entran al asomar: en una pantalla
              de 900 px el primero asoma justo en el borde y se quedaba
              transparente hasta que alguien hiciera scroll. */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#simulador"
              onClick={(e) => irA(e, "#simulador")}
              className="bic-press bic-cta mov-toque inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-lg font-extrabold text-primary-dark shadow-lg shadow-accent/30 transition hover:bg-sun"
            >
              <IconoBic nombre="diana" size={21} className="shrink-0" /> ¿Calificas? Descúbrelo en 2 minutos
            </a>
            <a
              href="#bases"
              onClick={(e) => irA(e, "#bases")}
              className="bic-press mov-toque inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold text-white ring-2 ring-white/35 transition hover:bg-white/10"
            >
              <IconoBic nombre="portapapeles" size={19} className="shrink-0" /> Ver las bases en claro
            </a>
            <a
              href="#aviso"
              onClick={(e) => irA(e, "#aviso")}
              className="bic-press mov-toque inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold text-white ring-2 ring-white/35 transition hover:bg-white/10"
            >
              <IconoBic nombre="campana" size={19} className="shrink-0" /> Avísame cuando abra
            </a>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-white/70">
            <IconoBic nombre="info" size={15} className="shrink-0" />
            Inspira Legal es una asesoría privada: no somos PRONABEC.
          </p>
        </div>
        <div className="order-1 mx-auto w-full max-w-[15rem] sm:max-w-[20rem] lg:order-2 lg:max-w-none">
          <IlustracionHero className="h-auto w-full drop-shadow-2xl" />
        </div>
      </div>
    </PageHero>
  );
}

// ── 2. Las nuevas bases en 60 segundos ──────────────────────────────────────
function TarjetaClave({ c }) {
  const [abierta, setAbierta] = useState(false);
  const oscura = c === LO_NUEVO[0];
  return (
    <button
      type="button"
      onClick={() => setAbierta(!abierta)}
      aria-expanded={abierta}
      className={`bic-lift bic-press mov-eleva relative flex h-full w-full flex-col overflow-hidden rounded-3xl border-2 p-5 text-left sm:p-6 ${oscura ? "border-transparent bg-primary text-white" : "border-neutral-200 bg-white hover:border-sky"}`}
    >
      <span aria-hidden="true" className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${oscura ? "bg-white/5" : "bg-secondary-light"}`} />
      <Medallon
        icono={c.icono}
        size={28}
        className={`relative h-14 w-14 ${oscura ? "bg-white/10 text-sun ring-1 ring-white/20" : "bg-secondary text-primary ring-1 ring-sky/50"}`}
      />
      <span className={`relative mt-4 font-fraunces text-xl font-bold leading-snug ${oscura ? "text-white" : "text-primary"}`}>{c.titulo}</span>
      <span className={`relative mt-1.5 text-sm leading-relaxed ${oscura ? "text-white/85" : "text-neutral-700"}`}>{c.texto}</span>
      <span className={`relative mt-auto flex items-center gap-2 pt-4 text-xs font-bold ${oscura ? "text-sky" : "text-primary-light"}`}>
        {abierta ? <Articulo claro={oscura}>{c.art}</Articulo> : <>Ver artículo <Chevron size={13} /></>}
      </span>
    </button>
  );
}

function LoNuevo() {
  return (
    <Seccion id="en-60-segundos">
      <Titulo icono="rayo" eyebrow="En 60 segundos" titulo="Las nuevas bases, en seis claves" texto="Toca cada tarjeta para ver de qué artículo sale." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LO_NUEVO.map((c, i) => (
          <Revelar key={c.titulo} efecto="bic-zoom" retraso={i * 80} className="h-full">
            <TarjetaClave c={c} />
          </Revelar>
        ))}
      </div>
    </Seccion>
  );
}

// ── 3. 2025 vs 2026 ─────────────────────────────────────────────────────────
function Barra({ etiqueta, valor, max, visto, color, retraso = false, oscura }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-10 text-xs font-bold ${oscura ? "text-white/80" : "text-neutral-700"}`}>{etiqueta}</span>
      <div className={`h-3 flex-1 overflow-hidden rounded-full ${oscura ? "bg-white/10" : "bg-secondary"}`}>
        <div
          className={`h-full min-w-[5px] rounded-full ${color} transition-[width] duration-[1200ms] ease-out motion-reduce:transition-none ${retraso ? "delay-500" : ""}`}
          style={{ width: visto ? `${(valor / max) * 100}%` : "0%" }}
        />
      </div>
      <span className={`w-9 text-right text-xs font-black tabular-nums ${oscura ? "text-white" : "text-primary"}`}>{valor}</span>
    </div>
  );
}

function TarjetaBajada({ icono, titulo, antes, ahora, oscura = false }) {
  const [ref, visto] = useEnPantalla();
  const v = useConteo(antes, ahora, 2000, visto);
  const pct = Math.round((1 - ahora / antes) * 100);
  return (
    <div ref={ref} className={`bic-lift mov-eleva h-full rounded-3xl p-5 sm:p-6 ${oscura ? "bg-primary text-white" : "border-2 border-neutral-200 bg-white text-primary"}`}>
      <p className="flex items-center gap-2.5 text-sm font-extrabold">
        <Medallon icono={icono} size={20} className={`h-10 w-10 ${oscura ? "bg-white/10 text-sun" : "bg-secondary text-primary"}`} />
        {titulo}
      </p>
      <p className="mt-3 flex items-baseline gap-2">
        <span aria-hidden="true" className={`font-fraunces text-5xl font-black tabular-nums sm:text-6xl ${oscura ? "text-sun" : "text-primary"}`}>{Math.round(v)}</span>
        <span className={`text-sm font-bold ${oscura ? "text-white/85" : "text-neutral-700"}`}>
          <span className="sr-only">{ahora} </span>becas en 2026
        </span>
      </p>
      <div className="mt-4 space-y-2">
        <Barra etiqueta="2025" valor={antes} max={antes} visto={visto} color={oscura ? "bg-white/45" : "bg-neutral-300"} oscura={oscura} />
        <Barra etiqueta="2026" valor={ahora} max={antes} visto={visto} color={oscura ? "bg-sun" : "bg-accent"} retraso oscura={oscura} />
      </div>
      <p className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${oscura ? "bg-white/10 text-white" : "bg-accent/20 text-primary"}`}>
        <IconoBic nombre="tendencia-baja" size={14} className="shrink-0" /> −{pct} % frente a 2025
      </p>
    </div>
  );
}

function TarjetaDato({ icono, titulo, children, nota }) {
  return (
    <div className="bic-lift mov-eleva flex h-full items-start gap-4 rounded-3xl border-2 border-neutral-200 bg-white p-4 sm:p-5">
      <Medallon icono={icono} size={22} className="h-12 w-12 bg-secondary text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-700">{titulo}</p>
        <div className="mt-0.5">{children}</div>
        {nota && <p className="mt-0.5 text-xs text-neutral-600">{nota}</p>}
      </div>
    </div>
  );
}

function FilaCambio({ c, i }) {
  const t = TIPO_CAMBIO[c.tipo] || TIPO_CAMBIO.mas;
  return (
    <li className="bic-entra h-full" style={{ "--bic-d": `${i * 45}ms` }}>
      <div className="bic-lift mov-eleva h-full rounded-2xl border-2 border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="font-bold leading-snug text-primary">{c.tema}</span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${t.clase}`}>
            <IconoBic nombre={t.icono} size={13} className="shrink-0" />
            {t.txt}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-[auto_1fr] items-baseline gap-x-2 gap-y-1 text-sm">
          <span className="text-xs font-black text-neutral-600">2025</span>
          <span className="text-neutral-600">{c.tipo === "igual" ? c.antes : <s className="decoration-neutral-400">{c.antes}</s>}</span>
          <span className="text-xs font-black text-primary-light">2026</span>
          <span className="font-semibold text-primary">{c.ahora}</span>
        </div>
      </div>
    </li>
  );
}

function ComparacionContenido() {
  const C = COMPARACION_2025;
  const [pestana, setPestana] = useState("requisitos");
  const filas = pestana === "requisitos" ? C.cambiosRequisitos : C.cambiosPuntaje;
  const millones = (v) => `S/ ${v.toFixed(2).replace(".", ",")} M`;
  return (
    <Seccion id="antes-y-ahora" fondo="bg-secondary-light">
      <Titulo icono="grafico" eyebrow="Antes y ahora" titulo="Convocatoria 2025 frente a 2026" texto="Menos becas y menos tiempo para postular. Mira las cifras cambiar." />

      <div className="grid gap-4 md:grid-cols-3">
        <Revelar efecto="bic-zoom" className="h-full"><TarjetaBajada oscura icono="diana" titulo="Becas en total" antes={ANT.becasTotal} ahora={COMPARACION_ACTUAL.becasTotal} /></Revelar>
        <Revelar efecto="bic-zoom" retraso={100} className="h-full"><TarjetaBajada icono="birrete" titulo="Maestría" antes={ANT.maestria} ahora={COMPARACION_ACTUAL.maestria} /></Revelar>
        <Revelar efecto="bic-zoom" retraso={200} className="h-full"><TarjetaBajada icono="microscopio" titulo="Doctorado" antes={ANT.doctorado} ahora={COMPARACION_ACTUAL.doctorado} /></Revelar>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Revelar className="h-full">
          <TarjetaDato icono="euro" titulo="Presupuesto" nota={`Antes ${millones(ANT.presupuesto / 1e6)} · 2026 con cargo al año fiscal 2027`}>
            <Contador desde={ANT.presupuesto / 1e6} hasta={COMPARACION_ACTUAL.presupuesto / 1e6} formato={millones} className="font-fraunces text-2xl font-black text-primary" />
          </TarjetaDato>
        </Revelar>
        <Revelar retraso={100} className="h-full">
          <TarjetaDato icono="reloj" titulo="Plazo para postular" nota={`Antes ${ANT.semanas} semanas · ${COMPARACION_ACTUAL.postulacion}`}>
            <Contador desde={ANT.semanas} hasta={COMPARACION_ACTUAL.semanas} formato={(v) => `${Math.round(v)} semanas`} className="font-fraunces text-2xl font-black text-primary" />
          </TarjetaDato>
        </Revelar>
        <Revelar retraso={200} className="h-full">
          <TarjetaDato icono="usuarios" titulo="Postulantes en 2025" nota={`Con registro completo, por ${ANT.seleccionados} becas. En 2026 hay ${CIFRAS.total}.`}>
            <Contador desde={0} hasta={ANT.postulantes} formato={(v) => numeroPe(v)} className="font-fraunces text-2xl font-black text-primary" />
          </TarjetaDato>
        </Revelar>
      </div>

      <Revelar className="mt-4">
        <p className="flex flex-wrap items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-neutral-700 ring-1 ring-primary/10">
          <IconoBic nombre="globo" size={19} className="shrink-0 text-primary-light" />
          <b className="text-primary">Ranking exigido: igual.</b> {COMPARACION_ACTUAL.ranking}.
        </p>
      </Revelar>

      <div className="mt-10">
        <Pestanas
          etiqueta="Qué cambia"
          valor={pestana}
          onChange={setPestana}
          opciones={[
            { v: "requisitos", icono: "portapapeles", txt: "Requisitos y beneficios", n: C.cambiosRequisitos.length },
            { v: "puntaje", icono: "calculadora", txt: "Puntaje de maestría", n: C.cambiosPuntaje.length },
          ]}
        />
        <ul key={pestana} className="mt-4 grid gap-3 md:grid-cols-2">
          {filas.map((c, i) => <FilaCambio key={c.tema} c={c} i={i} />)}
        </ul>
      </div>

      <Acordeon className="mt-6" icono="info" titulo="Contexto y fuentes oficiales" resumen="Por qué la convocatoria llega en septiembre y de dónde salen los datos">
        <p className="text-sm leading-relaxed text-neutral-700">{C.contexto}</p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700">
          <a className="font-bold text-primary-light underline" href={ANT.fuente} target="_blank" rel="noopener noreferrer">Bases 2025 ({ANT.norma})</a> ·{" "}
          <a className="font-bold text-primary-light underline" href={ANT.fuenteResultados} target="_blank" rel="noopener noreferrer">Resultados 2025 (RJ N.º 1685-2025)</a> ·{" "}
          <a className="font-bold text-primary-light underline" href={C.fuenteContexto} target="_blank" rel="noopener noreferrer">El Peruano, 28/04/2026</a> · Bases 2026 ({FUENTE.norma}).
        </p>
      </Acordeon>
    </Seccion>
  );
}

function Comparacion() {
  return HAY_COMPARACION ? <ComparacionContenido /> : null;
}

// ── 4. Bases amigables ──────────────────────────────────────────────────────
function ChecklistRequisitos() {
  const [nivel, setNivel] = useState("maestria");
  const [marcados, setMarcados] = useState({});
  const [abierto, setAbierto] = useState(null);
  const total = REQUISITOS.length;
  const n = REQUISITOS.filter((r) => marcados[r.id]).length;
  const listo = n === total;

  return (
    <div className="rounded-[2rem] border-2 border-neutral-200 bg-white p-4 shadow-xl shadow-primary/5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pestanas
          etiqueta="Nivel"
          valor={nivel}
          onChange={setNivel}
          opciones={[
            { v: "maestria", icono: "birrete", txt: "Maestría" },
            { v: "doctorado", icono: "microscopio", txt: "Doctorado" },
          ]}
        />
        <p className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <IconoBic nombre="toque" size={17} className="shrink-0 text-accent-dark" />
          Toca el icono de lo que ya cumples
        </p>
      </div>

      <div className="mt-5 rounded-2xl bg-secondary-light p-3 sm:p-4" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span key={n} className="bic-pop inline-flex items-center gap-2 font-fraunces text-2xl font-black text-primary">
            {n}/{total}
            <IconoBic nombre="check" size={20} className="text-green-700" />
          </span>
          {listo ? (
            <a href="#simulador" onClick={(e) => irA(e, "#simulador")} className="bic-press bic-pop mov-toque inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-extrabold text-primary-dark hover:bg-sun">
              <IconoBic nombre="fiesta" size={17} className="shrink-0" /> ¡Todo marcado! Calcula tu puntaje →
            </a>
          ) : (
            <span className="text-sm font-semibold text-neutral-700">Te falta{total - n === 1 ? "" : "n"} {total - n} por marcar</span>
          )}
        </div>
        <div className="bic-progreso mt-2 h-3 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-gradient-to-r from-sky to-green-600 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(n / total) * 100}%` }} />
        </div>
      </div>

      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {REQUISITOS.map((r, i) => {
          const ok = !!marcados[r.id];
          const corto = (nivel === "doctorado" && REQUISITOS_DOCTORADO[r.id]?.corto) || r.corto;
          const abiertoEste = abierto === r.id;
          return (
            <Revelar as="li" key={r.id} retraso={i * 40}>
              <div className={`rounded-2xl border-2 p-3 transition-colors sm:p-3.5 ${ok ? "border-green-600/50 bg-green-50" : "border-neutral-200 bg-white"}`}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-pressed={ok}
                    aria-label={`${ok ? "Desmarcar" : "Marcar que cumplo"}: ${corto}`}
                    onClick={() => setMarcados((m) => ({ ...m, [r.id]: !m[r.id] }))}
                    className={`bic-press mov-toque flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-2 transition ${ok ? "bg-green-700 text-white ring-green-700" : "bg-white text-primary ring-neutral-200 hover:ring-green-600"}`}
                  >
                    {ok ? <span key="ok" className="bic-pop"><Check size={20} /></span> : <IconoBic nombre={r.icono || ICONO_REQ[r.id]} size={21} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbierto(abiertoEste ? null : r.id)}
                    aria-expanded={abiertoEste}
                    aria-controls={`req-${r.id}`}
                    className="flex min-h-[44px] min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className={`min-w-0 flex-1 font-bold leading-snug ${ok ? "text-green-900" : "text-primary"}`}>{corto}</span>
                    <span className={`bic-flecha flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary ${abiertoEste ? "bic-girada" : ""}`}>
                      <Chevron />
                    </span>
                  </button>
                </div>
                <Expandible abierto={abiertoEste} id={`req-${r.id}`}>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700 sm:pl-14">{r.detalle}</p>
                  <p className="mt-2 sm:pl-14"><Articulo>{r.art}</Articulo></p>
                </Expandible>
              </div>
            </Revelar>
          );
        })}
      </ul>
      <p className="mt-4 flex items-center gap-2 text-xs text-neutral-600">
        <IconoBic nombre="candado" size={14} className="shrink-0" />
        Solo es una lista para ti: no guardamos lo que marcas.
      </p>
    </div>
  );
}

function Beneficios() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Revelar efecto="bic-izq" className="h-full">
        <div className="h-full rounded-[2rem] border-2 border-green-600/40 bg-green-50/70 p-5 sm:p-7">
          <p className="flex items-center gap-2.5 font-fraunces text-2xl font-bold text-primary">
            <Medallon icono="check" size={22} className="h-11 w-11 bg-green-700 text-white" />
            Qué cubre la beca
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {BENEFICIOS.incluye.map((b, i) => (
              <li key={b} className="bic-lift mov-eleva flex items-center gap-3 rounded-2xl bg-white p-3 text-sm font-semibold leading-snug text-neutral-800 shadow-sm">
                <Medallon icono={ICONO_INCLUYE[i]} size={20} className="h-10 w-10 bg-green-100 text-green-900" />
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-neutral-700">
            <IconoBic nombre="info" size={15} className="mt-px shrink-0" />
            {BENEFICIOS.notaIncluye}
          </p>
        </div>
      </Revelar>
      <Revelar efecto="bic-der" retraso={120} className="h-full">
        <div className="h-full rounded-[2rem] border-2 border-neutral-200 bg-neutral-50 p-5 sm:p-7">
          <p className="flex items-center gap-2.5 font-fraunces text-2xl font-bold text-primary">
            <Medallon icono="prohibido" size={22} className="h-11 w-11 bg-neutral-700 text-white" />
            Qué no cubre
          </p>
          <ul className="mt-4 grid gap-2">
            {BENEFICIOS.noIncluye.map((b, i) => (
              <li key={b} className="bic-lift mov-eleva flex items-center gap-3 rounded-2xl bg-white p-3 text-sm font-semibold leading-snug text-neutral-800 shadow-sm">
                <span className="relative shrink-0">
                  <Medallon icono={ICONO_NO_INCLUYE[i]} size={20} className="h-10 w-10 bg-neutral-100 text-neutral-500" />
                  <span aria-hidden="true" className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-700 text-white">
                    <IconoBic nombre="prohibido" size={12} />
                  </span>
                </span>
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 rounded-xl bg-accent/15 p-3 text-sm font-semibold text-primary">
            <IconoBic nombre="alerta" size={17} className="mt-px shrink-0 text-accent-dark" />
            {BENEFICIOS.notaNoIncluye}
          </p>
          <p className="mt-3"><Articulo>{BENEFICIOS.art}</Articulo></p>
        </div>
      </Revelar>
    </div>
  );
}

function CronogramaInteractivo() {
  // La fecha se congela al montar: leer el reloj durante el render ensucia el
  // pintado y el cronograma no necesita cambiar mientras la página está abierta.
  const [hoy] = useState(hoyPeru);
  const estados = CRONOGRAMA.map((f) => (f.fin < hoy ? "pasada" : f.inicio <= hoy ? "actual" : "futura"));
  const idxActual = estados.indexOf("actual");
  const idxProx = estados.indexOf("futura");
  const [sel, setSel] = useState(idxActual >= 0 ? idxActual : idxProx >= 0 ? idxProx : CRONOGRAMA.length - 1);
  const f = CRONOGRAMA[sel];
  const pasadas = estados.filter((e) => e === "pasada").length;
  const progreso = idxActual >= 0 ? (idxActual + 0.5) / (CRONOGRAMA.length - 1) : pasadas / (CRONOGRAMA.length - 1);

  const aviso =
    idxActual >= 0
      ? `Hoy estamos en «${CRONOGRAMA[idxActual].fase}»`
      : idxProx >= 0
        ? `Faltan ${diasEntre(hoy, CRONOGRAMA[idxProx].inicio)} días para «${CRONOGRAMA[idxProx].fase}»`
        : "El concurso ya terminó";

  const estadoSel = estados[sel];
  const detalle =
    estadoSel === "pasada"
      ? { icono: "check", txt: "Esta etapa ya terminó" }
      : estadoSel === "actual"
        ? { icono: "rayo", txt: `En curso: termina en ${diasEntre(hoy, f.fin)} días` }
        : { icono: "reloj", txt: `Empieza en ${diasEntre(hoy, f.inicio)} días` };

  return (
    <div className="rounded-[2rem] bg-secondary-light p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 font-fraunces text-2xl font-bold text-primary">
          <Medallon icono="calendario" size={22} className="h-11 w-11 bg-white text-primary shadow-sm" />
          Cronograma
        </p>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-primary shadow-sm">
          <span className="bic-pulso h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
          <IconoBic nombre="ubicacion" size={15} className="shrink-0 text-accent-dark" />
          Hoy {fechaCorta(hoy)} · {aviso}
        </span>
      </div>

      <div className="relative mt-6">
        <div aria-hidden="true" className="pointer-events-none absolute left-[7%] right-[7%] top-[34px] hidden h-1.5 rounded-full bg-sky/40 lg:block">
          <div className="h-full rounded-full bg-accent transition-[width] duration-1000 motion-reduce:transition-none" style={{ width: `${Math.max(0, Math.min(1, progreso)) * 100}%` }} />
        </div>
        <div className="bic-tl relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 lg:mx-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:px-0 lg:pb-0">
          {CRONOGRAMA.map((fase, i) => {
            const e = estados[i];
            const elegido = sel === i;
            return (
              <button
                key={fase.id}
                type="button"
                onClick={() => setSel(i)}
                aria-pressed={elegido}
                className={`bic-press mov-toque relative flex w-[8.5rem] shrink-0 flex-col items-center rounded-2xl px-2 pb-3 pt-2 text-center transition lg:w-auto ${elegido ? "bg-white shadow-lg ring-2 ring-accent" : "hover:bg-white/70"}`}
              >
                <span
                  className={`relative flex h-14 w-14 items-center justify-center rounded-full ring-4 ${
                    e === "pasada" ? "bg-neutral-100 text-neutral-500 ring-white" : e === "actual" ? "bic-pulso bg-green-100 text-green-800 ring-green-600" : i === idxProx ? "bic-pulso bg-accent/25 text-accent-dark ring-accent" : "bg-white text-primary ring-sky/60"
                  }`}
                >
                  <IconoBic nombre={ICONO_FASE[fase.id]} size={24} />
                </span>
                <span className="mt-2 text-sm font-bold leading-tight text-primary">{fase.fase}</span>
                <span className="mt-0.5 text-xs font-semibold text-neutral-700">{fase.texto}</span>
                {(e === "actual" || i === idxProx) && (
                  <span className={`mt-1.5 rounded-full px-2 py-0.5 text-[11px] font-black uppercase tracking-wide ${e === "actual" ? "bg-green-700 text-white" : "bg-accent text-primary-dark"}`}>
                    {e === "actual" ? "En curso" : "Lo próximo"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div key={sel} className="bic-entra mt-4 flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm sm:p-5" aria-live="polite">
        <Medallon icono={ICONO_FASE[f.id]} size={28} className="h-14 w-14 bg-secondary text-primary" />
        <div className="min-w-0 flex-1">
          <p className="font-fraunces text-xl font-bold text-primary">{f.fase}</p>
          <p className="font-semibold text-neutral-700">{f.texto}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-primary-light">
            <IconoBic nombre={detalle.icono} size={15} className="shrink-0" />
            {detalle.txt}
          </p>
          {f.nota && <p className="text-sm text-neutral-700">{f.nota}</p>}
        </div>
        <Articulo className="hidden sm:inline-flex">art. 9.3</Articulo>
      </div>
    </div>
  );
}

function BasesAmigables() {
  return (
    <Seccion id="bases">
      <Titulo icono="portapapeles" eyebrow="Bases amigables" titulo="¿Cumples los requisitos? Márcalos" texto="Una línea por requisito. Abre el detalle solo si tienes dudas." />
      <ChecklistRequisitos />

      <div className="mt-12">
        <Beneficios />
      </div>

      <Revelar className="mt-12">
        <Acordeon icono="prohibido" titulo="No puedes postular si…" resumen={`${IMPEDIMENTOS.length} impedimentos que te dejan fuera. Tócalo para verlos.`}>
          <ul className="grid gap-2 md:grid-cols-2">
            {IMPEDIMENTOS.map((i) => (
              <li key={i.art} className="flex gap-3 rounded-xl bg-neutral-50 p-3">
                <IconoBic nombre="prohibido" size={16} className="mt-0.5 shrink-0 text-neutral-500" />
                <span className="text-sm leading-snug text-neutral-800">{i.texto} <Articulo>art. {i.art}</Articulo></span>
              </li>
            ))}
          </ul>
        </Acordeon>
      </Revelar>

      <Revelar className="mt-12">
        <CronogramaInteractivo />
      </Revelar>
    </Seccion>
  );
}

// ── 5. Simulador ────────────────────────────────────────────────────────────
function Simulador() {
  return (
    <Seccion id="simulador" fondo="bg-secondary-light">
      <div className="mx-auto mb-8 flex max-w-4xl flex-col items-center gap-5 text-center sm:mb-10 md:flex-row md:text-left">
        <Revelar efecto="bic-zoom" className="shrink-0">
          <IlustracionSimulador className="h-32 w-auto sm:h-40" />
        </Revelar>
        <Revelar className="min-w-0">
          <Eyebrow icono="calculadora">Simulador gratis · 2 minutos</Eyebrow>
          <h2 className="mt-3 font-fraunces text-[1.7rem] font-bold leading-tight text-primary sm:text-4xl">¿Calificas y cuánto puntaje tendrías?</h2>
          <p className="mt-2 text-base text-neutral-700 sm:text-lg">Responde con lo que tienes hoy. Se calcula en tu navegador: no guardamos nada.</p>
          <p className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-primary md:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm"><IconoBic nombre="portapapeles" size={15} /> Requisitos</span>
            <IconoBic nombre="flecha" size={15} className="text-primary-light" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm"><IconoBic nombre="calculadora" size={15} /> Puntaje</span>
            <IconoBic nombre="flecha" size={15} className="text-primary-light" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm"><IconoBic nombre="diana" size={15} /> Resultado</span>
          </p>
        </Revelar>
      </div>
      <CercoErrores donde="bicentenario-simulador" titulo="El simulador no se pudo mostrar">
        <SimuladorBicentenario />
      </CercoErrores>
    </Seccion>
  );
}

// ── 8. Paquetes, becas logradas y CTA ───────────────────────────────────────
function AsesoriaBecas() {
  return (
    <Seccion id="asesoria-becas" fondo="bg-secondary-light">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="min-w-0">
          <Titulo
            icono="usuarios"
            eyebrow="Plan A y plan B"
            titulo="Todos nuestros paquetes incluyen asesoría de becas y un plan B con maestrías económicas"
          />
          <ul className="grid gap-3 sm:grid-cols-3">
            {INCLUIDO_PAQUETES.map((x, i) => (
              <Revelar as="li" key={x.txt} retraso={i * 90} className="h-full">
                <div className="bic-lift mov-eleva flex h-full flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-primary/10">
                  <Medallon icono={x.icono} size={24} className="h-12 w-12 bg-secondary text-primary" />
                  <span className="text-sm font-bold leading-snug text-primary">{x.txt}</span>
                </div>
              </Revelar>
            ))}
          </ul>

          <Revelar className="mt-8">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-700">
              <IconoBic nombre="trofeo" size={16} className="shrink-0 text-accent-dark" />
              Becas logradas por asesorados en nuestra asesoría
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {BECAS_LOGRADAS.map((b) => (
                <span key={b} className="bic-lift mov-eleva inline-flex items-center gap-1.5 rounded-full bg-sun/50 px-3.5 py-2 text-sm font-bold text-primary">
                  <Check size={13} /> {b}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-neutral-600">Registros internos de expedientes. Cada beca la decide la entidad que la convoca; Inspira no garantiza la admisión ni la beca.</p>
          </Revelar>

          <Revelar className="mt-8"><DescubreCompacto /></Revelar>
        </div>

        <Revelar efecto="bic-der">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-white shadow-2xl shadow-primary/25 sm:p-8">
            <span aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky/10" />
            <IlustracionAsesoria className="relative h-28 w-auto" />
            <p className="relative mt-4 font-fraunces text-3xl font-bold leading-tight">Asesoría de becas para España y la Unión Europea</p>
            <p className="relative mt-3 leading-relaxed text-white/85">
              En la sesión diagnóstico ({ASESORIA.duracion}, online) revisamos tu perfil, si te conviene la Generación del Bicentenario, qué otras becas encajan contigo y tu plan B de másteres.
            </p>
            <div className="relative mt-5 flex flex-wrap gap-2">
              {[ASESORIA.precioEur, ASESORIA.precioUsd, ASESORIA.precioPen].map((p) => (
                <span key={p} className="rounded-full bg-white/10 px-3.5 py-1.5 font-fraunces text-lg font-black text-sun ring-1 ring-white/20">{p}</span>
              ))}
            </div>
            <div className="relative mt-6 flex flex-col gap-3">
              <BotonCalendly className="w-full"><IconoBic nombre="calendario" size={19} className="shrink-0" /> Reservar sesión diagnóstico</BotonCalendly>
              <a
                href={whatsappDesde("bicentenario-2026", "Quiero asesoría de becas para postular a la Generación del Bicentenario 2026 u otras becas.")}
                target="_blank"
                rel="noopener noreferrer"
                className="bic-press mov-toque inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-extrabold text-white ring-2 ring-white/40 transition hover:bg-white/10"
              >
                <IconoBic nombre="whatsapp" size={19} className="shrink-0" /> Escribir por WhatsApp
              </a>
            </div>
          </div>
        </Revelar>
      </div>
    </Seccion>
  );
}

// ── 9. FAQ y pie legal ──────────────────────────────────────────────────────
function Preguntas() {
  return (
    <Seccion id="preguntas">
      <Titulo icono="pregunta" eyebrow="Preguntas frecuentes" titulo="Lo que más nos preguntan" />
      <div className="grid gap-3 md:grid-cols-2">
        {FAQ.map((f, i) => (
          <Revelar key={f.q} retraso={i * 50}>
            <Acordeon icono={ICONO_FAQ[i]} titulo={f.q}>
              <p className="text-sm leading-relaxed text-neutral-700">{f.a}</p>
              {f.art && <p className="mt-2"><Articulo>{f.art}</Articulo></p>}
            </Acordeon>
          </Revelar>
        ))}
      </div>
      <p className="mt-10 flex gap-3 rounded-2xl border-2 border-neutral-200 bg-secondary-light p-5 text-xs leading-relaxed text-neutral-700">
        <IconoBic nombre="balanza" size={20} className="mt-px shrink-0 text-primary" />
        <span>
          {PIE_LEGAL}{" "}
          <a href={FUENTE.url} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline">gob.pe/pronabec</a>
        </span>
      </p>
    </Seccion>
  );
}

export default function BecaBicentenario2026() {
  useSEO(SEO);
  // Si se llega con #aviso, #simulador… (desde /enlaces o TikTok), baja a esa
  // sección cuando ya está pintada: el navegador lo intenta antes de que exista.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 450);
    return () => clearTimeout(t);
  }, []);
  return (
    <main className="bic-premium w-full bg-white [overflow-x:clip]">
      <Hero />
      <Separador arriba="transparent" abajo={BLANCO} className="relative z-[2] -mt-7 sm:-mt-12" />
      <IndiceSecciones secciones={SECCIONES} />
      <LoNuevo />
      {HAY_COMPARACION && <Separador arriba={BLANCO} abajo={CLARO} />}
      <Comparacion />
      <Separador arriba={HAY_COMPARACION ? CLARO : BLANCO} abajo={BLANCO} invertir />
      <BasesAmigables />
      <Separador arriba={BLANCO} abajo={CLARO} />
      <Simulador />
      <Separador arriba={CLARO} abajo={BLANCO} invertir />
      <AvisoApertura />
      <BloqueDescubre />
      <Separador arriba={BLANCO} abajo={CLARO} />
      <AsesoriaBecas />
      <Separador arriba={CLARO} abajo={BLANCO} invertir />
      <Preguntas />
      <BarraMovil />
    </main>
  );
}
