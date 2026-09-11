// src/components/common/SelloPortal.jsx
// Sello compacto del Portal Inspira para las páginas de servicio: qué verá el
// cliente de ese servicio en su portal (config/plataforma.js → selloDe) y un
// enlace a /plataforma.
import { selloDe } from "../../config/plataforma";
import { CAPTURAS_PORTAL } from "./capturasPortal";
import Icono from "./Icono";
import { NOMBRE_PORTAL, NOMBRE_CORTO } from "../../config/portalMarca";
import { MarcoTelefono } from "./MarcoDispositivo";
import { navigate } from "../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

export default function SelloPortal({ servicioId, sello: selloDirecto, className = "" }) {
  const sello = selloDirecto || selloDe(servicioId);
  const cap = sello.captura ? CAPTURAS_PORTAL[sello.captura] : null;

  return (
    <aside
      aria-label={NOMBRE_PORTAL}
      className={`flex items-center gap-4 rounded-2xl border border-sky/60 bg-secondary-light p-4 sm:gap-5 sm:p-5 ${className}`}
    >
      {cap ? (
        <MarcoTelefono captura={cap} mini decorativa aspecto="aspect-[9/14]" className="w-16 shrink-0 sm:w-[4.5rem]" />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
          <Icono nombre="panel" size={24} />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-accent-dark">
          {NOMBRE_CORTO} · también en app
        </p>
        <p className="mt-0.5 font-bold leading-snug text-primary">{sello.titulo}</p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-700">{sello.texto}</p>
        <a
          href="/plataforma"
          onClick={(e) => go(e, "/plataforma")}
          className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary underline-offset-4 hover:underline"
        >
          Conoce el {NOMBRE_PORTAL} <span aria-hidden>→</span>
        </a>
      </div>
    </aside>
  );
}
