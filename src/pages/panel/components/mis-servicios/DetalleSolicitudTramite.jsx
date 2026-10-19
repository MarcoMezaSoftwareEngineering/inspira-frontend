// El expediente de un trámite por pasos en el panel (12/10/2026): grado, FP,
// homologación escolar, homologación de título y recurso de reposición.
//
// Es el recorrido del doctorado hecho genérico: los pasos, los textos, los
// campos y los documentos salen de la ficha del servicio, que sirve el
// backend (GET /solicitudes/:id/tramite, de modules/tramites). Aquí solo se
// pinta. El paso en el que está lo marca la etapa que mueve el equipo en Core.
//
// Lo que el asesorado puede escribir son los campos `cliente: "editar"` (su
// colegio, su carrera, la fecha en que le notificaron…); lo que Inspira
// consigue (claves de la sede, expedientes, plazos) lo ve pero no lo toca.
import { useEffect, useMemo, useState } from "react";
import { apiGET, apiPATCH } from "../../../../services/api";
import SeccionPanel, { SeccionSiempreAbiertoCtx } from "./sections/SeccionPanel";
import ChecklistDocumentos from "./sections/ChecklistDocumentos";
import DocumentosProceso from "../../../../components/common/DocumentosProceso";
import CercoErrores from "../../../../components/common/CercoErrores";
import { RutaPasos, TituloPaso, LeToca, ExpedienteCabecera } from "../../../../components/common/RutaPasos";
import Icono from "../../../../components/common/Icono";
import RutaMini from "../../../../components/common/RutaMini";
import { EsqueletoExpediente } from "../Esqueleto";
import NovedadesExpediente from "../NovedadesExpediente";
import EncuestaCierre from "../EncuestaCierre";
import MensajesFlotante from "./MensajesFlotante";
import { usePublicarCabecera } from "../../cabeceraExpediente";
import {
  ETIQUETA_DOC, candidaturasDelPaso, checklistPorPaso, docsDelPaso, fechaCorta, gruposDe,
  mostrarValor, pasoDeItem, situacionDe,
} from "../../../../lib/tramites";

const CAMPO = "w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition";
const ETIQ = "block text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-1";

function inicialesDe(nombre) {
  return String(nombre || "").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "•";
}

const estadoDe = (it) => String(it?.estado_item || "pendiente").toLowerCase();
const nombreDe = (it) => it?.item?.nombre_item || "un documento";

/** Lo primero que le toca, dicho una vez y arriba. */
function calcularLeToca({ def, checklist, situacion, tramite, derivados }) {
  const items = checklist || [];
  const obs = items.find((it) => ["observado", "rechazado"].includes(estadoDe(it)));
  if (obs) return { tono: "warn", icono: "upload", etiqueta: "Te toca:", texto: `corregir «${nombreDe(obs)}»`, seccion: pasoDeItem(def, obs) };
  const pedido = items.find((it) => estadoDe(it) === "solicitado" && !(it.documentos || []).length);
  if (pedido) return { tono: "warn", icono: "upload", etiqueta: "Te toca:", texto: `subir «${nombreDe(pedido)}», que te pidió tu asesor`, seccion: pasoDeItem(def, pedido) };
  // Un plazo que vence en menos de una semana es lo primero, sea cual sea el paso.
  const urgente = (derivados || []).find((d) => d.dias !== null && d.dias <= 7);
  if (urgente) {
    const cuando = urgente.dias < 0 ? "venció" : urgente.dias === 0 ? "vence hoy" : `vence en ${urgente.dias} día${urgente.dias === 1 ? "" : "s"}`;
    return { tono: "warn", icono: "clock", etiqueta: "Plazo:", texto: `${urgente.label.toLowerCase()} ${cuando} (${fechaCorta(urgente.fecha)})`, seccion: urgente.paso };
  }
  if (situacion.pausa) {
    return { tono: "on", icono: "clock", etiqueta: "En pausa.", texto: "Tu proceso está detenido. Si quieres retomarlo, escríbele a tu asesor.", seccion: null };
  }
  if (situacion.hecho) {
    return { tono: "ok", icono: "check", etiqueta: "Recorrido completo.", texto: "Tu expediente sigue aquí, con tus documentos, cuando lo necesites.", seccion: null };
  }
  const actual = def.pasos[situacion.indice];
  const falta = items.find((it) => pasoDeItem(def, it) === actual.id && it.item?.obligatorio !== false
    && estadoDe(it) === "pendiente" && !(it.documentos || []).length);
  if (falta) return { tono: "on", icono: "upload", etiqueta: "Te toca:", texto: `subir «${nombreDe(falta)}»`, seccion: actual.id };
  const vacio = (actual.campos || []).find((c) => c.cliente === "editar" && (tramite?.[c.clave] === undefined || tramite?.[c.clave] === null || tramite?.[c.clave] === ""));
  if (vacio) return { tono: "on", icono: "edit", etiqueta: "Te toca:", texto: `completar «${vacio.label}»`, seccion: actual.id };
  return { tono: "ok", icono: "check", etiqueta: "Al día.", texto: "Tu asesor avanza con tu trámite y te avisará por mensaje.", seccion: null };
}

/** Los documentos del servicio en este paso, con cómo va cada uno. */
function DocsDelPaso({ docs }) {
  if (!docs.length) return null;
  return (
    <section className="pnl-doc-lista" aria-label="Documentos de este paso">
      <h3>Documentos de este paso</h3>
      <ul>
        {docs.map((d) => {
          const e = ETIQUETA_DOC[d.estado] || ETIQUETA_DOC.falta;
          return (
            <li key={d.clave}>
              <span className="pnl-doc-nombre">{d.nombre}</span>
              <span className={`pnl-chip pnl-chip-${e.tono}`}><span className="punto" />{e.texto}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Los plazos que se calculan de lo registrado (un mes para recurrir, tres para resolver…). */
function Plazos({ plazos }) {
  if (!plazos.length) return null;
  return (
    <section className="pnl-doc-lista" aria-label="Plazos">
      <h3>Plazos</h3>
      <ul>
        {plazos.map((p) => {
          const tono = p.dias === null ? "tipo" : p.dias < 0 ? "alto" : p.dias <= 14 ? "aviso" : "ok";
          const texto = p.dias === null ? "" : p.dias < 0 ? `venció hace ${-p.dias} d` : p.dias === 0 ? "hoy" : `en ${p.dias} d`;
          return (
            <li key={p.clave}>
              <span className="pnl-doc-nombre">
                {p.label}
                <small className="block text-[11px] font-normal text-neutral-500">{p.de}</small>
              </span>
              <span className={`pnl-chip pnl-chip-${tono}`}><span className="punto" />{fechaCorta(p.fecha)}{texto ? ` · ${texto}` : ""}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Entrada({ campo, valor, onChange }) {
  const v = valor ?? "";
  if (campo.tipo === "textarea") return <textarea className={CAMPO} rows={3} value={v} onChange={(e) => onChange(e.target.value)} />;
  if (campo.tipo === "opcion") {
    return (
      <select className={CAMPO} value={v} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Elige —</option>
        {(campo.opciones || []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  const tipo = campo.tipo === "fecha" ? "date" : campo.tipo === "numero" ? "number" : campo.tipo === "url" ? "url" : "text";
  return <input type={tipo} className={CAMPO} value={v} onChange={(e) => onChange(e.target.value)} />;
}

/**
 * Los campos del paso: los suyos con entrada y «Guardar»; los de Inspira,
 * solo lectura (las claves tapadas, con «Mostrar»).
 */
function CamposPaso({ idSolicitud, campos, tramite, onGuardado }) {
  const editables = campos.filter((c) => c.cliente === "editar");
  const [form, setForm] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [reveladas, setReveladas] = useState({});

  useEffect(() => {
    setForm(Object.fromEntries(editables.map((c) => [c.clave, tramite?.[c.clave] ?? ""])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tramite, campos]);

  if (!campos.length) return null;

  const cambiado = editables.some((c) => String(form[c.clave] ?? "") !== String(tramite?.[c.clave] ?? ""));

  async function guardar() {
    setGuardando(true); setAviso("");
    try {
      const r = await apiPATCH(`/solicitudes/${idSolicitud}/tramite`, { campos: form });
      if (r?.ok) { setAviso("Guardado."); onGuardado?.(r); }
      else setAviso(r?.msg || "No se pudo guardar.");
    } catch {
      setAviso("No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="pnl-doc-lista" aria-label="Datos de este paso">
      <h3>Datos de este paso</h3>
      <div className="flex flex-col gap-4 mt-2">
        {gruposDe(campos).map((g, gi) => (
          <div key={g.titulo || gi}>
            {g.titulo && <p className="text-[11px] font-extrabold uppercase tracking-wider text-primary mb-2">{g.titulo}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              {g.campos.map((c) => (
                <div key={c.clave} className={c.tipo === "textarea" ? "sm:col-span-2" : ""}>
                  <label className={ETIQ}>{c.label}</label>
                  {c.cliente === "editar" ? (
                    <Entrada campo={c} valor={form[c.clave]} onChange={(v) => setForm((f) => ({ ...f, [c.clave]: v }))} />
                  ) : (
                    <p className="text-sm text-neutral-800 min-h-[1.5rem] flex items-center gap-2 flex-wrap">
                      {c.tipo === "url" && tramite?.[c.clave] ? (
                        <a className="text-primary underline break-all" href={tramite[c.clave]} target="_blank" rel="noopener noreferrer">Abrir</a>
                      ) : (
                        <span className={tramite?.[c.clave] ? "" : "text-neutral-400"}>{mostrarValor(c, tramite?.[c.clave], { revelar: !!reveladas[c.clave] })}</span>
                      )}
                      {c.tipo === "secreto" && tramite?.[c.clave] && (
                        <button type="button" className="text-[11px] font-bold text-primary" onClick={() => setReveladas((r) => ({ ...r, [c.clave]: !r[c.clave] }))}>
                          {reveladas[c.clave] ? "Ocultar" : "Mostrar"}
                        </button>
                      )}
                    </p>
                  )}
                  {c.ayuda && <small className="block text-[11.5px] text-neutral-500 mt-1 leading-snug">{c.ayuda}</small>}
                </div>
              ))}
            </div>
          </div>
        ))}
        {editables.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <button type="button" className="pnl-btn pnl-btn-cta" disabled={!cambiado || guardando} onClick={guardar}>
              {guardando ? "Guardando…" : "Guardar"}
            </button>
            {aviso && <span className="text-[12px] text-neutral-600">{aviso}</span>}
          </div>
        )}
      </div>
    </section>
  );
}

const TONO_ESTADO = {
  Candidata: "tipo", Descartada: "tipo", Elegida: "info", Postulada: "aviso", "Lista de espera": "aviso",
  Admitida: "ok", Matriculada: "ok", "No admitida": "alto", Pendiente: "aviso", Respondido: "ok", Archivado: "alto",
};

/**
 * La lista del servicio (carreras y ciclos, universidades, requerimientos),
 * tal como la trabaja Inspira. Si la lista tiene campos `cliente: "editar"`
 * (su «sí» en la elección), se guardan fila a fila.
 */
function Candidaturas({ def, filas, idSolicitud, pasoId, onGuardado }) {
  const lista = def.lista;
  const [guardando, setGuardando] = useState(null);
  if (!lista || !filas) return null;
  const editables = pasoId === "eleccion" ? lista.campos.filter((c) => c.cliente === "editar") : [];
  const visibles = lista.campos.filter((c) => c.tipo !== "secreto" && !["notas", "estado", "tipo", "baremo"].includes(c.clave) && c.cliente !== "editar");
  const titulo = (f) => f.programa || f.centro || f.descripcion || lista.singular;
  const sub = (f) => [f.centro && f.programa ? f.centro : null, f.ciudad, f.comunidad].filter(Boolean).join(" · ");
  const grupos = lista.campos.some((c) => c.clave === "tipo")
    ? [...new Set(filas.map((f) => f.tipo || "Otras opciones"))].map((t) => ({ t, filas: filas.filter((f) => (f.tipo || "Otras opciones") === t) }))
    : [{ t: null, filas }];

  async function marcar(fila, campo, v) {
    setGuardando(`${fila.id}:${campo.clave}`);
    try {
      const r = await apiPATCH(`/solicitudes/${idSolicitud}/tramite/candidaturas/${fila.id}`, { campos: { [campo.clave]: v } });
      if (r?.ok) onGuardado?.(r);
    } finally {
      setGuardando(null);
    }
  }

  return (
    <section className="pnl-doc-lista" aria-label={lista.titulo}>
      <h3>{lista.titulo}</h3>
      {!filas.length ? (
        <p className="text-[13px] text-neutral-500 m-0">Todavía no hay {lista.singular === "requerimiento" ? "ninguno" : "ninguna propuesta"}: tu asesor la está preparando.</p>
      ) : grupos.map((g) => (
        <div key={g.t || "todas"} className="mt-2 first:mt-0">
          {g.t && <p className="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-wider text-primary">{g.t}</p>}
          <ul>
            {g.filas.map((f) => {
              const e = f.estado ? { texto: f.estado, tono: TONO_ESTADO[f.estado] || "tipo" } : null;
              const detalles = visibles
                .filter((c) => !["programa", "centro", "ciudad", "comunidad", "descripcion"].includes(c.clave) && f[c.clave])
                .map((c) => `${c.label}: ${mostrarValor(c, f[c.clave])}`);
              return (
                <li key={f.id} className="!items-start !flex-wrap">
                  <span className="pnl-doc-nombre flex-1">
                    {titulo(f)}
                    {sub(f) && <small className="block text-[11.5px] font-medium text-neutral-500">{sub(f)}</small>}
                    {f.descripcion && f.programa && <small className="block text-[11.5px] text-neutral-600">{f.descripcion}</small>}
                    {f.baremo && <small className="block text-[11.5px] text-neutral-600">Admisión: {f.baremo}</small>}
                    {detalles.length > 0 && <small className="block text-[11px] font-normal text-neutral-500 mt-0.5">{detalles.join(" · ")}</small>}
                    {f.portal_url && <a className="block text-[11.5px] font-bold text-primary mt-0.5" href={f.portal_url} target="_blank" rel="noopener noreferrer">Abrir portal</a>}
                  </span>
                  {e && <span className={`pnl-chip pnl-chip-${e.tono}`}><span className="punto" />{e.texto}</span>}
                  {editables.map((c) => (
                    <span key={c.clave} className="basis-full flex items-center gap-2 mt-1">
                      <small className="text-[11px] font-bold text-neutral-500">{c.label}:</small>
                      {(c.opciones || []).map((o) => (
                        <button
                          key={o} type="button"
                          disabled={guardando === `${f.id}:${c.clave}`}
                          onClick={() => marcar(f, c, o)}
                          className={`pnl-chip ${f[c.clave] === o ? (o === "Sí" ? "pnl-chip-ok" : "pnl-chip-alto") : "pnl-chip-tipo"} ux-tap`}
                        >
                          {o}
                        </button>
                      ))}
                    </span>
                  ))}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default function DetalleSolicitudTramite({ solicitudBase, onIrAGuia, seccion, onSeccion, perfil }) {
  const idSolicitud = solicitudBase.id_solicitud;
  const [datos, setDatos] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensajesAbierto, setMensajesAbierto] = useState(false);

  async function cargarChecklist() {
    const r = await apiGET(`/checklist/${idSolicitud}`);
    if (r?.ok) setChecklist(r.checklist || []);
  }

  async function cargarTodo() {
    setError("");
    try {
      const [t] = await Promise.all([apiGET(`/solicitudes/${idSolicitud}/tramite`), cargarChecklist()]);
      if (t?.ok) setDatos(t);
      else setError(t?.msg || "No se pudo cargar tu expediente.");
    } catch {
      setError("No se pudo cargar tu expediente.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { setCargando(true); cargarTodo(); }, [idSolicitud]); // eslint-disable-line react-hooks/exhaustive-deps

  const def = datos?.definicion || null;
  const etapa = datos?.etapa ?? solicitudBase.etapa;
  const situacion = useMemo(() => (def ? situacionDe(def, etapa) : { indice: 0 }), [def, etapa]);
  const porPaso = useMemo(() => (def ? checklistPorPaso(def, checklist) : {}), [def, checklist]);

  const titulo = solicitudBase.titulo || def?.nombre || "Tu trámite";
  const pct = def ? (situacion.hecho ? 100 : Math.round((situacion.indice / def.pasos.length) * 100)) : 0;

  usePublicarCabecera({
    eyebrow: `Solicitud #${idSolicitud} · ${def?.etiqueta || ""}`.trim(),
    titulo,
    pct,
  });

  if (cargando) return <EsqueletoExpediente />;

  if (!def) {
    return (
      <div className="p-4">
        <p className="text-sm text-red-700">{error || "No se pudo cargar tu expediente."}</p>
      </div>
    );
  }

  // Los pasos, con su estado: hechos, el actual y los que vienen.
  const pasos = def.pasos.map((p, i) => {
    const items = porPaso[p.id] || [];
    const corregir = items.some((it) => ["observado", "rechazado"].includes(estadoDe(it)));
    const hecho = situacion.hecho || i < situacion.indice;
    const actual = !situacion.hecho && i === situacion.indice;
    return {
      id: p.id, num: i + 1, icono: p.icono, titulo: p.titulo, corto: p.corto,
      subtitulo: hecho ? "Hecho" : actual ? (situacion.pausa ? "En pausa" : "Ahora") : null,
      estado: corregir ? "warn" : hecho ? "ok" : actual ? "on" : "",
      badge: items.filter((it) => ["observado", "rechazado", "solicitado"].includes(estadoDe(it))).length,
    };
  });

  // Sin sección en la URL, se abre el paso en el que está.
  const activo = pasos.some((p) => p.id === seccion) ? seccion : def.pasos[situacion.indice].id;
  const indice = pasos.findIndex((p) => p.id === activo);
  const paso = def.pasos[indice];

  const leToca = calcularLeToca({ def, checklist, situacion, tramite: datos.tramite, derivados: datos.derivados });
  const itemsPaso = porPaso[activo] || [];
  const docsPaso = docsDelPaso(def, activo, checklist);
  const plazosPaso = (datos.derivados || []).filter((d) => d.paso === activo);
  const candidaturas = candidaturasDelPaso(def, activo, datos.candidaturas);
  const sinLeer = solicitudBase?.resumen?.mensajes_sin_leer || 0;
  const ultimo = indice === def.pasos.length - 1;

  const guia = def.guia ? (
    <a className="pnl-doc-guia ux-tap" href={def.guia} target="_blank" rel="noopener noreferrer">
      <Icono nombre="libro" size={16} />
      <span>
        <b>Guía del servicio</b>
        <small>Los pasos y los documentos, en PDF</small>
      </span>
    </a>
  ) : null;

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0">
      {error && (
        <div className="shrink-0 mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Móvil y tablet: la fila de pasos arriba. */}
      <div className="lg:hidden shrink-0 mb-3 space-y-3">
        <div className="pnl-solo-grande">
          <ExpedienteCabecera iniciales={inicialesDe(perfil?.nombre)} eyebrow={`Solicitud #${idSolicitud}`} titulo={titulo} linea={def.linea} pct={pct} />
        </div>
        <RutaPasos pasos={pasos} activo={activo} onIr={onSeccion} />
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:flex-1 lg:min-h-0">
        {/* Pantalla grande: cabecera, pasos y la guía, en la columna izquierda. */}
        <div className="hidden lg:flex w-[290px] shrink-0 flex-col gap-3 overflow-y-auto pr-0.5">
          <ExpedienteCabecera iniciales={inicialesDe(perfil?.nombre)} eyebrow={`Solicitud #${idSolicitud}`} titulo={titulo} linea={def.linea} pct={pct} />
          <RutaPasos pasos={pasos} activo={activo} onIr={onSeccion} vertical />
          {guia}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3 lg:min-h-0 lg:overflow-y-auto">
          <div key={`${activo}-titulo`} className="shrink-0 space-y-3 rp-entra">
            <TituloPaso paso={pasos[indice]} total={pasos.length} indice={indice + 1} />
            <LeToca
              tono={leToca.tono}
              icono={leToca.icono}
              etiqueta={leToca.etiqueta}
              texto={leToca.texto}
              onIr={leToca.seccion && leToca.seccion !== activo ? () => onSeccion(leToca.seccion) : null}
            />
            <NovedadesExpediente idSolicitud={idSolicitud} onIrSeccion={(s) => onSeccion(def.pasos.some((p) => p.id === s) ? s : null)} />
          </div>

          <div key={activo} className="pnl-entra flex flex-col gap-3">
            <CercoErrores clave={activo} donde={`panel/${def.clave}/${activo}`} onVolver={() => onSeccion(null)}>
              <section className="pnl-doc-paso" data-estado={pasos[indice].estado || "futuro"}>
                <p className="pnl-doc-eyebrow">Qué hacemos en este paso</p>
                <p>{paso.explica}</p>
                <p className="pnl-doc-eyebrow">Lo que te toca</p>
                <p>{paso.tuParte}</p>
              </section>

              {paso.ruta && <RutaMini ruta={paso.ruta} valor={datos.tramite?.[paso.ruta.campo]} />}

              <Plazos plazos={plazosPaso} />

              <CamposPaso
                idSolicitud={idSolicitud}
                campos={paso.campos || []}
                tramite={datos.tramite}
                onGuardado={(r) => setDatos((d) => ({ ...d, tramite: r.tramite, derivados: r.derivados }))}
              />

              <Candidaturas
                def={def}
                filas={candidaturas}
                idSolicitud={idSolicitud}
                pasoId={activo}
                onGuardado={(r) => setDatos((d) => ({ ...d, candidaturas: r.candidaturas }))}
              />

              <DocsDelPaso docs={docsPaso} />

              {itemsPaso.length > 0 && (
                <SeccionSiempreAbiertoCtx.Provider value={true}>
                  <ChecklistDocumentos
                    checklist={itemsPaso}
                    cargarTodo={cargarChecklist}
                    idSolicitud={idSolicitud}
                    numero={String(indice + 1)}
                    titulo="Sube tus documentos"
                    sectionId={`doc-${activo}`}
                    onIrAGuia={onIrAGuia}
                  />
                </SeccionSiempreAbiertoCtx.Provider>
              )}

              {/* Volantes, resguardos, credenciales, resoluciones: lo que
                  Inspira va consiguiendo. */}
              {paso.proceso && (
                <SeccionSiempreAbiertoCtx.Provider value={true}>
                  <SeccionPanel numero="·" titulo="Documentos del proceso" subtitulo="Lo que Inspira consigue por ti: volantes, resguardos, resoluciones" sectionId={`proc-${activo}`}>
                    <DocumentosProceso idSolicitud={idSolicitud} modo="cliente" />
                  </SeccionPanel>
                </SeccionSiempreAbiertoCtx.Provider>
              )}

              {/* Al cerrar con buen resultado: la encuesta (sale sola si toca). */}
              {(ultimo || situacion.hecho) && <EncuestaCierre idSolicitud={idSolicitud} servicio={titulo} />}

              {guia && <div className="lg:hidden">{guia}</div>}
            </CercoErrores>
          </div>
        </div>
      </div>

      <MensajesFlotante
        abierto={mensajesAbierto}
        onAbrir={() => setMensajesAbierto(true)}
        onCerrar={() => setMensajesAbierto(false)}
        sinLeer={sinLeer}
        idSolicitud={idSolicitud}
      />
    </div>
  );
}
