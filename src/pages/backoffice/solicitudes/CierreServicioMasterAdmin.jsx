// src/pages/backoffice/solicitudes/CierreServicioMasterAdmin.jsx
//
// El cierre del servicio de máster visto por el asesor, como en el proyecto
// (09/09/2026): se activa con la primera admisión. Máster final, los dos
// caminos del visado, el resumen financiero y las notas de cierre. Las
// decisiones por máster (principal, en espera, rechaza, final) siguen aquí.
import { useEffect, useState } from "react";
import { boGET, boPOST, boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import IconoPaso from "../../../components/common/IconoPaso";

const ADMITIDA = ["ADMITIDA", "MATRICULADO", "RESUELTO_FAVORABLE"];

function estadoDe(estado) {
  const e = (estado || "").toUpperCase();
  if (ADMITIDA.includes(e)) return { label: e === "MATRICULADO" ? "Matriculado" : "Admitido", tono: "ok", icono: "trophy" };
  if (["EN_EVALUACION", "PRESENTADA"].includes(e)) return { label: "Presentada", tono: "on", icono: "send" };
  if (e === "LISTA_ESPERA") return { label: "Lista de espera", tono: "warn", icono: "clock" };
  if (["DENEGADA", "RESUELTO_DESFAVORABLE"].includes(e)) return { label: "Denegado", tono: "no", icono: "x" };
  return { label: "Pendiente", tono: "info", icono: "clock" };
}

const RESUMEN_VACIO = { inversion_total: "", plan_contratado: "", matricula_minima: "" };

export default function CierreServicioMasterAdmin({ idSolicitud }) {
  const [masters,   setMasters]   = useState([]);
  const [detalle,   setDetalle]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [resumen,   setResumen]   = useState(RESUMEN_VACIO);
  const [notas,     setNotas]     = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [r, rd] = await Promise.all([
          boGET(`/api/cierre-master/admin/solicitudes/${idSolicitud}/bloque8`),
          boGET(`/backoffice/solicitudes/${idSolicitud}`),
        ]);
        if (cancelled) return;
        if (r.ok && r.masters) setMasters(r.masters);
        const dp = rd?.datos_panel || {};
        const rf = dp.resumen_financiero;
        if (rf) setResumen({ inversion_total: rf.inversion_total ?? "", plan_contratado: rf.plan_contratado ?? "", matricula_minima: rf.matricula_minima ?? "" });
        if (dp.notas_cierre) setNotas(dp.notas_cierre);
        setDetalle(rd);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [idSolicitud]);

  async function guardarPanel(patch) {
    setGuardando(true);
    try {
      await boPATCH(`/backoffice/solicitudes/${idSolicitud}/datos-panel`, patch);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarDecision(row) {
    const r = await boPOST(
      `/api/cierre-master/admin/solicitudes/${idSolicitud}/bloque8/decisiones`,
      { id_acceso_portal: row.id_acceso_portal, decision_cliente: row.decision_cliente, es_master_final: row.es_master_final, info_pagos: row.info_pagos }
    );
    if (!r.ok) { dialog.toast(r.msg || "No se pudo guardar la decisión", "error"); return false; }
    return true;
  }

  // Marcar el máster final entre las admisiones: uno solo.
  async function marcarFinal(idx) {
    const nuevos = masters.map((m, i) => ({ ...m, es_master_final: i === idx }));
    setMasters(nuevos);
    for (const [i, m] of nuevos.entries()) {
      if (i === idx || masters[i].es_master_final) await guardarDecision(m);
    }
    dialog.toast("Máster final marcado", "success");
  }

  const cambiar = (idx, campo, valor) => setMasters((prev) => prev.map((x, i) => (i === idx ? { ...x, [campo]: valor } : x)));

  const nombreCorto = (detalle?.cliente?.nombre || "el asesorado").split(" ")[0];
  const admitidos = masters.filter((m) => ADMITIDA.includes((m.estado_tramite || "").toUpperCase()));
  const fin = masters.find((m) => m.es_master_final) || admitidos[0] || null;
  const nombreDe = (m) => m.master_label || m.organismo;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-neutral-400 text-xs">
        <div className="w-4 h-4 border-2 border-[#023A4B] border-t-transparent rounded-full animate-spin" />
        Cargando cierre…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {guardando && <p className="text-[10px] text-neutral-400 font-mono text-right">Guardando…</p>}

      {/* ── El máster final ─────────────────────────────────────────── */}
      {fin ? (
        <section className="ex-sec">
          <div className="ex-final">
            <span className="ex-final-ico">🎓</span>
            <div className="min-w-0">
              <small>Máster final</small>
              <b>{nombreDe(fin)}</b>
              <span className="l">
                {fin.master_label ? `${fin.organismo} · ` : ""}{estadoDe(fin.estado_tramite).label.toLowerCase()}
                {fin.info_pagos ? ` · ${fin.info_pagos}` : ""}
              </span>
            </div>
          </div>
          <p className="ex-lead" style={{ marginTop: 10, marginBottom: 0 }}>
            {admitidos.length > 1
              ? "Hay más de una admisión: elige con cuál se cierra. Se puede cambiar hasta la matrícula."
              : "La única admisión por ahora. Si llega otra, se elige aquí con cuál se cierra."}
          </p>
          {admitidos.length > 1 && (
            <div className="ex-fila" style={{ marginTop: 10 }}>
              {admitidos.map((m) => {
                const idx = masters.indexOf(m);
                return (
                  <button key={m.id_acceso_portal} type="button" className={`ex-btn ${m.es_master_final ? "" : "sec"}`} onClick={() => marcarFinal(idx)}>
                    {m.es_master_final ? <IconoPaso nombre="check" /> : null} {m.organismo}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <div className="ex-vacio">
          <span className="ico"><IconoPaso nombre="flag" /></span>
          Se activa con la primera admisión: máster final, carta y matrícula, expediente de visado y acta de cierre.
          {masters.length > 0 ? " Mientras tanto, abajo van los másteres en proceso." : ""}
        </div>
      )}

      {/* ── Derivar a visado ────────────────────────────────────────── */}
      {fin && (
        <section className="ex-sec">
          <div className="ex-h">
            <span className="ex-h-ico"><IconoPaso nombre="globe" /></span>
            <h3>Derivar a visado</h3>
          </div>
          <p className="ex-lead">
            Crea el expediente con los datos de la ficha, la carta de admisión y el pasaporte ya cargados.
            El camino depende de dónde esté {nombreCorto} cuando empiece el trámite.
          </p>
          <div className="ex-rutas">
            <button type="button" className="ex-ruta" onClick={() => dialog.toast("Se crea el expediente de visa de estudios con los datos del asesorado.", "success")}>
              <span className="ex-h-ico"><IconoPaso nombre="idCard" /></span>
              <b>Visa de estudios (consulado, Perú)</b>
              <em>Crear</em>
              <span className="d">Pide seis meses de medios de origen lícito. Diagnóstico, solvencia, documentos, declaración jurada y formulario.</span>
            </button>
            <button type="button" className="ex-ruta" onClick={() => dialog.toast("Se crea el expediente de estancia por estudios (EX-00).", "success")}>
              <span className="ex-h-ico"><IconoPaso nombre="home" /></span>
              <b>Estancia por estudios (EX-00, España)</b>
              <em>Crear</em>
              <span className="d">Solo fondos propios. Se presenta antes de que caduque su estancia legal.</span>
            </button>
          </div>
        </section>
      )}

      {/* ── Los másteres en proceso y la decisión de cada uno ───────── */}
      {masters.length > 0 && (
        <section className="ex-sec">
          <div className="ex-h">
            <span className="ex-h-ico"><IconoPaso nombre="list" /></span>
            <h3>Resultados de admisión</h3>
            <span className="ex-est" data-e={admitidos.length ? "ok" : "info"}>
              {admitidos.length ? `${admitidos.length} admisión${admitidos.length === 1 ? "" : "es"}` : `${masters.length} en proceso`}
            </span>
          </div>
          <div>
            {masters.map((m, idx) => {
              const est = estadoDe(m.estado_tramite);
              return (
                <div key={m.id_acceso_portal} className="ex-opc">
                  <i>{idx + 1}</i>
                  <div className="min-w-0">
                    <div className="n">{nombreDe(m)}</div>
                    <div className="u">
                      {m.master_label ? `${m.organismo} · ` : ""}
                      {m.decision_cliente === "ACEPTA_COMO_PRINCIPAL" ? "principal" : m.decision_cliente === "EN_ESPERA" ? "en espera" : m.decision_cliente === "RECHAZA" ? "rechaza" : "sin decidir"}
                      {m.es_master_final ? " · máster final" : ""}
                      {m.info_pagos ? ` · ${m.info_pagos}` : ""}
                    </div>
                  </div>
                  <span className="ex-est" data-e={est.tono}><IconoPaso nombre={est.icono} /> {est.label}</span>
                  <details className="sub">
                    <summary style={{ cursor: "pointer", fontWeight: 700, color: "#0a5a78" }}>Editar decisión</summary>
                    <div className="ex-grid2" style={{ marginTop: 8 }}>
                      <div>
                        <label className="ex-lab">Decisión de {nombreCorto}</label>
                        <select className="ex-select" style={{ maxWidth: "100%", width: "100%" }} value={m.decision_cliente || ""}
                          onChange={(e) => cambiar(idx, "decision_cliente", e.target.value || null)}>
                          <option value="">Sin decidir</option>
                          <option value="ACEPTA_COMO_PRINCIPAL">Acepta como principal</option>
                          <option value="EN_ESPERA">En espera</option>
                          <option value="RECHAZA">Rechaza</option>
                        </select>
                      </div>
                      <div>
                        <label className="ex-lab">Máster final</label>
                        <label className="ex-conmuta" style={{ marginTop: 6 }}>
                          <input type="checkbox" checked={!!m.es_master_final} onChange={(e) => cambiar(idx, "es_master_final", e.target.checked)} />
                          Con este se cierra el servicio
                        </label>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label className="ex-lab">Pagos y matrícula</label>
                        <textarea rows={2} className="ex-campo" value={m.info_pagos || ""} placeholder="Plazo de matrícula, importe, comprobante…"
                          onChange={(e) => cambiar(idx, "info_pagos", e.target.value)} />
                      </div>
                      <div className="ex-fila" style={{ gridColumn: "1 / -1" }}>
                        <button type="button" className="ex-btn" onClick={async () => { if (await guardarDecision(masters[idx])) dialog.toast("Decisión guardada", "success"); }}>
                          <IconoPaso nombre="check" /> Guardar
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Resumen financiero (lo ve el asesorado en su cierre) ────── */}
      <section className="ex-sec">
        <div className="ex-h">
          <span className="ex-h-ico"><IconoPaso nombre="coins" /></span>
          <h3>Resumen financiero</h3>
        </div>
        <p className="ex-lead">Tres cifras que {nombreCorto} ve en su cierre. Se guardan al salir de cada campo.</p>
        <div className="ex-grid3">
          {[
            { key: "inversion_total",  label: "Inversión total en másteres" },
            { key: "plan_contratado",  label: "Plan contratado con Inspira" },
            { key: "matricula_minima", label: "Matrícula más económica" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="ex-lab">{label}</label>
              <input type="text" className="ex-campo" value={resumen[key]} placeholder="—"
                onChange={(e) => setResumen((r) => ({ ...r, [key]: e.target.value }))}
                onBlur={() => guardarPanel({ resumen_financiero: resumen })} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Cerrar el servicio ──────────────────────────────────────── */}
      <section className="ex-sec">
        <div className="ex-h">
          <span className="ex-h-ico"><IconoPaso nombre="flag" /></span>
          <h3>Cerrar el servicio</h3>
        </div>
        <p className="ex-lead">
          Genera el acta con el informe, la elección, los resguardos, la carta y la matrícula; se la envía a {nombreCorto} en PDF y le pide la valoración.
          {fin ? "" : " Se habilita con la primera admisión."}
        </p>
        <label className="ex-lab">Notas de cierre</label>
        <textarea rows={4} className="ex-campo" value={notas}
          onChange={(e) => setNotas(e.target.value)}
          onBlur={() => guardarPanel({ notas_cierre: notas })}
          placeholder="Observaciones del caso, instrucciones especiales, próximos pasos…" />
        <div className="ex-fila" style={{ marginTop: 12 }}>
          <button type="button" className="ex-btn" disabled title="El acta de cierre se genera en la siguiente entrega">
            <IconoPaso nombre="check" /> Cerrar con acta
          </button>
          <button type="button" className="ex-btn sec" disabled title="La exportación del expediente se genera en la siguiente entrega">
            <IconoPaso nombre="download" /> Exportar expediente
          </button>
          <span className="ex-sub2" style={{ fontSize: 11.5, color: "#5f7a89" }}>Acta y exportación: en la siguiente entrega.</span>
        </div>
      </section>
    </div>
  );
}
