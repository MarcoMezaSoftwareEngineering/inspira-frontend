// src/pages/mapa/AvisoPlazo.jsx
//
// «Avísame cuando abra». Va pegado al plazo de postulación de la ficha: las
// universidades abren en fechas fijas y quien mira el mapa en septiembre no
// va a volver solo el día que abre Galicia.
//
// Manda POST /api/leads/aviso-plazo (modules/leads/avisoPlazo.js), que deja
// un lead de origen MAPA con el sitio y la fecha que se le enseñó. El aviso
// lo escribe una persona desde Core: aquí no se promete que llegue solo.
//
// Pide lo mínimo —nombre y WhatsApp— y el correo es opcional. Cada campo de
// más que se pide aquí es gente que no lo rellena.
import { useState } from "react";
import Icono from "../../components/common/Icono";
import IconoMapa from "./IconosMapa";
import { registrarEvento } from "../../lib/analytics";
import { AVISO } from "./mapaTextos";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const FOCO = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]";
const CAMPO =
  "min-h-[46px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[#0A5873] focus:outline-none focus:ring-4 focus:ring-[#CFE6FD]";

/** La procedencia que ya trae la URL, para saber qué campaña trajo el aviso. */
function utmDeLaUrl() {
  try {
    const p = new URLSearchParams(window.location.search);
    return { source: p.get("utm_source"), medium: p.get("utm_medium"), campaign: p.get("utm_campaign") };
  } catch {
    return {};
  }
}

export default function AvisoPlazo({ sitio, sitioId, curso, fecha }) {
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState("");
  const [errores, setErrores] = useState({});
  const [datos, setDatos] = useState({ nombre: "", whatsapp: "", email: "", acepta_politica: false, acepta_marketing: true });

  if (!sitio) return null;

  async function enviar(e) {
    e.preventDefault();
    setEstado("enviando");
    setErrores({});
    try {
      const r = await fetch(`${API_URL}/api/leads/aviso-plazo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...datos,
          sitio,
          sitio_id: sitioId || null,
          curso: curso || null,
          fecha: fecha || null,
          pagina: "/mapa-estudiar-en-espana",
          utm: utmDeLaUrl(),
        }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) {
        setErrores(j?.errores || { general: j?.msg || AVISO.error });
        setEstado("");
        return;
      }
      registrarEvento("mapa_aviso_plazo", { id: sitioId || sitio });
      setEstado("listo");
    } catch {
      setErrores({ general: AVISO.error });
      setEstado("");
    }
  }

  if (estado === "listo") {
    return (
      <p role="status" className="mt-2.5 flex items-start gap-2 rounded-xl bg-[#EAF6EE] px-3 py-2.5 text-[13px] font-semibold text-[#1B5E35]">
        <Icono nombre="check" size={15} className="mt-0.5 shrink-0" />
        {AVISO.listo(sitio)}
      </p>
    );
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`mapa-boton mov-toque mt-2.5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#E6F2FE] px-3 py-2.5 text-[13px] font-extrabold text-[#003648] hover:bg-[#CFE6FD] ${FOCO}`}
      >
        <Icono nombre="campana" size={16} className="text-[#0A5873]" />
        {AVISO.boton}
      </button>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-2.5 rounded-2xl bg-[#F6FBFF] p-3.5 ring-1 ring-[#CFE6FD]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-bold leading-snug text-[#003648]">{AVISO.titulo(sitio)}</p>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          aria-label="Cerrar"
          className="-mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#0A5873] hover:bg-white"
        >
          <IconoMapa nombre="cerrar" size={14} strokeWidth={2.2} />
        </button>
      </div>
      <p className="mt-0.5 text-[12px] leading-snug text-neutral-700">{AVISO.texto}</p>

      <div className="mt-2.5 grid gap-2">
        <label className="block">
          <span className="sr-only">{AVISO.nombre}</span>
          <input
            className={CAMPO}
            placeholder={AVISO.nombre}
            value={datos.nombre}
            onChange={(e) => setDatos((d) => ({ ...d, nombre: e.target.value }))}
            autoComplete="given-name"
            required
          />
        </label>
        {errores.nombre && <p className="text-[12px] font-semibold text-red-700">{errores.nombre}</p>}
        <label className="block">
          <span className="sr-only">{AVISO.whatsapp}</span>
          <input
            className={CAMPO}
            placeholder={AVISO.whatsapp}
            value={datos.whatsapp}
            onChange={(e) => setDatos((d) => ({ ...d, whatsapp: e.target.value }))}
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </label>
        {errores.whatsapp && <p className="text-[12px] font-semibold text-red-700">{errores.whatsapp}</p>}
        <label className="block">
          <span className="sr-only">{AVISO.email}</span>
          <input
            className={CAMPO}
            placeholder={AVISO.email}
            value={datos.email}
            onChange={(e) => setDatos((d) => ({ ...d, email: e.target.value }))}
            inputMode="email"
            autoComplete="email"
          />
        </label>
        {errores.email && <p className="text-[12px] font-semibold text-red-700">{errores.email}</p>}
      </div>

      <label className="mt-2.5 flex items-start gap-2 text-[12px] leading-snug text-neutral-800">
        <input
          type="checkbox"
          checked={datos.acepta_politica}
          onChange={(e) => setDatos((d) => ({ ...d, acepta_politica: e.target.checked }))}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#0A5873]"
          required
        />
        <span>
          {AVISO.politica[0]}
          <a href="/aviso-de-privacidad" className="font-bold text-[#0A5873] underline underline-offset-2">
            {AVISO.politica[1]}
          </a>
          {AVISO.politica[2]}
        </span>
      </label>
      {errores.acepta_politica && <p className="mt-1 text-[12px] font-semibold text-red-700">{errores.acepta_politica}</p>}
      {errores.general && <p className="mt-1 text-[12px] font-semibold text-red-700">{errores.general}</p>}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className={`mapa-boton mov-toque mt-3 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#003648] px-4 text-[13px] font-extrabold text-white disabled:opacity-70 ${FOCO}`}
      >
        <Icono nombre="campana" size={16} className="text-[#F09C48]" />
        {estado === "enviando" ? AVISO.enviando : AVISO.enviar}
      </button>
    </form>
  );
}
