// El sistematizador: cargar la oferta de másteres de una universidad.
//
// El catálogo tiene 1.133 másteres de los ~3.900 que ofertan las universidades
// que ya están dadas de alta, y el hueco está donde más duele: la Universidad de
// Barcelona tiene dos cargados y la Complutense doce. El informe no puede
// recomendar lo que no conoce, así que a quien pide Madrid le ofrece entre
// treinta y cinco opciones cuando existen ochocientas.
//
// Esto es la vía para cerrarlo sin teclear uno por uno: se pega la lista —de la
// web, de un Excel, de donde venga—, se ve lo que se entendió, se marca lo que
// ya existe, y sólo entonces se carga. La revisión humana en medio no es un
// trámite: un máster mal cargado sale luego en un informe con el nombre de
// Inspira encima.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

const RAMAS = [
  ["ARTES_HUMANIDADES", "Artes y Humanidades"],
  ["CIENCIAS", "Ciencias"],
  ["CIENCIAS_SALUD", "Ciencias de la Salud"],
  ["CIENCIAS_SOCIALES_JURIDICAS", "Ciencias Sociales y Jurídicas"],
  ["INGENIERIA_ARQUITECTURA", "Ingeniería y Arquitectura"],
];
const RAMA_ETIQ = Object.fromEntries(RAMAS);

/**
 * Interpreta lo que se ha pegado.
 *
 * Acepta lo que sale de un Excel —columnas separadas por tabulador o punto y
 * coma— y también una lista suelta de nombres, que es lo que se obtiene al
 * copiar de una web. Adivinar el separador evita obligar a nadie a preparar el
 * texto antes de pegarlo.
 */
function interpretar(texto) {
  const lineas = String(texto || "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lineas.length) return [];

  const sep = lineas[0].includes("\t") ? "\t" : lineas[0].includes(";") ? ";" : null;

  return lineas.map((l, i) => {
    const partes = sep ? l.split(sep).map((p) => p.trim()) : [l];
    const [nombre, ects, rama, url] = partes;
    // El nombre suele venir con la numeración de la web pegada delante.
    const limpio = String(nombre || "").replace(/^\d+[.)\-\s]+/, "").trim();
    return {
      linea: i + 1,
      nombre: limpio,
      ects: /^\d{2,3}$/.test(String(ects || "").trim()) ? Number(ects) : null,
      rama: RAMA_ETIQ[String(rama || "").trim().toUpperCase()] ? String(rama).trim().toUpperCase() : null,
      url: /^https?:\/\//.test(String(url || "").trim()) ? String(url).trim() : null,
    };
  }).filter((m) => m.nombre);
}

/** Compara sin tildes ni mayúsculas: «Máster en X» y «MASTER EN X» son el mismo. */
const clave = (s) => String(s || "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export default function SistematizadorMasteres() {
  const [universidades, setUniversidades] = useState([]);
  const [sigla, setSigla] = useState("");
  const [texto, setTexto] = useState("");
  const [ramaPorDefecto, setRamaPorDefecto] = useState("");

  useEffect(() => {
    boGET("/backoffice/universidades")
      .then((r) => { if (r?.ok) setUniversidades(r.universidades || []); })
      .catch(() => {});
  }, []);

  const uni = useMemo(
    () => universidades.find((u) => u.sigla === sigla) || null,
    [universidades, sigla],
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

  const nuevas = analizadas.filter((f) => !f.repetido);
  const sinRama = nuevas.filter((f) => !f.rama && !ramaPorDefecto).length;
  const sinUrl = nuevas.filter((f) => !f.url).length;

  const limpiar = useCallback(() => setTexto(""), []);

  const sel = "text-[12px] border border-neutral-200 rounded-lg px-2 py-1.5 bg-white "
    + "text-neutral-600 focus:outline-none focus:border-[#1D6A4A]";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[19px] font-bold text-neutral-900">Sistematizador de másteres</h1>
        <p className="text-[12.5px] text-neutral-500">
          Cargar la oferta de una universidad sin teclearla una por una.
        </p>
      </div>

      <div className="bg-white border border-amber-300 rounded-xl px-4 py-3">
        <p className="text-[12px] text-neutral-700 leading-relaxed">
          <b>Esta pantalla todavía no carga nada.</b> Interpreta lo que pegas y te enseña qué
          entendería, para que valides el formato antes de que construya la carga de verdad.
          El botón de abajo está desactivado a propósito.
        </p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>

        <div className="space-y-3">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2.5">
            <label className="block space-y-1">
              <span className="text-[11px] text-neutral-500">Universidad</span>
              <select value={sigla} onChange={(e) => setSigla(e.target.value)} className={`${sel} w-full`}>
                <option value="">Elige una…</option>
                {universidades.map((u) => (
                  <option key={u.id_universidad} value={u.sigla}>
                    {u.sigla} · {u.nombre} ({u.masteres_cargados} cargados)
                  </option>
                ))}
              </select>
            </label>

            {uni && (
              <div className="flex items-center gap-3 flex-wrap text-[11.5px] bg-neutral-50
                border border-neutral-200 rounded-lg px-3 py-2">
                <span className="text-neutral-500">
                  Tiene <b className="text-neutral-800">{uni.masteres_cargados}</b> cargados
                  {uni.num_masteres_total
                    ? <> de <b className="text-neutral-800">~{uni.num_masteres_total}</b> que oferta</>
                    : null}
                </span>
                {uni.url_masteres && (
                  <a href={uni.url_masteres} target="_blank" rel="noreferrer"
                    className="text-[#046C8C] hover:underline ml-auto">abrir su oferta ↗</a>
                )}
              </div>
            )}

            <label className="block space-y-1">
              <span className="text-[11px] text-neutral-500">
                Rama por defecto <span className="text-neutral-400">(si la lista no la trae)</span>
              </span>
              <select value={ramaPorDefecto} onChange={(e) => setRamaPorDefecto(e.target.value)}
                className={`${sel} w-full`}>
                <option value="">Sin rama por defecto</option>
                {RAMAS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2">
            <div className="flex items-baseline gap-2">
              <p className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wide">
                Pega aquí la lista
              </p>
              {texto && (
                <button type="button" onClick={limpiar}
                  className="ml-auto text-[11px] text-neutral-400 hover:text-neutral-700">vaciar</button>
              )}
            </div>
            <textarea rows={14} value={texto} onChange={(e) => setTexto(e.target.value)}
              placeholder={"Un máster por línea.\n\nDe Excel, con columnas:\nNombre\tECTS\tRAMA\tURL\n\nO sólo los nombres, uno por línea."}
              className="w-full text-[12px] font-mono border border-neutral-300 rounded-lg
                px-2.5 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#1D6A4A]
                focus:border-[#1D6A4A] leading-relaxed" />
            <p className="text-[10.5px] text-neutral-400 leading-relaxed">
              Se reconoce el separador solo —tabulador o punto y coma— y se quita la
              numeración que arrastran las webs al copiar.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400">
            Lo que se entendería
          </p>

          {!filas.length ? (
            <div className="bg-white border border-dashed border-neutral-300 rounded-xl
              py-12 text-center">
              <p className="text-[12.5px] text-neutral-400">Pega la lista y aparece aquí.</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 flex-wrap">
                <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2">
                  <p className="text-[17px] font-bold text-neutral-900 tabular-nums leading-none">
                    {nuevas.length}
                  </p>
                  <p className="text-[10.5px] text-neutral-500 mt-0.5">se cargarían</p>
                </div>
                {analizadas.length - nuevas.length > 0 && (
                  <div className="bg-white border border-amber-300 rounded-lg px-3 py-2">
                    <p className="text-[17px] font-bold text-amber-700 tabular-nums leading-none">
                      {analizadas.length - nuevas.length}
                    </p>
                    <p className="text-[10.5px] text-neutral-500 mt-0.5">repetidos</p>
                  </div>
                )}
                {sinRama > 0 && (
                  <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2">
                    <p className="text-[17px] font-bold text-neutral-500 tabular-nums leading-none">
                      {sinRama}
                    </p>
                    <p className="text-[10.5px] text-neutral-500 mt-0.5">sin rama</p>
                  </div>
                )}
                {sinUrl > 0 && (
                  <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2">
                    <p className="text-[17px] font-bold text-neutral-500 tabular-nums leading-none">
                      {sinUrl}
                    </p>
                    <p className="text-[10.5px] text-neutral-500 mt-0.5">sin enlace</p>
                  </div>
                )}
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                <div className="max-h-[26rem] overflow-y-auto divide-y divide-neutral-100">
                  {analizadas.map((f) => (
                    <div key={f.linea}
                      className={`px-3 py-2 flex items-start gap-2 ${f.repetido ? "bg-amber-50/60" : ""}`}>
                      <span className="text-[10px] text-neutral-300 tabular-nums w-6 shrink-0 pt-0.5">
                        {f.linea}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[12px] leading-snug ${
                          f.repetido ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                          {f.nombre}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          {f.repetido ? (
                            <span className="text-[10px] text-amber-700">
                              repite la línea {f.repiteA}
                            </span>
                          ) : (
                            <>
                              <span className="text-[10px] text-neutral-400">
                                {RAMA_ETIQ[f.rama || ramaPorDefecto] || "sin rama"}
                              </span>
                              {f.ects && (
                                <span className="text-[10px] text-neutral-400 tabular-nums">
                                  {f.ects} ECTS
                                </span>
                              )}
                              {f.url && <span className="text-[10px] text-[#1D6A4A]">con enlace</span>}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="button" disabled
                className="w-full text-[12.5px] font-semibold px-4 py-2.5 rounded-lg
                  bg-neutral-200 text-neutral-500 cursor-not-allowed">
                Cargar {nuevas.length} másteres en {sigla || "la universidad"} — aún no disponible
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
