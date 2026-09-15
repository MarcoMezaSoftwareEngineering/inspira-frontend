// src/pages/bicentenario/AvisoApertura.jsx
//
// «Avísame cuando abra»: la postulación abre el 30/10/2026 y casi nadie postula
// el día que ve el video. Guarda un lead de origen BECA (POST /api/leads/aviso-beca)
// para que el equipo avise al abrir; «¿Dónde nos viste?» dice qué red trae gente.
// También la barra fija del móvil con los dos atajos (simulador y aviso).
import { useEffect, useId, useState } from "react";
import { utmGuardados } from "../../lib/analytics";
import { whatsappDesde } from "../../config/contacto";
import { CIFRAS } from "../../config/bicentenario2026";
import { Revelar, Seccion, Titulo, irA } from "./piezas";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CANALES = [
  ["tiktok", "🎵", "TikTok"],
  ["instagram", "📸", "Instagram"],
  ["facebook", "👍", "Facebook"],
  ["whatsapp", "💬", "WhatsApp"],
  ["google", "🔎", "Google"],
  ["otro", "✨", "Otro"],
];
const NIVELES = [
  ["maestria", "🎓", "Maestría"],
  ["doctorado", "🔬", "Doctorado"],
];
const CAMPO =
  "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-base text-primary focus:border-accent focus:outline-none";

function canalInicial() {
  const fuente = String(
    utmGuardados().utm_source || new URLSearchParams(window.location.search).get("utm_source") || ""
  ).toLowerCase();
  return CANALES.some(([k]) => k === fuente) ? fuente : "";
}

function Chips({ nombre, opciones, valor, onCambio }) {
  return (
    <div role="radiogroup" aria-label={nombre} className="mt-2 flex flex-wrap gap-2">
      {opciones.map(([k, emoji, txt]) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={valor === k}
          onClick={() => onCambio(valor === k ? "" : k)}
          className={`bic-press rounded-full px-3.5 py-2 text-sm font-bold ring-1 transition ${
            valor === k ? "bg-primary text-white ring-primary" : "bg-white text-primary ring-neutral-300 hover:ring-sky"
          }`}
        >
          <span aria-hidden="true">{emoji} </span>
          {txt}
        </button>
      ))}
    </div>
  );
}

export default function AvisoApertura() {
  const id = useId();
  const [c, setC] = useState({ nombre: "", prefijo: "+51", numero: "", email: "", nivel: "", canal: "", politica: false, marketing: false });
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState("form");

  useEffect(() => {
    const k = canalInicial();
    if (k) setC((x) => ({ ...x, canal: x.canal || k }));
  }, []);

  const poner = (k) => (e) => setC((x) => ({ ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const elegir = (k) => (v) => setC((x) => ({ ...x, [k]: v }));

  async function enviar(e) {
    e.preventDefault();
    const digitos = c.numero.replace(/\D/g, "");
    const prefijo = c.prefijo.replace(/\D/g, "");
    const faltan = {};
    if (c.nombre.trim().length < 2) faltan.nombre = "Escribe tu nombre.";
    if (digitos.length < 6 || digitos.length > 12) faltan.numero = "Revisa tu número de WhatsApp.";
    if (c.email.trim() && !CORREO.test(c.email.trim())) faltan.email = "Revisa tu correo.";
    if (!c.politica) faltan.politica = "Para avisarte necesitamos que aceptes la política de privacidad.";
    setErrores(faltan);
    if (Object.keys(faltan).length) return;

    setEstado("enviando");
    const u = utmGuardados();
    try {
      const r = await fetch(`${API_URL}/api/leads/aviso-beca`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nombre: c.nombre.trim(),
          whatsapp: `+${prefijo}${digitos}`,
          ...(c.email.trim() ? { email: c.email.trim() } : {}),
          nivel: c.nivel || null,
          canal: c.canal || null,
          acepta_politica: true,
          acepta_marketing: c.marketing,
          pagina: window.location.pathname,
          utm: { source: u.utm_source, medium: u.utm_medium, campaign: u.utm_campaign },
        }),
      });
      const j = await r.json().catch(() => null);
      if (r.status === 400 && j?.errores) {
        const campo = { nombre: "nombre", whatsapp: "numero", email: "email", acepta_politica: "politica" };
        const delServidor = {};
        for (const [k, msg] of Object.entries(j.errores)) delServidor[campo[k] || "general"] = msg;
        setErrores(delServidor);
        setEstado("form");
        return;
      }
      setEstado(r.ok && j?.ok ? "listo" : "error");
    } catch {
      setEstado("error");
    }
  }

  const wa = whatsappDesde(
    "bicentenario-2026",
    "Quiero que me avisen cuando abra la postulación a la Beca Generación del Bicentenario 2026 (30/10/2026)."
  );
  const error = (k) =>
    errores[k] && (
      <p id={`${id}-${k}`} className="mt-1 text-xs font-bold text-red-700">
        {errores[k]}
      </p>
    );

  return (
    <Seccion id="aviso">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div>
          <Titulo
            emoji="🔔"
            eyebrow="Abre el 30/10/2026"
            titulo="Avísame cuando abra la postulación"
            texto={`Solo hay ${CIFRAS.total} becas y la postulación dura dos semanas. Déjanos tu WhatsApp y te avisamos el día que abra.`}
          />
          <Revelar as="ul" className="space-y-3 text-sm leading-snug text-neutral-700">
            <li className="flex gap-3">
              <span aria-hidden="true" className="text-2xl">📲</span>
              <span><b className="block text-primary">Un aviso por WhatsApp</b>el día que abre la postulación, para que no se te pase.</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="text-2xl">⏳</span>
              <span><b className="block text-primary">Del 30/10 al 13/11/2026</b>es todo el plazo: conviene llegar con los documentos listos.</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="text-2xl">🔒</span>
              <span><b className="block text-primary">Sin spam</b>solo te escribimos por esta beca, salvo que marques lo contrario.</span>
            </li>
          </Revelar>
          <p className="mt-5 rounded-2xl bg-secondary-light p-3 text-xs leading-snug text-neutral-700">
            <span aria-hidden="true">ℹ️ </span>Inspira Legal es una asesoría privada: <b>no somos PRONABEC</b>. La beca la convoca y la otorga PRONABEC.
          </p>
        </div>

        <Revelar className="rounded-3xl border-2 border-sky bg-secondary-light p-5 sm:p-7">
          {estado === "listo" ? (
            <div className="bic-entra py-6 text-center" role="status">
              <p className="bic-pop text-6xl" aria-hidden="true">🎉</p>
              <p className="mt-3 font-fraunces text-2xl font-bold text-primary">¡Listo! Te avisaremos</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-700">
                Te escribiremos por WhatsApp cuando abra la postulación, el 30/10/2026. Mientras tanto, calcula tu puntaje orientativo.
              </p>
              <a
                href="#simulador"
                onClick={(e) => irA(e, "#simulador")}
                className="bic-press mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-extrabold text-primary-dark shadow-lg shadow-accent/30 hover:bg-sun"
              >
                <span aria-hidden="true">🎯</span> Calcular mi puntaje
              </a>
            </div>
          ) : (
            <form onSubmit={enviar} noValidate className="space-y-4">
              <p className="font-fraunces text-xl font-bold text-primary"><span aria-hidden="true">🔔 </span>Quiero el aviso</p>
              <label className="block text-sm font-bold text-primary">
                Tu nombre
                <input value={c.nombre} onChange={poner("nombre")} autoComplete="given-name" aria-invalid={!!errores.nombre} className={CAMPO} placeholder="Ej. Lucía" />
                {error("nombre")}
              </label>
              <div>
                <span className="text-sm font-bold text-primary">Tu WhatsApp</span>
                <div className="mt-1 flex gap-2">
                  <input value={c.prefijo} onChange={poner("prefijo")} aria-label="Prefijo del país" inputMode="tel" className={`${CAMPO} mt-0 w-20 shrink-0 text-center`} />
                  <input value={c.numero} onChange={poner("numero")} aria-label="Número de WhatsApp" aria-invalid={!!errores.numero} inputMode="tel" autoComplete="tel-national" className={`${CAMPO} mt-0 min-w-0 flex-1`} placeholder="999 999 999" />
                </div>
                {error("numero")}
              </div>
              <label className="block text-sm font-bold text-primary">
                Correo <span className="font-normal text-neutral-600">(opcional)</span>
                <input type="email" value={c.email} onChange={poner("email")} autoComplete="email" aria-invalid={!!errores.email} className={CAMPO} placeholder="tu@correo.com" />
                {error("email")}
              </label>
              <div>
                <span className="text-sm font-bold text-primary">¿Qué quieres estudiar?</span>
                <Chips nombre="Qué quieres estudiar" opciones={NIVELES} valor={c.nivel} onCambio={elegir("nivel")} />
              </div>
              <div>
                <span className="text-sm font-bold text-primary">¿Dónde nos viste? <span className="font-normal text-neutral-600">(opcional)</span></span>
                <Chips nombre="Dónde nos viste" opciones={CANALES} valor={c.canal} onCambio={elegir("canal")} />
              </div>
              <label className="flex items-start gap-2 text-xs leading-snug text-neutral-800">
                <input type="checkbox" checked={c.politica} onChange={poner("politica")} aria-invalid={!!errores.politica} className="mt-0.5 h-4 w-4 shrink-0 accent-[#0A5873]" />
                <span>
                  Acepto la{" "}
                  <a href="/legal/privacidad" target="_blank" rel="noopener" className="font-bold text-primary underline underline-offset-2">política de privacidad</a>{" "}
                  y que Inspira Legal me escriba para avisarme de esta beca.
                </span>
              </label>
              {error("politica")}
              <label className="flex items-start gap-2 text-xs leading-snug text-neutral-800">
                <input type="checkbox" checked={c.marketing} onChange={poner("marketing")} className="mt-0.5 h-4 w-4 shrink-0 accent-[#0A5873]" />
                <span>También quiero recibir otras becas y novedades (opcional).</span>
              </label>
              {error("general")}
              {estado === "error" && (
                <p className="rounded-xl bg-neutral-100 p-3 text-sm text-neutral-800" role="alert">
                  No pudimos guardar tu aviso.{" "}
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="font-bold text-green-800 underline">Escríbenos por WhatsApp</a> y te avisamos igual.
                </p>
              )}
              <button
                type="submit"
                disabled={estado === "enviando"}
                className="bic-press bic-cta flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-lg font-extrabold text-primary-dark shadow-lg shadow-accent/30 transition hover:bg-sun disabled:opacity-70"
              >
                <span aria-hidden="true">🔔</span> {estado === "enviando" ? "Guardando…" : "Avísame cuando abra"}
              </button>
            </form>
          )}
        </Revelar>
      </div>
    </Seccion>
  );
}

/** Barra fija en móvil (encima de la barra inferior del sitio). Se esconde
 *  arriba del todo y mientras el simulador o el aviso están a la vista. */
export function BarraMovil() {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    const visibles = new Set();
    let pasado = false;
    const pintar = () => setVer(pasado && visibles.size === 0);
    const alBajar = () => {
      pasado = window.scrollY > 520;
      pintar();
    };
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((en) => (en.isIntersecting ? visibles.add(en.target.id) : visibles.delete(en.target.id)));
        pintar();
      },
      { threshold: 0.12 }
    );
    ["simulador", "aviso"].forEach((k) => {
      const el = document.getElementById(k);
      if (el) io.observe(el);
    });
    alBajar();
    window.addEventListener("scroll", alBajar, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", alBajar);
    };
  }, []);

  return (
    <div
      aria-hidden={!ver}
      className={`fixed inset-x-3 z-[41] flex gap-2 transition-all duration-300 md:hidden ${
        ver ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
      style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom))" }}
    >
      <a
        href="#simulador"
        tabIndex={ver ? 0 : -1}
        onClick={(e) => irA(e, "#simulador")}
        className="bic-press bic-cta flex-1 rounded-2xl bg-accent px-3 py-3 text-center text-sm font-extrabold text-primary-dark shadow-lg shadow-accent/30"
      >
        <span aria-hidden="true">🎯 </span>Calcula tu puntaje
      </a>
      <a
        href="#aviso"
        tabIndex={ver ? 0 : -1}
        onClick={(e) => irA(e, "#aviso")}
        className="bic-press rounded-2xl bg-primary px-4 py-3 text-sm font-extrabold text-white shadow-lg"
      >
        <span aria-hidden="true">🔔 </span>Avísame
      </a>
    </div>
  );
}
