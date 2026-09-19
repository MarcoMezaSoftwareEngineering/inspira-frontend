// Acciones en lote de Flujos: sobre los clientes marcados de un paso.
//
//   · Aprobar todo: lo pendiente de revisar, sin correo por documento (como la
//     revisión rápida). Se puede deshacer unos segundos desde el aviso, y el
//     backend guarda cómo estaba cada documento (/flujos-lote/revertir).
//   · Devolver con observaciones: documentos concretos, con su motivo o uno
//     común. El asesorado recibe el aviso de siempre al observar.
//   · Recordar: el recordatorio de pendientes de cada uno; primero se enseña a
//     quién le saldría y a quién no (y por qué), y no se repite el mismo día.
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCheck, Undo2, MessageSquareWarning, BellRing, X } from "lucide-react";
import { boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { Ventana, Boton, Chip } from "../ui";

const SEGUNDOS_DESHACER = 15;
const claveDoc = (p, d) => `${p.id_solicitud}:${d.origen}:${d.id_documento}`;

/* ── Barra fija con la selección ─────────────────────────────────────────── */

export function BarraLote({ n, onLimpiar, onAprobar, onDevolver, onRecordar }) {
  if (!n) return null;
  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-[70] px-3 pb-[max(12px,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-3xl bg-[#013446] text-white rounded-2xl shadow-[0_18px_40px_-12px_rgba(1,52,70,.7)] px-3 py-2.5 flex items-center gap-2 flex-wrap">
        <span className="text-[13px] font-semibold mr-auto">
          {n} cliente{n === 1 ? "" : "s"} seleccionado{n === 1 ? "" : "s"}
        </span>
        <Boton tono="cristal" tam="sm" icono={CheckCheck} onClick={onAprobar}>Aprobar todo</Boton>
        <Boton tono="cristal" tam="sm" icono={MessageSquareWarning} onClick={onDevolver}>Devolver con observaciones</Boton>
        <Boton tono="cristal" tam="sm" icono={BellRing} onClick={onRecordar}>Recordar</Boton>
        <button type="button" onClick={onLimpiar} aria-label="Quitar la selección"
          className="w-8 h-8 rounded-full grid place-items-center text-white/80 hover:bg-white/15">
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

/* ── Lo pendiente de varios procesos ─────────────────────────────────────── */

function usePendientes(ids, abierta) {
  const [procesos, setProcesos] = useState(null);
  const clave = ids.join(",");
  useEffect(() => {
    if (!abierta) return undefined;
    let vivo = true;
    boPOST("/backoffice/flujos-lote/pendientes", { ids: clave.split(",").map(Number) }).then((r) => {
      if (!vivo) return;
      if (r.ok) setProcesos(r.procesos || []);
      else { dialog.toast(r.msg || "No se pudo cargar lo pendiente", "error"); setProcesos([]); }
    });
    return () => { vivo = false; setProcesos(null); };
  }, [clave, abierta]);
  return procesos;
}

function ListaDocs({ procesos, marcados, onMarcar, children }) {
  return (
    <div className="space-y-3">
      {procesos.map((p) => (
        <div key={p.id_solicitud} className="rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-3 py-2 bg-neutral-50 flex items-center gap-2">
            <span className="text-[13px] font-semibold text-neutral-800 flex-1 truncate">{p.cliente}</span>
            <span className="text-[11px] text-neutral-500">{p.documentos.length} por revisar</span>
          </div>
          {p.documentos.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-neutral-400">Nada pendiente de revisar.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {p.documentos.map((d) => {
                const k = claveDoc(p, d);
                return (
                  <li key={k} className="px-3 py-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" className="mt-0.5" checked={marcados.has(k)} onChange={() => onMarcar(k)} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-semibold text-neutral-800">{d.etiqueta}</span>
                        <span className="block text-[11px] text-neutral-500 truncate">{d.archivo}</span>
                        {d.avisos?.length > 0 && (
                          <span className="block text-[11px] text-amber-700 mt-0.5">⚠ {d.avisos.join(" · ")}</span>
                        )}
                      </span>
                    </label>
                    {children?.(p, d, k)}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function alternar(set, k) {
  const n = new Set(set);
  if (n.has(k)) n.delete(k); else n.add(k);
  return n;
}

/* ── Aprobar todo ────────────────────────────────────────────────────────── */

export function VentanaAprobar({ abierta, ids, onCerrar, onHecho }) {
  const procesos = usePendientes(ids, abierta);
  const [quitados, setQuitados] = useState(new Set());
  const [trabajando, setTrabajando] = useState(false);

  const todos = useMemo(() => (procesos || []).flatMap((p) => p.documentos.map((d) => ({ p, d, k: claveDoc(p, d) }))), [procesos]);
  const cerrar = () => { setQuitados(new Set()); onCerrar?.(); };
  const marcados = useMemo(() => new Set(todos.map((x) => x.k).filter((k) => !quitados.has(k))), [todos, quitados]);
  const n = marcados.size;

  async function aprobar() {
    const ok = await dialog.confirm(
      `Se aprobarán ${n} documento${n === 1 ? "" : "s"} de ${new Set(todos.filter((x) => marcados.has(x.k)).map((x) => x.p.id_solicitud)).size} cliente(s). No se manda un correo por documento. Podrás deshacerlo durante ${SEGUNDOS_DESHACER} segundos.`,
      "Aprobar todo",
    );
    if (!ok) return;
    setTrabajando(true);
    const documentos = todos.filter((x) => marcados.has(x.k)).map((x) => ({ id_solicitud: x.p.id_solicitud, origen: x.d.origen, id_documento: x.d.id_documento }));
    const r = await boPOST("/backoffice/flujos-lote/aprobar", { ids, documentos });
    setTrabajando(false);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo aprobar", "error"); return; }
    if (r.errores?.length) dialog.toast(r.errores.join(" · "), "error");
    setQuitados(new Set());
    onHecho?.(r);
  }

  return (
    <Ventana abierta={abierta} onCerrar={cerrar} titulo="Aprobar todo"
      subtitulo="Documentos subidos y sin revisar de los clientes seleccionados. Desmarca los que no quieras aprobar."
      ancho="lg"
      pie={(
        <>
          <Boton tono="secundario" onClick={cerrar}>Cancelar</Boton>
          <Boton icono={CheckCheck} cargando={trabajando} disabled={!n} onClick={aprobar}>
            Aprobar {n} documento{n === 1 ? "" : "s"}
          </Boton>
        </>
      )}>
      {!procesos ? <p className="text-[13px] text-neutral-400 py-6 text-center">Cargando…</p>
        : !todos.length ? <p className="text-[13px] text-neutral-500 py-6 text-center">Ninguno de los seleccionados tiene documentos por revisar.</p>
        : <ListaDocs procesos={procesos} marcados={marcados} onMarcar={(k) => setQuitados((s) => alternar(s, k))} />}
    </Ventana>
  );
}

/* Aviso con cuenta atrás para deshacer el último «aprobar todo». */
export function AvisoDeshacer({ lote, aprobados, onDeshecho, onFin }) {
  const [quedan, setQuedan] = useState(SEGUNDOS_DESHACER);
  const [trabajando, setTrabajando] = useState(false);
  useEffect(() => {
    if (trabajando) return undefined;
    if (quedan <= 0) { onFin?.(); return undefined; }
    const t = setTimeout(() => setQuedan((q) => q - 1), 1000);
    return () => clearTimeout(t);
  }, [quedan, trabajando, onFin]);

  async function deshacer() {
    setTrabajando(true);
    const r = await boPOST("/backoffice/flujos-lote/revertir", { lote });
    setTrabajando(false);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo deshacer", "error"); onFin?.(); return; }
    dialog.toast(
      r.omitidos?.length
        ? `Deshecho: ${r.revertidos} vuelven a «por revisar»; ${r.omitidos.length} no, porque se tocaron después`
        : `Deshecho: ${r.revertidos} documento(s) vuelven a «por revisar»`,
      "success",
    );
    onDeshecho?.();
  }

  return createPortal(
    <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[75] w-[min(94vw,480px)]">
      <div className="bg-[#1D6A4A] text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
        <span className="text-[13px] flex-1">
          <b>{aprobados}</b> documento{aprobados === 1 ? "" : "s"} aprobado{aprobados === 1 ? "" : "s"}
        </span>
        <button type="button" onClick={deshacer} disabled={trabajando}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-bold bg-white/15 hover:bg-white/25 rounded-xl px-3 py-1.5 disabled:opacity-50">
          <Undo2 size={14} /> {trabajando ? "Deshaciendo…" : `Deshacer (${quedan})`}
        </button>
      </div>
    </div>,
    document.body,
  );
}

/* ── Devolver con observaciones ──────────────────────────────────────────── */

export function VentanaDevolver({ abierta, ids, onCerrar, onHecho }) {
  const procesos = usePendientes(ids, abierta);
  const [marcados, setMarcados] = useState(new Set());
  const [propias, setPropias] = useState({});
  const [comun, setComun] = useState("");
  const [trabajando, setTrabajando] = useState(false);
  const [resultado, setResultado] = useState(null);

  // Al cerrar se vacía: la próxima selección empieza de cero.
  const cerrar = () => { setMarcados(new Set()); setPropias({}); setComun(""); setResultado(null); onCerrar?.(); };

  const todos = useMemo(() => (procesos || []).flatMap((p) => p.documentos.map((d) => ({ p, d, k: claveDoc(p, d) }))), [procesos]);
  const elegidos = todos.filter((x) => marcados.has(x.k));
  const sinTexto = elegidos.filter((x) => !String(propias[x.k] || "").trim() && !comun.trim());

  async function devolver() {
    const ok = await dialog.confirm(
      `Se devolverán ${elegidos.length} documento(s) y el asesorado recibirá el aviso de «documento observado».`,
      "Devolver con observaciones",
    );
    if (!ok) return;
    setTrabajando(true);
    const r = await boPOST("/backoffice/flujos-lote/devolver", {
      comun: comun.trim(),
      documentos: elegidos.map((x) => ({
        id_solicitud: x.p.id_solicitud, origen: x.d.origen, id_documento: x.d.id_documento,
        etiqueta: x.d.etiqueta, comentario: String(propias[x.k] || "").trim(),
      })),
    });
    setTrabajando(false);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo devolver", "error"); return; }
    setResultado(r);
    onHecho?.(r);
  }

  return (
    <Ventana abierta={abierta} onCerrar={cerrar} titulo="Devolver con observaciones"
      subtitulo="Marca los documentos que hay que corregir. Cada uno puede llevar su motivo; si no, se usa el común."
      ancho="lg"
      pie={resultado ? <Boton onClick={cerrar}>Cerrar</Boton> : (
        <>
          <Boton tono="secundario" onClick={cerrar}>Cancelar</Boton>
          <Boton icono={MessageSquareWarning} cargando={trabajando} disabled={!elegidos.length || sinTexto.length > 0} onClick={devolver}>
            Devolver {elegidos.length || ""}
          </Boton>
        </>
      )}>
      {resultado ? (
        <div className="space-y-2">
          <p className="text-[13.5px] text-neutral-800"><b>{resultado.observados}</b> documento(s) devueltos.</p>
          <ul className="space-y-1.5">
            {resultado.resultado.map((x) => (
              <li key={x.id_solicitud} className="text-[12.5px] text-neutral-700">
                <b>{x.cliente}</b>: {x.observados} devuelto(s){x.aviso ? ` · ${x.aviso}` : ""}
              </li>
            ))}
          </ul>
          {resultado.errores?.length > 0 && (
            <p className="text-[12px] text-red-600">No se pudo: {resultado.errores.join(" · ")}</p>
          )}
        </div>
      ) : !procesos ? <p className="text-[13px] text-neutral-400 py-6 text-center">Cargando…</p>
        : !todos.length ? <p className="text-[13px] text-neutral-500 py-6 text-center">Ninguno de los seleccionados tiene documentos por revisar.</p>
        : (
          <div className="space-y-3">
            <label className="block">
              <span className="ase-etiqueta">Observación común</span>
              <textarea className="ase-campo w-full" rows={2} value={comun} onChange={(e) => setComun(e.target.value)}
                placeholder="Se usa en los documentos que no lleven la suya. Se le escribe de usted: «Le rogamos suba el documento completo y legible…»" />
            </label>
            <ListaDocs procesos={procesos} marcados={marcados} onMarcar={(k) => setMarcados((s) => alternar(s, k))}>
              {(p, d, k) => marcados.has(k) && (
                <textarea className="ase-campo w-full mt-1.5 text-[12.5px]" rows={2} value={propias[k] || ""}
                  onChange={(e) => setPropias((o) => ({ ...o, [k]: e.target.value }))}
                  placeholder={comun.trim() ? "Usa la observación común (o escribe una propia)" : "Qué tiene que corregir"} />
              )}
            </ListaDocs>
            {sinTexto.length > 0 && (
              <p className="text-[12px] text-amber-700">Falta la observación en {sinTexto.length} documento(s): escribe la suya o una común.</p>
            )}
          </div>
        )}
    </Ventana>
  );
}

/* ── Recordar en lote ────────────────────────────────────────────────────── */

const ESTADO = {
  se_enviara: { t: "Se enviará", tono: "petrol" },
  enviado: { t: "Enviado", tono: "verde" },
  omitido: { t: "Omitido", tono: "ambar" },
  error: { t: "Error", tono: "rojo" },
};

export function VentanaRecordar({ abierta, ids, onCerrar, onHecho }) {
  const [plan, setPlan] = useState(null);
  const [final, setFinal] = useState(null);
  const [trabajando, setTrabajando] = useState(false);
  const clave = ids.join(",");

  useEffect(() => {
    if (!abierta) return undefined;
    let vivo = true;
    boPOST("/backoffice/flujos-lote/recordar", { ids: clave.split(",").map(Number), simular: true }).then((r) => {
      if (!vivo) return;
      if (r.ok) setPlan(r); else { dialog.toast(r.msg || "No se pudo preparar", "error"); setPlan({ resultado: [] }); }
    });
    return () => { vivo = false; setPlan(null); setFinal(null); };
  }, [clave, abierta]);

  async function enviar() {
    setTrabajando(true);
    const r = await boPOST("/backoffice/flujos-lote/recordar", { ids });
    setTrabajando(false);
    if (!r.ok) { dialog.toast(r.msg || "No se pudieron mandar", "error"); return; }
    setFinal(r);
    onHecho?.(r);
  }

  const vista = final || plan;
  const n = plan?.se_enviaran || 0;
  return (
    <Ventana abierta={abierta} onCerrar={onCerrar} titulo="Recordar en lote"
      subtitulo={final
        ? `${final.enviados} enviado(s) · ${final.omitidos} omitido(s) · ${final.errores} con error`
        : "El correo de pendientes de cada servicio, de usted y con lo que le falta a cada uno. A quien ya se le recordó hoy no se le repite."}
      ancho="lg"
      pie={final ? <Boton onClick={onCerrar}>Cerrar</Boton> : (
        <>
          <Boton tono="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton icono={BellRing} cargando={trabajando} disabled={!n} onClick={enviar}>
            Enviar {n} recordatorio{n === 1 ? "" : "s"}
          </Boton>
        </>
      )}>
      {!vista ? <p className="text-[13px] text-neutral-400 py-6 text-center">Comprobando…</p> : (
        <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
          {vista.resultado.map((x) => (
            <li key={x.id_solicitud} className="px-3 py-2 flex items-start gap-2">
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-semibold text-neutral-800 truncate">{x.cliente || `#${x.id_solicitud}`}</span>
                <span className="block text-[11.5px] text-neutral-500">
                  {x.motivo}
                  {x.dias !== null && x.dias !== undefined && !/hace/.test(x.motivo || "") ? ` · recordado hace ${x.dias} día(s)` : ""}
                </span>
              </span>
              <Chip tono={ESTADO[x.estado]?.tono || "gris"}>{ESTADO[x.estado]?.t || x.estado}</Chip>
            </li>
          ))}
        </ul>
      )}
    </Ventana>
  );
}
