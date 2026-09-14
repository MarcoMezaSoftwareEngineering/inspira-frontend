// src/pages/grado/GradoEspana.jsx
//
// /grado-en-espana — guía pública para padres y madres que financian el grado
// de su hijo o hija en España (encargo del cliente, 14/09/2026: «para que los
// papás sepan cómo es su inversión y el paquete que tenemos»).
//
// Enlazada desde /servicios/grado-espana; NO está en los menús (lo decide el
// cliente). Cifras: config/gradoEspana.js (datos verificados + precios de
// Inspira). Coste de vida por ciudad: config/costeVida.js (orientativo).
import PageHero from "../../components/layout/PageHero";
import Icono from "../../components/common/Icono";
import { navigate } from "../../services/navigate";
import { numero } from "../../config/paqueteMaster2027Resumen";
import { NOMBRE_PORTAL } from "../../config/portalMarca";
import {
  BECAS,
  CALENDARIO,
  DESCARGO,
  ETAPAS_PAGO,
  FAQ,
  FUENTES,
  IPREM_ANUAL,
  IPREM_MES,
  META,
  NOTA_REQUISITOS,
  PAQUETE_GRADO,
  PRIVADAS_POR_CARRERA,
  PUBLICAS,
  REQUISITOS,
  SESION,
  UNEDASISS,
  VIAS_ACCESO,
  VISA_ESTANCIA,
} from "../../config/gradoEspana";
import SimuladorGrado from "./SimuladorGrado";
import Comparativa from "./Comparativa";
import VidaEspana from "./VidaEspana";
import { FUENTE_VIDA, FUENTES_VIDA } from "../../config/costeVida";
import { BotonSesion, EnlaceWhatsapp, Orientativo, Seccion, Titulo, evento } from "./piezas";

const e0 = (n) => numero(Math.round(n));
const TODAS_FUENTES = [...FUENTES, ...FUENTES_VIDA.filter((f) => f.url)];

function irA(e, id) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  evento("grado_ancla", { destino: id });
}

// ── 1 · Cifras clave ────────────────────────────────────────────────────────
function Cifras() {
  const sin = PUBLICAS.filter((p) => p.estado === "sin");
  const minSin = Math.min(...sin.map((p) => p.noResidente.min));
  const dondeMin = sin.find((p) => p.noResidente.min === minSin)?.nombre;
  const madrid = PUBLICAS.find((p) => p.id === "madrid").noResidente;
  const priv = [...PRIVADAS_POR_CARRERA.ade, ...PRIVADAS_POR_CARRERA.derecho].map((f) => f.anual);
  const tiles = [
    { valor: `${e0(minSin)} €`, texto: "al año, desde, en una universidad pública sin recargo", detalle: `${dondeMin}, precio para no residentes` },
    { valor: `${e0(madrid.min)}–${e0(madrid.max)} €`, texto: "al año en una pública de Madrid", detalle: "Cobra la cuarta matrícula a quien no es residente" },
    { valor: `${e0(Math.min(...priv))}–${e0(Math.max(...priv))} €`, texto: "por curso en una universidad privada", detalle: "ADE o Derecho, según la universidad" },
  ];
  return (
    <section aria-label="Cifras clave" className="border-b border-neutral-200 bg-secondary-light px-4 py-8 min-[380px]:px-5 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <ul className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {tiles.map((t) => (
            <li key={t.texto} className="rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
              <p className="font-sans text-[28px] font-extrabold leading-none text-primary sm:text-3xl">{t.valor}</p>
              <p className="mt-2 text-sm font-semibold leading-snug text-neutral-900">{t.texto}</p>
              <p className="mt-1 text-xs text-neutral-500">{t.detalle}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
          <Orientativo />
          Matrícula del curso {META.curso} para estudiantes de fuera de la Unión Europea. Sin alojamiento ni manutención.
        </p>
      </div>
    </section>
  );
}

// ── 4 · Requisitos y vías de acceso ─────────────────────────────────────────
function Requisitos() {
  const tasasBase = UNEDASISS.calificacionAcceso + UNEDASISS.aperturaExpediente + UNEDASISS.secretaria;
  return (
    <Seccion id="requisitos" fondo="bg-white">
      <Titulo eyebrow="Requisitos" titulo="Qué tiene que tener tu hijo o hija" />
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {REQUISITOS.map((r, i) => (
          <li key={r.titulo} className="rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <Icono nombre={r.icono} size={20} />
              </span>
              <span className="text-xs font-bold text-neutral-500">Paso {i + 1}</span>
            </div>
            <p className="mt-3 font-bold leading-snug text-primary">{r.titulo}</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-700">{r.texto}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-neutral-600">{NOTA_REQUISITOS}</p>

      <h3 className="mt-12 font-fraunces text-2xl font-bold text-primary">Dos vías para entrar a la universidad</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {VIAS_ACCESO.map((v) => (
          <div
            key={v.id}
            className={`relative rounded-3xl p-6 ${v.recomendada ? "border-2 border-accent bg-white" : "border border-neutral-200 bg-secondary-light"}`}
          >
            {v.recomendada && (
              <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white">
                Recomendada
              </span>
            )}
            <p className="font-fraunces text-xl font-bold text-primary">{v.titulo}</p>
            <p className="mt-1 text-sm font-semibold text-primary-light">{v.lema}</p>
            <ul className="mt-4 space-y-2">
              {v.puntos.map((p) => (
                <li key={p} className="flex gap-2.5 text-sm leading-snug text-neutral-700">
                  <span className="mt-0.5 shrink-0 text-primary">
                    <Icono nombre="escudo" size={16} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-neutral-600">
              {v.recomendada
                ? "Tasas oficiales: solo la homologación."
                : `Tasas de UNEDasiss: ${numero(tasasBase)} € más ${numero(UNEDASISS.pce[0])}–${numero(UNEDASISS.pce[5])} € según las asignaturas. ${UNEDASISS.notaMaxima}`}
            </p>
          </div>
        ))}
      </div>
    </Seccion>
  );
}

// ── 5 · El Paquete Grado ────────────────────────────────────────────────────
function Paquete() {
  return (
    <Seccion id="paquete" fondo="bg-secondary-light">
      <Titulo
        eyebrow={PAQUETE_GRADO.titulo}
        titulo="El paquete con el que acompañamos a tu hijo o hija"
        intro="Cuatro servicios en uno, del primer documento a la carta de admisión. Y pagas por etapas, a medida que avanza."
      />

      <div className="mt-8 overflow-hidden rounded-3xl border-2 border-accent bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-accent px-6 py-2.5">
          <p className="text-xs font-black uppercase tracking-widest text-white">
            {PAQUETE_GRADO.nombre} · {PAQUETE_GRADO.lema}
          </p>
        </div>
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {PAQUETE_GRADO.servicios.map((s) => (
                <li key={s.titulo} className="flex gap-3 rounded-2xl bg-secondary-light p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                    <Icono nombre={s.icono} size={20} />
                  </span>
                  <span>
                    <span className="block font-bold leading-snug text-primary">{s.titulo}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-neutral-700">{s.texto}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Incluye</p>
                <ul className="mt-2 space-y-1.5">
                  {PAQUETE_GRADO.incluye.map((i) => (
                    <li key={i} className="flex gap-2 text-sm text-neutral-700">
                      <span aria-hidden="true" className="mt-0.5 font-black text-primary">✓</span>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">No incluye</p>
                <ul className="mt-2 space-y-1.5">
                  {PAQUETE_GRADO.noIncluye.map((i) => (
                    <li key={i} className="flex gap-2 text-sm text-neutral-700">
                      <span aria-hidden="true" className="mt-0.5 font-black text-neutral-400">×</span>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-primary p-6 text-center text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-sky">Inversión</p>
            <p className="mt-1 font-sans text-5xl font-extrabold">{PAQUETE_GRADO.eur} €</p>
            <p className="mt-3 text-sm leading-snug text-white/85">{PAQUETE_GRADO.cuotas}</p>
            <BotonSesion ubicacion="paquete" className="mt-5 w-full">
              Reservar la sesión
            </BotonSesion>
            <p className="mt-3 text-xs text-white/70">
              Sesión diagnóstico: {SESION.eur} € · {SESION.usd} US$ · S/ {SESION.pen}
            </p>
          </div>
        </div>
      </div>

      <h3 id="pago-por-etapas" className="mt-12 scroll-mt-24 font-fraunces text-2xl font-bold text-primary">
        Pagas por etapas
      </h3>
      <ol className="mt-5 grid gap-3 md:grid-cols-4">
        {ETAPAS_PAGO.map((et, i) => (
          <li key={et.titulo} className="relative rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
            <div className="flex items-center justify-between gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun text-sm font-black text-primary">
                {i + 1}
              </span>
              <span className="text-primary">
                <Icono nombre={et.icono} size={20} />
              </span>
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">{et.cuando}</p>
            <p className="mt-0.5 font-bold leading-snug text-primary">{et.titulo}</p>
            <p className="mt-1 font-sans text-2xl font-extrabold text-primary">{et.importe}</p>
            <p className="mt-2 text-xs leading-relaxed text-neutral-700">{et.detalle}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-sky/60 bg-white p-5 sm:flex-row sm:items-center">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
          <Icono nombre="panel" size={24} />
        </span>
        <p className="text-sm leading-relaxed text-neutral-700">
          <strong className="text-primary">Todo en el {NOMBRE_PORTAL}.</strong> Tu hijo o hija sigue su caso en un portal
          propio que se instala como app: documentos, plazos, pagos y mensajes con su asesor, por escrito.
        </p>
        <a
          href="/plataforma"
          onClick={(e) => {
            e.preventDefault();
            navigate("/plataforma");
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
          className="shrink-0 text-sm font-bold text-primary-light underline underline-offset-4 hover:text-primary"
        >
          Conocer el portal
        </a>
      </div>
    </Seccion>
  );
}

// ── 6 · Visado o estancia ───────────────────────────────────────────────────
function VisaOEstancia() {
  return (
    <Seccion id="visado-o-estancia" fondo="bg-white">
      <Titulo
        eyebrow="Visado o estancia"
        titulo="Lo que cambia para la familia: cómo se demuestra el dinero"
      />
      <div className="mt-8 grid gap-4 rounded-3xl bg-primary p-6 text-white sm:p-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-sky">Mínimo a acreditar</p>
          <p className="mt-1 font-sans text-5xl font-extrabold leading-none">{IPREM_MES} €</p>
          <p className="mt-1 text-sm text-white/80">al mes (IPREM 2026) · unos {numero(IPREM_ANUAL)} € por año</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {VISA_ESTANCIA.comun.map((c) => (
            <li key={c.texto} className="flex gap-3 rounded-2xl bg-white/[0.07] p-4 text-sm leading-snug ring-1 ring-white/15">
              <span className="shrink-0 text-sun">
                <Icono nombre={c.icono} size={20} />
              </span>
              {c.texto}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {VISA_ESTANCIA.vias.map((v) => (
          <div key={v.id} className="flex flex-col rounded-3xl border border-neutral-200 p-6">
            <p className="font-fraunces text-xl font-bold text-primary">{v.titulo}</p>
            <p className="mt-1 text-sm font-semibold text-primary-light">{v.donde}</p>
            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-neutral-500">El dinero</p>
            <ul className="mt-2 space-y-2">
              {v.dinero.map((d) => (
                <li key={d} className="flex gap-2.5 text-sm leading-snug text-neutral-700">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-4 flex gap-2 text-sm text-neutral-700">
              <span className="shrink-0 text-primary">
                <Icono nombre="reloj" size={18} />
              </span>
              {v.plazo}
            </p>
            <p className="mt-3 rounded-xl bg-secondary-light px-3 py-2 text-sm text-primary">
              <strong>Conviene:</strong> {v.mejorPara}
            </p>
            <div className="mt-auto pt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Con Inspira</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {v.precios.map((p) => (
                  <li
                    key={p.nombre}
                    className={`rounded-full px-3 py-1.5 text-sm font-bold ${p.recomendado ? "bg-accent text-white" : "bg-secondary-light text-primary"}`}
                  >
                    {p.nombre} {p.eur} €{p.recomendado ? " · recomendada" : ""}
                  </li>
                ))}
              </ul>
              {v.extra && <p className="mt-2 text-xs text-neutral-600">{v.extra}</p>}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm">
        <a
          href="/visa-o-estancia"
          onClick={(e) => {
            e.preventDefault();
            navigate("/visa-o-estancia");
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
          className="inline-flex items-center gap-2 font-bold text-primary-light underline underline-offset-4 hover:text-primary"
        >
          <Icono nombre="brujula" size={18} />
          ¿No sabes cuál le corresponde? Haz el test en un minuto
        </a>
      </p>
    </Seccion>
  );
}

// ── 7 · Calendario ──────────────────────────────────────────────────────────
function Calendario() {
  return (
    <Seccion id="calendario" fondo="bg-secondary-light">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Titulo eyebrow="Calendario 2027/2028" titulo="Cuándo pasa cada cosa" />
        <Orientativo>Fechas estimadas</Orientativo>
      </div>
      <ol className="relative mt-8 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {CALENDARIO.map((c) => (
          <li
            key={c.titulo}
            className={`rounded-2xl p-4 ${c.soloExamen ? "bg-white/60 ring-1 ring-neutral-200" : "bg-white ring-1 ring-sky/60"}`}
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.soloExamen ? "bg-neutral-200 text-neutral-700" : "bg-primary text-white"}`}>
              <Icono nombre={c.icono} size={18} />
            </span>
            <p className="mt-3 text-xs font-bold text-accent-dark">{c.fecha}</p>
            <p className="mt-0.5 font-bold leading-snug text-primary">{c.titulo}</p>
            <p className="mt-1 text-xs leading-snug text-neutral-700">{c.texto}</p>
            {c.soloExamen && (
              <span className="mt-2 inline-block rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-700">
                Solo con examen
              </span>
            )}
          </li>
        ))}
      </ol>
    </Seccion>
  );
}

// ── 8 · Becas ───────────────────────────────────────────────────────────────
function Becas() {
  return (
    <Seccion id="becas" fondo="bg-white">
      <Titulo
        eyebrow="Becas"
        titulo="Becas: lo que sí y lo que no"
        intro="Preferimos decírtelo claro desde el principio, para que el plan de la familia no dependa de una ayuda que no llegará."
      />
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {BECAS.map((b) => (
          <li key={b.titulo} className="rounded-3xl border border-neutral-200 p-6">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                b.tono === "no" ? "bg-neutral-200 text-neutral-700" : "bg-sun/30 text-primary"
              }`}
            >
              {b.estado}
            </span>
            <p className="mt-3 font-bold leading-snug text-primary">{b.titulo}</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">{b.texto}</p>
          </li>
        ))}
      </ul>
    </Seccion>
  );
}

// ── 9 · Preguntas de los padres ─────────────────────────────────────────────
function Preguntas() {
  return (
    <Seccion id="preguntas" fondo="bg-secondary-light" ancho="max-w-3xl">
      <Titulo eyebrow="Preguntas de los padres" titulo="Lo que más nos preguntan las familias" />
      <div className="mt-8 space-y-3">
        {FAQ.map((f, i) => (
          <details
            key={f.id}
            open={i === 0}
            onToggle={(e) => e.currentTarget.open && evento("grado_faq", { pregunta: f.id })}
            className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
              <span className="font-bold leading-snug text-primary">{f.q}</span>
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-light text-lg leading-none text-primary transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-sm leading-relaxed text-neutral-700">{f.a}</p>
          </details>
        ))}
      </div>
    </Seccion>
  );
}

// ── 10 · CTA final y fuentes ────────────────────────────────────────────────
function CtaFinal() {
  return (
    <section id="reservar" className="scroll-mt-24 bg-primary px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <Titulo
          oscuro
          centrado
          eyebrow="Primer paso"
          titulo="Hablemos del plan de tu hijo o hija"
          intro={`En la sesión diagnóstico (30 minutos online, ${SESION.eur} €) revisamos su perfil, la vía de acceso, la vía migratoria y el presupuesto de la familia, y te llevas el plan por escrito.`}
        />
        <div className="mt-8 flex flex-col items-center gap-4">
          <BotonSesion ubicacion="final" className="w-full sm:w-auto" />
          <EnlaceWhatsapp ubicacion="final" oscuro />
          <a
            href="/mapa-estudiar-en-espana"
            onClick={(e) => {
              e.preventDefault();
              evento("grado_mapa", { ubicacion: "final" });
              navigate("/mapa-estudiar-en-espana");
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky underline underline-offset-4 hover:text-white"
          >
            <Icono nombre="mapa" size={18} />
            Explora el mapa de comunidades, ciudades y universidades
          </a>
        </div>
      </div>
    </section>
  );
}

function Fuentes() {
  return (
    <section aria-label="Fuentes" className="bg-white px-4 py-10 min-[380px]:px-5 sm:px-6">
      <div className="mx-auto max-w-6xl text-xs leading-relaxed text-neutral-600">
        <p>{DESCARGO}</p>
        <p className="mt-2">
          Fuente: {META.documento}, elaborado por Inspira el {META.fechaElaboracion.split("-").reverse().join("/")} con
          normas oficiales de cada comunidad, webs de las universidades, UNEDasiss y el BOE. Coste de vida: {FUENTE_VIDA.documento} (Fotocasa, idealista y operadores de
          transporte; estimación de Inspira). Medios económicos: IPREM 2026,{" "}
          {IPREM_MES} € al mes. Precios de Inspira vigentes para 2027/2028.
        </p>
        <details className="mt-3">
          <summary className="cursor-pointer font-bold text-primary">Ver las {TODAS_FUENTES.length} fuentes</summary>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {TODAS_FUENTES.map((f) => (
              <li key={f.id + f.url} className="min-w-0 truncate">
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">
                  {f.titulo}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}

export default function GradoEspana() {
  return (
    <main className="w-full overflow-x-hidden bg-white">
      <PageHero
        etiqueta="Guía para familias · Grado en España"
        icono="usuarios"
        titulo="¿Cuánto cuesta que tu hijo estudie"
        destacado="una carrera en España?"
        descripcion="Matrícula, acceso, vida y trámites con cifras verificadas, un simulador para calcular la inversión año a año y el paquete con el que lo acompañamos."
      >
        <BotonSesion ubicacion="hero" />
        <a
          href="#simulador"
          onClick={(e) => irA(e, "simulador")}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white ring-1 ring-white/40 transition hover:bg-white/10"
        >
          <Icono nombre="euro" size={18} />
          Calcular la inversión
        </a>
      </PageHero>

      <Cifras />

      <Seccion id="simulador" fondo="bg-white">
        <Titulo
          eyebrow="Simulador de inversión"
          titulo="Calcula la inversión, año a año"
          intro="Elige la universidad, los años y la vía. Verás qué se paga a la universidad, qué a los organismos oficiales y qué a Inspira."
        />
        <div className="mt-8">
          <SimuladorGrado />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-neutral-600">{DESCARGO}</p>
      </Seccion>

      <Seccion id="publica-o-privada" fondo="bg-secondary-light">
        <Titulo
          eyebrow="Pública o privada"
          titulo="Cuánto cambia según la universidad"
          intro="Para quien no es residente, la misma carrera pública cuesta muy distinto según la comunidad. Y una privada económica puede costar casi lo mismo que una pública de Madrid."
        />
        <div className="mt-8">
          <Comparativa />
        </div>
      </Seccion>

      <Seccion id="vivir-en-espana" fondo="bg-white">
        <Titulo
          eyebrow="Vivir en España"
          titulo="Lo que gasta al mes un estudiante"
          intro={`Habitación en piso compartido, comida, transporte y móvil, ciudad por ciudad. La ley pide acreditar al menos ${IPREM_MES} € al mes, pero en las ciudades caras el gasto real es mayor.`}
        />
        <div className="mt-8">
          <VidaEspana />
        </div>
      </Seccion>

      <Requisitos />
      <Paquete />
      <VisaOEstancia />
      <Calendario />
      <Becas />
      <Preguntas />
      <CtaFinal />
      <Fuentes />
    </main>
  );
}
