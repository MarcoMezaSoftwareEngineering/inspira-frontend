// src/pages/backoffice/solicitudes/SolicitudesList.jsx
import { useState } from "react";
import { useSolicitudes } from "./hooks/useSolicitudes";
import { dialog } from "../../../services/dialogService";
import { usePapelera } from "./hooks/usePapelera";
import SolicitudRow, { SolicitudCard } from "./components/SolicitudRow";
import CreateSolicitudAdmin from "./CreateSolicitudAdmin";
import { useAuth } from "../context/AuthContext";

export default function SolicitudesList({ onVerSolicitud }) {
  const { isAdmin } = useAuth();
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [tab, setTab] = useState("activas"); // "activas" | "papelera"

  const {
    solicitudes, loading,
    searchCliente, setSearchCliente,
    page, pageSize, total, totalPages,
    cargarSolicitudes, eliminarSolicitud,
    handleSearchSubmit, changePage,
  } = useSolicitudes();

  const papelera = usePapelera({ activo: tab === "papelera" });

  async function handleEliminar(id) {
    if (!isAdmin) return;
    if (!await dialog.confirm("¿Seguro que quieres eliminar esta solicitud?")) return;
    eliminarSolicitud(id);
  }

  async function handleRestaurar(id) {
    await papelera.restaurar(id);
  }

  async function handlePurgar(id) {
    await papelera.purgar(id);
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Cabecera */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-primary">Solicitudes</h1>
            <p className="text-sm text-neutral-500">Expedientes de clientes</p>
          </div>

          {/* Tabs — solo admins ven la papelera */}
          {isAdmin && (
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-sm font-medium">
              <button
                onClick={() => setTab("activas")}
                className={`px-4 py-2 transition ${tab === "activas" ? "bg-primary text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
              >
                Activas
              </button>
              <button
                onClick={() => setTab("papelera")}
                className={`px-4 py-2 transition border-l border-neutral-200 ${tab === "papelera" ? "bg-red-600 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
              >
                Papelera {papelera.total > 0 && <span className="ml-1 text-xs">({papelera.total})</span>}
              </button>
            </div>
          )}
        </div>

        {/* Barra de búsqueda + crear (solo en tab activas) */}
        {tab === "activas" && (
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
              <input
                type="text"
                className="flex-1 min-w-0 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Buscar por cliente o correo…"
                value={searchCliente}
                onChange={(e) => setSearchCliente(e.target.value)}
              />
              <button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium whitespace-nowrap">
                Buscar
              </button>
            </form>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setMostrarCrear((v) => !v)}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-white font-medium whitespace-nowrap"
              >
                {mostrarCrear ? "✕ Cerrar" : "+ Crear solicitud"}
              </button>
            )}
          </div>
        )}
      </div>

      {tab === "activas" && isAdmin && mostrarCrear && (
        <CreateSolicitudAdmin
          onCreated={() => { cargarSolicitudes({ page: 1 }); setMostrarCrear(false); }}
          onCerrar={() => setMostrarCrear(false)}
        />
      )}

      {/* ══ TAB ACTIVAS ══ */}
      {tab === "activas" && (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
            <span className="text-sm font-semibold text-neutral-800">Listado</span>
            <span className="text-xs text-neutral-400">
              {loading ? "Cargando…" : `Pág. ${page}/${totalPages} · ${total} resultado${total === 1 ? "" : "s"}`}
            </span>
          </div>

          {loading && <div className="p-8 text-center text-neutral-400 text-sm">Cargando solicitudes…</div>}
          {!loading && solicitudes.length === 0 && (
            <p className="p-6 text-sm text-neutral-400 text-center">No se encontraron solicitudes.</p>
          )}

          {!loading && solicitudes.length > 0 && (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-[#e8f5ee] text-[#1a5c3a] text-left text-xs font-bold uppercase tracking-wide">
                      {["#ID", "Cliente", "Tipo", "Estado", "Origen", "Fecha", "Pagado", "Acciones"].map((h) => (
                        <th key={h} className={`px-3 py-3 ${h === "Acciones" ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((s) => (
                      <SolicitudRow key={s.id_solicitud} s={s} isAdmin={isAdmin} onVer={onVerSolicitud} onEliminar={handleEliminar} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden divide-y divide-neutral-100">
                {solicitudes.map((s) => (
                  <SolicitudCard key={s.id_solicitud} s={s} isAdmin={isAdmin} onVer={onVerSolicitud} onEliminar={handleEliminar} />
                ))}
              </div>

              <div className="px-4 py-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs bg-neutral-50">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Filas:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => cargarSolicitudes({ page: 1, pageSize: Number(e.target.value) })}
                    className="border border-neutral-200 rounded px-2 py-1 text-xs bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changePage(page - 1)} disabled={page <= 1}
                    className="px-3 py-1.5 border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-100 transition">
                    ← Ant.
                  </button>
                  <span className="text-neutral-500">Pág. {page}/{totalPages}</span>
                  <button onClick={() => changePage(page + 1)} disabled={page >= totalPages}
                    className="px-3 py-1.5 border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-100 transition">
                    Sig. →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ TAB PAPELERA ══ */}
      {tab === "papelera" && isAdmin && (
        <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-red-100 flex justify-between items-center bg-red-50">
            <span className="text-sm font-semibold text-red-700">Solicitudes eliminadas</span>
            <span className="text-xs text-red-400">
              {papelera.loading ? "Cargando…" : `${papelera.total} eliminada${papelera.total === 1 ? "" : "s"}`}
            </span>
          </div>

          {papelera.loading && <div className="p-8 text-center text-neutral-400 text-sm">Cargando papelera…</div>}
          {!papelera.loading && papelera.solicitudes.length === 0 && (
            <p className="p-6 text-sm text-neutral-400 text-center">La papelera está vacía.</p>
          )}

          {!papelera.loading && papelera.solicitudes.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-red-50 text-red-700 text-left text-xs font-bold uppercase tracking-wide">
                      {["#ID", "Cliente", "Tipo", "Estado", "Eliminada el", "Acciones"].map((h) => (
                        <th key={h} className={`px-3 py-3 ${h === "Acciones" ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {papelera.solicitudes.map((s) => (
                      <tr key={s.id_solicitud} className="hover:bg-red-50/40 transition">
                        <td className="px-3 py-3 text-neutral-500 font-mono text-xs">#{s.id_solicitud}</td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-neutral-800">{s.cliente?.nombre || "—"}</div>
                          <div className="text-xs text-neutral-400">{s.cliente?.email_contacto}</div>
                        </td>
                        <td className="px-3 py-3 text-neutral-600">{s.tipo?.nombre || "—"}</td>
                        <td className="px-3 py-3 text-neutral-500 text-xs">{s.estado?.nombre || "—"}</td>
                        <td className="px-3 py-3 text-neutral-500 text-xs">
                          {s.eliminada_en ? new Date(s.eliminada_en).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleRestaurar(s.id_solicitud)}
                              className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-light transition"
                            >
                              Restaurar
                            </button>
                            <button
                              onClick={() => handlePurgar(s.id_solicitud)}
                              className="px-3 py-1.5 text-xs font-medium bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
                              title="Eliminar permanentemente"
                            >
                              Purgar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginador papelera */}
              {papelera.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-red-100 flex items-center justify-end gap-2 text-xs bg-red-50">
                  <button onClick={() => papelera.changePage(papelera.page - 1)} disabled={papelera.page <= 1}
                    className="px-3 py-1.5 border border-red-200 rounded-lg disabled:opacity-40 hover:bg-red-100 transition">
                    ← Ant.
                  </button>
                  <span className="text-red-500">Pág. {papelera.page}/{papelera.totalPages}</span>
                  <button onClick={() => papelera.changePage(papelera.page + 1)} disabled={papelera.page >= papelera.totalPages}
                    className="px-3 py-1.5 border border-red-200 rounded-lg disabled:opacity-40 hover:bg-red-100 transition">
                    Sig. →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
