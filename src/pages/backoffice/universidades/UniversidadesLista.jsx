// El catálogo de universidades: la hoja de cálculo, pero buscable.
//
// Sustituye a una hoja que envejecía sola y cuyos enlaces se morían sin que
// nadie lo notara. Aquí cada universidad lleva su comunidad, su ciudad, lo que
// cuesta estudiar allí y el estado de la vigilancia de su web.
//
// El precio manda en el orden por defecto: de 738 € en Galicia a 5.044 € en
// Madrid hay siete veces de diferencia, y es lo primero que pregunta un
// asesorado. Todo se filtra en el navegador porque son medio centenar de filas
// y así la búsqueda responde en cada tecla.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET, boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";

const NIVEL = {
  ECONOMICA:  { corto: "Económica",  tono: "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35" },
  INTERMEDIA: { corto: "Intermedia", tono: "bg-[#FEF3E7] text-[#B9770E] border-amber-300/60" },
  PREMIUM:    { corto: "Premium",    tono: "bg-[#FDEDEC] text-[#C0392B] border-red-200" },
};

const VIGILANCIA = {
  activa:          { texto: "vigilada",     tono: "text-[#1D6A4A]", punto: "bg-[#1D6A4A]" },
  "sin estrenar":  { texto: "sin estrenar", tono: "text-neutral-400", punto: "bg-neutral-300" },
  error:           { texto: "no responde",  tono: "text-red-600",   punto: "bg-red-500" },
  apagada:         { texto: "apagada",      tono: "text-neutral-400", punto: "bg-neutral-200" },
};

const eur = (n) => (n == null ? null : `${Math.round(n).toLocaleString("es-ES")} €`);

/** Sin tildes y en minúsculas: quien busca «malaga» quiere encontrar Málaga. */
const plano = (s) => String(s || "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function UniversidadesLista() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [q, setQ] = useState("");
  const [comunidad, setComunidad] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [nivel, setNivel] = useState("");
  const [tipo, setTipo] = useState("");
  const [area, setArea] = useState("");
  const [soloProblemas, setSoloProblemas] = useState(false);
  const [orden, setOrden] = useState("precio");

  const cargar = useCallback(() => {
    setCargando(true);
    return boGET("/backoffice/universidades")
      .then((r) => { if (r?.ok) setDatos(r); })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const todas = datos?.universidades || [];
  const facetas = datos?.facetas || {};

  // Las ciudades se recortan a la comunidad elegida: ofrecer las 48 cuando ya
  // has dicho «Andalucía» es ruido.
  const ciudades = useMemo(() => {
    const base = comunidad ? todas.filter((u) => u.comunidad === comunidad) : todas;
    return [...new Set(base.map((u) => u.ciudad).filter(Boolean))].sort();
  }, [todas, comunidad]);

  const visibles = useMemo(() => {
    const busca = plano(q);
    const filtradas = todas.filter((u) => {
      if (comunidad && u.comunidad !== comunidad) return false;
      if (ciudad && u.ciudad !== ciudad) return false;
      if (tipo && u.tipo !== tipo) return false;
      if (nivel && u.precio?.nivel !== nivel) return false;
      if (area && !(u.areas || []).includes(area)) return false;
      if (soloProblemas && u.vigilancia !== "error") return false;
      if (!busca) return true;
      return [u.nombre, u.sigla, u.ciudad, u.comunidad, u.especialidad]
        .some((c) => plano(c).includes(busca));
    });

    const cmp = {
      // Sin precio al final: no se ordena por un dato que falta.
      precio: (a, b) => (a.precio?.eur_60ects ?? 1e9) - (b.precio?.eur_60ects ?? 1e9),
      nombre: (a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"),
      masteres: (a, b) => (b.n_masteres || 0) - (a.n_masteres || 0),
      ranking: (a, b) => (a.ranking_pos ?? 1e9) - (b.ranking_pos ?? 1e9),
    }[orden];

    return [...filtradas].sort(cmp);
  }, [todas, q, comunidad, ciudad, tipo, nivel, area, soloProblemas, orden]);

  const rotas = todas.filter((u) => u.vigilancia === "error").length;
  const limpiar = () => {
    setQ(""); setComunidad(""); setCiudad(""); setNivel("");
    setTipo(""); setArea(""); setSoloProblemas(false);
  };
  const hayFiltro = q || comunidad || ciudad || nivel || tipo || area || soloProblemas;

  async function guardarCampo(u, campo, valor) {
    const r = await boPATCH(`/backoffice/universidades/${u.id_universidad}`, { [campo]: valor });
    if (r?.ok) { dialog.toast("Guardado", "exito"); cargar(); }
    else dialog.toast(r?.msg || "No se pudo guardar", "error");
  }

  const sel = "text-[12px] border border-neutral-200 rounded-lg px-2 py-1.5 bg-white "
    + "text-neutral-600 focus:outline-none focus:border-[#1D6A4A]";

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[19px] font-bold text-neutral-900">Universidades</h1>
        <p className="text-[12.5px] text-neutral-500">
          {todas.length} universidades · precios por comunidad según decreto ·
          {" "}la web de cada una se vigila para avisar cuando abren plazos.
        </p>
      </div>

      {rotas > 0 && (
        <button type="button" onClick={() => setSoloProblemas(!soloProblemas)}
          className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors ${
            soloProblemas
              ? "border-red-400 bg-red-50"
              : "border-red-200 bg-red-50/60 hover:border-red-300"
          }`}>
          <p className="text-[12px] text-red-800 leading-relaxed">
            <b>{rotas} universidades con la web caída o movida.</b> Su enlace ya no responde,
            así que nadie se enteraría si abren plazo. {soloProblemas ? "Mostrando sólo esas." : "Pulsa para verlas."}
          </p>
        </button>
      )}

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

        <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={sel}>
          <option value="">Cualquier precio</option>
          {["ECONOMICA", "INTERMEDIA", "PREMIUM"]
            .filter((n) => (facetas.niveles || []).includes(n))
            .map((n) => <option key={n} value={n}>{NIVEL[n].corto}</option>)}
        </select>

        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={sel}>
          <option value="">Pública y privada</option>
          {(facetas.tipos || []).map((t) => (
            <option key={t} value={t}>{t === "PUBLICA" ? "Pública" : "Privada"}</option>
          ))}
        </select>

        {(facetas.areas || []).length > 0 && (
          <select value={area} onChange={(e) => setArea(e.target.value)} className={sel}>
            <option value="">Cualquier área</option>
            {facetas.areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        )}

        <select value={orden} onChange={(e) => setOrden(e.target.value)} className={`${sel} ml-auto`}>
          <option value="precio">Más barata primero</option>
          <option value="nombre">Por nombre</option>
          <option value="masteres">Más másteres</option>
          <option value="ranking">Mejor ranking</option>
        </select>

        {hayFiltro && (
          <button type="button" onClick={limpiar}
            className="text-[12px] text-neutral-500 hover:text-neutral-800 px-2">
            limpiar
          </button>
        )}
      </div>

      <p className="text-[11.5px] text-neutral-400">
        {visibles.length === todas.length
          ? `${todas.length} universidades`
          : `${visibles.length} de ${todas.length}`}
      </p>

      {cargando ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-xl h-20 animate-pulse" />
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
            const n = NIVEL[u.precio?.nivel];
            const v = VIGILANCIA[u.vigilancia] || VIGILANCIA.apagada;
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
                      {u.tipo === "PRIVADA" && (
                        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5
                          py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">
                          privada
                        </span>
                      )}
                    </div>

                    <p className="text-[11.5px] text-neutral-400 mt-0.5">
                      {[u.ciudad, u.comunidad].filter(Boolean).join(" · ")}
                      {u.n_masteres ? ` · ${u.n_masteres} másteres` : ""}
                      {u.ranking_pos
                        ? ` · #${u.ranking_pos} ${u.ranking_fuente || ""} ${u.ranking_anio || ""}`.trimEnd()
                        : ""}
                    </p>

                    {u.especialidad && (
                      <p className="text-[11.5px] text-neutral-600 mt-1 leading-relaxed">
                        {u.especialidad}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10.5px] ${v.tono}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${v.punto}`} />
                        {v.texto}
                      </span>
                      {u.url_preinscripcion || u.url_masteres ? (
                        <a href={u.url_preinscripcion || u.url_masteres} target="_blank" rel="noreferrer"
                          className="text-[10.5px] text-[#046C8C] hover:underline truncate max-w-[280px]">
                          {(u.url_preinscripcion || u.url_masteres).replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-[10.5px] text-amber-700">sin URL de preinscripción</span>
                      )}
                      <button type="button"
                        onClick={async () => {
                          const nueva = window.prompt(
                            `URL de preinscripción de ${u.sigla || u.nombre}`,
                            u.url_preinscripcion || "",
                          );
                          if (nueva !== null) await guardarCampo(u, "url_preinscripcion", nueva.trim() || null);
                        }}
                        className="text-[10.5px] text-neutral-400 hover:text-neutral-700">
                        cambiar
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {u.precio?.eur_60ects != null ? (
                      <>
                        <p className="text-[15px] font-bold text-neutral-800 tabular-nums">
                          {eur(u.precio.eur_60ects)}
                        </p>
                        <p className="text-[10px] text-neutral-400">máster de 60 ECTS</p>
                        {n && (
                          <span className={`inline-block mt-1 text-[9.5px] font-bold uppercase
                            tracking-wide px-1.5 py-0.5 rounded border ${n.tono}`}>
                            {n.corto}
                          </span>
                        )}
                        {u.precio.normativa && (
                          <p className="text-[9.5px] text-neutral-300 mt-1">{u.precio.normativa}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-[11px] text-neutral-400">precio no fijado<br />por decreto</p>
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
