// src/pages/backoffice/solicitudes/CierreServicioMasterAdmin.jsx
//
// El cierre del servicio de máster visto por el asesor. Se activa con la
// primera admisión. Máster final, la vía migratoria que eligió el asesorado
// (y el alta del servicio que pida), los resultados, el resumen financiero,
// las notas, el cierre con correo de encuesta y la encuesta respondida.
//
// 12/09/2026: los botones «Crear» de las rutas solo enseñaban un aviso y
// «Cerrar con acta / Exportar» estaban deshabilitados; ahora todo lo visible
// hace algo. El acta en PDF y la exportación siguen pendientes y no se enseñan.
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
const ETIQUETA_VIA = { visa: "Visado de estudios", ee: "Estancia por estudios" };

const fechaCorta = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
};

export default function CierreServicioMasterAdmin({ idSolicitud }) {
  const [masters,    setMasters]    = useState([]);
  const [detalle,    setDetalle]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [resumen,    setResumen]    = useState(RESUMEN_VACIO);
  const [notas,      setNotas]      = useState("");
  const [guardando,  setGuardando]  = useState(false);
  const [derivacion, setDerivacion] = useState(null);
  const [opciones,   setOpciones]   = useState({});
  const [encuesta,   setEncuesta]   = useState(null);
  const [cierre,     setCierre]     = useState({ archivado: false });
  const [alta,       setAlta]       = useState({ via: "", plan: "" });
  const [ocupado,    setOcupado]    = useState(false);

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
        if (r.ok) {
          setMasters(r.masters || []);
          setDerivacion(r.derivacion || null);
          setOpciones(r.opciones_derivacion || {});
          setEncuesta(r.encuesta || null);
          setCierre(r.cierre || { archivado: false });
          const rf = r.resumen_financiero;
          if (rf) setResumen({ inversion_total: rf.inversion_total ?? "", plan_contratado: rf.plan_contratado ?? "", matricula_minima: rf.matricula_minima ?? "" });
          setNotas(r.notas_cierre || "");
          const via = r.derivacion?.via || "";
          setAlta({ via, plan: r.derivacion?.contratacion?.plan || (via ? (r.opciones_derivacion?.[via]?.planes || []).find((p) => p.recomendado)?.id || "" : "") });
        }
        // GET /backoffice/solicitudes/:id devuelve { ok, solicitud }.
        setDetalle(rd?.solicitud || rd);
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
      const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/datos-panel`, { datos_panel: patch });
      if (r && r.ok === false) dialog.toast(r.msg || "No se pudo guardar", "error");
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

  async function darDeAlta() {
    const plan = (opciones[alta.via]?.planes || []).find((p) => p.id === alta.plan);
    if (!alta.via || !plan) return dialog.toast("Elige la vía y el plan", "error");
    const ok = await dialog.confirm(
      `Se crea el expediente de ${ETIQUETA_VIA[alta.via]} (${plan.nombre}, ${plan.precio} €) para ${nombreCorto} y se le manda el correo de servicio confirmado. El cobro se registra aparte, como siempre.`,
      "Dar de alta el servicio"
    );
    if (!ok) return;
    setOcupado(true);
    const r = await boPOST(`/api/cierre-master/admin/solicitudes/${idSolicitud}/bloque8/derivacion/confirmar`, { via: alta.via, plan: alta.plan });
    setOcupado(false);
    if (!r.ok) return dialog.toast(r.msg || "No se pudo dar de alta", "error");
    setDerivacion(r.derivacion);
    dialog.toast(`Expediente #${r.id_solicitud_nueva} creado`, "success");
  }

  async function descartar() {
    if (!(await dialog.confirm("La petición queda descartada y el asesorado lo verá en su cierre. ¿Continuar?", "Descartar petición"))) return;
    setOcupado(true);
    const r = await boPOST(`/api/cierre-master/admin/solicitudes/${idSolicitud}/bloque8/derivacion/descartar`, {});
    setOcupado(false);
    if (!r.ok) return dialog.toast(r.msg || "No se pudo descartar", "error");
    setDerivacion(r.derivacion);
  }

  async function cerrar(reenviar = false) {
    const texto = reenviar
      ? `Se vuelve a mandar a ${nombreCorto} el correo de cierre con el enlace a la encuesta.`
      : `Se cierra el servicio y se manda a ${nombreCorto} un correo formal de conclusión con el enlace a la encuesta (con copia a administración). Las notas de cierre van en el correo.`;
    if (!(await dialog.confirm(texto, reenviar ? "Reenviar correo de cierre" : "Cerrar el servicio"))) return;
    await guardarPanel({ notas_cierre: notas });
    setOcupado(true);
    const r = await boPOST(`/api/cierre-master/admin/solicitudes/${idSolicitud}/bloque8/cerrar`, { reenviar });
    setOcupado(false);
    if (!r.ok) return dialog.toast(r.msg || "No se pudo cerrar", "error");
    setCierre(r.cierre);
    const aviso = { enviado: "Correo enviado", ya_enviado: "Cerrado (el correo ya se había enviado)", fallo: "Cerrado, pero el correo no salió" }[r.correo] || "Cerrado";
    dialog.toast(aviso, r.correo === "fallo" ? "error" : "success");
  }

  async function reabrir() {
    if (!(await dialog.confirm(`El servicio vuelve a estar abierto y ${nombreCorto} deja de ver la encuesta (sus respuestas se conservan).`, "Reabrir"))) return;
    setOcupado(true);
    const r = await boPOST(`/api/cierre-master/admin/solicitudes/${idSolicitud}/bloque8/reabrir`, {});
    setOcupado(false);
    if (!r.ok) return dialog.toast(r.msg || "No se pudo reabrir", "error");
    setCierre(r.cierre);
  }

  const cambiar = (idx, campo, valor) => setMasters((prev) => prev.map((x, i) => (i === idx ? { ...x, [campo]: valor } : x)));

  const nombreCorto = (detalle?.cliente?.nombre || "el asesorado").split(" ")[0];
  const admitidos = masters.filter((m) => ADMITIDA.includes((m.estado_tramite || "").toUpperCase()));
  const fin = masters.find((m) => m.es_master_final) || admitidos[0] || null;
  const nombreDe = (m) => m.master_label || m.organismo;
  const contratacion = derivacion?.contratacion || null;
  const confirmada = contratacion?.estado === "CONFIRMADA";

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
          Se activa con la primera admisión: máster final, vía migratoria, cierre y encuesta.
          {masters.length > 0 ? " Mientras tanto, abajo van los másteres en proceso." : ""}
        </div>
      )}

      {/* ── Vía migratoria y alta del servicio ──────────────────────── */}
      {fin && (
        <section className="ex-sec">
          <div className="ex-h">
            <span className="ex-h-ico"><IconoPaso nombre="globe" /></span>
            <h3>Visado o estancia</h3>
            {confirmada
              ? <span className="ex-est" data-e="ok"><IconoPaso nombre="check" /> Dado de alta</span>
              : contratacion?.estado === "PENDIENTE_CONFIRMACION"
                ? <span className="ex-est" data-e="warn"><IconoPaso nombre="clock" /> Pide contratar</span>
                : derivacion?.via
                  ? <span className="ex-est" data-e="on">Vía elegida</span>
                  : <span className="ex-est" data-e="info">Sin elegir</span>}
          </div>

          <p className="ex-lead">
            {derivacion?.via
              ? <>{nombreCorto} eligió <b>{ETIQUETA_VIA[derivacion.via]}</b> el {fechaCorta(derivacion.elegido_at)}.</>
              : <>{nombreCorto} aún no ha elegido vía en su panel. Se le pidió en el correo de admisión.</>}
            {contratacion?.estado === "PENDIENTE_CONFIRMACION" && (
              <> Pidió contratar <b>{contratacion.nombre} ({contratacion.precio} €)</b> el {fechaCorta(contratacion.solicitada_at)}.</>
            )}
            {contratacion?.estado === "DESCARTADA" && <> La petición de {contratacion.nombre} se descartó el {fechaCorta(contratacion.descartada_at)}.</>}
          </p>

          {confirmada ? (
            <p className="ex-lead" style={{ marginBottom: 0 }}>
              Alta de <b>{contratacion.nombre}</b> ({contratacion.precio} €) el {fechaCorta(contratacion.confirmada_at)}
              {contratacion.id_solicitud_nueva ? <> · <a className="font-semibold underline" href={`/backoffice/solicitudes/${contratacion.id_solicitud_nueva}`}>expediente #{contratacion.id_solicitud_nueva}</a></> : null}.
              El cobro se registra en ese expediente.
            </p>
          ) : (
            <div className="ex-grid2">
              <div>
                <label className="ex-lab">Vía</label>
                <select className="ex-select" style={{ maxWidth: "100%", width: "100%" }} value={alta.via}
                  onChange={(e) => {
                    const via = e.target.value;
                    setAlta({ via, plan: (opciones[via]?.planes || []).find((p) => p.recomendado)?.id || "" });
                  }}>
                  <option value="">Elegir…</option>
                  {Object.entries(opciones).map(([k, v]) => <option key={k} value={k}>{v.etiqueta}</option>)}
                </select>
              </div>
              <div>
                <label className="ex-lab">Plan</label>
                <select className="ex-select" style={{ maxWidth: "100%", width: "100%" }} value={alta.plan} disabled={!alta.via}
                  onChange={(e) => setAlta({ ...alta, plan: e.target.value })}>
                  <option value="">Elegir…</option>
                  {(opciones[alta.via]?.planes || []).map((p) => <option key={p.id} value={p.id}>{p.nombre} · {p.precio} €{p.recomendado && (opciones[alta.via]?.planes || []).length > 1 ? " (recomendado)" : ""}</option>)}
                </select>
              </div>
              <div className="ex-fila" style={{ gridColumn: "1 / -1" }}>
                <button type="button" className="ex-btn" disabled={ocupado || !alta.via || !alta.plan} onClick={darDeAlta}>
                  <IconoPaso nombre="check" /> Dar de alta el servicio
                </button>
                {contratacion?.estado === "PENDIENTE_CONFIRMACION" && (
                  <button type="button" className="ex-btn sec" disabled={ocupado} onClick={descartar}>
                    <IconoPaso nombre="x" /> Descartar petición
                  </button>
                )}
              </div>
            </div>
          )}
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
          {cierre?.archivado && <span className="ex-est" data-e="ok"><IconoPaso nombre="check" /> Cerrado el {fechaCorta(cierre.at)}</span>}
        </div>
        <p className="ex-lead">
          {cierre?.archivado
            ? <>El correo de conclusión con la encuesta {cierre.correo_at ? `salió el ${fechaCorta(cierre.correo_at)}` : "no llegó a salir"}. {nombreCorto} ve la encuesta en su paso 6.</>
            : <>Al cerrar, {nombreCorto} recibe un correo formal de conclusión (con las notas de abajo y copia a administración) con el enlace a la encuesta, que se le abre en su paso 6.</>}
        </p>
        <label className="ex-lab">Notas de cierre (las ve {nombreCorto})</label>
        <textarea rows={4} className="ex-campo" value={notas}
          onChange={(e) => setNotas(e.target.value)}
          onBlur={() => guardarPanel({ notas_cierre: notas })}
          placeholder="Observaciones del caso, instrucciones especiales, próximos pasos…" />
        <div className="ex-fila" style={{ marginTop: 12 }}>
          {!cierre?.archivado ? (
            <button type="button" className="ex-btn" disabled={ocupado} onClick={() => cerrar(false)}>
              <IconoPaso nombre="check" /> Cerrar y pedir valoración
            </button>
          ) : (
            <>
              <button type="button" className="ex-btn sec" disabled={ocupado} onClick={() => cerrar(true)}>
                <IconoPaso nombre="send" /> Reenviar correo de cierre
              </button>
              <button type="button" className="ex-btn plano" disabled={ocupado} onClick={reabrir}>
                Reabrir
              </button>
            </>
          )}
        </div>
      </section>

      {/* ── La encuesta respondida ──────────────────────────────────── */}
      {(cierre?.archivado || encuesta) && (
        <section className="ex-sec">
          <div className="ex-h">
            <span className="ex-h-ico"><IconoPaso nombre="star" /></span>
            <h3>Encuesta de cierre</h3>
            {encuesta
              ? <span className="ex-est" data-e={encuesta.general >= 4 ? "ok" : encuesta.general <= 2 ? "no" : "warn"}>{encuesta.general}/5</span>
              : <span className="ex-est" data-e="info">Sin responder</span>}
          </div>
          {encuesta ? (
            <>
              <div className="ex-grid3">
                <div><label className="ex-lab">General</label><b>{encuesta.general}/5</b></div>
                <div><label className="ex-lab">Asesor</label><b>{encuesta.asesor}/5</b></div>
                <div><label className="ex-lab">Recomendaría</label><b>{encuesta.nps}/10</b></div>
              </div>
              {encuesta.comentario && (
                <p className="ex-lead" style={{ marginTop: 10, whiteSpace: "pre-line" }}>«{encuesta.comentario}»</p>
              )}
              <p className="ex-lead" style={{ marginTop: 8, marginBottom: 0 }}>
                {encuesta.autoriza_publicar ? "Autoriza publicar su opinión de forma anonimizada." : "No autoriza publicar su opinión."}
                {" "}Enviada el {fechaCorta(encuesta.enviada_at)}{encuesta.editada_at ? `, editada el ${fechaCorta(encuesta.editada_at)}` : ""}.
              </p>
            </>
          ) : (
            <p className="ex-lead" style={{ marginBottom: 0 }}>{nombreCorto} todavía no ha respondido.</p>
          )}
        </section>
      )}
    </div>
  );
}
