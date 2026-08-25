// Ficha del cliente: todo lo suyo en una pantalla.
//
// Antes había que abrir cuatro sitios distintos para entender a alguien: sus
// datos en Clientes, sus procesos en Solicitudes, sus pagos en ningún lado y
// sus notas dentro de cada expediente. Aquí está junto.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import AltaRapida from "./AltaRapida";

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

  // La nota se cuelga del proceso más reciente: no hay tabla de notas por
  // cliente, y crearla duplicaría lo que ya existe por expediente.
  async function anadirNota() {
    const texto = nota.trim();
    const proceso = datos?.procesos?.[0];
    if (!texto || !proceso) return;
    setGuardandoNota(true);
    const r = await boPOST(`/backoffice/solicitudes/${proceso.id_solicitud}/notas`, { texto });
    setGuardandoNota(false);
    if (r.ok) { setNota(""); cargar(); }
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

          <Bloque titulo="Notas">
            <div className="flex gap-2 mb-3">
              <input
                value={nota} onChange={(e) => setNota(e.target.value)}
                placeholder={procesos.length ? "Escribe una nota…" : "Necesita al menos un proceso"}
                disabled={!procesos.length}
                className="flex-1 text-[12.5px] border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-[#1D6A4A] disabled:bg-neutral-50"
              />
              <button type="button" onClick={anadirNota} disabled={!nota.trim() || guardandoNota || !procesos.length}
                className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#1D6A4A] text-white disabled:opacity-40">
                {guardandoNota ? "…" : "Añadir"}
              </button>
            </div>
            {notas.length === 0 ? (
              <p className="text-[12.5px] text-neutral-400">Sin notas todavía.</p>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {notas.map((n) => (
                  <div key={n.id_nota} className="border-l-2 border-neutral-200 pl-2.5">
                    <p className="text-[11px] text-neutral-400">
                      <b className="text-neutral-600">{n.autor}</b> · {fecha(n.created_at)}
                    </p>
                    <p className="text-[12.5px] text-neutral-700 whitespace-pre-wrap leading-relaxed">{n.texto}</p>
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

          <Bloque titulo="Finanzas">
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
                  <li key={p.id_pago} className="flex items-center gap-2 text-[11.5px]">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.pagado ? "bg-[#1D6A4A]" : "bg-amber-400"}`} />
                    <span className="font-semibold text-neutral-700">{Number(p.monto).toFixed(0)} {p.moneda}</span>
                    <span className="text-neutral-400 truncate">{p.proceso}</span>
                    <span className="ml-auto text-neutral-400 shrink-0">
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
