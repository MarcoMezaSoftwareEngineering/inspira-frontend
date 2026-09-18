// Ficha de una tarea en panel lateral: el estado con un toque, responsable,
// fecha y prioridad, qué hay que hacer, área y vínculo, archivos y enlaces,
// comentarios e historia. Se abre con ?tarea=ID, que es el enlace de los correos.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, ExternalLink, Check, Play, RotateCcw } from "lucide-react";
import { boGET, boPATCH, boPOST, boDELETE } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { navigate } from "../../../services/navigate";
import { Boton, Chip, Campo, Esqueleto, Pill } from "../ui";
import BuscarVinculo from "./BuscarVinculo";
import AdjuntosTarea from "./AdjuntosTarea";
import RevisionRapida from "../comun/RevisionRapida";
import {
  CATEGORIAS, CATEGORIA, CON_SERVICIO, ESTADO, PRIORIDADES, PRIORIDAD,
  textoVence, fechaHora, diaDesdeHoy, avisarCambioTareas,
} from "./tareasComun";

const TIPO_EVENTO = {
  CREADA: "Creada", COMENTARIO: "Comentario", ESTADO: "Estado", ASIGNACION: "Responsable",
  FECHA: "Fecha límite", PRIORIDAD: "Prioridad", EDICION: "Edición", ADJUNTO: "Adjunto",
};
const COLOR_EVENTO = { ADJUNTO: "#4e9ee8", COMENTARIO: "#1d6a4a", ESTADO: "#fa943a", ASIGNACION: "#7d3c98", CREADA: "#02506b" };

function BotonesEstado({ estado, guardando, onCambiar }) {
  const hecha = (
    <Boton tam="sm" tono="cta" icono={Check} cargando={guardando === "HECHA"} onClick={() => onCambiar("HECHA")}>
      Marcar hecha
    </Boton>
  );
  const descartar = (
    <Boton tam="sm" tono="fantasma" cargando={guardando === "DESCARTADA"} onClick={() => onCambiar("DESCARTADA")}>
      Descartar
    </Boton>
  );
  if (estado === "PENDIENTE") {
    return (
      <>
        <Boton tam="sm" icono={Play} cargando={guardando === "EN_CURSO"} onClick={() => onCambiar("EN_CURSO")}>Empezar</Boton>
        {hecha}
        {descartar}
      </>
    );
  }
  if (estado === "EN_CURSO") {
    return (
      <>
        {hecha}
        <Boton tam="sm" tono="secundario" cargando={guardando === "PENDIENTE"} onClick={() => onCambiar("PENDIENTE")}>
          Volver a pendiente
        </Boton>
        {descartar}
      </>
    );
  }
  return (
    <Boton tam="sm" tono="secundario" icono={RotateCcw} cargando={guardando === "PENDIENTE"} onClick={() => onCambiar("PENDIENTE")}>
      Reabrir
    </Boton>
  );
}

export default function TareaDetalle({ id, opciones, onCerrar, onCambio }) {
  const [tarea, setTarea] = useState(null);
  const [revisando, setRevisando] = useState(false);
  const [permisos, setPermisos] = useState({});
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [area, setArea] = useState({ categoria: "", servicio: "", subservicio: "" });
  const [comentario, setComentario] = useState("");

  // El panel se monta con key={id}: cambiar de tarea lo reinicia entero.
  useEffect(() => {
    let vivo = true;
    boGET(`/backoffice/tareas/${id}`).then((r) => {
      if (!vivo) return;
      if (!r?.ok) { setError(r?.msg || "No se pudo abrir la tarea"); return; }
      setTarea(r.tarea);
      setPermisos(r.permisos || {});
    });
    return () => { vivo = false; };
  }, [id]);

  // Cuando llega una versión nueva, el formulario se pone al día en el propio
  // render (estado derivado del anterior), sin efecto en cascada.
  const marca = tarea ? `${tarea.id_tarea}:${tarea.updated_at}` : null;
  const [sincronizado, setSincronizado] = useState(null);
  if (tarea && marca !== sincronizado) {
    setSincronizado(marca);
    setTitulo(tarea.titulo);
    setDescripcion(tarea.descripcion || "");
    setFecha(tarea.dia_vence || "");
    setArea({ categoria: tarea.categoria, servicio: tarea.servicio || "", subservicio: tarea.subservicio || "" });
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCerrar]);

  async function traer() {
    const r = await boGET(`/backoffice/tareas/${id}`);
    if (r?.ok) {
      setTarea(r.tarea);
      setPermisos(r.permisos || {});
    }
  }

  function avisarFuera() {
    onCambio?.();
    avisarCambioTareas();
  }

  async function patch(body, clave, mensaje) {
    setGuardando(clave);
    const r = await boPATCH(`/backoffice/tareas/${id}`, body);
    if (!r?.ok) {
      setGuardando(null);
      dialog.toast(r?.msg || "No se pudo guardar", "error");
      return false;
    }
    await traer();
    setGuardando(null);
    avisarFuera();
    if (mensaje) dialog.toast(mensaje, "success");
    return true;
  }

  function cambiarEstado(estado) {
    const mensajes = { HECHA: "Tarea hecha", DESCARTADA: "Tarea descartada", PENDIENTE: null, EN_CURSO: null };
    patch({ estado }, estado, mensajes[estado]);
  }

  function guardarFecha(valor) {
    if (!tarea || valor === (tarea.dia_vence || "")) return;
    patch({ vence_el: valor || null }, "fecha");
  }

  async function comentar(e) {
    e.preventDefault();
    const texto = comentario.trim();
    if (!texto) return;
    setGuardando("comentario");
    const r = await boPOST(`/backoffice/tareas/${id}/comentarios`, { texto });
    setGuardando(null);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo guardar", "error"); return; }
    setComentario("");
    setTarea(r.tarea);
    avisarFuera();
  }

  async function borrar() {
    const ok = await dialog.confirm(
      "La tarea y su historia se borran para todo el equipo. No se puede deshacer.",
      "¿Borrar esta tarea?"
    );
    if (!ok) return;
    const r = await boDELETE(`/backoffice/tareas/${id}`);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo borrar", "error"); return; }
    dialog.toast("Tarea borrada", "success");
    avisarFuera();
    onCerrar();
  }

  const etiquetaServicio = (clave) => (opciones?.servicios || []).find((s) => s.clave === clave)?.etiqueta || clave;

  const cat = tarea ? (CATEGORIA[tarea.categoria] || CATEGORIAS[CATEGORIAS.length - 1]) : null;
  const est = tarea ? ESTADO[tarea.estado] : null;
  const pri = tarea ? PRIORIDAD[tarea.prioridad] : null;

  const conServicio = CON_SERVICIO.has(area.categoria);
  const areaCambiada = !!tarea && (
    area.categoria !== tarea.categoria
    || (area.servicio || null) !== (tarea.servicio || null)
    || (area.subservicio || null) !== (tarea.subservicio || null)
  );
  const areaValida = !conServicio || (!!area.servicio && (area.categoria !== "SUBSERVICIOS" || !!area.subservicio));
  const textoCambiado = !!tarea && (titulo.trim() !== tarea.titulo || descripcion.trim() !== (tarea.descripcion || ""));

  const tipoVinculo = tarea?.categoria === "LEADS" ? "lead" : CON_SERVICIO.has(tarea?.categoria) ? "solicitud" : null;
  let vinculo = null;
  if (tarea?.lead) {
    vinculo = {
      tipo: "lead", id: tarea.lead.id_lead,
      titulo: tarea.lead.nombre || tarea.lead.email || tarea.lead.whatsapp || `Lead #${tarea.lead.id_lead}`,
      detalle: tarea.lead.email || tarea.lead.whatsapp || "",
    };
  } else if (tarea?.solicitud) {
    vinculo = {
      tipo: "solicitud", id: tarea.solicitud.id_solicitud,
      titulo: tarea.solicitud.cliente?.nombre || `Expediente #${tarea.solicitud.id_solicitud}`,
      detalle: [etiquetaServicio(tarea.solicitud.panel_servicio), tarea.solicitud.paquete_panel].filter(Boolean).join(" · "),
    };
  }
  const tipoBloqueVinculo = vinculo?.tipo || tipoVinculo;

  const equipo = opciones?.equipo || [];
  const asignadoFuera = tarea?.asignado && !equipo.some((u) => u.id_usuario === tarea.id_asignado);

  return createPortal(
    // .ase aporta los tokens; su min-height/fondo no deben pintar nada aquí,
    // porque este envoltorio cuelga de <body> y solo contiene capas fijas.
    <div className="ase" style={{ minHeight: 0, background: "transparent" }}>
      <div className="ase-ld-fondo" onClick={onCerrar} aria-hidden="true" />
      <aside className="ase-ld-panel" role="dialog" aria-modal="true" aria-label="Ficha de la tarea">
        <header className="ase-ld-panel-cab">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {tarea && <Chip tono={est?.tono || "gris"} punto>{est?.etiqueta || tarea.estado}</Chip>}
              {tarea && <Chip tono={cat.tono}>{cat.etiqueta}</Chip>}
              {tarea && pri && <Chip tono={pri.tono}>{pri.etiqueta}</Chip>}
              {tarea && <span style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>#{tarea.id_tarea}</span>}
            </div>
            <button type="button" className="ase-ld-panel-x" onClick={onCerrar} aria-label="Cerrar">
              <X size={17} />
            </button>
          </div>
          <h2>{tarea ? tarea.titulo : "…"}</h2>
          {tarea && (
            <p>
              {[
                tarea.asignado?.nombre ? `Para ${tarea.asignado.nombre}` : "Sin asignar",
                textoVence(tarea) || "sin fecha límite",
                tarea.creador?.nombre ? `creada por ${tarea.creador.nombre}, ${fechaHora(tarea.created_at)}` : null,
              ].filter(Boolean).join(" · ")}
            </p>
          )}
        </header>

        <div className="ase-ld-panel-cuerpo">
          {error && <div className="ase-ld-bloque" style={{ color: "var(--red)", fontSize: 13 }}>{error}</div>}
          {!tarea && !error && <Esqueleto filas={4} alto={80} />}

          {tarea && (
            <div className="ase-ld-bloque">
              <p className="ase-ld-bloque-t">Estado</p>
              <div className="ase-tr-estados">
                <BotonesEstado estado={tarea.estado} guardando={guardando} onCambiar={cambiarEstado} />
              </div>
              {!tarea.abierta && tarea.completada_at && (
                <p className="ase-tr-completada" data-estado={tarea.estado}>
                  {tarea.estado === "HECHA" ? "Hecha" : "Descartada"} el {fechaHora(tarea.completada_at)}
                </p>
              )}
            </div>
          )}

          {tarea && (
            <div className="ase-ld-bloque">
              <p className="ase-ld-bloque-t">Responsable y plazo</p>
              <div className="ase-ld-dos">
                <Campo etiqueta="Responsable">
                  {permisos.asignar ? (
                    <select
                      className="ase-campo"
                      value={tarea.id_asignado ? String(tarea.id_asignado) : ""}
                      disabled={guardando === "asignado"}
                      onChange={(e) => patch(
                        { id_asignado: e.target.value ? Number(e.target.value) : null },
                        "asignado",
                        "Responsable cambiado"
                      )}
                    >
                      <option value="">Sin asignar</option>
                      {asignadoFuera && <option value={String(tarea.id_asignado)}>{tarea.asignado.nombre}</option>}
                      {equipo.map((u) => <option key={u.id_usuario} value={String(u.id_usuario)}>{u.nombre}</option>)}
                    </select>
                  ) : (
                    <input className="ase-campo" value={tarea.asignado?.nombre || "Sin asignar"} disabled />
                  )}
                </Campo>
                <Campo etiqueta="Fecha límite">
                  <input
                    className="ase-campo" type="date" value={fecha}
                    disabled={guardando === "fecha"}
                    onChange={(e) => setFecha(e.target.value)}
                    onBlur={() => guardarFecha(fecha)}
                    onKeyDown={(e) => { if (e.key === "Enter") guardarFecha(fecha); }}
                  />
                </Campo>
              </div>
              <div className="ase-pills" style={{ marginTop: 8 }}>
                {[["Hoy", 0], ["Mañana", 1], ["En una semana", 7]].map(([l, dias]) => {
                  const dia = diaDesdeHoy(dias);
                  return (
                    <Pill key={l} on={tarea.dia_vence === dia} onClick={() => guardarFecha(dia)}>{l}</Pill>
                  );
                })}
                {tarea.dia_vence && <Pill on={false} onClick={() => guardarFecha("")}>Sin fecha</Pill>}
              </div>
              <div style={{ marginTop: 12 }}>
                <span className="ase-etiqueta">Prioridad</span>
                <div className="ase-pills">
                  {PRIORIDADES.map((p) => (
                    <Pill
                      key={p.valor} on={tarea.prioridad === p.valor}
                      onClick={() => { if (p.valor !== tarea.prioridad) patch({ prioridad: p.valor }, "prioridad"); }}
                    >
                      {p.etiqueta}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tarea && (
            <div className="ase-ld-bloque">
              <p className="ase-ld-bloque-t">Qué hay que hacer</p>
              <Campo etiqueta="Título">
                <input className="ase-campo" maxLength={200} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </Campo>
              <Campo etiqueta="Detalle" style={{ marginTop: 8 }}>
                <textarea
                  className="ase-campo" rows={4} value={descripcion}
                  placeholder="Pasos, enlaces o lo que haga falta saber"
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </Campo>
              {textoCambiado && (
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Boton
                    tam="sm" cargando={guardando === "texto"} disabled={!titulo.trim()}
                    onClick={() => patch({ titulo: titulo.trim(), descripcion: descripcion.trim() || null }, "texto", "Guardado")}
                  >
                    Guardar
                  </Boton>
                  <Boton tam="sm" tono="fantasma" onClick={() => { setTitulo(tarea.titulo); setDescripcion(tarea.descripcion || ""); }}>
                    Deshacer
                  </Boton>
                </div>
              )}
            </div>
          )}

          {tarea && (
            <div className="ase-ld-bloque">
              <p className="ase-ld-bloque-t">Área</p>
              <div className="ase-tr-areas-elegir" role="group" aria-label="Área">
                {CATEGORIAS.map((c) => {
                  const Icono = c.icono;
                  return (
                    <button
                      key={c.valor} type="button" className="ase-tr-area-op"
                      data-on={area.categoria === c.valor ? "1" : "0"}
                      aria-pressed={area.categoria === c.valor}
                      style={{ "--tr-color": c.color }}
                      onClick={() => setArea((a) => ({
                        categoria: c.valor,
                        servicio: CON_SERVICIO.has(c.valor) ? a.servicio : "",
                        subservicio: c.valor === "SUBSERVICIOS" ? a.subservicio : "",
                      }))}
                    >
                      <Icono size={15} strokeWidth={2.1} /> {c.etiqueta}
                    </button>
                  );
                })}
              </div>
              {conServicio && (
                <div className="ase-ld-dos" style={{ marginTop: 8 }}>
                  <Campo etiqueta="Servicio">
                    <select
                      className="ase-campo" value={area.servicio}
                      onChange={(e) => setArea((a) => ({ ...a, servicio: e.target.value, subservicio: "" }))}
                    >
                      <option value="">Elige…</option>
                      {(opciones?.servicios || []).map((s) => <option key={s.clave} value={s.clave}>{s.etiqueta}</option>)}
                    </select>
                  </Campo>
                  {area.categoria === "SUBSERVICIOS" && (
                    <Campo etiqueta="Sub servicio (paquete)">
                      <select
                        className="ase-campo" value={area.subservicio} disabled={!area.servicio}
                        onChange={(e) => setArea((a) => ({ ...a, subservicio: e.target.value }))}
                      >
                        <option value="">{area.servicio ? "Elige…" : "Primero el servicio"}</option>
                        {(opciones?.paquetes?.[area.servicio] || []).map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </Campo>
                  )}
                </div>
              )}
              {!areaCambiada && tarea.servicio && (
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 0" }}>
                  {etiquetaServicio(tarea.servicio)}{tarea.subservicio ? ` · ${tarea.subservicio}` : ""}
                </p>
              )}
              {areaCambiada && (
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Boton
                    tam="sm" disabled={!areaValida} cargando={guardando === "area"}
                    onClick={() => patch({
                      categoria: area.categoria,
                      servicio: conServicio ? area.servicio : null,
                      subservicio: area.categoria === "SUBSERVICIOS" ? area.subservicio : null,
                    }, "area", "Área cambiada")}
                  >
                    Guardar área
                  </Boton>
                  <Boton
                    tam="sm" tono="fantasma"
                    onClick={() => setArea({ categoria: tarea.categoria, servicio: tarea.servicio || "", subservicio: tarea.subservicio || "" })}
                  >
                    Deshacer
                  </Boton>
                </div>
              )}
            </div>
          )}

          {tarea && tipoBloqueVinculo && (
            <div className="ase-ld-bloque">
              <p className="ase-ld-bloque-t">{tipoBloqueVinculo === "lead" ? "Lead" : "Expediente"}</p>
              <BuscarVinculo
                tipo={tipoBloqueVinculo}
                valor={vinculo}
                disabled={guardando === "vinculo"}
                onElegir={(v) => patch(
                  tipoBloqueVinculo === "lead" ? { id_lead: v ? v.id : null } : { id_solicitud: v ? v.id : null },
                  "vinculo"
                )}
              />
              {vinculo && (
                <div style={{ marginTop: 8 }}>
                  <Boton
                    tam="sm" tono="secundario" icono={ExternalLink}
                    onClick={() => navigate(vinculo.tipo === "lead"
                      ? `/backoffice/leads?lead=${vinculo.id}`
                      : `/backoffice/solicitudes/${vinculo.id}`)}
                  >
                    {vinculo.tipo === "lead" ? "Abrir el lead" : "Abrir el expediente"}
                  </Boton>
                  {tarea?.regla === "rev" && tarea?.id_solicitud && (
                    <Boton tam="sm" icono={Check} onClick={() => setRevisando(true)} style={{ marginLeft: 6 }}>
                      Revisar ahora
                    </Boton>
                  )}
                  {revisando && <RevisionRapida idSolicitud={tarea.id_solicitud} onCerrar={() => setRevisando(false)} />}
                </div>
              )}
            </div>
          )}

          {tarea && (
            <AdjuntosTarea
              tarea={tarea}
              yo={opciones?.yo?.id_usuario}
              puedeBorrarTarea={!!permisos.borrar}
              onTarea={(t) => { setTarea(t); avisarFuera(); }}
            />
          )}

          {tarea && (
            <form className="ase-ld-bloque" onSubmit={comentar}>
              <p className="ase-ld-bloque-t">Comentar</p>
              <textarea
                className="ase-campo" rows={3} value={comentario}
                placeholder="Avance, duda o lo que falta"
                onChange={(e) => setComentario(e.target.value)}
              />
              <div style={{ marginTop: 8 }}>
                <Boton type="submit" tam="sm" cargando={guardando === "comentario"} disabled={!comentario.trim()}>
                  Guardar comentario
                </Boton>
              </div>
            </form>
          )}

          {tarea && (
            <div className="ase-ld-bloque">
              <p className="ase-ld-bloque-t">Historia</p>
              {(tarea.eventos || []).length === 0 ? (
                <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>Sin movimientos.</p>
              ) : (
                <ul className="ase-ld-linea">
                  {tarea.eventos.map((ev) => (
                    <li key={ev.id} style={{ "--ld-color": COLOR_EVENTO[ev.tipo] || "#4e9ee8" }}>
                      <div className="ase-ld-linea-t">{ev.texto}</div>
                      <div className="ase-ld-linea-m">
                        {TIPO_EVENTO[ev.tipo] || ev.tipo} · {fechaHora(ev.created_at)}{ev.autor ? ` · ${ev.autor}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tarea && permisos.borrar && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Boton tono="peligro" tam="sm" icono={Trash2} onClick={borrar}>Borrar tarea</Boton>
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
}
