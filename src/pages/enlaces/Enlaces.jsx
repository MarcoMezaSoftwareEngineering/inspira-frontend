// src/pages/enlaces/Enlaces.jsx
//
// Página de enlaces para las biografías de redes: sustituye a Linktree
// (https://linktr.ee/inspira_educa) desde el 15/09/2026. Sin cabecera, pie ni
// barras del sitio (LANDING_ADS_PATHS en App.jsx) y sin indexar.
//
// Rediseño del mismo día (la clienta la quería más bonita e interactiva):
// imágenes de las páginas (las de /og), beca con cuenta atrás, reserva de
// asesoría con opciones que se eligen, opiniones que rotan, carrusel de
// recursos gratuitos, visado y estancia, y fondo animado. Todo respeta
// prefers-reduced-motion.
//
// Medición: los enlaces internos llevan utm_source=enlaces y cada botón manda
// un evento ENLACE a Inspira Core (origen_detalle = qué botón), solo con
// consentimiento de analítica (lib/analytics).
// Redes y correo, copiados del Linktree el 15/09/2026; el número es la línea
// única de la web (config/contacto.js). Opiniones: literales y completas de
// config/testimonios.js, sin enlazar la ficha de Google (clienta: no poner a
// mano el botón de escribir reseña).
import { useEffect, useRef, useState } from "react";
import logo from "../../assets/images/logo.png";
import { CALENDLY_URL, LINEAS, whatsappDesde } from "../../config/contacto";
import { OPCIONES_ASESORIA, PROMO_GRATIS, promoVigente } from "../../config/asesorias";
import { CIFRAS, estadoPostulacion } from "../../config/bicentenario2026";
import { getServicio, hrefServicio } from "../../config/servicios";
import { TESTIMONIOS } from "../../config/testimonios";
import { enviarEventoEmbudo } from "../../lib/analytics";

const UTM = "utm_source=enlaces&utm_medium=bio";
/** Ruta interna con utm (antes del #, si lo hay). */
const interno = (ruta) => {
  const [base, hash] = ruta.split("#");
  return `${base}${base.includes("?") ? "&" : "?"}${UTM}${hash ? `#${hash}` : ""}`;
};
const BECA = interno("/beca-generacion-bicentenario-2026");
const marcar = (clave) => enviarEventoEmbudo("ENLACE", { origen_detalle: clave });

// Línea única de la web, atendida por el equipo de Perú y España.
const NUMERO = LINEAS[0].numero;
const TEL = `tel:+${NUMERO.replace(/\D/g, "")}`;

const hrefDe = (id) => {
  const s = getServicio(id);
  return s ? hrefServicio(s) : "/servicios";
};

const RECURSOS = [
  {
    clave: "recurso:mapa",
    img: "/og/mapa-estudiar-en-espana.jpg",
    titulo: "Mapa de universidades y costos de máster",
    texto: "Cuánto cuesta un máster en cada ciudad de España",
    href: interno("/mapa-estudiar-en-espana"),
  },
  {
    clave: "recurso:grado",
    img: "/og/grado-en-espana.jpg",
    titulo: "Grado en España: guía para familias",
    texto: "Cuánto cuesta que tu hijo estudie una carrera",
    href: interno("/grado-en-espana"),
  },
  {
    clave: "recurso:calculadora",
    img: "/og/calculadora-master.jpg",
    titulo: "Calculadora: encuentra gratis tu máster",
    texto: "Másteres oficiales en España según tu perfil",
    href: interno("/calculadora-master"),
  },
  {
    clave: "recurso:visa-o-estancia",
    emoji: "🧭",
    titulo: "Test: ¿visa o estancia por estudios?",
    texto: "Descubre qué camino te conviene según tu caso",
    href: interno("/visa-o-estancia"),
  },
];

const SERVICIOS = [
  { clave: "servicio:visado", emoji: "🛂", titulo: "Visado de estudios", texto: "Te acompañamos en todo el trámite", href: interno(hrefDe("visa-estudios")) },
  { clave: "servicio:estancia", emoji: "🏠", titulo: "Estancia por estudios", texto: "El trámite desde España, paso a paso", href: interno(hrefDe("estancia-estudios")) },
];

// El portal va a /plataforma, como «Mi portal» de la barra inferior sin sesión.
const ENLACES = [
  { clave: "eventos", emoji: "🎤", titulo: "Eventos y charlas gratuitas", href: interno("/eventos") },
  { clave: "portal", emoji: "📱", titulo: "Mi portal: acceso para asesorados", href: interno("/plataforma") },
  { clave: "web", emoji: "🌎", titulo: "Nuestra web oficial", href: interno("/") },
];

// Solo las opiniones cortas: se citan completas, nunca recortadas.
const OPINIONES = TESTIMONIOS.filter((t) => t.texto.length <= 260);

const REDES = [
  {
    nombre: "Instagram",
    href: "https://instagram.com/inspira_educa_",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    nombre: "TikTok",
    href: "https://tiktok.com/@abogadainternacionalista",
    icono: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.8a5.7 5.7 0 1 0 4.91 5.64V9.01a7.33 7.33 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.24-1.48z" />
      </svg>
    ),
  },
  {
    nombre: "Facebook",
    href: "https://www.facebook.com/people/Inspira/61560309818697/",
    icono: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z" />
      </svg>
    ),
  },
  {
    nombre: "LinkedIn",
    href: "https://www.linkedin.com/company/inspira-educa/",
    icono: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9.5h4V21H3zM10 9.5h3.8v1.6h.05c.53-1 1.84-2.1 3.8-2.1 4.06 0 4.35 2.67 4.35 6.15V21h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75V21h-4z" />
      </svg>
    ),
  },
  {
    nombre: "Correo",
    href: "mailto:asesorias@inspira-educa.org",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
];

const ESTILOS = `
@keyframes enl-sube { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes enl-aparece { from { opacity: 0; } to { opacity: 1; } }
@keyframes enl-barrido { 0%, 60% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
@keyframes enl-gira { to { transform: rotate(360deg); } }
@keyframes enl-fondo { from { background-position: 0% 0%, 0% 50%; } to { background-position: 0% 0%, 100% 50%; } }
@keyframes enl-latido { 0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, .7); } 100% { box-shadow: 0 0 0 9px rgba(74, 222, 128, 0); } }
.enl-fondo {
  background:
    radial-gradient(900px 520px at 85% -8%, rgba(27, 141, 181, .85) 0%, transparent 60%),
    linear-gradient(135deg, #013446, #02506B, #0A5873, #013446);
  background-size: auto, 300% 300%;
  animation: enl-fondo 16s ease-in-out infinite alternate;
}
.enl-sube { animation: enl-sube .6s cubic-bezier(.22, 1, .36, 1) both; animation-delay: var(--d, 0ms); }
.enl-aparece { animation: enl-aparece .5s ease both; }
.enl-brillo { position: relative; overflow: hidden; }
.enl-brillo::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, .45) 50%, transparent 70%); transform: translateX(-120%); animation: enl-barrido 3.8s ease-in-out infinite; }
.enl-vidrio { border: 1px solid transparent; background: linear-gradient(160deg, rgba(255, 255, 255, .14), rgba(255, 255, 255, .05)) padding-box, linear-gradient(135deg, rgba(255, 255, 255, .45), rgba(255, 255, 255, .06) 45%, rgba(250, 148, 58, .5)) border-box; }
.enl-anillo { position: relative; isolation: isolate; }
.enl-anillo::before { content: ""; position: absolute; inset: -5px; z-index: -1; border-radius: 9999px; background: conic-gradient(#FA943A, #96CCFC, #FFC940, #FA943A); animation: enl-gira 6s linear infinite; }
.enl-latido { animation: enl-latido 1.6s ease-out infinite; }
.enl-carrusel { scroll-snap-type: x mandatory; scrollbar-width: none; }
.enl-carrusel::-webkit-scrollbar { display: none; }
.enl-carrusel > * { scroll-snap-align: start; }
@media (prefers-reduced-motion: reduce) {
  .enl-fondo, .enl-sube, .enl-aparece, .enl-anillo::before, .enl-latido { animation: none; }
  .enl-brillo::after { display: none; }
}
`;

function Flecha({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`h-4 w-4 shrink-0 ${className}`} aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function Rotulo({ children, style }) {
  return (
    <p className="enl-sube mt-8 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white/65" style={style}>
      {children}
    </p>
  );
}

const dias = (n) => `${n} ${n === 1 ? "día" : "días"}`;

function BannerBeca({ style }) {
  const est = estadoPostulacion();
  const faltan = est.objetivo ? Math.max(0, Math.ceil((est.objetivo - Date.now()) / 86400000)) : 0;
  const vivo =
    est.fase === "antes" ? `Abre en ${dias(faltan)}` : est.fase === "abierta" ? `Abierta · cierra en ${dias(faltan)}` : "Postulación cerrada";
  return (
    <section aria-label="Beca Generación del Bicentenario 2026" className="enl-sube mt-6 overflow-hidden rounded-3xl bg-primary-dark shadow-2xl ring-1 ring-white/15" style={style}>
      <a href={BECA} onClick={() => marcar("beca:imagen")} className="block">
        <img
          src="/og/beca-generacion-bicentenario-2026.jpg"
          alt="Beca Generación del Bicentenario 2026: solo 20 becas"
          className="aspect-[1200/630] w-full object-cover"
          decoding="async"
        />
      </a>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary-dark">🔥 Solo {CIFRAS.total} becas</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/20">
            <span className="enl-latido h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
            {vivo}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={`${BECA}#simulador`}
            onClick={() => marcar("beca:simulador")}
            className="enl-brillo flex items-center justify-center gap-1.5 rounded-xl bg-accent px-2 py-3 text-sm font-extrabold text-primary-dark shadow-lg shadow-accent/30 transition hover:bg-sun active:scale-[.98]"
          >
            <span aria-hidden="true">🎯</span> Calcula tu puntaje
          </a>
          <a
            href={`${BECA}#aviso`}
            onClick={() => marcar("beca:aviso")}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-2 py-3 text-sm font-extrabold text-primary transition hover:bg-secondary-light active:scale-[.98]"
          >
            <span aria-hidden="true">🔔</span> Avísame
          </a>
        </div>
      </div>
    </section>
  );
}

function quedanPromo() {
  const n = Math.max(0, Math.ceil((new Date(`${PROMO_GRATIS.hasta}T23:59:59`) - Date.now()) / 86400000));
  return n <= 1 ? "¡Último día!" : `Quedan ${n} días`;
}

function ReservaAsesoria({ style }) {
  const promo = promoVigente();
  const opciones = OPCIONES_ASESORIA.filter((o) => !o.promo || promo);
  const [elegida, setElegida] = useState(() => (opciones.find((o) => o.destacada) || opciones[0])?.id);
  const actual = opciones.find((o) => o.id === elegida) || opciones[0];
  if (!actual) return null;
  return (
    <section aria-label="Reserva tu asesoría" className="enl-sube mt-6 overflow-hidden rounded-3xl bg-white shadow-2xl" style={style}>
      <div className="px-4 pb-3 pt-4" style={{ background: "linear-gradient(135deg, #FA943A, #E07A1C)" }}>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary-dark/80">📅 Reserva tu asesoría</p>
        <p className="mt-0.5 font-fraunces text-xl font-bold leading-snug text-primary-dark">Online, con especialistas en extranjería</p>
      </div>
      <div role="radiogroup" aria-label="Elige tu asesoría" className="space-y-2 p-3">
        {opciones.map((o) => {
          const sel = o.id === actual.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={sel}
              onClick={() => setElegida(o.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition active:scale-[.98] ${
                sel ? "border-accent bg-accent/10" : "border-neutral-200 bg-white hover:border-accent/50"
              }`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-accent bg-accent" : "border-neutral-300"}`} aria-hidden="true">
                {sel && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-extrabold uppercase tracking-wide text-neutral-500">{o.duracion}</span>
                <span className="block font-bold leading-snug text-neutral-900">{o.nombre}</span>
                {o.promo && (
                  <span className="block text-xs font-semibold text-green-700">
                    Solo hasta el 22 de septiembre · <span className="font-extrabold">⏳ {quedanPromo()}</span>
                  </span>
                )}
              </span>
              <span className={`shrink-0 text-right text-lg font-extrabold ${o.promo ? "text-green-700" : "text-primary"}`}>
                {o.precio}
                {o.precioAlt && <span className="block text-[10px] font-semibold text-neutral-500">{o.precioAlt}</span>}
              </span>
            </button>
          );
        })}
        <a
          href={actual.url || CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => marcar(`reserva:${actual.id}`)}
          className="enl-brillo flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-center font-extrabold text-white shadow-lg transition hover:bg-primary-dark active:scale-[.98]"
        >
          <span aria-hidden="true">📅</span> Reservar: {actual.nombre}
        </a>
      </div>
    </section>
  );
}

function Opiniones({ style }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (OPINIONES.length < 2) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % OPINIONES.length), 7000);
    return () => clearInterval(t);
  }, []);
  const o = OPINIONES[i];
  if (!o) return null;
  return (
    <section aria-label="Opiniones de asesorados" className="enl-sube mt-6 rounded-3xl bg-white p-4 shadow-2xl" style={style}>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">💬 Lo que dicen nuestros asesorados</p>
      <div key={i} className="enl-aparece mt-2 min-h-[7.5rem]">
        <p className="text-base leading-none text-accent" aria-label={`${o.estrellas} de 5 estrellas`}>
          {"★".repeat(o.estrellas)}
        </p>
        <blockquote className="mt-2 text-sm leading-relaxed text-neutral-800">“{o.texto}”</blockquote>
        <p className="mt-2 text-xs font-bold text-primary">
          {o.nombre} <span className="font-semibold text-neutral-500">· {o.servicio} · opinión publicada en {o.fuente}</span>
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {OPINIONES.map((op, n) => (
            <button
              key={op.nombre}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Ver la opinión de ${op.nombre}`}
              className={`h-2 rounded-full transition-all ${n === i ? "w-5 bg-accent" : "w-2 bg-neutral-300"}`}
            />
          ))}
        </div>
        <a
          href={interno("/casos-de-exito")}
          onClick={() => marcar("opiniones")}
          className="flex items-center gap-1 text-xs font-extrabold text-primary underline underline-offset-4"
        >
          Opiniones y casos de éxito <Flecha />
        </a>
      </div>
    </section>
  );
}

function Contacto({ style }) {
  return (
    <section aria-label="Contacto" className="enl-sube enl-vidrio mt-6 rounded-3xl p-4 text-center text-white" style={style}>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky">📞 Equipo Perú · España</p>
      <p className="mt-1 font-fraunces text-2xl font-bold tabular-nums">{NUMERO}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={whatsappDesde("enlaces", "Quiero información.")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => marcar("contacto:whatsapp")}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-3 text-sm font-extrabold text-white shadow-lg shadow-black/20 transition hover:bg-green-700 active:scale-[.98]"
        >
          <span aria-hidden="true">💬</span> WhatsApp
        </a>
        <a
          href={TEL}
          onClick={() => marcar("contacto:llamar")}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-extrabold text-primary shadow-lg shadow-black/20 transition hover:bg-secondary-light active:scale-[.98]"
        >
          <span aria-hidden="true">📲</span> Llamar
        </a>
      </div>
      <a
        href="/contacto/inspira-legal.vcf"
        type="text/vcard"
        onClick={() => marcar("contacto:guardar")}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20 active:scale-[.98]"
      >
        <span aria-hidden="true">👤</span> Guardar contacto en mi celular
      </a>
    </section>
  );
}

function Carrusel({ style }) {
  const ref = useRef(null);
  const [activo, setActivo] = useState(0);
  const alDesplazar = () => {
    const el = ref.current;
    const primero = el?.firstElementChild;
    if (!el || !primero) return;
    const paso = primero.getBoundingClientRect().width + 12;
    setActivo(Math.min(RECURSOS.length - 1, Math.round(el.scrollLeft / paso)));
  };
  const ir = (i) => {
    const el = ref.current;
    const hijo = el?.children[i];
    if (el && hijo) el.scrollTo({ left: hijo.offsetLeft - el.offsetLeft - 16, behavior: "smooth" });
  };
  return (
    <div className="enl-sube" style={style}>
      <div ref={ref} onScroll={alDesplazar} className="enl-carrusel relative -mx-4 flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollPaddingLeft: "1rem" }}>
        {RECURSOS.map((r, i) => (
          <a
            key={r.titulo}
            href={r.href}
            onClick={() => marcar(r.clave)}
            className="enl-vidrio flex w-[78%] shrink-0 flex-col overflow-hidden rounded-3xl text-white transition active:scale-[.98] sm:w-[70%]"
          >
            {r.img ? (
              <img src={r.img} alt="" className="aspect-[1200/630] w-full object-cover" loading={i === 0 ? "eager" : "lazy"} decoding="async" />
            ) : (
              <span className="flex aspect-[1200/630] w-full items-center justify-center bg-gradient-to-br from-sky/40 to-accent/40 text-6xl" aria-hidden="true">
                {r.emoji}
              </span>
            )}
            <span className="flex flex-1 flex-col p-3.5">
              <span className="font-extrabold leading-snug">{r.titulo}</span>
              <span className="mt-1 text-xs leading-snug text-white/75">{r.texto}</span>
              <span className="mt-auto flex items-center gap-1 pt-2 text-xs font-bold text-sun">
                Ver gratis <Flecha />
              </span>
            </span>
          </a>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        {RECURSOS.map((r, i) => (
          <button
            key={r.titulo}
            type="button"
            onClick={() => ir(i)}
            aria-label={`Ver ${r.titulo}`}
            className={`h-2 rounded-full transition-all ${i === activo ? "w-6 bg-accent" : "w-2 bg-white/35"}`}
          />
        ))}
        <span className="ml-2 text-[11px] font-semibold text-white/60">Desliza 👉</span>
      </div>
    </div>
  );
}

export default function Enlaces() {
  useEffect(() => {
    document.title = "Inspira Legal · Enlaces";
    // La web deja hueco abajo para la barra inferior; aquí no hay barra y se
    // veía una franja blanca bajo la página.
    const previo = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#013446";
    return () => {
      document.body.style.backgroundColor = previo;
    };
  }, []);

  let paso = 0;
  const retraso = () => ({ "--d": `${(paso += 70)}ms` });

  return (
    <main className="enl-fondo min-h-[100dvh] w-full px-4 pb-12 pt-10 [overflow-x:clip]">
      <style>{ESTILOS}</style>
      <div className="mx-auto w-full max-w-md">
        <header className="enl-sube flex flex-col items-center text-center" style={retraso()}>
          <span className="enl-anillo flex h-24 w-24 items-center justify-center rounded-full">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-white shadow-2xl">
              <img src={logo} alt="Inspira Legal" className="h-auto w-[76%]" />
            </span>
          </span>
          <h1 className="mt-4 font-fraunces text-2xl font-bold text-white">Inspira Legal</h1>
          <p className="mt-1 text-sm font-semibold text-sky">@inspira_educa</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/85">
            Migra a España ✈️ · Especialistas en Extranjería y Visas 🎓🌍 · Reside legalmente
          </p>
        </header>

        <BannerBeca style={retraso()} />
        <ReservaAsesoria style={retraso()} />
        <Opiniones style={retraso()} />
        <Contacto style={retraso()} />

        <Rotulo style={retraso()}>🎁 Recursos gratuitos</Rotulo>
        <div className="mt-3">
          <Carrusel style={retraso()} />
        </div>

        <Rotulo style={retraso()}>✨ Servicios, paquetes y más</Rotulo>
        <div className="enl-sube mt-3 grid grid-cols-2 gap-3" style={retraso()}>
          {SERVICIOS.map((s) => (
            <a
              key={s.clave}
              href={s.href}
              onClick={() => marcar(s.clave)}
              className="enl-vidrio flex flex-col rounded-3xl p-3.5 text-white transition hover:bg-white/10 active:scale-[.98]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-2xl ring-1 ring-white/15" aria-hidden="true">
                {s.emoji}
              </span>
              <span className="mt-2 font-extrabold leading-snug">{s.titulo}</span>
              <span className="mt-0.5 text-xs leading-snug text-white/70">{s.texto}</span>
            </a>
          ))}
        </div>

        <a
          href={interno("/servicios/master")}
          onClick={() => marcar("paquete-master")}
          className="enl-sube mt-3 flex overflow-hidden rounded-3xl bg-white shadow-2xl transition active:scale-[.98]"
          style={retraso()}
        >
          <img src="/og/master-2027-2028.jpg" alt="" className="w-[42%] shrink-0 object-cover object-left" loading="lazy" decoding="async" />
          <span className="flex min-w-0 flex-1 flex-col justify-center p-3.5 text-primary">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-accent-dark">📦 Paquete Máster</span>
            <span className="font-extrabold leading-snug">Postula a tu máster 2027/2028</span>
            <span className="mt-1 text-xs leading-snug text-neutral-600">Paquetes de postulación desde 219 € y pago por etapas</span>
          </span>
        </a>

        <nav aria-label="Más enlaces de Inspira" className="mt-3 space-y-3">
          {ENLACES.map((e) => (
            <a
              key={e.clave}
              href={e.href}
              onClick={() => marcar(e.clave)}
              className="enl-sube flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 font-bold text-primary shadow-lg shadow-black/10 transition hover:bg-secondary-light active:scale-[.98]"
              style={retraso()}
            >
              <span className="text-xl" aria-hidden="true">{e.emoji}</span>
              <span className="flex-1">{e.titulo}</span>
              <Flecha className="opacity-60" />
            </a>
          ))}
        </nav>

        <div className="enl-sube mt-8 flex justify-center gap-3" style={retraso()}>
          {REDES.map((r) => (
            <a
              key={r.nombre}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={r.nombre}
              onClick={() => marcar(`red:${r.nombre.toLowerCase()}`)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20 active:scale-95"
            >
              {r.icono}
            </a>
          ))}
        </div>

        <p className="enl-sube mt-8 text-center text-xs text-white/55" style={retraso()}>
          inspira-legal.cloud
        </p>
      </div>
    </main>
  );
}
