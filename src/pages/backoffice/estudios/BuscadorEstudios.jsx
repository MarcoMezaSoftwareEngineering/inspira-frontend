// Buscador del catálogo interno de grados (QEDU) y ciclos de FP de grado
// superior (RCD), 22/10/2026. Lo usa la página «Grados y FP» de Herramientas
// y, con `onElegir`, el expediente de grado/FP para llenar la lista del
// informe con tres carreras y tres ciclos sin copiar nada a mano.
import { useEffect, useState } from "react";
import { ExternalLink, Search, Plus } from "lucide-react";
import { boGET } from "../../../services/backofficeApi";
import { Chip, Esqueleto, Vacio } from "../ui";
import "../../../styles/doctorado-core.css";

const POR_PAGINA = 40;

function usarBusqueda(ruta, f, pagina) {
  const [r, setR] = useState(null);
  useEffect(() => {
    let vivo = true;
    setR(null);
    const p = new URLSearchParams({ pagina: String(pagina), por_pagina: String(POR_PAGINA) });
    Object.entries(f).forEach(([k, v]) => { if (v) p.set(k, v); });
    boGET(`${ruta}?${p}`).then((x) => { if (vivo) setR(x?.ok ? x : { total: 0 }); });
    return () => { vivo = false; };
  }, [ruta, f, pagina]);
  return r;
}

function Paginas({ pagina, total, setPagina }) {
  const paginas = Math.max(1, Math.ceil((total || 0) / POR_PAGINA));
  if (paginas <= 1) return null;
  return (
    <div className="ase-dc-paginas">
      <button type="button" disabled={pagina <= 1} onClick={() => setPagina((n) => n - 1)}>← Anterior</button>
      <span>{pagina} / {paginas}</span>
      <button type="button" disabled={pagina >= paginas} onClick={() => setPagina((n) => n + 1)}>Siguiente →</button>
    </div>
  );
}

const nota = (n) => (n === null || n === undefined ? "—" : Number(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 3 }));

/* ── Grados ──────────────────────────────────────────────────────────────── */

export function BuscadorGrados({ onElegir, filtroInicial = {} }) {
  const [op, setOp] = useState(null);
  const [f, setF] = useState({ texto: "", ccaa: "", provincia: "", universidad: "", tipo: "", nota_max: "", con_nota: "", ...filtroInicial });
  const [texto, setTexto] = useState(filtroInicial.texto || "");
  const [pagina, setPagina] = useState(1);
  useEffect(() => { boGET("/backoffice/estudios/grados/opciones").then((x) => x?.ok && setOp(x)); }, []);
  useEffect(() => { const t = setTimeout(() => setF((x) => (x.texto === texto ? x : { ...x, texto })), 300); return () => clearTimeout(t); }, [texto]);
  const filtrar = (c) => { setF((x) => ({ ...x, ...c })); setPagina(1); };
  const r = usarBusqueda("/backoffice/estudios/grados", f, pagina);

  return (
    <div className="ase-dc-cat">
      <div className="ase-dc-filtros">
        <label className="ase-dc-buscar"><Search size={16} />
          <input value={texto} onChange={(e) => { setTexto(e.target.value); setPagina(1); }} placeholder="Carrera, universidad o ciudad (p. ej. «enfermería sevilla»)" />
        </label>
        <select className="ase-campo" value={f.ccaa} onChange={(e) => filtrar({ ccaa: e.target.value, provincia: "", universidad: "" })}>
          <option value="">Toda España</option>
          {(op?.ccaas || []).map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select className="ase-campo" value={f.provincia} onChange={(e) => filtrar({ provincia: e.target.value })} disabled={!f.ccaa}>
          <option value="">Toda la comunidad</option>
          {(op?.provincias?.[f.ccaa] || []).map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select className="ase-campo" value={f.universidad} onChange={(e) => filtrar({ universidad: e.target.value })} disabled={!f.ccaa}>
          <option value="">Todas las universidades</option>
          {(op?.universidades?.[f.ccaa] || []).map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select className="ase-campo" value={f.tipo} onChange={(e) => filtrar({ tipo: e.target.value })}>
          <option value="">Pública y privada</option>
          <option value="PUBLICA">Pública</option>
          <option value="PRIVADA">Privada</option>
        </select>
        <label className="ase-dc-check" title="Solo grados cuya nota de corte sea igual o menor">
          Nota ≤ <input type="number" step="0.1" min="5" max="14" className="ase-campo" style={{ width: 70 }} value={f.nota_max} onChange={(e) => filtrar({ nota_max: e.target.value })} />
        </label>
        <label className="ase-dc-check"><input type="checkbox" checked={f.con_nota === "1"} onChange={(e) => filtrar({ con_nota: e.target.checked ? "1" : "" })} />Solo con nota de corte</label>
      </div>

      {r === null ? <Esqueleto filas={6} alto={58} /> : !r.total ? (
        <Vacio titulo="Ningún grado con estos filtros" texto="Prueba con menos palabras o quita algún filtro." />
      ) : (
        <>
          <p className="ase-dc-cuenta"><b>{r.total.toLocaleString("es-ES")}</b> grados (titulación × centro){r.total > POR_PAGINA ? ` · página ${pagina}` : ""}</p>
          <div style={{ overflowX: "auto" }}><table className="ase-dc-tabla">
            <thead><tr><th>Grado</th><th>Universidad · centro</th><th>Dónde</th><th>Nota de corte</th><th>Plazas</th><th>Precio</th><th></th></tr></thead>
            <tbody>
              {r.grados.map((g) => (
                <tr key={g.id}>
                  <td><b>{g.titulacion}</b>{g.modalidad && g.modalidad !== "Presencial" ? <Chip tono="ambar">{g.modalidad}</Chip> : null}</td>
                  <td>{g.universidad}<br /><small>{g.centro}{g.tipo_centro === "Adscrito" ? " (adscrito)" : ""}</small></td>
                  <td>{g.provincia}<br /><small>{g.ccaa}</small></td>
                  <td>{g.tipo_universidad === "Pública" ? <><b>{nota(g.nota_corte)}</b>{g.nota_corte_anterior !== null ? <><br /><small>antes {nota(g.nota_corte_anterior)}</small></> : null}</> : <Chip tono="gris">Privada</Chip>}</td>
                  <td>{g.plazas ?? "—"}</td>
                  <td>{g.precio || "—"}{g.creditos ? <><br /><small>{g.creditos} ECTS</small></> : null}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {g.enlace && <a href={g.enlace} target="_blank" rel="noreferrer" title="Ficha oficial"><ExternalLink size={13} /></a>}
                    {onElegir && <button type="button" className="ase-dc-boton mini" onClick={() => onElegir(aCandidaturaGrado(g))}><Plus size={13} /> Añadir</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <Paginas pagina={pagina} total={r.total} setPagina={setPagina} />
          <p className="ase-dc-nota">Fuente: QEDU (Ministerio de Universidades), curso {r.grados[0]?.curso || "2025-2026"}; consulta de {op?.generado ? op.generado.slice(0, 10) : "octubre de 2026"}. La nota de corte es la de las públicas; las privadas admiten por sus propias pruebas.</p>
        </>
      )}
    </div>
  );
}

/** Una fila de QEDU, en la forma de la lista del informe (candidatura). */
export function aCandidaturaGrado(g) {
  return {
    tipo: "Grado universitario", programa: g.titulacion, centro: g.universidad, ciudad: g.provincia, comunidad: g.ccaa,
    titularidad: g.tipo_universidad === "Pública" ? "Pública" : "Privada",
    codigo_registro: `RUCT ${g.cod_titulacion}`, nota_corte: g.nota_corte !== null && g.nota_corte !== undefined ? String(g.nota_corte) : "",
    plazas: g.plazas ? String(g.plazas) : "", precio: g.precio || "", portal_url: g.enlace || "",
    notas: [g.centro, g.creditos ? `${g.creditos} ECTS` : null, g.nota_corte_anterior !== null && g.nota_corte_anterior !== undefined ? `nota anterior ${g.nota_corte_anterior}` : null].filter(Boolean).join(" · "),
    estado: "Propuesta",
  };
}

/* ── FP ──────────────────────────────────────────────────────────────────── */

export function BuscadorFP({ onElegir, filtroInicial = {} }) {
  const [op, setOp] = useState(null);
  const [f, setF] = useState({ texto: "", ciclo: "", ccaa: "", provincia: "", naturaleza: "", ...filtroInicial });
  const [texto, setTexto] = useState(filtroInicial.texto || "");
  const [pagina, setPagina] = useState(1);
  useEffect(() => { boGET("/backoffice/estudios/fp/opciones").then((x) => x?.ok && setOp(x)); }, []);
  useEffect(() => { const t = setTimeout(() => setF((x) => (x.texto === texto ? x : { ...x, texto })), 300); return () => clearTimeout(t); }, [texto]);
  const filtrar = (c) => { setF((x) => ({ ...x, ...c })); setPagina(1); };
  const r = usarBusqueda("/backoffice/estudios/fp", f, pagina);

  return (
    <div className="ase-dc-cat">
      <div className="ase-dc-filtros">
        <label className="ase-dc-buscar"><Search size={16} />
          <input value={texto} onChange={(e) => { setTexto(e.target.value); setPagina(1); }} placeholder="Ciclo (p. ej. «desarrollo aplicaciones web») o centro" />
        </label>
        <select className="ase-campo" value={f.ciclo} onChange={(e) => filtrar({ ciclo: e.target.value })}>
          <option value="">Todos los ciclos de grado superior</option>
          {(op?.ciclos || []).map((x) => <option key={x.id} value={x.id}>{x.nombre} ({x.centros})</option>)}
        </select>
        <select className="ase-campo" value={f.ccaa} onChange={(e) => filtrar({ ccaa: e.target.value, provincia: "" })}>
          <option value="">Toda España</option>
          {(op?.ccaas || []).map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select className="ase-campo" value={f.provincia} onChange={(e) => filtrar({ provincia: e.target.value })} disabled={!f.ccaa}>
          <option value="">Toda la comunidad</option>
          {(op?.provincias?.[f.ccaa] || []).map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select className="ase-campo" value={f.naturaleza} onChange={(e) => filtrar({ naturaleza: e.target.value })}>
          <option value="">Públicos y privados</option>
          <option value="PUBLICO">Públicos</option>
          <option value="PRIVADO">Privados y concertados</option>
        </select>
      </div>

      {r === null ? <Esqueleto filas={6} alto={58} /> : !r.total ? (
        <Vacio titulo="Ningún ciclo o centro con estos filtros" texto="Prueba con menos palabras o elige el ciclo en el desplegable." />
      ) : (
        <>
          <p className="ase-dc-cuenta"><b>{r.total.toLocaleString("es-ES")}</b> centro-ciclo{r.total > POR_PAGINA ? ` · página ${pagina}` : ""}{r.ciclos_que_casan?.length > 1 && !f.ciclo ? ` · ${r.ciclos_que_casan.length} ciclos distintos` : ""}</p>
          <div style={{ overflowX: "auto" }}><table className="ase-dc-tabla">
            <thead><tr><th>Ciclo de grado superior</th><th>Centro</th><th>Dónde</th><th>Titularidad</th><th></th></tr></thead>
            <tbody>
              {r.fp.map((x) => (
                <tr key={x.id}>
                  <td><b>{x.ciclo}</b><br /><small>{x.planes.join(" / ")}</small></td>
                  <td>{x.centro}<br /><small>{x.denominacion_generica} · {x.codigo_centro}</small></td>
                  <td>{x.localidad}<br /><small>{x.provincia}{x.ccaa ? ` · ${x.ccaa}` : ""}</small></td>
                  <td><Chip tono={/p[uú]blico/i.test(x.naturaleza) ? "verde" : "ambar"}>{x.naturaleza.replace("Centro ", "")}</Chip></td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <a href={`https://www.educacion.gob.es/centros/detalleCentro?codigo=${x.codigo_centro}`} target="_blank" rel="noreferrer" title="Ficha en el RCD"><ExternalLink size={13} /></a>
                    {onElegir && <button type="button" className="ase-dc-boton mini" onClick={() => onElegir(aCandidaturaFP(x))}><Plus size={13} /> Añadir</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <Paginas pagina={pagina} total={r.total} setPagina={setPagina} />
          <p className="ase-dc-nota">Fuente: Registro Estatal de Centros Docentes no universitarios (RCD), consulta de {op?.generado ? op.generado.slice(0, 10) : "octubre de 2026"}. Plazas y notas de admisión las publica cada comunidad en su proceso de admisión; precio: pública gratuita o tasa de la comunidad, privada según centro.</p>
        </>
      )}
    </div>
  );
}

export function aCandidaturaFP(x) {
  return {
    tipo: "Ciclo de FP (grado superior)", programa: x.ciclo, centro: x.centro, ciudad: x.localidad, comunidad: x.ccaa || "",
    titularidad: /p[uú]blico/i.test(x.naturaleza) ? "Pública" : /concertad/i.test(x.naturaleza) ? "Concertada" : "Privada",
    codigo_registro: `RCD ${x.codigo_centro}`, portal_url: `https://www.educacion.gob.es/centros/detalleCentro?codigo=${x.codigo_centro}`,
    notas: `${x.denominacion_generica} · ${x.provincia}`, estado: "Propuesta",
  };
}

/** Las dos pestañas juntas. */
export default function BuscadorEstudios({ onElegir, inicial = "grados" }) {
  const [tab, setTab] = useState(inicial);
  return (
    <div>
      <div className="ase-dc-tabs" style={{ marginBottom: 12 }}>
        <button type="button" data-on={tab === "grados" ? "1" : "0"} onClick={() => setTab("grados")}>Grados universitarios</button>
        <button type="button" data-on={tab === "fp" ? "1" : "0"} onClick={() => setTab("fp")}>FP de grado superior</button>
      </div>
      {tab === "grados" ? <BuscadorGrados onElegir={onElegir} /> : <BuscadorFP onElegir={onElegir} />}
    </div>
  );
}
