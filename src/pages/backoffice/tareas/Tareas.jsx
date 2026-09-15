// Las tareas del equipo en Inspira Core.
//
// Lo que alguien tiene que hacer, por área (Redes y Marketing, Leads,
// Servicios, Sub servicios y Pendientes generales), con responsable y fecha
// límite. Tres vistas: «Mis tareas», «Las que creé» y, para quien gestiona
// tareas, «Equipo», con la carga de cada persona y quién puede asignar.
// Tablero por estado (se arrastra la tarjeta) o lista por fecha. La ficha se
// abre en un panel lateral con ?tarea=ID en la URL, que es el enlace que llega
// en los correos.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, List, Plus, RefreshCw, Search, CalendarClock } from "lucide-react";
import { boGET, boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { useAuth } from "../context/AuthContext";
import { Pagina, Cabecera, Cuerpo, Boton, Chip, Pill, Vacio, Esqueleto } from "../ui";
import TareaDetalle from "./TareaDetalle";
import TareaAlta from "./TareaAlta";
import CargaEquipo from "./CargaEquipo";
import {
  CATEGORIAS, CATEGORIA, ESTADOS, ESTADO, PRIORIDADES, PRIORIDAD, SERVICIO_CORTO,
  textoVence, avisarCambioTareas,
} from "./tareasComun";
import "../../../styles/leads-core.css";
import "../../../styles/tareas-core.css";

const CLAVE_VISTA = "bo_tareas_vista";

function leerParam(nombre) {
  try { return new URLSearchParams(window.location.search).get(nombre) || ""; } catch { return ""; }
}

function escribirParam(nombre, valor) {
  const url = new URL(window.location.href);
  if (valor) url.searchParams.set(nombre, String(valor));
  else url.searchParams.delete(nombre);
  window.history.replaceState(window.history.state, "", url.pathname + url.search);
}

function Tarjeta({ tarea, onAbrir, onArrastre, verResponsable }) {
  const [arrastrando, setArrastrando] = useState(false);
  const cat = CATEGORIA[tarea.categoria] || CATEGORIAS[CATEGORIAS.length - 1];
  const pri = PRIORIDAD[tarea.prioridad];
  const vence = textoVence(tarea);
  const detalleArea = tarea.subservicio || (tarea.servicio ? (SERVICIO_CORTO[tarea.servicio] || tarea.servicio) : "");
  const persona = tarea.solicitud?.cliente?.nombre || tarea.lead?.nombre || tarea.lead?.email;
  return (
    <button
      type="button"
      className="ase-ld-card ase-tr-card"
      style={{ "--tr-color": cat.color }}
      data-vencida={tarea.vencida ? "1" : "0"}
      data-cerrada={tarea.abierta ? "0" : "1"}
      data-arrastrando={arrastrando ? "1" : "0"}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(tarea.id_tarea));
        e.dataTransfer.effectAllowed = "move";
        setArrastrando(true);
        onArrastre?.(tarea.id_tarea);
      }}
      onDragEnd={() => { setArrastrando(false); onArrastre?.(null); }}
      onClick={() => onAbrir(tarea.id_tarea)}
    >
      <div className="ase-tr-card-cat">{cat.corto}{detalleArea ? ` · ${detalleArea}` : ""}</div>
      <div className="ase-ld-card-n">{tarea.titulo}</div>
      {persona && <div className="ase-ld-card-s">{persona}</div>}
      <div className="ase-ld-card-pie">
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {pri && (tarea.prioridad === "ALTA" || tarea.prioridad === "URGENTE") && <Chip tono={pri.tono}>{pri.etiqueta}</Chip>}
          {vence && (
            <span className="ase-tr-vence" data-vencida={tarea.vencida ? "1" : "0"} data-hoy={tarea.para_hoy ? "1" : "0"}>
              <CalendarClock size={10} /> {vence}
            </span>
          )}
        </span>
        {verResponsable && (
          <span className="ase-ld-card-f">
            {tarea.asignado?.nombre ? tarea.asignado.nombre.split(" ")[0] : "sin asignar"}
          </span>
        )}
      </div>
    </button>
  );
}

export default function Tareas() {
  const { user, isAdmin } = useAuth();

  const [opciones, setOpciones] = useState(null);
  const [tareas, setTareas] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);

  const [vista, setVista] = useState(() => {
    try { return localStorage.getItem(CLAVE_VISTA) || "tablero"; } catch { return "tablero"; }
  });
  const [alcance, setAlcance] = useState(() => leerParam("ver") || "mias");
  const [categoria, setCategoria] = useState(() => leerParam("area"));
  const [texto, setTexto] = useState("");
  const [textoAplicado, setTextoAplicado] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [vence, setVence] = useState("");
  const [asignado, setAsignado] = useState("");
  const [verCerradas, setVerCerradas] = useState(false);

  const [abierta, setAbierta] = useState(() => Number(leerParam("tarea")) || null);
  const [altaAbierta, setAltaAbierta] = useState(false);
  const [sobre, setSobre] = useState(null);
  const [versionCarga, setVersionCarga] = useState(0);
  const arrastrada = useRef(null);

  // Búsqueda con respiro: no se pide a la API en cada tecla.
  useEffect(() => {
    const t = setTimeout(() => setTextoAplicado(texto.trim()), 300);
    return () => clearTimeout(t);
  }, [texto]);

  useEffect(() => {
    boGET("/backoffice/tareas/opciones").then((r) => { if (r?.ok) setOpciones(r); });
  }, []);

  const gestor = !!opciones?.yo?.gestor;
  // «Equipo» es de quien gestiona: si llega por URL sin permiso, se ven las propias.
  const alcanceVisto = alcance === "equipo" && opciones && !gestor ? "mias" : alcance;

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("alcance", alcanceVisto);
    if (categoria) p.set("categoria", categoria);
    if (textoAplicado) p.set("texto", textoAplicado);
    if (prioridad) p.set("prioridad", prioridad);
    if (vence) p.set("vence", vence);
    if (asignado && alcanceVisto === "equipo") p.set("asignado", asignado);
    if (verCerradas) p.set("cerradas", "todas");
    return p.toString();
  }, [alcanceVisto, categoria, textoAplicado, prioridad, vence, asignado, verCerradas]);

  const aplicar = useCallback((r) => {
    if (!r?.ok) {
      setError(r?.msg || "No se pudieron cargar las tareas.");
      setTareas([]);
      return;
    }
    setError(null);
    setTareas(r.tareas);
    setResumen(r.resumen);
  }, []);

  // Carga al montar y al cambiar filtros. Si llega tarde la respuesta de un
  // filtro anterior, se descarta.
  useEffect(() => {
    let vivo = true;
    boGET(`/backoffice/tareas?${query}`).then((r) => { if (vivo) aplicar(r); });
    return () => { vivo = false; };
  }, [query, aplicar]);

  /** Tras cualquier cambio: lista, cifras y carga del equipo al día. */
  const recargar = useCallback(() => {
    boGET(`/backoffice/tareas?${query}`).then(aplicar);
    setVersionCarga((v) => v + 1);
  }, [query, aplicar]);

  const abrir = (id) => { setAbierta(id); escribirParam("tarea", id); };
  const cerrar = useCallback(() => { setAbierta(null); escribirParam("tarea", null); }, []);

  function cambiarAlcance(a) {
    setAlcance(a);
    setAsignado("");
    escribirParam("ver", a === "mias" ? null : a);
  }

  function cambiarCategoria(c) {
    const nueva = categoria === c ? "" : c;
    setCategoria(nueva);
    escribirParam("area", nueva || null);
  }

  function cambiarVista(v) {
    setVista(v);
    try { localStorage.setItem(CLAVE_VISTA, v); } catch { /* sin almacenamiento */ }
  }

  async function soltarEn(estado, id) {
    const t = (tareas || []).find((x) => x.id_tarea === id);
    if (!t || t.estado === estado) return;
    const antes = tareas;
    const abiertaAhora = estado === "PENDIENTE" || estado === "EN_CURSO";
    setTareas((ts) => ts.map((x) => (x.id_tarea === id ? { ...x, estado, abierta: abiertaAhora } : x)));
    const r = await boPATCH(`/backoffice/tareas/${id}`, { estado });
    if (!r?.ok) {
      setTareas(antes);
      dialog.toast(r?.msg || "No se pudo mover la tarea", "error");
      return;
    }
    if (estado === "HECHA") dialog.toast("Tarea hecha", "success");
    avisarCambioTareas();
    recargar();
  }

  const porEstado = useMemo(() => {
    const m = Object.fromEntries(ESTADOS.map((e) => [e.valor, []]));
    (tareas || []).forEach((t) => { (m[t.estado] || (m[t.estado] = [])).push(t); });
    return m;
  }, [tareas]);

  const columnas = ESTADOS.filter((e) => e.valor !== "DESCARTADA" || verCerradas || porEstado.DESCARTADA.length > 0);
  const nombre = (user?.nombre || "").split(" ")[0];
  const verResponsable = alcanceVisto !== "mias";
  const hayFiltros = !!(categoria || textoAplicado || prioridad || vence || asignado);

  const alcances = [
    { v: "mias", l: "Mis tareas" },
    { v: "creadas", l: "Las que creé" },
    ...(gestor ? [{ v: "equipo", l: "Equipo" }] : []),
  ];

  const stats = [
    { n: resumen?.abiertas || 0, l: "abiertas" },
    {
      n: resumen?.vencidas || 0, l: "vencidas",
      tono: resumen?.vencidas ? "alerta" : undefined,
      onClick: () => setVence((v) => (v === "vencidas" ? "" : "vencidas")),
    },
    { n: resumen?.hoy || 0, l: "para hoy", onClick: () => setVence((v) => (v === "hoy" ? "" : "hoy")) },
    { n: resumen?.en_curso || 0, l: "en curso", tono: "cielo" },
    { n: resumen?.hechas_7d || 0, l: "hechas · 7 d", tono: "ok" },
  ];

  const tituloVacio = alcanceVisto === "creadas"
    ? "Todavía no has creado tareas"
    : alcanceVisto === "equipo" ? "El equipo no tiene tareas" : "No tienes tareas pendientes";

  return (
    <Pagina>
      <Cabecera
        eyebrow="Tareas"
        titulo={nombre ? `Lo que toca hacer, ${nombre}` : "Lo que toca hacer"}
        subtitulo="Lo pendiente del equipo por área, con su responsable y su fecha límite. Lo vencido sale en rojo y cada mañana llega por correo."
        acciones={
          <>
            <Boton tono="cta" icono={Plus} onClick={() => setAltaAbierta(true)} disabled={!opciones}>Nueva tarea</Boton>
            <Boton tono="cristal" icono={RefreshCw} onClick={recargar} aria-label="Recargar">
              <span className="hidden sm:inline">Recargar</span>
            </Boton>
          </>
        }
        stats={stats}
      />

      <Cuerpo>
        <div className="ase-pills ase-tr-alcance" role="group" aria-label="Qué tareas ver">
          {alcances.map((a) => (
            <Pill key={a.v} on={alcanceVisto === a.v} onClick={() => cambiarAlcance(a.v)}>{a.l}</Pill>
          ))}
        </div>

        {/* Áreas: una cifra por área (abiertas); tocarla filtra. */}
        <div className="ase-tr-areas ase-anim" role="group" aria-label="Áreas">
          {CATEGORIAS.map((c) => {
            const Icono = c.icono;
            const n = resumen?.categorias?.[c.valor] || 0;
            return (
              <button
                key={c.valor} type="button" className="ase-tr-area"
                data-on={categoria === c.valor ? "1" : "0"}
                aria-pressed={categoria === c.valor}
                style={{ "--tr-color": c.color }}
                onClick={() => cambiarCategoria(c.valor)}
                title={`${c.etiqueta}: ${n} abierta${n === 1 ? "" : "s"}`}
              >
                <span className="ase-tr-area-ico"><Icono size={16} strokeWidth={2.1} /></span>
                <span style={{ minWidth: 0 }}>
                  <span className="ase-tr-area-n">{n}</span>
                  <span className="ase-tr-area-l">{c.etiqueta}</span>
                </span>
              </button>
            );
          })}
        </div>

        {alcanceVisto === "equipo" && gestor && (
          <CargaEquipo asignado={asignado} onElegir={setAsignado} esAdmin={isAdmin} version={versionCarga} />
        )}

        <div className="ase-tr-filtros">
          <label className="ase-buscar">
            <Search />
            <input
              className="ase-campo" type="search" placeholder="Buscar en el título o el detalle"
              value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar tareas"
            />
          </label>
          <select className="ase-campo" value={vence} onChange={(e) => setVence(e.target.value)} aria-label="Fecha límite">
            <option value="">Cualquier fecha</option>
            <option value="vencidas">Vencidas</option>
            <option value="hoy">Vencen hoy</option>
            <option value="semana">Próximos 7 días</option>
            <option value="sin">Sin fecha</option>
          </select>
          <select className="ase-campo" value={prioridad} onChange={(e) => setPrioridad(e.target.value)} aria-label="Prioridad">
            <option value="">Toda prioridad</option>
            {PRIORIDADES.map((p) => <option key={p.valor} value={p.valor}>{p.etiqueta}</option>)}
          </select>
          {alcanceVisto === "equipo" ? (
            <select className="ase-campo" value={asignado} onChange={(e) => setAsignado(e.target.value)} aria-label="Responsable">
              <option value="">Todo el equipo</option>
              <option value="sin">Sin asignar</option>
              {(opciones?.equipo || []).map((u) => (
                <option key={u.id_usuario} value={String(u.id_usuario)}>{u.nombre}</option>
              ))}
            </select>
          ) : <span className="ase-tr-hueco" />}
          <label className="ase-toggle ase-tr-cerradas">
            <input type="checkbox" checked={verCerradas} onChange={(e) => setVerCerradas(e.target.checked)} />
            <i /> Ver cerradas
          </label>
          <div className="ase-vista" role="group" aria-label="Cómo ver las tareas">
            <button type="button" aria-pressed={vista === "tablero"} onClick={() => cambiarVista("tablero")}>
              <LayoutGrid size={13} style={{ verticalAlign: "-2px" }} /> Tablero
            </button>
            <button type="button" aria-pressed={vista === "lista"} onClick={() => cambiarVista("lista")}>
              <List size={13} style={{ verticalAlign: "-2px" }} /> Lista
            </button>
          </div>
        </div>

        {error && (
          <div className="ase-tarjeta ase-tarjeta-p" style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {tareas === null ? (
          <Esqueleto filas={4} />
        ) : tareas.length === 0 && !hayFiltros ? (
          <Vacio
            titulo={tituloVacio}
            texto="Crea una: qué hay que hacer, de qué área y para cuándo."
            acciones={<Boton icono={Plus} onClick={() => setAltaAbierta(true)} disabled={!opciones}>Nueva tarea</Boton>}
          />
        ) : tareas.length === 0 ? (
          <Vacio titulo="Ninguna tarea con estos filtros" texto="Quita algún filtro para ver más." />
        ) : vista === "tablero" ? (
          <div className="ase-ld-tablero">
            {columnas.map((e) => {
              const lista = porEstado[e.valor] || [];
              return (
                <section
                  key={e.valor}
                  className="ase-ld-col"
                  style={{ "--ld-color": e.color }}
                  data-sobre={sobre === e.valor ? "1" : "0"}
                  aria-label={e.etiqueta}
                  onDragOver={(ev) => {
                    if (!arrastrada.current) return;
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
                    <div className="ase-ld-col-vacia">Arrastra aquí</div>
                  ) : (
                    lista.map((t) => (
                      <Tarjeta
                        key={t.id_tarea}
                        tarea={t}
                        onAbrir={abrir}
                        onArrastre={(id) => { arrastrada.current = id; }}
                        verResponsable={verResponsable}
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
                  <th>Tarea</th><th>Área</th><th>Responsable</th><th>Fecha límite</th><th>Prioridad</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {tareas.map((t) => {
                  const cat = CATEGORIA[t.categoria];
                  const est = ESTADO[t.estado];
                  const pri = PRIORIDAD[t.prioridad];
                  const persona = t.solicitud?.cliente?.nombre || t.lead?.nombre || t.lead?.email;
                  return (
                    <tr key={t.id_tarea} onClick={() => abrir(t.id_tarea)}>
                      <td style={{ minWidth: 200 }}>
                        <div style={{ fontWeight: 700, textDecoration: t.abierta ? "none" : "line-through" }}>{t.titulo}</div>
                        {persona && <div style={{ color: "var(--muted)", fontSize: 11 }}>{persona}</div>}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <Chip tono={cat?.tono || "gris"}>{cat?.corto || t.categoria}</Chip>
                        {(t.subservicio || t.servicio) && (
                          <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 3 }}>
                            {t.subservicio || SERVICIO_CORTO[t.servicio] || t.servicio}
                          </div>
                        )}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {t.asignado?.nombre || <span style={{ color: "#9fb3c0" }}>sin asignar</span>}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span className="ase-tr-vence" data-vencida={t.vencida ? "1" : "0"} data-hoy={t.para_hoy ? "1" : "0"}>
                          {textoVence(t) || "—"}
                        </span>
                      </td>
                      <td><Chip tono={pri?.tono || "gris"}>{pri?.etiqueta || t.prioridad}</Chip></td>
                      <td><Chip tono={est?.tono || "gris"} punto>{est?.etiqueta || t.estado}</Chip></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Cuerpo>

      {abierta && (
        <TareaDetalle
          key={abierta}
          id={abierta}
          opciones={opciones}
          onCerrar={cerrar}
          onCambio={recargar}
        />
      )}

      {/* Se monta solo abierta: así cada alta empieza con el formulario limpio. */}
      {altaAbierta && opciones && (
        <TareaAlta
          abierta
          opciones={opciones}
          inicial={{ categoria: categoria || undefined }}
          onCerrar={() => setAltaAbierta(false)}
          onCreada={() => { setAltaAbierta(false); recargar(); }}
        />
      )}
    </Pagina>
  );
}
