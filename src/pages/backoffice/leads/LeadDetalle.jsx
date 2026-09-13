// Ficha de un lead en panel lateral: contacto, etapa y responsable, próxima
// acción, anotar (nota o contacto), la historia y lo que trajo el formulario.
// Desde aquí se convierte en cliente (reutiliza el alta rápida) o se
// anonimiza.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Mail, MessageCircle, UserPlus, Trash2, ExternalLink } from "lucide-react";
import { boGET, boPATCH, boPOST, boDELETE } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { navigate } from "../../../services/navigate";
import { Boton, Chip, Campo, Esqueleto, Pill, Ventana } from "../ui";
import {
  ETAPAS, ETAPA, ORIGENES, TIPO_EVENTO, fechaHora, aInputLocal, enlaceWhatsapp, nombreDe,
} from "./leadsComun";

const OCULTOS = new Set(["_capturas", "_origenes", "backfill", "respuestas"]);

function valorLegible(v) {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) {
    return v.map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x))).join(", ") || "—";
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function Datos({ datos }) {
  if (!datos || typeof datos !== "object") return null;
  const respuestas = Array.isArray(datos.respuestas) ? datos.respuestas : [];
  const resto = Object.entries(datos).filter(([k, v]) => !OCULTOS.has(k) && v !== undefined);
  if (!respuestas.length && !resto.length) return null;
  return (
    <div className="ase-ld-bloque">
      <p className="ase-ld-bloque-t">Lo que trajo</p>
      {respuestas.length > 0 && (
        <ul style={{ margin: "0 0 10px", paddingLeft: 18, fontSize: 12.5, lineHeight: 1.5 }}>
          {respuestas.map((r, i) => (
            <li key={i}><b>{r.p}</b> {r.r}</li>
          ))}
        </ul>
      )}
      {resto.length > 0 && (
        <dl className="ase-ld-datos">
          {resto.map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <dt>{k.replace(/_/g, " ")}</dt>
              <dd>{valorLegible(v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default function LeadDetalle({ id, opciones, puedeEditar, puedeEliminar, onCerrar, onCambio }) {
  const [lead, setLead] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(null);

  const [etapaNueva, setEtapaNueva] = useState("");
  const [motivo, setMotivo] = useState("");
  const [accion, setAccion] = useState("");
  const [accionAt, setAccionAt] = useState("");
  const [tipoEvento, setTipoEvento] = useState("CONTACTO");
  const [textoEvento, setTextoEvento] = useState("");
  const [convertirAbierta, setConvertirAbierta] = useState(false);

  // El panel se monta con key={id}: cambiar de lead lo reinicia entero.
  useEffect(() => {
    let vivo = true;
    boGET(`/backoffice/leads/${id}`).then((r) => {
      if (!vivo) return;
      if (!r?.ok) { setError(r?.msg || "No se pudo abrir el lead"); return; }
      setLead(r.lead);
    });
    return () => { vivo = false; };
  }, [id]);

  // Cuando llega una versión nueva del lead, el formulario se pone al día en
  // el propio render (estado derivado del anterior), sin efecto en cascada.
  const marca = lead ? `${lead.id_lead}:${lead.updated_at}` : null;
  const [sincronizado, setSincronizado] = useState(null);
  if (lead && marca !== sincronizado) {
    setSincronizado(marca);
    setEtapaNueva(lead.etapa);
    setMotivo(lead.motivo_descarte || "");
    setAccion(lead.proxima_accion || "");
    setAccionAt(aInputLocal(lead.proxima_accion_at));
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !convertirAbierta) onCerrar(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCerrar, convertirAbierta]);

  /** Aplica la respuesta del servidor conservando los eventos si no vienen. */
  function aplicar(r) {
    setLead((prev) => ({ ...prev, ...r.lead, eventos: r.lead.eventos || prev?.eventos }));
    onCambio?.(r.lead);
  }

  async function recargarEventos() {
    const r = await boGET(`/backoffice/leads/${id}`);
    if (r?.ok) setLead(r.lead);
  }

  async function patch(body, clave) {
    setGuardando(clave);
    const r = await boPATCH(`/backoffice/leads/${id}`, body);
    setGuardando(null);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo guardar", "error"); return false; }
    aplicar(r);
    await recargarEventos();
    return true;
  }

  async function guardarEtapa() {
    if (etapaNueva === lead.etapa) return;
    if (etapaNueva === "DESCARTADO" && !motivo.trim()) {
      dialog.toast("Indica el motivo del descarte", "error");
      return;
    }
    const ok = await patch(
      etapaNueva === "DESCARTADO" ? { etapa: etapaNueva, motivo_descarte: motivo.trim() } : { etapa: etapaNueva },
      "etapa"
    );
    if (ok) dialog.toast("Etapa actualizada", "success");
  }

  async function anotar(e) {
    e.preventDefault();
    if (!textoEvento.trim()) return;
    setGuardando("evento");
    const r = await boPOST(`/backoffice/leads/${id}/eventos`, { tipo: tipoEvento, texto: textoEvento.trim() });
    setGuardando(null);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo guardar", "error"); return; }
    setTextoEvento("");
    aplicar(r);
  }

  async function anonimizar() {
    const ok = await dialog.confirm(
      "Se borran nombre, correo, WhatsApp, notas y la historia. Se conserva solo el dato estadístico (origen, etapa y fechas). No se puede deshacer.",
      "¿Anonimizar este lead?"
    );
    if (!ok) return;
    const r = await boDELETE(`/backoffice/leads/${id}`);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo anonimizar", "error"); return; }
    dialog.toast("Lead anonimizado", "success");
    onCambio?.(null);
    onCerrar();
  }

  const et = lead ? (ETAPA[lead.etapa] || ETAPAS[0]) : null;
  const wa = lead ? enlaceWhatsapp(lead.whatsapp) : null;
  const convertido = !!(lead?.convertido_at && lead?.id_cliente);
  const editable = puedeEditar && lead && !lead.anonimizado_en;

  return createPortal(
    // .ase aporta los tokens; su min-height/fondo no deben pintar nada aquí,
    // porque este envoltorio cuelga de <body> y solo contiene capas fijas.
    <div className="ase" style={{ minHeight: 0, background: "transparent" }}>
      <div className="ase-ld-fondo" onClick={onCerrar} aria-hidden="true" />
      <aside className="ase-ld-panel" role="dialog" aria-modal="true" aria-label="Ficha del lead">
        <header className="ase-ld-panel-cab">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {lead && <Chip tono={et.tono} punto>{et.etiqueta}</Chip>}
              {lead && <Chip tono="gris">{ORIGENES[lead.origen] || lead.origen}</Chip>}
              {lead && <span style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>#{lead.id_lead} · {fechaHora(lead.created_at)}</span>}
            </div>
            <button type="button" className="ase-ld-panel-x" onClick={onCerrar} aria-label="Cerrar">
              <X size={17} />
            </button>
          </div>
          <h2>{lead ? nombreDe(lead) : "…"}</h2>
          {lead && (
            <p>
              {[lead.servicio_interes, lead.pais, lead.origen_detalle].filter(Boolean).join(" · ") || "Sin más datos"}
              {lead.utm_source && ` · utm: ${[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ")}`}
            </p>
          )}
          {lead && (lead.email || wa) && (
            <div className="ase-ld-contacto">
              {lead.email && <a href={`mailto:${lead.email}`}><Mail size={13} /> {lead.email}</a>}
              {wa && <a href={wa} target="_blank" rel="noreferrer"><MessageCircle size={13} /> {lead.whatsapp}</a>}
            </div>
          )}
        </header>

        <div className="ase-ld-panel-cuerpo">
          {error && <div className="ase-ld-bloque" style={{ color: "var(--red)", fontSize: 13 }}>{error}</div>}
          {!lead && !error && <Esqueleto filas={4} alto={80} />}

          {lead && lead.anonimizado_en && (
            <div className="ase-ld-bloque" style={{ fontSize: 13, color: "var(--muted)" }}>
              Lead anonimizado el {fechaHora(lead.anonimizado_en)}. Solo queda el dato estadístico.
            </div>
          )}

          {lead && convertido && (
            <div className="ase-ld-bloque" style={{ borderColor: "rgba(29,106,74,.35)", background: "var(--green-soft)" }}>
              <p className="ase-ld-bloque-t" style={{ color: "var(--green)" }}>Cliente</p>
              <div style={{ fontSize: 13 }}>
                Convertido el {fechaHora(lead.convertido_at)} en {lead.cliente?.nombre || "el cliente"} (#{lead.id_cliente}).
              </div>
              <div style={{ marginTop: 8 }}>
                <Boton tono="secundario" tam="sm" icono={ExternalLink} onClick={() => navigate("/backoffice/clientes")}>
                  Ir a Clientes
                </Boton>
              </div>
            </div>
          )}

          {lead && !lead.anonimizado_en && (
            <div className="ase-ld-bloque">
              <p className="ase-ld-bloque-t">Embudo</p>
              <div className="ase-ld-dos">
                <Campo etiqueta="Etapa">
                  <select className="ase-campo" value={etapaNueva} disabled={!editable}
                    onChange={(e) => setEtapaNueva(e.target.value)}>
                    {ETAPAS.map((x) => <option key={x.valor} value={x.valor}>{x.etiqueta}</option>)}
                  </select>
                </Campo>
                <Campo etiqueta="Responsable">
                  <select className="ase-campo" value={lead.id_asesor ? String(lead.id_asesor) : ""} disabled={!editable || guardando === "asesor"}
                    onChange={(e) => patch({ id_asesor: e.target.value ? Number(e.target.value) : null }, "asesor")}>
                    <option value="">Sin asignar</option>
                    {(opciones?.asesores || []).map((a) => (
                      <option key={a.id_usuario} value={String(a.id_usuario)}>{a.nombre}</option>
                    ))}
                  </select>
                </Campo>
              </div>
              {(etapaNueva === "DESCARTADO" || lead.motivo_descarte) && (
                <Campo etiqueta="Motivo del descarte" style={{ marginTop: 8 }}>
                  <input className="ase-campo" value={motivo} disabled={!editable}
                    placeholder="Precio, se fue con otra asesoría, no responde…"
                    onChange={(e) => setMotivo(e.target.value)} />
                </Campo>
              )}
              {editable && etapaNueva !== lead.etapa && (
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Boton tam="sm" cargando={guardando === "etapa"} onClick={guardarEtapa}>
                    Pasar a {ETAPA[etapaNueva]?.etiqueta}
                  </Boton>
                  <Boton tam="sm" tono="fantasma" onClick={() => setEtapaNueva(lead.etapa)}>Cancelar</Boton>
                </div>
              )}
              {lead.primer_contacto_at ? (
                <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "10px 0 0" }}>
                  Primer contacto: {fechaHora(lead.primer_contacto_at)}
                </p>
              ) : (
                <p style={{ fontSize: 11.5, color: "var(--accent-2)", margin: "10px 0 0", fontWeight: 600 }}>
                  Nadie le ha contactado todavía.
                </p>
              )}
            </div>
          )}

          {lead && !lead.anonimizado_en && (
            <div className="ase-ld-bloque">
              <p className="ase-ld-bloque-t">Próxima acción</p>
              <div className="ase-ld-dos">
                <Campo etiqueta="Qué">
                  <input className="ase-campo" value={accion} disabled={!editable}
                    placeholder="Llamar, enviar propuesta…" onChange={(e) => setAccion(e.target.value)} />
                </Campo>
                <Campo etiqueta="Cuándo">
                  <input className="ase-campo" type="datetime-local" value={accionAt} disabled={!editable}
                    onChange={(e) => setAccionAt(e.target.value)} />
                </Campo>
              </div>
              {editable && (
                accion !== (lead.proxima_accion || "") || accionAt !== aInputLocal(lead.proxima_accion_at)
              ) && (
                <div style={{ marginTop: 10 }}>
                  <Boton tam="sm" cargando={guardando === "accion"} onClick={() => patch({
                    proxima_accion: accion.trim() || null,
                    proxima_accion_at: accionAt ? new Date(accionAt).toISOString() : null,
                  }, "accion")}>
                    Guardar próxima acción
                  </Boton>
                </div>
              )}
            </div>
          )}

          {lead && editable && (
            <form className="ase-ld-bloque" onSubmit={anotar}>
              <p className="ase-ld-bloque-t">Anotar</p>
              <div className="ase-pills" style={{ marginBottom: 8 }}>
                <Pill on={tipoEvento === "CONTACTO"} onClick={() => setTipoEvento("CONTACTO")}>Hablé con la persona</Pill>
                <Pill on={tipoEvento === "NOTA"} onClick={() => setTipoEvento("NOTA")}>Nota interna</Pill>
              </div>
              <textarea className="ase-campo" rows={3} value={textoEvento}
                placeholder={tipoEvento === "CONTACTO" ? "Por dónde y qué se habló" : "Apunte para el equipo"}
                onChange={(e) => setTextoEvento(e.target.value)} />
              <div style={{ marginTop: 8 }}>
                <Boton type="submit" tam="sm" cargando={guardando === "evento"} disabled={!textoEvento.trim()}>
                  Guardar
                </Boton>
              </div>
            </form>
          )}

          {lead && (
            <div className="ase-ld-bloque">
              <p className="ase-ld-bloque-t">Historia</p>
              {(lead.eventos || []).length === 0 ? (
                <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>Sin movimientos.</p>
              ) : (
                <ul className="ase-ld-linea">
                  {lead.eventos.map((ev) => (
                    <li key={ev.id} style={{ "--ld-color": ev.tipo === "CONTACTO" ? "#1d6a4a" : ev.tipo === "NOTA" ? "#b9770e" : ev.tipo === "CONVERSION" ? "#fa943a" : "#4e9ee8" }}>
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

          {lead && !lead.anonimizado_en && <Datos datos={lead.datos} />}

          {lead && !lead.anonimizado_en && (puedeEditar || puedeEliminar) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
              {puedeEditar && !convertido ? (
                <Boton tono="cta" icono={UserPlus} onClick={() => setConvertirAbierta(true)}>
                  Convertir en cliente
                </Boton>
              ) : <span />}
              {puedeEliminar && (
                <Boton tono="peligro" tam="sm" icono={Trash2} onClick={anonimizar}>Anonimizar</Boton>
              )}
            </div>
          )}
        </div>
      </aside>

      {lead && convertirAbierta && (
        <Convertir
          abierta
          lead={lead}
          opciones={opciones}
          onCerrar={() => setConvertirAbierta(false)}
          onHecho={(r) => {
            setConvertirAbierta(false);
            aplicar(r);
            recargarEventos();
          }}
        />
      )}
    </div>,
    document.body
  );
}

/** Convertir en cliente: el mismo alta rápida, con los datos del lead. */
function Convertir({ abierta, lead, opciones, onCerrar, onHecho }) {
  const [paquetes, setPaquetes] = useState({});
  const [servicio, setServicio] = useState("master");
  const [paquete, setPaquete] = useState("");
  const [email, setEmail] = useState(lead.email || "");
  const [nombre, setNombre] = useState(lead.nombre || "");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  // Se monta solo abierta, así que el estado inicial ya sale del lead.
  useEffect(() => {
    let vivo = true;
    boGET("/backoffice/alta-rapida/opciones").then((r) => {
      if (vivo && r?.ok) setPaquetes(r.paquetes || {});
    });
    return () => { vivo = false; };
  }, []);

  async function enviar() {
    setEnviando(true);
    const r = await boPOST(`/backoffice/leads/${lead.id_lead}/convertir`, {
      servicio, paquete: paquete || undefined, email_contacto: email.trim(), nombre: nombre.trim(), notas: notas.trim() || undefined,
    });
    setEnviando(false);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo convertir", "error"); return; }
    setResultado(r);
    dialog.toast(r.msg || "Cliente creado", "success");
    onHecho(r);
  }

  const servicios = opciones?.servicios || [];

  return (
    <Ventana
      abierta={abierta}
      onCerrar={onCerrar}
      titulo="Convertir en cliente"
      subtitulo="Crea el cliente y su proceso en un paso (si el correo ya existe, se le añade el proceso) y se le envía el instructivo de acceso."
      pie={
        resultado ? (
          <>
            <Boton tono="secundario" onClick={onCerrar}>Cerrar</Boton>
            <Boton onClick={() => navigate(`/backoffice/solicitudes/${resultado.id_solicitud}`)}>Abrir el proceso</Boton>
          </>
        ) : (
          <>
            <Boton tono="fantasma" onClick={onCerrar}>Cancelar</Boton>
            <Boton tono="cta" cargando={enviando} disabled={!email.trim() || !nombre.trim() || !servicio} onClick={enviar}>
              Crear cliente y proceso
            </Boton>
          </>
        )
      }
    >
      {resultado ? (
        <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>
          {resultado.msg} El instructivo sale a <b>{resultado.correo_instructivo}</b>.
          {resultado.aviso_correo && <><br /><span style={{ color: "var(--amber)" }}>{resultado.aviso_correo}</span></>}
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <Campo etiqueta="Nombre">
            <input className="ase-campo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </Campo>
          <Campo etiqueta="Correo (a donde llega el acceso)">
            <input className="ase-campo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Campo>
          <div className="ase-ld-dos">
            <Campo etiqueta="Servicio">
              <select className="ase-campo" value={servicio} onChange={(e) => { setServicio(e.target.value); setPaquete(""); }}>
                {servicios.map((s) => <option key={s.clave} value={s.clave}>{s.etiqueta}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Paquete">
              <select className="ase-campo" value={paquete} onChange={(e) => setPaquete(e.target.value)}>
                <option value="">Sin paquete</option>
                {(paquetes[servicio] || []).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Campo>
          </div>
          <Campo etiqueta="Nota para el expediente (opcional)">
            <textarea className="ase-campo" rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} />
          </Campo>
        </div>
      )}
    </Ventana>
  );
}
