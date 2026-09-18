// src/pages/doctorado/DoctoradoEspana.jsx
//
// /doctorado-en-espana — venta del servicio de Doctorado (18/09/2026). El
// doctorado es residencia desde el Criterio DGGM 2/2026: el camino más corto
// para quien ya tiene maestría. Mapa de coste anual y programas por comunidad
// (/api/doctorados/mapa), de lo que nos encargamos, paquetes, proceso,
// requisitos, nacionalidad y preguntas. Contenido: config/doctoradoEspana.js.
// El catálogo de programas es interno: aquí solo agregados.
import PageHero from "../../components/layout/PageHero";
import Icono from "../../components/common/Icono";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { CIFRAS, POR_QUE, NOS_ENCARGAMOS, PAQUETES, PASOS, REQUISITOS, NACIONALIDAD, FAQ, DESCARGO } from "../../config/doctoradoEspana";
import { Seccion, Titulo, Orientativo, evento } from "../grado/piezas";
import MapaDoctoradoPublico from "./MapaDoctoradoPublico";

const WHATSAPP = whatsappDesde("doctorado-espana", "Quiero información del servicio de Doctorado en España.");
const waPlan = (nombre) => whatsappDesde("doctorado-espana", `Me interesa el paquete ${nombre}. ¿Cómo empiezo?`);

function BotonSesion({ ubicacion, children = "Reservar la sesión diagnóstico", className = "" }) {
  return (
    <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" onClick={() => evento("doctorado_cta_sesion", { ubicacion })}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-center font-bold text-white shadow-lg shadow-accent/25 transition hover:scale-[1.02] hover:bg-accent-dark active:scale-95 ${className}`}>
      <Icono nombre="calendario" size={18} />{children}
    </a>
  );
}

function irA(e, id) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  evento("doctorado_ancla", { destino: id });
}

function Tarjetas({ items, oscuro = false }) {
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
      {items.map((t) => (
        <li key={t.titulo} className={`rounded-2xl p-5 ${oscuro ? "bg-white/10 ring-1 ring-white/15" : "bg-white ring-1 ring-neutral-200"}`}>
          <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${oscuro ? "bg-accent text-white" : "bg-secondary-light text-primary"}`}>
            <Icono nombre={t.icono} size={22} />
          </span>
          <h3 className={`mt-3 text-lg font-bold ${oscuro ? "text-white" : "text-primary"}`}>{t.titulo}</h3>
          <p className={`mt-1 text-sm leading-relaxed ${oscuro ? "text-white/80" : "text-neutral-700"}`}>{t.texto}</p>
        </li>
      ))}
    </ul>
  );
}

export default function DoctoradoEspana() {
  return (
    <main className="w-full overflow-x-hidden bg-white">
      <PageHero
        etiqueta="Doctorado en España · Residencia desde el primer día"
        icono="birrete"
        titulo="Tu doctorado en España,"
        destacado="con residencia desde el primer día"
        descripcion="Desde 2026 el doctorado ya no es estancia: es residencia para investigación. Cuenta para la nacionalidad, puedes venir con tu familia y la tramitamos contigo de principio a fin."
      >
        <BotonSesion ubicacion="hero" />
        <a href="#mapa" onClick={(e) => irA(e, "mapa")}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white ring-1 ring-white/40 transition hover:bg-white/10">
          <Icono nombre="mapa" size={18} />Ver el mapa de costes
        </a>
      </PageHero>

      <section aria-label="Cifras clave" className="border-b border-neutral-200 bg-secondary-light px-4 py-8 min-[380px]:px-5 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            {CIFRAS.map((t) => (
              <li key={t.texto} className="rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
                <p className="font-sans text-[28px] font-extrabold leading-none text-primary sm:text-3xl">{t.valor}</p>
                <p className="mt-2 text-sm font-semibold leading-snug text-neutral-900">{t.texto}</p>
                <p className="mt-1 text-xs text-neutral-500">{t.detalle}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Seccion id="por-que" fondo="bg-white">
        <Titulo eyebrow="Por qué ahora" titulo="El doctorado cambió: ahora es residencia"
          intro="Para quien ya tiene maestría, es la vía más completa para vivir en España: estudias, investigas, vienes con tu familia y sumas tiempo para la nacionalidad." />
        <Tarjetas items={POR_QUE} />
      </Seccion>

      <Seccion id="mapa" fondo="bg-secondary-light">
        <Titulo eyebrow="Mapa de doctorados" titulo="Cuánto cuesta un año, comunidad por comunidad"
          intro="Lo que paga un estudiante extranjero al año en la universidad pública y cuántos programas presenciales hay en cada comunidad y ciudad." />
        <div className="mt-8"><MapaDoctoradoPublico onElegir={(id) => evento("doctorado_mapa", { comunidad: id })} /></div>
        <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
          <Orientativo />Tutela académica anual (curso 2026-27). Además, una vez: apertura de expediente, defensa de tesis y título. En privadas, entre 425 € y 3.640 € al año.
        </p>
      </Seccion>

      <Seccion id="nos-encargamos" fondo="bg-primary">
        <Titulo oscuro eyebrow="De lo que nos encargamos" titulo="Del primer correo al director a tu TIE"
          intro="Tú pones la investigación. Nosotros, todo lo demás: programas, plazos, papeles, residencia y familia." />
        <Tarjetas items={NOS_ENCARGAMOS} oscuro />
      </Seccion>

      <Seccion id="paquetes" fondo="bg-white">
        <Titulo eyebrow="Paquetes" titulo="Normalmente se postula a 1–3 programas"
          intro="Pagas el paquete de doctorado al empezar y la residencia cuando tienes tu matrícula." />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PAQUETES.map((p) => (
            <li key={p.nombre} className={`flex flex-col rounded-2xl p-5 ${p.destacado ? "bg-primary text-white" : "bg-white ring-1 ring-neutral-200"}`}>
              {p.destacado && <span className="mb-2 self-start rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Recomendado</span>}
              <h3 className={`text-lg font-bold ${p.destacado ? "text-white" : "text-primary"}`}>{p.nombre}</h3>
              <p className={`text-sm font-semibold ${p.destacado ? "text-sky" : "text-neutral-500"}`}>{p.alcance}</p>
              <p className={`mt-3 text-4xl font-extrabold ${p.destacado ? "text-white" : "text-primary"}`}>{p.precio} €</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {p.puntos.map((x) => (
                  <li key={x} className="flex gap-2"><span className={p.destacado ? "text-accent" : "text-primary-light"}><Icono nombre="check" size={16} /></span>
                    <span className={p.destacado ? "text-white/90" : "text-neutral-700"}>{x}</span></li>
                ))}
              </ul>
              <a href={waPlan(p.nombre)} target="_blank" rel="noopener noreferrer" onClick={() => evento("doctorado_plan", { plan: p.nombre })}
                className={`mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl font-bold ${p.destacado ? "bg-white text-primary" : "bg-accent text-white"}`}>
                <Icono nombre="whatsapp" size={18} />Lo quiero
              </a>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion id="proceso" fondo="bg-secondary-light">
        <Titulo eyebrow="Cómo funciona" titulo="De 10 a 14 meses hasta tu llegada"
          intro="Para empezar en octubre, lo ideal es arrancar en noviembre del año anterior. Varias universidades tienen un segundo plazo entre enero y marzo." />
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PASOS.map(([t, d], i) => (
            <li key={t} className="flex gap-3 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent font-extrabold text-white">{i + 1}</span>
              <div><h3 className="font-bold text-primary">{t}</h3><p className="mt-1 text-sm text-neutral-700">{d}</p></div>
            </li>
          ))}
        </ol>
      </Seccion>

      <Seccion id="requisitos" fondo="bg-white">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Titulo eyebrow="Requisitos" titulo="Lo que necesitas" />
            <ul className="mt-6 space-y-3">
              {REQUISITOS.map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed text-neutral-800"><span className="mt-0.5 text-primary-light"><Icono nombre="check" size={18} /></span>{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-primary p-6 text-white sm:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent"><Icono nombre="bandera" size={24} /></span>
            <h3 className="mt-4 font-fraunces text-2xl font-bold">{NACIONALIDAD.titulo}</h3>
            <p className="mt-3 leading-relaxed text-white/85">{NACIONALIDAD.texto}</p>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" onClick={() => evento("doctorado_whatsapp", { ubicacion: "nacionalidad" })}
              className="mt-5 inline-flex items-center gap-2 font-semibold text-white underline underline-offset-4">
              <Icono nombre="chat" size={18} />Pregúntanos por tu caso
            </a>
          </div>
        </div>
      </Seccion>

      <Seccion id="preguntas" fondo="bg-secondary-light" ancho="max-w-3xl">
        <Titulo eyebrow="Preguntas frecuentes" titulo="Lo que más nos preguntan" centrado />
        <div className="mt-8 space-y-3">
          {FAQ.map(([p, r]) => (
            <details key={p} className="group rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
              <summary className="cursor-pointer list-none font-bold text-primary">{p}</summary>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">{r}</p>
            </details>
          ))}
        </div>
      </Seccion>

      <Seccion id="empieza" fondo="bg-primary" ancho="max-w-3xl">
        <div className="text-center">
          <Titulo oscuro centrado eyebrow="Tu siguiente paso" titulo="Empieza con tu sesión diagnóstico"
            intro="30 minutos con un abogado especialista: vemos tu maestría, la vía que te corresponde y los programas que encajan contigo." />
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <BotonSesion ubicacion="final" />
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" onClick={() => evento("doctorado_whatsapp", { ubicacion: "final" })}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 underline underline-offset-4 hover:text-white">
              <Icono nombre="whatsapp" size={18} />Escríbenos por WhatsApp
            </a>
          </div>
          <p className="mt-8 text-xs leading-relaxed text-white/60">{DESCARGO}</p>
        </div>
      </Seccion>
    </main>
  );
}
