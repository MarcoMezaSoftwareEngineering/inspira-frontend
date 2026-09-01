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
import { boGET, boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";

const LISTA = {
  LISTA_1: { corto: "Económica",  tono: "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35" },
  LISTA_2: { corto: "Intermedia", tono: "bg-[#FEF3E7] text-[#B9770E] border-amber-300/60" },
  LISTA_3: { corto: "Premium",    tono: "bg-[#FDEDEC] text-[#C0392B] border-red-200" },
};

const VENTANA = {
  abierta:      { texto: "plazo abierto",  tono: "text-[#1D6A4A]", punto: "bg-[#1D6A4A]" },
  "próxima":    { texto: "abre pronto",    tono: "text-[#B9770E]", punto: "bg-[#B9770E]" },
  cerrada:      { texto: "plazo cerrado",  tono: "text-neutral-400", punto: "bg-neutral-300" },
  "sin fecha":  { texto: "sin fechas",     tono: "text-neutral-400", punto: "bg-neutral-200" },
};

const VIGILANCIA = {
  activa:         { texto: "vigilada", tono: "text-neutral-400" },
  "sin estrenar": { texto: "sin estrenar", tono: "text-neutral-400" },
  error:          { texto: "web caída", tono: "text-red-600" },
  apagada:        { texto: "sin vigilar", tono: "text-neutral-400" },
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

export default function UniversidadesLista() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [q, setQ] = useState("");
  const [comunidad, setComunidad] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [lista, setLista] = useState("");
  const [ventana, setVentana] = useState("");
  const [orden, setOrden] = useState("precio");
  const [soloProblemas, setSoloProblemas] = useState(false);

  /** Volver a pedirlo tras editar algo. */
  const recargar = useCallback(() => {
    setCargando(true);
    return boGET("/backoffice/universidades")
      .then((r) => { if (r?.ok) setDatos(r); })
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
      if (soloProblemas && u.vigilancia !== "error") return false;
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

  const rotas = todas.filter((u) => u.vigilancia === "error").length;
  const abiertas = todas.filter((u) => u.ventana?.estado === "abierta").length;

  const hayFiltro = q || comunidad || ciudad || lista || ventana || soloProblemas;
  const limpiar = () => {
    setQ(""); setComunidad(""); setCiudad(""); setLista(""); setVentana(""); setSoloProblemas(false);
  };

  async function cambiarUrl(u) {
    const nueva = window.prompt(
      `URL de preinscripción de ${u.sigla || u.nombre}`,
      u.url_preinscripcion || u.url_masteres || "",
    );
    if (nueva === null) return;
    const r = await boPATCH(`/backoffice/universidades/${u.id_universidad}`, {
      url_preinscripcion: nueva.trim() || null,
    });
    if (r?.ok) { dialog.toast("Guardado · se vuelve a vigilar desde cero", "exito"); recargar(); }
    else dialog.toast(r?.msg || "No se pudo guardar", "error");
  }

  const sel = "text-[12px] border border-neutral-200 rounded-lg px-2 py-1.5 bg-white "
    + "text-neutral-600 focus:outline-none focus:border-[#1D6A4A]";

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[19px] font-bold text-neutral-900">Universidades</h1>
        <p className="text-[12.5px] text-neutral-500">
          De aquí sale el informe de másteres. Precios por comunidad según decreto.
        </p>
      </div>

      {/* Lo que hay que saber de un vistazo, antes de buscar nada. */}
      <div className="flex gap-2 flex-wrap">
        <div className="bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 min-w-[7rem]">
          <p className="text-[19px] font-bold text-neutral-900 tabular-nums leading-none">{todas.length}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">universidades</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 min-w-[7rem]">
          <p className="text-[19px] font-bold text-[#1D6A4A] tabular-nums leading-none">{abiertas}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">con plazo abierto</p>
        </div>
        <button type="button" onClick={() => setSoloProblemas(!soloProblemas)}
          className={`rounded-xl px-3.5 py-2.5 min-w-[7rem] text-left border transition-colors ${
            soloProblemas ? "border-red-400 bg-red-50" : "bg-white border-neutral-200 hover:border-red-300"
          }`}>
          <p className="text-[19px] font-bold text-red-600 tabular-nums leading-none">{rotas}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">con la web caída</p>
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar universidad, sigla, ciudad…"
          className={`${sel} flex-1 min-w-[180px]`} />

        <select value={comunidad} onChange={(e) => { setComunidad(e.target.value); setCiudad(""); }} className={sel}>
          <option value="">Todas las comunidades</option>
          {(facetas.comunidades || []).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} className={sel}>
          <option value="">Todas las ciudades</option>
          {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={lista} onChange={(e) => setLista(e.target.value)} className={sel}>
          <option value="">Cualquier precio</option>
          {["LISTA_1", "LISTA_2", "LISTA_3"]
            .filter((l) => (facetas.listas || []).includes(l))
            .map((l) => <option key={l} value={l}>{LISTA[l].corto}</option>)}
        </select>

        <select value={ventana} onChange={(e) => setVentana(e.target.value)} className={sel}>
          <option value="">Cualquier plazo</option>
          <option value="abierta">Plazo abierto</option>
          <option value="próxima">Abre pronto</option>
          <option value="cerrada">Plazo cerrado</option>
          <option value="sin fecha">Sin fechas cargadas</option>
        </select>

        <select value={orden} onChange={(e) => setOrden(e.target.value)} className={`${sel} ml-auto`}>
          <option value="precio">Más barata primero</option>
          <option value="nombre">Por nombre</option>
          <option value="masteres">Más másteres cargados</option>
          <option value="ranking">Mejor ranking</option>
        </select>

        {hayFiltro && (
          <button type="button" onClick={limpiar}
            className="text-[12px] text-neutral-500 hover:text-neutral-800 px-2">limpiar</button>
        )}
      </div>

      <p className="text-[11.5px] text-neutral-400">
        {visibles.length === todas.length ? `${todas.length} universidades`
          : `${visibles.length} de ${todas.length}`}
      </p>

      {cargando ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : visibles.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[13px] font-semibold text-neutral-600">Ninguna con estos filtros</p>
          <p className="text-[12px] text-neutral-400 mt-1">Prueba quitando alguno.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibles.map((u) => {
            const L = LISTA[u.lista_inspira];
            const V = VENTANA[u.ventana?.estado] || VENTANA["sin fecha"];
            const G = VIGILANCIA[u.vigilancia] || VIGILANCIA.apagada;
            const faltan = (u.num_masteres_total || 0) - (u.masteres_cargados || 0);

            return (
              <div key={u.id_universidad}
                className="bg-white border border-neutral-200 rounded-xl px-3.5 py-3">
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {u.sigla && (
                        <span className="text-[11px] font-bold text-[#1A3557] bg-[#EEF2F8]
                          px-1.5 py-0.5 rounded">{u.sigla}</span>
                      )}
                      <p className="text-[13.5px] font-semibold text-neutral-900">{u.nombre}</p>
                    </div>

                    <p className="text-[11.5px] text-neutral-400 mt-0.5">
                      {[u.ciudad, u.comunidad].filter(Boolean).join(" · ")}
                      {u.ranking_internacional
                        ? ` · #${u.ranking_internacional} ${u.ranking_internacional_fte || ""}`.trimEnd()
                        : ""}
                    </p>

                    {u.especialidad && (
                      <p className="text-[11.5px] text-neutral-600 mt-1 leading-relaxed">{u.especialidad}</p>
                    )}

                    <div className="flex items-center gap-2.5 flex-wrap mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10.5px] ${V.tono}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${V.punto}`} />
                        {V.texto}
                        {u.ventana?.fase ? ` · ${u.ventana.fase}` : ""}
                        {u.ventana?.hasta ? ` hasta ${fechaCorta(u.ventana.hasta)}` : ""}
                        {u.ventana?.desde ? ` el ${fechaCorta(u.ventana.desde)}` : ""}
                      </span>

                      <span className="text-[10.5px] text-neutral-400 tabular-nums">
                        {u.masteres_cargados} másteres cargados
                        {faltan > 0 && <span className="text-amber-700"> · faltan ~{faltan}</span>}
                      </span>

                      <span className={`text-[10.5px] ${G.tono}`}>{G.texto}</span>

                      {(u.url_preinscripcion || u.url_masteres) && (
                        <a href={u.url_preinscripcion || u.url_masteres} target="_blank" rel="noreferrer"
                          className="text-[10.5px] text-[#046C8C] hover:underline truncate max-w-[220px]">
                          {(u.url_preinscripcion || u.url_masteres).replace(/^https?:\/\//, "")}
                        </a>
                      )}
                      <button type="button" onClick={() => cambiarUrl(u)}
                        className="text-[10.5px] text-neutral-400 hover:text-neutral-700">
                        {u.url_preinscripcion ? "cambiar enlace" : "poner enlace"}
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {u.precio?.eur_60ects != null ? (
                      <>
                        <p className="text-[15px] font-bold text-neutral-800 tabular-nums leading-none">
                          {eur(u.precio.eur_60ects)}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">máster de 60 ECTS</p>
                        {L && (
                          <span className={`inline-block mt-1 text-[9.5px] font-bold uppercase
                            tracking-wide px-1.5 py-0.5 rounded border ${L.tono}`}>{L.corto}</span>
                        )}
                        {u.precio.normativa && (
                          <p className="text-[9.5px] text-neutral-300 mt-1">{u.precio.normativa}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-[11px] text-neutral-400 leading-tight">
                        precio no<br />cargado
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
