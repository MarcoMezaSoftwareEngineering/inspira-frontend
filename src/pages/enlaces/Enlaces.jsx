// src/pages/enlaces/Enlaces.jsx
//
// Página de enlaces para las biografías de redes: sustituye a Linktree
// (https://linktr.ee/inspira_educa) desde el 15/09/2026. Sin cabecera, pie ni
// barras del sitio (LANDING_ADS_PATHS en App.jsx) y sin indexar.
//
// Los enlaces internos llevan utm_source=enlaces para que Inspira Core sepa que
// la visita llegó desde aquí. Redes y correo, copiados del Linktree el
// 15/09/2026; el WhatsApp es la línea única de la web (config/contacto.js).
import { useEffect } from "react";
import logo from "../../assets/images/logo.png";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";

const UTM = "utm_source=enlaces&utm_medium=bio";
const interno = (ruta) => `${ruta}${ruta.includes("?") ? "&" : "?"}${UTM}`;

const DESTACADOS = [
  {
    emoji: "🎓",
    titulo: "Beca Generación del Bicentenario 2026",
    texto: "Solo 20 becas. ¿Calificas? Calcula tu puntaje",
    etiqueta: "🔥 Nuevo",
    href: interno("/beca-generacion-bicentenario-2026"),
  },
  {
    emoji: "🗺️",
    titulo: "Mapa de universidades y costos de máster",
    texto: "Cuánto cuesta un máster en cada ciudad de España",
    href: interno("/mapa-estudiar-en-espana"),
  },
  {
    emoji: "👨‍👩‍👧",
    titulo: "Grado en España: guía para familias",
    texto: "Cuánto cuesta que tu hijo estudie una carrera",
    href: interno("/grado-en-espana"),
  },
  {
    emoji: "🧮",
    titulo: "Calculadora: encuentra gratis tu máster",
    texto: "Másteres oficiales en España según tu perfil",
    href: interno("/calculadora-master"),
  },
];

const ENLACES = [
  { emoji: "📦", titulo: "Paquete Máster 2027/2028", href: interno("/servicios/master") },
  { emoji: "📅", titulo: "Reserva tu sesión diagnóstico", href: CALENDLY_URL, externo: true },
  { emoji: "💬", titulo: "Escríbenos por WhatsApp", href: whatsappDesde("enlaces", "Quiero información."), externo: true },
  { emoji: "🌎", titulo: "Nuestra web oficial", href: interno("/") },
];

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
@keyframes enl-sube { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes enl-barrido { 0%, 60% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
.enl-sube { animation: enl-sube .6s cubic-bezier(.22, 1, .36, 1) both; animation-delay: var(--d, 0ms); }
.enl-brillo { position: relative; overflow: hidden; }
.enl-brillo::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, .45) 50%, transparent 70%); transform: translateX(-120%); animation: enl-barrido 3.8s ease-in-out infinite; }
.enl-vidrio { border: 1px solid transparent; background: linear-gradient(160deg, rgba(255, 255, 255, .14), rgba(255, 255, 255, .05)) padding-box, linear-gradient(135deg, rgba(255, 255, 255, .45), rgba(255, 255, 255, .06) 45%, rgba(250, 148, 58, .5)) border-box; }
@media (prefers-reduced-motion: reduce) { .enl-sube { animation: none; } .enl-brillo::after { display: none; } }
`;

function Flecha() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export default function Enlaces() {
  useEffect(() => {
    document.title = "Inspira Legal · Enlaces";
  }, []);

  let paso = 0;
  const retraso = () => ({ "--d": `${(paso += 70)}ms` });

  return (
    <main
      className="min-h-[100dvh] w-full px-4 pb-12 pt-10"
      style={{ background: "radial-gradient(900px 500px at 80% -10%, #1B8DB5 0%, transparent 60%), linear-gradient(160deg, #013446 0%, #02506B 60%, #0A5873 100%)" }}
    >
      <style>{ESTILOS}</style>
      <div className="mx-auto w-full max-w-md">
        <header className="enl-sube flex flex-col items-center text-center" style={retraso()}>
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl ring-4 ring-white/20">
            <img src={logo} alt="Inspira Legal" className="h-auto w-[76%]" />
          </span>
          <h1 className="mt-4 font-fraunces text-2xl font-bold text-white">Inspira Legal</h1>
          <p className="mt-1 text-sm font-semibold text-sky">@inspira_educa</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/85">
            Migra a España ✈️ · Especialistas en Extranjería y Visas 🎓🌍 · Reside legalmente
          </p>
        </header>

        <nav aria-label="Enlaces de Inspira" className="mt-8 space-y-3">
          <p className="enl-sube text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white/60" style={retraso()}>
            🎁 Recursos gratuitos
          </p>
          {DESTACADOS.map((d, i) => (
            <a
              key={d.titulo}
              href={d.href}
              className={`enl-sube group flex items-center gap-3 rounded-2xl p-3.5 transition active:scale-[.98] ${
                i === 0 ? "enl-brillo bg-accent text-primary-dark shadow-lg shadow-accent/30 hover:bg-sun" : "enl-vidrio text-white hover:bg-white/10"
              }`}
              style={retraso()}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${i === 0 ? "bg-white/40" : "bg-white/10 ring-1 ring-white/15"}`}
                aria-hidden="true"
              >
                {d.emoji}
              </span>
              <span className="min-w-0 flex-1">
                {d.etiqueta && (
                  <span className="mb-0.5 inline-block rounded-full bg-primary-dark px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                    {d.etiqueta}
                  </span>
                )}
                <span className="block font-extrabold leading-snug">{d.titulo}</span>
                <span className={`mt-0.5 block text-xs leading-snug ${i === 0 ? "text-primary-dark/80" : "text-white/70"}`}>{d.texto}</span>
              </span>
              <Flecha />
            </a>
          ))}

          <p className="enl-sube pt-3 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white/60" style={retraso()}>
            📦 Paquetes y asesoría
          </p>

          {ENLACES.map((e) => (
            <a
              key={e.titulo}
              href={e.href}
              {...(e.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="enl-sube flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 font-bold text-primary shadow-lg shadow-black/10 transition hover:bg-secondary-light active:scale-[.98]"
              style={retraso()}
            >
              <span className="text-xl" aria-hidden="true">{e.emoji}</span>
              <span className="flex-1">{e.titulo}</span>
              <Flecha />
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
