// src/pages/backoffice/checklist/ChecklistServicios.jsx
import { useEffect, useMemo, useState } from "react";
import { boGET, boPOST, boPUT, boDELETE } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { useAuth } from "../context/AuthContext";
import { guardarReciente, leerRecientes, metaServicio } from "./checklistUtils";
import ServicePicker from "./components/ServicePicker";
import ChecklistItemsList from "./components/ChecklistItemsList";
import ChecklistItemDrawer from "./components/ChecklistItemDrawer";
import DuplicarChecklistModal from "./components/DuplicarChecklistModal";

const ITEM_INICIAL = { nombre_item: "", descripcion: "", obligatorio: true, permite_archivo: true };

const FILTROS_DOC = [
  { id: "all",      label: "Todos" },
  { id: "required", label: "Obligatorios" },
  { id: "optional", label: "Opcionales" },
  { id: "file",     label: "Con archivo" },
];

export default function ChecklistServicios() {
  const { hasPermission } = useAuth();
  const puedeEditar = hasPermission("checklist.editar");

  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  // Toolbar de documentos
  const [busqueda, setBusqueda] = useState("");
  const [filtroDoc, setFiltroDoc] = useState("all");
  const [orden, setOrden] = useState("original"); // original | asc | desc
  const [mostrarDescripciones, setMostrarDescripciones] = useState(true);

  // Edición
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [modoDrawer, setModoDrawer] = useState("crear");
  const [itemEditando, setItemEditando] = useState(null);
  const [form, setForm] = useState(ITEM_INICIAL);
  const [saving, setSaving] = useState(false);
  const [itemsEnCurso, setItemsEnCurso] = useState(() => new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [duplicarAbierto, setDuplicarAbierto] = useState(false);
  const [copiando, setCopiando] = useState(false);

  useEffect(() => { cargarServicios(); }, []);

  async function cargarServicios() {
    setLoadingServicios(true);
    const r = await boGET("/backoffice/checklist/servicios");
    if (r.ok) {
      const lista = r.servicios || [];
      setServicios(lista);
      // Reabre el último servicio usado para no empezar siempre en blanco
      const ultimo = leerRecientes().find((id) => lista.some((s) => s.id_servicio === id));
      if (ultimo) seleccionarServicio(ultimo, { silencioso: true });
    }
    setLoadingServicios(false);
  }

  async function cargarChecklist(id_servicio) {
    setLoadingChecklist(true);
    const r = await boGET(`/backoffice/checklist/servicios/${id_servicio}`);
    if (r.ok) setChecklist({ servicio: r.servicio, tipoSolicitud: r.tipoSolicitud, etapas: r.etapas });
    else dialog.toast(r.msg || "No se pudo cargar el checklist", "error");
    setLoadingChecklist(false);
  }

  function seleccionarServicio(id, { silencioso = false } = {}) {
    setSelectedServicio(id);
    guardarReciente(id);
    cargarChecklist(id);
    if (!silencioso) {
      const s = servicios.find((x) => x.id_servicio === id);
      if (s) dialog.toast(`Servicio ${s.codigo} seleccionado`, "success");
    }
  }

  /* ---------- Datos derivados ---------- */

  const etapa = checklist?.etapas?.[0] || null;
  const items = useMemo(() => etapa?.items || [], [etapa]);

  const itemsVisibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtrados = items.filter((d) => {
      const coincideBusqueda =
        !q || `${d.nombre_item} ${d.descripcion || ""}`.toLowerCase().includes(q);
      const coincideFiltro =
        filtroDoc === "all" ||
        (filtroDoc === "required" && d.obligatorio) ||
        (filtroDoc === "optional" && !d.obligatorio) ||
        (filtroDoc === "file" && d.permite_archivo);
      return coincideBusqueda && coincideFiltro;
    });

    if (orden === "original") return filtrados;
    return [...filtrados].sort((a, b) =>
      orden === "asc"
        ? a.nombre_item.localeCompare(b.nombre_item, "es")
        : b.nombre_item.localeCompare(a.nombre_item, "es")
    );
  }, [items, busqueda, filtroDoc, orden]);

  const total = items.length;
  const obligatorios = items.filter((d) => d.obligatorio).length;
  const conArchivo = items.filter((d) => d.permite_archivo).length;
  const porcentaje = total ? Math.round((obligatorios / total) * 100) : 0;

  const servicioActual = servicios.find((s) => s.id_servicio === selectedServicio) || null;
  const metaActual = servicioActual ? metaServicio(servicioActual) : null;

  /* ---------- Acciones sobre ítems ---------- */

  function marcarEnCurso(id, activo) {
    setItemsEnCurso((prev) => {
      const next = new Set(prev);
      if (activo) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function alternarCampo(item, campo) {
    if (!puedeEditar) return;
    marcarEnCurso(item.id_item, true);
    const nuevoValor = !item[campo];
    const r = await boPUT(`/backoffice/checklist/items/${item.id_item}`, { [campo]: nuevoValor });
    marcarEnCurso(item.id_item, false);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo actualizar el ítem", "error"); return; }

    if (campo === "obligatorio") {
      dialog.toast(nuevoValor ? "Marcado como obligatorio" : "Marcado como opcional", "success");
    } else {
      dialog.toast(nuevoValor ? "Ahora requiere archivo" : "Ya no requiere archivo", "success");
    }
    await cargarChecklist(selectedServicio);
  }

  async function duplicarItem(item) {
    if (!puedeEditar) return;
    marcarEnCurso(item.id_item, true);
    const r = await boPOST(`/backoffice/checklist/servicios/${selectedServicio}/items`, {
      nombre_item: `${item.nombre_item} · copia`,
      descripcion: item.descripcion || "",
      obligatorio: item.obligatorio,
      permite_archivo: item.permite_archivo,
    });
    marcarEnCurso(item.id_item, false);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo duplicar el ítem", "error"); return; }
    dialog.toast("Documento duplicado", "success");
    await cargarChecklist(selectedServicio);
  }

  async function eliminarItem(item) {
    if (!puedeEditar) return;
    const ok = await dialog.confirm(`¿Eliminar “${item.nombre_item}” del checklist?`);
    if (!ok) return;
    const r = await boDELETE(`/backoffice/checklist/items/${item.id_item}`);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo eliminar el ítem", "error"); return; }
    dialog.toast("Documento eliminado", "success");
    await cargarChecklist(selectedServicio);
  }

  function abrirCrear() {
    setModoDrawer("crear");
    setItemEditando(null);
    setForm(ITEM_INICIAL);
    setDrawerAbierto(true);
  }

  function abrirEditar(item) {
    setModoDrawer("editar");
    setItemEditando(item);
    setForm({
      nombre_item: item.nombre_item,
      descripcion: item.descripcion || "",
      obligatorio: item.obligatorio,
      permite_archivo: item.permite_archivo,
    });
    setDrawerAbierto(true);
  }

  async function guardarItem(e) {
    e.preventDefault();
    if (!selectedServicio || !form.nombre_item.trim()) {
      dialog.toast("Escribe el nombre del documento", "warning");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, nombre_item: form.nombre_item.trim(), descripcion: form.descripcion.trim() };
      const r = itemEditando
        ? await boPUT(`/backoffice/checklist/items/${itemEditando.id_item}`, payload)
        : await boPOST(`/backoffice/checklist/servicios/${selectedServicio}/items`, payload);
      if (!r.ok) { dialog.toast(r.msg || "No se pudo guardar el documento", "error"); return; }
      dialog.toast(itemEditando ? "Cambios guardados" : "Documento añadido", "success");
      setDrawerAbierto(false);
      setItemEditando(null);
      setForm(ITEM_INICIAL);
      await cargarChecklist(selectedServicio);
    } finally {
      setSaving(false);
    }
  }

  /** Pone el mismo valor en todos los ítems (obligatorio o permite_archivo). */
  async function marcarTodos(campo) {
    if (!puedeEditar || !items.length) return;
    const todosActivos = items.every((d) => d[campo]);
    const nuevoValor = !todosActivos;
    setBulkSaving(true);
    try {
      const resultados = await Promise.all(
        items
          .filter((d) => d[campo] !== nuevoValor)
          .map((d) => boPUT(`/backoffice/checklist/items/${d.id_item}`, { [campo]: nuevoValor }))
      );
      const fallidos = resultados.filter((r) => !r.ok).length;
      if (fallidos) dialog.toast(`${fallidos} ítem(s) no se pudieron actualizar`, "error");
      else if (campo === "obligatorio") {
        dialog.toast(nuevoValor ? "Todos marcados como obligatorios" : "Todos marcados como opcionales", "success");
      } else {
        dialog.toast(nuevoValor ? "Todos requieren archivo" : "Se desactivó archivo en todos", "success");
      }
      await cargarChecklist(selectedServicio);
    } finally {
      setBulkSaving(false);
    }
  }

  /** Copia los documentos del checklist de otro servicio al actual. */
  async function duplicarChecklist(idOrigen, omitirExistentes) {
    setCopiando(true);
    try {
      const r = await boGET(`/backoffice/checklist/servicios/${idOrigen}`);
      if (!r.ok) { dialog.toast(r.msg || "No se pudo leer el checklist de origen", "error"); return; }

      const origenItems = r.etapas?.[0]?.items || [];
      const existentes = new Set(items.map((d) => d.nombre_item.trim().toLowerCase()));
      const aCopiar = omitirExistentes
        ? origenItems.filter((d) => !existentes.has(d.nombre_item.trim().toLowerCase()))
        : origenItems;

      if (!aCopiar.length) {
        dialog.toast("No hay documentos nuevos que copiar", "info");
        return;
      }

      let creados = 0;
      for (const d of aCopiar) {
        const res = await boPOST(`/backoffice/checklist/servicios/${selectedServicio}/items`, {
          nombre_item: d.nombre_item,
          descripcion: d.descripcion || "",
          obligatorio: d.obligatorio,
          permite_archivo: d.permite_archivo,
        });
        if (res.ok) creados += 1;
      }

      dialog.toast(`${creados} documento(s) copiados`, creados ? "success" : "error");
      setDuplicarAbierto(false);
      await cargarChecklist(selectedServicio);
    } finally {
      setCopiando(false);
    }
  }

  /* ---------- Render ---------- */

  return (
    <div className="min-h-full bg-[#f4f7f5] bg-[radial-gradient(circle_at_76%_0%,rgba(48,183,125,.08),transparent_28%)]">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 pb-16 pt-6">

        {/* Hero */}
        <div className="mb-[22px] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,122,83,.12)] bg-[#eaf7f0] px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#167a53]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#31b579] shadow-[0_0_0_5px_rgba(49,181,121,.12)]" />
              Configuración documental
            </div>
            <h1 className="mb-1 mt-2.5 text-[clamp(26px,3vw,40px)] font-bold leading-[1.05] tracking-[-0.035em] text-[#10251c]">
              Checklist de Servicios
            </h1>
            <p className="m-0 max-w-[720px] text-sm leading-[1.6] text-[#6f7d76]">
              Administra los requisitos por servicio en una vista compacta, filtrable y editable sin perder contexto.
            </p>
          </div>

          {puedeEditar && (
            <div className="flex items-center gap-2.5 max-sm:w-full">
              <button
                type="button"
                disabled={!selectedServicio}
                onClick={() => setDuplicarAbierto(true)}
                className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfe7e2] bg-white px-3.5 text-[13px] font-bold text-[#10251c] transition hover:-translate-y-px hover:border-[#c8d8cf] hover:shadow-[0_8px_20px_rgba(13,81,52,.08)] disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="8" y="8" width="11" height="11" rx="2" />
                  <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                </svg>
                Duplicar checklist
              </button>
              <button
                type="button"
                disabled={!selectedServicio}
                onClick={abrirCrear}
                className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-br from-[#0f5e3f] to-[#16815a] px-3.5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(15,94,63,.22)] transition hover:-translate-y-px hover:shadow-[0_14px_32px_rgba(15,94,63,.30)] disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Nuevo documento
              </button>
            </div>
          )}
        </div>

        {/* Selector + métricas */}
        <section className="relative z-[22] mb-[18px] rounded-[20px] border border-[rgba(15,94,63,.10)] bg-white bg-[radial-gradient(circle_at_100%_0%,rgba(72,210,147,.11),transparent_25%)] p-[18px] shadow-[0_12px_35px_rgba(15,61,42,.08)]">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(380px,1.6fr)_repeat(3,minmax(125px,.42fr))] items-end gap-3">
            <ServicePicker
              servicios={servicios}
              selectedId={selectedServicio}
              loading={loadingServicios}
              onSelect={(id) => seleccionarServicio(id)}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 xl:contents">
              <Stat color="green" valor={total} etiqueta="Documentos">
                <path d="M9 11l3 3 8-8" />
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </Stat>
              <Stat color="red" valor={obligatorios} etiqueta="Obligatorios">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.3 4.8 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z" />
              </Stat>
              <Stat color="blue" valor={conArchivo} etiqueta="Con archivo" className="max-sm:col-span-2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16h16V8z" />
                <path d="M14 2v6h6" />
              </Stat>
            </div>
          </div>
        </section>

        {!selectedServicio ? (
          <div className="rounded-[20px] border border-[#dfe7e2] bg-white px-5 py-16 text-center shadow-[0_12px_35px_rgba(15,61,42,.08)]">
            <svg viewBox="0 0 24 24" className="mx-auto mb-3 h-11 w-11 stroke-[#a3b0a8]" fill="none" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <h3 className="mb-1.5 text-sm font-bold text-[#405148]">Selecciona un servicio</h3>
            <p className="m-0 text-xs text-[#6f7d76]">
              Usa el buscador de arriba o pulsa <b>Ctrl K</b> para elegir el servicio a configurar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] items-start gap-[18px]">

            {/* Ficha del servicio */}
            <aside className="overflow-hidden rounded-[18px] border border-[#dfe7e2] bg-white/90 shadow-[0_12px_35px_rgba(15,61,42,.08)] lg:sticky lg:top-4">
              <div className="border-b border-[#dfe7e2] bg-gradient-to-b from-[#fbfefc] to-[#f7fbf9] bg-[radial-gradient(circle_at_100%_0%,rgba(40,175,117,.13),transparent_45%)] p-[18px]">
                <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#167a53]">
                  Servicio {servicioActual?.codigo} · {servicioActual?.activo ? "Activo" : "Inactivo"}
                </div>
                <div className="text-lg font-extrabold leading-[1.25] tracking-[-0.02em] text-[#10251c]">
                  {checklist?.servicio?.nombre || servicioActual?.nombre || "—"}
                </div>
              </div>

              <div className="px-[18px] pb-[18px] pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-0">
                  <MetaRow etiqueta="Tipo de solicitud" valor={checklist?.tipoSolicitud?.nombre || "—"} />
                  <MetaRow
                    etiqueta="Descripción"
                    valor={
                      checklist?.tipoSolicitud?.descripcion ||
                      "Checklist documental del servicio seleccionado. Los cambios se reflejan para nuevas solicitudes."
                    }
                  />
                  <MetaRow etiqueta="Familia" valor={metaActual?.grupo || "—"} />
                </div>

                <div className="mt-4">
                  <div className="mb-[7px] text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#77827d]">
                    Documentos obligatorios
                  </div>
                  <div className="h-[7px] overflow-hidden rounded-full bg-[#e8efeb]">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-[#1b8b5d] to-[#57cb93] shadow-[0_0_14px_rgba(43,170,115,.32)] transition-[width] duration-500"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <div className="mt-[7px] flex justify-between text-[10px] text-[#6f7d76]">
                    <span>{obligatorios} de {total}</span>
                    <span>{porcentaje}%</span>
                  </div>
                </div>

                {puedeEditar && (
                  <div className="mt-3.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={bulkSaving || !total}
                      onClick={() => marcarTodos("obligatorio")}
                      className="inline-flex min-h-[34px] items-center justify-center rounded-[10px] border border-[#dfe7e2] bg-white px-2.5 text-xs font-bold text-[#10251c] transition hover:border-[#c8d8cf] disabled:opacity-50"
                    >
                      Todos obligatorios
                    </button>
                    <button
                      type="button"
                      disabled={bulkSaving || !total}
                      onClick={() => marcarTodos("permite_archivo")}
                      className="inline-flex min-h-[34px] items-center justify-center rounded-[10px] border border-[#dfe7e2] bg-white px-2.5 text-xs font-bold text-[#10251c] transition hover:border-[#c8d8cf] disabled:opacity-50"
                    >
                      Todos con archivo
                    </button>
                  </div>
                )}
              </div>
            </aside>

            {/* Documentos */}
            <section className="overflow-hidden rounded-[20px] border border-[#dfe7e2] bg-white shadow-[0_12px_35px_rgba(15,61,42,.08)]">
              <div className="sticky top-0 z-[15] border-b border-[#dfe7e2] bg-white/90 px-4 py-3.5 backdrop-blur">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <h2 className="m-0 text-[15px] font-bold text-[#10251c]">Documentos requeridos</h2>
                    <span className="grid h-7 min-w-[28px] place-items-center rounded-full bg-[#eaf7f0] px-2.5 text-[11px] font-extrabold text-[#167a53]">
                      {itemsVisibles.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative min-w-0 flex-1 sm:min-w-[260px]">
                      <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-[#809087]" fill="none" strokeWidth="2">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                      </svg>
                      <input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar documento…"
                        className="w-full min-h-[42px] rounded-xl border border-[#d9e4dd] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#7acaa4] focus:shadow-[0_0_0_4px_rgba(51,177,120,.10)]"
                      />
                    </div>
                    <button
                      type="button"
                      title={orden === "original" ? "Ordenar A → Z" : orden === "asc" ? "Ordenar Z → A" : "Orden original"}
                      onClick={() => setOrden((o) => (o === "original" ? "asc" : o === "asc" ? "desc" : "original"))}
                      className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-[#dfe7e2] bg-white text-[#4a5a51] transition hover:border-[#c8d8cf]"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        {orden === "desc" ? <path d="M3 18h14M3 12h10M3 6h6" /> : <path d="M3 6h14M3 12h10M3 18h6" />}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {FILTROS_DOC.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFiltroDoc(f.id)}
                      className={[
                        "rounded-full border px-[11px] py-[7px] text-[11px] font-bold transition",
                        filtroDoc === f.id
                          ? "border-[#b9dfca] bg-[#eaf7f0] text-[#0f5e3f]"
                          : "border-[#dfe7e2] bg-white text-[#657169] hover:border-[#bad8c8] hover:text-[#0f5e3f]",
                      ].join(" ")}
                    >
                      {f.label}
                    </button>
                  ))}
                  <span className="flex-1" />
                  <button
                    type="button"
                    onClick={() => setMostrarDescripciones((v) => !v)}
                    className="rounded-[10px] px-2.5 py-1.5 text-xs font-bold text-[#4a5a51] hover:bg-[#f4f8f5]"
                  >
                    {mostrarDescripciones ? "Ocultar descripciones" : "Mostrar descripciones"}
                  </button>
                </div>
              </div>

              {loadingChecklist ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-[15px] bg-[#f1f5f3]" />
                  ))}
                </div>
              ) : itemsVisibles.length ? (
                <ChecklistItemsList
                  items={itemsVisibles}
                  mostrarDescripciones={mostrarDescripciones}
                  puedeEditar={puedeEditar}
                  itemsEnCurso={itemsEnCurso}
                  onToggle={alternarCampo}
                  onEditar={abrirEditar}
                  onDuplicar={duplicarItem}
                  onEliminar={eliminarItem}
                />
              ) : (
                <div className="px-5 py-[54px] text-center text-[#6f7d76]">
                  <svg viewBox="0 0 24 24" className="mx-auto mb-2.5 h-10 w-10 stroke-[#a3b0a8]" fill="none" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <h3 className="mb-1.5 text-sm font-bold text-[#405148]">
                    {total ? "No hay coincidencias" : "Aún no hay documentos"}
                  </h3>
                  <p className="m-0 text-xs">
                    {total
                      ? "Prueba otro filtro o término de búsqueda."
                      : "Añade el primer documento requerido de este servicio."}
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Botón flotante */}
      {puedeEditar && selectedServicio && !drawerAbierto && (
        <button
          type="button"
          onClick={abrirCrear}
          aria-label="Añadir documento"
          className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-[18px] bg-gradient-to-br from-[#0d6946] to-[#28a872] text-white shadow-[0_18px_45px_rgba(18,115,75,.34),0_0_0_8px_rgba(38,166,111,.08)] transition hover:-translate-y-0.5 max-sm:bottom-4 max-sm:right-4"
        >
          <svg viewBox="0 0 24 24" className="h-[23px] w-[23px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}

      <ChecklistItemDrawer
        abierto={drawerAbierto}
        modo={modoDrawer}
        form={form}
        setForm={setForm}
        saving={saving}
        onCerrar={() => { setDrawerAbierto(false); setItemEditando(null); }}
        onGuardar={guardarItem}
      />

      {duplicarAbierto && (
        <DuplicarChecklistModal
          servicios={servicios}
          servicioDestino={servicioActual}
          copiando={copiando}
          onCerrar={() => setDuplicarAbierto(false)}
          onDuplicar={duplicarChecklist}
        />
      )}
    </div>
  );
}

/* ---------- Piezas pequeñas ---------- */

const COLORES_STAT = {
  green: "bg-[#eaf7f0] text-[#167a53]",
  red:   "bg-[#fff1f3] text-[#dc3d4f]",
  blue:  "bg-[#eef4ff] text-[#3674d9]",
};

function Stat({ color, valor, etiqueta, className = "", children }) {
  return (
    <div className={`flex min-h-[64px] items-center gap-2.5 rounded-[14px] border border-[#e5ece8] bg-[#f8fbf9] px-3 py-2.5 ${className}`}>
      <div className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[11px] ${COLORES_STAT[color]}`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          {children}
        </svg>
      </div>
      <div>
        <strong className="block text-lg leading-none text-[#10251c]">{valor}</strong>
        <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.06em] text-[#6f7d76]">
          {etiqueta}
        </span>
      </div>
    </div>
  );
}

function MetaRow({ etiqueta, valor }) {
  return (
    <div className="border-b border-dashed border-[#e2e9e5] py-2.5 last:border-b-0 max-lg:rounded-xl max-lg:border max-lg:border-solid max-lg:border-[#edf2ef] max-lg:p-2.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a958f]">{etiqueta}</div>
      <div className="mt-1 text-xs leading-[1.45] text-[#33483d]">{valor}</div>
    </div>
  );
}
