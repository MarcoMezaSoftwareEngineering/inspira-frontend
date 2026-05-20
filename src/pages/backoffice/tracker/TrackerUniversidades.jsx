import { useState, useEffect, useRef } from "react";
import { boGET, boPATCH, boPOST, boDELETE } from "../../../services/backofficeApi";

// ── Constantes ────────────────────────────────────────────────────────────────

const ANIO = "2025-2026";

const TODAY = (() => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
})();

const SCFG = {
  pendiente:  { l: "Próxima",       s: "Próx.",   d: "#94a3b8", bg: "#f1f5f9", t: "#475569", b: "#cbd5e1" },
  abierto:    { l: "✅ Abierta",   s: "Abierta", d: "#22c55e", bg: "#dcfce7", t: "#15803d", b: "#86efac" },
  cerrado:    { l: "Cerrada",       s: "Cerrada", d: "#f59e0b", bg: "#fef3c7", t: "#92400e", b: "#fcd34d" },
  resultados: { l: "🏆 Result.",   s: "Result.", d: "#6366f1", bg: "#ede9fe", t: "#4338ca", b: "#c4b5fd" },
  depende:    { l: "Sin fecha",     s: "S/fecha", d: "#8b5cf6", bg: "#f5f3ff", t: "#6d28d9", b: "#ddd6fe" },
};

const LISTA_CFG = {
  LISTA_1: { label: "Lista 1", bg: "#d1fae5", t: "#065f46", d: "#10b981", paquete: "Full Económico" },
  LISTA_2: { label: "Lista 2", bg: "#fef3c7", t: "#92400e", d: "#f59e0b", paquete: "Intermedias"   },
  LISTA_3: { label: "Lista 3", bg: "#fee2e2", t: "#991b1b", d: "#ef4444", paquete: "Premium"        },
};

// ── Helpers de fechas ─────────────────────────────────────────────────────────

function toDate(iso) {
  if (!iso) return null;
  return new Date(iso.substring(0, 10) + "T12:00:00");
}

function toDateStr(iso) {
  if (!iso) return "";
  return iso.substring(0, 10);
}

const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso.substring(0, 10) + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

const dUntil = (iso) => {
  if (!iso) return null;
  return Math.round((toDate(iso) - TODAY) / 86400000);
};

// ── Lógica de estado ──────────────────────────────────────────────────────────

function computeStatus(fase) {
  if (fase.estado_override) return fase.estado_override;
  const ini = toDate(fase.postulacion_inicio);
  const fin = toDate(fase.postulacion_fin);
  const res = toDate(fase.resultados);
  if (!ini || !fin) return "depende";
  if (TODAY < ini) return "pendiente";
  if (TODAY >= ini && TODAY <= fin) return "abierto";
  if (res && TODAY > fin && TODAY <= res) return "cerrado";
  if (res && TODAY > res) return "resultados";
  return "cerrado";
}

function uniStatus(uni) {
  if (!uni.tracker_fases.length) return "depende";
  for (const s of ["abierto", "pendiente", "cerrado", "resultados", "depende"])
    for (const f of uni.tracker_fases)
      if (computeStatus(f) === s) return s;
  return "depende";
}

function bestFase(uni) {
  return (
    uni.tracker_fases.find(f => computeStatus(f) === "abierto")    ||
    uni.tracker_fases.find(f => computeStatus(f) === "pendiente")  ||
    uni.tracker_fases.find(f => computeStatus(f) === "cerrado")    ||
    uni.tracker_fases[uni.tracker_fases.length - 1] ||
    null
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function TrackerUniversidades() {
  const [unis,    setUnis]    = useState([]);
  const [selId,   setSelId]   = useState(null);
  const [fL,      setFL]      = useState("Todas");
  const [fS,      setFS]      = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    boGET(`/backoffice/tracker/unis?anio=${ANIO}`)
      .then(d => { if (d.ok) setUnis(d.unis); })
      .finally(() => setLoading(false));
  }, []);

  // ── Mutaciones locales ──────────────────────────────────────────────────────

  function updFaseLocal(idFase, updates) {
    setUnis(prev =>
      prev.map(u => ({
        ...u,
        tracker_fases: u.tracker_fases.map(f =>
          f.id_fase === idFase ? { ...f, ...updates } : f
        ),
      }))
    );
  }

  async function updFase(idFase, field, val) {
    const patch = { [field]: val || null };
    if (["postulacion_inicio", "postulacion_fin", "resultados"].includes(field)) {
      patch.estado_override = null;
      updFaseLocal(idFase, { [field]: val, estado_override: null });
    } else {
      updFaseLocal(idFase, { [field]: val });
    }
    await boPATCH(`/backoffice/tracker/fases/${idFase}`, patch);
  }

  async function updUni(id, field, val) {
    setUnis(prev => prev.map(u => u.id_universidad === id ? { ...u, [field]: val } : u));
    await boPATCH(`/backoffice/tracker/unis/${id}`, { [field]: val });
  }

  async function addFase(id) {
    const d = await boPOST(`/backoffice/tracker/unis/${id}/fases`, { anio_academico: ANIO });
    if (d.ok) {
      setUnis(prev =>
        prev.map(u =>
          u.id_universidad === id
            ? { ...u, tracker_fases: [...u.tracker_fases, d.fase] }
            : u
        )
      );
    }
  }

  async function delFase(uniId, faseId) {
    await boDELETE(`/backoffice/tracker/fases/${faseId}`);
    setUnis(prev =>
      prev.map(u =>
        u.id_universidad === uniId
          ? { ...u, tracker_fases: u.tracker_fases.filter(f => f.id_fase !== faseId) }
          : u
      )
    );
  }

  // ── Filtros y conteos ───────────────────────────────────────────────────────

  const filteredUnis = unis.filter(u => {
    if (fL !== "Todas" && u.lista_inspira !== fL) return false;
    if (fS !== "Todos" && uniStatus(u) !== fS)    return false;
    return true;
  });

  const counts = { abierto: 0, pendiente: 0, cerrado: 0, resultados: 0, depende: 0 };
  unis.forEach(u => { const s = uniStatus(u); if (s in counts) counts[s]++; });

  // ── Alertas urgentes ────────────────────────────────────────────────────────

  const alerts = [];
  unis.forEach(u =>
    u.tracker_fases.forEach((f, i) => {
      const st = computeStatus(f);
      const pl = u.tracker_fases.length > 1 ? ` F${i + 1}` : "";
      if (st === "abierto" && f.postulacion_fin) {
        const d = dUntil(f.postulacion_fin);
        if (d !== null && d <= 7 && d >= 0)
          alerts.push({ lv: d <= 2 ? 0 : 1, uni: u.sigla, nom: u.nombre_completo, msg: "Cierre postulación",
            det: fmt(f.postulacion_fin) + pl, d,
            badge: d === 0 ? "HOY" : d === 1 ? "MAÑANA" : d + "d",
            bg: d <= 2 ? "#fef2f2" : "#fffbeb", bdr: d <= 2 ? "#fca5a5" : "#fde68a",
            tc: d <= 2 ? "#991b1b" : "#92400e", bc: d <= 2 ? "#ef4444" : "#f59e0b" });
      }
      if (st === "cerrado" && f.resultados) {
        const d = dUntil(f.resultados);
        if (d !== null && d <= 5 && d >= 0)
          alerts.push({ lv: d <= 1 ? 0 : 1, uni: u.sigla, nom: u.nombre_completo, msg: "Resultados",
            det: fmt(f.resultados) + pl, d,
            badge: d === 0 ? "HOY" : d === 1 ? "MAÑANA" : d + "d",
            bg: d <= 1 ? "#fef2f2" : "#fffbeb", bdr: d <= 1 ? "#fca5a5" : "#fde68a",
            tc: d <= 1 ? "#991b1b" : "#92400e", bc: d <= 1 ? "#ef4444" : "#f59e0b" });
      }
    })
  );
  alerts.sort((a, b) => a.lv - b.lv || a.d - b.d);

  const selUni = unis.find(u => u.id_universidad === selId) || null;

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-neutral-400 text-sm">Cargando tracker…</span>
      </div>
    );
  }

  const HDR = "linear-gradient(135deg,#0f2444,#1e4080,#1a5276)";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", fontFamily: "inherit" }}>

      {/* ── Header ── */}
      <div style={{ background: HDR, color: "white", padding: "12px 16px 0", flexShrink: 0 }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, opacity: .5, textTransform: "uppercase" }}>
            INSPIRA · Másteres España {ANIO}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, margin: "2px 0" }}>Tracker Universidades</div>
          <div style={{ fontSize: 10, opacity: .5 }}>{unis.length} universidades · ciclo {ANIO}</div>
        </div>

        {/* Tabs de estado */}
        <div style={{ display: "flex", gap: 3, overflowX: "auto" }}>
          {[
            ["Todos",      "Todas (" + unis.length + ")"],
            ["abierto",    "✅ Abiertas (" + counts.abierto + ")"],
            ["pendiente",  "⏳ Próximas (" + counts.pendiente + ")"],
            ["cerrado",    "⏸ Esperando (" + counts.cerrado + ")"],
            ["resultados", "🏆 Result. (" + counts.resultados + ")"],
            ["depende",    "S/fecha (" + counts.depende + ")"],
          ].map(([v, l]) => (
            <button key={v} onClick={() => setFS(v)} style={{
              padding: "5px 11px", borderRadius: "6px 6px 0 0", border: "none", cursor: "pointer",
              fontSize: 11, whiteSpace: "nowrap", fontFamily: "inherit",
              background: fS === v ? "white" : "rgba(255,255,255,.1)",
              color:      fS === v ? "#0f2444" : "rgba(255,255,255,.75)",
              fontWeight: fS === v ? 700 : 400,
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── Subbar Lista ── */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "6px 16px", display: "flex", gap: 4, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>LISTA:</span>
        {["Todas", "LISTA_1", "LISTA_2", "LISTA_3"].map(v => {
          const lc = LISTA_CFG[v] || {};
          const on = fL === v;
          return (
            <button key={v} onClick={() => setFL(v)} style={{
              padding: "2px 10px", borderRadius: 20, fontSize: "11.5px", cursor: "pointer", fontFamily: "inherit",
              border:      on ? `1.5px solid ${lc.d}` : "1.5px solid #e2e8f0",
              background:  on ? lc.bg : "white",
              color:       on ? lc.t  : "#64748b",
              fontWeight:  on ? 700   : 400,
            }}>{v === "Todas" ? "Todas" : lc.label}</button>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>
          {filteredUnis.length} de {unis.length} · clic en fila para editar
        </span>
      </div>

      {/* ── Alertas ── */}
      {alerts.length === 0 ? (
        <div style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, fontSize: "12.5px", color: "#15803d", fontWeight: 500 }}>
          ✓ Sin cierres urgentes en los próximos 7 días
        </div>
      ) : (
        <div style={{ background: "#fafafa", borderBottom: "2px solid #e2e8f0", flexShrink: 0 }}>
          <div style={{ padding: "5px 16px 3px", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
            🔔 {alerts.length} alerta{alerts.length > 1 ? "s" : ""} urgente{alerts.length > 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", gap: 8, padding: "4px 16px 10px", overflowX: "auto" }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ flexShrink: 0, borderRadius: 10, padding: "8px 12px", minWidth: 170, border: `1.5px solid ${a.bdr}`, background: a.bg }}>
                <span style={{ display: "inline-block", fontSize: 11, color: "white", padding: "1px 8px", borderRadius: 6, fontWeight: 700, marginBottom: 3, background: a.bc }}>{a.badge}</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: a.tc }}>{a.uni}</div>
                <div style={{ fontSize: "10.5px", opacity: .7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150, color: a.tc }}>{a.nom}</div>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: a.tc }}>{a.msg} · {a.det}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Cuerpo: tabla + panel ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Tabla */}
        <div style={{ flex: selId ? "0 0 55%" : 1, overflowY: "auto", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", position: "sticky", top: 0, zIndex: 5 }}>
                {["Sigla", "Universidad", "Lista", "Estado", "Fases", "Postulación activa", "Result.", "Días"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: .4, borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUnis.map(u => (
                <UniRow
                  key={u.id_universidad}
                  u={u}
                  sel={selId === u.id_universidad}
                  onClick={() => setSelId(selId === u.id_universidad ? null : u.id_universidad)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel lateral */}
        {selUni && (
          <div style={{ width: "45%", borderLeft: "1px solid #e2e8f0", overflowY: "auto", background: "white", flexShrink: 0 }}>
            <UniPanel
              key={selUni.id_universidad}
              u={selUni}
              onClose={() => setSelId(null)}
              onUpdFase={updFase}
              onUpdUni={updUni}
              onAddFase={addFase}
              onDelFase={delFase}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Fila de la tabla ──────────────────────────────────────────────────────────

function UniRow({ u, sel, onClick }) {
  const st = uniStatus(u);
  const lc = LISTA_CFG[u.lista_inspira] || {};
  const bf = bestFase(u);

  const dateRange = bf && bf.postulacion_inicio
    ? <span style={{ fontSize: 12, color: "#475569" }}>
        <b>{fmt(bf.postulacion_inicio)}</b>
        <span style={{ color: "#cbd5e1", margin: "0 2px" }}>→</span>
        <b>{fmt(bf.postulacion_fin)}</b>
      </span>
    : <span style={{ color: "#e2e8f0", fontSize: 12 }}>Sin fecha aún</span>;

  const res = bf && bf.resultados
    ? <b style={{ fontSize: 12 }}>{fmt(bf.resultados)}</b>
    : <span style={{ color: "#e2e8f0", fontSize: 12 }}>—</span>;

  const c    = SCFG[st];
  const dC   = bf ? dUntil(bf.postulacion_fin)    : null;
  const dO   = bf ? dUntil(bf.postulacion_inicio) : null;
  const dR   = bf ? dUntil(bf.resultados)         : null;

  let daysEl = null;
  if      (st === "abierto"    && dC !== null) daysEl = <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", color: dC <= 7 ? "#ef4444" : "#94a3b8" }}>{dC <= 7 ? `¡Cierra en ${dC}d!` : dC + "d p/cierre"}</span>;
  else if (st === "pendiente"  && dO >= 0)     daysEl = <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", color: "#2563eb" }}>Abre en {dO}d</span>;
  else if (st === "cerrado"    && dR > 0)      daysEl = <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", color: "#7c3aed" }}>Result. en {dR}d</span>;
  else if (st === "resultados")                daysEl = <span style={{ fontSize: 12, fontWeight: 600, color: "#6366f1" }}>Publicados</span>;

  return (
    <tr
      onClick={onClick}
      style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: sel ? "#eff6ff" : "white" }}
      onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#f8fafc"; }}
      onMouseLeave={e => { e.currentTarget.style.background = sel ? "#eff6ff" : "white"; }}
    >
      <td style={{ padding: "9px 10px" }}>
        <span style={{ fontWeight: 700, color: "#0f2444", fontSize: 13 }}>{u.sigla}</span>
        {u.tracker_notas && <span style={{ fontSize: 9, color: "#f59e0b", marginLeft: 3 }}>★</span>}
      </td>
      <td style={{ padding: "9px 10px" }}>
        <div style={{ fontWeight: 500, color: "#1e293b" }}>{u.nombre_completo}</div>
        <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>{u.ciudad} · {u.tracker_precio_display || "—"}</div>
      </td>
      <td style={{ padding: "9px 10px" }}>
        <span style={{ fontSize: "10.5px", padding: "2px 6px", borderRadius: 4, fontWeight: 600, background: lc.bg, color: lc.t }}>{lc.label || u.lista_inspira}</span>
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{lc.paquete}</div>
      </td>
      <td style={{ padding: "9px 10px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10, fontSize: "10.5px", fontWeight: 600, background: c.bg, color: c.t, border: `1px solid ${c.b}`, whiteSpace: "nowrap" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.d, flexShrink: 0, display: "inline-block" }} />
          {c.l}
        </span>
      </td>
      <td style={{ padding: "9px 10px" }}>
        {u.tracker_fases.length <= 1
          ? <span style={{ fontSize: 11, color: "#cbd5e1" }}>{u.tracker_fases.length === 0 ? "0 fases" : "1 fase"}</span>
          : <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {u.tracker_fases.map((f, i) => {
                const s = computeStatus(f), cv = SCFG[s];
                return <span key={f.id_fase} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 6, fontWeight: 600, background: cv.bg, color: cv.t, border: `1px solid ${cv.b}` }} title={f.nombre}>F{i + 1}: {cv.s}</span>;
              })}
            </div>
        }
      </td>
      <td style={{ padding: "9px 10px" }}>{dateRange}</td>
      <td style={{ padding: "9px 10px" }}>{res}</td>
      <td style={{ padding: "9px 10px" }}>{daysEl}</td>
    </tr>
  );
}

// ── Panel lateral de edición ──────────────────────────────────────────────────

function UniPanel({ u, onClose, onUpdFase, onUpdUni, onAddFase, onDelFase }) {
  const lc = LISTA_CFG[u.lista_inspira] || {};

  return (
    <div style={{ padding: "16px 16px 40px" }}>
      {/* Cabecera del panel */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 600, background: lc.bg, color: lc.t }}>
            {lc.label} · {lc.paquete}
          </span>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f2444", margin: "4px 0 2px", lineHeight: 1.2 }}>
            {u.sigla} — {u.nombre_completo}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{u.ciudad}</div>
          {u.url_masteres && (
            <a href={u.url_masteres} target="_blank" rel="noreferrer"
              style={{ fontSize: 11, color: "#2563eb", textDecoration: "none", display: "inline-block", marginTop: 4 }}>
              📋 Catálogo de másteres →
            </a>
          )}
        </div>
        <button onClick={onClose}
          style={{ background: "#f1f5f9", border: "none", width: 26, height: 26, borderRadius: 6, color: "#64748b", fontSize: 14, cursor: "pointer", flexShrink: 0 }}>
          ✕
        </button>
      </div>

      {/* Precio display */}
      <Field label="Precio a mostrar">
        <input
          defaultValue={u.tracker_precio_display || ""}
          placeholder="€850, €1.300–€2.640…"
          onBlur={e => onUpdUni(u.id_universidad, "tracker_precio_display", e.target.value)}
          style={INPT}
        />
      </Field>

      {/* Notas generales */}
      <Field label="Notas generales">
        <textarea
          defaultValue={u.tracker_notas || ""}
          placeholder="Añadir notas…"
          rows={2}
          onBlur={e => onUpdUni(u.id_universidad, "tracker_notas", e.target.value)}
          style={{ ...INPT, resize: "vertical" }}
        />
      </Field>

      {/* Fases */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontWeight: 700, color: "#0f2444", fontSize: 13 }}>
          Fases <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>({u.tracker_fases.length})</span>
        </span>
        <button onClick={() => onAddFase(u.id_universidad)}
          style={{ padding: "4px 10px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: "11.5px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          + Nueva fase
        </button>
      </div>

      {u.tracker_fases.map((f, i) => (
        <FaseBlock
          key={f.id_fase}
          f={f}
          idx={i}
          total={u.tracker_fases.length}
          onUpd={(field, val) => onUpdFase(f.id_fase, field, val)}
          onDel={() => onDelFase(u.id_universidad, f.id_fase)}
        />
      ))}

      <div style={{ marginTop: 4, padding: "10px 14px", background: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd", fontSize: "11.5px", color: "#0369a1", lineHeight: 1.6 }}>
        💡 <strong>Tip:</strong> El estado se calcula automáticamente. Usa "Forzar estado" sólo cuando sea necesario.
      </div>
    </div>
  );
}

// ── Bloque de edición de una fase ─────────────────────────────────────────────

function FaseBlock({ f, idx, total, onUpd, onDel }) {
  const [vals, setVals] = useState({
    nombre:             f.nombre || "",
    postulacion_inicio: toDateStr(f.postulacion_inicio),
    postulacion_fin:    toDateStr(f.postulacion_fin),
    resultados:         toDateStr(f.resultados),
    estado_override:    f.estado_override || "",
    notas:              f.notas || "",
  });

  // Re-inicializa sólo cuando cambia el id_fase (nuevo bloque montado)
  const prevId = useRef(f.id_fase);
  useEffect(() => {
    if (prevId.current !== f.id_fase) {
      prevId.current = f.id_fase;
      setVals({
        nombre:             f.nombre || "",
        postulacion_inicio: toDateStr(f.postulacion_inicio),
        postulacion_fin:    toDateStr(f.postulacion_fin),
        resultados:         toDateStr(f.resultados),
        estado_override:    f.estado_override || "",
        notas:              f.notas || "",
      });
    }
  });

  // Sincroniza estado_override cuando el padre lo limpia (ej: al cambiar fechas)
  useEffect(() => {
    setVals(prev => ({ ...prev, estado_override: f.estado_override || "" }));
  }, [f.estado_override]);

  function set(field, val) {
    setVals(prev => ({ ...prev, [field]: val }));
  }

  function handleDate(field, val) {
    set(field, val);
    set("estado_override", "");
    onUpd(field, val);
  }

  const st = computeStatus({ ...f, estado_override: vals.estado_override || null,
    postulacion_inicio: vals.postulacion_inicio || null,
    postulacion_fin:    vals.postulacion_fin    || null,
    resultados:         vals.resultados         || null,
  });
  const c     = SCFG[st];
  const empty = !vals.postulacion_inicio && !vals.postulacion_fin;

  return (
    <div style={{ borderRadius: 9, padding: 12, marginBottom: 10, border: `1.5px solid ${empty ? "#e9d8fd" : "#e2e8f0"}`, background: empty ? "#fdfaff" : "#f8fafc" }}>
      {/* Encabezado de fase */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ background: "#0f2444", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>F{idx + 1}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10, fontSize: "10.5px", fontWeight: 600, background: c.bg, color: c.t, border: `1px solid ${c.b}` }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.d, display: "inline-block" }} />{c.l}
          </span>
          {empty && <span style={{ fontSize: 10, color: "#8b5cf6", fontStyle: "italic" }}>↑ añadir fechas</span>}
        </div>
        {total > 1 && (
          <button onClick={onDel} style={{ background: "none", border: "none", color: "#f87171", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>✕ Eliminar</button>
        )}
      </div>

      {/* Nombre */}
      <Field label="Nombre">
        <input value={vals.nombre} onChange={e => set("nombre", e.target.value)}
          onBlur={e => onUpd("nombre", e.target.value)} style={INPT} />
      </Field>

      {/* Fechas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 8 }}>
        <Field label="Inicio postulación" noMargin>
          <input type="date" value={vals.postulacion_inicio}
            onChange={e => handleDate("postulacion_inicio", e.target.value)} style={INPT} />
        </Field>
        <Field label="Fin postulación" noMargin>
          <input type="date" value={vals.postulacion_fin}
            onChange={e => handleDate("postulacion_fin", e.target.value)} style={INPT} />
        </Field>
      </div>

      <Field label="Fecha resultados">
        <input type="date" value={vals.resultados}
          onChange={e => handleDate("resultados", e.target.value)} style={INPT} />
      </Field>

      {/* Forzar estado */}
      <Field label="Forzar estado (opcional)">
        <select value={vals.estado_override}
          onChange={e => { set("estado_override", e.target.value); onUpd("estado_override", e.target.value || null); }}
          style={INPT}>
          <option value="">🤖 Automático</option>
          <option value="pendiente">⏳ Próxima</option>
          <option value="abierto">✅ Abierta</option>
          <option value="cerrado">⏸ Cerrada — esperando</option>
          <option value="resultados">🏆 Resultados publicados</option>
          <option value="depende">❓ Sin fecha</option>
        </select>
      </Field>

      {/* Notas */}
      <Field label="Notas de esta fase" noMargin>
        <textarea value={vals.notas} onChange={e => set("notas", e.target.value)}
          onBlur={e => onUpd("notas", e.target.value)}
          rows={2} placeholder="Requisitos especiales…"
          style={{ ...INPT, resize: "vertical" }} />
      </Field>
    </div>
  );
}

// ── Helpers de UI ─────────────────────────────────────────────────────────────

function Field({ label, children, noMargin }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 8 }}>
      <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .4, display: "block", marginBottom: 4 }}>{label}</span>
      {children}
    </div>
  );
}

const INPT = {
  width: "100%", padding: "6px 10px", border: "1.5px solid #e2e8f0", borderRadius: 7,
  fontSize: "12.5px", color: "#1e293b", background: "white", boxSizing: "border-box",
  outline: "none", fontFamily: "inherit",
};
