// Ficha del cliente: todo lo suyo en una pantalla.
//
// Antes había que abrir cuatro sitios distintos para entender a alguien: sus
// datos en Clientes, sus procesos en Solicitudes, sus pagos en ningún lado y
// sus notas dentro de cada expediente. Aquí está junto.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPOST, boFetch } from "../../../services/backofficeApi";
import AltaRapida from "./AltaRapida";

/* El voucher está detrás de autenticación, así que un enlace normal daría 401:
   el token va en cabecera, no en la URL. Se pide, se convierte en blob y se
   abre en otra pestaña. */
function VerVoucher({ idPago }) {
  const [abriendo, setAbriendo] = useState(false);

  async function abrir() {
    setAbriendo(true);
    try {
      const r = await boFetch(`/backoffice/procesos/pago/${idPago}/comprobante`);
      if (r?.ok) {
        const url = URL.createObjectURL(await r.blob());
        window.open(url, "_blank", "noopener");
        // Se suelta después de que el navegador lo haya cargado; revocarlo
        // en el acto deja la pestaña en blanco.
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } finally {
      setAbriendo(false);
    }
  }

  return (
    <button type="button" onClick={abrir} disabled={abriendo}
      title="Ver voucher"
      className="shrink-0 text-[10.5px] font-semibold text-[#046C8C] hover:underline disabled:opacity-50">
      {abriendo ? "…" : "voucher"}
    </button>
  );
}

const TONO_SERVICIO = {
  master: "bg-[#EEF2F8] text-[#1A3557]",
  visa:   "bg-[#FEF3E7] text-[#B9770E]",
  ee:     "bg-[#F5EEF8] text-[#7D3C98]",
  fp:     "bg-[#E8F5EE] text-[#1D6A4A]",
  legal:  "bg-[#FDEDEC] text-[#C0392B]",
};

function fecha(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
}

function Dato({ label, valor }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">{label}</p>
      <p className="text-[13px] text-neutral-800 mt-0.5">{valor || <span className="text-neutral-300">—</span>}</p>
    </div>
  );
}

function Bloque({ titulo, extra, children }) {
  return (
    <section className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">{titulo}</p>
        {extra}
      </div>
      {children}
    </section>
  );
}

export default function FichaCliente({ idCliente, onVolver, onAbrirProceso }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [nota, setNota] = useState("");
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [anadiendo, setAnadiendo] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const [cobro, setCobro] = useState({ monto: "", moneda: "EUR", id_solicitud: "", cobrado: true, vence: "" });

  const cargar = useCallback(() => {
    return boGET(`/backoffice/ficha-cliente/${idCliente}`).then((r) => {
      if (r.ok) { setDatos(r); setError(""); }
      else setError(r.msg || "No se pudo cargar la ficha");
      setCargando(false);
    });
  }, [idCliente]);

  useEffect(() => {
    boGET(`/backoffice/ficha-cliente/${idCliente}`).then((r) => {
      if (r.ok) { setDatos(r); setError(""); }
      else setError(r.msg || "No se pudo cargar la ficha");
      setCargando(false);
    });
  }, [idCliente]);

  // La nota es del cliente, no de un proceso suyo: lo que se anota de alguien
  // ("no contesta", "quiere esperar al año que viene") no pertenece a un
  // trámite concreto.
  async function anadirNota() {
    const texto = nota.trim();
    if (!texto) return;
    setGuardandoNota(true);
    const r = await boPOST(`/backoffice/ficha-cliente/${idCliente}/notas`, { texto });
    setGuardandoNota(false);
    if (r.ok) { setNota(""); cargar(); }
  }

  async function registrarCobro() {
    const r = await boPOST(`/backoffice/procesos/${cobro.id_solicitud}/pago`, {
      monto: cobro.monto,
      moneda: cobro.moneda,
      estado_pago: cobro.cobrado ? "aprobado" : "pendiente",
      fecha_vencimiento: cobro.vence || undefined,
    });
    if (r.ok) {
      setCobrando(false);
      setCobro({ monto: "", moneda: "EUR", id_solicitud: "", cobrado: true, vence: "" });
      cargar();
    }
  }

  if (cargando) return <p className="text-[13px] text-neutral-400 py-10 text-center">Cargando ficha…</p>;
  if (error) return (
    <div className="space-y-3">
      <button onClick={onVolver} className="text-[12px] font-semibold text-[#1D6A4A]">← Volver</button>
      <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
    </div>
  );

  const { cliente, procesos, finanzas, notas } = datos;
  const activos = procesos.filter((p) => !p.cerrado);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onVolver}
          className="shrink-0 w-8 h-8 rounded-lg border border-neutral-200 bg-white grid place-items-center text-neutral-500 hover:border-neutral-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-[19px] text-[#1A3557] leading-tight truncate">{cliente.nombre}</h1>
          <p className="text-[11.5px] text-neutral-500 truncate">
            {cliente.email}{cliente.telefono ? ` · ${cliente.telefono}` : ""}
          </p>
        </div>
        {finanzas.pendiente > 0 && (
          <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${
            finanzas.vencido ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
          }`}>
            Debe {finanzas.pendiente.toFixed(0)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-3">

          <Bloque
            titulo={`Servicios · ${activos.length} activo${activos.length === 1 ? "" : "s"}`}
            extra={
              <button type="button" onClick={() => setAnadiendo((v) => !v)}
                className="text-[11.5px] font-semibold text-[#1D6A4A] hover:underline">
                {anadiendo ? "Cancelar" : "+ Añadir servicio"}
              </button>
            }
          >
            {anadiendo && (
              <div className="border-2 border-[#1D6A4A]/25 rounded-lg p-3 mb-3">
                <AltaRapida
                  cliente={cliente}
                  onCancelar={() => setAnadiendo(false)}
                  onCreado={() => { setAnadiendo(false); cargar(); }}
                />
              </div>
            )}
            {procesos.length === 0 ? (
              <p className="text-[12.5px] text-neutral-400">Todavía no tiene ningún servicio contratado.</p>
            ) : (
              <div className="space-y-2">
                {procesos.map((p) => (
                  <button
                    key={p.id_solicitud} type="button" onClick={() => onAbrirProceso?.(p.id_solicitud)}
                    className={`w-full text-left border rounded-lg px-3 py-2.5 transition-colors hover:border-neutral-300 ${
                      p.cerrado ? "border-neutral-200 bg-neutral-50 opacity-70" : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TONO_SERVICIO[p.servicio]}`}>
                        {p.servicio_label}
                      </span>
                      <span className="text-[12.5px] font-semibold text-neutral-800">{p.etapa}</span>
                      {p.etapa_deducida && <span className="text-[10px] text-neutral-400">(deducida)</span>}
                      <span className="ml-auto text-[11px] text-neutral-400">{p.progreso}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-neutral-500">
                      {p.paquete && <span>{p.paquete}</span>}
                      {p.comunidades.length > 0 && <span>· {p.comunidades.join(", ")}</span>}
                      {p.responsable ? <span>· {p.responsable}</span>
                        : <span className="text-amber-600 font-semibold">· sin asignar</span>}
                      {p.docs_observados > 0 && (
                        <span className="text-red-600 font-semibold">· {p.docs_observados} obs</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Bloque>

          <Bloque titulo={`Notas · ${notas.length}`}>
            <div className="rounded-lg border border-neutral-200 bg-white p-2.5 mb-3">
              <textarea
                rows={3}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Qué se habló, qué se acordó, qué hay que vigilar…"
                className="w-full text-[13px] text-neutral-800 bg-transparent border-none outline-none resize-y placeholder:text-neutral-300"
              />
              <div className="flex items-center gap-3">
                <button type="button" onClick={anadirNota} disabled={!nota.trim() || guardandoNota}
                  className="text-[12px] font-semibold px-4 py-1.5 rounded-lg bg-[#1D6A4A] text-white disabled:opacity-40">
                  {guardandoNota ? "Guardando…" : "Añadir nota"}
                </button>
                <p className="text-[11px] text-neutral-400">Sólo la ve el equipo</p>
              </div>
            </div>

            {notas.length === 0 ? (
              <p className="text-[12.5px] text-neutral-400 py-4 text-center">
                Nada anotado todavía sobre este cliente.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                {notas.map((n) => (
                  <div key={n.id_nota} className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-[#023A4B] text-white grid place-items-center text-[8.5px] font-bold shrink-0">
                        {String(n.autor || "?").split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("")}
                      </span>
                      <span className="text-[11.5px] font-semibold text-neutral-700">{n.autor}</span>
                      <span className="text-[10.5px] text-neutral-400">{fecha(n.created_at)}</span>
                      {n.id_solicitud && (
                        <span className="text-[9.5px] font-semibold text-neutral-400 bg-white border border-neutral-200 rounded px-1.5 py-0.5">
                          de un proceso
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">{n.texto}</p>
                  </div>
                ))}
              </div>
            )}
          </Bloque>
        </div>

        <div className="space-y-3">
          <Bloque titulo="Datos">
            <div className="grid grid-cols-2 gap-3">
              <Dato label="Origen" valor={cliente.origen} />
              <Dato label="País" valor={cliente.pais_origen} />
              <Dato label="DNI" valor={cliente.dni} />
              <Dato label="Pasaporte" valor={cliente.pasaporte} />
              <Dato label="Registrado" valor={fecha(cliente.registrado)} />
            </div>
          </Bloque>

          <Bloque
            titulo="Finanzas"
            extra={
              procesos.length > 0 && (
                <button type="button" onClick={() => setCobrando((v) => !v)}
                  className="text-[11.5px] font-semibold text-[#1D6A4A] hover:underline">
                  {cobrando ? "Cancelar" : "+ Registrar cobro"}
                </button>
              )
            }
          >
            {cobrando && (
              <div className="rounded-lg border-2 border-[#1D6A4A]/25 p-2.5 mb-3 space-y-2">
                <div className="flex gap-2">
                  <input type="number" placeholder="Importe" value={cobro.monto}
                    onChange={(e) => setCobro({ ...cobro, monto: e.target.value })}
                    className="w-24 text-[12px] border border-neutral-300 rounded-lg px-2 py-1.5" />
                  <select value={cobro.moneda} onChange={(e) => setCobro({ ...cobro, moneda: e.target.value })}
                    className="text-[12px] border border-neutral-300 rounded-lg px-2 py-1.5">
                    <option>EUR</option><option>PEN</option><option>USD</option>
                  </select>
                </div>
                <select value={cobro.id_solicitud} onChange={(e) => setCobro({ ...cobro, id_solicitud: e.target.value })}
                  className="w-full text-[12px] border border-neutral-300 rounded-lg px-2 py-1.5">
                  <option value="">¿De qué servicio?</option>
                  {procesos.map((p) => (
                    <option key={p.id_solicitud} value={p.id_solicitud}>{p.servicio_label} · {p.paquete || "sin paquete"}</option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5 text-[12px] text-neutral-600">
                  <input type="checkbox" checked={cobro.cobrado}
                    onChange={(e) => setCobro({ ...cobro, cobrado: e.target.checked })} />
                  Ya cobrado
                </label>
                {!cobro.cobrado && (
                  <input type="date" value={cobro.vence}
                    onChange={(e) => setCobro({ ...cobro, vence: e.target.value })}
                    className="w-full text-[12px] border border-neutral-300 rounded-lg px-2 py-1.5" />
                )}
                <button type="button" onClick={registrarCobro}
                  disabled={!cobro.monto || !cobro.id_solicitud}
                  className="w-full text-[12px] font-semibold py-1.5 rounded-lg bg-[#1D6A4A] text-white disabled:opacity-40">
                  Guardar cobro
                </button>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <p className="text-[17px] font-bold text-[#1D6A4A] leading-none">{finanzas.cobrado.toFixed(0)}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Cobrado</p>
              </div>
              <div>
                <p className={`text-[17px] font-bold leading-none ${finanzas.pendiente > 0 ? "text-red-600" : "text-neutral-400"}`}>
                  {finanzas.pendiente.toFixed(0)}
                </p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Pendiente</p>
              </div>
              <div>
                <p className="text-[17px] font-bold text-neutral-700 leading-none">{finanzas.total.toFixed(0)}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Total</p>
              </div>
            </div>
            {finanzas.pagos.length === 0 ? (
              <p className="text-[12px] text-neutral-400">
                Sin cobros registrados. Se añaden desde Procesos, en «+ cobro».
              </p>
            ) : (
              <ul className="space-y-1.5">
                {finanzas.pagos.map((p) => (
                  <li key={p.id_pago} className="flex items-start gap-2 text-[11.5px]">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${p.pagado ? "bg-[#1D6A4A]" : "bg-amber-400"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block">
                        <span className="font-semibold text-neutral-700">{Number(p.monto).toFixed(0)} {p.moneda}</span>
                        <span className="text-neutral-400"> · {p.proceso}</span>
                      </span>
                      {(p.metodo || p.referencia) && (
                        <span className="block text-[10.5px] text-neutral-400 truncate">
                          {[p.metodo, p.referencia && `op. ${p.referencia}`].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </span>
                    {p.tiene_comprobante && <VerVoucher idPago={p.id_pago} />}
                    <span className="text-neutral-400 shrink-0 whitespace-nowrap">
                      {p.pagado ? fecha(p.fecha_pago) : `vence ${fecha(p.fecha_vencimiento)}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Bloque>
        </div>
      </div>
    </div>
  );
}
