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
  ArrowLeft, ArrowRight, Building2, CalendarClock, Copy, ExternalLink, GraduationCap, Search, SlidersHorizontal, Upload,
} from "lucide-react";
import { boGET } from "../../../services/backofficeApi";
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
        <Chip>{RAMA_ETIQ[m.rama] || m.rama}</Chip>
        <Chip>{m.ects} ECTS</Chip>
        {m.modalidad !== "PRESENCIAL" && <Chip tono="cielo">{String(m.modalidad).toLowerCase()}</Chip>}
        {m.es_habilitante && <Chip tono="morado">habilitante</Chip>}
      </span>

      {plazo && (
        <span style={{ fontSize: 11.5, color: v.tono === "verde" ? "var(--green)" : "var(--muted)", fontWeight: 600 }}>
          {plazo}
        </span>
      )}
    </button>
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
          <div className="ase-rejilla ase-anim" style={{ opacity: cargando ? .6 : 1, transition: "opacity .2s" }}>
            {masteres.map((m) => <Ficha key={m.id_master} m={m} onAbrir={setAbierto} />)}
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
        onCerrar={() => setAbierto(null)}
        titulo={abierto?.nombre}
        subtitulo={abierto ? `${abierto.universidad?.sigla ? `${abierto.universidad.sigla} · ` : ""}${abierto.universidad?.nombre || ""}` : ""}
        ancho="md"
        pie={abierto && (
          <>
            <Boton tono="secundario" icono={Copy} onClick={() => copiar(abierto)}>Copiar resumen</Boton>
            {abierto.universidad?.url && (
              <Boton tono="primario" icono={ExternalLink} onClick={() => window.open(abierto.universidad.url, "_blank", "noopener")}>
                Web de la universidad
              </Boton>
            )}
          </>
        )}
      >
        {abierto && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 160px" }}>
                <span className="ase-precio" style={{ fontSize: 30 }}>{eur(abierto.precio)}</span>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
                  {abierto.precio_origen === "confirmado"
                    ? "Precio confirmado por la universidad"
                    : "Estimado con el crédito de su comunidad para extracomunitarios"}
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
              <dt>Modalidad</dt><dd style={{ textTransform: "capitalize" }}>{String(abierto.modalidad || "").toLowerCase()}</dd>
              <dt>Rama</dt><dd>{RAMA_ETIQ[abierto.rama] || abierto.rama}{abierto.sub_area ? ` · ${abierto.sub_area}` : ""}</dd>
              <dt>Ciudad</dt><dd>{[abierto.universidad?.ciudad, abierto.universidad?.comunidad].filter(Boolean).join(" · ") || "—"}</dd>
              {abierto.universidad?.ranking_nacional && (
                <><dt>Ranking</dt><dd className="ase-num">nº {abierto.universidad.ranking_nacional} de España{abierto.universidad.ranking_internacional ? ` · #${abierto.universidad.ranking_internacional} internacional` : ""}</dd></>
              )}
              {abierto.titulo_acceso && <><dt>Acceso</dt><dd>{abierto.titulo_acceso}</dd></>}
            </dl>

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
