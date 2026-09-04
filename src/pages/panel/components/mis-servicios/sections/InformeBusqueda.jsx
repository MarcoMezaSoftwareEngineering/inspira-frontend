// InformeBusqueda.jsx
import { useState } from "react";
import { formatearFecha } from "../utils";
import { dialog } from "../../../../../services/dialogService";
import SeccionPanel from "./SeccionPanel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrecio(precio) {
  if (!precio) return null;
  return `€${Math.round(precio).toLocaleString("es-ES")}/año`;
}

function formatDuracion(anios) {
  if (!anios) return null;
  const n = Number(anios);
  if (n === 1)   return "1 año";
  if (n === 1.5) return "18 meses";
  return `${n} años`;
}

function scoreColors(score) {
  if (score == null) return { text: "text-neutral-400", bar: "#d1d5db", tag: "bg-neutral-100 text-neutral-500" };
  if (score >= 80)   return { text: "text-emerald-600", bar: "#10b981", tag: "bg-emerald-50 text-emerald-700" };
  if (score >= 60)   return { text: "text-amber-600",   bar: "#f59e0b", tag: "bg-amber-50 text-amber-700" };
  return               { text: "text-red-500",           bar: "#ef4444", tag: "bg-red-50 text-red-600" };
}

// ── MasterRow ─────────────────────────────────────────────────────────────────

function MasterRow({ posicion, resultado }) {
  const { master, score } = resultado;
  const col    = scoreColors(score);
  const precio = formatPrecio(master.precio_total_estimado);
  const dur    = formatDuracion(master.duracion_anios);

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-neutral-100 text-neutral-500 text-xs font-bold flex items-center justify-center">
        {posicion}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-800 leading-tight line-clamp-2">
          {master.nombre_limpio}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5 truncate">
          {master.universidad.nombre_completo}
          {master.universidad.ciudad ? ` · ${master.universidad.ciudad}` : ""}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {master.universidad.ciudad && (
            <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">
              📍 {master.universidad.ciudad}
            </span>
          )}
          {precio && (
            <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">
              {precio}
            </span>
          )}
          {dur && (
            <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">
              {dur}
            </span>
          )}
          <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${col.tag}`}>
            {score != null ? `${score}% match` : "Seleccionado por asesor"}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-center w-14">
        <div className={`text-xl font-black ${col.text}`}>{score != null ? score : "—"}</div>
        <div className="text-[10px] text-neutral-400">{score != null ? "match" : ""}</div>
        <div className="mt-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${score ?? 0}%`, background: col.bar }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Modal listado completo ─────────────────────────────────────────────────────

function ModalListadoCompleto({ resultados, total, curado, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div>
            <p className="text-sm font-bold text-neutral-800">
              {curado ? "Programas seleccionados por tu asesor" : "Todos los programas compatibles"}
            </p>
            <p className="text-xs text-neutral-500">{total} programas</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition text-sm"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 divide-y divide-neutral-100">
          {resultados.map((r, i) => (
            <MasterRow key={r.master.id_master} posicion={i + 1} resultado={r} />
          ))}
        </div>
        <div className="shrink-0 px-5 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function InformeBusqueda({ idSolicitud, informe, hasFormData, compat, loadingCompat }) {
  const [modalAbierto, setModal] = useState(false);

  const disponible    = !!informe?.informe_fecha_subida;
  const enCreacion    = compat?.estado === "en_creacion";
  const resultados    = compat?.resultados || [];
  const perfil        = compat?.perfil;
  const curado        = !!compat?.curado;
  const hayResultados = resultados.length > 0;

  const estado = disponible || hayResultados
    ? "completado"
    : loadingCompat
      ? "cargando"
      : "pendiente";

  const subtitulo = disponible
    ? `PDF disponible desde ${formatearFecha(informe.informe_fecha_subida)}`
    : hayResultados
      ? curado
        ? `${compat.total} programa${compat.total !== 1 ? "s" : ""} seleccionado${compat.total !== 1 ? "s" : ""} por tu asesor`
        : `${compat.total} programas compatibles encontrados`
      : enCreacion
        ? "Tu asesor está preparando tu informe personalizado"
        : loadingCompat
          ? "Calculando tu informe…"
          : hasFormData
            ? "Procesando tu informe…"
            : "Completa el formulario para ver tu informe";

  async function manejarPDF(modo) {
    try {
      const token = localStorage.getItem("token");
      if (!token) { dialog.toast("No existe sesión", "error"); return; }
      const resp = await fetch(
        `${API_URL}/api/panel/solicitudes/${idSolicitud}/informe${modo === "ver" ? "?view=1" : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!resp.ok) { dialog.toast("No se pudo obtener el PDF", "error"); return; }
      const blob = await resp.blob();
      const url  = window.URL.createObjectURL(blob);
      if (modo === "ver") {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href     = url;
        a.download = informe?.informe_nombre_original || "informe-busqueda-masteres";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      window.URL.revokeObjectURL(url);
    } catch { dialog.toast("Error al abrir el PDF", "error"); }
  }

  return (
    <SeccionPanel
      numero="4"
      titulo="Informe de búsqueda de másteres"
      subtitulo={subtitulo}
      estado={estado}
      sectionId="4"
    >
      {/* ── Formulario incompleto ─────────────────────────────────────────── */}
      {!hasFormData && !loadingCompat && (
        <div className="flex items-start gap-3 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-xl">
            🔍
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700">Completa tu formulario académico</p>
            <p className="text-sm text-neutral-500 mt-0.5">
              Rellena los pasos del formulario (sección 3) para ver tu informe personalizado de másteres.
            </p>
          </div>
        </div>
      )}

      {/* ── Cargando ──────────────────────────────────────────────────────── */}
      {loadingCompat && (
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <div className="w-7 h-7 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-800">Tu informe está cargando</p>
            <p className="text-xs text-neutral-500 mt-1.5 max-w-xs mx-auto">
              Estamos analizando tu perfil académico y buscando los mejores másteres para ti.
            </p>
          </div>
        </div>
      )}

      {/* ── Informe en creación (asesor trabajando) ───────────────────────── */}
      {hasFormData && !loadingCompat && enCreacion && !disponible && (
        <div className="flex items-start gap-4 bg-primary/5 border border-primary/15 rounded-xl p-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-xl">
            ⏳
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">Informe en preparación</p>
            <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
              Nuestro equipo está analizando tu perfil y seleccionando los mejores másteres para ti.
              Te notificaremos por email cuando esté listo.
            </p>
          </div>
        </div>
      )}

      {/* ── Formulario guardado pero sin resultado aún ────────────────────── */}
      {hasFormData && !loadingCompat && !compat && !disponible && (
        <div className="flex items-start gap-3 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700">En preparación</p>
            <p className="text-sm text-neutral-500 mt-0.5">
              Tu informe se generará automáticamente. Si no aparece, recarga la página.
            </p>
          </div>
        </div>
      )}

      {/* ── Informe disponible ─────────────────────────────────────────────── */}
      {!loadingCompat && !enCreacion && (disponible || compat) && (
        <div className="space-y-4">

          {/* MODO A — PDF manual */}
          {disponible && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    {informe.informe_nombre_original || "Informe PDF del asesor"}
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Disponible desde: {formatearFecha(informe.informe_fecha_subida)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => manejarPDF("ver")}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white transition-all active:scale-95">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ver
                </button>
                <button onClick={() => manejarPDF("descargar")}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-light transition-all active:scale-95">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 10l-4 4-4-4M12 4v10" />
                  </svg>
                  Descargar
                </button>
              </div>
            </div>
          )}

          {/* MODO B — Lista de compatibilidad (auto o curada) */}
          {compat && (
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                  curado
                    ? "bg-[#1D6A4A]/10 text-[#1D6A4A]"
                    : "bg-emerald-100 text-emerald-800"
                }`}>
                  {curado ? "✏️ Lista personalizada por tu asesor" : `✓ Informe listo · Generado el ${new Date().toLocaleDateString("es-ES")}`}
                </div>
              </div>

              <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-primary text-white px-5 py-4 flex items-center gap-3">
                  <span className="text-2xl shrink-0">🎓</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-snug">
                      Informe de Másteres{perfil?.nombre ? ` — ${perfil.nombre}` : ""}
                    </p>
                    <p className="text-xs opacity-70 mt-0.5 truncate">
                      {[
                        perfil?.area,
                        perfil?.ccaa?.length ? perfil.ccaa.join(", ") : null,
                        perfil?.presupuesto ? `Máx. €${Number(perfil.presupuesto).toLocaleString("es-ES")}` : null,
                      ].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <p className="text-sm text-neutral-600 mb-1">
                    {curado ? (
                      <>
                        Tu asesor ha preparado{" "}
                        <strong className="text-neutral-800">
                          {compat.total} programa{compat.total !== 1 ? "s" : ""}
                        </strong>{" "}
                        seleccionado{compat.total !== 1 ? "s" : ""} para ti.
                      </>
                    ) : (
                      <>
                        Se encontraron{" "}
                        <strong className="text-neutral-800">{compat.total} programas compatibles</strong>.
                        {compat.total > 0 && " Top 5 recomendados:"}
                      </>
                    )}
                  </p>

                  {resultados.length === 0 ? (
                    <p className="text-sm text-neutral-400 py-4 text-center italic">
                      No se encontraron programas compatibles con tu perfil actual.
                    </p>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {resultados.slice(0, 5).map((r, i) => (
                        <MasterRow key={r.master.id_master} posicion={i + 1} resultado={r} />
                      ))}
                    </div>
                  )}

                  {compat.total > 5 && (
                    <div className="text-center mt-4">
                      <button
                        onClick={() => setModal(true)}
                        className="px-5 py-2 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all active:scale-95"
                      >
                        Ver los {compat.total} programas →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {modalAbierto && (
        <ModalListadoCompleto
          resultados={resultados}
          total={compat?.total || 0}
          curado={curado}
          onClose={() => setModal(false)}
        />
      )}
    </SeccionPanel>
  );
}
