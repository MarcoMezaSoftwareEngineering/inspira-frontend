// InformeBusqueda.jsx
import { useState } from "react";
import { formatearFecha, IconoLinea } from "../utils";
import IconoPaso from "../../../../../components/common/IconoPaso";
import { dialog } from "../../../../../services/dialogService";
import SeccionPanel from "./SeccionPanel";
import TarjetaMaster from "../../../../../components/common/TarjetaMaster";
import { comprobarRespuesta } from "../../../../../services/sesion";

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
  if (score == null) return { text: "text-muted",     bar: "var(--decor)", tag: "bg-neutro-soft text-neutro-ink" };
  if (score >= 80)   return { text: "text-verde",     bar: "var(--green)", tag: "bg-verde-soft text-verde-ink" };
  if (score >= 60)   return { text: "text-aviso-ink", bar: "var(--aviso)", tag: "bg-aviso-soft text-aviso-ink" };
  return               { text: "text-alto-ink",      bar: "var(--alto)",  tag: "bg-alto-soft text-alto-ink" };
}

// ── MasterRow ─────────────────────────────────────────────────────────────────

function MasterRow({ posicion, resultado }) {
  const { master, score } = resultado;
  const col    = scoreColors(score);
  const precio = formatPrecio(master.precio_total_estimado);
  const dur    = formatDuracion(master.duracion_anios);

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-neutro-soft text-neutro-ink text-meta font-bold flex items-center justify-center">
        {posicion}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-tinta leading-tight line-clamp-2">
          {master.nombre_limpio}
        </p>
        <p className="text-meta text-tinta-2 mt-0.5 truncate">
          {master.universidad.nombre_completo}
          {master.universidad.ciudad ? ` · ${master.universidad.ciudad}` : ""}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {master.universidad.ciudad && (
            <span className="inline-flex items-center gap-1 text-meta bg-neutro-soft text-neutro-ink px-2 py-0.5 rounded-md">
              <IconoPaso nombre="pin" className="w-3 h-3" />
              {master.universidad.ciudad}
            </span>
          )}
          {precio && (
            <span className="text-meta bg-neutro-soft text-neutro-ink px-2 py-0.5 rounded-md">
              {precio}
            </span>
          )}
          {dur && (
            <span className="text-meta bg-neutro-soft text-neutro-ink px-2 py-0.5 rounded-md">
              {dur}
            </span>
          )}
          {/* Quién lo paga, junto al precio. Un máster de 5.044 € que oferta la
              Fundación Carolina no es un máster de 5.044 €, y eso es lo que el
              asesorado necesita saber para animarse a pedirla. */}
          {(master.becas || []).length > 0 && (
            <span className="pnl-destacada inline-flex items-center gap-1 text-meta text-tinta border border-sun px-2 py-0.5 rounded-md font-semibold"
              title={master.becas.map((b) => `${b.nombre} — ${b.curso}${b.cubre ? `: ${b.cubre}` : ""}`).join("\n")}>
              <IconoPaso nombre="cap" className="w-3 h-3" />
              lo oferta {[...new Set(master.becas.map((b) => b.entidad))].join(" · ")}
            </span>
          )}
          {/* El máster cuyo enlace pegó el asesorado sale siempre, cuadre o no.
              Si no cuadra con lo que él mismo pidió, se le dice: es el único
              que había elegido y callarlo no le sirve de nada. */}
          {master.es_ancla && (
            <span className="text-meta bg-info-soft text-primary px-2 py-0.5 rounded-md font-semibold">
              el que elegiste
            </span>
          )}
          {master.es_ancla && master.motivo_descarte ? (
            <span className="text-meta px-2 py-0.5 rounded-md font-semibold bg-alto-soft text-alto-ink">
              {master.motivo_descarte}
            </span>
          ) : (
            <span className={`text-meta px-2 py-0.5 rounded-md font-semibold ${col.tag}`}>
              {score != null ? `${score}% match` : "Seleccionado por asesor"}
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0 text-center w-14">
        <div className={`text-xl font-extrabold ${col.text}`}>{score != null ? score : "—"}</div>
        <div className="text-meta text-muted">{score != null ? "match" : ""}</div>
        <div className="mt-1 h-1.5 bg-neutro-soft rounded-full overflow-hidden">
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
      className="pnl-velo-token fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="pnl-hoja w-full sm:max-w-lg flex flex-col pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-linea shrink-0">
          <div>
            <p className="text-sm font-bold text-tinta">
              {curado ? "Programas seleccionados por tu asesor" : "Todos los programas compatibles"}
            </p>
            <p className="text-meta text-tinta-2">{total} programas</p>
          </div>
          <button
            onClick={onClose}
            className="pnl-btn-icono"
            aria-label="Cerrar"
          >
            <IconoPaso nombre="x" strokeWidth={2.2} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 divide-y divide-linea">
          {resultados.map((r, i) => (
            <MasterRow key={r.master.id_master} posicion={i + 1} resultado={r} />
          ))}
        </div>
        <div className="shrink-0 px-5 py-4 border-t border-linea">
          <button
            onClick={onClose}
            className="pnl-btn-primario w-full"
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
  // Los que quedan fuera de su plan pero tienen beca que paga la matrícula:
  // son opciones condicionadas a conseguirla, no parte de lo que contrató.
  const soloConBeca   = compat?.solo_con_beca || [];

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
      await comprobarRespuesta(resp);
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
      {!hasFormData && !loadingCompat && !hayResultados && !disponible && (
        <div className="pnl-aviso pnl-aviso-bloque" data-tono="neutro">
          <span className="pnl-aviso-icono"><IconoPaso nombre="search" /></span>
          <div className="pnl-aviso-texto">
            <p className="pnl-informe-nota-titulo">Completa tu formulario académico</p>
            <p>
              Rellena los pasos del formulario (sección 3) para ver tu informe personalizado de másteres.
            </p>
          </div>
        </div>
      )}

      {/* ── Cargando ──────────────────────────────────────────────────────── */}
      {loadingCompat && (
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="w-14 h-14 rounded-2xl bg-info-soft flex items-center justify-center">
            <div className="pnl-spinner" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-tinta">Tu informe está cargando</p>
            <p className="text-cuerpo-sm text-tinta-2 mt-1.5 max-w-xs mx-auto">
              Estamos analizando tu perfil académico y buscando los mejores másteres para ti.
            </p>
          </div>
        </div>
      )}

      {/* ── Informe en creación (asesor trabajando) ───────────────────────── */}
      {hasFormData && !loadingCompat && enCreacion && !disponible && (
        <div className="pnl-aviso pnl-aviso-bloque" data-tono="info">
          <span className="pnl-aviso-icono"><IconoLinea nombre="clock" /></span>
          <div className="pnl-aviso-texto">
            <p className="pnl-informe-nota-titulo">Informe en preparación</p>
            <p>
              Nuestro equipo está analizando tu perfil y seleccionando los mejores másteres para ti.
              Te notificaremos por email cuando esté listo.
            </p>
          </div>
        </div>
      )}

      {/* ── Formulario guardado pero sin resultado aún ────────────────────── */}
      {hasFormData && !loadingCompat && !compat && !disponible && (
        <div className="pnl-aviso pnl-aviso-bloque" data-tono="neutro">
          <span className="pnl-aviso-icono"><IconoLinea nombre="clock" /></span>
          <div className="pnl-aviso-texto">
            <p className="pnl-informe-nota-titulo">En preparación</p>
            <p>
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
            <div className="pnl-informe-pdf flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="pnl-ico" data-talla="l" data-tono="ok">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-tinta">
                    {informe.informe_nombre_original || "Informe PDF del asesor"}
                  </p>
                  <p className="text-meta text-verde-ink mt-0.5">
                    Disponible desde: {formatearFecha(informe.informe_fecha_subida)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => manejarPDF("ver")}
                  className="pnl-btn">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ver
                </button>
                <button onClick={() => manejarPDF("descargar")}
                  className="pnl-btn-primario">
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
                <div className="pnl-chip" data-tono={curado ? "info" : "ok"}>
                  <IconoPaso nombre={curado ? "edit" : "check"} className="w-3.5 h-3.5" strokeWidth={2.2} />
                  {curado ? "Lista personalizada por tu asesor" : `Informe listo · Generado el ${new Date().toLocaleDateString("es-ES")}`}
                </div>
              </div>

              <div className="pnl-informe-caja">
                <div className="pnl-informe-cab">
                  <span className="pnl-ico" data-talla="l"><IconoPaso nombre="cap" /></span>
                  <div className="min-w-0">
                    <p className="pnl-informe-cab-titulo">
                      Informe de Másteres{perfil?.nombre ? ` — ${perfil.nombre}` : ""}
                    </p>
                    <p className="pnl-informe-cab-texto">
                      {[
                        perfil?.area,
                        perfil?.ccaa?.length ? perfil.ccaa.join(", ") : null,
                        perfil?.presupuesto ? `Máx. €${Number(perfil.presupuesto).toLocaleString("es-ES")}` : null,
                      ].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="pnl-informe-cuerpo">
                  <p className="text-cuerpo text-tinta-2 mb-1">
                    {curado ? (
                      <>
                        Tu asesor ha preparado{" "}
                        <strong className="text-tinta">
                          {compat.total} programa{compat.total !== 1 ? "s" : ""}
                        </strong>{" "}
                        seleccionado{compat.total !== 1 ? "s" : ""} para ti.
                      </>
                    ) : (
                      <>
                        Se encontraron{" "}
                        <strong className="text-tinta">{compat.total} programas compatibles</strong>.
                        {compat.total > 0 && " Top 5 recomendados:"}
                      </>
                    )}
                  </p>

                  {resultados.length === 0 ? (
                    <p className="text-sm text-muted py-4 text-center italic">
                      No se encontraron programas compatibles con tu perfil actual.
                    </p>
                  ) : (
                    <div className="ex-lista-m mt-3">
                      {resultados.map((r, i) => (
                        <div key={r.master.id_master}>
                          <TarjetaMaster
                            resultado={r}
                            posicion={i + 1}
                            total={resultados.length}
                            nota={r.nota_asesor || null}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {soloConBeca.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-sun/50">
                      <p className="text-sm font-bold text-tinta">Fuera de tu plan, pero con beca</p>
                      <p className="text-meta text-tinta-2 mt-0.5 mb-3">
                        Estos están en comunidades que tu paquete no cubre. Sólo son posibles si consigues la beca que los oferta —habla con tu asesora antes de contar con ellos.
                      </p>
                      <div className="ex-lista-m">
                        {soloConBeca.map((r) => (
                          <TarjetaMaster key={r.master.id_master} resultado={r} nota={r.nota_asesor || null} />
                        ))}
                      </div>
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
