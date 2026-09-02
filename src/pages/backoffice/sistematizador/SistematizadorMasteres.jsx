// El sistematizador: la puerta de carga del catálogo.
//
// No es un tercer catálogo. Es lo único que ESCRIBE en el de másteres: se pega
// la oferta de una universidad —de su web o de un Excel—, se ve qué se ha
// entendido, y se carga. A partir de ahí esos másteres salen en el buscador y
// pueden acabar en el informe de un asesorado.
//
// El hueco que viene a tapar es grande: hay 1.133 másteres cargados de los casi
// 3.900 que ofertan las universidades ya dadas de alta. La Universidad de
// Barcelona tiene dos y la Complutense doce, así que a quien pide Madrid se le
// ofrecen treinta y cinco opciones cuando existen ochocientas.
//
// La revisión humana en medio no es un trámite: un máster mal cargado sale
// luego en un informe con el nombre de Inspira encima.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, ClipboardPaste, Eraser, ExternalLink, FileUp, GraduationCap, Search, Upload,
} from "lucide-react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { navigate } from "../../../services/navigate";
import MapaDelCatalogo from "../catalogo-masteres/MapaDelCatalogo";
import {
  Pagina, Cabecera, Cuerpo, Boton, Chip, Campo, Ventana, Vacio,
} from "../ui";

const RAMAS = [
  ["ARTES_HUMANIDADES", "Artes y Humanidades"],
  ["CIENCIAS", "Ciencias"],
  ["CIENCIAS_SALUD", "Ciencias de la Salud"],
  ["CIENCIAS_SOCIALES_JURIDICAS", "Ciencias Sociales y Jurídicas"],
  ["INGENIERIA_ARQUITECTURA", "Ingeniería y Arquitectura"],
];
const RAMA_ETIQ = Object.fromEntries(RAMAS);

const MODALIDADES = [
  ["PRESENCIAL", "Presencial"],
  ["SEMIPRESENCIAL", "Semipresencial"],
  ["VIRTUAL", "Virtual"],
];
const MODALIDAD_VALIDA = new Set(MODALIDADES.map(([v]) => v));

// El servidor no acepta más de quinientos por petición. Una oferta entera se
// parte sola en tandas en vez de obligar a trocear el archivo a mano.
const POR_TANDA = 500;

/** Nombres de columna que se reconocen en la cabecera de un archivo. */
const COLUMNAS = {
  nombre: ["master", "máster", "nombre", "titulo", "título", "programa", "denominacion", "denominación", "estudio"],
  ects: ["ects", "creditos", "créditos"],
  rama: ["rama", "area", "área", "ambito", "ámbito"],
  url: ["url", "url_master", "enlace", "web", "ficha", "link"],
  modalidad: ["modalidad", "presencialidad"],
};

const sinTildes = (s) => String(s || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/**
 * Qué columna es cada una, leyendo la primera línea.
 *
 * Devuelve null si esa línea no parece una cabecera: hay que distinguir un
 * archivo exportado —que la trae— de una lista de nombres pegada de una web,
 * cuya primera línea ya es un máster y no puede perderse.
 */
function leerCabecera(partes) {
  const mapa = {};
  partes.forEach((p, i) => {
    const t = sinTildes(p).replace(/\s+/g, "_");
    for (const [campo, alias] of Object.entries(COLUMNAS)) {
      if (mapa[campo] === undefined && alias.some((a) => t === sinTildes(a) || t === sinTildes(a).replace(/\s+/g, "_"))) {
        mapa[campo] = i;
      }
    }
  });
  // Sin la columna del nombre no hay nada que mapear.
  return mapa.nombre === undefined ? null : mapa;
}

/**
 * Interpreta lo que se ha pegado.
 *
 * Acepta tres formas, porque son las tres que llegan de verdad:
 *  · el archivo que exporta una universidad, con su cabecera y sus columnas en
 *    cualquier orden (universidad;sigla;…;master;rama;…;url_master);
 *  · un Excel recortado a mano, sin cabecera, con el orden nombre · ECTS ·
 *    rama · enlace;
 *  · una lista suelta de nombres copiada de una web.
 *
 * Adivinar el separador y las columnas evita obligar a nadie a reordenar un
 * archivo en Excel antes de cargarlo, que era el paso donde esto se atascaba.
 */
function interpretar(texto) {
  const lineas = String(texto || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lineas.length) return [];

  const sep = lineas[0].includes("\t") ? "\t"
    : lineas[0].includes(";") ? ";"
      : lineas[0].split(",").length > 2 ? "," : null;

  const trocear = (l) => sep ? l.split(sep).map((p) => p.trim().replace(/^"|"$/g, "")) : [l];

  const cabecera = sep ? leerCabecera(trocear(lineas[0])) : null;
  const cuerpo = cabecera ? lineas.slice(1) : lineas;
  // Sin cabecera se mantiene el orden de siempre: nombre, ECTS, rama, enlace.
  const col = cabecera || { nombre: 0, ects: 1, rama: 2, url: 3 };

  return cuerpo.map((l, i) => {
    const partes = trocear(l);
    const de = (campo) => col[campo] === undefined ? "" : String(partes[col[campo]] || "").trim();
    // El nombre suele venir con la numeración de la web pegada delante.
    const limpio = de("nombre").replace(/^\d+[.)\-\s]+/, "").trim();
    const ects = de("ects");
    const rama = de("rama").toUpperCase();
    const url = de("url");
    const modalidad = de("modalidad").toUpperCase();
    return {
      linea: i + 1 + (cabecera ? 1 : 0),
      nombre: limpio,
      ects: /^\d{2,3}$/.test(ects) ? Number(ects) : null,
      rama: RAMA_ETIQ[rama] ? rama : null,
      url: /^https?:\/\//.test(url) ? url : null,
      modalidad: MODALIDAD_VALIDA.has(modalidad) ? modalidad : null,
    };
  }).filter((m) => m.nombre);
}

/** Compara sin tildes ni mayúsculas: «Máster en X» y «MASTER EN X» son el mismo. */
const clave = (s) => String(s || "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const PASOS = [
  { n: 1, t: "La universidad", x: "De cuál es la oferta que vas a pegar." },
  { n: 2, t: "Pegar la lista", x: "De su web o de un Excel, un máster por línea." },
  { n: 3, t: "Revisar y cargar", x: "Lo que se ha entendido, antes de que entre al catálogo." },
];

export default function SistematizadorMasteres() {
  const [universidades, setUniversidades] = useState([]);
  // Desde la ficha de una universidad se llega con `?universidad=ID`.
  const [idUni, setIdUni] = useState(() => {
    try { return new URLSearchParams(window.location.search).get("universidad") || ""; } catch { return ""; }
  });
  const [texto, setTexto] = useState("");
  const [ramaPorDefecto, setRamaPorDefecto] = useState("");
  const [modalidad, setModalidad] = useState("PRESENCIAL");
  const [cargando, setCargando] = useState(false);
  // Cuando la oferta pasa de quinientos se sube en tandas: el progreso se ve.
  const [progreso, setProgreso] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [confirmar, setConfirmar] = useState(false);
  const [archivo, setArchivo] = useState("");
  const inputArchivo = useRef(null);

  const recargar = useCallback(() => {
    boGET("/backoffice/universidades")
      .then((r) => { if (r?.ok) setUniversidades(r.universidades || []); })
      .catch(() => {});
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  const uni = useMemo(
    () => universidades.find((u) => String(u.id_universidad) === String(idUni)) || null,
    [universidades, idUni],
  );

  const filas = useMemo(() => interpretar(texto), [texto]);

  // Repetidos dentro de lo pegado. Pasa constantemente: las webs listan el
  // mismo máster en dos ramas, y sin avisar se cargaría dos veces.
  const analizadas = useMemo(() => {
    const vistos = new Map();
    return filas.map((f) => {
      const k = clave(f.nombre);
      const repetido = vistos.has(k);
      if (!repetido) vistos.set(k, f.linea);
      return { ...f, repetido, repiteA: repetido ? vistos.get(k) : null };
    });
  }, [filas]);

  const nuevas = useMemo(() => analizadas.filter((f) => !f.repetido), [analizadas]);
  const repetidos = analizadas.length - nuevas.length;
  const sinRama = nuevas.filter((f) => !f.rama && !ramaPorDefecto).length;
  const sinUrl = nuevas.filter((f) => !f.url).length;

  const limpiar = useCallback(() => { setTexto(""); setResultado(null); setArchivo(""); }, []);

  /**
   * Abrir el archivo tal cual lo exporta la universidad, sin pasar por Excel.
   * Se lee en el navegador y cae en el mismo cuadro de texto, así que lo que se
   * carga es lo que se ve — no hay una vía secreta que se salte la revisión.
   */
  const abrirArchivo = useCallback((file) => {
    if (!file) return;
    const lector = new FileReader();
    lector.onload = () => {
      setTexto(String(lector.result || ""));
      setArchivo(file.name);
      setResultado(null);
    };
    lector.onerror = () => dialog.toast("No se pudo leer el archivo", "error");
    // Los exportados de Excel en español suelen venir en UTF-8 con BOM; el
    // lector lo quita solo al indicar la codificación.
    lector.readAsText(file, "utf-8");
  }, []);

  // En qué paso se está, deducido de lo hecho: no hay que pulsar «siguiente».
  const paso = !uni ? 1 : !filas.length ? 2 : 3;

  const totalCargados = universidades.reduce((n, u) => n + (u.masteres_cargados || 0), 0);
  const totalOfertados = universidades.reduce((n, u) => n + (u.num_masteres_total || 0), 0);
  const sinOferta = universidades.filter((u) => !(u.masteres_cargados || 0)).length;

  async function cargar() {
    if (!uni || !nuevas.length || cargando) return;
    setCargando(true);
    setResultado(null);

    // El servidor acepta quinientos por petición; una oferta entera se parte
    // sola. Si una tanda falla se para ahí y se dice cuántos entraron: dejarlo
    // a medias en silencio sería peor que no cargar nada.
    const tandas = [];
    for (let i = 0; i < nuevas.length; i += POR_TANDA) tandas.push(nuevas.slice(i, i + POR_TANDA));

    let creados = 0;
    let repetidosServidor = 0;
    let ultimo = null;
    let fallo = null;

    try {
      for (let i = 0; i < tandas.length; i++) {
        if (tandas.length > 1) setProgreso({ tanda: i + 1, total: tandas.length });
        const r = await boPOST("/backoffice/masteres/masivo", {
          id_universidad: uni.id_universidad,
          masteres: tandas[i].map((f) => ({
            nombre: f.nombre,
            ects: f.ects,
            rama: f.rama || ramaPorDefecto || null,
            modalidad: f.modalidad || modalidad,
            url: f.url,
          })),
        });
        if (!r?.ok) { fallo = r?.msg || "No se pudo cargar"; break; }
        creados += r.creados || 0;
        repetidosServidor += r.repetidos || 0;
        ultimo = r;
      }
    } catch (e) {
      fallo = e.message || "No se pudo cargar";
    }

    setProgreso(null);
    setCargando(false);

    if (ultimo) {
      setResultado({ ...ultimo, creados, repetidos: repetidosServidor });
      setConfirmar(false);
      if (creados) { setTexto(""); setArchivo(""); recargar(); }
    }
    if (fallo) {
      dialog.toast(creados ? `${fallo}. Se cargaron ${creados} antes de parar.` : fallo, "error");
    } else {
      dialog.toast(
        creados ? `${creados} másteres cargados en ${uni.sigla}` : "Ninguno nuevo: ya estaban todos",
        creados ? "exito" : "info",
      );
    }
  }

  const stats = [
    { n: totalCargados, l: "másteres en el catálogo", tono: "cielo", onClick: () => navigate("/backoffice/masteres") },
    { n: Math.max(0, totalOfertados - totalCargados), l: "por cargar todavía", tono: totalOfertados > totalCargados ? "alerta" : undefined },
    { n: sinOferta, l: "universidades sin ninguno", onClick: () => navigate("/backoffice/universidades") },
  ];

  return (
    <Pagina>
      <Cabecera
        eyebrow="Catálogo"
        titulo="Sistematizador de másteres"
        subtitulo="Cargar la oferta de una universidad sin teclearla una por una. Lo que entra por aquí sale en el buscador y puede acabar en el informe de un asesorado."
        acciones={
          <Boton tono="cristal" icono={Search} onClick={() => navigate("/backoffice/masteres")}>Ver el buscador</Boton>
        }
        stats={stats}
      />

      <Cuerpo>
        <MapaDelCatalogo activo="sistematizador" />

        {/* Los tres pasos, con el actual marcado. Se deduce de lo hecho. */}
        <div className="ase-pasos ase-anim">
          {PASOS.map((p) => (
            <div key={p.n} className="ase-paso" data-on={paso === p.n ? "1" : "0"} data-papel={p.n < paso ? "salida" : undefined} style={{ cursor: "default" }}>
              <span className="ase-paso-orden">{p.n < paso ? "Hecho" : paso === p.n ? "Ahora" : "Después"}</span>
              <span className="ase-paso-t"><span className="ase-paso-num">{p.n}</span>{p.t}</span>
              <span className="ase-paso-x">{p.x}</span>
            </div>
          ))}
        </div>

        {resultado && (
          <div className="ase-tarjeta ase-entra" style={{ padding: "14px 16px", borderColor: "rgba(29,106,74,.4)", background: "var(--green-soft)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 240px" }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#14532d" }}>
                {resultado.creados} cargados en {resultado.universidad}
                {resultado.repetidos ? ` · ${resultado.repetidos} ya estaban` : ""}
              </p>
              {!resultado.precio_calculado && (
                <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--amber)", lineHeight: 1.5 }}>
                  Su comunidad no tiene precio de crédito cargado, así que estos másteres
                  quedan sin importe. Hay que ponerlo antes de que salgan en un informe.
                </p>
              )}
            </div>
            <Boton tono="primario" icono={Search} onClick={() => navigate("/backoffice/masteres")}>Verlos en el buscador</Boton>
          </div>
        )}

        {/* El formulario a la izquierda y lo interpretado a la derecha; en el
            móvil, uno debajo del otro. */}
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2" style={{ alignItems: "start" }}>
          <div className="ase-lista">
            <div className="ase-tarjeta ase-tarjeta-p" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="ase-rotulo">1 · Universidad</span>
              <Campo etiqueta="De cuál es la oferta">
                <select className="ase-campo" value={idUni} onChange={(e) => { setIdUni(e.target.value); setResultado(null); }}>
                  <option value="">Elige una…</option>
                  {universidades.map((u) => (
                    <option key={u.id_universidad} value={u.id_universidad}>
                      {u.sigla} · {u.nombre} ({u.masteres_cargados} cargados)
                    </option>
                  ))}
                </select>
              </Campo>

              {uni && (
                <div className="ase-entra" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "var(--ground)", borderRadius: 12, padding: "10px 12px", fontSize: 12 }}>
                  <GraduationCap size={16} color="#4E9EE8" />
                  <span style={{ color: "var(--muted)", flex: "1 1 160px" }}>
                    Tiene <b className="ase-num" style={{ color: "var(--ink)" }}>{uni.masteres_cargados}</b> cargados
                    {uni.num_masteres_total
                      ? <> de <b className="ase-num" style={{ color: "var(--ink)" }}>~{uni.num_masteres_total}</b> que oferta</>
                      : null}
                    {uni.comunidad ? ` · ${uni.comunidad}` : ""}
                  </span>
                  {uni.url_masteres && (
                    <Boton tono="fantasma" tam="xs" icono={ExternalLink} onClick={() => window.open(uni.url_masteres, "_blank", "noopener")}>
                      Abrir su oferta
                    </Boton>
                  )}
                </div>
              )}

              <div className="ase-filtros">
                <Campo etiqueta="Rama por defecto">
                  <select className="ase-campo" value={ramaPorDefecto} onChange={(e) => setRamaPorDefecto(e.target.value)}>
                    <option value="">Sólo si la lista no la trae</option>
                    {RAMAS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Campo>
                <Campo etiqueta="Modalidad">
                  <select className="ase-campo" value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
                    {MODALIDADES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Campo>
              </div>
            </div>

            <div className="ase-tarjeta ase-tarjeta-p" style={{ display: "flex", flexDirection: "column", gap: 10, opacity: uni ? 1 : .6, transition: "opacity .3s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span className="ase-rotulo" style={{ flex: 1 }}>2 · Pega la lista o abre el archivo</span>
                <Boton tono="fantasma" tam="xs" icono={FileUp} onClick={() => inputArchivo.current?.click()}>
                  Abrir archivo
                </Boton>
                {texto && <Boton tono="fantasma" tam="xs" icono={Eraser} onClick={limpiar}>Vaciar</Boton>}
              </div>
              <input
                ref={inputArchivo}
                type="file"
                accept=".csv,.tsv,.txt"
                className="hidden"
                onChange={(e) => { abrirArchivo(e.target.files?.[0]); e.target.value = ""; }}
              />
              {archivo && (
                <p style={{ margin: 0, fontSize: 11.5, color: "var(--green)", display: "flex", alignItems: "center", gap: 6 }}>
                  <FileUp size={13} /> {archivo}
                </p>
              )}
              <textarea className="ase-campo ase-campo-mono" rows={12} value={texto} onChange={(e) => setTexto(e.target.value)}
                style={{ height: "auto", resize: "vertical" }}
                placeholder={"Un máster por línea.\n\nDel archivo de la universidad, con su cabecera:\nmaster;rama;url_master;ects\n\nDe un Excel recortado, sin cabecera:\nNombre\tECTS\tRAMA\tURL\n\nO sólo los nombres, uno por línea."} />
              <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", lineHeight: 1.55 }}>
                Se reconoce el separador solo —tabulador, punto y coma o coma—, se leen las
                columnas por su nombre si el archivo trae cabecera, en cualquier orden, y se
                quita la numeración que arrastran las webs al copiar. Más de {POR_TANDA} se
                cargan en tandas. El precio no se pide: se calcula con el crédito de su
                comunidad, que es lo que paga un extracomunitario.
              </p>
            </div>
          </div>

          <div className="ase-lista">
            <div className="ase-tarjeta ase-tarjeta-p" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="ase-rotulo">3 · Lo que se va a cargar</span>

              {!filas.length ? (
                <Vacio icono={ClipboardPaste} titulo="Pega la lista y aparece aquí"
                  texto={uni ? `Se cargará en ${uni.sigla}. Cada línea se lee antes de entrar: nombre, créditos, rama y enlace si los trae.` : "Primero elige la universidad."} />
              ) : (
                <>
                  <div className="ase-pills">
                    <Chip tono="verde" punto>{nuevas.length} se cargarían</Chip>
                    {repetidos > 0 && <Chip tono="ambar">{repetidos} repetidos</Chip>}
                    {sinRama > 0 && <Chip>{sinRama} sin rama</Chip>}
                    {sinUrl > 0 && <Chip>{sinUrl} sin enlace</Chip>}
                  </div>

                  <div style={{ maxHeight: "24rem", overflowY: "auto", border: "1px solid var(--line)", borderRadius: 12, background: "#fff" }}>
                    {analizadas.map((f) => (
                      <div key={f.linea} style={{ display: "flex", gap: 10, padding: "8px 12px", borderBottom: "1px solid #eef2f6", background: f.repetido ? "rgba(254,243,231,.6)" : "transparent" }}>
                        <span className="ase-num" style={{ fontSize: 10, color: "#b7c6d1", width: 22, flexShrink: 0, paddingTop: 2 }}>{f.linea}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.35, color: f.repetido ? "#9fb3c0" : "var(--ink)", textDecoration: f.repetido ? "line-through" : "none" }}>
                            {f.nombre}
                          </p>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2, fontSize: 10.5, color: "var(--muted)" }}>
                            {f.repetido ? (
                              <span style={{ color: "var(--amber)" }}>repite la línea {f.repiteA}</span>
                            ) : (
                              <>
                                <span>{RAMA_ETIQ[f.rama || ramaPorDefecto] || "sin rama"}</span>
                                <span className="ase-num">{f.ects || 60} ECTS</span>
                                {f.url && <span style={{ color: "var(--green)" }}>con enlace</span>}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Lo que no se ha dicho se rellena solo, y hay que decirlo antes
                      de cargar, no descubrirlo después en la ficha. */}
                  <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", lineHeight: 1.55 }}>
                    Lo que la lista no traiga se completa: 60 créditos y un curso de duración
                    {ramaPorDefecto ? "" : ", y la rama de Sociales y Jurídicas"}. Todo se puede
                    corregir después en el catálogo.
                  </p>

                  <Boton tono="cta" tam="lg" icono={Upload} disabled={!uni || !nuevas.length || cargando} onClick={() => setConfirmar(true)} style={{ width: "100%" }}>
                    {!uni ? "Elige primero la universidad" : `Cargar ${nuevas.length} másteres en ${uni.sigla}`}
                  </Boton>
                </>
              )}
            </div>
          </div>
        </div>
      </Cuerpo>

      {/* ── Ventana: confirmar la carga ── */}
      <Ventana
        abierta={confirmar}
        onCerrar={() => !cargando && setConfirmar(false)}
        titulo={uni ? `Cargar ${nuevas.length} másteres en ${uni.sigla}` : ""}
        subtitulo="Se añaden al catálogo y podrán salir en el informe de un asesorado."
        ancho="sm"
        pie={
          <>
            <Boton tono="secundario" onClick={() => setConfirmar(false)} disabled={cargando}>Revisar más</Boton>
            <Boton tono="cta" icono={ArrowRight} cargando={cargando} onClick={cargar}>
              {progreso ? `Tanda ${progreso.tanda} de ${progreso.total}…` : "Cargar ahora"}
            </Boton>
          </>
        }
      >
        {uni && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <dl className="ase-kv">
              <dt>Universidad</dt><dd>{uni.sigla} · {uni.nombre}</dd>
              <dt>Másteres</dt><dd className="ase-num">
                {nuevas.length} nuevos{repetidos ? ` · ${repetidos} repetidos que se saltan` : ""}
                {nuevas.length > POR_TANDA ? ` · en ${Math.ceil(nuevas.length / POR_TANDA)} tandas` : ""}
              </dd>
              <dt>Rama</dt><dd>{ramaPorDefecto ? `${RAMA_ETIQ[ramaPorDefecto]} si la línea no la trae` : sinRama ? `${sinRama} sin rama → Sociales y Jurídicas` : "La que trae cada línea"}</dd>
              <dt>Modalidad</dt><dd style={{ textTransform: "capitalize" }}>{modalidad.toLowerCase()}</dd>
              <dt>Precio</dt><dd>{uni.precio?.eur_60ects != null ? `Se calcula con el crédito de ${uni.comunidad}` : <span style={{ color: "var(--amber)" }}>Su comunidad no tiene precio cargado: quedarán sin importe</span>}</dd>
            </dl>
            <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
              Los que ya estuvieran cargados se saltan: no se duplica nada.
            </p>
          </div>
        )}
      </Ventana>
    </Pagina>
  );
}
