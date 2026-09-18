// Dos tablas del servicio de Doctorado: universidades (programas, plazos
// 2026-27, inicio, trámite con título extranjero y precio) y precios por
// comunidad y en privadas. Datos: /backoffice/doctorados/universidades y /precios.
import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Chip } from "../ui";

const eur = (n) => (n == null ? "—" : `${Number(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`);

export function UniversidadesDoctorado({ universidades, onVerCatalogo }) {
  const [soloPlazos, setSoloPlazos] = useState(false);
  const [q, setQ] = useState("");
  const lista = useMemo(() => (universidades || [])
    .filter((u) => u.programas > 0)
    .filter((u) => !soloPlazos || u.calendario)
    .filter((u) => !q || `${u.nombre} ${u.corto} ${u.ciudad}`.toLowerCase().includes(q.toLowerCase())), [universidades, soloPlazos, q]);

  return (
    <div>
      <div className="ase-dc-filtros">
        <input className="ase-campo" style={{ maxWidth: 320 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar universidad o ciudad" />
        <label className="ase-dc-check"><input type="checkbox" checked={soloPlazos} onChange={(e) => setSoloPlazos(e.target.checked)} />Solo con calendario 2026-27</label>
      </div>
      <div className="ase-tabla-scroll">
        <table className="ase-dc-tabla">
          <thead><tr><th>Universidad</th><th>Programas</th><th>Solicitud</th><th>Resolución</th><th>Matrícula</th><th>Inicio</th><th>Título extranjero</th><th>Precio anual</th></tr></thead>
          <tbody>
            {lista.map((u) => {
              const c = u.calendario;
              return (
                <tr key={u.cod}>
                  <td>
                    <button type="button" className="ase-dc-link" onClick={() => onVerCatalogo?.({ ccaa: u.ccaa, universidad: u.cod })}>{u.corto}</button>
                    <div className="sub">{u.ciudad} · {u.tipo === "PUBLICA" ? "pública" : "privada"}{u.distancia ? " · a distancia" : ""}</div>
                  </td>
                  <td className="num">{u.programas}</td>
                  <td>{c ? c.plazos : <span className="sub">sin revisar</span>}</td>
                  <td>{c?.resolucion || ""}</td>
                  <td>{c?.matricula || ""}</td>
                  <td>{c?.inicio || ""}</td>
                  <td>{c?.titulo_extranjero || ""}</td>
                  <td>
                    {u.precio?.tutela != null ? eur(u.precio.tutela) : (u.precio?.texto || <span className="sub">sin publicar</span>)}
                    {c?.url && <a className="ase-dc-ext" href={c.url} target="_blank" rel="noreferrer" title="Calendario oficial"><ExternalLink size={12} /></a>}
                    {c && !c.verificado && <Chip tono="ambar">por confirmar</Chip>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="ase-dc-nota">Calendarios leídos en la web oficial de cada escuela de doctorado el 18/09/2026. Antes de dar una fecha al asesorado, abrir el enlace: las universidades los cambian.</p>
    </div>
  );
}

export function PreciosDoctorado({ precios, comunidades }) {
  if (!precios) return null;
  const nombre = Object.fromEntries((comunidades || []).map((c) => [c.k, c.t]));
  const filas = Object.entries(precios.publicas).sort((a, b) => a[1].tutela - b[1].tutela);
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="ase-tabla-scroll">
        <table className="ase-dc-tabla">
          <thead><tr><th>Comunidad (pública)</th><th>Tutela anual</th><th>Apertura / gestión</th><th>Defensa</th><th>Título</th><th>Acceso con título extranjero</th><th>Recargo no UE</th><th>Norma</th></tr></thead>
          <tbody>
            {filas.map(([id, p]) => (
              <tr key={id}>
                <td><b>{nombre[id] || id}</b>{!p.verificado && <div><Chip tono="ambar">por confirmar</Chip></div>}</td>
                <td className="num"><b>{eur(p.tutela)}</b>{p.nota && <div className="sub">{p.nota}</div>}</td>
                <td>{p.apertura}</td>
                <td className="num">{eur(p.defensa)}</td>
                <td className="num">{eur(p.titulo)}</td>
                <td>{p.acceso_extranjero}</td>
                <td>{p.recargo_no_ue || "No en la tutela"}</td>
                <td><a className="ase-dc-link" href={p.url} target="_blank" rel="noreferrer">{p.norma}</a></td>
              </tr>
            ))}
            <tr>
              <td><b>UNED (estatal, a distancia)</b></td>
              <td className="num"><b>{eur(precios.estatal.uned.tutela)}</b></td>
              <td>{precios.estatal.uned.apertura}</td><td className="num">{eur(precios.estatal.uned.defensa)}</td><td className="num">{eur(precios.estatal.uned.titulo)}</td>
              <td>{precios.estatal.uned.acceso_extranjero}</td><td>{precios.estatal.uned.recargo_no_ue}</td>
              <td><a className="ase-dc-link" href={precios.estatal.uned.url} target="_blank" rel="noreferrer">{precios.estatal.uned.norma}</a></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="ase-tabla-scroll">
        <table className="ase-dc-tabla">
          <thead><tr><th>Privada</th><th>Precio anual</th><th>Defensa</th><th>Título</th><th>Además</th><th>Curso</th></tr></thead>
          <tbody>
            {precios.privadas.map((p) => (
              <tr key={p.uni}>
                <td><a className="ase-dc-link" href={p.url} target="_blank" rel="noreferrer">{p.nombre || p.uni}</a>{!p.v && <div><Chip tono="ambar">por confirmar</Chip></div>}</td>
                <td><b>{p.anual}</b></td><td>{p.defensa || "—"}</td><td>{p.titulo || "—"}</td><td>{p.extra || ""}</td><td>{p.curso || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ase-dc-nota">{precios.fuente_media}. Ninguna comunidad aplica recargo a extranjeros sobre la tutela de doctorado; donde lo hay, afecta a los créditos de complementos de formación. Deusto, Europea, UNIR y UDIMA no publican precio: se pide a la escuela.</p>
    </div>
  );
}
