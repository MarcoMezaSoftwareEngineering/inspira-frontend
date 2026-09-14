// El detalle de un plan de pagos: sus datos, cómo va y sus cuotas.
//
// Con pagos.planes se reprograma o se anula una cuota pendiente, se corrigen
// concepto, notas y fecha límite, o se anula el plan entero (con motivo). Lo
// cobrado no se toca. Las acciones de cada cuota (marcar pagada, voucher,
// validar, recordatorio) son las mismas de la lista.
import { useCallback, useEffect, useState } from "react";
import { Ban, ExternalLink, Pencil } from "lucide-react";
import { boGET, boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { navigate } from "../../../services/navigate";
import { Boton, Campo, Chip, Esqueleto, Ventana } from "../ui";
import { useAccionesCobro } from "./AccionesCobro";
import BotonesCobro from "./BotonesCobro";
import {
  ESTADO_PLAN, MODALIDAD, dinero, dia, diaDe, textoVence, estadoDe,
} from "./pagosComun";

export default function PlanDetalle({ idPlan, opciones, onCerrar, onCambio }) {
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [borrador, setBorrador] = useState({}); // id_pago → { fecha?, anular? }
  const [editando, setEditando] = useState(false);
  const [datos, setDatos] = useState({ concepto: "", fecha: "", notas: "" });
  const [guardando, setGuardando] = useState(false);

  const aplicarCarga = useCallback((r) => {
    if (!r?.ok) { setError(r?.msg || "No se pudo abrir el plan"); return; }
    setError(null);
    setPlan(r.plan);
  }, []);
  const cargar = useCallback(
    () => boGET(`/backoffice/pagos/planes/${idPlan}`).then(aplicarCarga),
    [idPlan, aplicarCarga],
  );

  useEffect(() => {
    let vivo = true;
    boGET(`/backoffice/pagos/planes/${idPlan}`).then((r) => { if (vivo) aplicarCarga(r); });
    return () => { vivo = false; };
  }, [idPlan, aplicarCarga]);

  const acciones = useAccionesCobro({
    opciones,
    onHecho: () => { cargar(); onCambio?.(); },
  });
  const { puede } = acciones;
  const editable = puede.planes && plan && plan.estado !== "ANULADO";

  function aplicar(nuevo, texto) {
    setPlan(nuevo);
    setBorrador({});
    setEditando(false);
    dialog.toast(texto, "success");
    onCambio?.();
  }

  async function guardarCuotas() {
    const cuotas = Object.entries(borrador)
      .map(([id, v]) => {
        const c = plan.cuotas.find((x) => String(x.id_pago) === id);
        const cambio = { id_pago: Number(id) };
        if (v.fecha && v.fecha !== c?.fecha_vencimiento) cambio.fecha_vencimiento = v.fecha;
        if (v.anular) cambio.anular = true;
        return cambio;
      })
      .filter((c) => c.fecha_vencimiento || c.anular);
    if (!cuotas.length) { setBorrador({}); return; }
    if (cuotas.some((c) => c.anular)) {
      const ok = await dialog.confirm("Las cuotas marcadas quedan anuladas y ya no se cobran. No se puede deshacer.", "¿Anular cuotas?");
      if (!ok) return;
    }
    setGuardando(true);
    const r = await boPATCH(`/backoffice/pagos/planes/${idPlan}`, { cuotas });
    setGuardando(false);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudieron guardar las cuotas", "error"); return; }
    aplicar(r.plan, "Cuotas actualizadas");
  }

  async function guardarDatos() {
    const body = {};
    if (datos.concepto.trim() !== plan.concepto) body.concepto = datos.concepto.trim();
    if ((datos.fecha || null) !== (plan.fecha_limite_postulacion || null)) body.fecha_limite_postulacion = datos.fecha || null;
    if (datos.notas !== (plan.notas || "")) body.notas = datos.notas;
    if (!Object.keys(body).length) { setEditando(false); return; }
    setGuardando(true);
    const r = await boPATCH(`/backoffice/pagos/planes/${idPlan}`, body);
    setGuardando(false);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo guardar", "error"); return; }
    aplicar(r.plan, "Plan actualizado");
  }

  async function anularPlan() {
    const motivo = await dialog.prompt(
      "Se anulan las cuotas pendientes y el asesorado deja de ver el plan. Lo ya cobrado se conserva.",
      "",
      "Motivo de la anulación",
    );
    if (!motivo || !motivo.trim()) return;
    setGuardando(true);
    const r = await boPATCH(`/backoffice/pagos/planes/${idPlan}`, { anular: true, motivo: motivo.trim() });
    setGuardando(false);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo anular el plan", "error"); return; }
    aplicar(r.plan, "Plan anulado");
  }

  function abrirEdicion() {
    setDatos({ concepto: plan.concepto || "", fecha: plan.fecha_limite_postulacion || "", notas: plan.notas || "" });
    setEditando(true);
  }

  const cambiosPendientes = Object.values(borrador).some((v) => v.fecha || v.anular);
  const r = plan?.resumen;
  const est = plan ? (ESTADO_PLAN[plan.estado] || ESTADO_PLAN.ACTIVO) : null;

  return (
    <>
      <Ventana
        abierta
        onCerrar={onCerrar}
        ancho="lg"
        titulo={plan ? plan.concepto : "Plan de pagos"}
        subtitulo={plan ? [plan.cliente?.nombre, MODALIDAD[plan.modalidad], `plan #${plan.id_plan}`].filter(Boolean).join(" · ") : null}
        pie={plan && (
          <>
            {editable && (
              <Boton tono="peligro" icono={Ban} cargando={guardando && !cambiosPendientes && !editando} onClick={anularPlan}>
                Anular plan
              </Boton>
            )}
            <span style={{ flex: "1 1 auto" }} />
            {cambiosPendientes && <Boton tono="fantasma" onClick={() => setBorrador({})}>Descartar</Boton>}
            {cambiosPendientes
              ? <Boton cargando={guardando} onClick={guardarCuotas}>Guardar cuotas</Boton>
              : <Boton tono="secundario" onClick={onCerrar}>Cerrar</Boton>}
          </>
        )}
      >
        {error && <p className="ase-pg-error">{error}</p>}
        {!plan && !error && <Esqueleto filas={4} alto={60} />}
        {plan && (
          <div style={{ display: "grid", gap: 14 }}>
            <div className="ase-pg-plan-cab">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <Chip tono={est.tono} punto>{est.etiqueta}</Chip>
                {plan.prueba && <Chip tono="morado">Cuenta de prueba</Chip>}
                {plan.pago_en_linea ? <Chip tono="verde">Mercado Pago</Chip> : <Chip tono="gris">Transferencia o Plin</Chip>}
              </div>
              <div className="ase-pg-importe">{dinero(plan.total, plan.moneda)}</div>
            </div>

            <div className="ase-pg-cifras">
              <div><b style={{ color: "var(--green)" }}>{dinero(r.pagado, plan.moneda)}</b><span>pagado</span></div>
              <div><b>{dinero(r.pendiente, plan.moneda)}</b><span>pendiente</span></div>
              <div><b style={{ color: r.vencido ? "var(--red)" : undefined }}>{dinero(r.vencido, plan.moneda)}</b><span>vencido</span></div>
              <div><b style={{ color: r.en_revision ? "#1f6fb8" : undefined }}>{dinero(r.en_revision, plan.moneda)}</b><span>por validar</span></div>
            </div>
            <div className="ase-progreso" aria-label={`${r.cuotas_pagadas} de ${r.cuotas} cuotas pagadas`}>
              <i style={{ width: `${r.cuotas ? (r.cuotas_pagadas / r.cuotas) * 100 : 0}%` }} />
            </div>

            {editando ? (
              <div className="ase-pg-bloque">
                <Campo etiqueta="Concepto">
                  <input className="ase-campo" value={datos.concepto} maxLength={200}
                    onChange={(e) => setDatos((x) => ({ ...x, concepto: e.target.value }))} />
                </Campo>
                <Campo etiqueta="Fecha límite de postulación">
                  <input className="ase-campo" type="date" value={datos.fecha}
                    onChange={(e) => setDatos((x) => ({ ...x, fecha: e.target.value }))} />
                </Campo>
                <Campo etiqueta="Notas internas">
                  <textarea className="ase-campo" rows={3} value={datos.notas}
                    onChange={(e) => setDatos((x) => ({ ...x, notas: e.target.value }))} />
                </Campo>
                <div style={{ display: "flex", gap: 8 }}>
                  <Boton tam="sm" cargando={guardando} onClick={guardarDatos}>Guardar</Boton>
                  <Boton tam="sm" tono="fantasma" onClick={() => setEditando(false)}>Cancelar</Boton>
                </div>
              </div>
            ) : (
              <dl className="ase-kv">
                <dt>Fecha límite</dt><dd>{plan.fecha_limite_postulacion ? dia(plan.fecha_limite_postulacion) : "sin fecha"}</dd>
                <dt>Proceso</dt>
                <dd>
                  {plan.proceso ? (
                    <button type="button" className="ase-enlace ase-pg-enlace" onClick={() => navigate(`/backoffice/solicitudes/${plan.proceso.id_solicitud}`)}>
                      {[plan.proceso.servicio, plan.proceso.paquete].filter(Boolean).join(" · ") || `#${plan.proceso.id_solicitud}`}
                      <ExternalLink size={11} />
                    </button>
                  ) : "sin proceso"}
                </dd>
                {plan.proceso?.responsable && <><dt>Responsable</dt><dd>{plan.proceso.responsable.nombre}</dd></>}
                <dt>Creado</dt><dd>{diaDe(plan.created_at)}{plan.creado_por ? ` · ${plan.creado_por.nombre}` : ""}</dd>
                {plan.version_precios && <><dt>Precios</dt><dd>catálogo {plan.version_precios}</dd></>}
                {plan.notas && <><dt>Notas</dt><dd style={{ whiteSpace: "pre-wrap" }}>{plan.notas}</dd></>}
              </dl>
            )}
            {editable && !editando && (
              <div><Boton tam="xs" tono="secundario" icono={Pencil} onClick={abrirEdicion}>Editar datos</Boton></div>
            )}

            <div>
              <p className="ase-rotulo">Cuotas · {r.cuotas_pagadas} de {r.cuotas} pagadas</p>
              <ul className="ase-pg-linea">
                {plan.cuotas.map((c) => {
                  const e = estadoDe(c);
                  const reprogramable = editable && (c.estado === "PENDIENTE" || c.estado === "EN_REVISION");
                  const b = borrador[c.id_pago] || {};
                  return (
                    <li key={c.id_pago} data-tono={e.tono} data-anulada={b.anular ? "1" : "0"}>
                      <div className="ase-pg-linea-fila">
                        <span className="ase-pg-nro">{c.nro_cuota || "·"}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="ase-pg-cobro-n">{dinero(c.monto, c.moneda)}</div>
                          <div className="ase-pg-cobro-s">
                            {c.estado === "PAGADO" ? `pagado ${diaDe(c.fecha_pago)}${c.metodo ? ` · ${c.metodo.nombre}` : ""}` : textoVence(c)}
                          </div>
                          {c.motivo_rechazo && c.estado === "PENDIENTE" && (
                            <div className="ase-pg-cobro-s" style={{ color: "var(--red)" }}>Comprobante rechazado: {c.motivo_rechazo}</div>
                          )}
                        </div>
                        <Chip tono={e.tono} punto>{e.etiqueta}</Chip>
                      </div>
                      {reprogramable && (
                        <div className="ase-pg-reprogramar">
                          <label>
                            <span>Nuevo vencimiento</span>
                            <input className="ase-campo" type="date" value={b.fecha ?? c.fecha_vencimiento ?? ""}
                              onChange={(ev) => setBorrador((x) => ({ ...x, [c.id_pago]: { ...b, fecha: ev.target.value } }))} />
                          </label>
                          <label className="ase-pg-check">
                            <input type="checkbox" checked={Boolean(b.anular)}
                              onChange={(ev) => setBorrador((x) => ({ ...x, [c.id_pago]: { ...b, anular: ev.target.checked } }))} />
                            Anular esta cuota
                          </label>
                        </div>
                      )}
                      <BotonesCobro
                        cobro={{ ...c, cliente: plan.cliente, plan: { concepto: plan.concepto } }}
                        puede={puede}
                        onAccion={acciones.abrir}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </Ventana>
      {acciones.ventanas}
    </>
  );
}
