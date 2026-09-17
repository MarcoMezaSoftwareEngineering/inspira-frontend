// src/pages/bicentenario/AvisoApertura.jsx
//
// «Avísame cuando abra»: la postulación abre el 30/10/2026 y casi nadie postula
// el día que ve el video. Guarda un lead de origen BECA (POST /api/leads/aviso-beca)
// para que el equipo avise al abrir; «¿Dónde nos viste?» dice qué red trae gente.
// También la barra fija del móvil con los dos atajos (simulador y aviso).
//
// 17/09/2026: iconos propios en vez de emojis y zonas de toque de 44 px (la
// mayoría llega desde el teléfono).
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { utmGuardados } from "../../lib/analytics";
import { whatsappDesde } from "../../config/contacto";
import { CIFRAS } from "../../config/bicentenario2026";
import { Revelar, Seccion, Titulo } from "./piezas";
import IconoBic from "./iconos";
import { CANALES_AVISO, NIVELES_AVISO } from "./textos";
import { irA } from "./utiles";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CAMPO =
  "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-base text-primary focus:border-accent focus:outline-none";

function canalInicial() {
  const fuente = String(
    utmGuardados().utm_source || new URLSearchParams(window.location.search).get("utm_source") || ""
  ).toLowerCase();
  return CANALES_AVISO.some(([k]) => k === fuente) ? fuente : "";
}

function Chips({ nombre, opciones, valor, onCambio }) {
  return (
    <div role="radiogroup" aria-label={nombre} className="mt-2 flex flex-wrap gap-2">
      {opciones.map(([k, icono, txt]) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={valor === k}
          onClick={() => onCambio(valor === k ? "" : k)}
          className={`bic-press mov-toque inline-flex min-h-[44px] items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold ring-1 transition ${
            valor === k ? "bg-primary text-white ring-primary" : "bg-white text-primary ring-neutral-300 hover:ring-sky"
          }`}
        >
          <IconoBic nombre={icono} size={17} className="shrink-0" />
          {txt}
        </button>
      ))}
    </div>
  );
}

export default function AvisoApertura() {
  const id = useId();
  // El canal se preselecciona con la utm_source de la visita. Va en el estado
  // inicial y no en un efecto: leer window durante el pintado ensucia el render.
  const [c, setC] = useState(() => ({
    nombre: "",
    prefijo: "+51",
    numero: "",
    email: "",
    nivel: "",
    canal: canalInicial(),
    politica: false,
    marketing: false,
  }));
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState("form");

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
            icono="campana"
            eyebrow="Abre el 30/10/2026"
            titulo="Avísame cuando abra la postulación"
            texto={`Solo hay ${CIFRAS.total} becas y la postulación dura dos semanas. Déjanos tu WhatsApp y te avisamos el día que abra.`}
          />
          <Revelar as="ul" className="space-y-3 text-sm leading-snug text-neutral-700">
            <li className="flex items-start gap-3">
              <span className="bic-medallon h-11 w-11 bg-secondary text-primary"><IconoBic nombre="movil" size={21} className="bic-icono" /></span>
              <span><b className="block text-primary">Un aviso por WhatsApp</b>el día que abre la postulación, para que no se te pase.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bic-medallon h-11 w-11 bg-secondary text-primary"><IconoBic nombre="reloj" size={21} className="bic-icono" /></span>
              <span><b className="block text-primary">Del 30/10 al 13/11/2026</b>es todo el plazo: conviene llegar con los documentos listos.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bic-medallon h-11 w-11 bg-secondary text-primary"><IconoBic nombre="candado" size={21} className="bic-icono" /></span>
              <span><b className="block text-primary">Sin spam</b>solo te escribimos por esta beca, salvo que marques lo contrario.</span>
            </li>
          </Revelar>
          <p className="mt-5 flex gap-2 rounded-2xl bg-secondary-light p-3 text-xs leading-snug text-neutral-700">
            <IconoBic nombre="info" size={15} className="mt-px shrink-0" />
            <span>Inspira Legal es una asesoría privada: <b>no somos PRONABEC</b>. La beca la convoca y la otorga PRONABEC.</span>
          </p>
        </div>

        <Revelar className="rounded-3xl border-2 border-sky bg-secondary-light p-5 sm:p-7">
          {estado === "listo" ? (
            <div className="bic-entra py-6 text-center" role="status">
              <span className="bic-pop bic-medallon mx-auto h-20 w-20 bg-accent text-primary-dark">
                <IconoBic nombre="fiesta" size={40} />
              </span>
              <p className="mt-3 font-fraunces text-2xl font-bold text-primary">¡Listo! Te avisaremos</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-700">
                Te escribiremos por WhatsApp cuando abra la postulación, el 30/10/2026. Mientras tanto, calcula tu puntaje orientativo.
              </p>
              <a
                href="#simulador"
                onClick={(e) => irA(e, "#simulador")}
                className="bic-press mov-toque mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-extrabold text-primary-dark shadow-lg shadow-accent/30 hover:bg-sun"
              >
                <IconoBic nombre="diana" size={19} className="shrink-0" /> Calcular mi puntaje
              </a>
            </div>
          ) : (
            <form onSubmit={enviar} noValidate className="space-y-4">
              <p className="flex items-center gap-2.5 font-fraunces text-xl font-bold text-primary">
                <span className="bic-medallon h-11 w-11 bg-accent text-primary-dark"><IconoBic nombre="campana" size={21} className="bic-icono" /></span>
                Quiero el aviso
              </p>
              <label className="block text-sm font-bold text-primary">
                Tu nombre
                <input value={c.nombre} onChange={poner("nombre")} autoComplete="given-name" aria-invalid={!!errores.nombre} className={CAMPO} placeholder="Ej. Lucía" />
                {error("nombre")}
              </label>
              <div>
                <span className="text-sm font-bold text-primary">Tu WhatsApp</span>
                <div className="mt-1 flex gap-2">
                  {/* max-w además de w-20: CAMPO trae w-full y en Tailwind gana
                      la clase que va después en la hoja, no la del elemento. */}
                  <input value={c.prefijo} onChange={poner("prefijo")} aria-label="Prefijo del país" inputMode="tel" className={`${CAMPO} mt-0 w-20 max-w-[5rem] shrink-0 text-center`} />
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
                <Chips nombre="Qué quieres estudiar" opciones={NIVELES_AVISO} valor={c.nivel} onCambio={elegir("nivel")} />
              </div>
              <div>
                <span className="text-sm font-bold text-primary">¿Dónde nos viste? <span className="font-normal text-neutral-600">(opcional)</span></span>
                <Chips nombre="Dónde nos viste" opciones={CANALES_AVISO} valor={c.canal} onCambio={elegir("canal")} />
              </div>
              <label className="flex items-start gap-2 text-xs leading-snug text-neutral-800">
                <input type="checkbox" checked={c.politica} onChange={poner("politica")} aria-invalid={!!errores.politica} className="mt-0.5 h-5 w-5 shrink-0 accent-[#0A5873]" />
                <span>
                  Acepto la{" "}
                  <a href="/legal/privacidad" target="_blank" rel="noopener" className="font-bold text-primary underline underline-offset-2">política de privacidad</a>{" "}
                  y que Inspira Legal me escriba para avisarme de esta beca.
                </span>
              </label>
              {error("politica")}
              <label className="flex items-start gap-2 text-xs leading-snug text-neutral-800">
                <input type="checkbox" checked={c.marketing} onChange={poner("marketing")} className="mt-0.5 h-5 w-5 shrink-0 accent-[#0A5873]" />
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
                className="bic-press bic-cta mov-toque flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-lg font-extrabold text-primary-dark shadow-lg shadow-accent/30 transition hover:bg-sun disabled:opacity-70"
              >
                <IconoBic nombre="campana" size={21} className="shrink-0" /> {estado === "enviando" ? "Guardando…" : "Avísame cuando abra"}
              </button>
            </form>
          )}
        </Revelar>
      </div>
    </Seccion>
  );
}

/** Barra fija con los dos atajos (simulador y aviso), siempre a la vista
 *  (la clienta la quiere permanente): en móvil y tableta, encima de la barra
 *  inferior del sitio; en escritorio, flotando abajo al centro
 *  (.bic-barra-fija en bicentenario.css). */
export function BarraMovil() {
  // Se aparta cuando estorba (17/09/2026). La barra flota por encima de todo y
  // tapaba dos cosas que no puede tapar: el puntaje que va subiendo dentro del
  // simulador —encima invitando a ir a donde ya estabas— y, al final de la
  // página, el aviso legal del pie. Cuando el bloque al que lleva ya se ve, o
  // cuando se ha llegado al pie, la barra sobra.
  const [tapa, setTapa] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver !== "function") return undefined;
    const vistos = new Set();
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => (e.isIntersecting ? vistos.add(e.target) : vistos.delete(e.target)));
        setTapa(vistos.size > 0);
      },
      { threshold: 0.12 }
    );
    const nodos = ["simulador", "aviso"].map((id) => document.getElementById(id));
    // El pie es del sitio, no de esta página: se busca por etiqueta.
    nodos.push(document.querySelector("footer"));
    nodos.forEach((n) => n && obs.observe(n));
    return () => obs.disconnect();
  }, []);

  // Portal a <body>: dentro de la página, un ancestro con transform convierte
  // el `fixed` en relativo a él y la barra acababa al final, fuera de la vista.
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="bic-barra-fija fixed inset-x-3 z-[45] mx-auto flex max-w-md gap-2"
      data-oculta={tapa ? "1" : "0"}
      aria-hidden={tapa || undefined}
    >
      <a
        href="#simulador"
        onClick={(e) => irA(e, "#simulador")}
        className="bic-press bic-cta mov-toque flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-3 py-3 text-center text-sm font-extrabold text-primary-dark shadow-lg shadow-accent/30"
      >
        <IconoBic nombre="diana" size={18} className="shrink-0" />
        Calcula tu puntaje
      </a>
      <a
        href="#aviso"
        onClick={(e) => irA(e, "#aviso")}
        className="bic-press mov-toque flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-extrabold text-white shadow-lg"
      >
        <IconoBic nombre="campana" size={18} className="shrink-0" />
        Avísame
      </a>
    </div>,
    document.body
  );
}
