// Buscador del catálogo interno de doctorados: texto (programa, universidad o
// ciudad, sin tildes), rama, comunidad, universidad, pública/privada,
// interuniversitario y solo presenciales. Cada fila enlaza a su ficha RUCT.
import { useEffect, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { boGET } from "../../../services/backofficeApi";
import { Chip, Esqueleto, Vacio } from "../ui";

const TONO_RAMA = { AH: "morado", C: "cielo", CS: "verde", CSJ: "petrol", IA: "ambar" };

export default function CatalogoDoctorados({ opciones, filtroInicial }) {
  const [f, setF] = useState({ texto: "", rama: "", ccaa: "", universidad: "", tipo: "", inter: "", presencial: "1", ...filtroInicial });
  const [texto, setTexto] = useState(filtroInicial?.texto || "");
  const [pagina, setPagina] = useState(1);
  const [r, setR] = useState(null);

  // Cualquier filtro nuevo vuelve a la primera página.
  const filtrar = (cambio) => { setF((x) => ({ ...x, ...cambio })); setPagina(1); };
  useEffect(() => {
    const t = setTimeout(() => { setF((x) => (x.texto === texto ? x : { ...x, texto })); }, 300);
    return () => clearTimeout(t);
  }, [texto]);

  useEffect(() => {
    let vivo = true;
    const p = new URLSearchParams({ pagina: String(pagina), por_pagina: "40" });
    Object.entries(f).forEach(([k, v]) => { if (v) p.set(k, v); });
    boGET(`/backoffice/doctorados?${p}`).then((x) => { if (vivo) setR(x?.ok ? x : { total: 0, programas: [] }); });
    return () => { vivo = false; };
  }, [f, pagina]);

  const set = (k) => (e) => filtrar({ [k]: e.target.value });
  const unis = (opciones?.universidades || []).filter((u) => !f.ccaa || u.ccaa === f.ccaa);
  const paginas = r ? Math.max(1, Math.ceil(r.total / 40)) : 1;

  return (
    <div className="ase-dc-cat">
      <div className="ase-dc-filtros">
        <label className="ase-dc-buscar">
          <Search size={16} />
          <input value={texto} onChange={(e) => { setTexto(e.target.value); setPagina(1); }} placeholder="Programa, universidad o ciudad (p. ej. «derecho salamanca»)" />
        </label>
        <select className="ase-campo" value={f.rama} onChange={set("rama")}>
          <option value="">Todas las ramas</option>
          {(opciones?.ramas || []).map((x) => <option key={x.k} value={x.k}>{x.t}</option>)}
          <option value="sin">Sin clasificar</option>
        </select>
        <select className="ase-campo" value={f.ccaa} onChange={(e) => filtrar({ ccaa: e.target.value, universidad: "" })}>
          <option value="">Toda España</option>
          {(opciones?.comunidades || []).map((x) => <option key={x.k} value={x.k}>{x.t}</option>)}
        </select>
        <select className="ase-campo" value={f.universidad} onChange={set("universidad")}>
          <option value="">Todas las universidades</option>
          {unis.map((x) => <option key={x.k} value={x.k}>{x.t}</option>)}
        </select>
        <select className="ase-campo" value={f.tipo} onChange={set("tipo")}>
          <option value="">Pública y privada</option>
          <option value="PUBLICA">Pública</option>
          <option value="PRIVADA">Privada</option>
        </select>
        <label className="ase-dc-check"><input type="checkbox" checked={f.inter === "1"} onChange={(e) => filtrar({ inter: e.target.checked ? "1" : "" })} />Interuniversitario</label>
        <label className="ase-dc-check" title="Los programas solo a distancia no dan residencia"><input type="checkbox" checked={f.presencial === "1"} onChange={(e) => filtrar({ presencial: e.target.checked ? "1" : "" })} />Solo presenciales</label>
      </div>

      {r === null ? <Esqueleto filas={6} alto={58} /> : r.total === 0 ? (
        <Vacio titulo="Ningún programa con estos filtros" texto="Prueba con menos palabras o quita algún filtro." />
      ) : (
        <>
          <p className="ase-dc-cuenta"><b>{r.total.toLocaleString("es-ES")}</b> programas{r.total > 40 ? ` · página ${pagina} de ${paginas}` : ""}</p>
          <ul className="ase-dc-lista-prog">
            {r.programas.map((p) => (
              <li key={p.ruct}>
                <div className="ase-dc-prog-cab">
                  <b>{p.corto}</b>
                  <a href={p.url_ruct} target="_blank" rel="noreferrer" title="Ficha en el RUCT">RUCT {p.ruct} <ExternalLink size={11} /></a>
                </div>
                <div className="ase-dc-prog-unis">
                  {p.universidades.map((u) => (
                    <span key={u.cod} data-tipo={u.tipo}>{u.corto} · {u.ciudad}{u.distancia ? " · a distancia" : ""}</span>
                  ))}
                </div>
                <div className="ase-dc-prog-chips">
                  {p.rama && <Chip tono={TONO_RAMA[p.rama] || "gris"}>{p.rama_nombre}</Chip>}
                  {p.interuniversitario && <Chip tono="cielo">Interuniversitario</Chip>}
                  {p.solo_distancia && <Chip tono="rojo">Solo a distancia · no da residencia</Chip>}
                </div>
              </li>
            ))}
          </ul>
          {paginas > 1 && (
            <div className="ase-dc-paginas">
              <button type="button" disabled={pagina <= 1} onClick={() => setPagina((n) => n - 1)}>← Anterior</button>
              <span>{pagina} / {paginas}</span>
              <button type="button" disabled={pagina >= paginas} onClick={() => setPagina((n) => n + 1)}>Siguiente →</button>
            </div>
          )}
          <p className="ase-dc-nota">Fuente: RUCT, consulta del 18/09/2026. La rama es estimada por el nombre (el RUCT no clasifica los doctorados). Plazas, idioma y líneas de investigación: en la web de cada programa.</p>
        </>
      )}
    </div>
  );
}
