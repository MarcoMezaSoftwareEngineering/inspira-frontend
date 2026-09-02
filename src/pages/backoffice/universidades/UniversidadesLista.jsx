// El buscador de universidades.
//
// Es la fuente de la que sale el informe de másteres del cliente, así que lo
// que importa aquí no es que se vea bonito sino que se pueda contestar rápido a
// las tres preguntas que hace un asesorado: dónde, cuánto cuesta, y si todavía
// llego.
//
// El precio manda en el orden por defecto. Entre Galicia a 738 € y Madrid a
// 5.044 € hay siete veces de diferencia, y para quien viene de Latinoamérica esa
// es la variable que decide antes que el prestigio o la ciudad.
//
// Todo se filtra en el navegador: son medio centenar de filas y así la búsqueda
// responde en cada tecla, sin ir y volver del servidor.
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock, Check, ExternalLink, Link2, Search, SlidersHorizontal, Upload,
} from "lucide-react";
import { boGET, boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { navigate } from "../../../services/navigate";
import MapaDelCatalogo from "../catalogo-masteres/MapaDelCatalogo";
import {
  Pagina, Cabecera, Cuerpo, Boton, Chip, Pill, Campo, Ventana, Vacio, Esqueleto,
} from "../ui";

const LISTA = {
  LISTA_1: { corto: "Económica", tono: "verde" },
  LISTA_2: { corto: "Intermedia", tono: "ambar" },
  LISTA_3: { corto: "Premium", tono: "rojo" },
};

const VENTANA = {
  abierta: { texto: "plazo abierto", tono: "verde" },
  "próxima": { texto: "abre pronto", tono: "petrol" },
  cerrada: { texto: "plazo cerrado", tono: "gris" },
  "sin fecha": { texto: "sin fechas", tono: "ambar" },
};

const VIGILANCIA = {
  activa: { texto: "vigilada", tono: "gris" },
  "sin estrenar": { texto: "sin estrenar", tono: "gris" },
  // Ya no dice «web caída» a secas: el servidor manda la clase concreta, y de
  // siete casos «caída» era falso en seis. La UB funciona; nos bloquea.
  error: { texto: "no se pudo leer", tono: "ambar" },
  apagada: { texto: "sin vigilar", tono: "gris" },
};

const eur = (n) => (n == null ? null : `${Math.round(n).toLocaleString("es-ES")} €`);

/** Sin tildes: quien escribe «malaga» quiere encontrar Málaga. */
const plano = (s) => String(s || "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const fechaCorta = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
};

/** El plazo, en una línea: estado + fase + fecha que importa. */
function plazoEnClaro(v) {
  if (!v) return "";
  const partes = [];
  if (v.fase) partes.push(v.fase);
  if (v.estado === "abierta" && v.hasta) partes.push(`hasta el ${fechaCorta(v.hasta)}`);
  else if (v.estado === "próxima" && v.desde) partes.push(`abre el ${fechaCorta(v.desde)}`);
  return partes.join(" · ");
}

/** Lo que se escribe del enlace; sin protocolo, que sólo estorba. */
const sinProtocolo = (u) => String(u || "").replace(/^https?:\/\//, "");

function Ficha({ u, onAbrir }) {
  const L = LISTA[u.lista_inspira];
  const V = VENTANA[u.ventana?.estado] || VENTANA["sin fecha"];
  const faltan = (u.num_masteres_total || 0) - (u.masteres_cargados || 0);
  const problema = u.fallo?.hay_que_hacer_algo || u.vigila_portada;

  return (
    <button type="button" className="ase-ficha" onClick={() => onAbrir(u)}>
      <span style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <span style={{ minWidth: 0 }}>
          <span className="ase-ficha-t" style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            {u.sigla && <b style={{ color: "var(--primary)", fontSize: 12, letterSpacing: ".02em" }}>{u.sigla}</b>}
            <span>{u.nombre}</span>
          </span>
          <span className="ase-ficha-s" style={{ display: "block", marginTop: 2 }}>
            {[u.ciudad, u.comunidad].filter(Boolean).join(" · ")}
            {u.ranking_internacional ? ` · #${u.ranking_internacional} ${u.ranking_internacional_fte || ""}`.trimEnd() : ""}
          </span>
        </span>
        <span style={{ textAlign: "right", flexShrink: 0 }}>
          {u.precio?.eur_60ects != null ? (
            <>
              <span className="ase-precio" style={{ fontSize: 17, display: "block" }}>{eur(u.precio.eur_60ects)}</span>
              <span style={{ fontSize: 9.5, color: "#9fb3c0" }}>máster de 60 ECTS</span>
            </>
          ) : (
            <span style={{ fontSize: 11, color: "#9fb3c0" }}>precio no cargado</span>
          )}
        </span>
      </span>

      {u.especialidad && (
        <span className="ase-ficha-s" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {u.especialidad}
        </span>
      )}

      <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Chip tono={V.tono} punto>{V.texto}</Chip>
        {L && <Chip tono={L.tono}>{L.corto}</Chip>}
        <Chip>
          <span className="ase-num">{u.masteres_cargados || 0}</span>&nbsp;másteres
          {faltan > 0 && <span style={{ color: "var(--amber)" }}>&nbsp;· faltan ~{faltan}</span>}
        </Chip>
        {u.fallo?.hay_que_hacer_algo && <Chip tono="rojo">{u.fallo.clase}</Chip>}
        {u.vigila_portada && <Chip tono="ambar">vigila la portada</Chip>}
      </span>

      {(plazoEnClaro(u.ventana) || problema) && (
        <span style={{ fontSize: 11.5, fontWeight: 600, color: V.tono === "verde" ? "var(--green)" : "var(--muted)" }}>
          {plazoEnClaro(u.ventana) || "El enlace de preinscripción necesita arreglo"}
        </span>
      )}
    </button>
  );
}

export default function UniversidadesLista() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Desde la ficha de un máster se llega con `?buscar=SIGLA`, ya filtrado.
  const [q, setQ] = useState(() => {
    try { return new URLSearchParams(window.location.search).get("buscar") || ""; } catch { return ""; }
  });
  const [comunidad, setComunidad] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [lista, setLista] = useState("");
  const [ventana, setVentana] = useState("");
  const [orden, setOrden] = useState("precio");
  const [soloProblemas, setSoloProblemas] = useState(false);
  const [masFiltros, setMasFiltros] = useState(false);

  const [abierta, setAbierta] = useState(null);
  const [urlNueva, setUrlNueva] = useState("");
  const [guardando, setGuardando] = useState(false);

  /** Volver a pedirlo tras editar algo. */
  const recargar = useCallback(() => {
    return boGET("/backoffice/universidades")
      .then((r) => { if (r?.ok) setDatos(r); return r; })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    let vivo = true;
    boGET("/backoffice/universidades")
      .then((r) => { if (vivo && r?.ok) setDatos(r); })
      .finally(() => { if (vivo) setCargando(false); });
    // Si el asesor sale de la pantalla mientras llega la respuesta, no se
    // escribe sobre un componente que ya no está.
    return () => { vivo = false; };
  }, []);

  const todas = useMemo(() => datos?.universidades || [], [datos]);
  const facetas = datos?.facetas || {};

  // Las ciudades se recortan a la comunidad elegida: ofrecer las cuarenta y
  // ocho cuando ya has dicho «Andalucía» es ruido.
  const ciudades = useMemo(() => {
    const base = comunidad ? todas.filter((u) => u.comunidad === comunidad) : todas;
    return [...new Set(base.map((u) => u.ciudad).filter(Boolean))].sort();
  }, [todas, comunidad]);

  const visibles = useMemo(() => {
    const busca = plano(q);
    const filtradas = todas.filter((u) => {
      if (comunidad && u.comunidad !== comunidad) return false;
      if (ciudad && u.ciudad !== ciudad) return false;
      if (lista && u.lista_inspira !== lista) return false;
      if (ventana && u.ventana?.estado !== ventana) return false;
      if (soloProblemas && !u.fallo?.hay_que_hacer_algo && !u.vigila_portada) return false;
      if (!busca) return true;
      return [u.nombre, u.sigla, u.ciudad, u.comunidad, u.especialidad]
        .some((c) => plano(c).includes(busca));
    });

    const cmp = {
      // Sin precio al final: no se ordena por un dato que falta.
      precio: (a, b) => (a.precio?.eur_60ects ?? 1e9) - (b.precio?.eur_60ects ?? 1e9),
      nombre: (a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"),
      masteres: (a, b) => (b.masteres_cargados || 0) - (a.masteres_cargados || 0),
      ranking: (a, b) => (a.ranking_internacional ?? 1e9) - (b.ranking_internacional ?? 1e9),
    }[orden];

    return [...filtradas].sort(cmp);
  }, [todas, q, comunidad, ciudad, lista, ventana, soloProblemas, orden]);

  // Lo que de verdad hay que arreglar: enlaces muertos, y los que apuntan a la
  // portada. Un 403 no es trabajo pendiente, es una web que no nos deja mirar.
  const rotas = todas.filter((u) => u.fallo?.hay_que_hacer_algo).length;
  const bloqueadas = todas.filter(
    (u) => u.vigilancia === "error" && !u.fallo?.hay_que_hacer_algo).length;
  const portadas = todas.filter((u) => u.vigila_portada).length;
  const abiertas = todas.filter((u) => u.ventana?.estado === "abierta").length;
  const masteresCargados = todas.reduce((n, u) => n + (u.masteres_cargados || 0), 0);

  const hayFiltro = q || comunidad || ciudad || lista || ventana || soloProblemas;
  const limpiar = () => {
    setQ(""); setComunidad(""); setCiudad(""); setLista(""); setVentana(""); setSoloProblemas(false);
  };

  // La ventana trabaja sobre la fila viva: si se guarda el enlace y se
  // recarga, la ficha abierta tiene que reflejarlo sin cerrarse.
  const seleccionada = abierta ? todas.find((u) => u.id_universidad === abierta) || null : null;

  function abrir(u) {
    setAbierta(u.id_universidad);
    setUrlNueva(u.url_preinscripcion || u.url_masteres || "");
  }

  async function guardarUrl() {
    if (!seleccionada || guardando) return;
    const limpia = urlNueva.trim();
    if (limpia && !/^https?:\/\//i.test(limpia)) {
      dialog.toast("El enlace tiene que empezar por http:// o https://", "error");
      return;
    }
    setGuardando(true);
    try {
      const r = await boPATCH(`/backoffice/universidades/${seleccionada.id_universidad}`, {
        url_preinscripcion: limpia || null,
      });
      if (r?.ok) {
        dialog.toast("Guardado · se vuelve a vigilar desde cero", "exito");
        await recargar();
      } else {
        dialog.toast(r?.msg || "No se pudo guardar", "error");
      }
    } catch {
      dialog.toast("No se pudo guardar", "error");
    } finally {
      setGuardando(false);
    }
  }

  const stats = [
    { n: todas.length, l: "universidades" },
    { n: abiertas, l: "con plazo abierto", tono: "ok", onClick: () => { setVentana(ventana === "abierta" ? "" : "abierta"); } },
    { n: rotas + portadas, l: soloProblemas ? "por arreglar · filtrando" : "con el enlace por arreglar", tono: rotas + portadas ? "alerta" : undefined, onClick: () => setSoloProblemas((v) => !v) },
    { n: masteresCargados, l: "másteres cargados", tono: "cielo", onClick: () => navigate("/backoffice/masteres") },
  ];

  const S = seleccionada;
  const SV = S ? (VENTANA[S.ventana?.estado] || VENTANA["sin fecha"]) : null;
  const SG = S ? (VIGILANCIA[S.vigilancia] || VIGILANCIA.apagada) : null;
  const SL = S ? LISTA[S.lista_inspira] : null;
  const urlCambiada = S && urlNueva.trim() !== (S.url_preinscripcion || S.url_masteres || "");

  return (
    <Pagina>
      <Cabecera
        eyebrow="Catálogo"
        titulo="Universidades"
        subtitulo="De aquí sale el informe de másteres. Precio por comunidad según decreto, plazo vivo y el estado del enlace que se vigila."
        acciones={
          <>
            <Boton tono="cristal" icono={CalendarClock} onClick={() => navigate("/backoffice/tracker-universidades")}>Plazos</Boton>
            <Boton tono="cristal" icono={Upload} onClick={() => navigate("/backoffice/sistematizador")}>Cargar oferta</Boton>
          </>
        }
        stats={stats}
      />

      <Cuerpo>
        <MapaDelCatalogo activo="universidades" />

        {portadas > 0 && (
          <div className="ase-tarjeta" style={{ padding: "12px 16px", borderColor: "rgba(185,119,14,.35)", background: "#fffaf1" }}>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink)", lineHeight: 1.55 }}>
              <b>{portadas} de {todas.length} vigilan la portada de la universidad</b>, no su página
              de másteres. Una portada cambia cada vez que publican una noticia —o sea, avisa de
              nada— y no cambia cuando abre la preinscripción, que es justo lo que se quería
              detectar. El enlace se corrige desde la ficha de cada universidad.
            </p>
            {bloqueadas > 0 && (
              <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
                Otras {bloqueadas} no se pueden leer porque su web rechaza las consultas
                automáticas. Ésas funcionan: no hay nada que arreglar por nuestra parte.
              </p>
            )}
          </div>
        )}

        <div className="ase-pegajosa">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="ase-buscar" style={{ flex: 1 }}>
              <Search />
              <input className="ase-campo" value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Universidad, sigla, ciudad o especialidad…" />
            </div>
            <Boton tono={masFiltros ? "primario" : "secundario"} icono={SlidersHorizontal} onClick={() => setMasFiltros((v) => !v)}
              aria-expanded={masFiltros}>
              <span className="hidden sm:inline">Filtros</span>
            </Boton>
          </div>

          <div className="ase-pills" style={{ marginTop: 8, alignItems: "center" }}>
            <Pill on={!lista} onClick={() => setLista("")}>Cualquier precio</Pill>
            {["LISTA_1", "LISTA_2", "LISTA_3"]
              .filter((l) => (facetas.listas || []).includes(l))
              .map((l) => (
                <Pill key={l} on={lista === l} n={todas.filter((u) => u.lista_inspira === l).length} onClick={() => setLista(lista === l ? "" : l)}>
                  {LISTA[l].corto}
                </Pill>
              ))}
            <label className="ase-toggle" style={{ marginLeft: "auto" }}>
              <input type="checkbox" checked={soloProblemas} onChange={(e) => setSoloProblemas(e.target.checked)} />
              <i />
              <span className="hidden sm:inline">Sólo por arreglar</span>
            </label>
          </div>

          {masFiltros && (
            <div className="ase-filtros ase-entra" style={{ marginTop: 10 }}>
              <Campo etiqueta="Comunidad">
                <select className="ase-campo" value={comunidad} onChange={(e) => { setComunidad(e.target.value); setCiudad(""); }}>
                  <option value="">Toda España</option>
                  {(facetas.comunidades || []).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Campo>
              <Campo etiqueta="Ciudad">
                <select className="ase-campo" value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
                  <option value="">Todas</option>
                  {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Campo>
              <Campo etiqueta="Plazo">
                <select className="ase-campo" value={ventana} onChange={(e) => setVentana(e.target.value)}>
                  <option value="">Cualquiera</option>
                  <option value="abierta">Plazo abierto</option>
                  <option value="próxima">Abre pronto</option>
                  <option value="cerrada">Plazo cerrado</option>
                  <option value="sin fecha">Sin fechas cargadas</option>
                </select>
              </Campo>
              <Campo etiqueta="Orden">
                <select className="ase-campo" value={orden} onChange={(e) => setOrden(e.target.value)}>
                  <option value="precio">Más barata primero</option>
                  <option value="nombre">Por nombre</option>
                  <option value="masteres">Más másteres cargados</option>
                  <option value="ranking">Mejor ranking</option>
                </select>
              </Campo>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--muted)" }}>
            {cargando ? "Cargando…" : visibles.length === todas.length
              ? <><b className="ase-num" style={{ color: "var(--ink)" }}>{todas.length}</b> universidades</>
              : <><b className="ase-num" style={{ color: "var(--ink)" }}>{visibles.length}</b> de {todas.length}</>}
          </p>
          {hayFiltro && <Boton tono="fantasma" tam="xs" onClick={limpiar}>Quitar filtros</Boton>}
        </div>

        {cargando ? (
          <Esqueleto filas={5} alto={110} />
        ) : visibles.length === 0 ? (
          <Vacio titulo="Ninguna con estos filtros" texto="Prueba quitando alguno."
            acciones={<Boton tono="secundario" onClick={limpiar}>Quitar filtros</Boton>} />
        ) : (
          <div className="ase-rejilla ase-anim">
            {visibles.map((u) => <Ficha key={u.id_universidad} u={u} onAbrir={abrir} />)}
          </div>
        )}
      </Cuerpo>

      {/* ── Ventana: la ficha de la universidad, con el enlace editable ── */}
      <Ventana
        abierta={Boolean(S)}
        onCerrar={() => setAbierta(null)}
        titulo={S ? `${S.sigla ? `${S.sigla} · ` : ""}${S.nombre}` : ""}
        subtitulo={S ? [S.ciudad, S.comunidad].filter(Boolean).join(" · ") : ""}
        ancho="md"
        pie={S && (
          <>
            <Boton tono="secundario" icono={Upload} onClick={() => navigate(`/backoffice/sistematizador?universidad=${S.id_universidad}`)}>
              Cargar su oferta
            </Boton>
            {(S.url_preinscripcion || S.url_masteres) && (
              <Boton tono="primario" icono={ExternalLink}
                onClick={() => window.open(S.url_preinscripcion || S.url_masteres, "_blank", "noopener")}>
                Abrir su web
              </Boton>
            )}
          </>
        )}
      >
        {S && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 160px" }}>
                {S.precio?.eur_60ects != null ? (
                  <>
                    <span className="ase-precio" style={{ fontSize: 30 }}>{eur(S.precio.eur_60ects)}</span>
                    <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
                      un máster de 60 ECTS{S.precio.normativa ? ` · ${S.precio.normativa}` : ""}
                    </p>
                  </>
                ) : (
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--muted)" }}>Precio no cargado todavía.</p>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SL && <Chip tono={SL.tono}>{SL.corto}</Chip>}
                <Chip tono={SV.tono} punto>{SV.texto}</Chip>
              </div>
            </div>

            {plazoEnClaro(S.ventana) && (
              <div className="ase-tarjeta" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, background: SV.tono === "verde" ? "var(--green-soft)" : "var(--ground)", borderColor: "transparent" }}>
                <CalendarClock size={16} color={SV.tono === "verde" ? "#1D6A4A" : "#62808f"} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: SV.tono === "verde" ? "var(--green)" : "var(--ink)" }}>
                  {plazoEnClaro(S.ventana)}
                </span>
                <Boton tono="fantasma" tam="xs" style={{ marginLeft: "auto" }} onClick={() => navigate("/backoffice/tracker-universidades")}>Ver plazos</Boton>
              </div>
            )}

            <dl className="ase-kv">
              {S.especialidad && <><dt>Perfil</dt><dd>{S.especialidad}</dd></>}
              {S.ranking_internacional && (
                <><dt>Ranking</dt><dd className="ase-num">#{S.ranking_internacional}{S.ranking_internacional_fte ? ` ${S.ranking_internacional_fte}` : ""}</dd></>
              )}
              <dt>Másteres</dt>
              <dd className="ase-num">
                {S.masteres_cargados || 0} cargados
                {(S.num_masteres_total || 0) > (S.masteres_cargados || 0) && (
                  <span style={{ color: "var(--amber)" }}> · faltan ~{(S.num_masteres_total || 0) - (S.masteres_cargados || 0)} de {S.num_masteres_total}</span>
                )}
              </dd>
              <dt>Vigilancia</dt>
              <dd>
                {S.fallo ? (
                  <span style={{ color: S.fallo.hay_que_hacer_algo ? "var(--red)" : "var(--amber)", fontWeight: 600 }}>{S.fallo.clase}</span>
                ) : SG.texto}
                {S.fallo?.dice && <span style={{ display: "block", fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{S.fallo.dice}</span>}
                {S.vigila_portada && (
                  <span style={{ display: "block", fontSize: 11.5, color: "var(--amber)", marginTop: 2 }}>
                    Se vigila la portada, no la página de másteres: el enlace de abajo es el que hay que corregir.
                  </span>
                )}
              </dd>
              {S.url_masteres && (
                <><dt>Másteres</dt><dd><a href={S.url_masteres} target="_blank" rel="noreferrer" style={{ color: "#046C8C" }}>{sinProtocolo(S.url_masteres)}</a></dd></>
              )}
            </dl>

            {/* El enlace se edita aquí, no en un prompt del navegador: se ve
                lo que había, se corrige y se guarda con un botón claro. */}
            <div className="ase-tarjeta" style={{ padding: 14 }}>
              <span className="ase-rotulo" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Link2 size={13} /> Enlace de preinscripción que se vigila
              </span>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <input className="ase-campo ase-campo-mono" style={{ flex: "1 1 220px" }} value={urlNueva}
                  onChange={(e) => setUrlNueva(e.target.value)} placeholder="https://…" inputMode="url" spellCheck={false} />
                <Boton tono={urlCambiada ? "primario" : "secundario"} icono={Check} cargando={guardando} disabled={!urlCambiada} onClick={guardarUrl}>
                  Guardar
                </Boton>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
                Tiene que ser la página de admisión a másteres, no la portada. Al guardar, la vigilancia
                empieza desde cero con el enlace nuevo.
              </p>
            </div>
          </div>
        )}
      </Ventana>
    </Pagina>
  );
}
