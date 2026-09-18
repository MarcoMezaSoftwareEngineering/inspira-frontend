// Mapa público de doctorados: por comunidad, cuánto cuesta un año para un
// extranjero en la pública (tutela) o cuántos programas presenciales hay.
// Datos: GET /api/doctorados/mapa (agregados; el catálogo es interno).
import { useEffect, useState } from "react";
import { viewBox, comunidades as GEOMETRIA, recuadroCanarias } from "../landing/master2027/mapaEspana.data";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

const TRAMOS_PROG = [[200, "#013446"], [100, "#02506b"], [50, "#2f7f9c"], [25, "#7fb7cf"], [0, "#cfe6f2"]];
const TRAMOS_COSTE = [[380, "#b45309"], [300, "#f59e0b"], [220, "#fcd34d"], [150, "#86c5a4"], [0, "#1d6a4a"]];
const eur = (n) => (n == null ? "—" : `${Number(n).toLocaleString("es-ES", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`);

export default function MapaDoctoradoPublico({ onElegir }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const [medida, setMedida] = useState("coste");
  const [sel, setSel] = useState("madrid");

  useEffect(() => {
    const c = new AbortController();
    fetch(`${API_URL}/api/doctorados/mapa`, { signal: c.signal, headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((r) => (r?.ok ? setDatos(r) : setError(true)))
      .catch((e) => { if (e.name !== "AbortError") setError(true); });
    return () => c.abort();
  }, []);

  if (error) return <p className="rounded-2xl bg-white p-6 text-sm text-neutral-600 ring-1 ring-neutral-200">No pudimos cargar el mapa ahora mismo. Escríbenos y te pasamos los datos de tu comunidad.</p>;
  if (!datos) return <div className="h-[420px] animate-pulse rounded-2xl bg-white ring-1 ring-neutral-200" />;

  const porId = new Map(datos.comunidades.map((c) => [c.id, c]));
  const coste = medida === "coste";
  const tramos = coste ? TRAMOS_COSTE : TRAMOS_PROG;
  const valor = (d) => (coste ? d.tutela || 0 : d.programas);
  const color = (v) => tramos.find(([m]) => v >= m)[1];
  const claro = (v) => (coste ? v < 150 || v >= 380 : v >= 50);
  const c = porId.get(sel);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200 sm:p-5">
        <div role="radiogroup" aria-label="Qué muestra el mapa" className="mb-3 inline-flex rounded-xl bg-secondary-light p-1">
          {[["coste", "Coste al año"], ["programas", "Nº de programas"]].map(([k, t]) => (
            <button key={k} type="button" role="radio" aria-checked={medida === k} onClick={() => setMedida(k)}
              className={`min-h-[40px] rounded-lg px-3 text-sm font-bold transition ${medida === k ? "bg-white text-primary shadow-sm" : "text-neutral-600"}`}>
              {t}
            </button>
          ))}
        </div>
        <svg viewBox={viewBox} role="img" aria-label={coste ? "Coste de un año de doctorado por comunidad" : "Programas de doctorado por comunidad"} className="h-auto w-full">
          <rect {...recuadroCanarias} rx="10" fill="none" stroke="#b9cfdc" strokeDasharray="6 6" />
          {GEOMETRIA.filter((g) => porId.has(g.id)).map((g) => {
            const d = porId.get(g.id);
            return (
              <path key={g.id} d={g.d} fill={color(valor(d))} fillRule="evenodd" stroke={sel === g.id ? "#fa943a" : "#fff"} strokeWidth={sel === g.id ? 5 : 1.5}
                className="cursor-pointer" onClick={() => { setSel(g.id); onElegir?.(g.id); }}>
                <title>{`${d.nombre}: ${eur(d.tutela)} al año · ${d.programas} programas`}</title>
              </path>
            );
          })}
          {GEOMETRIA.filter((g) => porId.has(g.id) && g.etiqueta).map((g) => {
            const d = porId.get(g.id);
            return (
              <text key={`t-${g.id}`} x={g.etiqueta[0]} y={g.etiqueta[1]} textAnchor="middle" pointerEvents="none"
                fontSize="26" fontWeight="800" fill={claro(valor(d)) ? "#fff" : "#013446"}>
                {coste ? (d.tutela ? `${Math.round(d.tutela)} €` : "—") : d.programas}
              </text>
            );
          })}
        </svg>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-700">
          {[...tramos].reverse().map(([m, col], i, arr) => (
            <span key={m} className="inline-flex items-center gap-1.5"><i className="inline-block h-3.5 w-3.5 rounded" style={{ background: col }} />
              {i < arr.length - 1 ? `${m}–${arr[i + 1][0] - 1}` : `${m}+`}{coste ? " €" : ""}</span>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          {coste ? `Tutela anual en la universidad pública, curso ${datos.curso}. Mismo precio para extranjeros: ninguna comunidad aplica recargo en doctorado.` : "Programas oficiales presenciales (los solo a distancia no dan residencia)."} Toca una comunidad.
        </p>
      </div>

      {c && (
        <aside className="rounded-2xl bg-primary p-5 text-white sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky">Comunidad</p>
          <h3 className="mt-1 font-fraunces text-2xl font-bold">{c.nombre}</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-3"><p className="text-2xl font-extrabold">{eur(c.tutela)}</p><p className="text-xs text-white/75">al año en la pública (extranjeros)</p></div>
            <div className="rounded-xl bg-white/10 p-3"><p className="text-2xl font-extrabold">{c.programas}</p><p className="text-xs text-white/75">programas en {c.universidades} universidades</p></div>
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-sky">Ciudades</p>
          <ul className="mt-2 divide-y divide-white/10 text-sm">
            {c.ciudades.map((x) => (
              <li key={x.ciudad} className="flex justify-between py-1.5"><span>{x.ciudad}</span><b>{x.programas} programas</b></li>
            ))}
          </ul>
          {!c.verificada && <p className="mt-3 text-xs text-white/70">Precio del último decreto publicado; lo confirmamos en tu sesión.</p>}
        </aside>
      )}
    </div>
  );
}
