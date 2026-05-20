// src/pages/backoffice/documentos/DocumentosBackoffice.jsx
import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { getUser, descargarZipCliente } from "./documentosUtils";
import { TreeNode, SolicitudNode, DriveIcon } from "./DocumentosTree";
import { API_URL } from "./documentosUtils";
import AprobacionDocumentos from "./AprobacionDocumentos";

function DriveToast({ state }) {
  const visible = state !== "hidden";
  const isError = state === "error";
  return (
    <div
      className={`fixed top-5 left-1/2 z-[300] flex items-center gap-3 bg-white border shadow-2xl rounded-2xl px-5 py-3.5 transition-all duration-300 select-none pointer-events-none
        ${visible ? "opacity-100 -translate-x-1/2 translate-y-0" : "opacity-0 -translate-x-1/2 -translate-y-3"}
        ${isError ? "border-red-200" : "border-neutral-200"}`}
    >
      <DriveIcon size={22} />
      <div>
        <p className={`text-sm font-semibold ${isError ? "text-red-700" : "text-neutral-800"}`}>
          {isError ? "No disponible en Drive" : "Abriendo en Drive…"}
        </p>
        <p className="text-xs text-neutral-400">
          {isError ? "El archivo puede no estar sincronizado aún" : "Se abrirá en una nueva pestaña"}
        </p>
      </div>
    </div>
  );
}

function useDriveToast() {
  const [toastState, setToastState] = useState("hidden");

  useEffect(() => {
    let timer;
    const onOpen = () => {
      clearTimeout(timer);
      setToastState("opening");
      timer = setTimeout(() => setToastState("hidden"), 3000);
    };
    const onError = () => {
      clearTimeout(timer);
      setToastState("error");
      timer = setTimeout(() => setToastState("hidden"), 3000);
    };
    window.addEventListener("drive-opening", onOpen);
    window.addEventListener("drive-error", onError);
    return () => {
      window.removeEventListener("drive-opening", onOpen);
      window.removeEventListener("drive-error", onError);
      clearTimeout(timer);
    };
  }, []);

  return toastState;
}

async function abrirCarpetaCliente(idCliente) {
  window.dispatchEvent(new CustomEvent("drive-opening"));
  const token = localStorage.getItem("bo_token");
  try {
    const r = await fetch(`${API_URL}/api/admin/clientes/${idCliente}/drive-folder-url`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    if (data.ok && data.url) window.open(data.url, "_blank");
    else window.dispatchEvent(new CustomEvent("drive-error"));
  } catch {
    window.dispatchEvent(new CustomEvent("drive-error"));
  }
}

function countDocs(lista) {
  return lista.reduce(
    (a, c) =>
      a +
      c.solicitudes.reduce(
        (b, s) =>
          b +
          s.items.reduce((c2, it) => c2 + it.documentos.length, 0) +
          (s.informe ? 1 : 0) +
          (s.justificantes?.length || 0),
        0
      ),
    0
  );
}

function countByEstado(lista) {
  const counts = { APROBADO: 0, OBSERVADO: 0, SUBIDO: 0, INFORME: 0, PORTAL: 0 };
  for (const c of lista) {
    for (const s of c.solicitudes) {
      for (const it of s.items) {
        for (const doc of it.documentos) {
          const e = doc.estado_revision;
          if (e === "APROBADO") counts.APROBADO++;
          else if (e === "OBSERVADO") counts.OBSERVADO++;
          else counts.SUBIDO++;
        }
      }
      if (s.informe) counts.INFORME++;
      counts.PORTAL += s.justificantes?.length || 0;
    }
  }
  return counts;
}

// Filtro por texto: busca en nombre de doc, item, solicitud, cliente
function filtrarPorTexto(lista, q) {
  if (!q) return lista;
  return lista
    .map((c) => ({
      ...c,
      solicitudes: c.solicitudes
        .map((s) => ({
          ...s,
          items: s.items
            .map((it) => ({
              ...it,
              documentos: it.documentos.filter(
                (d) =>
                  d.nombre_original.toLowerCase().includes(q) ||
                  it.nombre.toLowerCase().includes(q) ||
                  s.titulo.toLowerCase().includes(q) ||
                  c.nombre.toLowerCase().includes(q) ||
                  (c.email && c.email.toLowerCase().includes(q))
              ),
            }))
            .filter((it) => it.documentos.length > 0),
        }))
        .filter((s) => s.items.length > 0 || s.informe || (s.justificantes?.length ?? 0) > 0),
    }))
    .filter((c) => c.solicitudes.length > 0);
}

// Filtro profundo por estado/tipo: muestra solo los documentos que corresponden
function filtrarPorEstado(lista, filtro) {
  if (!filtro) return lista;
  return lista
    .map((c) => ({
      ...c,
      solicitudes: c.solicitudes
        .map((s) => {
          if (filtro === "INFORME") {
            return { ...s, justificantes: undefined, items: [] };
          }
          if (filtro === "PORTAL") {
            return { ...s, informe: undefined, items: [] };
          }
          return {
            ...s,
            informe: undefined,
            justificantes: undefined,
            items: s.items
              .map((it) => ({
                ...it,
                documentos: it.documentos.filter((doc) => {
                  if (filtro === "SUBIDO") {
                    return doc.estado_revision !== "APROBADO" && doc.estado_revision !== "OBSERVADO";
                  }
                  return doc.estado_revision === filtro;
                }),
              }))
              .filter((it) => it.documentos.length > 0),
          };
        })
        .filter((s) => {
          if (filtro === "INFORME") return !!s.informe;
          if (filtro === "PORTAL") return (s.justificantes?.length || 0) > 0;
          return s.items.length > 0;
        }),
    }))
    .filter((c) => c.solicitudes.length > 0);
}

function eliminarDocDeEstructura(lista, idDocumento) {
  return lista.map((entry) => ({
    ...entry,
    solicitudes: entry.solicitudes.map((s) => ({
      ...s,
      items: s.items.map((it) => ({
        ...it,
        documentos: it.documentos.filter((d) => d.id_documento !== idDocumento),
      })),
    })),
  }));
}

function entryId(entry) {
  return entry.id_cliente ?? entry.id_usuario ?? `null-${entry.nombre}`;
}

const POR_PAGINA = 20;

const FILTROS = [
  { key: "APROBADO", label: "Aprobados",     icon: "✅", color: "green" },
  { key: "OBSERVADO", label: "Observados",   icon: "⚠️", color: "yellow" },
  { key: "SUBIDO",    label: "Sin revisar",  icon: "📤", color: "blue" },
  { key: "INFORME",   label: "Informes",     icon: "📑", color: "purple" },
  { key: "PORTAL",    label: "Justificantes", icon: "🗂️", color: "teal" },
];

const COLOR = {
  green:  { card: "bg-green-50 border-green-200",   text: "text-green-700",  sub: "text-green-600",  active: "bg-green-500 border-green-600 text-white ring-green-400" },
  yellow: { card: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", sub: "text-yellow-600", active: "bg-yellow-500 border-yellow-600 text-white ring-yellow-400" },
  blue:   { card: "bg-blue-50 border-blue-200",     text: "text-blue-700",   sub: "text-blue-600",   active: "bg-blue-500 border-blue-600 text-white ring-blue-400" },
  purple: { card: "bg-purple-50 border-purple-200", text: "text-purple-700", sub: "text-purple-600", active: "bg-purple-500 border-purple-600 text-white ring-purple-400" },
  teal:   { card: "bg-teal-50 border-teal-200",     text: "text-teal-700",   sub: "text-teal-600",   active: "bg-teal-500 border-teal-600 text-white ring-teal-400" },
};

export default function DocumentosBackoffice() {
  const toastState = useDriveToast();
  const [clientes, setClientes] = useState([]);
  const [internos, setInternos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [expandedMap, setExpandedMap] = useState({});
  const [pagina, setPagina] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState(null);
  const [tabActivo, setTabActivo] = useState("arbol");

  const usuario = getUser();
  const isAdmin = usuario?.rol === "admin";

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    setError("");
    const r = await boGET("/backoffice/documentos");
    if (r.ok) {
      setClientes(r.clientes || []);
      setInternos(r.internos || []);
    } else {
      setError(r.msg || "No se pudieron cargar los documentos");
    }
    setLoading(false);
  }

  function handleEliminarGlobal(idDocumento) {
    setClientes((prev) => eliminarDocDeEstructura(prev, idDocumento));
    setInternos((prev) => eliminarDocDeEstructura(prev, idDocumento));
  }

  const todos = [...clientes, ...internos].sort((a, b) =>
    (a.nombre || "").localeCompare(b.nombre || "")
  );

  const q = busqueda.toLowerCase().trim();
  const listaFiltrada = filtrarPorEstado(filtrarPorTexto(todos, q), filtroEstado);

  // Resetear página Y colapsar todo al cambiar filtro o búsqueda
  useEffect(() => {
    setPagina(0);
    // Colapsar con false explícito (no undefined) para que TreeNode responda
    setExpandedMap((prev) => {
      const m = {};
      Object.keys(prev).forEach((k) => { m[k] = false; });
      return m;
    });
  }, [busqueda, filtroEstado]);

  const totalDocs = countDocs(todos);
  const estadoCounts = countByEstado(todos);
  const totalPaginas = Math.ceil(listaFiltrada.length / POR_PAGINA);
  const listaVisible = listaFiltrada.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);

  // Expandir / contraer todo
  const allExpanded =
    listaVisible.length > 0 &&
    listaVisible.every((e) => expandedMap[entryId(e)] === true);

  function toggleExpandAll() {
    const map = {};
    if (allExpanded) {
      // false explícito → TreeNode recibe forceOpen=false (no undefined) y se cierra
      listaFiltrada.forEach((e) => { map[entryId(e)] = false; });
    } else {
      listaFiltrada.forEach((e) => { map[entryId(e)] = true; });
    }
    setExpandedMap(map);
  }

  function ExpandBtn({ id }) {
    return (
      <button
        onClick={() => setExpandedMap((prev) => ({ ...prev, [id]: prev[id] !== true }))}
        title={expandedMap[id] ? "Contraer" : "Expandir"}
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors shrink-0 leading-none ${
          expandedMap[id]
            ? "border-amber-400 text-amber-600 bg-amber-50 hover:bg-amber-100"
            : "border-indigo-400 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
        }`}
      >
        {expandedMap[id] ? "−" : "+"}
      </button>
    );
  }

  function ZipBtn({ idCliente, nombre }) {
    const [descargando, setDescargando] = useState(false);
    async function handleClick(e) {
      e.stopPropagation();
      setDescargando(true);
      await descargarZipCliente(idCliente, nombre);
      setDescargando(false);
    }
    return (
      <button
        onClick={handleClick}
        disabled={descargando}
        title="Descargar todos los documentos en ZIP"
        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border border-neutral-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 active:scale-95 transition-all duration-150 shrink-0 disabled:opacity-50"
      >
        {descargando ? "⏳" : "⬇"} <span className="hidden sm:inline">{descargando ? "Descargando…" : "ZIP"}</span>
      </button>
    );
  }

  const filtroActivo = FILTROS.find((f) => f.key === filtroEstado);

  return (
    // h-full ocupa exactamente el <main flex-1 overflow-y-auto> sin añadir scroll extra
    <div className="h-full overflow-hidden flex flex-col p-4 sm:p-5 gap-3">
      <DriveToast state={toastState} />

      {/* ── Cabecera ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary leading-tight">Documentos</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Gestión centralizada de archivos</p>
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, cliente…"
            className="flex-1 sm:w-56 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
          <button
            onClick={cargar}
            title="Recargar"
            className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-500 text-base shrink-0"
          >
            ↻
          </button>
        </div>
      </div>

      {/* ── Pestañas ─────────────────────────────────────────────── */}
      <div className="shrink-0 flex gap-0.5 border-b border-neutral-200">
        
        <button
          onClick={() => setTabActivo("aprobacion")}
          className={`flex items-center gap-1.5 text-sm px-4 py-2 font-medium border-b-2 transition-colors -mb-px ${
            tabActivo === "aprobacion"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
          }`}
        >
          ✔️ Aprobación
          {!loading && estadoCounts.SUBIDO > 0 && (
            <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
              {estadoCounts.SUBIDO}
            </span>
          )}
        </button>

        <button
          onClick={() => setTabActivo("arbol")}
          className={`flex items-center gap-1.5 text-sm px-4 py-2 font-medium border-b-2 transition-colors -mb-px ${
            tabActivo === "arbol"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
          }`}
        >
          📂 Árbol de Documentos
        </button>
      </div>

      {error && (
        <div className="shrink-0 p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {tabActivo === "aprobacion" && (
        <div className="flex flex-1 min-h-0">
          <AprobacionDocumentos clientes={clientes} internos={internos} loading={loading} />
        </div>
      )}

      {tabActivo === "arbol" && <>

      {/* ── Stats: fila en móvil, sidebar en desktop ─────────────── */}
      {/* Móvil: fila horizontal scrollable de stats */}
      <div className="sm:hidden shrink-0 flex gap-2 overflow-x-auto pb-1">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-3 min-w-[90px] shrink-0">
          <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-neutral-800">{loading ? "…" : totalDocs}</p>
          <p className="text-[10px] text-neutral-400">{listaFiltrada.length} clientes</p>
        </div>
        {FILTROS.map((f) => {
          const active = filtroEstado === f.key;
          const c = COLOR[f.color];
          return (
            <button
              key={f.key}
              onClick={() => setFiltroEstado(active ? null : f.key)}
              className={`rounded-xl border shadow-sm p-3 text-left transition-all select-none min-w-[90px] shrink-0 ${active ? `${c.active} ring-2 ring-offset-1` : `${c.card}`}`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-sm">{f.icon}</span>
                <p className={`text-[10px] font-semibold uppercase ${active ? "text-white/90" : c.sub}`}>{f.label}</p>
              </div>
              <p className={`text-xl font-bold ${active ? "text-white" : c.text}`}>{loading ? "…" : estadoCounts[f.key]}</p>
            </button>
          );
        })}
      </div>

      {/* ── Layout: sidebar (solo desktop) + panel ───────────────── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Sidebar — solo desktop */}
        <div className="hidden sm:flex w-44 shrink-0 flex-col gap-2.5 overflow-y-auto">

          {/* Total */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-3.5">
            <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mb-0.5">Total</p>
            <p className="text-3xl font-bold text-neutral-800 leading-none">{loading ? "…" : totalDocs}</p>
            <p className="text-[11px] text-neutral-400 mt-1">{loading ? "" : `${listaFiltrada.length} clientes`}</p>
          </div>

          {/* Tarjetas de estado = filtros */}
          {FILTROS.map((f) => {
            const active = filtroEstado === f.key;
            const c = COLOR[f.color];
            return (
              <button
                key={f.key}
                onClick={() => setFiltroEstado(active ? null : f.key)}
                title={active ? "Quitar filtro" : `Filtrar por ${f.label.toLowerCase()}`}
                className={`rounded-xl border shadow-sm p-3.5 text-left transition-all select-none ${
                  active
                    ? `${c.active} ring-2 ring-offset-1`
                    : `${c.card} hover:brightness-[0.97]`
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm leading-none">{f.icon}</span>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${active ? "text-white/90" : c.sub}`}>
                    {f.label}
                  </p>
                </div>
                <p className={`text-2xl font-bold leading-none ${active ? "text-white" : c.text}`}>
                  {loading ? "…" : estadoCounts[f.key]}
                </p>
                <p className={`text-[10px] mt-1 ${active ? "text-white/70" : "text-neutral-400"}`}>
                  {active ? "Activo · clic para quitar" : "Clic para filtrar"}
                </p>
              </button>
            );
          })}
        </div>

        {/* Panel principal */}
        <div className="flex-1 min-w-0 bg-white border border-neutral-200 rounded-xl shadow-sm flex flex-col min-h-0">

          {/* Barra de herramientas */}
          <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2 border-b border-neutral-200 bg-neutral-50 rounded-t-xl">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {filtroActivo ? (
                <>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${COLOR[filtroActivo.color].card} ${COLOR[filtroActivo.color].text}`}>
                    {filtroActivo.icon} {filtroActivo.label}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {listaFiltrada.length} clientes · {countDocs(listaFiltrada)} archivos
                  </span>
                  <button
                    onClick={() => setFiltroEstado(null)}
                    className="text-[11px] px-2 py-0.5 rounded-full border border-neutral-300 text-neutral-500 hover:bg-neutral-100"
                  >
                    ✕ Quitar
                  </button>
                </>
              ) : (
                <span className="text-xs text-neutral-500">
                  {loading ? "Cargando…" : `${listaFiltrada.length} clientes · ${countDocs(listaFiltrada)} archivos`}
                </span>
              )}
            </div>

            {/* Expandir / contraer todo */}
            {!loading && listaFiltrada.length > 0 && (
              <button
                onClick={toggleExpandAll}
                title={allExpanded ? "Contraer todo" : "Expandir todo"}
                className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border font-medium transition-colors shrink-0 ${
                  allExpanded
                    ? "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                    : "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                }`}
              >
                <span>{allExpanded ? "▴" : "▾"}</span>
                {allExpanded ? "Contraer todo" : "Expandir todo"}
              </button>
            )}
          </div>

          {/* Lista scrollable */}
          <div className="flex-1 overflow-y-auto p-3 min-h-0">
            {loading && (
              <div className="py-20 text-center text-neutral-400 text-sm">
                <div className="text-3xl mb-3">📂</div>
                Cargando documentos…
              </div>
            )}
            {!loading && listaFiltrada.length === 0 && (
              <div className="py-16 text-center text-neutral-400 text-sm">
                <div className="text-3xl mb-3">🔍</div>
                {q || filtroEstado ? "Sin resultados para este filtro." : "No hay documentos aún."}
              </div>
            )}
            {!loading && listaVisible.length > 0 && (
              <div key={`${filtroEstado ?? "none"}-${q}`} className="space-y-0.5">
                {listaVisible.map((entry) => {
                  const id = entryId(entry);
                  return (
                    <TreeNode
                      key={id}
                      icon="👤"
                      label={entry.nombre}
                      sublabel={entry.rol ? `${entry.rol} · ${entry.email || ""}` : entry.email}
                      count={countDocs([entry])}
                      forceOpen={expandedMap[id]}
                      headerExtra={
                        <span className="flex items-center gap-1">
                          <ExpandBtn id={id} />
                          {entry.id_cliente && (
                            <button
                              onClick={(e) => { e.stopPropagation(); abrirCarpetaCliente(entry.id_cliente); }}
                              title="Abrir carpeta del cliente en Drive"
                              className="group flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border border-neutral-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:border-blue-200 hover:shadow-md active:scale-95 transition-all duration-150 shrink-0"
                            >
                              <DriveIcon size={12} />
                              <span className="text-neutral-500 group-hover:text-neutral-800 transition-colors font-medium">Drive</span>
                            </button>
                          )}
                        </span>
                      }
                      rightExtra={
                        entry.id_cliente && countDocs([entry]) > 0
                          ? <ZipBtn idCliente={entry.id_cliente} nombre={entry.nombre} />
                          : undefined
                      }
                    >
                      {entry.solicitudes.map((sol) => (
                        <SolicitudNode
                          key={sol.id_solicitud ?? sol.titulo}
                          solicitud={sol}
                          isAdmin={isAdmin}
                          onEliminar={handleEliminarGlobal}
                          forceOpen={expandedMap[id]}
                        />
                      ))}
                    </TreeNode>
                  );
                })}
              </div>
            )}
          </div>

          {/* Paginación fija al fondo */}
          {!loading && totalPaginas > 1 && (
            <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-neutral-200 bg-neutral-50 rounded-b-xl">
              <span className="text-xs text-neutral-400">
                Página {pagina + 1} / {totalPaginas} · {listaFiltrada.length} clientes
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPagina((p) => Math.max(0, p - 1))}
                  disabled={pagina === 0}
                  className="px-3 py-1 text-xs rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                  disabled={pagina >= totalPaginas - 1}
                  className="px-3 py-1 text-xs rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      </>}
    </div>
  );
}
