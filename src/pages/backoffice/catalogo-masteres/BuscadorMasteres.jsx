// El buscador de másteres: el catálogo final.
//
// Es el que contesta la pregunta que de verdad se hace delante de un asesorado:
// «con este presupuesto, en esta comunidad, y con este perfil, ¿qué puede
// estudiar y le da tiempo a postular?». Un listado de nombres de máster no lo
// contesta: hace falta el precio real, la ciudad y si el plazo sigue abierto,
// y eso vive en la universidad, no en el máster.
//
// Por eso el servidor devuelve cada máster con lo heredado ya resuelto. Aquí no
// se recalcula nada: si la pantalla y el informe hicieran sus propias cuentas,
// tarde o temprano dirían importes distintos del mismo máster.
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Building2, CalendarClock, Copy, ExternalLink, GraduationCap, Pencil, Save, Search, SlidersHorizontal, Upload, X,
} from "lucide-react";
import { boGET, boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { navigate } from "../../../services/navigate";
import MapaDelCatalogo from "./MapaDelCatalogo";
import {
  Pagina, Cabecera, Cuerpo, Boton, Chip, Pill, Campo, Ventana, Vacio, Esqueleto,
} from "../ui";

const RAMA_ETIQ = {
  ARTES_HUMANIDADES: "Artes y Humanidades",
  CIENCIAS: "Ciencias",
  CIENCIAS_SALUD: "Ciencias de la Salud",
  CIENCIAS_SOCIALES_JURIDICAS: "Sociales y Jurídicas",
  INGENIERIA_ARQUITECTURA: "Ingeniería y Arquitectura",
};

const VENTANA = {
  abierta: { texto: "plazo abierto", tono: "verde" },
  "abre pronto": { texto: "abre pronto", tono: "petrol" },
  cerrada: { texto: "plazo cerrado", tono: "gris" },
  "sin fecha": { texto: "sin fechas", tono: "ambar" },
};

const eur = (n) =>
  n == null ? "—" : `${Number(n).toLocaleString("es-ES", { maximumFractionDigits: 0 })} €`;

const fecha = (iso) => {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
};

// Con el año, siempre. La convocatoria va por delante del curso: para empezar
// clases en septiembre de 2027 se postula desde noviembre de 2026, y «17 nov»
// a secas se lee como el mes que viene.
const fechaCorta = (iso) => {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "2-digit" })
    .replace(".", "");
};

const eur2 = (n) =>
  n == null ? "—" : `${Number(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

// 393 criterios de una carga antigua guardaron la categoría y dejaron el texto
// en blanco. Se rotulan desde la categoría: es lo que el texto habría dicho.
const CATEGORIA_ETIQ = {
  EXPEDIENTE_ACADEMICO: "Expediente académico",
  ADECUACION_TITULO: "Adecuación del título de acceso",
  CURRICULUM_VITAE: "Currículum vitae",
  EXPERIENCIA_PROFESIONAL: "Experiencia profesional",
  MOTIVACION: "Carta de motivación",
  ENTREVISTA: "Entrevista",
  IDIOMAS: "Idiomas",
  OTROS_MERITOS: "Otros méritos",
  FORMACION_COMPLEMENTARIA: "Formación complementaria",
  INVESTIGACION: "Investigación y publicaciones",
  CARTAS_REFERENCIA: "Cartas de referencia",
  DOSSIER_PORTFOLIO: "Dossier o portfolio",
};
const rotuloCriterio = (c) =>
  (c.criterio || "").trim() || CATEGORIA_ETIQ[c.categoria] || "";

/** Un retardo corto: sin él, cada tecla dispara una consulta a mil filas. */
function useRetardo(valor, ms = 350) {
  const [v, setV] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setV(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return v;
}

/** La línea del plazo, en claro: la etiqueta dice el estado; esto, la fecha. */
function plazoEnClaro(v) {
  if (!v) return null;
  if (v.estado === "abierta" && v.cierra) {
    return `Cierra el ${fecha(v.cierra)}${v.dias != null ? ` · quedan ${v.dias} días` : ""}`;
  }
  if (v.estado === "abre pronto" && v.abre) return `Abre el ${fecha(v.abre)} · ${v.fase}`;
  if (v.estado === "cerrada" && v.cerro) return `Cerró el ${fecha(v.cerro)} · ${v.fase}`;
  return null;
}

/**
 * El baremo de admisión: qué puntúa la universidad y con qué peso.
 *
 * En barras y no solo en números porque un 60 % y un 10 % tienen que
 * distinguirse de un vistazo. Y no es el requisito de acceso: que un máster
 * valore el expediente al 100 % no quiere decir que acepte cualquier título.
 */
function Baremo({ criterios, sinPublicar }) {
  const utiles = (criterios || []).filter(rotuloCriterio);
  if (!utiles.length) {
    return (
      <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
        {sinPublicar
          ? "No publica baremo. Se pondera solo el expediente y el comité puede valorar méritos adicionales."
          : "Sin datos del baremo en el catálogo."}
      </p>
    );
  }
  const max = Math.max(...utiles.map((c) => c.peso || 0), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {utiles.map((c, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {rotuloCriterio(c)}
            </span>
            <span className="ase-num" style={{ color: "var(--muted)", fontWeight: 600 }}>
              {c.peso == null ? "" : `${c.peso}%`}
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: "var(--ground)", marginTop: 3, overflow: "hidden" }}>
            <i style={{
              display: "block", height: "100%", borderRadius: 999,
              width: `${c.peso == null ? 0 : Math.round((c.peso / max) * 100)}%`,
              background: "linear-gradient(90deg,var(--sky-2),var(--primary-2))",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Todas las convocatorias, con su adjudicación enfrentada. */
function Fases({ fases }) {
  if (!fases || !fases.length) {
    return <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Sin fechas en el catálogo.</p>;
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead>
        <tr style={{ color: "var(--muted)", textAlign: "left" }}>
          <th style={{ fontWeight: 700, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", padding: "0 0 4px" }}>Fase</th>
          <th style={{ fontWeight: 700, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", padding: "0 0 4px" }}>Solicitud</th>
          <th style={{ fontWeight: 700, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", padding: "0 0 4px" }}>Resultados</th>
        </tr>
      </thead>
      <tbody>
        {fases.map((f, i) => (
          <tr key={i} style={{ borderTop: "1px solid var(--line)" }}>
            <td style={{ padding: "5px 8px 5px 0", lineHeight: 1.35 }}>{f.nombre}</td>
            <td className="ase-num" style={{ padding: "5px 8px 5px 0", whiteSpace: "nowrap" }}>
              {fechaCorta(f.inicio)} – {fechaCorta(f.fin)}
              {f.estimada && (
                <span title="Fecha del ciclo anterior: suele moverse unos días. Confirmar antes de comprometerla."
                  style={{ marginLeft: 5, fontSize: 9, fontWeight: 700, letterSpacing: ".05em",
                           textTransform: "uppercase", color: "var(--amber)" }}>est.</span>
              )}
            </td>
            <td className="ase-num" style={{ padding: "5px 0", whiteSpace: "nowrap", color: f.resultados ? "inherit" : "var(--muted)" }}>
              {f.resultados ? fechaCorta(f.resultados) : "sin fecha"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Ficha({ m, onAbrir }) {
  const v = VENTANA[m.ventana?.estado] || VENTANA["sin fecha"];
  const u = m.universidad || {};
  const plazo = plazoEnClaro(m.ventana);

  return (
    <button type="button" className="ase-ficha" onClick={() => onAbrir(m)}>
      <span style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <span className="ase-ficha-t" style={{ minWidth: 0 }}>{m.nombre}</span>
        <span style={{ textAlign: "right", flexShrink: 0 }}>
          <span className="ase-precio" style={{ fontSize: 17, display: "block" }}>{eur(m.precio)}</span>
          <span style={{ fontSize: 9.5, color: "#9fb3c0" }}>{m.precio_origen === "confirmado" ? "confirmado" : "estimado"}</span>
        </span>
      </span>

      <span className="ase-ficha-s">
        {u.sigla ? <b style={{ color: "var(--primary)" }}>{u.sigla}</b> : null}
        {u.nombre ? ` · ${u.nombre}` : ""}
        <span style={{ display: "block", marginTop: 1 }}>
          {[u.ciudad, u.comunidad].filter(Boolean).join(" · ")}
          {u.ranking_nacional ? ` · nº ${u.ranking_nacional} de España` : ""}
        </span>
      </span>

      <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Chip tono={v.tono} punto>{v.texto}</Chip>
        <Chip>{m.ects} ECTS</Chip>
        {m.es_habilitante && <Chip tono="morado">habilitante</Chip>}
        {m.universidad?.requiere_estudio_titulo === true && (
          <Chip tono="ambar">
            trámite previo{m.universidad.tasa_estudio_titulo
              ? ` · ${eur2(m.universidad.tasa_estudio_titulo)}` : " · sin tasa"}
          </Chip>
        )}
      </span>

      {plazo && (
        <span style={{ fontSize: 11.5, color: v.tono === "verde" ? "var(--green)" : "var(--muted)", fontWeight: 600 }}>
          {plazo}
        </span>
      )}
    </button>
  );
}

/**
 * Corregir el máster a mano.
 *
 * El catálogo se llena leyendo boletines y webs, y eso deja huecos: 862
 * másteres no publican su modalidad y 1.828 no publican el idioma. El asesor
 * que llama a la universidad y lo averigua tiene que poder escribirlo aquí.
 *
 * Cada campo que se guarda queda marcado como manual en la base, y la
 * siguiente recarga del censo NO lo pisa. Sin esa marca esto sería una trampa:
 * la corrección duraría hasta la próxima carga.
 */
function FormularioEdicion({ m, onGuardado, onCancelar }) {
  const [v, setV] = useState({
    modalidad: m.modalidad || "",
    idioma_imparticion: m.idioma || "",
    ects: m.ects ?? "",
    precio_final: m.precio_final ?? "",
    curso: m.curso || "",
    url_ficha: m.url_ficha || "",
    titulo_acceso: m.titulo_acceso || "",
    notas: m.notas || "",
  });
  const [guardando, setGuardando] = useState(false);
  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));

  // Solo viaja lo que cambió: mandar el formulario entero marcaría como
  // «corregido a mano» hasta lo que el asesor no tocó, y a partir de ahí el
  // censo dejaría de actualizar ese máster nunca más.
  async function guardar() {
    const original = {
      modalidad: m.modalidad || "", idioma_imparticion: m.idioma || "",
      ects: m.ects ?? "", precio_final: m.precio_final ?? "", curso: m.curso || "",
      url_ficha: m.url_ficha || "", titulo_acceso: m.titulo_acceso || "",
      notas: m.notas || "",
    };
    const cambios = {};
    for (const k of Object.keys(v)) {
      if (String(v[k]) !== String(original[k])) cambios[k] = v[k];
    }
    if (!Object.keys(cambios).length) { onCancelar(); return; }
    setGuardando(true);
    try {
      const r = await boPATCH(`/backoffice/masteres/${m.id_master}`, cambios);
      if (r?.ok) {
        dialog.toast("Guardado. La recarga del censo ya no lo pisará", "exito");
        onGuardado(cambios);
      } else {
        dialog.toast(r?.msg || "No se pudo guardar", "error");
      }
    } catch {
      dialog.toast("No se pudo guardar", "error");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
        Lo que corrija aquí queda marcado como dato confirmado a mano: las
        recargas del catálogo respetarán estos campos y no volverán a
        sobrescribirlos.
      </p>
      <div className="ase-filtros">
        <Campo etiqueta="Modalidad">
          <select className="ase-campo" value={v.modalidad} onChange={set("modalidad")}>
            <option value="">Sin dato</option>
            <option value="PRESENCIAL">Presencial</option>
            <option value="SEMIPRESENCIAL">Semipresencial</option>
            <option value="VIRTUAL">Virtual</option>
          </select>
        </Campo>
        <Campo etiqueta="Idioma de impartición">
          <input className="ase-campo" value={v.idioma_imparticion} onChange={set("idioma_imparticion")}
            placeholder="Español, Español / Inglés…" />
        </Campo>
        <Campo etiqueta="Créditos ECTS">
          <input className="ase-campo ase-num" value={v.ects} onChange={set("ects")}
            inputMode="numeric" placeholder="60" />
        </Campo>
        <Campo etiqueta="Precio confirmado">
          <input className="ase-campo ase-num" value={v.precio_final} onChange={set("precio_final")}
            inputMode="decimal" placeholder="El que confirme la universidad" />
        </Campo>
        <Campo etiqueta="Curso publicado">
          <input className="ase-campo" value={v.curso} onChange={set("curso")} placeholder="2027-28" />
        </Campo>
        <Campo etiqueta="Enlace a la ficha">
          <input className="ase-campo" value={v.url_ficha} onChange={set("url_ficha")} placeholder="https://…" />
        </Campo>
      </div>
      <Campo etiqueta="Titulaciones de acceso">
        <textarea className="ase-campo" rows={2} value={v.titulo_acceso} onChange={set("titulo_acceso")}
          placeholder="Qué titulaciones dan acceso, tal como lo publica la universidad" />
      </Campo>
      <Campo etiqueta="Observación">
        <textarea className="ase-campo" rows={2} value={v.notas} onChange={set("notas")}
          placeholder="Lo que haya que recordar de este máster" />
      </Campo>
      <div style={{ display: "flex", gap: 8 }}>
        <Boton tono="primario" icono={Save} cargando={guardando} onClick={guardar}>Guardar</Boton>
        <Boton tono="secundario" icono={X} onClick={onCancelar}>Cancelar</Boton>
      </div>
    </div>
  );
}

/**
 * La vista de tabla: todo a la vista, para comparar muchos de una vez.
 *
 * Es otro trabajo distinto del de la ficha. La ficha sirve para elegir UNO —se
 * lee entera, se copia y se le manda al asesorado—. La tabla sirve para
 * comparar VEINTE: precio contra precio, plazo contra plazo, baremo contra
 * baremo, que es lo que se hace con una hoja de cálculo delante.
 *
 * Por eso las dos conviven en el mismo buscador y sobre los mismos filtros: no
 * son dos herramientas, son dos maneras de mirar la misma consulta.
 */
function TablaMasteres({ masteres, onAbrir }) {
  return (
    <div className="ase-tabla-scroll">
      <table className="ase-tabla">
        <thead>
          <tr>
            <th>Máster</th>
            <th>Universidad</th>
            <th>Comunidad</th>
            <th>Créditos</th>
            <th style={{ textAlign: "right" }}>Precio</th>
            <th>Postulación</th>
            <th>Resultados</th>
            <th>Baremo</th>
          </tr>
        </thead>
        <tbody>
          {masteres.map((m) => {
            const u = m.universidad || {};
            const fases = m.fases || [];
            const criterios = (m.baremo || []).filter(rotuloCriterio);
            const maxPeso = Math.max(...criterios.map((c) => c.peso || 0), 1);
            return (
              <tr key={m.id_master} onClick={() => onAbrir(m)} tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") onAbrir(m); }}>
                <td className="ase-td-nombre">{m.nombre}</td>
                <td className="ase-td-uni">
                  <b>{u.sigla}</b>
                  <span>{u.ciudad || u.nombre}</span>
                </td>
                <td>
                  {u.comunidad}
                  {u.requiere_estudio_titulo === true && (
                    <span className="ase-td-recon">
                      trámite previo{u.tasa_estudio_titulo ? ` · ${eur2(u.tasa_estudio_titulo)}` : " · sin tasa"}
                    </span>
                  )}
                  {u.requiere_estudio_titulo === false && (
                    <span className="ase-td-recon ok">sin trámite previo</span>
                  )}
                </td>
                <td className="ase-num">
                  {m.ects ? `${m.ects} ECTS` : <i className="ase-td-vacio">sin dato</i>}
                  {m.duracion_anios && (
                    <span className="ase-td-sec">
                      {m.duracion_anios === 1 ? "1 año"
                        : m.duracion_anios === 1.5 ? "año y medio" : `${m.duracion_anios} años`}
                    </span>
                  )}
                </td>
                <td className="ase-td-precio" title={m.precio_fuente || ""}>
                  <b>{eur(m.precio)}</b>
                  {m.precio_credito && <span>{eur2(m.precio_credito)}/crédito</span>}
                </td>
                <td className="ase-num ase-td-fases">
                  {fases.length ? fases.map((f, i) => (
                    <div key={i}>
                      <span className="ase-td-fn">{f.nombre.replace(/^Fase\s*/i, "F").split(" — ")[0]}</span>
                      {" "}{fechaCorta(f.inicio)} – {fechaCorta(f.fin)}
                      {f.estimada && <span className="ase-td-est">est.</span>}
                    </div>
                  )) : <i className="ase-td-vacio">sin fechas</i>}
                </td>
                <td className="ase-num ase-td-fases">
                  {fases.length ? fases.map((f, i) => (
                    <div key={i}>{f.resultados ? fechaCorta(f.resultados) : <i className="ase-td-vacio">—</i>}</div>
                  )) : null}
                </td>
                <td className="ase-td-baremo">
                  {criterios.length ? criterios.map((c, i) => (
                    <div key={i} className="ase-td-crit">
                      <span>{rotuloCriterio(c)}</span>
                      <b className="ase-num">{c.peso == null ? "" : `${c.peso}%`}</b>
                      <i style={{ width: `${c.peso == null ? 0 : Math.round((c.peso / maxPeso) * 100)}%` }} />
                    </div>
                  )) : (
                    <i className="ase-td-vacio">
                      {m.baremo_sin_publicar ? "no publica baremo" : "sin dato"}
                    </i>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function BuscadorMasteres() {
  const [texto, setTexto] = useState("");
  const [comunidad, setComunidad] = useState("");
  const [rama, setRama] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("precio");
  const [pagina, setPagina] = useState(1);
  const [masFiltros, setMasFiltros] = useState(false);
  const [abierto, setAbierto] = useState(null);
  const [editando, setEditando] = useState(false);
  // Fichas para elegir uno, tabla para comparar veinte. La elección se recuerda
  // porque cada asesora trabaja de una manera y no va a repetirla cada vez.
  const [vista, setVista] = useState(() => {
    try { return localStorage.getItem("inspira.masteres.vista") || "fichas"; }
    catch { return "fichas"; }
  });
  const cambiarVista = (v) => {
    setVista(v);
    try { localStorage.setItem("inspira.masteres.vista", v); } catch { /* sin recuerdo, no pasa nada */ }
  };

  // La respuesta se guarda junto a la consulta que la produjo, y de ahí sale si
  // está cargando. Marcar «cargando» dentro del efecto obliga a un render de
  // más por cada tecla, y aquí se teclea mucho.
  const [respuesta, setRespuesta] = useState(null);
  const [unis, setUnis] = useState([]);

  const textoLento = useRetardo(texto);
  const precioLento = useRetardo(precioMax, 500);

  // Las comunidades salen de la ficha de universidades: es la misma lista y no
  // tiene sentido mantener dos.
  useEffect(() => {
    let vivo = true;
    boGET("/backoffice/universidades")
      .then((r) => { if (vivo && r?.ok) setUnis(r.universidades || []); })
      .catch(() => {});
    return () => { vivo = false; };
  }, []);

  const comunidades = useMemo(
    () => [...new Set(unis.map((u) => u.comunidad).filter(Boolean))].sort(),
    [unis],
  );
  const conOferta = useMemo(() => unis.filter((u) => (u.masteres_cargados || 0) > 0).length, [unis]);

  const consulta = useMemo(() => {
    const p = new URLSearchParams();
    if (textoLento.trim()) p.set("texto", textoLento.trim());
    if (comunidad) p.set("comunidad", comunidad);
    if (rama) p.set("rama", rama);
    if (modalidad) p.set("modalidad", modalidad);
    if (precioLento && Number(precioLento) > 0) p.set("precio_max", String(Number(precioLento)));
    p.set("orden", orden);
    p.set("pagina", String(pagina));
    return p.toString();
  }, [textoLento, comunidad, rama, modalidad, precioLento, orden, pagina]);

  useEffect(() => {
    let vivo = true;
    boGET(`/backoffice/masteres?${consulta}`)
      .then((r) => { if (vivo) setRespuesta({ consulta, datos: r?.ok ? r : null }); })
      // Sin esto, un fallo de red dejaría «Buscando…» puesto para siempre.
      .catch(() => { if (vivo) setRespuesta({ consulta, datos: null, fallo: true }); });
    return () => { vivo = false; };
  }, [consulta]);

  const cargando = !respuesta || respuesta.consulta !== consulta;
  const datos = respuesta?.datos || null;
  const fallo = Boolean(respuesta?.fallo) && !cargando;

  // Cualquier filtro nuevo devuelve a la primera página: quedarse en la siete
  // de una búsqueda que ahora tiene dos páginas enseña una lista vacía.
  const cambiar = useCallback((set) => (e) => { set(e.target.value); setPagina(1); }, []);
  const elegirRama = (v) => { setRama(v); setPagina(1); };

  const masteres = datos?.masteres || [];
  const total = datos?.total || 0;
  const paginas = datos?.paginas || 1;
  const ramas = datos?.facetas?.ramas || [];
  const enCatalogo = ramas.reduce((n, r) => n + (r.cuantos || 0), 0);

  const hayFiltro = Boolean(texto || comunidad || rama || modalidad || precioMax);
  const limpiar = () => { setTexto(""); setComunidad(""); setRama(""); setModalidad(""); setPrecioMax(""); setPagina(1); };

  async function copiar(m) {
    const u = m.universidad || {};
    const lineas = [
      m.nombre,
      `${u.sigla ? `${u.sigla} · ` : ""}${u.nombre || ""}${u.ciudad ? ` (${u.ciudad})` : ""}`,
      `${m.ects} ECTS · ${m.duracion_anios || 1} ${m.duracion_anios > 1 ? "años" : "año"} · ${String(m.modalidad || "").toLowerCase()}`,
      `Precio ${m.precio_origen === "confirmado" ? "" : "estimado "}${eur(m.precio)}`,
      plazoEnClaro(m.ventana) || (VENTANA[m.ventana?.estado] || VENTANA["sin fecha"]).texto,
      u.url || "",
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lineas.join("\n"));
      dialog.toast("Copiado para pegarlo al asesorado", "exito");
    } catch {
      dialog.toast("No se pudo copiar", "error");
    }
  }

  const stats = [
    { n: cargando ? 0 : total, l: hayFiltro ? "coinciden" : "en el buscador" },
    { n: enCatalogo, l: "en el catálogo", tono: "cielo" },
    { n: conOferta, l: "universidades con oferta", tono: "ok", onClick: () => navigate("/backoffice/universidades") },
  ];

  const va = abierto ? (VENTANA[abierto.ventana?.estado] || VENTANA["sin fecha"]) : null;

  return (
    <Pagina>
      <Cabecera
        eyebrow="Catálogo"
        titulo="Buscador de másteres"
        subtitulo="El catálogo del que sale el informe. Cada máster con su precio real, su ciudad y si el plazo sigue abierto."
        acciones={
          <Boton tono="cristal" icono={Upload} onClick={() => navigate("/backoffice/sistematizador")}>Cargar oferta</Boton>
        }
        stats={stats}
      />

      <Cuerpo>
        <MapaDelCatalogo activo="masteres" />

        {/* La búsqueda acompaña al hacer scroll: en el móvil, volver arriba
            para cambiar una letra es lo que hace que no se use. */}
        <div className="ase-pegajosa">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="ase-buscar" style={{ flex: 1 }}>
              <Search />
              <input className="ase-campo" value={texto} onChange={cambiar(setTexto)}
                placeholder="Nombre del máster o titulación de acceso…" />
            </div>
            <Boton tono={masFiltros ? "primario" : "secundario"} icono={SlidersHorizontal} onClick={() => setMasFiltros((v) => !v)}
              aria-expanded={masFiltros}>
              <span className="hidden sm:inline">Filtros</span>
            </Boton>
            <div className="ase-vista" role="group" aria-label="Cómo ver los resultados">
              <button type="button" aria-pressed={vista === "fichas"}
                onClick={() => cambiarVista("fichas")}>Fichas</button>
              <button type="button" aria-pressed={vista === "tabla"}
                onClick={() => cambiarVista("tabla")}>Tabla</button>
            </div>
          </div>

          <div className="ase-pills" style={{ marginTop: 8 }}>
            <Pill on={!rama} onClick={() => elegirRama("")}>Todas las ramas</Pill>
            {ramas.map((r) => (
              <Pill key={r.valor} on={rama === r.valor} n={r.cuantos} onClick={() => elegirRama(r.valor)}>
                {RAMA_ETIQ[r.valor] || r.valor}
              </Pill>
            ))}
          </div>

          {masFiltros && (
            <div className="ase-filtros ase-entra" style={{ marginTop: 10 }}>
              <Campo etiqueta="Comunidad">
                <select className="ase-campo" value={comunidad} onChange={cambiar(setComunidad)}>
                  <option value="">Toda España</option>
                  {comunidades.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Campo>
              <Campo etiqueta="Modalidad">
                <select className="ase-campo" value={modalidad} onChange={cambiar(setModalidad)}>
                  <option value="">Cualquiera</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="SEMIPRESENCIAL">Semipresencial</option>
                  <option value="VIRTUAL">Virtual</option>
                </select>
              </Campo>
              {/* En euros y no en tramos: el asesorado dice una cifra, no una lista. */}
              <Campo etiqueta="Precio máximo">
                <input className="ase-campo ase-num" value={precioMax} onChange={cambiar(setPrecioMax)} inputMode="numeric" placeholder="Hasta … €" />
              </Campo>
              <Campo etiqueta="Orden">
                <select className="ase-campo" value={orden} onChange={cambiar(setOrden)}>
                  <option value="precio">Más barato primero</option>
                  <option value="nombre">Por nombre</option>
                  <option value="ects">Menos créditos</option>
                  <option value="duracion">Más corto</option>
                </select>
              </Campo>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--muted)" }}>
            {cargando ? "Buscando…" : (
              <>
                <b className="ase-num" style={{ color: "var(--ink)" }}>{total.toLocaleString("es-ES")}</b>
                {total === 1 ? " máster" : " másteres"}
                {paginas > 1 ? ` · página ${pagina} de ${paginas}` : ""}
              </>
            )}
          </p>
          {hayFiltro && <Boton tono="fantasma" tam="xs" onClick={limpiar}>Quitar filtros</Boton>}
          {/* El catálogo está a medias y callarlo sería peor: quien busca tiene
              que saber que el vacío puede ser del catálogo, no de la oferta. */}
          <p style={{ margin: "0 0 0 auto", fontSize: 11, color: "#9fb3c0" }}>
            Sólo másteres oficiales ya cargados en el catálogo.
          </p>
        </div>

        {fallo ? (
          <Vacio titulo="No se pudo consultar el catálogo"
            texto="Vuelve a intentarlo; si sigue igual, es el servidor y no la búsqueda."
            acciones={<Boton tono="secundario" onClick={() => setPagina((p) => p)}>Reintentar</Boton>} />
        ) : cargando && !masteres.length ? (
          <Esqueleto filas={5} alto={120} />
        ) : !masteres.length ? (
          <Vacio icono={GraduationCap} titulo="No hay ninguno con esos filtros"
            texto="Puede que esa universidad todavía no tenga su oferta cargada. Se carga desde el sistematizador."
            acciones={
              <>
                {hayFiltro && <Boton tono="secundario" onClick={limpiar}>Quitar filtros</Boton>}
                <Boton tono="primario" icono={Upload} onClick={() => navigate("/backoffice/sistematizador")}>Ir al sistematizador</Boton>
              </>
            } />
        ) : (
          <div className="ase-anim" style={{ opacity: cargando ? .6 : 1, transition: "opacity .2s" }}>
            {vista === "tabla" ? (
              <TablaMasteres masteres={masteres} onAbrir={setAbierto} />
            ) : (
              <div className="ase-rejilla">
                {masteres.map((m) => <Ficha key={m.id_master} m={m} onAbrir={setAbierto} />)}
              </div>
            )}
          </div>
        )}

        {paginas > 1 && (
          <div className="ase-pag">
            <Boton tono="secundario" tam="sm" icono={ArrowLeft} disabled={pagina <= 1 || cargando}
              onClick={() => { setPagina((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              Anterior
            </Boton>
            <span className="ase-pag-n">{pagina} / {paginas}</span>
            <Boton tono="secundario" tam="sm" disabled={pagina >= paginas || cargando}
              onClick={() => { setPagina((p) => Math.min(paginas, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              Siguiente <ArrowRight />
            </Boton>
          </div>
        )}
      </Cuerpo>

      {/* ── Ventana: la ficha del máster ── */}
      <Ventana
        abierta={Boolean(abierto)}
        onCerrar={() => { setAbierto(null); setEditando(false); }}
        titulo={abierto?.nombre}
        subtitulo={abierto ? `${abierto.universidad?.sigla ? `${abierto.universidad.sigla} · ` : ""}${abierto.universidad?.nombre || ""}` : ""}
        ancho="md"
        pie={abierto && !editando && (
          <>
            <Boton tono="secundario" icono={Pencil} onClick={() => setEditando(true)}>Corregir</Boton>
            <Boton tono="secundario" icono={Copy} onClick={() => copiar(abierto)}>Copiar resumen</Boton>
            {abierto.url_ficha && (
              <Boton tono="secundario" icono={ExternalLink} onClick={() => window.open(abierto.url_ficha, "_blank", "noopener")}>
                Ficha del máster
              </Boton>
            )}
            {abierto.universidad?.url && (
              <Boton tono="primario" icono={ExternalLink} onClick={() => window.open(abierto.universidad.url, "_blank", "noopener")}>
                Preinscripción
              </Boton>
            )}
          </>
        )}
      >
        {abierto && editando && (
          <FormularioEdicion
            m={abierto}
            onCancelar={() => setEditando(false)}
            onGuardado={(cambios) => {
              // Se refleja al momento en la ficha abierta y se relee la lista,
              // para que la tarjeta de detrás no siga enseñando el dato viejo.
              setAbierto((a) => ({
                ...a,
                ...cambios,
                idioma: cambios.idioma_imparticion ?? a.idioma,
                ects: cambios.ects != null && cambios.ects !== "" ? Number(cambios.ects) : a.ects,
              }));
              setEditando(false);
              setRespuesta(null);
            }}
          />
        )}

        {abierto && !editando && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {abierto.editado_por && (
              <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted)" }}>
                Corregido a mano por {abierto.editado_por}. Las recargas del
                catálogo respetan esos campos.
              </p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 160px" }}>
                <span className="ase-precio" style={{ fontSize: 30 }}>{eur(abierto.precio)}</span>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)", lineHeight: 1.45 }}>
                  {abierto.precio_origen === "confirmado"
                    ? "Precio confirmado por la universidad"
                    : (abierto.precio_fuente
                        || "Estimado con el crédito de su comunidad para extracomunitarios")}
                </p>
              </div>
              <Chip tono={va.tono} punto>{va.texto}</Chip>
            </div>

            {plazoEnClaro(abierto.ventana) && (
              <div className="ase-tarjeta" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, background: va.tono === "verde" ? "var(--green-soft)" : "var(--ground)", borderColor: "transparent" }}>
                <CalendarClock size={16} color={va.tono === "verde" ? "#1D6A4A" : "#62808f"} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: va.tono === "verde" ? "var(--green)" : "var(--ink)" }}>{plazoEnClaro(abierto.ventana)}</span>
              </div>
            )}

            <dl className="ase-kv">
              <dt>Créditos</dt><dd className="ase-num">{abierto.ects} ECTS · {abierto.duracion_anios || 1} {abierto.duracion_anios > 1 ? "años" : "año"}</dd>
              <dt>Ciudad</dt><dd>{[abierto.universidad?.ciudad, abierto.universidad?.comunidad].filter(Boolean).join(" · ") || "—"}</dd>
              {abierto.universidad?.ranking_nacional && (
                <><dt>Ranking</dt><dd className="ase-num">nº {abierto.universidad.ranking_nacional} de España{abierto.universidad.ranking_internacional ? ` · #${abierto.universidad.ranking_internacional} internacional` : ""}</dd></>
              )}
              {abierto.curso && <><dt>Curso publicado</dt><dd className="ase-num">{abierto.curso}</dd></>}
              {abierto.notas && <><dt>Observación</dt><dd>{abierto.notas}</dd></>}
            </dl>

            {/* El trámite previo va antes que las fases a propósito: si su
                comunidad lo exige, hay que empezarlo meses antes de postular. */}
            <div>
              <h4 className="ase-sub">Reconocimiento previo del título extranjero</h4>
              {abierto.universidad?.requiere_estudio_titulo === true ? (
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5 }}>
                  <b>{abierto.universidad.tasa_estudio_titulo
                    ? `Obligatorio · tasa de ${eur2(abierto.universidad.tasa_estudio_titulo)}`
                    : "Obligatorio · sin tasa"}</b>
                  {abierto.universidad.proceso_previo ? ` — ${abierto.universidad.proceso_previo}` : ""}
                </p>
              ) : abierto.universidad?.requiere_estudio_titulo === false ? (
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
                  Ninguno. Se presenta el título, las notas, los créditos, las horas,
                  el pasaporte y la nota media.
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--muted)" }}>
                  No consta para esta comunidad.
                </p>
              )}
            </div>

            <div>
              <h4 className="ase-sub">Convocatorias</h4>
              <Fases fases={abierto.fases} />
            </div>

            <div>
              <h4 className="ase-sub">Baremo de admisión</h4>
              <Baremo criterios={abierto.baremo} sinPublicar={abierto.baremo_sin_publicar} />
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {abierto.es_habilitante && <Chip tono="morado">habilitante</Chip>}
              {abierto.es_interuniversitario && <Chip tono="cielo">interuniversitario</Chip>}
              {abierto.tiene_practicas && <Chip tono="verde">con prácticas</Chip>}
            </div>

            <Boton tono="fantasma" tam="sm" icono={Building2}
              onClick={() => navigate(`/backoffice/universidades?buscar=${encodeURIComponent(abierto.universidad?.sigla || abierto.universidad?.nombre || "")}`)}>
              Ver la ficha de la universidad
            </Boton>
          </div>
        )}
      </Ventana>
    </Pagina>
  );
}
