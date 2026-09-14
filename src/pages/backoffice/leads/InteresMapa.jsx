// «Interés del mapa»: pestaña de Leads en Inspira Core.
//
// Qué se mira y qué se compara en el mapa público (/mapa-estudiar-en-espana):
// comunidades y universidades más vistas, comparaciones, recomendaciones,
// guardadas y comparativas enviadas, por día. Los contadores no identifican a
// nadie; las comparativas son leads de origen MAPA y se abren en la bandeja.
// Datos: GET /backoffice/leads/mapa-interes?dias=N (permiso leads.ver).
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { boGET } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";
import { Pagina, Cabecera, Cuerpo, Boton, Seccion, Vacio, Esqueleto, Pill } from "../ui";
import LeadsPestanas from "./LeadsPestanas";
import "../../../styles/leads-core.css";

const RANGOS = [7, 30, 90];
const COLUMNAS = [
  { k: "ver_comunidad", l: "Comunidades vistas" },
  { k: "ver_universidad", l: "Universidades vistas" },
  { k: "comparar", l: "Comparaciones" },
  { k: "recomendar", l: "Recomendaciones" },
  { k: "guardar", l: "Guardadas" },
  { k: "comparativas", l: "Comparativas enviadas" },
];

const num = (n) => Number(n || 0).toLocaleString("es-ES");

function fechaCorta(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("es-PE", {
    weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
  }).replace(/\./g, "");
}

/** Ranking de una sola serie: barra proporcional y cifra en tinta, no en color. */
function Ranking({ filas, etiqueta, vacio }) {
  if (!filas.length) return <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 0" }}>{vacio}</p>;
  const max = Math.max(1, ...filas.map((f) => f.vistas));
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }} aria-label={etiqueta}>
      {filas.map((f, i) => (
        <li
          key={f.id}
          title={`${f.nombre}: ${num(f.vistas)} vistas · ${num(f.comparaciones)} comparaciones · ${num(f.comparativas)} comparativas`}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 13 }}>
            <span style={{ color: "var(--muted)", width: 18, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
            <span style={{ flex: 1, minWidth: 0, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {f.sigla ? `${f.sigla} · ` : ""}{f.nombre}
            </span>
            <span style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{num(f.vistas)}</span>
          </div>
          <div style={{ marginLeft: 26, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, height: 6, borderRadius: 4, background: "#e4ecf3", overflow: "hidden" }}>
              <i style={{ display: "block", height: "100%", width: `${(f.vistas / max) * 100}%`, background: "var(--primary)", borderRadius: 4 }} />
            </span>
            <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
              {num(f.comparaciones)} comp. · {num(f.comparativas)} env.
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function InteresMapa() {
  const [dias, setDias] = useState(30);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [soloConActividad, setSoloConActividad] = useState(true);

  const pedir = useCallback(() => boGET(`/backoffice/leads/mapa-interes?dias=${dias}`), [dias]);
  const aplicar = useCallback((r) => {
    if (r?.ok) { setDatos(r); setError(null); } else { setError(r?.msg || "No se pudo cargar el interés del mapa."); }
  }, []);
  const cargar = () => { setDatos(null); pedir().then(aplicar); };

  useEffect(() => {
    let vivo = true;
    setDatos(null);
    pedir().then((r) => { if (vivo) aplicar(r); });
    return () => { vivo = false; };
  }, [pedir, aplicar]);

  const t = datos?.totales || {};
  const stats = [
    { n: (t.ver_comunidad || 0) + (t.ver_universidad || 0), l: `vistas · ${dias} d` },
    { n: t.comparar || 0, l: "comparaciones" },
    { n: t.recomendar || 0, l: "recomendaciones" },
    { n: t.guardar || 0, l: "guardadas" },
    { n: t.comparativas || 0, l: "comparativas enviadas", tono: "ok" },
  ];

  const dias_ = (datos?.porDia || []).slice().reverse();
  const conActividad = dias_.filter((d) => COLUMNAS.some((c) => d[c.k] > 0));
  const filasDia = soloConActividad ? conActividad : dias_;

  return (
    <Pagina>
      <LeadsPestanas activa="mapa-interes" />
      <Cabecera
        eyebrow="Leads · Mapa"
        titulo="Qué se mira en el mapa"
        subtitulo="Comunidades y universidades más vistas, qué se compara y cuántos piden su comparativa. Los contadores no identifican a nadie; las comparativas son leads."
        acciones={
          <>
            <Boton tono="cta" icono={ArrowRight} onClick={() => navigate("/backoffice/leads?origen=MAPA")}>
              Leads del mapa{datos ? ` (${num(datos.leads?.total)})` : ""}
            </Boton>
            <Boton tono="cristal" icono={RefreshCw} onClick={cargar} aria-label="Recargar">
              <span className="hidden sm:inline">Recargar</span>
            </Boton>
          </>
        }
        stats={stats}
      />

      <Cuerpo>
        <div role="group" aria-label="Periodo" style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "4px 0 14px" }}>
          {RANGOS.map((r) => (
            <Pill key={r} on={dias === r} onClick={() => setDias(r)}>Últimos {r} días</Pill>
          ))}
        </div>

        {error && (
          <div className="ase-tarjeta ase-tarjeta-p" style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</div>
        )}

        {!datos && !error ? (
          <Esqueleto filas={4} />
        ) : datos ? (
          <>
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" }}>
              <div className="ase-tarjeta ase-tarjeta-p">
                <Seccion titulo="Comunidades más vistas" subtitulo="Vistas de la ficha; comparaciones y comparativas enviadas en gris.">
                  <Ranking filas={datos.comunidades} etiqueta="Comunidades más vistas" vacio="Aún no hay vistas de comunidades en este periodo." />
                </Seccion>
              </div>
              <div className="ase-tarjeta ase-tarjeta-p">
                <Seccion titulo="Universidades más vistas" subtitulo="Vistas de la ficha; comparaciones y comparativas enviadas en gris.">
                  <Ranking filas={datos.universidades} etiqueta="Universidades más vistas" vacio="Aún no hay vistas de universidades en este periodo." />
                </Seccion>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <Seccion
                titulo="Día a día"
                subtitulo={`Del ${fechaCorta(datos.desde)} al ${fechaCorta(datos.hasta)} (hora de Lima).`}
                derecha={
                  <label className="ase-toggle">
                    <input type="checkbox" checked={soloConActividad} onChange={(e) => setSoloConActividad(e.target.checked)} />
                    <i /> Solo días con actividad
                  </label>
                }
              >
                {filasDia.length === 0 ? (
                  <Vacio titulo="Sin actividad en este periodo" texto="Cuando alguien abra una ficha o compare en el mapa, aparecerá aquí." />
                ) : (
                  <div className="ase-tabla-scroll">
                    <table className="ase-ld-tabla">
                      <thead>
                        <tr>
                          <th>Día</th>
                          {COLUMNAS.map((c) => <th key={c.k} style={{ textAlign: "right" }}>{c.l}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {filasDia.map((d) => (
                          <tr key={d.fecha} style={{ cursor: "default" }}>
                            <td style={{ whiteSpace: "nowrap", fontWeight: 700 }}>{fechaCorta(d.fecha)}</td>
                            {COLUMNAS.map((c) => (
                              <td key={c.k} style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: d[c.k] ? "var(--ink)" : "#9fb3c0" }}>
                                {num(d[c.k])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Seccion>
            </div>
          </>
        ) : null}
      </Cuerpo>
    </Pagina>
  );
}
