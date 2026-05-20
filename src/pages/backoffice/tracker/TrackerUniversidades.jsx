import { useState, useEffect } from "react";
import { boGET, boPATCH, boPOST, boDELETE } from "../../../services/backofficeApi";

// ── Constantes ────────────────────────────────────────────────────────────────

const ANIO = "2025-2026";

const TODAY = (() => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; })();

const SCFG = {
  pendiente:  { l: "Próxima",        s: "Próx.",   d: "#94a3b8", bg: "#f1f5f9", t: "#475569", b: "#cbd5e1" },
  abierto:    { l: "✓ Abierta",     s: "Abierta", d: "#22c55e", bg: "#dcfce7", t: "#15803d", b: "#86efac" },
  cerrado:    { l: "Cerrada",        s: "Cerrada", d: "#f59e0b", bg: "#fef3c7", t: "#92400e", b: "#fcd34d" },
  resultados: { l: "📋 Resultados", s: "Result.", d: "#6366f1", bg: "#ede9fe", t: "#4338ca", b: "#c4b5fd" },
  depende:    { l: "Sin fecha",      s: "S/fecha", d: "#8b5cf6", bg: "#f5f3ff", t: "#6d28d9", b: "#ddd6fe" },
};

const LISTA_CFG = {
  LISTA_1: { label: "Lista 1", bg: "#d1fae5", t: "#065f46", d: "#10b981", paquete: "Full Económico" },
  LISTA_2: { label: "Lista 2", bg: "#fef3c7", t: "#92400e", d: "#f59e0b", paquete: "Intermedias"   },
  LISTA_3: { label: "Lista 3", bg: "#fee2e2", t: "#991b1b", d: "#ef4444", paquete: "Premium"        },
};

// ── CSS (reconstruido del HTML original) ──────────────────────────────────────

const CSS = `
.tkr *{box-sizing:border-box;margin:0;padding:0}
.tkr{font-family:'Segoe UI',system-ui,sans-serif;height:100%;overflow:hidden;display:flex;flex-direction:column}
.tkr input,.tkr select,.tkr textarea{font-family:inherit}
.tkr button{cursor:pointer;font-family:inherit}
.tkr ::-webkit-scrollbar{width:6px;height:6px}
.tkr ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}

/* Header */
.tkr .hdr{background:linear-gradient(135deg,#0f2444,#1e4080,#1a5276);color:white;padding:12px 16px 0;flex-shrink:0}
.tkr .hdr-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
.tkr .hdr-eyebrow{font-size:9px;letter-spacing:2px;opacity:.5;text-transform:uppercase}
.tkr .hdr-title{font-size:18px;font-weight:700;margin:2px 0}
.tkr .hdr-sub{font-size:10px;opacity:.5}
.tkr .hdr-btns{display:flex;gap:6px;flex-shrink:0}
.tkr .hdr-btn{background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.28);color:white;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:500}
.tkr .tabs{display:flex;gap:3px;overflow-x:auto}
.tkr .tab{padding:5px 11px;border-radius:6px 6px 0 0;border:none;cursor:pointer;font-size:11px;white-space:nowrap;background:rgba(255,255,255,.1);color:rgba(255,255,255,.75)}
.tkr .tab.on{background:white;color:#0f2444;font-weight:700}

/* Subbar */
.tkr .subbar{background:white;border-bottom:1px solid #e2e8f0;padding:6px 16px;display:flex;gap:4px;align-items:center;flex-shrink:0;flex-wrap:wrap}
.tkr .sub-lbl{font-size:11px;color:#94a3b8;font-weight:500}
.tkr .pill{padding:2px 10px;border-radius:20px;border:1.5px solid #e2e8f0;background:white;color:#64748b;font-size:11.5px}
.tkr .pill.on{font-weight:700}
.tkr .sub-info{margin-left:auto;font-size:11px;color:#94a3b8}

/* Alertas */
.tkr .alerts-ok{background:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:8px 16px;display:flex;align-items:center;gap:8px;flex-shrink:0;font-size:12.5px;color:#15803d;font-weight:500}
.tkr .alerts-wrap{background:#fafafa;border-bottom:2px solid #e2e8f0;flex-shrink:0}
.tkr .alerts-lbl{padding:5px 16px 3px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px}
.tkr .alerts-row{display:flex;gap:8px;padding:4px 16px 10px;overflow-x:auto}
.tkr .acard{flex-shrink:0;border-radius:10px;padding:8px 12px;min-width:170px;border:1.5px solid}
.tkr .abadge{display:inline-block;font-size:11px;color:white;padding:1px 8px;border-radius:6px;font-weight:700;margin-bottom:3px}
.tkr .auni{font-size:13px;font-weight:700}
.tkr .anom{font-size:10.5px;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}
.tkr .amsg{font-size:11px;font-weight:600;margin-top:2px}

/* Body */
.tkr .body{display:flex;flex:1;overflow:hidden}
.tkr .tbl-wrap{overflow-y:auto;overflow-x:auto}
.tkr table{width:100%;border-collapse:collapse;font-size:12.5px}
.tkr thead tr{background:#f1f5f9;position:sticky;top:0;z-index:5}
.tkr th{padding:8px 10px;text-align:left;color:#64748b;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.4px;border-bottom:2px solid #e2e8f0;white-space:nowrap}
.tkr tbody tr{border-bottom:1px solid #f1f5f9;cursor:pointer}
.tkr tbody tr:hover{background:#f8fafc}
.tkr tbody tr.sel{background:#eff6ff}
.tkr td{padding:9px 10px;vertical-align:middle}
.tkr .sigla{font-weight:700;color:#0f2444;font-size:13px}
.tkr .nd{font-size:9px;color:#f59e0b;margin-left:3px}
.tkr .uname{font-weight:500;color:#1e293b}
.tkr .usub{font-size:10.5px;color:#94a3b8}
.tkr .ltag{font-size:10.5px;padding:2px 6px;border-radius:4px;font-weight:600;white-space:nowrap}
.tkr .lsub{font-size:10px;color:#94a3b8;margin-top:1px}
.tkr .sbadge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:10px;font-size:10.5px;font-weight:600;border:1px solid;white-space:nowrap}
.tkr .sdot{width:5px;height:5px;border-radius:50%;flex-shrink:0;display:inline-block}
.tkr .ptags{display:flex;gap:3px;flex-wrap:wrap}
.tkr .ptag{font-size:10px;padding:1px 6px;border-radius:6px;font-weight:600}
.tkr .drange{font-size:12px;color:#475569}
.tkr .dsep{color:#cbd5e1;margin:0 2px}
.tkr .nodate{color:#e2e8f0;font-size:12px}
.tkr .dinfo{font-size:11px;font-weight:600;white-space:nowrap}

/* Panel */
.tkr .panel{border-left:1px solid #e2e8f0;background:white;flex-shrink:0;width:45%;display:flex;flex-direction:column;overflow:hidden}
.tkr .pin{padding:16px;flex:1;overflow-y:auto;min-height:0}
.tkr .phdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
.tkr .pmeta{flex:1}
.tkr .ptitle{font-size:16px;font-weight:700;color:#0f2444;margin:4px 0 2px;line-height:1.2}
.tkr .pcity{font-size:11px;color:#64748b}
.tkr .plink{font-size:11px;color:#2563eb;text-decoration:none;display:inline-block;margin-top:4px}
.tkr .xcls{background:#f1f5f9;border:none;width:26px;height:26px;border-radius:6px;color:#64748b;font-size:14px;flex-shrink:0}
.tkr .flbl{font-size:10.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;display:block}
.tkr .fld{margin-bottom:8px}
.tkr .inp{width:100%;padding:6px 10px;border:1.5px solid #e2e8f0;border-radius:7px;font-size:12.5px;color:#1e293b;background:white;box-sizing:border-box;outline:none;font-family:inherit}
.tkr .inp:focus{border-color:#93c5fd}
.tkr .g2{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:8px}
.tkr .pblock{border-radius:9px;padding:12px;margin-bottom:10px;border:1.5px solid}
.tkr .pbhdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:6px}
.tkr .fnum{background:#0f2444;color:white;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px}
.tkr .delbtn{background:none;border:none;color:#f87171;font-size:11px;padding:2px 4px}
.tkr .addbtn{padding:4px 10px;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:6px;font-size:11.5px;font-weight:600}
.tkr .pshdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.tkr .pstitle{font-weight:700;color:#0f2444;font-size:13px}
.tkr .tip{margin-top:4px;padding:10px 14px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;font-size:11.5px;color:#0369a1;line-height:1.6}

/* Barra de guardado */
.tkr .save-bar{border-top:1.5px solid #e2e8f0;padding:10px 16px;display:flex;align-items:center;gap:8px;flex-shrink:0;background:white}
.tkr .dirty-badge{font-size:11px;color:#f59e0b;font-weight:600;margin-right:auto;display:flex;align-items:center;gap:5px}
.tkr .btn-discard{padding:6px 14px;background:white;color:#64748b;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12.5px}
.tkr .btn-discard:hover{background:#f8fafc}
.tkr .btn-save{padding:6px 18px;background:#0f2444;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;transition:background .15s;margin-left:auto}
.tkr .btn-save:hover:not(:disabled){background:#1e4080}
.tkr .btn-save:disabled{background:#94a3b8;cursor:not-allowed}

/* Marcador de fase editada */
.tkr .fase-edited{font-size:9.5px;color:#f59e0b;font-weight:700;padding:1px 5px;border-radius:4px;background:#fef3c7;border:1px solid #fcd34d}

/* Campos de solo lectura en panel */
.tkr .ro-val{font-size:13px;color:#1e293b;padding:4px 0;line-height:1.5}
.tkr .ro-empty{font-size:12px;color:#cbd5e1;font-style:italic}
.tkr .btn-edit{padding:6px 18px;background:#eff6ff;color:#2563eb;border:1.5px solid #bfdbfe;border-radius:8px;font-size:13px;font-weight:600;margin-left:auto}
.tkr .btn-edit:hover{background:#dbeafe}

/* Toast */
.tkr .toast{position:fixed;bottom:20px;right:20px;z-index:999;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:500;color:white;box-shadow:0 8px 24px rgba(0,0,0,.2);opacity:0;transition:opacity .3s;pointer-events:none}
.tkr .toast.show{opacity:1}
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDate(iso) {
  if (!iso) return null;
  return new Date(String(iso).substring(0, 10) + "T12:00:00");
}
function toDateStr(iso) {
  if (!iso) return "";
  return String(iso).substring(0, 10);
}
const fmt = iso => iso ? new Date(String(iso).substring(0, 10) + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "—";
const dUntil = iso => iso ? Math.round((toDate(iso) - TODAY) / 86400000) : null;

function computeStatus(f) {
  if (f.estado_override) return f.estado_override;
  const ini = toDate(f.postulacion_inicio), fin = toDate(f.postulacion_fin), res = toDate(f.resultados);
  if (!ini || !fin) return "depende";
  if (TODAY < ini) return "pendiente";
  if (TODAY >= ini && TODAY <= fin) return "abierto";
  if (res && TODAY > fin && TODAY <= res) return "cerrado";
  if (res && TODAY > res) return "resultados";
  return "cerrado";
}
function uniStatus(uni) {
  if (!uni.tracker_fases?.length) return "depende";
  for (const s of ["abierto", "pendiente", "cerrado", "resultados", "depende"])
    for (const f of uni.tracker_fases)
      if (computeStatus(f) === s) return s;
  return "depende";
}
function bestFase(uni) {
  const ff = uni.tracker_fases || [];
  return ff.find(f => computeStatus(f) === "abierto")   ||
         ff.find(f => computeStatus(f) === "pendiente") ||
         ff.find(f => computeStatus(f) === "cerrado")   ||
         ff[ff.length - 1] || null;
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function TrackerUniversidades() {
  const [unis,    setUnis]    = useState([]);
  const [selId,   setSelId]   = useState(null);
  const [fL,      setFL]      = useState("Todas");
  const [fS,      setFS]      = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState({ msg: "", ok: true, show: false });

  useEffect(() => {
    boGET(`/backoffice/tracker/unis?anio=${ANIO}`)
      .then(d => { if (d.ok) setUnis(d.unis); })
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg, ok = true) {
    setToast({ msg, ok, show: true });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3000);
  }

  function onSaved(savedUni) {
    setUnis(prev => prev.map(u => u.id_universidad === savedUni.id_universidad ? savedUni : u));
    showToast("✓ Cambios guardados");
  }

  async function addFase(uniId) {
    const d = await boPOST(`/backoffice/tracker/unis/${uniId}/fases`, { anio_academico: ANIO });
    if (d.ok) {
      setUnis(prev => prev.map(u => u.id_universidad === uniId ? { ...u, tracker_fases: [...u.tracker_fases, d.fase] } : u));
      showToast("Fase añadida");
    }
  }

  async function delFase(uniId, faseId) {
    await boDELETE(`/backoffice/tracker/fases/${faseId}`);
    setUnis(prev => prev.map(u =>
      u.id_universidad === uniId
        ? { ...u, tracker_fases: u.tracker_fases.filter(f => f.id_fase !== faseId) }
        : u
    ));
    showToast("Fase eliminada");
  }

  // Filtros
  const filt = unis.filter(u => {
    if (fL !== "Todas"  && u.lista_inspira !== fL) return false;
    if (fS !== "Todos"  && uniStatus(u) !== fS)    return false;
    return true;
  });

  const cnt = { abierto: 0, pendiente: 0, cerrado: 0, resultados: 0, depende: 0 };
  unis.forEach(u => { const s = uniStatus(u); if (s in cnt) cnt[s]++; });

  // Alertas
  const alerts = [];
  unis.forEach(u => (u.tracker_fases || []).forEach((f, i) => {
    const st = computeStatus(f);
    const pl = u.tracker_fases.length > 1 ? ` F${i + 1}` : "";
    if (st === "abierto" && f.postulacion_fin) {
      const d = dUntil(f.postulacion_fin);
      if (d !== null && d <= 7 && d >= 0)
        alerts.push({ lv: d <= 2 ? 0 : 1, uni: u.sigla, nom: u.nombre_completo, msg: "Cierre postulación", det: fmt(f.postulacion_fin) + pl, d,
          badge: d === 0 ? "HOY" : d === 1 ? "MAÑANA" : d + "d",
          bg: d <= 2 ? "#fef2f2" : "#fffbeb", bdr: d <= 2 ? "#fca5a5" : "#fde68a",
          tc: d <= 2 ? "#991b1b" : "#92400e", bc: d <= 2 ? "#ef4444" : "#f59e0b" });
    }
    if (st === "cerrado" && f.resultados) {
      const d = dUntil(f.resultados);
      if (d !== null && d <= 5 && d >= 0)
        alerts.push({ lv: d <= 1 ? 0 : 1, uni: u.sigla, nom: u.nombre_completo, msg: "Resultados", det: fmt(f.resultados) + pl, d,
          badge: d === 0 ? "HOY" : d === 1 ? "MAÑANA" : d + "d",
          bg: d <= 1 ? "#fef2f2" : "#fffbeb", bdr: d <= 1 ? "#fca5a5" : "#fde68a",
          tc: d <= 1 ? "#991b1b" : "#92400e", bc: d <= 1 ? "#ef4444" : "#f59e0b" });
    }
  }));
  alerts.sort((a, b) => a.lv - b.lv || a.d - b.d);

  const selUni = unis.find(u => u.id_universidad === selId) || null;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <span style={{ color: "#94a3b8", fontSize: 14 }}>Cargando tracker…</span>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="tkr">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="hdr">
          <div className="hdr-row">
            <div>
              <div className="hdr-eyebrow">INSPIRA · Másteres España {ANIO}</div>
              <div className="hdr-title">Tracker Universidades</div>
              <div className="hdr-sub">{unis.length} universidades · ciclo {ANIO}</div>
            </div>
          </div>
          <div className="tabs">
            {[
              ["Todos",      "Todas ("     + unis.length     + ")"],
              ["abierto",    "✓ Abiertas (" + cnt.abierto    + ")"],
              ["pendiente",  "⏳ Próximas (" + cnt.pendiente  + ")"],
              ["cerrado",    "⏸ Esperando (" + cnt.cerrado   + ")"],
              ["resultados", "📋 Result. (" + cnt.resultados + ")"],
              ["depende",    "S/fecha ("   + cnt.depende     + ")"],
            ].map(([v, l]) => (
              <button key={v} className={`tab${fS === v ? " on" : ""}`} onClick={() => setFS(v)}>{l}</button>
            ))}
          </div>
        </div>

        {/* ── Subbar ────────────────────────────────────────────────────── */}
        <div className="subbar">
          <span className="sub-lbl">LISTA:</span>
          {["Todas", "LISTA_1", "LISTA_2", "LISTA_3"].map(v => {
            const lc = LISTA_CFG[v] || {};
            const on = fL === v;
            return (
              <button key={v} className={`pill${on ? " on" : ""}`}
                style={on ? { background: lc.bg, color: lc.t, borderColor: lc.d } : {}}
                onClick={() => setFL(v)}>
                {v === "Todas" ? "Todas" : lc.label}
              </button>
            );
          })}
          <span className="sub-info">{filt.length} de {unis.length} · clic en fila para editar</span>
        </div>

        {/* ── Alertas ───────────────────────────────────────────────────── */}
        {alerts.length === 0 ? (
          <div className="alerts-ok">✓ Sin cierres urgentes en los próximos 7 días</div>
        ) : (
          <div className="alerts-wrap">
            <div className="alerts-lbl">🔔 {alerts.length} alerta{alerts.length > 1 ? "s" : ""} urgente{alerts.length > 1 ? "s" : ""}</div>
            <div className="alerts-row">
              {alerts.map((a, i) => (
                <div key={i} className="acard" style={{ background: a.bg, borderColor: a.bdr }}>
                  <span className="abadge" style={{ background: a.bc }}>{a.badge}</span>
                  <div className="auni" style={{ color: a.tc }}>{a.uni}</div>
                  <div className="anom" style={{ color: a.tc }}>{a.nom}</div>
                  <div className="amsg" style={{ color: a.tc }}>{a.msg} · {a.det}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Cuerpo ────────────────────────────────────────────────────── */}
        <div className="body">
          <div className="tbl-wrap" style={{ flex: selId ? "0 0 55%" : 1 }}>
            <table>
              <thead>
                <tr>
                  {["Sigla", "Universidad", "Lista", "Estado", "Fases", "Postulación activa", "Result.", "Días"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filt.map(u => (
                  <UniRow key={u.id_universidad} u={u} sel={selId === u.id_universidad}
                    onClick={() => setSelId(selId === u.id_universidad ? null : u.id_universidad)} />
                ))}
              </tbody>
            </table>
          </div>

          {selUni && (
            <div className="panel">
              <UniPanel
                key={selUni.id_universidad}
                u={selUni}
                onClose={() => setSelId(null)}
                onSaved={onSaved}
                onAddFase={addFase}
                onDelFase={delFase}
              />
            </div>
          )}
        </div>

        {/* Toast */}
        <div className={`toast${toast.show ? " show" : ""}`}
          style={{ background: toast.ok ? "#0f2444" : "#991b1b" }}>
          {toast.msg}
        </div>
      </div>
    </>
  );
}

// ── Fila de la tabla ──────────────────────────────────────────────────────────

function UniRow({ u, sel, onClick }) {
  const st = uniStatus(u);
  const lc = LISTA_CFG[u.lista_inspira] || {};
  const bf = bestFase(u);
  const c  = SCFG[st];

  const dateRange = bf?.postulacion_inicio
    ? <span className="drange"><b>{fmt(bf.postulacion_inicio)}</b><span className="dsep">→</span><b>{fmt(bf.postulacion_fin)}</b></span>
    : <span className="nodate">Sin fecha aún</span>;

  const res = bf?.resultados
    ? <b>{fmt(bf.resultados)}</b>
    : <span className="nodate">—</span>;

  const dC = bf ? dUntil(bf.postulacion_fin)    : null;
  const dO = bf ? dUntil(bf.postulacion_inicio) : null;
  const dR = bf ? dUntil(bf.resultados)         : null;

  let daysEl = null;
  if      (st === "abierto"   && dC !== null) daysEl = <span className="dinfo" style={{ color: dC <= 7 ? "#ef4444" : "#94a3b8" }}>{dC <= 7 ? `¡Cierra en ${dC}d!` : `${dC}d p/cierre`}</span>;
  else if (st === "pendiente" && dO >= 0)     daysEl = <span className="dinfo" style={{ color: "#2563eb" }}>Abre en {dO}d</span>;
  else if (st === "cerrado"   && dR > 0)      daysEl = <span className="dinfo" style={{ color: "#7c3aed" }}>Result. en {dR}d</span>;
  else if (st === "resultados")               daysEl = <span className="dinfo" style={{ color: "#6366f1" }}>Publicados</span>;

  const fases = u.tracker_fases || [];

  return (
    <tr className={sel ? "sel" : ""} onClick={onClick}>
      <td>
        <span className="sigla">{u.sigla}</span>
        {u.tracker_notas && <span className="nd">★</span>}
      </td>
      <td>
        <div className="uname">{u.nombre_completo}</div>
        <div className="usub">{u.ciudad} · {u.tracker_precio_display || "—"}</div>
      </td>
      <td>
        <span className="ltag" style={{ background: lc.bg, color: lc.t }}>{lc.label || u.lista_inspira}</span>
        <div className="lsub">{lc.paquete}</div>
      </td>
      <td>
        <span className="sbadge" style={{ background: c.bg, color: c.t, borderColor: c.b }}>
          <span className="sdot" style={{ background: c.d }} />{c.l}
        </span>
      </td>
      <td>
        {fases.length <= 1
          ? <span style={{ fontSize: 11, color: "#cbd5e1" }}>{fases.length === 0 ? "0 fases" : "1 fase"}</span>
          : <div className="ptags">
              {fases.map((f, i) => {
                const cv = SCFG[computeStatus(f)];
                return <span key={f.id_fase} className="ptag" style={{ background: cv.bg, color: cv.t, border: `1px solid ${cv.b}` }} title={f.nombre}>F{i + 1}: {cv.s}</span>;
              })}
            </div>
        }
      </td>
      <td>{dateRange}</td>
      <td>{res}</td>
      <td>{daysEl}</td>
    </tr>
  );
}

// ── Panel lateral ─────────────────────────────────────────────────────────────

function UniPanel({ u, onClose, onSaved, onAddFase, onDelFase }) {
  const lc = LISTA_CFG[u.lista_inspira] || {};
  const [editMode, setEditMode] = useState(false);

  const [uniFields, setUniFields] = useState({
    tracker_precio_display: u.tracker_precio_display || "",
    tracker_notas:          u.tracker_notas          || "",
  });

  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(false);

  const isDirtyUni =
    uniFields.tracker_precio_display !== (u.tracker_precio_display || "") ||
    uniFields.tracker_notas          !== (u.tracker_notas          || "");
  const isDirty = isDirtyUni || Object.keys(drafts).length > 0;

  function val(id_fase, field) {
    const d = drafts[id_fase];
    if (d && d[field] !== undefined) return d[field];
    const orig = (u.tracker_fases || []).find(f => f.id_fase === id_fase);
    if (!orig) return "";
    if (["postulacion_inicio", "postulacion_fin", "resultados"].includes(field)) return toDateStr(orig[field]);
    return orig[field] || "";
  }

  function updDraft(id_fase, field, value) {
    setDrafts(prev => {
      const orig = (u.tracker_fases || []).find(f => f.id_fase === id_fase) || {};
      const base = prev[id_fase] || {
        nombre:             orig.nombre             || "",
        postulacion_inicio: toDateStr(orig.postulacion_inicio),
        postulacion_fin:    toDateStr(orig.postulacion_fin),
        resultados:         toDateStr(orig.resultados),
        estado_override:    orig.estado_override    || "",
        notas:              orig.notas              || "",
      };
      const updated = { ...base, [field]: value };
      if (["postulacion_inicio", "postulacion_fin", "resultados"].includes(field))
        updated.estado_override = "";
      return { ...prev, [id_fase]: updated };
    });
  }

  function efectiva(f) {
    const d = drafts[f.id_fase];
    if (!d) return f;
    return { ...f, ...d, postulacion_inicio: d.postulacion_inicio || null, postulacion_fin: d.postulacion_fin || null, resultados: d.resultados || null, estado_override: d.estado_override || null };
  }

  async function handleSave() {
    setSaving(true);
    try {
      const reqs = [];
      if (isDirtyUni)
        reqs.push(boPATCH(`/backoffice/tracker/unis/${u.id_universidad}`, {
          tracker_precio_display: uniFields.tracker_precio_display || null,
          tracker_notas:          uniFields.tracker_notas          || null,
        }));

      for (const [id_fase, d] of Object.entries(drafts))
        reqs.push(boPATCH(`/backoffice/tracker/fases/${Number(id_fase)}`, {
          nombre:             d.nombre,
          postulacion_inicio: d.postulacion_inicio || null,
          postulacion_fin:    d.postulacion_fin    || null,
          resultados:         d.resultados         || null,
          estado_override:    d.estado_override    || null,
          notas:              d.notas              || null,
        }));

      await Promise.all(reqs);

      onSaved({
        ...u,
        tracker_precio_display: uniFields.tracker_precio_display || null,
        tracker_notas:          uniFields.tracker_notas          || null,
        tracker_fases: (u.tracker_fases || []).map(f => efectiva(f)),
      });
      setDrafts({});
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setUniFields({ tracker_precio_display: u.tracker_precio_display || "", tracker_notas: u.tracker_notas || "" });
    setDrafts({});
    setEditMode(false);
  }

  async function handleAddFase() {
    await onAddFase(u.id_universidad);
  }

  async function handleDelFase(faseId) {
    await onDelFase(u.id_universidad, faseId);
    setDrafts(prev => { const n = { ...prev }; delete n[faseId]; return n; });
  }

  // Cabecera compartida entre ambos modos
  const header = (
    <div className="phdr">
      <div className="pmeta">
        <span className="ltag" style={{ background: lc.bg, color: lc.t, fontSize: 10 }}>{lc.label} · {lc.paquete}</span>
        <div className="ptitle">{u.sigla} — {u.nombre_completo}</div>
        <div className="pcity">{u.ciudad}</div>
        {u.url_masteres && <a className="plink" href={u.url_masteres} target="_blank" rel="noreferrer">📋 Catálogo de másteres →</a>}
      </div>
      <button className="xcls" onClick={onClose}>✕</button>
    </div>
  );

  // ── Modo lectura ──────────────────────────────────────────────────────────────
  if (!editMode) {
    return (
      <>
        <div className="pin">
          {header}

          <div className="fld">
            <span className="flbl">Precio a mostrar</span>
            {u.tracker_precio_display
              ? <div className="ro-val">{u.tracker_precio_display}</div>
              : <div className="ro-empty">Sin precio registrado</div>}
          </div>

          <div className="fld">
            <span className="flbl">Notas generales</span>
            {u.tracker_notas
              ? <div className="ro-val" style={{ whiteSpace: "pre-wrap" }}>{u.tracker_notas}</div>
              : <div className="ro-empty">Sin notas</div>}
          </div>

          <div className="pshdr">
            <span className="pstitle">Fases <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>({(u.tracker_fases || []).length})</span></span>
          </div>

          {(u.tracker_fases || []).length === 0 && (
            <div style={{ fontSize: 12, color: "#94a3b8", padding: "10px 0" }}>Sin fases registradas</div>
          )}
          {(u.tracker_fases || []).map((f, i) => (
            <FaseBlockRO key={f.id_fase} f={f} idx={i} />
          ))}
        </div>

        <div className="save-bar">
          <button className="btn-edit" onClick={() => setEditMode(true)}>✏ Modificar</button>
        </div>
      </>
    );
  }

  // ── Modo edición ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="pin">
        {header}

        <div className="fld">
          <span className="flbl">Precio a mostrar</span>
          <input className="inp" value={uniFields.tracker_precio_display}
            onChange={e => setUniFields(p => ({ ...p, tracker_precio_display: e.target.value }))}
            placeholder="€850, €1.300–€2.640…" />
        </div>

        <div className="fld">
          <span className="flbl">Notas generales</span>
          <textarea className="inp" rows={2} style={{ resize: "vertical" }}
            value={uniFields.tracker_notas}
            onChange={e => setUniFields(p => ({ ...p, tracker_notas: e.target.value }))}
            placeholder="Añadir notas…" />
        </div>

        <div className="pshdr">
          <span className="pstitle">Fases <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>({(u.tracker_fases || []).length})</span></span>
          <button className="addbtn" onClick={handleAddFase}>+ Nueva fase</button>
        </div>

        {(u.tracker_fases || []).map((f, i) => (
          <FaseBlock
            key={f.id_fase}
            f={f}
            idx={i}
            total={(u.tracker_fases || []).length}
            hasDraft={!!drafts[f.id_fase]}
            getVal={field => val(f.id_fase, field)}
            efectiva={() => efectiva(f)}
            onChange={(field, v) => updDraft(f.id_fase, field, v)}
            onDel={() => handleDelFase(f.id_fase)}
          />
        ))}

        <div className="tip">
          💡 <strong>Tip:</strong> Añadir/eliminar fases se guarda al instante. Los demás cambios se guardan al pulsar <em>Guardar cambios</em>.
        </div>
      </div>

      <div className="save-bar">
        {isDirty && <span className="dirty-badge">● Cambios sin guardar</span>}
        <button className="btn-discard" onClick={handleDiscard}>Cancelar</button>
        <button className="btn-save" onClick={handleSave} disabled={!isDirty || saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </>
  );
}

// ── Bloque de solo lectura de una fase ───────────────────────────────────────

function FaseBlockRO({ f, idx }) {
  const st = computeStatus(f);
  const c  = SCFG[st];
  return (
    <div className="pblock" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
      <div className="pbhdr">
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span className="fnum">F{idx + 1}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>{f.nombre}</span>
          <span className="sbadge" style={{ background: c.bg, color: c.t, borderColor: c.b }}>
            <span className="sdot" style={{ background: c.d }} />{c.l}
          </span>
        </div>
      </div>

      <div className="g2">
        <div>
          <span className="flbl">Inicio postulación</span>
          <div className="ro-val">{f.postulacion_inicio ? fmt(f.postulacion_inicio) : <span className="ro-empty">—</span>}</div>
        </div>
        <div>
          <span className="flbl">Fin postulación</span>
          <div className="ro-val">{f.postulacion_fin ? fmt(f.postulacion_fin) : <span className="ro-empty">—</span>}</div>
        </div>
      </div>

      {f.resultados && (
        <div className="fld">
          <span className="flbl">Fecha resultados</span>
          <div className="ro-val">{fmt(f.resultados)}</div>
        </div>
      )}

      {f.notas && (
        <div className="fld">
          <span className="flbl">Notas</span>
          <div className="ro-val" style={{ whiteSpace: "pre-wrap" }}>{f.notas}</div>
        </div>
      )}
    </div>
  );
}

// ── Bloque de edición de una fase ─────────────────────────────────────────────

function FaseBlock({ f, idx, total, hasDraft, getVal, efectiva, onChange, onDel }) {
  const st  = computeStatus(efectiva());
  const c   = SCFG[st];
  const empty = !getVal("postulacion_inicio") && !getVal("postulacion_fin");

  return (
    <div className="pblock" style={{ background: empty ? "#fdfaff" : "#f8fafc", borderColor: empty ? "#e9d8fd" : "#e2e8f0" }}>
      <div className="pbhdr">
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span className="fnum">F{idx + 1}</span>
          <span className="sbadge" style={{ background: c.bg, color: c.t, borderColor: c.b }}>
            <span className="sdot" style={{ background: c.d }} />{c.l}
          </span>
          {empty    && <span style={{ fontSize: 10, color: "#8b5cf6", fontStyle: "italic" }}>↑ añadir fechas</span>}
          {hasDraft && <span className="fase-edited">editado</span>}
        </div>
        {total > 1 && <button className="delbtn" onClick={onDel}>✕ Eliminar</button>}
      </div>

      {/* Nombre */}
      <div className="fld">
        <span className="flbl">Nombre</span>
        <input className="inp" value={getVal("nombre")} onChange={e => onChange("nombre", e.target.value)} />
      </div>

      {/* Fechas postulación */}
      <div className="g2">
        <div>
          <span className="flbl">Inicio postulación</span>
          <input type="date" className="inp" value={getVal("postulacion_inicio")} onChange={e => onChange("postulacion_inicio", e.target.value)} />
        </div>
        <div>
          <span className="flbl">Fin postulación</span>
          <input type="date" className="inp" value={getVal("postulacion_fin")} onChange={e => onChange("postulacion_fin", e.target.value)} />
        </div>
      </div>

      {/* Resultados */}
      <div className="fld">
        <span className="flbl">Fecha resultados</span>
        <input type="date" className="inp" value={getVal("resultados")} onChange={e => onChange("resultados", e.target.value)} />
      </div>

      {/* Estado forzado */}
      <div className="fld">
        <span className="flbl">Forzar estado (opcional)</span>
        <select className="inp" value={getVal("estado_override")} onChange={e => onChange("estado_override", e.target.value || null)}>
          <option value="">🤖 Automático</option>
          <option value="pendiente">⏳ Próxima</option>
          <option value="abierto">✓ Abierta</option>
          <option value="cerrado">⏸ Cerrada — esperando</option>
          <option value="resultados">📋 Resultados publicados</option>
          <option value="depende">❓ Sin fecha</option>
        </select>
      </div>

      {/* Notas de fase */}
      <div className="fld">
        <span className="flbl">Notas de esta fase</span>
        <textarea className="inp" rows={2} style={{ resize: "vertical" }}
          value={getVal("notas")} onChange={e => onChange("notas", e.target.value)}
          placeholder="Requisitos especiales…" />
      </div>
    </div>
  );
}
