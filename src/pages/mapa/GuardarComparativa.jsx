// src/pages/mapa/GuardarComparativa.jsx
// «Guárdala y te la enviamos»: formulario breve para guardar la selección del
// comparador (o la ficha abierta) y recibirla por WhatsApp.
//
// POST /api/mapa/comparativa
//   { nombre, whatsapp, email?, acepta_politica, acepta_marketing,
//     seleccion: { tipo: "comunidades" | "universidades", ids }, filtros, pagina, utm }
//   → { ok }
//
// La casilla de la política de privacidad es obligatoria; la de comunicaciones,
// opcional y desmarcada. Tras enviar, confirmación y botón a WhatsApp con el
// resumen de la selección; si el envío falla, el mismo botón como alternativa.
// Va en un portal sobre <body> (la página anima con transform: ver HojaDetalle).
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icono from "../../components/common/Icono";
import { whatsappDesde } from "../../config/contacto";
import { utmGuardados } from "../../lib/analytics";
import { PAISES } from "../panel/components/perfil.shared";
import IconoMapa from "./IconosMapa";
import { eventoMapa } from "./eventosMapa";
import { GUARDAR } from "./mapaTextos";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CAMPO =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-base text-[#003648] placeholder:text-neutral-500 focus:outline-none focus:ring-4 focus:ring-[#96CCFC]";

/** Filtros activos sin vacíos, para que el equipo vea con qué estaba mirando. */
function filtrosLimpios(f = {}) {
  return Object.fromEntries(
    Object.entries(f).filter(([k, v]) => k !== "orden" && v != null && v !== false && v !== "" && !(Array.isArray(v) && !v.length))
  );
}

function Dialogo({ seleccion, indice, filtros, onCerrar }) {
  const id = useId();
  const primero = useRef(null);
  const [campos, setCampos] = useState({ nombre: "", prefijo: "+51", numero: "", email: "", politica: false, marketing: false });
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState("form");

  useEffect(() => {
    primero.current?.focus();
  }, []);

  const esComunidad = seleccion.tipo === "comunidad";
  const nombres = seleccion.ids
    .slice(0, 3)
    .map((x) => (esComunidad ? indice.comunidades.get(x)?.nombre : indice.universidades.get(x)?.sigla))
    .filter(Boolean);
  const resumen = `${esComunidad ? "Comunidades" : "Universidades"}: ${nombres.join(", ")}`;
  const enlaceWhatsapp = whatsappDesde("mapa", `${GUARDAR.mensajeWhatsapp} ${resumen}.`);
  const poner = (k) => (e) => setCampos((c) => ({ ...c, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    const digitos = campos.numero.replace(/\D/g, "");
    const faltan = {};
    if (campos.nombre.trim().length < 2) faltan.nombre = GUARDAR.errores.nombre;
    if (digitos.length < 6 || digitos.length > 15) faltan.numero = GUARDAR.errores.whatsapp;
    if (campos.email.trim() && !CORREO.test(campos.email.trim())) faltan.email = GUARDAR.errores.email;
    if (!campos.politica) faltan.politica = GUARDAR.errores.politica;
    setErrores(faltan);
    if (Object.keys(faltan).length) return;

    setEstado("enviando");
    const control = new AbortController();
    const tope = setTimeout(() => control.abort(), 15000);
    try {
      const r = await fetch(`${API_URL}/api/mapa/comparativa`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        signal: control.signal,
        body: JSON.stringify({
          nombre: campos.nombre.trim(),
          whatsapp: `${campos.prefijo}${digitos}`,
          ...(campos.email.trim() ? { email: campos.email.trim() } : {}),
          acepta_politica: true,
          acepta_marketing: !!campos.marketing,
          // El servidor acepta «comunidad» | «universidad» y de 1 a 3 ids (mapa.comparativa.js).
          seleccion: { tipo: seleccion.tipo, ids: seleccion.ids.slice(0, 3) },
          filtros: filtrosLimpios(filtros),
          pagina: `${window.location.pathname}${window.location.search}`,
          utm: utmGuardados(),
        }),
      });
      const j = await r.json().catch(() => null);
      if (r.status === 400 && j?.errores) {
        // Validación del servidor: cada mensaje en su campo.
        const campo = { nombre: "nombre", whatsapp: "numero", email: "email", acepta_politica: "politica" };
        const delServidor = {};
        for (const [k, msg] of Object.entries(j.errores)) delServidor[campo[k] || "general"] = msg;
        setErrores(delServidor);
        setEstado("form");
        return;
      }
      if (r.status === 503 || r.status === 429) {
        setEstado("limite");
        return;
      }
      if (!r.ok || !j?.ok) throw new Error(j?.msg || `HTTP ${r.status}`);
      setEstado("ok");
      eventoMapa("guardar", seleccion.ids.join(","));
    } catch (err) {
      console.warn("[mapa] no se pudo guardar la comparativa:", err?.message || err);
      setEstado("error");
    } finally {
      clearTimeout(tope);
    }
  }

  const error = (k) =>
    errores[k] ? (
      <p id={`${id}-${k}-error`} className="mt-1 text-xs font-semibold text-[#B42318]">
        {errores[k]}
      </p>
    ) : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#003648]/55 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onCerrar();
          }
        }}
        className="mapa-ficha-entra max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mapa-rotulo">
              <Icono nombre="documento" size={14} />
              {GUARDAR.rotulo}
            </p>
            <h2 id={`${id}-titulo`} className="mapa-titular mt-1 text-[22px] font-bold leading-tight text-[#003648]">
              {estado === "ok" ? GUARDAR.okTitulo : GUARDAR.titulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label={GUARDAR.cerrar}
            className="mov-toque flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E6F2FE] text-[#003648] hover:bg-[#CFE6FD] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
          >
            <IconoMapa nombre="cerrar" size={18} strokeWidth={2.1} />
          </button>
        </div>

        <p className="mt-3 rounded-2xl bg-[#F6FBFF] px-3 py-2 text-xs text-[#003648] ring-1 ring-[#E1EFFD]">
          <strong>{GUARDAR.seleccion}:</strong> {nombres.join(", ")}
        </p>

        {estado === "ok" || estado === "error" || estado === "limite" ? (
          <div className="mt-4" role="status">
            <p className="text-sm leading-relaxed text-neutral-800">
              {estado === "ok" ? GUARDAR.okTexto : estado === "limite" ? GUARDAR.limite : GUARDAR.error}
            </p>
            <a
              href={enlaceWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mapa-boton mov-toque mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#F09C48] px-4 py-3 text-sm font-extrabold text-[#003648] hover:bg-[#F4AD62] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003648]"
            >
              <Icono nombre="chat" size={18} />
              {GUARDAR.okWhatsapp}
            </a>
            {estado !== "ok" && (
              <button type="button" onClick={() => setEstado("form")} className="mt-3 w-full text-sm font-bold text-[#0A5873] underline underline-offset-2">
                {GUARDAR.reintentar}
              </button>
            )}
          </div>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={enviar} noValidate>
            <p className="text-sm leading-relaxed text-neutral-700">{GUARDAR.texto}</p>
            <div>
              <label htmlFor={`${id}-nombre`} className="text-xs font-bold text-[#003648]">
                {GUARDAR.nombre}
              </label>
              <input
                ref={primero}
                id={`${id}-nombre`}
                autoComplete="name"
                value={campos.nombre}
                onChange={poner("nombre")}
                aria-invalid={!!errores.nombre}
                aria-describedby={errores.nombre ? `${id}-nombre-error` : undefined}
                className={`${CAMPO} mt-1`}
              />
              {error("nombre")}
            </div>
            <div>
              <label htmlFor={`${id}-numero`} className="text-xs font-bold text-[#003648]">
                {GUARDAR.whatsapp}
              </label>
              <div className="mt-1 flex gap-2">
                <label htmlFor={`${id}-prefijo`} className="sr-only">
                  {GUARDAR.prefijo}
                </label>
                <select id={`${id}-prefijo`} value={campos.prefijo} onChange={poner("prefijo")} className={`${CAMPO} w-[7.5rem] shrink-0 px-2`}>
                  {PAISES.map((p) => (
                    <option key={p.codigo} value={p.prefijo}>
                      {p.codigo} {p.prefijo}
                    </option>
                  ))}
                </select>
                <input
                  id={`${id}-numero`}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  value={campos.numero}
                  onChange={poner("numero")}
                  aria-invalid={!!errores.numero}
                  aria-describedby={errores.numero ? `${id}-numero-error` : undefined}
                  className={`${CAMPO} min-w-0 flex-1`}
                />
              </div>
              {error("numero")}
            </div>
            <div>
              <label htmlFor={`${id}-email`} className="text-xs font-bold text-[#003648]">
                {GUARDAR.email}
              </label>
              <input
                id={`${id}-email`}
                type="email"
                autoComplete="email"
                value={campos.email}
                onChange={poner("email")}
                aria-invalid={!!errores.email}
                aria-describedby={errores.email ? `${id}-email-error` : undefined}
                className={`${CAMPO} mt-1`}
              />
              {error("email")}
            </div>
            <div>
              <label className="flex items-start gap-2 text-xs leading-snug text-neutral-800">
                <input
                  type="checkbox"
                  checked={campos.politica}
                  onChange={poner("politica")}
                  aria-invalid={!!errores.politica}
                  aria-describedby={errores.politica ? `${id}-politica-error` : undefined}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#0A5873]"
                />
                <span>
                  {GUARDAR.politica[0]}
                  <a href="/legal/privacidad" target="_blank" rel="noopener" className="font-bold text-[#0A5873] underline underline-offset-2">
                    {GUARDAR.politica[1]}
                  </a>
                  {GUARDAR.politica[2]}
                </span>
              </label>
              {error("politica")}
            </div>
            <label className="flex items-start gap-2 text-xs leading-snug text-neutral-800">
              <input type="checkbox" checked={campos.marketing} onChange={poner("marketing")} className="mt-0.5 h-4 w-4 shrink-0 accent-[#0A5873]" />
              <span>{GUARDAR.marketing}</span>
            </label>
            {errores.general && (
              <p role="alert" className="text-xs font-semibold text-[#B42318]">
                {errores.general}
              </p>
            )}
            <button
              type="submit"
              disabled={estado === "enviando"}
              className="mapa-boton mov-toque inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#003648] px-4 py-3 text-sm font-extrabold text-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]"
            >
              <Icono nombre="documento" size={17} />
              {estado === "enviando" ? GUARDAR.enviando : GUARDAR.enviar}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

/** `seleccion`: { tipo: "comunidad" | "universidad", ids } o null (cerrado). */
export default function GuardarComparativa({ seleccion, indice, filtros, onCerrar }) {
  if (!seleccion?.ids?.length || typeof document === "undefined") return null;
  return <Dialogo key={`${seleccion.tipo}-${seleccion.ids.join(",")}`} seleccion={seleccion} indice={indice} filtros={filtros} onCerrar={onCerrar} />;
}

/** Botón «Guárdala y te la enviamos» de fichas y comparador. */
export function BotonGuardar({ onClick, claro = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mapa-boton mov-toque inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48] ${
        claro ? "bg-white text-[#003648] ring-1 ring-[#96CCFC] hover:bg-[#F6FBFF]" : "bg-[#E6F2FE] text-[#003648] hover:bg-[#CFE6FD]"
      }`}
    >
      <Icono nombre="documento" size={17} />
      {GUARDAR.boton}
    </button>
  );
}
