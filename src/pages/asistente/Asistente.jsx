// src/pages/asistente/Asistente.jsx
// Diagnóstico guiado: el visitante avanza por preguntas encadenadas y termina
// con un plan personalizado (vía, plazos, documentos y servicios). Todo el
// contenido vive en config/diagnostico.js; aquí solo está la experiencia.
import { useState } from "react";
import { getNodo, getResultado } from "../../config/diagnostico";
import { getServicio, hrefServicio } from "../../config/servicios";
import Icono from "../../components/common/Icono";
import BotonAsesoria from "../../components/common/BotonAsesoria";
import EnviarPlan from "../../components/common/EnviarPlan";
import PageHero from "../../components/layout/PageHero";
import SigueExplorando from "../../components/layout/SigueExplorando";
import { navigate } from "../../services/navigate";
import { CALENDLY_URL, whatsappUrl } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

// Profundidad típica del árbol: sirve para la barra de progreso.
const PASOS_ESTIMADOS = 4;

export default function Asistente() {
  const [nodoId, setNodoId] = useState("inicio");
  const [historial, setHistorial] = useState([]); // [{nodoId, pregunta, resp}]
  const [resultadoId, setResultadoId] = useState(null);

  const nodo = getNodo(nodoId);
  const resultado = resultadoId ? getResultado(resultadoId) : null;
  const paso = historial.length + 1;
  const progreso = resultado
    ? 100
    : Math.min(90, ((paso - 1) / PASOS_ESTIMADOS) * 100);

  const responder = (op) => {
    setHistorial((h) => [
      ...h,
      { nodoId, pregunta: nodo.pregunta, resp: op.txt },
    ]);
    if (op.res) {
      setResultadoId(op.res);
      registrarEvento("diagnostico_completado", {
        via: getResultado(op.res)?.via,
        pasos: historial.length + 1,
      });
    }
    else setNodoId(op.ir);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const atras = () => {
    const ultimo = historial[historial.length - 1];
    if (!ultimo) return;
    if (resultado) setResultadoId(null);
    setNodoId(ultimo.nodoId);
    setHistorial((h) => h.slice(0, -1));
  };

  const reiniciar = () => {
    setNodoId("inicio");
    setHistorial([]);
    setResultadoId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resumenWhatsApp = resultado
    ? `Hola Inspira. Hice el diagnóstico en la web y me salió: ${resultado.via}.\n\n` +
      historial.map((h) => `· ${h.pregunta} ${h.resp}`).join("\n") +
      `\n\nQuiero agendar mi asesoría.`
    : "";

  return (
    <main className="w-full">
      <PageHero
        etiqueta="Diagnóstico gratuito"
        icono="brujula"
        titulo="Cuéntanos tu caso"
        destacado="y te decimos cuál es tu vía"
        descripcion="Unas pocas preguntas y sales con un plan: la vía que te corresponde, los plazos reales, los documentos que necesitas y por dónde empezar. Gratis y sin registro."
        accesos={[
          { icono: "brujula", label: "Ver todos los servicios", href: "/servicios" },
          { icono: "estrella", label: "Casos de éxito", href: "/casos-de-exito" },
          { icono: "euro", label: "Calculadora gratis", href: "/calculadora-master" },
        ]}
      />

      <section className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        {/* Progreso */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-widest">
            <span className="text-neutral-500">
              {resultado ? "Diagnóstico listo" : `Paso ${paso}`}
            </span>
            <span className="text-accent">{Math.round(progreso)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progreso}%`,
                background: "linear-gradient(90deg, #88C4FC, #FA943A)",
              }}
            />
          </div>
        </div>

        {/* Respuestas dadas */}
        {historial.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {historial.map((h, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[11.5px] font-semibold text-primary"
              >
                <Icono nombre="escudo" size={12} />
                {h.resp}
              </span>
            ))}
          </div>
        )}

        {!resultado ? (
          /* ── Pregunta ─────────────────────────────────────── */
          <div
            key={nodoId}
            className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg"
            style={{ animation: "v4-fade-up .4s cubic-bezier(.22,1,.36,1) both" }}
          >
            <div className="border-b border-neutral-200 bg-secondary-light px-6 py-5">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
                {nodo.titulo}
              </p>
              <h2 className="mt-1.5 font-display text-xl font-bold leading-snug text-primary md:text-2xl">
                {nodo.pregunta}
              </h2>
              {nodo.ayuda && (
                <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
                  {nodo.ayuda}
                </p>
              )}
            </div>

            <div className="grid gap-2.5 px-5 py-5 sm:px-6">
              {nodo.opciones.map((op) => (
                <button
                  key={op.txt}
                  type="button"
                  onClick={() => responder(op)}
                  className="group flex items-center gap-4 rounded-2xl border-2 border-neutral-200 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent/5 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-light text-sky-dark transition group-hover:bg-accent group-hover:text-white">
                    <Icono nombre={op.icono} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-bold text-neutral-900">
                      {op.txt}
                    </span>
                    {op.desc && (
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-neutral-600">
                        {op.desc}
                      </span>
                    )}
                  </span>
                  <span
                    className="shrink-0 text-accent transition group-hover:translate-x-1"
                    aria-hidden
                  >
                    →
                  </span>
                </button>
              ))}
            </div>

            {historial.length > 0 && (
              <div className="border-t border-neutral-100 px-6 py-3">
                <button
                  type="button"
                  onClick={atras}
                  className="text-[13px] font-semibold text-neutral-500 transition hover:text-primary"
                >
                  ← Volver a la pregunta anterior
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── Resultado ────────────────────────────────────── */
          <div
            key={resultadoId}
            style={{ animation: "v4-fade-up .45s cubic-bezier(.22,1,.36,1) both" }}
          >
            {/* Cabecera del plan */}
            <div className="overflow-hidden rounded-3xl border border-neutral-200 shadow-lg">
              <div className="relative overflow-hidden bg-primary px-6 py-7 text-white md:px-8">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sky/20 blur-3xl" />
                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-wide">
                    <Icono nombre="destello" size={12} />
                    Tu vía recomendada
                  </span>
                  <div className="mt-4 flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                      <Icono nombre={resultado.icono} size={26} />
                    </span>
                    <div>
                      <h2 className="font-display text-2xl font-black leading-tight md:text-3xl">
                        {resultado.titulo}
                      </h2>
                      <p className="mt-2 leading-relaxed text-white/75">
                        {resultado.resumen}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plazos */}
              <div className="grid gap-px bg-neutral-200 sm:grid-cols-2">
                {[
                  { i: "reloj", k: "Plazo del trámite", v: resultado.plazo },
                  { i: "calendario", k: "Cuándo empezar", v: resultado.empezar },
                ].map((d) => (
                  <div key={d.k} className="flex gap-3 bg-white px-6 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-light text-sky-dark">
                      <Icono nombre={d.i} size={17} />
                    </span>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wide text-neutral-500">
                        {d.k}
                      </p>
                      <p className="text-[13px] font-semibold leading-snug text-neutral-900">
                        {d.v}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Por qué */}
              <div className="border-t border-neutral-200 bg-white px-6 py-5 md:px-8">
                <p className="font-display text-sm font-bold text-primary">
                  Por qué esta vía encaja contigo
                </p>
                <ul className="mt-3 space-y-2">
                  {resultado.porQue.map((p) => (
                    <li
                      key={p}
                      className="flex gap-2.5 text-[13.5px] leading-relaxed text-neutral-700"
                    >
                      <span className="font-bold text-accent" aria-hidden>
                        ✓
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documentos */}
              <div className="border-t border-neutral-200 bg-secondary-light px-6 py-5 md:px-8">
                <p className="flex items-center gap-2 font-display text-sm font-bold text-primary">
                  <Icono nombre="documento" size={16} />
                  Lo que vas a necesitar
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {resultado.documentos.map((d) => (
                    <span
                      key={d}
                      className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[12.5px] text-neutral-700"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[11.5px] leading-relaxed text-neutral-500">
                  Lista orientativa: los requisitos exactos dependen de tu
                  consulado y de tu caso concreto.
                </p>
              </div>
            </div>

            {/* Captura de correo: el visitante se lleva su plan */}
            <EnviarPlan resultado={resultado} respuestas={historial} />

            {/* Servicios que lo resuelven */}
            {resultado.servicios?.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 font-display text-sm font-bold text-primary">
                  Servicios que resuelven esto
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {resultado.servicios.map((sid) => {
                    const s = getServicio(sid);
                    if (!s) return null;
                    return (
                      <a
                        key={sid}
                        href={hrefServicio(s)}
                        onClick={(e) => go(e, hrefServicio(s))}
                        className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-light text-sky-dark">
                          <Icono nombre="brujula" size={16} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13.5px] font-bold text-neutral-900">
                            {s.nombre}
                          </span>
                          <span className="mt-0.5 block text-[12px] leading-snug text-neutral-600">
                            {s.resumen}
                          </span>
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="mt-7 rounded-3xl bg-secondary-light p-6 text-center md:p-8">
              <h3 className="font-display text-xl font-bold text-primary md:text-2xl">
                Confírmalo con un abogado
              </h3>
              <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-neutral-700">
                Este diagnóstico es automático y orienta, pero no sustituye la
                revisión de tu caso. En 30 minutos un especialista te confirma
                la vía y te arma el plan definitivo.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <BotonAsesoria>Agenda tu asesoría 1:1</BotonAsesoria>
                <a
                  href={whatsappUrl(resumenWhatsApp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-6 py-3.5 font-extrabold text-primary transition hover:bg-white"
                >
                  <Icono nombre="chat" size={18} />
                  Enviar mi resultado por WhatsApp
                </a>
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-4 text-[13px]">
                <a
                  href={resultado.href}
                  onClick={(e) => go(e, resultado.href)}
                  className="font-bold text-primary hover:underline"
                >
                  Ver el servicio en detalle →
                </a>
                <button
                  type="button"
                  onClick={reiniciar}
                  className="font-semibold text-neutral-500 hover:text-primary"
                >
                  ↺ Empezar de nuevo
                </button>
                <button
                  type="button"
                  onClick={atras}
                  className="font-semibold text-neutral-500 hover:text-primary"
                >
                  ← Cambiar mi última respuesta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alternativa siempre visible */}
        {!resultado && (
          <p className="mt-6 text-center text-[13px] text-neutral-600">
            ¿Prefieres saltarte esto y hablar directamente con un abogado?{" "}
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary hover:underline"
            >
              Agenda tu asesoría
            </a>
          </p>
        )}
      </section>

      <SigueExplorando
        destinos={["servicios", "casos", "calculadora", "eventos"]}
      />
    </main>
  );
}
