// «Mis pagos»: lo que lleva pagado, lo que le toca y cuándo vence cada cuota,
// con la forma de pagarla y el botón para subir el comprobante.
//
// Datos: GET /cliente/pagos (los pide PanelCliente y los reparte, porque la
// lista «Hoy» también avisa de las cuotas). La pestaña solo existe si tiene
// algún plan. Un enlace puede resaltar una cuota: /panel/pagos?cuota=ID.
//
// Mercado Pago solo sale si la cuota tiene importe en soles fijado
// (pago_en_linea.disponible). Si el servidor dice que no (409/503), se enseña
// su mensaje con los datos de transferencia y Plin.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icono from "../../../components/common/Icono";
import IconoPaso from "../../../components/common/IconoPaso";
import { apiPOST, apiUpload } from "../../../services/api";
import { abrirArchivo } from "../../../services/archivos";
import { whatsappDesde } from "../../../config/contacto";
import { importe, nombreCuota, estadoCuota, diaPago, proximaCuota, importeSoles } from "../pagosCliente";

const MODALIDAD = { CONTADO: "Pago al contado", DOS_CUOTAS: "En dos cuotas", PERSONALIZADO: "Plan a medida" };
const MEDIOS = [
  { valor: "transferencia", etiqueta: "Transferencia" },
  { valor: "plin", etiqueta: "Plin" },
  { valor: "yape", etiqueta: "Yape" },
];
const TIPOS = "image/jpeg,image/png,image/webp,image/heic,.heic,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;

function cuotaDeUrl() {
  const n = Number(new URLSearchParams(window.location.search).get("cuota"));
  return Number.isInteger(n) && n > 0 ? n : null;
}

function Copiar({ texto }) {
  const [hecho, setHecho] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setHecho(true);
      setTimeout(() => setHecho(false), 1600);
    } catch { /* sin portapapeles: el número está a la vista */ }
  }
  return (
    <button type="button" className="ex-pg-copiar ux-tap" onClick={copiar} aria-label={`Copiar ${texto}`}>
      {hecho ? "Copiado" : "Copiar"}
    </button>
  );
}

function Fila({ k, v, copiar = false }) {
  return (
    <div className="ex-pg-dl-fila">
      <dt>{k}</dt>
      <dd>
        <span className={copiar ? "ex-pg-numero" : undefined}>{v}</span>
        {copiar && <Copiar texto={v} />}
      </dd>
    </div>
  );
}

/** Los datos para pagar sin pasar por Mercado Pago. */
function DatosPago({ medios, compacto = false }) {
  if (!medios?.configurado) {
    return (
      <div className="ex-pg-datos" data-vacio="1">
        <p>Tu asesor te facilitará los datos de pago.</p>
        <a
          className="pnl-btn ux-tap"
          href={whatsappDesde("panel-pagos", "Necesito los datos para pagar mi cuota.")}
          target="_blank" rel="noopener noreferrer"
        >
          <Icono nombre="chat" size={15} />
          Pedir los datos por WhatsApp
        </a>
      </div>
    );
  }
  const t = medios.transferencia;
  const p = medios.plin;
  return (
    <div className="ex-pg-datos" data-compacto={compacto ? "1" : "0"}>
      {!compacto && (
        <div className="ex-pg-datos-cab">
          <h3 className="text-primary">Cómo pagar</h3>
          <p>Paga por transferencia o Plin y después sube el comprobante en la cuota que corresponda.</p>
        </div>
      )}
      <div className="ex-pg-medios-grid">
        {t && (
          <div className="ex-pg-medio">
            <span className="ex-pg-eyebrow">Transferencia{t.banco ? ` · ${t.banco}` : ""}</span>
            <dl>
              {t.titular && <Fila k="Titular" v={t.titular} />}
              {(t.tipo_cuenta || t.moneda) && <Fila k="Cuenta" v={[t.tipo_cuenta, t.moneda].filter(Boolean).join(" · ")} />}
              {t.cuenta && <Fila k="N.º de cuenta" v={t.cuenta} copiar />}
              {t.cci && <Fila k="CCI" v={t.cci} copiar />}
            </dl>
          </div>
        )}
        {p && (
          <div className="ex-pg-medio">
            <span className="ex-pg-eyebrow">Plin</span>
            <dl>
              <Fila k="Número" v={p.numero} copiar />
              {p.titular && <Fila k="Titular" v={p.titular} />}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function Resumen({ planes, resumen }) {
  const monedas = Object.entries(resumen || {});
  const suma = (campo) => {
    const partes = monedas.filter(([, r]) => r[campo] > 0).map(([m, r]) => importe(r[campo], m));
    return partes.length ? partes.join(" · ") : importe(0, monedas[0]?.[0] || "EUR");
  };
  const hay = (campo) => monedas.some(([, r]) => r[campo] > 0);
  const proxima = proximaCuota(planes);
  const ep = proxima ? estadoCuota(proxima) : null;

  return (
    <div className="ex-pg-resumen">
      <div className="ex-pg-dato" data-tono="ok">
        <span>Pagado</span>
        <b>{suma("pagado")}</b>
      </div>
      <div className="ex-pg-dato" data-tono={hay("vencido") ? "alto" : hay("pendiente") ? "aviso" : "ok"}>
        <span>Te toca</span>
        <b>{suma("pendiente")}</b>
        {hay("vencido") && <small>{suma("vencido")} ya vencido</small>}
        {hay("en_revision") && <small>{suma("en_revision")} en revisión</small>}
      </div>
      <div className="ex-pg-dato" data-tono={ep?.tono || "ok"}>
        <span>Próximo vencimiento</span>
        {proxima ? (
          <>
            <b>{diaPago(proxima.fecha_vencimiento)}</b>
            <small>{importe(proxima.monto, proxima.moneda)} · {ep.etiqueta}</small>
          </>
        ) : (
          <>
            <b>Nada pendiente</b>
            <small>{hay("en_revision") ? "Tu comprobante está en revisión" : "Estás al día"}</small>
          </>
        )}
      </div>
    </div>
  );
}

function SubirComprobante({ cuota, medios, onCerrar, onHecho }) {
  const [archivo, setArchivo] = useState(null);
  const [medio, setMedio] = useState(medios?.plin && !medios?.transferencia ? "plin" : "transferencia");
  const [referencia, setReferencia] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const grande = Boolean(archivo && archivo.size > MAX_BYTES);

  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape" && !enviando) onCerrar(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = antes; window.removeEventListener("keydown", onKey); };
  }, [onCerrar, enviando]);

  async function enviar(e) {
    e.preventDefault();
    if (!archivo || grande || enviando) return;
    setEnviando(true);
    setError("");
    const fd = new FormData();
    fd.append("comprobante", archivo);
    fd.append("medio", medio);
    if (referencia.trim()) fd.append("referencia", referencia.trim());
    try {
      await apiUpload(`/cliente/pagos/${cuota.id_pago}/comprobante`, fd);
      onHecho();
    } catch (err) {
      setError(err.message || "No se pudo enviar el comprobante. Inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  return createPortal(
    <div className="pnl ex-pg-modal" role="dialog" aria-modal="true" aria-labelledby="ex-pg-modal-titulo">
      <div className="ex-pg-modal-fondo" onClick={() => { if (!enviando) onCerrar(); }} />
      <form className="ex-pg-modal-panel" onSubmit={enviar}>
        <div className="ex-pg-modal-cab">
          <div className="min-w-0">
            <span className="ex-pg-eyebrow">{nombreCuota(cuota)} · {importe(cuota.monto, cuota.moneda)}</span>
            <h3 id="ex-pg-modal-titulo" className="text-primary">
              {cuota.estado === "EN_REVISION" ? "Cambiar comprobante" : "Subir comprobante"}
            </h3>
            <p>Foto o PDF de tu transferencia, Plin o Yape. Tu asesor lo revisa y te confirma el pago.</p>
          </div>
          <button type="button" className="ex-pg-modal-x" onClick={onCerrar} disabled={enviando} aria-label="Cerrar">✕</button>
        </div>

        <div className="ex-pg-modal-cuerpo">
          <label className="ex-pg-archivo ux-tap" data-lleno={archivo ? "1" : "0"}>
            <input type="file" accept={TIPOS} onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
            <Icono nombre="documento" size={22} />
            <span>{archivo ? archivo.name : "Elige la foto o el PDF"}</span>
            <small>{archivo ? `${(archivo.size / 1048576).toFixed(1)} MB · toca para cambiarlo` : "JPG, PNG, HEIC o PDF · hasta 10 MB"}</small>
          </label>
          {grande && <p className="pnl-error">El archivo pasa de 10 MB. Prueba con una captura de pantalla.</p>}

          <fieldset className="ex-pg-medios">
            <legend>¿Cómo pagaste?</legend>
            {MEDIOS.map((m) => (
              <label key={m.valor} className="ex-pg-medio-opcion" data-on={medio === m.valor ? "1" : "0"}>
                <input type="radio" name="ex-pg-medio" value={m.valor} checked={medio === m.valor} onChange={() => setMedio(m.valor)} />
                {m.etiqueta}
              </label>
            ))}
          </fieldset>

          <label className="ex-pg-campo">
            <span>N.º de operación (opcional)</span>
            <input value={referencia} maxLength={120} placeholder="Lo ves en tu comprobante" onChange={(e) => setReferencia(e.target.value)} />
          </label>

          {error && <p className="pnl-error">{error}</p>}
        </div>

        <div className="ex-pg-modal-pie">
          <button type="button" className="pnl-btn ux-tap" onClick={onCerrar} disabled={enviando}>Cancelar</button>
          <button type="submit" className="pnl-btn-cta ux-tap" disabled={!archivo || grande || enviando}>
            {enviando ? "Enviando…" : "Enviar comprobante"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

function Cuota({ c, destacada, medios, mp, datosAbiertos, onVerDatos, onSubir, onPagarLinea }) {
  const e = estadoCuota(c);
  const pendiente = c.estado === "PENDIENTE";
  const enLinea = Boolean(c.pago_en_linea?.disponible);
  const soles = importeSoles(c);
  return (
    <li id={`ex-pg-cuota-${c.id_pago}`} className="ex-pg-cuota" data-tono={e.tono} data-destacada={destacada ? "1" : "0"}>
      <span className="ex-pg-marca" data-tono={e.tono} aria-hidden="true">
        {c.estado === "PAGADO" ? <IconoPaso nombre="check" className="w-4 h-4" strokeWidth={2.6} /> : c.nro_cuota || 1}
      </span>
      <div className="ex-pg-cuota-cuerpo">
        <div className="ex-pg-cuota-fila">
          <div className="min-w-0">
            <strong>{nombreCuota(c)} · {importe(c.monto, c.moneda)}</strong>
            <small>
              {c.estado === "PAGADO" && e.texto
                ? `${e.texto}${c.fecha_vencimiento ? ` · vencía el ${diaPago(c.fecha_vencimiento)}` : ""}`
                : c.fecha_vencimiento ? `${c.vencido ? "Venció" : "Vence"} el ${diaPago(c.fecha_vencimiento)}` : "Sin fecha de vencimiento"}
            </small>
          </div>
          <span className={`pnl-chip pnl-chip-${e.tono}`}><span className="punto" />{e.etiqueta}</span>
        </div>

        {e.texto && c.estado !== "PAGADO" && <p className="ex-pg-cuota-texto" data-tono={e.tono}>{e.texto}</p>}

        {/* Una cuota por pagar lleva su propio «Pagar», con el importe a la
            vista, y el «Ya pagué» al lado. Antes el botón principal era subir
            el comprobante y Mercado Pago quedaba en segundo plano, así que
            quien aún no había pagado no veía por dónde empezar. «Pagar» usa lo
            que ya existe: Mercado Pago si la cuota tiene importe en soles; si
            no, abre aquí mismo los datos de transferencia y Plin. */}
        {pendiente && (
          <div className="ex-pg-botones pnl-pagos-acciones">
            {enLinea ? (
              <button type="button" className="pnl-btn-cta ux-tap pnl-pagos-pagar" onClick={() => onPagarLinea(c)} disabled={mp?.cargando}>
                <Icono nombre="euro" size={15} />
                {mp?.cargando ? "Abriendo Mercado Pago…" : `Pagar ${soles || importe(c.monto, c.moneda)}`}
                {!mp?.cargando && <span className="pnl-pagos-via">con Mercado Pago</span>}
              </button>
            ) : (
              <button type="button" className="pnl-btn-cta ux-tap pnl-pagos-pagar" onClick={() => onVerDatos(c)} aria-expanded={datosAbiertos}>
                <Icono nombre="euro" size={15} />
                Pagar {importe(c.monto, c.moneda)}
              </button>
            )}
            {c.puede_subir_comprobante && (
              <button type="button" className="pnl-btn ux-tap" onClick={() => onSubir(c)}>
                <Icono nombre="documento" size={15} />
                {c.motivo_rechazo ? "Subir otro comprobante" : "Ya pagué: subir comprobante"}
              </button>
            )}
            {enLinea && (
              <button type="button" className="ex-pg-enlace" onClick={() => onVerDatos(c)} aria-expanded={datosAbiertos}>
                {datosAbiertos ? "Ocultar transferencia y Plin" : "Prefiero transferencia o Plin"}
              </button>
            )}
            {c.tiene_comprobante && (
              <button
                type="button"
                className="ex-pg-enlace"
                onClick={() => abrirArchivo(`/cliente/pagos/${c.id_pago}/comprobante`, { nombre: `comprobante-${c.id_pago}` })}
              >
                Ver comprobante
              </button>
            )}
          </div>
        )}

        {pendiente && datosAbiertos && !mp?.msg && (
          <div className="pnl-pagos-datos">
            <p>
              Paga {importe(c.monto, c.moneda)} con estos datos y después pulsa «Ya pagué» para subir el comprobante.
            </p>
            <DatosPago medios={medios} compacto />
          </div>
        )}

        {!pendiente && ((c.estado === "EN_REVISION" && c.puede_subir_comprobante) || c.tiene_comprobante) && (
          <div className="ex-pg-botones">
            {c.estado === "EN_REVISION" && c.puede_subir_comprobante && (
              <button type="button" className="pnl-btn ux-tap" onClick={() => onSubir(c)}>Cambiar comprobante</button>
            )}
            {c.tiene_comprobante && (
              <button
                type="button"
                className="ex-pg-enlace"
                onClick={() => abrirArchivo(`/cliente/pagos/${c.id_pago}/comprobante`, { nombre: `comprobante-${c.id_pago}` })}
              >
                Ver comprobante
              </button>
            )}
          </div>
        )}

        {mp?.msg && (
          <div className="ex-pg-aviso-mp">
            <p>{mp.msg}</p>
            <DatosPago medios={mp.medios || medios} compacto />
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * Cómo van las cuotas del plan, de un vistazo: «2 pagadas · 1 en revisión ·
 * 1 vencida · 1 pendiente». Solo lo que hay; con una sola cuota no hace falta.
 */
function EstadosPlan({ cuotas }) {
  if ((cuotas || []).length < 2) return null;
  const n = { pagada: 0, revision: 0, vencida: 0, pendiente: 0 };
  for (const c of cuotas) {
    if (c.estado === "PAGADO") n.pagada += 1;
    else if (c.estado === "EN_REVISION") n.revision += 1;
    else if (c.estado === "PENDIENTE" && c.vencido) n.vencida += 1;
    else if (c.estado === "PENDIENTE") n.pendiente += 1;
  }
  const partes = [
    n.pagada && { t: `${n.pagada} ${n.pagada === 1 ? "pagada" : "pagadas"}`, tono: "ok" },
    n.revision && { t: `${n.revision} en revisión`, tono: "info" },
    n.vencida && { t: `${n.vencida} ${n.vencida === 1 ? "vencida" : "vencidas"}`, tono: "alto" },
    n.pendiente && { t: `${n.pendiente} ${n.pendiente === 1 ? "pendiente" : "pendientes"}`, tono: "tipo" },
  ].filter(Boolean);
  return (
    <ul className="pnl-pagos-estados" aria-label="Estado de las cuotas">
      {partes.map((p) => (
        <li key={p.t} className={`pnl-chip pnl-chip-${p.tono}`}><span className="punto" />{p.t}</li>
      ))}
    </ul>
  );
}

function Plan({ plan, destacada, medios, mp, verDatos, onVerDatos, onSubir, onPagarLinea }) {
  const pct = plan.total > 0 ? Math.min(100, Math.round((plan.pagado / plan.total) * 100)) : 0;
  return (
    <section className="ex-pg-plan">
      <header className="ex-pg-plan-cab">
        <div className="min-w-0">
          <span className="ex-pg-eyebrow">{MODALIDAD[plan.modalidad] || "Plan de pagos"}</span>
          <h3 className="text-primary">{plan.concepto}</h3>
        </div>
        <div className="ex-pg-plan-total">
          <b>{importe(plan.total, plan.moneda)}</b>
          {plan.estado === "PAGADO" && <span className="pnl-chip pnl-chip-ok"><span className="punto" />Pagado</span>}
        </div>
      </header>
      <div className="ex-pg-barra" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Parte pagada">
        <i style={{ width: `${pct}%` }} />
      </div>
      <p className="ex-pg-barra-texto">
        {importe(plan.pagado, plan.moneda)} pagados de {importe(plan.total, plan.moneda)}
        {plan.fecha_limite_postulacion && plan.estado !== "PAGADO"
          ? ` · todo pagado antes del ${diaPago(plan.fecha_limite_postulacion)}, fecha límite de tu postulación`
          : ""}
      </p>
      <EstadosPlan cuotas={plan.cuotas} />
      <ol className="ex-pg-cuotas">
        {(plan.cuotas || []).map((c) => (
          <Cuota
            key={c.id_pago}
            c={c}
            destacada={destacada === c.id_pago}
            medios={medios}
            mp={mp[c.id_pago]}
            datosAbiertos={Boolean(verDatos[c.id_pago])}
            onVerDatos={onVerDatos}
            onSubir={onSubir}
            onPagarLinea={onPagarLinea}
          />
        ))}
      </ol>
    </section>
  );
}

/**
 * La próxima cuota, fija abajo en el teléfono. Con varias cuotas y los datos
 * de pago, el botón de la que toca quedaba varias pantallas más abajo. Va al
 * final de la página con position: sticky, así que al llegar abajo del todo se
 * queda en su sitio y no tapa nada. En escritorio no sale (ver el CSS).
 */
function BarraProxima({ cuota, mp, onPagarLinea, onIrADatos }) {
  const e = estadoCuota(cuota);
  // Si Mercado Pago ya dijo que no (mp.msg), la barra lleva a la cuota, donde
  // está su aviso con los datos de transferencia, en vez de reintentarlo.
  const enLinea = Boolean(cuota.pago_en_linea?.disponible) && !mp?.msg;
  const cargando = Boolean(mp?.cargando);
  return (
    <div className="pnl-pagos-barra" data-tono={e.tono} role="region" aria-label="Próxima cuota">
      <div className="pnl-pagos-barra-texto">
        <strong>{nombreCuota(cuota)} · {importe(cuota.monto, cuota.moneda)}</strong>
        <small>{e.tono === "tipo" ? `Vence el ${diaPago(cuota.fecha_vencimiento)}` : e.etiqueta}</small>
      </div>
      <button
        type="button"
        className="pnl-btn-cta ux-tap"
        disabled={cargando}
        onClick={() => (enLinea ? onPagarLinea(cuota) : onIrADatos(cuota))}
      >
        {cargando ? "Abriendo…" : `Pagar ${enLinea ? importeSoles(cuota) || importe(cuota.monto, cuota.moneda) : importe(cuota.monto, cuota.moneda)}`}
      </button>
    </div>
  );
}

export default function MisPagos({ datos, onRecargar }) {
  const [subiendo, setSubiendo] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [mp, setMp] = useState({}); // id_pago → { cargando } | { msg, medios }
  const [verDatos, setVerDatos] = useState({}); // id_pago → true: datos de transferencia abiertos en esa cuota
  const [destacada] = useState(cuotaDeUrl);
  const desplazado = useRef(false);

  const planes = datos?.planes || [];
  const medios = datos?.medios_pago || null;
  const proxima = proximaCuota(planes);

  // Llegar desde «Hoy» o un correo con ?cuota=ID: se baja hasta esa cuota.
  useEffect(() => {
    if (!destacada || desplazado.current || !planes.length) return;
    const el = document.getElementById(`ex-pg-cuota-${destacada}`);
    if (el) {
      desplazado.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [destacada, planes.length]);

  async function pagarLinea(c) {
    setMp((x) => ({ ...x, [c.id_pago]: { cargando: true } }));
    const r = await apiPOST(`/cliente/pagos/${c.id_pago}/mercadopago`, {});
    if (r?.ok && r.preferencia?.init_point) {
      window.location.assign(r.preferencia.init_point);
      return;
    }
    setMp((x) => ({
      ...x,
      [c.id_pago]: { msg: r?.msg || "No se pudo abrir el pago en línea. Puedes pagar por transferencia o Plin.", medios: r?.medios_pago || null },
    }));
  }

  function alternarDatos(c) {
    setVerDatos((x) => ({ ...x, [c.id_pago]: !x[c.id_pago] }));
  }

  // Desde la barra fija: se abren los datos de esa cuota y se baja hasta ella.
  function irADatos(c) {
    setVerDatos((x) => ({ ...x, [c.id_pago]: true }));
    requestAnimationFrame(() => {
      document.getElementById(`ex-pg-cuota-${c.id_pago}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  if (!datos) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-4" aria-busy="true">
        <div className="pnl-esq pnl-esq-titulo" />
        <div className="ex-pg-resumen">
          {[0, 1, 2].map((i) => <div key={i} className="pnl-esq" style={{ height: 78, borderRadius: 16 }} />)}
        </div>
        <div className="pnl-esq" style={{ height: 220, borderRadius: 20 }} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="pnl-head">
        <div>
          <h2>Mis pagos</h2>
          <p>Lo que llevas pagado, lo que te toca y cuándo vence cada cuota.</p>
        </div>
        <button type="button" className="pnl-btn ux-tap" onClick={onRecargar}>
          <Icono nombre="reloj" size={15} />
          Actualizar
        </button>
      </div>

      {datos.error && (
        <div className="pnl-error ex-pg-error">
          <span>{datos.error}</span>
          <button type="button" className="pnl-btn ux-tap" onClick={onRecargar}>Reintentar</button>
        </div>
      )}

      {enviado && (
        <div className="ex-pg-ok" role="status">
          <Icono nombre="escudo" size={18} />
          <p>Comprobante enviado. Tu asesor lo revisará y verás la cuota como pagada en cuanto lo valide.</p>
          <button type="button" className="ex-pg-enlace" onClick={() => setEnviado(false)}>Cerrar</button>
        </div>
      )}

      {planes.length > 0 ? (
        <>
          <Resumen planes={planes} resumen={datos.resumen} />
          {planes.map((p) => (
            <Plan
              key={p.id_plan}
              plan={p}
              destacada={destacada}
              medios={medios}
              mp={mp}
              verDatos={verDatos}
              onVerDatos={alternarDatos}
              onSubir={setSubiendo}
              onPagarLinea={pagarLinea}
            />
          ))}
          <DatosPago medios={medios} />
          <p className="pnl-nota">
            Si ves algo que no cuadra en tus cuotas, escríbele a tu asesor desde Mensajes en tu expediente.
          </p>
          {proxima && !subiendo && (
            <BarraProxima cuota={proxima} mp={mp[proxima.id_pago]} onPagarLinea={pagarLinea} onIrADatos={irADatos} />
          )}
        </>
      ) : !datos.error && (
        <div className="pnl-pend-vacio">
          <span className="pnl-chip pnl-chip-ok"><span className="punto" />Sin pagos</span>
          <p>Todavía no tienes un plan de pagos. Cuando tu asesor lo cree, verás aquí tus cuotas.</p>
        </div>
      )}

      {subiendo && (
        <SubirComprobante
          cuota={subiendo}
          medios={medios}
          onCerrar={() => setSubiendo(null)}
          onHecho={() => { setSubiendo(null); setEnviado(true); onRecargar?.(); }}
        />
      )}
    </div>
  );
}
