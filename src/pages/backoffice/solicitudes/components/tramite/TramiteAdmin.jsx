// El expediente de un trámite por pasos en Core (12/10/2026): grado, FP,
// homologación escolar, homologación de título y recurso de reposición.
//
// Los mismos pasos que ve el asesorado, con la ficha del cliente delante.
// Todo lo que el asesor registra sale de la ficha del servicio (campos, lista
// de candidaturas, documentos): GET /backoffice/tramites/:id la trae con los
// datos del expediente. La etapa se mueve aquí mismo y es la que coloca al
// asesorado en su paso.
import { useEffect, useMemo, useState } from "react";
import { boGET, boPATCH, boPUT } from "../../../../../services/backofficeApi";
import { cambiarEtapa } from "../../../comun/cambiarEtapa";
import EncabezadoClienteAdmin from "../../EncabezadoClienteAdmin";
import ChecklistSolicitudAdmin from "../ChecklistSolicitudAdmin";
import DocumentosProceso from "../../../../../components/common/DocumentosProceso";
import RutaMini from "../../../../../components/common/RutaMini";
import { fechaCorta, gruposDe, mostrarValor } from "../../../../../lib/tramites";

/* ── La cabecera y la caja de cada bloque (como en el máster) ───────────── */

const BADGE = {
  completado: "bg-[#1D6A4A] text-white",
  observado:  "bg-[#DC2626] text-white",
  pendiente:  "bg-[#FFFBEA] text-[#F59E0B] border-2 border-[#F59E0B]/30",
  revision:   "bg-[#6D28D9] text-white",
  inactivo:   "bg-[#F4F6F9] text-[#6B7280] border-2 border-[#E2E8F0]",
};
const CHIP = {
  completado: ["bg-[#E8F5EE] text-[#1D6A4A]", "✓ Completo"],
  observado:  ["bg-[#FEF2F2] text-[#DC2626]", "⚠ Observado"],
  pendiente:  ["bg-[#FFFBEA] text-[#F59E0B]", "● En progreso"],
  revision:   ["bg-[#EDE9FE] text-[#6D28D9]", "◎ Pendiente revisión"],
  inactivo:   ["bg-[#F4F6F9] text-[#6B7280]", "— Inactivo"],
};

function Cab({ numero, titulo, estado }) {
  const e = estado || "inactivo";
  return (
    <div className="flex items-center gap-2 sm:gap-3 w-full text-left px-3 sm:px-4 py-3 rounded-t-[12px] bg-white border border-b-0 border-[#E2E8F0] shadow-sm">
      <div className={`w-[28px] h-[28px] rounded-[7px] flex items-center justify-center text-[12px] font-extrabold font-mono shrink-0 ${BADGE[e] || BADGE.inactivo}`}>{numero}</div>
      <span className="font-serif text-[14px] sm:text-[15px] text-[#1A3557] flex-1 min-w-0 font-semibold">{titulo}</span>
      <span className={`text-[10px] font-semibold px-2 sm:px-[10px] py-1 rounded-full shrink-0 whitespace-nowrap ${(CHIP[e] || CHIP.inactivo)[0]}`}>{(CHIP[e] || CHIP.inactivo)[1]}</span>
    </div>
  );
}

function Caja({ children }) {
  return <div className="bg-white border border-[#E2E8F0] border-t-0 rounded-b-[12px] overflow-hidden shadow-sm mb-2">{children}</div>;
}

function Sub({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D6A4A] mb-2">{children}</p>;
}

const PLAZO_TONO = (d) => (d === null ? "bg-[#F4F6F9] text-[#6B7280]" : d < 0 ? "bg-[#FEF2F2] text-[#DC2626]" : d <= 14 ? "bg-[#FFFBEA] text-[#B45309]" : "bg-[#E8F5EE] text-[#1D6A4A]");

/* ── Entradas ────────────────────────────────────────────────────────────── */

function Entrada({ campo, valor, onChange, compacta = false }) {
  const v = valor ?? "";
  const cls = compacta ? "ex-campo" : "ex-campo";
  if (campo.tipo === "textarea") return <textarea className={cls} rows={compacta ? 2 : 3} value={v} onChange={(e) => onChange(e.target.value)} />;
  if (campo.tipo === "opcion") {
    return (
      <select className={cls} value={v} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {(campo.opciones || []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  const tipo = campo.tipo === "fecha" ? "date" : campo.tipo === "numero" ? "number" : campo.tipo === "url" ? "url" : "text";
  return <input type={tipo} className={`${cls}${campo.tipo === "secreto" ? " mono" : ""}`} value={v} onChange={(e) => onChange(e.target.value)} />;
}

/** Los campos de un paso, todos editables, con «Guardar». */
function CamposAdmin({ idSolicitud, campos, tramite, onGuardado }) {
  const [form, setForm] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    setForm(Object.fromEntries(campos.map((c) => [c.clave, tramite?.[c.clave] ?? ""])));
  }, [tramite, campos]);

  if (!campos.length) return null;
  const cambiado = campos.some((c) => String(form[c.clave] ?? "") !== String(tramite?.[c.clave] ?? ""));

  async function guardar() {
    setGuardando(true); setAviso("");
    const r = await boPATCH(`/backoffice/tramites/${idSolicitud}/campos`, { campos: form });
    setGuardando(false);
    if (r.ok) { setAviso("Guardado."); onGuardado(r); }
    else setAviso(r.msg || "No se pudo guardar.");
  }

  return (
    <section>
      <Sub>Datos del paso</Sub>
      <div className="flex flex-col gap-4">
        {gruposDe(campos).map((g, gi) => (
          <div key={g.titulo || gi}>
            {g.titulo && <p className="text-[11.5px] font-extrabold text-[#1A3557] mb-2">{g.titulo}</p>}
            <div className="ex-grid2">
              {g.campos.map((c) => (
                <label key={c.clave} className={c.tipo === "textarea" ? "sm:col-span-2" : ""}>
                  <span className="ex-lab">
                    {c.label}
                    {c.cliente === "editar" && <span className="ml-1 normal-case tracking-normal text-[#B9770E]">· lo rellena el asesorado</span>}
                    {c.cliente === "ver" && <span className="ml-1 normal-case tracking-normal text-[#6B7280]">· lo ve el asesorado</span>}
                  </span>
                  <Entrada campo={c} valor={form[c.clave]} onChange={(v) => setForm((f) => ({ ...f, [c.clave]: v }))} />
                  {c.ayuda && <small className="block text-[11px] text-[#5f7a89] mt-1 leading-snug">{c.ayuda}</small>}
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3 flex-wrap">
          <button type="button" className="ex-btn" disabled={!cambiado || guardando} onClick={guardar}>
            {guardando ? "Guardando…" : "Guardar datos"}
          </button>
          {aviso && <span className="text-[12px] text-[#5f7a89]">{aviso}</span>}
        </div>
      </div>
    </section>
  );
}

/** La lista del servicio, editable fila a fila. Se guarda entera. */
function ListaAdmin({ idSolicitud, def, modo, candidaturas, onGuardado }) {
  const lista = def.lista;
  const [filas, setFilas] = useState([]);
  const [abierta, setAbierta] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => { setFilas((candidaturas || []).map((c) => ({ ...c }))); }, [candidaturas]);

  if (!lista) return null;
  const ELEGIDAS = ["Elegida", "Postulada", "Lista de espera", "Admitida", "No admitida", "Matriculada"];
  const visibles = modo === "elegidas" ? filas.filter((f) => ELEGIDAS.includes(f.estado)) : filas;
  const campoEstado = lista.campos.find((c) => c.clave === "estado");
  const principales = lista.campos.filter((c) => ["programa", "centro", "descripcion", "ciudad", "fecha", "plazo_fin"].includes(c.clave)).slice(0, 3);

  const nuevoId = () => `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const set = (id, clave, valor) => setFilas((fs) => fs.map((f) => (f.id === id ? { ...f, [clave]: valor } : f)));
  const quitar = (id) => { setFilas((fs) => fs.filter((f) => f.id !== id)); if (abierta === id) setAbierta(null); };
  const anadir = () => {
    const f = { id: nuevoId(), ...(campoEstado ? { estado: campoEstado.opciones[0] } : {}) };
    setFilas((fs) => [...fs, f]); setAbierta(f.id);
  };

  async function guardar() {
    setGuardando(true); setAviso("");
    const r = await boPUT(`/backoffice/tramites/${idSolicitud}/candidaturas`, { candidaturas: filas });
    setGuardando(false);
    if (r.ok) { setAviso("Guardado."); onGuardado(r); }
    else setAviso(r.msg || "No se pudo guardar la lista.");
  }

  const titulo = (f) => f.programa || f.centro || f.descripcion || `(${lista.singular} sin nombre)`;

  return (
    <section>
      <Sub>{lista.titulo}{modo === "elegidas" ? " · solo las elegidas" : ""}</Sub>
      {!visibles.length && (
        <div className="ex-vacio">
          {modo === "elegidas" ? `Ninguna ${lista.singular} marcada como elegida todavía.` : `Sin ${lista.singular}s. Añade la primera.`}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {visibles.map((f, i) => (
          <div key={f.id} className="border border-[#E2E8F0] rounded-xl bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="w-6 h-6 rounded-md bg-[#F4F6F9] text-[#1A3557] text-[11px] font-extrabold grid place-items-center shrink-0">{i + 1}</span>
              <button type="button" className="flex-1 min-w-0 text-left" onClick={() => setAbierta(abierta === f.id ? null : f.id)}>
                <span className="block text-[12.5px] font-bold text-[#10303f] truncate">{titulo(f)}</span>
                <span className="block text-[11px] text-[#5f7a89] truncate">
                  {principales.filter((c) => !["programa", "centro", "descripcion"].includes(c.clave) || f[c.clave] !== titulo(f)).map((c) => f[c.clave] ? mostrarValor(c, f[c.clave]) : null).filter(Boolean).join(" · ") || "Toca para completar"}
                </span>
              </button>
              {campoEstado && (
                <select className="ex-select" value={f.estado || ""} onChange={(e) => set(f.id, "estado", e.target.value)}>
                  {campoEstado.opciones.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              <button type="button" className="text-[11px] font-bold text-[#C0392B] px-1" onClick={() => quitar(f.id)} title="Quitar">✕</button>
            </div>
            {abierta === f.id && (
              <div className="border-t border-[#E2E8F0] px-3 py-3 ex-grid2">
                {lista.campos.filter((c) => c.clave !== "estado").map((c) => (
                  <label key={c.clave} className={c.tipo === "textarea" ? "sm:col-span-2" : ""}>
                    <span className="ex-lab">{c.label}</span>
                    <Entrada campo={c} valor={f[c.clave]} onChange={(v) => set(f.id, c.clave, v)} compacta />
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 flex-wrap mt-3">
        <button type="button" className="ex-btn" onClick={anadir}>+ Añadir {lista.singular}</button>
        <button type="button" className="ex-btn" disabled={guardando} onClick={guardar}>{guardando ? "Guardando…" : "Guardar lista"}</button>
        {aviso && <span className="text-[12px] text-[#5f7a89]">{aviso}</span>}
      </div>
    </section>
  );
}

/* ── El panel ────────────────────────────────────────────────────────────── */

export default function TramiteAdmin({ detalle, setDetalle, checklistPorEtapa, recargar, activeBloque }) {
  const idSolicitud = detalle?.id_solicitud;
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [etapaSel, setEtapaSel] = useState("");
  const [moviendo, setMoviendo] = useState(false);

  async function cargar() {
    const r = await boGET(`/backoffice/tramites/${idSolicitud}`);
    if (r.ok) { setDatos(r); setEtapaSel(r.etapa || ""); setError(""); }
    else setError(r.msg || "No se pudo cargar el trámite.");
  }
  useEffect(() => { if (idSolicitud) cargar(); }, [idSolicitud]); // eslint-disable-line react-hooks/exhaustive-deps

  const def = datos?.definicion;
  const bloques = detalle?.estado_expediente?.bloques || [];
  const estadoDe = (id) => bloques.find((b) => b.id === id)?.estado || "pendiente";
  const pasoActivo = useMemo(() => def?.pasos.find((p) => p.id === activeBloque) || null, [def, activeBloque]);
  const indice = def ? def.pasos.findIndex((p) => p.id === activeBloque) : -1;

  async function moverEtapa(etapa) {
    if (!etapa || etapa === datos?.etapa) return;
    setMoviendo(true);
    const r = await cambiarEtapa(idSolicitud, etapa, def.clave);
    setMoviendo(false);
    if (r.ok) {
      setDatos((d) => ({ ...d, etapa }));
      setDetalle?.((prev) => (prev ? { ...prev, etapa } : prev));
      recargar?.({ silencioso: true });
    } else if (!r.cancelado) {
      setEtapaSel(datos?.etapa || "");
      setError(r.msg || "No se pudo cambiar la etapa.");
    } else {
      setEtapaSel(datos?.etapa || "");
    }
  }

  function onGuardado(r) {
    setDatos((d) => ({ ...d, tramite: r.tramite, candidaturas: r.candidaturas, derivados: r.derivados }));
  }

  if (error && !datos) return <p className="text-sm text-red-600 p-4">{error}</p>;
  if (!def) return <p className="text-sm text-neutral-500 p-4">Cargando el trámite…</p>;

  const plazos = (datos.derivados || []).filter((d) => d.paso === activeBloque);
  const modoLista = def.lista?.enPasos?.[activeBloque];

  return (
    <div className="space-y-3">
      {/* La etapa: la mueve el equipo y es la que coloca al asesorado en su paso. */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] m-0">Etapa del proceso</p>
          <p className="text-[12px] text-[#5f7a89] m-0">Es la que decide en qué paso ve su expediente el asesorado.</p>
        </div>
        <select className="ex-select !max-w-none" value={etapaSel} disabled={moviendo} onChange={(e) => { setEtapaSel(e.target.value); moverEtapa(e.target.value); }}>
          {!datos.etapa && <option value="">— Sin etapa (se deduce) —</option>}
          {def.etapas.map((e) => <option key={e.valor} value={e.valor}>{e.valor}</option>)}
        </select>
        {(datos.derivados || []).filter((d) => d.dias !== null && d.dias <= 14).map((d) => (
          <span key={d.clave} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${PLAZO_TONO(d.dias)}`} title={d.de}>
            {d.label}: {fechaCorta(d.fecha)}{d.dias < 0 ? " · vencido" : d.dias === 0 ? " · hoy" : ` · ${d.dias} d`}
          </span>
        ))}
      </div>
      {error && <p className="text-[12px] text-red-600 m-0">{error}</p>}

      {/* 0 — Ficha del cliente */}
      {activeBloque === "cliente" && (
        <div id="bloque-cliente" className="scroll-mt-4">
          <Cab numero="0" titulo="Ficha del cliente" estado={estadoDe("cliente")} />
          <Caja>
            <EncabezadoClienteAdmin
              detalle={detalle}
              resumen={null}
              onClienteActualizado={(c) => setDetalle?.((prev) => ({ ...prev, cliente: c }))}
            />
            <div className="border-t border-[#E2E8F0] px-5 py-4">
              <Sub>El servicio</Sub>
              <dl className="ex-kv">
                <dt>Servicio</dt><dd>{def.nombre}</dd>
                <dt>Paquete</dt><dd>{detalle?.paquete_panel || "—"}</dd>
                <dt>Etapa</dt><dd>{datos.etapa || "sin fijar"}</dd>
                <dt>Paso del asesorado</dt><dd>{def.pasos[datos.paso_actual]?.titulo || "—"}</dd>
              </dl>
            </div>
          </Caja>
        </div>
      )}

      {/* 1..n — El paso activo */}
      {pasoActivo && (
        <div id={`bloque-${pasoActivo.id}`} className="scroll-mt-4">
          <Cab numero={String(indice + 1)} titulo={pasoActivo.titulo} estado={estadoDe(pasoActivo.id)} />
          <Caja>
            <div className="p-5 space-y-6">
              <section className="text-[12.5px] text-[#10303f] leading-relaxed">
                <p className="m-0"><b>Qué se hace:</b> {pasoActivo.explica}</p>
                <p className="m-0 mt-1 text-[#5f7a89]"><b>Lo que ve el asesorado como su parte:</b> {pasoActivo.tuParte}</p>
              </section>

              {pasoActivo.ruta && (
                <section>
                  <Sub>{pasoActivo.ruta.titulo} · lo que ve el asesorado</Sub>
                  <RutaMini ruta={pasoActivo.ruta} valor={datos.tramite?.[pasoActivo.ruta.campo]} />
                  <p className="text-[11.5px] text-[#5f7a89] mt-2 mb-0">Se mueve con el campo «{(pasoActivo.campos || []).find((c) => c.clave === pasoActivo.ruta.campo)?.label || pasoActivo.ruta.campo}» de abajo.</p>
                </section>
              )}

              {plazos.length > 0 && (
                <section>
                  <Sub>Plazos</Sub>
                  <div className="flex flex-wrap gap-2">
                    {plazos.map((d) => (
                      <span key={d.clave} className={`text-[11.5px] font-bold px-3 py-1.5 rounded-full ${PLAZO_TONO(d.dias)}`} title={d.de}>
                        {d.label}: {fechaCorta(d.fecha)}{d.dias === null ? "" : d.dias < 0 ? ` · venció hace ${-d.dias} d` : d.dias === 0 ? " · hoy" : ` · en ${d.dias} d`}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <CamposAdmin idSolicitud={idSolicitud} campos={pasoActivo.campos || []} tramite={datos.tramite} onGuardado={onGuardado} />

              {modoLista && (
                <ListaAdmin idSolicitud={idSolicitud} def={def} modo={modoLista} candidaturas={datos.candidaturas} onGuardado={onGuardado} />
              )}

              {pasoActivo.id === "documentos" && (
                <section>
                  <Sub>Documentos del asesorado</Sub>
                  <ChecklistSolicitudAdmin detalle={detalle} checklistPorEtapa={checklistPorEtapa} recargar={recargar} />
                </section>
              )}

              {pasoActivo.proceso && (
                <section className="pt-5 border-t border-[#E2E8F0]">
                  <Sub>Documentos del proceso</Sub>
                  <p className="text-[11.5px] text-[#5f7a89] mt-0 mb-2">Volantes, resguardos, credenciales y resoluciones que Inspira consigue: el asesorado los ve en este mismo paso.</p>
                  <DocumentosProceso idSolicitud={idSolicitud} modo="asesor" />
                </section>
              )}
            </div>
          </Caja>
        </div>
      )}
    </div>
  );
}
