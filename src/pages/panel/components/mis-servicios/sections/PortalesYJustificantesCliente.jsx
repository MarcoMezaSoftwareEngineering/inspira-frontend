// src/pages/panel/components/mis-servicios/sections/PortalesYJustificantesCliente.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../../../services/api";
import SeccionPanel from "./SeccionPanel";

function AccesoCard({ item }) {
  return (
    <div className="border border-neutral-200 rounded-xl p-4 bg-white space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-900">
            {item.organismo}{item.master_label ? ` — ${item.master_label}` : ""}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {item.tipo_tramite} · Estado:{" "}
            <span className="font-semibold text-neutral-700">{item.estado_tramite}</span>
          </p>
        </div>
        {item.url_acceso && (
          <a
            href={item.url_acceso}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border-2 border-[#023A4B] text-[#023A4B] bg-white hover:bg-[#023A4B] hover:text-white transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Abrir portal
          </a>
        )}
      </div>

      {(item.usuario_login || item.password) && (
        <Credenciales usuario={item.usuario_login} password={item.password} url={item.url_acceso} />
      )}

      {item.justificantes && item.justificantes.length > 0 && (
        <div className="border-t border-neutral-100 pt-3 space-y-2">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Justificantes</p>
          <ul className="space-y-1.5">
            {item.justificantes.map((j) => (
              <li key={j.id_justificante} className="flex items-center justify-between gap-2">
                <span className="text-sm text-neutral-700">{j.tipo_justificante}</span>
                <a href={`/portales/justificantes/${j.id_justificante}/descargar`} className="text-sm font-semibold text-[#023A4B] hover:underline">
                  Ver PDF
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


/* Credenciales del cliente. Son suyas y siempre puede verlas, pero se tratan
   como dato sensible: ocultas por defecto, y el "copiar" evita que tenga que
   leerlas en voz alta o dejarlas a la vista mientras las teclea. */
function Credenciales({ usuario, password, url }) {
  const [visible, setVisible] = useState(false);
  const [copiado, setCopiado] = useState("");

  async function copiar(valor, que) {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(que);
      setTimeout(() => setCopiado(""), 1800);
    } catch {
      // Algunos navegadores lo bloquean fuera de HTTPS o sin gesto directo.
      setCopiado("error");
      setTimeout(() => setCopiado(""), 2500);
    }
  }

  const btn =
    "shrink-0 text-[11px] font-semibold px-2 py-1 rounded-md border border-neutral-200 " +
    "bg-white text-neutral-600 hover:border-[#1D6A4A] hover:text-[#1D6A4A] transition-colors";

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3 space-y-2">
      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
        Tus accesos
      </p>

      {usuario && (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Usuario</p>
            <p className="text-[13px] font-mono text-neutral-800 truncate">{usuario}</p>
          </div>
          <button type="button" className={btn} onClick={() => copiar(usuario, "usuario")}>
            {copiado === "usuario" ? "✓" : "Copiar"}
          </button>
        </div>
      )}

      {password && (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Contraseña</p>
            <p className="text-[13px] font-mono text-neutral-800 truncate">
              {visible ? password : "•".repeat(Math.min(password.length, 12))}
            </p>
          </div>
          <button type="button" className={btn} onClick={() => setVisible((v) => !v)}>
            {visible ? "Ocultar" : "Mostrar"}
          </button>
          <button type="button" className={btn} onClick={() => copiar(password, "pass")}>
            {copiado === "pass" ? "✓" : "Copiar"}
          </button>
        </div>
      )}

      {url && (
        <a
          href={url} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#046C8C] hover:underline"
        >
          Abrir plataforma ↗
        </a>
      )}

      {copiado === "error" && (
        <p className="text-[11px] text-amber-700">
          Tu navegador bloqueó el copiado. Selecciona el texto y cópialo a mano.
        </p>
      )}
    </div>
  );
}

function EmptyMinisterios() {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3.5 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-bold text-neutral-800">7.1 Ministerios (nota media y homologación)</p>
          <p className="text-xs text-neutral-500 mt-0.5">Portales del Ministerio de Educación para homologar tu título y obtener nota media española.</p>
        </div>
        <span className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">Sin iniciar</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex flex-col items-center py-6 border-2 border-dashed border-neutral-200 rounded-xl text-center gap-2">
          <span className="text-3xl">🏛️</span>
          <p className="text-sm font-semibold text-neutral-700">Sin portales registrados aún</p>
          <p className="text-xs text-neutral-400 max-w-[280px]">
            Tu asesor registrará los portales del ministerio cuando inicie el trámite de homologación.
          </p>
        </div>
        <div className="flex items-start gap-2 bg-[#e8f2ef] border border-[#1D6A4A]/20 rounded-xl px-4 py-3">
          <span className="text-sm shrink-0">📌</span>
          <p className="text-xs text-[#2d5f4f]">
            <strong>¿Para qué sirve esto?</strong> La nota media española y la homologación del título son requisitos de muchas universidades para admitir candidatos latinoamericanos a posgrado.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyPortalesMaster() {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3.5 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-bold text-neutral-800">7.2 Universidades / Portales de máster</p>
          <p className="text-xs text-neutral-500 mt-0.5">Portales de admisión de cada universidad a la que postularás.</p>
        </div>
        <span className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">Sin iniciar</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center py-6 border-2 border-dashed border-neutral-200 rounded-xl text-center gap-2">
          <span className="text-3xl">🎓</span>
          <p className="text-sm font-semibold text-neutral-700">Se generará automáticamente al confirmar tu elección</p>
          <p className="text-xs text-neutral-400 max-w-[300px]">
            Cuando confirmes los másteres en la Sección 5, tu asesor creará un portal por cada universidad y te enviará las instrucciones de acceso.
          </p>
        </div>

        {/* Ejemplo de cómo se verá */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
            Ejemplo de cómo se verá cada portal:
          </p>
          <div className="border border-neutral-200 rounded-xl p-4 opacity-50 pointer-events-none">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div>
                <p className="text-sm font-bold text-neutral-800">🏛️ Universidad de Valencia</p>
                <p className="text-xs text-neutral-500">Máster en Marketing Digital y Comunicación</p>
              </div>
              <span className="text-xs font-bold bg-neutral-100 text-neutral-500 px-2.5 py-1 rounded-full">Pendiente apertura</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "PORTAL",       val: "uv.es/admision" },
                { label: "ESTADO",       val: "Por abrir",    cls: "text-amber-600 font-semibold" },
                { label: "FECHA LÍMITE", val: "30 Jun 2026" },
                { label: "JUSTIFICANTE", val: "Pendiente" },
              ].map((cell) => (
                <div key={cell.label} className="bg-neutral-50 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-0.5">{cell.label}</p>
                  <p className={cell.cls || "text-neutral-700"}>{cell.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubSeccion({ codigo, titulo, descripcion, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-bold text-neutral-700">{codigo} {titulo}</p>
      {descripcion && <p className="text-xs text-neutral-500 mb-3 mt-0.5">{descripcion}</p>}
      <div className="space-y-3 mt-3">
        {items.map((p) => <AccesoCard key={p.id_acceso} item={p} />)}
      </div>
    </div>
  );
}

export default function PortalesYJustificantesCliente({ idSolicitud }) {
  const [ministerios, setMinisterios] = useState([]);
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const r = await apiGET(`/portales/panel/solicitudes/${idSolicitud}`);
        if (!r.ok) { if (!cancelled) setError(r.message || r.msg || "No se pudo cargar portales."); return; }
        if (!cancelled) { setMinisterios(r.ministerios || []); setMasters(r.masters || []); }
      } catch { if (!cancelled) setError("No se pudo cargar la información de portales."); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [idSolicitud]);

  const total = ministerios.length + masters.length;
  const subtitulo = loading
    ? "Cargando…"
    : total > 0
    ? `${total} acceso${total > 1 ? "s" : ""} configurado${total > 1 ? "s" : ""}`
    : "Accesos a ministerios y portales universitarios.";

  return (
    <SeccionPanel
      numero="7"
      titulo="Portales, claves y justificantes"
      subtitulo={subtitulo}
      sectionId="7"
    >
      {loading && (
        <div className="flex items-center gap-2 text-neutral-400 py-2">
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-[#046C8C] rounded-full animate-spin" />
          <span className="text-sm">Cargando portales…</span>
        </div>
      )}
      {error && !loading && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-red-500">⚠</span>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <div className="space-y-4">
          {/* Aviso cuando aún no hay datos */}
          {total === 0 && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-lg shrink-0">⚠️</span>
              <p className="text-sm text-amber-800">
                Esta sección se activa tras confirmar tu elección de másteres. Tu asesor registrará los portales y gestionará los accesos contigo.
              </p>
            </div>
          )}

          {/* 7.1 */}
          {ministerios.length === 0 ? (
            <EmptyMinisterios />
          ) : (
            <SubSeccion codigo="7.1" titulo="Tus accesos a ministerios" items={ministerios} />
          )}

          {/* 7.2 */}
          {masters.length === 0 ? (
            <EmptyPortalesMaster />
          ) : (
            <SubSeccion codigo="7.2" titulo="Tus accesos a portales de máster" items={masters} />
          )}
        </div>
      )}
    </SeccionPanel>
  );
}
