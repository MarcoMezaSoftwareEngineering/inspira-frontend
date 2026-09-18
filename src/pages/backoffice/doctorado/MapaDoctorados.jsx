// Mapa de doctorados por comunidad: coste de un año de doctorado para un
// extranjero en la universidad pública (tutela; ninguna comunidad aplica
// recargo a extranjeros en doctorado) o número de programas presenciales. Al
// tocar una comunidad se ven sus ciudades, universidades con plazo y el atajo
// al catálogo filtrado. Misma geometría que
// el mapa del Paquete Máster (pages/landing/master2027/mapaEspana.data.js).
import { useState } from "react";
import { viewBox, comunidades as GEOMETRIA, recuadroCanarias } from "../../landing/master2027/mapaEspana.data";

const eur = (n) => (n == null ? "—" : `${Number(n).toLocaleString("es-ES", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`);

// Cinco tramos de color por número de programas (petróleo más oscuro = más oferta).
const TRAMOS = [[200, "#013446"], [100, "#02506b"], [50, "#2f7f9c"], [25, "#7fb7cf"], [0, "#cfe6f2"]];
// Coste: verde = barato, ámbar = caro (euros de tutela al año).
const TRAMOS_COSTE = [[380, "#b45309"], [300, "#f59e0b"], [220, "#fcd34d"], [150, "#86c5a4"], [0, "#1d6a4a"]];
const MEDIDAS = {
  coste: { tramos: TRAMOS_COSTE, valor: (d) => d.tutela || 0, texto: (d) => (d.tutela ? `${Math.round(d.tutela)} €` : "—"), claro: (v) => v < 150 || v >= 380, sufijo: "€/año" },
  programas: { tramos: TRAMOS, valor: (d) => d.programas, texto: (d) => String(d.programas), claro: (v) => v >= 50, sufijo: "programas" },
};

export default function MapaDoctorados({ resumen, onVerCatalogo }) {
  const [sel, setSel] = useState("madrid");
  const [medida, setMedida] = useState("coste");
  const M = MEDIDAS[medida];
  const colorDe = (v) => M.tramos.find(([m]) => v >= m)[1];
  const porId = new Map((resumen?.comunidades || []).map((c) => [c.id, c]));
  const c = porId.get(sel);

  return (
    <div className="ase-dc-mapa">
      <div className="ase-dc-mapa-svg">
        <div className="ase-dc-medida" role="radiogroup" aria-label="Qué muestra el mapa">
          <button type="button" data-on={medida === "coste" ? "1" : "0"} onClick={() => setMedida("coste")}>Coste al año (extranjero)</button>
          <button type="button" data-on={medida === "programas" ? "1" : "0"} onClick={() => setMedida("programas")}>Nº de programas</button>
        </div>
        <svg viewBox={viewBox} role="img" aria-label="Programas de doctorado por comunidad">
          <rect {...recuadroCanarias} rx="10" fill="none" stroke="#b9cfdc" strokeDasharray="6 6" />
          {GEOMETRIA.filter((g) => porId.has(g.id)).map((g) => {
            const d = porId.get(g.id);
            return (
              <path key={g.id} d={g.d} fill={colorDe(M.valor(d))} stroke={sel === g.id ? "#fa943a" : "#ffffff"}
                strokeWidth={sel === g.id ? 5 : 1.5} fillRule="evenodd" style={{ cursor: "pointer" }}
                onClick={() => setSel(g.id)}>
                <title>{`${d.nombre}: ${d.programas} programas · tutela ${eur(d.tutela)}`}</title>
              </path>
            );
          })}
          {GEOMETRIA.filter((g) => porId.has(g.id) && g.etiqueta).map((g) => {
            const d = porId.get(g.id);
            const [x, y] = g.etiqueta;
            return (
              <g key={`t-${g.id}`} pointerEvents="none">
                <text x={x} y={y} textAnchor="middle" className="ase-dc-mapa-n" fill={M.claro(M.valor(d)) ? "#fff" : "#013446"}>{M.texto(d)}</text>
              </g>
            );
          })}
        </svg>
        <div className="ase-dc-leyenda">
          {[...M.tramos].reverse().map(([m, col], i, arr) => (
            <span key={m}><i style={{ background: col }} />{i < arr.length - 1 ? `${m}–${arr[i + 1][0] - 1}` : `${m}+`}</span>
          ))}
          <span className="nota">
            {medida === "coste"
              ? "€ al año de tutela en la pública, curso 2026-27 · sin recargo para extranjeros · toca una comunidad"
              : "programas presenciales · toca una comunidad"}
          </span>
        </div>
      </div>

      {c && (
        <aside className="ase-dc-ficha">
          <h3>{c.nombre}</h3>
          <div className="ase-dc-ficha-cifras">
            <div><b>{c.programas}</b><span>programas</span></div>
            <div><b>{c.universidades}</b><span>universidades ({c.publicas} púb. · {c.privadas} priv.)</span></div>
            <div><b>{eur(c.tutela)}</b><span>al año para un extranjero (tutela en la pública){c.tutela_verificada ? "" : " · por confirmar"}</span></div>
          </div>
          <p className="ase-dc-rot">Ciudades</p>
          <ul className="ase-dc-ciudades">
            {c.ciudades.map((x) => (
              <li key={x.ciudad}><span>{x.ciudad}</span><b>{x.programas}</b></li>
            ))}
          </ul>
          {c.abiertos.length > 0 && (
            <>
              <p className="ase-dc-rot">Plazos 2026-27</p>
              <ul className="ase-dc-plazos">
                {c.abiertos.map((u) => <li key={u.cod}><b>{u.corto}</b> {u.plazos}</li>)}
              </ul>
            </>
          )}
          <button type="button" className="ase-dc-boton" onClick={() => onVerCatalogo?.({ ccaa: c.id })}>Ver sus {c.programas} programas →</button>
        </aside>
      )}
    </div>
  );
}
