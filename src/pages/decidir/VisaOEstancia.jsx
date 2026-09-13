// src/pages/decidir/VisaOEstancia.jsx
//
// VISA O ESTANCIA — el test rápido que se le manda a un cliente potencial.
//
// Cinco preguntas y un veredicto por cada vía, con el paquete que le conviene
// y su precio. Está pensado para llegar por WhatsApp: si pide más datos o se
// hace largo, se abandona a la mitad.
//
// Las reglas viven en config/visaOEstancia.js — aquí solo se pintan. Y el
// resultado NUNCA es un "no" a secas: siempre remata en la sesión diagnóstico.
import { useMemo, useState } from "react";
import PageHero from "../../components/layout/PageHero";
import Icono from "../../components/common/Icono";
import EnviarPlan from "../../components/common/EnviarPlan";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { SESION_DIAGNOSTICO, eur } from "../../config/metodo";
import { navigate } from "../../services/navigate";
import { registrarEvento } from "../../lib/analytics";
import {
  PREGUNTAS,
  COMPARATIVA,
  DESCARGO,
  evaluar,
  montoAcreditar,
  IPREM_ANUAL,
} from "../../config/visaOEstancia";

// ─────────────────────────────────────────────────────────────────────────────
// Piezas
// ─────────────────────────────────────────────────────────────────────────────

const SEMAFORO = {
  verde: {
    aro: "border-green-600",
    fondo: "bg-green-50",
    punto: "bg-green-600",
    texto: "text-green-700",
    icono: "escudo",
  },
  ambar: {
    aro: "border-accent",
    fondo: "bg-accent/[0.07]",
    punto: "bg-accent",
    texto: "text-accent-dark",
    icono: "reloj",
  },
  rojo: {
    aro: "border-neutral-300",
    fondo: "bg-neutral-100",
    punto: "bg-neutral-400",
    texto: "text-neutral-500",
    icono: "brujula",
  },
};

function Seccion({ id, fondo = "bg-white", children }) {
  return (
    <section id={id} className={`px-6 py-16 sm:py-20 ${fondo}`}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}

function Eyebrow({ children }) {
  return (
    <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
      {children}
    </span>
  );
}

function BotonCalendly({ children, className = "" }) {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-extrabold text-white shadow-lg shadow-accent/25 transition hover:scale-[1.03] hover:bg-accent-dark active:scale-95 ${className}`}
    >
      {children}
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// El test
// ─────────────────────────────────────────────────────────────────────────────

function Test({ onTerminar }) {
  const [paso, setPaso] = useState(0);
  const [resp, setResp] = useState({});

  const pregunta = PREGUNTAS[paso];
  const total = PREGUNTAS.length;

  function responder(valor) {
    const siguiente = { ...resp, [pregunta.id]: valor };
    setResp(siguiente);
    if (paso + 1 < total) setPaso(paso + 1);
    else {
      registrarEvento("visa_o_estancia_completado", { donde: siguiente.donde });
      onTerminar(siguiente);
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl sm:p-9">
      {/* Progreso */}
      <div className="mb-6">
        <div className="mb-2 flex items-baseline justify-between">
          <Eyebrow>
            Pregunta {paso + 1} de {total}
          </Eyebrow>
          <span className="text-xs font-semibold text-neutral-400">
            {pregunta.titulo}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${((paso + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="font-fraunces text-2xl font-bold leading-tight text-primary sm:text-3xl">
        {pregunta.pregunta}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        {pregunta.ayuda}
      </p>

      {pregunta.tipo === "fecha" ? (
        <PasoFecha onResponder={responder} />
      ) : (
        <div className="mt-6 grid gap-3">
          {pregunta.opciones.map((op) => (
            <button
              key={op.valor}
              type="button"
              onClick={() => responder(op.valor)}
              className="group flex items-center gap-4 rounded-2xl border border-neutral-200 px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent hover:bg-accent/[0.04] hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-light text-primary transition group-hover:bg-accent group-hover:text-white">
                <Icono nombre={op.icono} size={21} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-primary">{op.txt}</span>
                <span className="mt-0.5 block text-sm leading-snug text-neutral-500">
                  {op.desc}
                </span>
              </span>
              <span className="shrink-0 text-neutral-300 transition group-hover:translate-x-1 group-hover:text-accent">
                →
              </span>
            </button>
          ))}
        </div>
      )}

      {paso > 0 && (
        <button
          type="button"
          onClick={() => setPaso(paso - 1)}
          className="mt-6 text-xs font-semibold text-neutral-400 underline underline-offset-4 hover:text-neutral-600"
        >
          ← Volver
        </button>
      )}
    </div>
  );
}

// La fecha es la única pregunta que no se responde de un clic. Se permite
// saltarla: sin ella el test sigue sirviendo, solo pierde el aviso de plazos.
function PasoFecha({ onResponder }) {
  const [valor, setValor] = useState("");
  const hoy = new Date().toISOString().slice(0, 10);
  return (
    <div className="mt-6">
      <label
        htmlFor="inicio-clases"
        className="block text-sm font-semibold text-primary"
      >
        Fecha de inicio de clases
      </label>
      <input
        id="inicio-clases"
        type="date"
        min={hoy}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-base font-semibold text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onResponder(valor || null)}
          disabled={!valor}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-extrabold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          Ver mi resultado →
        </button>
        <button
          type="button"
          onClick={() => onResponder(null)}
          className="text-sm font-semibold text-neutral-500 underline underline-offset-4 hover:text-primary"
        >
          Todavía no lo sé
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// El resultado
// ─────────────────────────────────────────────────────────────────────────────

function TarjetaVia({ r, nombre, subtitulo }) {
  const s = SEMAFORO[r.nivel];
  return (
    <div className={`rounded-2xl border-2 p-6 ${s.aro} ${s.fondo}`}>
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${s.punto}`}
        >
          <Icono nombre={s.icono} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-fraunces text-xl font-bold text-primary">{nombre}</h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {subtitulo}
          </p>
          <p className={`mt-1.5 text-lg font-black ${s.texto}`}>{r.etiqueta}</p>
        </div>
      </div>

      {r.motivos.length > 0 && (
        <ul className="mt-5 space-y-2">
          {r.motivos.map((m) => (
            <li key={m} className="flex gap-2.5 text-sm text-neutral-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600/15 text-[11px] font-black text-green-700">
                ✓
              </span>
              <span className="leading-snug">{m}</span>
            </li>
          ))}
        </ul>
      )}

      {r.pendientes.length > 0 && (
        <div className="mt-4 border-t border-neutral-900/10 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            A tener en cuenta
          </p>
          <ul className="mt-2 space-y-2">
            {r.pendientes.map((p) => (
              <li key={p} className="flex gap-2.5 text-sm text-neutral-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                <span className="leading-snug">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Cuánto dinero hay que acreditar. Es la pregunta que sigue siempre al
// veredicto, así que va justo debajo y con la misma fórmula que usa el equipo.
function Monto() {
  const [larga, setLarga] = useState(true);
  const [meses, setMeses] = useState(9);
  const [matricula, setMatricula] = useState(0);
  const m = montoAcreditar({ larga, meses, matricula });

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <Icono nombre="euro" size={22} />
        </span>
        <div>
          <h3 className="font-fraunces text-lg font-bold text-primary">
            ¿Cuánto dinero tienes que acreditar?
          </h3>
          <p className="text-sm text-neutral-500">
            El monto es prácticamente el mismo en las dos vías. Lo que cambia es
            cómo se demuestra.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
            Duración del programa
          </p>
          <div className="flex gap-2">
            {[
              { v: true, t: "Más de 6 meses" },
              { v: false, t: "Menos de 6 meses" },
            ].map((o) => (
              <button
                key={String(o.v)}
                type="button"
                onClick={() => setLarga(o.v)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                  larga === o.v
                    ? "border-accent bg-accent/[0.07] text-accent-dark ring-1 ring-accent"
                    : "border-neutral-200 text-primary hover:border-accent/50"
                }`}
              >
                {o.t}
              </button>
            ))}
          </div>
          {!larga && (
            <label className="mt-3 block text-xs font-semibold text-neutral-500">
              ¿Cuántos meses?
              <input
                type="number"
                min={1}
                max={6}
                value={meses}
                onChange={(e) => setMeses(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-bold text-primary focus:border-accent focus:outline-none"
              />
            </label>
          )}
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">
            Matrícula pendiente de pagar (€)
          </span>
          <input
            type="number"
            min={0}
            step={50}
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-base font-bold text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <span className="mt-1 block text-xs text-neutral-400">
            Si ya la pagaste entera, déjalo en 0.
          </span>
        </label>
      </div>

      <div className="mt-5 rounded-2xl bg-primary p-5 text-white">
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/45">
          Monto orientativo a acreditar
        </p>
        <p className="mt-1 font-fraunces text-4xl font-bold">{eur(m.total)}</p>
        <ul className="mt-4 space-y-1.5 text-sm text-white/70">
          <li className="flex justify-between gap-3">
            <span>Manutención (100 % del IPREM)</span>
            <span className="font-bold text-white">{eur(m.manutencion)}</span>
          </li>
          {m.programa > 0 && (
            <li className="flex justify-between gap-3">
              <span>Matrícula pendiente</span>
              <span className="font-bold text-white">{eur(m.programa)}</span>
            </li>
          )}
          <li className="flex justify-between gap-3">
            <span>Billete de regreso (referencial)</span>
            <span className="font-bold text-white">{eur(m.vuelo)}</span>
          </li>
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-white/45">
          Cálculo orientativo sobre un IPREM anual de {eur(IPREM_ANUAL)}. Si
          viajas con familiares el monto sube (+75 % por el primero, +50 % por
          cada uno de los siguientes), y el consulado puede exigir el IPREM
          vigente del año en curso.
        </p>
      </div>
    </div>
  );
}

function Resultado({ resp, onReiniciar }) {
  const res = useMemo(() => evaluar(resp), [resp]);

  // Lo que viaja al correo del visitante y al aviso del equipo.
  const plan = {
    via: res.paquete.nombre,
    titulo: res.titular,
    resumen: res.porque,
    plazo:
      res.dias === null
        ? "Sin fecha de clases indicada"
        : res.dias < 0
          ? "Las clases ya empezaron"
          : `Faltan ${res.dias} días para el inicio de clases`,
    empezar: `Con la ${SESION_DIAGNOSTICO.nombre.toLowerCase()} (${SESION_DIAGNOSTICO.precioTexto})`,
    documentos: res.paquete.incluye,
  };

  const respuestasLegibles = PREGUNTAS.map((p) => {
    const valor = resp[p.id];
    if (p.tipo === "fecha") {
      return { pregunta: p.pregunta, resp: valor || "No lo sé todavía" };
    }
    const op = p.opciones.find((o) => o.valor === valor);
    return { pregunta: p.pregunta, resp: op ? op.txt : "Sin responder" };
  });

  const mensajeWhatsapp =
    `Mi resultado fue: "${res.titular}". Quiero agendar mi sesión diagnóstico.`;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Veredicto */}
      <div className="rounded-3xl bg-primary p-7 text-white sm:p-9">
        <Eyebrow>Tu resultado</Eyebrow>
        <h2 className="mt-3 font-fraunces text-3xl font-bold leading-tight sm:text-4xl">
          {res.titular}
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-white/70">{res.porque}</p>
      </div>

      {/* Las dos vías */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <TarjetaVia
          r={res.visa}
          nombre="Visa de estudios"
          subtitulo="Desde tu país, en el consulado"
        />
        <TarjetaVia
          r={res.estancia}
          nombre="Estancia por estudios"
          subtitulo="Desde España, ante Extranjería"
        />
      </div>

      {/* El paquete */}
      <div className="mt-6 overflow-hidden rounded-3xl border-2 border-accent bg-white">
        <div className="bg-accent px-6 py-2.5">
          <p className="text-xs font-black uppercase tracking-widest text-white">
            El paquete que te conviene
          </p>
        </div>
        <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_minmax(0,17rem)]">
          <div>
            <h3 className="font-fraunces text-2xl font-bold text-primary">
              {res.paquete.nombre}
            </h3>
            <p className="mt-0.5 text-sm font-semibold text-neutral-500">
              {res.paquete.subtitulo}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {res.paquete.incluye.slice(0, 8).map((i) => (
                <li key={i} className="flex gap-2.5 text-sm text-neutral-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="leading-snug">{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-secondary-light p-5 text-center">
            <p className="font-fraunces text-4xl font-bold text-primary">
              {res.paquete.desde && (
                <span className="mr-1 align-middle text-base font-sans font-bold text-neutral-500">
                  desde
                </span>
              )}
              {eur(res.paquete.precio)}
            </p>
            <BotonCalendly className="mt-4 w-full">
              Reservar mi sesión
            </BotonCalendly>
            <a
              href={whatsappDesde("visa-o-estancia", mensajeWhatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary px-5 py-3 text-sm font-extrabold text-primary transition hover:bg-secondary"
            >
              <Icono nombre="chat" size={17} />
              Escribir por WhatsApp
            </a>
            <p className="mt-3 text-xs leading-snug text-neutral-500">
              La sesión diagnóstico cuesta {SESION_DIAGNOSTICO.precioTexto} y de
              ahí sale tu propuesta por escrito.
            </p>
          </div>
        </div>
      </div>

      {/* Cuánto dinero */}
      <div className="mt-6">
        <Monto />
      </div>

      {/* Llevarse el resultado por correo */}
      <EnviarPlan resultado={plan} respuestas={respuestasLegibles} />

      <p className="mt-8 rounded-2xl bg-neutral-100 p-5 text-xs leading-relaxed text-neutral-500">
        {DESCARGO}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onReiniciar}
          className="text-sm font-bold text-primary underline underline-offset-4 hover:text-accent"
        >
          ← Volver a hacer el test
        </button>
        <a
          href="/servicios/master#pago-por-etapas"
          onClick={(e) => {
            e.preventDefault();
            navigate("/servicios/master#pago-por-etapas");
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
          className="text-sm font-bold text-primary underline underline-offset-4 hover:text-accent"
        >
          Ver el pago por etapas y los precios →
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────────────────────

export default function VisaOEstancia() {
  const [resp, setResp] = useState(null);

  return (
    <main className="w-full bg-white">
      <PageHero
        etiqueta="Calculadora rápida"
        icono="brujula"
        titulo="¿Visa o estancia?"
        destacado="Averígualo en un minuto."
        descripcion="Cinco preguntas y te decimos si calificas para el visado de estudios, para la estancia por estudios, y qué paquete te conviene contratar. Sin registrarte."
        accesos={[
          { icono: "birrete", label: "Pago por etapas", href: "/servicios/master#pago-por-etapas" },
          { icono: "euro", label: "Calculadora de máster", href: "/calculadora-master" },
          { icono: "robot", label: "Asistente completo", href: "/asistente" },
        ]}
      />

      <Seccion id="test" fondo="bg-secondary-light">
        {resp ? (
          <Resultado resp={resp} onReiniciar={() => setResp(null)} />
        ) : (
          <Test onTerminar={setResp} />
        )}
      </Seccion>

      {/* Comparativa: sirve aunque nadie haga el test, y es lo que se busca
          en Google ("visa de estudios o estancia por estudios"). */}
      <Seccion fondo="bg-white">
        <div className="mb-10 max-w-3xl">
          <Eyebrow>Las dos vías, lado a lado</Eyebrow>
          <h2 className="mt-3 font-fraunces text-3xl font-bold leading-tight text-primary sm:text-4xl">
            Mismo permiso,{" "}
            <span className="text-accent">dos formas de conseguirlo</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-700">
            Las dos terminan en el mismo sitio: permiso de estudiante con
            derecho a trabajar 30 horas semanales. Lo que cambia es dónde se
            presenta, qué te piden para el dinero y cuánto tarda.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200">
          {/* Cabecera de las dos columnas */}
          <div className="grid grid-cols-1 gap-px bg-neutral-200 sm:grid-cols-[minmax(0,11rem)_1fr_1fr]">
            <div className="hidden bg-secondary-light p-4 sm:block" />
            <div className="bg-primary p-4">
              <p className="font-fraunces text-lg font-bold text-white">
                Visa de estudios
              </p>
              <p className="text-xs text-white/55">Desde tu país</p>
            </div>
            <div className="bg-primary-light p-4">
              <p className="font-fraunces text-lg font-bold text-white">
                Estancia por estudios
              </p>
              <p className="text-xs text-white/55">Desde España</p>
            </div>

            {COMPARATIVA.map((f) => (
              <div key={f.criterio} className="contents">
                <div className="flex items-center gap-2.5 bg-secondary-light p-4">
                  <Icono nombre={f.icono} size={18} />
                  <span className="text-sm font-bold text-primary">
                    {f.criterio}
                  </span>
                </div>
                <div className="bg-white p-4 text-sm leading-relaxed text-neutral-700">
                  <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-neutral-400 sm:hidden">
                    Visa
                  </span>
                  {f.visa}
                </div>
                <div className="bg-white p-4 text-sm leading-relaxed text-neutral-700">
                  <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-neutral-400 sm:hidden">
                    Estancia
                  </span>
                  {f.estancia}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-neutral-500">
          Si ninguna de las dos columnas te describe del todo, no fuerces la
          decisión: en la sesión diagnóstico revisamos tu consulado, tus fechas
          y tus documentos, y te decimos cuál te conviene con tu caso delante.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <BotonCalendly>
            Reservar sesión diagnóstico · {SESION_DIAGNOSTICO.precioTexto}
          </BotonCalendly>
          <a
            href="/servicios/master#pago-por-etapas"
            onClick={(e) => {
              e.preventDefault();
              navigate("/servicios/master#pago-por-etapas");
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-6 py-3.5 font-extrabold text-primary transition hover:bg-secondary"
          >
            Ver todos los paquetes y precios
          </a>
        </div>
      </Seccion>
    </main>
  );
}
