// Las ventanas de un cobro: marcar pagado, adjuntar voucher, validar el
// comprobante que subió el asesorado y el detalle. Las abre useAccionesCobro
// (AccionesCobro.jsx), que decide cuál según el permiso de quien mira.
import { useState } from "react";
import { Check, Upload } from "lucide-react";
import { boPATCH, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { navigate } from "../../../services/navigate";
import { Boton, Campo, Chip, Pill, Ventana } from "../ui";
import VisorComprobante from "./VisorComprobante";
import { accionesPara } from "./permisosPagos";
import {
  dinero, dia, diaDe, momento, hoyLima, textoCuota, textoVence, estadoDe,
} from "./pagosComun";

function MetodoSelect({ opciones, value, onChange }) {
  return (
    <select className="ase-campo" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Sin cambiar</option>
      {(opciones?.metodos || []).map((m) => (
        <option key={m.id_metodo_pago} value={String(m.id_metodo_pago)}>{m.nombre}</option>
      ))}
    </select>
  );
}

/** Cabecera común: de quién es, cuánto y de qué. */
function Resumen({ c }) {
  const est = estadoDe(c);
  return (
    <div className="ase-pg-resumen-cobro">
      <div style={{ minWidth: 0 }}>
        <div className="ase-pg-cobro-n">{c.cliente?.nombre || "Cliente"}</div>
        <div className="ase-pg-cobro-s">
          {[c.concepto || c.plan?.concepto, textoCuota(c)].filter(Boolean).join(" · ") || "Cobro"}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="ase-pg-importe">{dinero(c.monto, c.moneda)}</div>
        <Chip tono={est.tono} punto>{est.etiqueta}</Chip>
      </div>
    </div>
  );
}

export function VentanaPagado({ c, opciones, onCerrar, onHecho }) {
  const corrigiendo = c.estado === "PAGADO";
  const [fecha, setFecha] = useState(() => (corrigiendo && c.fecha_pago ? "" : hoyLima()));
  const [metodo, setMetodo] = useState(c.metodo?.id_metodo_pago ? String(c.metodo.id_metodo_pago) : "");
  const [referencia, setReferencia] = useState(c.referencia || "");
  const [enviando, setEnviando] = useState(false);

  async function guardar() {
    setEnviando(true);
    const body = { estado: "PAGADO", referencia: referencia.trim() };
    if (fecha) body.fecha_pago = fecha;
    if (metodo) body.id_metodo_pago = Number(metodo);
    const r = await boPATCH(`/backoffice/pagos/${c.id_pago}`, body);
    setEnviando(false);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo registrar el pago", "error"); return; }
    dialog.toast(corrigiendo ? "Datos del cobro corregidos" : "Cobro marcado como pagado", "success");
    onHecho(r.pago);
  }

  return (
    <Ventana
      abierta
      onCerrar={onCerrar}
      ancho="sm"
      titulo={corrigiendo ? "Corregir el cobro" : "Marcar como pagado"}
      subtitulo="Para lo que se cobró fuera del panel: transferencia avisada por WhatsApp, efectivo, Plin…"
      pie={(
        <>
          <Boton tono="fantasma" onClick={onCerrar}>Cancelar</Boton>
          <Boton cargando={enviando} icono={Check} onClick={guardar}>{corrigiendo ? "Guardar" : "Marcar pagado"}</Boton>
        </>
      )}
    >
      <div style={{ display: "grid", gap: 10 }}>
        <Resumen c={c} />
        <div className="ase-pg-dos">
          <Campo etiqueta={corrigiendo ? `Fecha de pago (ahora ${diaDe(c.fecha_pago)})` : "Fecha de pago"}>
            <input className="ase-campo" type="date" value={fecha} max={hoyLima()} onChange={(e) => setFecha(e.target.value)} />
          </Campo>
          <Campo etiqueta="Medio">
            <MetodoSelect opciones={opciones} value={metodo} onChange={setMetodo} />
          </Campo>
        </div>
        <Campo etiqueta="N.º de operación (opcional)">
          <input className="ase-campo" value={referencia} maxLength={200} onChange={(e) => setReferencia(e.target.value)} />
        </Campo>
      </div>
    </Ventana>
  );
}

export function VentanaVoucher({ c, opciones, onCerrar, onHecho }) {
  const [archivo, setArchivo] = useState(null);
  const [marcar, setMarcar] = useState(c.estado === "PENDIENTE");
  const [fecha, setFecha] = useState(hoyLima());
  const [metodo, setMetodo] = useState(c.metodo?.id_metodo_pago ? String(c.metodo.id_metodo_pago) : "");
  const [referencia, setReferencia] = useState(c.referencia || "");
  const [enviando, setEnviando] = useState(false);
  const grande = archivo && archivo.size > 10 * 1024 * 1024;

  async function guardar() {
    if (!archivo || grande) return;
    const fd = new FormData();
    fd.append("comprobante", archivo);
    if (marcar) {
      fd.append("marcar_pagado", "1");
      if (fecha) fd.append("fecha_pago", fecha);
      if (metodo) fd.append("id_metodo_pago", metodo);
      if (referencia.trim()) fd.append("referencia", referencia.trim());
    }
    setEnviando(true);
    const r = await boPOST(`/backoffice/pagos/${c.id_pago}/comprobante`, fd);
    setEnviando(false);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo guardar el voucher", "error"); return; }
    dialog.toast(marcar ? "Voucher guardado y cobro pagado" : "Voucher guardado", "success");
    onHecho(r.pago);
  }

  return (
    <Ventana
      abierta
      onCerrar={onCerrar}
      titulo="Adjuntar voucher"
      subtitulo={c.tiene_comprobante ? "Sustituye al comprobante que ya tenía." : "Foto o PDF del banco, de 10 MB como mucho."}
      pie={(
        <>
          <Boton tono="fantasma" onClick={onCerrar}>Cancelar</Boton>
          <Boton cargando={enviando} disabled={!archivo || grande} icono={Upload} onClick={guardar}>Guardar</Boton>
        </>
      )}
    >
      <div style={{ display: "grid", gap: 10 }}>
        <Resumen c={c} />
        <Campo etiqueta="Archivo (JPG, PNG, WEBP, HEIC o PDF)">
          <input className="ase-campo" type="file" accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
            onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
        </Campo>
        {grande && <p className="ase-pg-error">El archivo pasa de 10 MB.</p>}
        {c.estado === "PENDIENTE" && (
          <label className="ase-toggle ase-pg-toggle-verde">
            <input type="checkbox" checked={marcar} onChange={(e) => setMarcar(e.target.checked)} />
            <i /> Marcar también como pagado
          </label>
        )}
        {marcar && (
          <>
            <div className="ase-pg-dos">
              <Campo etiqueta="Fecha de pago">
                <input className="ase-campo" type="date" value={fecha} max={hoyLima()} onChange={(e) => setFecha(e.target.value)} />
              </Campo>
              <Campo etiqueta="Medio">
                <MetodoSelect opciones={opciones} value={metodo} onChange={setMetodo} />
              </Campo>
            </div>
            <Campo etiqueta="N.º de operación (opcional)">
              <input className="ase-campo" value={referencia} maxLength={200} onChange={(e) => setReferencia(e.target.value)} />
            </Campo>
          </>
        )}
      </div>
    </Ventana>
  );
}

export function VentanaValidar({ c, opciones, onCerrar, onHecho }) {
  const [decision, setDecision] = useState("aprobar");
  const [fecha, setFecha] = useState(hoyLima());
  const [metodo, setMetodo] = useState(c.metodo?.id_metodo_pago ? String(c.metodo.id_metodo_pago) : "");
  const [referencia, setReferencia] = useState(c.referencia || "");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const motivoValido = motivo.trim().length >= 5;

  async function enviar() {
    const body = decision === "aprobar"
      ? { aprobar: true, fecha_pago: fecha || undefined, id_metodo_pago: metodo ? Number(metodo) : undefined, referencia: referencia.trim() }
      : { aprobar: false, motivo: motivo.trim() };
    setEnviando(true);
    const r = await boPOST(`/backoffice/pagos/${c.id_pago}/validar`, body);
    setEnviando(false);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo validar", "error"); return; }
    if (decision === "aprobar") dialog.toast("Comprobante validado: cobro pagado", "success");
    else if (r.correo?.enviado) dialog.toast(`Rechazado. Se le avisó por correo a ${r.correo.para}`, "success");
    else dialog.toast(`Rechazado, pero el correo no salió: ${r.correo?.error || "error desconocido"}. Avísale por otro medio.`, "error");
    onHecho(r.pago);
  }

  return (
    <Ventana
      abierta
      onCerrar={onCerrar}
      ancho="lg"
      titulo="Validar comprobante"
      subtitulo="Lo subió el asesorado desde su panel. Si se aprueba, el cobro queda pagado; si se rechaza, vuelve a pendiente y se le escribe con el motivo."
      pie={(
        <>
          <Boton tono="fantasma" onClick={onCerrar}>Cerrar</Boton>
          {decision === "aprobar"
            ? <Boton tono="primario" icono={Check} cargando={enviando} onClick={enviar}>Aprobar y marcar pagado</Boton>
            : <Boton tono="peligro" cargando={enviando} disabled={!motivoValido} onClick={enviar}>Rechazar y avisar</Boton>}
        </>
      )}
    >
      <div className="ase-pg-validar">
        <div className="ase-pg-validar-visor"><VisorComprobante idPago={c.id_pago} /></div>
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <Resumen c={c} />
          <dl className="ase-kv">
            <dt>Vencimiento</dt><dd>{textoVence(c)}</dd>
            <dt>Medio que indicó</dt><dd>{c.metodo?.nombre || "—"}</dd>
            <dt>N.º de operación</dt><dd>{c.referencia || "—"}</dd>
          </dl>
          <div className="ase-pills">
            <Pill on={decision === "aprobar"} onClick={() => setDecision("aprobar")}>Aprobar</Pill>
            <Pill on={decision === "rechazar"} onClick={() => setDecision("rechazar")}>Rechazar</Pill>
          </div>
          {decision === "aprobar" ? (
            <>
              <div className="ase-pg-dos">
                <Campo etiqueta="Fecha del pago">
                  <input className="ase-campo" type="date" value={fecha} max={hoyLima()} onChange={(e) => setFecha(e.target.value)} />
                </Campo>
                <Campo etiqueta="Medio">
                  <MetodoSelect opciones={opciones} value={metodo} onChange={setMetodo} />
                </Campo>
              </div>
              <Campo etiqueta="N.º de operación">
                <input className="ase-campo" value={referencia} maxLength={200} onChange={(e) => setReferencia(e.target.value)} />
              </Campo>
            </>
          ) : (
            <Campo etiqueta="Motivo (le llega por correo al asesorado)">
              <textarea className="ase-campo" rows={4} value={motivo} maxLength={1000}
                placeholder="El importe no coincide con la cuota; la imagen no se lee; falta el número de operación…"
                onChange={(e) => setMotivo(e.target.value)} />
            </Campo>
          )}
        </div>
      </div>
    </Ventana>
  );
}

export function VentanaDetalle({ c, puede, onCerrar, onAccion }) {
  const acciones = accionesPara(c, puede).filter((a) => a.tipo !== "ver");
  return (
    <Ventana
      abierta
      onCerrar={onCerrar}
      ancho={c.tiene_comprobante ? "lg" : "md"}
      titulo={`Cobro #${c.id_pago}`}
      pie={acciones.length ? (
        <>
          {acciones.map((a) => (
            <Boton key={a.tipo} tono={a.tono === "fantasma" ? "secundario" : a.tono} icono={a.icono} onClick={() => onAccion(a.tipo, c)}>
              {a.etiqueta}
            </Boton>
          ))}
        </>
      ) : null}
    >
      <div className={c.tiene_comprobante ? "ase-pg-validar" : ""} style={{ display: c.tiene_comprobante ? undefined : "grid", gap: 12 }}>
        {c.tiene_comprobante && <div className="ase-pg-validar-visor"><VisorComprobante idPago={c.id_pago} /></div>}
        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <Resumen c={c} />
          <dl className="ase-kv">
            <dt>Vencimiento</dt><dd>{c.fecha_vencimiento ? `${dia(c.fecha_vencimiento)} · ${textoVence(c)}` : "—"}</dd>
            {c.fecha_pago && <><dt>Pagado</dt><dd>{diaDe(c.fecha_pago)}</dd></>}
            <dt>Medio</dt><dd>{c.metodo?.nombre || "—"}{c.pagado_en_linea ? " · Mercado Pago" : ""}</dd>
            <dt>N.º de operación</dt><dd>{c.referencia || "—"}</dd>
            {c.tiene_comprobante && <><dt>Comprobante</dt><dd>subido por {c.comprobante_subido_por === "CLIENTE" ? "el asesorado" : "el equipo"}</dd></>}
            {c.validado_por && <><dt>Validado</dt><dd>{c.validado_por.nombre} · {momento(c.validado_at)}</dd></>}
            {c.motivo_rechazo && <><dt>Rechazo</dt><dd style={{ color: "var(--red)" }}>{c.motivo_rechazo}</dd></>}
            {c.recordatorio_previo_at && <><dt>Aviso previo</dt><dd>{momento(c.recordatorio_previo_at)}</dd></>}
            {c.recordatorio_vencido_at && <><dt>Aviso de vencida</dt><dd>{momento(c.recordatorio_vencido_at)}</dd></>}
            <dt>Responsable</dt><dd>{c.responsable?.nombre || "—"}</dd>
            {c.cliente?.email && <><dt>Correo</dt><dd>{c.cliente.email}</dd></>}
          </dl>
          {c.proceso?.id_solicitud && (
            <div>
              <Boton tono="secundario" tam="sm" onClick={() => navigate(`/backoffice/solicitudes/${c.proceso.id_solicitud}`)}>
                Abrir el proceso
              </Boton>
            </div>
          )}
        </div>
      </div>
    </Ventana>
  );
}
