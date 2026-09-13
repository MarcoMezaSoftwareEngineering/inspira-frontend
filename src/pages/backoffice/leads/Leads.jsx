// La bandeja de leads de Inspira Core.
//
// Toda persona interesada que aún no es cliente, venga de donde venga
// (asistente, calculadora, presupuesto web, reserva de sesión, WhatsApp, alta
// manual), en un solo sitio. Arriba el embudo con sus cifras; debajo, el
// tablero por etapa (se arrastra una tarjeta para cambiarla de columna) o la
// tabla. La ficha se abre en un panel lateral y su id va en la URL
// (?lead=ID), para poder mandar el enlace a otra persona del equipo.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, List, Plus, RefreshCw, Search, Clock } from "lucide-react";
import { boGET, boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { useAuth } from "../context/AuthContext";
import { Pagina, Cabecera, Cuerpo, Boton, Chip, Vacio, Esqueleto } from "../ui";
import LeadDetalle from "./LeadDetalle";
import LeadAlta from "./LeadAlta";
import { ETAPAS, ETAPA, ORIGENES, haceCuanto, fechaHora, nombreDe } from "./leadsComun";
import "../../../styles/leads-core.css";

const CLAVE_VISTA = "bo_leads_vista";

function leerLeadDeUrl() {
  const id = Number(new URLSearchParams(window.location.search).get("lead"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

function escribirLeadEnUrl(id) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("lead", String(id));
  else url.searchParams.delete("lead");
  window.history.replaceState(window.history.state, "", url.pathname + url.search);
}

function Tarjeta({ lead, onAbrir, arrastrable, onArrastre }) {
  const [arrastrando, setArrastrando] = useState(false);
  const vencida = lead.proxima_accion_at && new Date(lead.proxima_accion_at) < new Date();
  return (
    <button
      type="button"
      className="ase-ld-card"
      data-alerta={lead.sin_responder ? "1" : "0"}
      data-arrastrando={arrastrando ? "1" : "0"}
      draggable={arrastrable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(lead.id_lead));
        e.dataTransfer.effectAllowed = "move";
        setArrastrando(true);
        onArrastre?.(lead.id_lead);
      }}
      onDragEnd={() => { setArrastrando(false); onArrastre?.(null); }}
      onClick={() => onAbrir(lead.id_lead)}
    >
      <div className="ase-ld-card-n">{nombreDe(lead)}</div>
      <div className="ase-ld-card-s">
        {lead.servicio_interes || lead.origen_detalle || lead.email || lead.whatsapp || "—"}
      </div>
      {lead.proxima_accion && (
        <div className="ase-ld-card-accion" data-vencida={vencida ? "1" : "0"}>
          → {lead.proxima_accion}{lead.proxima_accion_at ? ` · ${fechaHora(lead.proxima_accion_at)}` : ""}
        </div>
      )}
      <div className="ase-ld-card-pie">
        <Chip tono="gris">{ORIGENES[lead.origen] || lead.origen}</Chip>
        <span className="ase-ld-card-f">
          {lead.sin_responder && <Clock size={10} style={{ verticalAlign: "-1px", marginRight: 3, color: "var(--accent)" }} />}
          {lead.asesor?.nombre ? `${lead.asesor.nombre.split(" ")[0]} · ` : ""}{haceCuanto(lead.created_at)}
        </span>
      </div>
    </button>
  );
}

export default function Leads() {
  const { hasPermission, user } = useAuth();
  const puedeEditar = hasPermission("leads.editar");
  const puedeEliminar = hasPermission("leads.eliminar");

  const [vista, setVista] = useState(() => {
    try { return localStorage.getItem(CLAVE_VISTA) || "tablero"; } catch { return "tablero"; }
  });
  const [leads, setLeads] = useState(null);
  const [embudo, setEmbudo] = useState(null);
  const [opciones, setOpciones] = useState(null);
  const [error, setError] = useState(null);

  const [texto, setTexto] = useState("");
  const [textoAplicado, setTextoAplicado] = useState("");
  const [origen, setOrigen] = useState("");
  const [asesor, setAsesor] = useState("");
  const [sinResponder, setSinResponder] = useState(false);
  const [etapaFiltro, setEtapaFiltro] = useState("");

  const [abierto, setAbierto] = useState(leerLeadDeUrl);
  const [altaAbierta, setAltaAbierta] = useState(false);
  const [sobre, setSobre] = useState(null);
  const arrastrado = useRef(null);

  // Búsqueda con respiro: no se pide a la API en cada tecla.
  useEffect(() => {
    const t = setTimeout(() => setTextoAplicado(texto.trim()), 300);
    return () => clearTimeout(t);
  }, [texto]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (textoAplicado) p.set("texto", textoAplicado);
    if (origen) p.set("origen", origen);
    if (asesor) p.set("asesor", asesor);
    if (sinResponder) p.set("sin_responder", "1");
    return p.toString();
  }, [textoAplicado, origen, asesor, sinResponder]);

  const pedir = useCallback(() => Promise.all([
    boGET(`/backoffice/leads?${query}`),
    boGET(`/backoffice/leads/embudo?${query}`),
  ]), [query]);

  const aplicarCarga = useCallback(([l, e]) => {
    if (!l?.ok) {
      setError(l?.msg || "No se pudieron cargar los leads.");
      setLeads([]);
    } else {
      setError(null);
      setLeads(l.leads);
    }
    if (e?.ok) setEmbudo(e);
  }, []);

  /** Recarga a mano (botón, tras un alta o una anonimización). */
  const cargar = useCallback(() => pedir().then(aplicarCarga), [pedir, aplicarCarga]);

  // Carga al montar y al cambiar filtros. Si llega tarde la respuesta de un
  // filtro anterior, se descarta.
  useEffect(() => {
    let vivo = true;
    pedir().then((r) => { if (vivo) aplicarCarga(r); });
    return () => { vivo = false; };
  }, [pedir, aplicarCarga]);

  useEffect(() => {
    boGET("/backoffice/leads/opciones").then((r) => { if (r?.ok) setOpciones(r); });
  }, []);

  const abrir = (id) => { setAbierto(id); escribirLeadEnUrl(id); };
  const cerrar = () => { setAbierto(null); escribirLeadEnUrl(null); };

  const cambiarVista = (v) => {
    setVista(v);
    try { localStorage.setItem(CLAVE_VISTA, v); } catch { /* sin almacenamiento */ }
  };

  /** Cuando la ficha cambia algo, se refleja en la lista sin recargar todo. */
  const alCambiar = (lead) => {
    if (!lead) { cargar(); return; }
    setLeads((ls) => (ls || []).map((x) => (x.id_lead === lead.id_lead ? { ...x, ...lead } : x)));
    boGET(`/backoffice/leads/embudo?${query}`).then((e) => { if (e?.ok) setEmbudo(e); });
  };

  async function soltarEn(etapa, id) {
    const lead = (leads || []).find((x) => x.id_lead === id);
    if (!lead || lead.etapa === etapa) return;
    const body = { etapa };
    if (etapa === "DESCARTADO") {
      const motivo = await dialog.prompt("¿Por qué se descarta este lead?", "", "Motivo del descarte");
      if (!motivo || !motivo.trim()) return;
      body.motivo_descarte = motivo.trim();
    }
    const antes = leads;
    setLeads((ls) => ls.map((x) => (x.id_lead === id ? { ...x, etapa, sin_responder: false } : x)));
    const r = await boPATCH(`/backoffice/leads/${id}`, body);
    if (!r?.ok) {
      setLeads(antes);
      dialog.toast(r?.msg || "No se pudo cambiar la etapa", "error");
      return;
    }
    alCambiar(r.lead);
  }

  const visibles = useMemo(
    () => (leads || []).filter((l) => !etapaFiltro || l.etapa === etapaFiltro),
    [leads, etapaFiltro]
  );
  const porEtapa = useMemo(() => {
    const m = Object.fromEntries(ETAPAS.map((e) => [e.valor, []]));
    visibles.forEach((l) => { (m[l.etapa] || (m[l.etapa] = [])).push(l); });
    return m;
  }, [visibles]);

  const totalEmbudo = embudo?.total || 0;
  const maxEtapa = Math.max(1, ...ETAPAS.map((e) => embudo?.etapas?.[e.valor] || 0));
  const nombre = (user?.nombre || "").split(" ")[0];

  const stats = [
    { n: embudo?.abiertos || 0, l: "abiertos" },
    {
      n: embudo?.sin_responder || 0, l: "sin responder +24 h",
      tono: embudo?.sin_responder ? "alerta" : undefined,
      onClick: () => setSinResponder((v) => !v),
    },
    { n: embudo?.etapas?.CONTRATADO || 0, l: "contratados", tono: "ok" },
    { n: `${(embudo?.conversion || 0).toLocaleString("es-ES")} %`, l: "conversión" },
    { n: embudo?.clics_30d?.WHATSAPP || 0, l: "clics WhatsApp · 30 d", tono: "cielo" },
  ];

  const columnas = etapaFiltro ? ETAPAS.filter((e) => e.valor === etapaFiltro) : ETAPAS;

  return (
    <Pagina>
      <Cabecera
        eyebrow="Leads"
        titulo={nombre ? `Quién quiere empezar, ${nombre}` : "Quién quiere empezar"}
        subtitulo="Todo interesado en un solo sitio: asistente, calculadora, presupuesto web, reservas, WhatsApp y altas a mano. Lo que lleva más de un día sin respuesta sale marcado."
        acciones={
          <>
            {puedeEditar && (
              <Boton tono="cta" icono={Plus} onClick={() => setAltaAbierta(true)}>Nuevo lead</Boton>
            )}
            <Boton tono="cristal" icono={RefreshCw} onClick={cargar} aria-label="Recargar">
              <span className="hidden sm:inline">Recargar</span>
            </Boton>
          </>
        }
        stats={stats}
      />

      <Cuerpo>
        {/* Embudo: una cifra por etapa; tocarla filtra. */}
        <div className="ase-ld-embudo ase-anim" role="group" aria-label="Embudo por etapa">
          {ETAPAS.map((e) => {
            const n = embudo?.etapas?.[e.valor] || 0;
            return (
              <button
                key={e.valor}
                type="button"
                className="ase-ld-etapa"
                data-on={etapaFiltro === e.valor ? "1" : "0"}
                style={{ "--ld-color": e.color }}
                onClick={() => setEtapaFiltro((f) => (f === e.valor ? "" : e.valor))}
                title={`${e.etiqueta}: ${n}${totalEmbudo ? ` (${Math.round((n / totalEmbudo) * 100)} %)` : ""}`}
              >
                <span className="ase-ld-etapa-n">{n}</span>
                <span className="ase-ld-etapa-l">{e.etiqueta}</span>
                <span className="ase-ld-etapa-bar"><i style={{ width: `${(n / maxEtapa) * 100}%` }} /></span>
              </button>
            );
          })}
        </div>
        {embudo?.origenes && Object.keys(embudo.origenes).length > 0 && (
          <div className="ase-ld-origenes">
            <span style={{ fontWeight: 700 }}>Por origen:</span>
            {Object.entries(embudo.origenes)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([o, v]) => (
                <Chip key={o} tono={origen === o ? "petrol" : "gris"}>
                  {ORIGENES[o] || o} · {v.total}{v.contratados ? ` · ${v.conversion} % conv.` : ""}
                </Chip>
              ))}
          </div>
        )}

        <div className="ase-ld-filtros">
          <label className="ase-buscar">
            <Search />
            <input
              className="ase-campo"
              type="search"
              placeholder="Nombre, correo, WhatsApp o detalle"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              aria-label="Buscar leads"
            />
          </label>
          <select className="ase-campo" value={origen} onChange={(e) => setOrigen(e.target.value)} aria-label="Origen">
            <option value="">Todos los orígenes</option>
            {Object.entries(ORIGENES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="ase-campo" value={asesor} onChange={(e) => setAsesor(e.target.value)} aria-label="Responsable">
            <option value="">Todo el equipo</option>
            <option value="sin">Sin asignar</option>
            {user?.id_usuario && <option value={String(user.id_usuario)}>Los míos</option>}
            {(opciones?.asesores || [])
              .filter((a) => a.id_usuario !== user?.id_usuario)
              .map((a) => <option key={a.id_usuario} value={String(a.id_usuario)}>{a.nombre}</option>)}
          </select>
          <label className="ase-toggle">
            <input type="checkbox" checked={sinResponder} onChange={(e) => setSinResponder(e.target.checked)} />
            <i /> Sin responder
          </label>
          <div className="ase-vista" role="group" aria-label="Cómo ver los leads">
            <button type="button" aria-pressed={vista === "tablero"} onClick={() => cambiarVista("tablero")}>
              <LayoutGrid size={13} style={{ verticalAlign: "-2px" }} /> Tablero
            </button>
            <button type="button" aria-pressed={vista === "tabla"} onClick={() => cambiarVista("tabla")}>
              <List size={13} style={{ verticalAlign: "-2px" }} /> Tabla
            </button>
          </div>
        </div>

        {error && (
          <div className="ase-tarjeta ase-tarjeta-p" style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {leads === null ? (
          <Esqueleto filas={4} />
        ) : visibles.length === 0 && !etapaFiltro && vista === "tabla" ? (
          <Vacio
            titulo="No hay leads con estos filtros"
            texto="Cambia los filtros o da de alta uno a mano."
            acciones={puedeEditar ? <Boton icono={Plus} onClick={() => setAltaAbierta(true)}>Nuevo lead</Boton> : null}
          />
        ) : vista === "tablero" ? (
          <div className="ase-ld-tablero">
            {columnas.map((e) => {
              const lista = porEtapa[e.valor] || [];
              return (
                <section
                  key={e.valor}
                  className="ase-ld-col"
                  style={{ "--ld-color": e.color }}
                  data-sobre={sobre === e.valor ? "1" : "0"}
                  aria-label={e.etiqueta}
                  onDragOver={(ev) => {
                    if (!puedeEditar || !arrastrado.current) return;
                    ev.preventDefault();
                    if (sobre !== e.valor) setSobre(e.valor);
                  }}
                  onDragLeave={() => setSobre((s) => (s === e.valor ? null : s))}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setSobre(null);
                    const id = Number(ev.dataTransfer.getData("text/plain"));
                    if (id) soltarEn(e.valor, id);
                  }}
                >
                  <div className="ase-ld-col-cab">
                    <span className="ase-ld-col-t">{e.etiqueta}</span>
                    <span className="ase-ld-col-n">{lista.length}</span>
                  </div>
                  {lista.length === 0 ? (
                    <div className="ase-ld-col-vacia">{puedeEditar ? "Arrastra aquí" : "Vacío"}</div>
                  ) : (
                    lista.map((l) => (
                      <Tarjeta
                        key={l.id_lead}
                        lead={l}
                        onAbrir={abrir}
                        arrastrable={puedeEditar}
                        onArrastre={(id) => { arrastrado.current = id; }}
                      />
                    ))
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="ase-tabla-scroll">
            <table className="ase-ld-tabla">
              <thead>
                <tr>
                  <th>Nombre</th><th>Contacto</th><th>Origen</th><th>Etapa</th>
                  <th>Responsable</th><th>Próxima acción</th><th>Entró</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((l) => {
                  const et = ETAPA[l.etapa] || ETAPAS[0];
                  return (
                    <tr key={l.id_lead} onClick={() => abrir(l.id_lead)}>
                      <td style={{ fontWeight: 700, minWidth: 140 }}>
                        {nombreDe(l)}
                        {l.sin_responder && <div style={{ fontSize: 10.5, color: "var(--accent-2)", fontWeight: 700 }}>sin responder</div>}
                      </td>
                      <td style={{ minWidth: 160 }}>
                        <div>{l.email || "—"}</div>
                        <div style={{ color: "var(--muted)" }}>{l.whatsapp || ""}</div>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {ORIGENES[l.origen] || l.origen}
                        {l.origen_detalle && <div style={{ color: "var(--muted)", fontSize: 11 }}>{l.origen_detalle}</div>}
                      </td>
                      <td><Chip tono={et.tono} punto>{et.etiqueta}</Chip></td>
                      <td style={{ whiteSpace: "nowrap" }}>{l.asesor?.nombre || <span style={{ color: "#9fb3c0" }}>sin asignar</span>}</td>
                      <td style={{ minWidth: 160 }}>
                        {l.proxima_accion || "—"}
                        {l.proxima_accion_at && <div style={{ color: "var(--muted)", fontSize: 11 }}>{fechaHora(l.proxima_accion_at)}</div>}
                      </td>
                      <td style={{ whiteSpace: "nowrap", color: "var(--muted)" }}>{haceCuanto(l.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Cuerpo>

      {abierto && (
        <LeadDetalle
          key={abierto}
          id={abierto}
          opciones={opciones}
          puedeEditar={puedeEditar}
          puedeEliminar={puedeEliminar}
          onCerrar={cerrar}
          onCambio={alCambiar}
        />
      )}

      {/* Se monta solo abierta: así cada alta empieza con el formulario limpio. */}
      {altaAbierta && (
        <LeadAlta
          abierta
          opciones={opciones}
          onCerrar={() => setAltaAbierta(false)}
          onCreado={(lead) => {
            setAltaAbierta(false);
            cargar();
            if (lead?.id_lead) abrir(lead.id_lead);
          }}
        />
      )}
    </Pagina>
  );
}
