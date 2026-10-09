// src/pages/backoffice/panel-asesoras/usePanelAsesoras.js
// Estado, carga y acciones del Panel asesoras (salió de PanelAsesoras.jsx el
// 09/10/2026). El orden de los hooks y de los efectos es el del original.
//
// Lo derivado de los datos (lista del servicio, filtro, página y contadores)
// va memoizado: antes se rehacía en cada render, también al abrir el menú
// "···", al desplegar una fila o al guardar.
import { useState, useEffect, useCallback, useMemo } from "react";
import { boGET, boPOST, boPATCH, boDELETE } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { useDriveToast } from "../driveToast";
import { SVC_KEYS, PAGE_SIZE } from "./partes/constantes";
import { keyFor } from "./partes/utilidades";

export function usePanelAsesoras() {
  const [data, setData]               = useState({ master:[], visa:[], ee:[], fp:[], legal:[], doc:[] });
  const [loading, setLoading]         = useState(true);
  const [curTab, setCurTab]           = useState("all");
  const [expandedKey, setExpandedKey] = useState(null);
  const [editTarget, setEditTarget]   = useState(null);
  const [addMode, setAddMode]         = useState(false);
  const [addSvc, setAddSvc]           = useState("master");
  const [search, setSearch]           = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [saving, setSaving]           = useState(false);
  const [delTarget, setDelTarget]     = useState(null);
  const [panelPage, setPanelPage]     = useState(1);
  const [menuFor, setMenuFor]         = useState(null);
  const [menuPos, setMenuPos]         = useState({ top: 0, left: 0 });
  const driveToastState = useDriveToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await boGET("/backoffice/panel-asesoras");
      if (r.ok) setData(r.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!menuFor) return;
    function onDismiss() { setMenuFor(null); }
    document.addEventListener("click", onDismiss);
    window.addEventListener("resize", onDismiss);
    window.addEventListener("scroll", onDismiss, true);
    return () => {
      document.removeEventListener("click", onDismiss);
      window.removeEventListener("resize", onDismiss);
      window.removeEventListener("scroll", onDismiss, true);
    };
  }, [menuFor]);

  /* ── Lista visible ── */
  const allItems = useMemo(() => {
    return curTab === "all"
      ? SVC_KEYS.flatMap(s => (data[s] || []).map(c => ({ ...c, _svc: s })))
      : (data[curTab] || []).map(c => ({ ...c, _svc: curTab }));
  }, [data, curTab]);

  const visible = useMemo(() => {
    return allItems
      .filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()))
      .filter(c => !filterEstado || c.estado === filterEstado);
  }, [allItems, search, filterEstado]);

  const totalPages  = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage    = Math.min(panelPage, totalPages);
  const pageVisible = useMemo(() => visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [visible, safePage]);

  // Reset página cuando cambia la búsqueda o filtro
  useEffect(() => { setPanelPage(1); }, [search, filterEstado, curTab]);

  /* ── Contadores ── */
  const tabCounts = useMemo(() => {
    const total     = SVC_KEYS.reduce((a,s) => a + (data[s]?.length || 0), 0);
    return { all: total, ...Object.fromEntries(SVC_KEYS.map(s => [s, data[s]?.length || 0])) };
  }, [data]);
  const { act, noact, activar, pend } = useMemo(() => ({
    act:     visible.filter(c => c.estado === "ACTIVO").length,
    noact:   visible.filter(c => c.estado === "NO_ACTIVO").length,
    activar: visible.filter(c => c.estado === "ACTIVAR").length,
    pend:    visible.filter(c => c.pending?.length > 0).length,
  }), [visible]);
  const hayFiltros = search || filterEstado;

  /* ── Acciones ── */
  async function handleDelete() {
    if (!delTarget) return;
    setSaving(true);
    try {
      await boDELETE(`/backoffice/panel-asesoras/${delTarget.id}`);
      setDelTarget(null);
      setExpandedKey(null);
      await load();
    } finally { setSaving(false); }
  }

  async function handleSaveEdit(body) {
    if (!editTarget) return;
    setSaving(true);
    try {
      const r = await boPATCH(`/backoffice/panel-asesoras/${editTarget.item._id}`, body);
      if (r.ok) { setEditTarget(null); await load(); }
      else dialog.toast(r.msg || "Error al guardar", "error");
    } finally { setSaving(false); }
  }

  async function handleSaveNew(body) {
    setSaving(true);
    try {
      const r = await boPOST("/backoffice/panel-asesoras", { ...body, panel_servicio: addSvc });
      if (r.ok) { setAddMode(false); setCurTab(addSvc); await load(); }
      else dialog.toast(r.msg || "Error al crear", "error");
    } finally { setSaving(false); }
  }

  function openRowMenu(e, c) {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    const menuW = 200, menuH = 190, gap = 6;
    let left = r.right - menuW;
    let top = r.bottom + gap;
    if (left < 8) left = 8;
    if (top + menuH > window.innerHeight - 8) top = r.top - menuH - gap;
    setMenuPos({ top, left });
    setMenuFor(keyFor(c));
  }

  const menuClient = menuFor ? visible.find(c => keyFor(c) === menuFor) : null;

  return {
    data, loading, curTab, setCurTab, expandedKey, setExpandedKey,
    editTarget, setEditTarget, addMode, setAddMode, addSvc, setAddSvc,
    search, setSearch, filterEstado, setFilterEstado, saving,
    delTarget, setDelTarget, setPanelPage, menuPos, setMenuFor, driveToastState,
    visible, totalPages, safePage, pageVisible, tabCounts,
    act, noact, activar, pend, hayFiltros,
    handleDelete, handleSaveEdit, handleSaveNew, openRowMenu, menuClient,
  };
}
