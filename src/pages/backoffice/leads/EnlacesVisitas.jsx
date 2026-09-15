// «Enlaces y visitas»: pestaña de Leads en Inspira Core (15/09/2026).
//
// Cuántas veces se abren las páginas de campaña (/enlaces, beca, mapa, grado)
// y desde dónde (TikTok, Instagram, QR…), qué botones de /enlaces se tocan y
// cuántos contactos llegaron por /enlaces o por el QR.
// - Visitas: contador anónimo sin cookies (cuenta a todos).
// - Clics: solo de quien acepta la analítica (la cifra real es mayor).
// - Contactos: leads con utm_source «enlaces» o «qr», sin cuentas de prueba.
// Datos: GET /backoffice/leads/enlaces?dias=N (permiso leads.ver).
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { boGET } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";
import { Pagina, Cabecera, Cuerpo, Boton, Seccion, Vacio, Esqueleto, Pill } from "../ui";
import LeadsPestanas from "./LeadsPestanas";
import { ORIGENES } from "./leadsComun";
import "../../../styles/leads-core.css";

const RANGOS = [7, 30, 90];

const PAGINA = {
  enlaces: "Página de enlaces",
  beca: "Beca Bicentenario",
  mapa: "Mapa de máster",
  grado: "Grado en España",
};

const FUENTE = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  google: "Google",
  linkedin: "LinkedIn",
  qr: "Código QR",
  enlaces: "Página de enlaces",
  directo: "Directo o sin dato",
  otro: "Otro",
};

const BOTON = {
  "beca:imagen": "Beca · imagen",
  "beca:simulador": "Beca · calcula tu puntaje",
  "beca:aviso": "Beca · avísame",
  "contacto:whatsapp": "WhatsApp",
  "contacto:llamar": "Llamar",
  "contacto:guardar": "Guardar contacto",
  opiniones: "Opiniones y casos de éxito",
  "recurso:mapa": "Mapa de universidades",
  "recurso:grado": "Grado en España",
  "recurso:calculadora": "Calculadora de máster",
  "recurso:visa-o-estancia": "Test visa o estancia",
  "servicio:visado": "Visado de estudios",
  "servicio:estancia": "Estancia por estudios",
  "paquete-master": "Paquete Máster",
  eventos: "Eventos",
  portal: "Mi portal",
  web: "Web oficial",
};

const num = (n) => Number(n || 0).toLocaleString("es-ES");

/** «reserva:personalizada-30» → «Reserva · personalizada 30» si no está en la lista. */
const nombreBoton = (k) => BOTON[k] || String(k).replace(/:/g, " · ").replace(/-/g, " ").replace(/^red · /, "Red · ");

function fechaCorta(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("es-PE", {
    weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
  }).replace(/\./g, "");
}

/** Barras de una sola serie: barra proporcional y cifra en tinta. */
function Barras({ filas, nombre, etiqueta, vacio }) {
  if (!filas?.length) return <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 0" }}>{vacio}</p>;
  const max = Math.max(1, ...filas.map((f) => f.total));
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }} aria-label={etiqueta}>
      {filas.map((f, i) => (
        <li key={f.clave}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 13 }}>
            <span style={{ color: "var(--muted)", width: 18, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
            <span style={{ flex: 1, minWidth: 0, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {nombre(f.clave)}
            </span>
            <span style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{num(f.total)}</span>
          </div>
          <div style={{ marginLeft: 26 }}>
            <span style={{ display: "block", height: 6, borderRadius: 4, background: "#e4ecf3", overflow: "hidden" }}>
              <i style={{ display: "block", height: "100%", width: `${(f.total / max) * 100}%`, background: "var(--primary)", borderRadius: 4 }} />
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function EnlacesVisitas() {
  const [dias, setDias] = useState(30);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [soloConActividad, setSoloConActividad] = useState(true);

  const pedir = useCallback(() => boGET(`/backoffice/leads/enlaces?dias=${dias}`), [dias]);
  const aplicar = useCallback((r) => {
    if (r?.ok) { setDatos(r); setError(null); } else { setError(r?.msg || "No se pudieron cargar las visitas."); }
  }, []);
  const cargar = () => { setDatos(null); pedir().then(aplicar); };

  useEffect(() => {
    let vivo = true;
    setDatos(null);
    pedir().then((r) => { if (vivo) aplicar(r); });
    return () => { vivo = false; };
  }, [pedir, aplicar]);

  const stats = [
    { n: datos?.visitas?.total || 0, l: `visitas · ${dias} d` },
    { n: datos?.clics?.total || 0, l: "clics en /enlaces" },
    { n: datos?.contactos?.total || 0, l: "contactos por enlaces o QR" },
    { n: datos?.contactos?.contratados || 0, l: "contratados", tono: "ok" },
  ];

  const paginas = datos?.paginas || [];
  const filas = (datos?.serie || [])
    .map((d) => ({ ...d, total: paginas.reduce((a, k) => a + (d[k] || 0), 0) }))
    .reverse();
  const filasDia = soloConActividad ? filas.filter((d) => d.total > 0) : filas;

  return (
    <Pagina>
      <LeadsPestanas activa="enlaces" />
      <Cabecera
        eyebrow="Leads · Enlaces"
        titulo="Enlaces y visitas"
        subtitulo="Cuántas veces se abren /enlaces, la beca, el mapa y Grado, desde dónde llegan y qué botones se tocan. Las visitas son anónimas y cuentan a todos; los clics, solo de quien acepta la analítica."
        acciones={
          <>
            <Boton tono="cta" icono={ArrowRight} onClick={() => navigate("/backoffice/leads")}>
              Bandeja de leads
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
                <Seccion titulo="Visitas por página" subtitulo="Cada vez que se abre la página.">
                  <Barras filas={datos.visitas.por_pagina} nombre={(k) => PAGINA[k] || k} etiqueta="Visitas por página" vacio="Aún no hay visitas en este periodo." />
                </Seccion>
              </div>
              <div className="ase-tarjeta ase-tarjeta-p">
                <Seccion titulo="¿De dónde llegan?" subtitulo="Por el enlace con utm o por la web de la que vienen.">
                  <Barras filas={datos.visitas.por_fuente} nombre={(k) => FUENTE[k] || k} etiqueta="Procedencia de las visitas" vacio="Aún no hay visitas en este periodo." />
                </Seccion>
              </div>
              <div className="ase-tarjeta ase-tarjeta-p">
                <Seccion titulo="Botones más tocados en /enlaces" subtitulo="Solo de quien acepta la analítica.">
                  <Barras filas={datos.clics.por_boton} nombre={nombreBoton} etiqueta="Botones más tocados" vacio="Aún no hay clics registrados en este periodo." />
                </Seccion>
              </div>
              <div className="ase-tarjeta ase-tarjeta-p">
                <Seccion titulo="Contactos por enlaces o QR" subtitulo="Leads que entraron por /enlaces o el código QR.">
                  <Barras filas={datos.contactos.por_fuente} nombre={(k) => FUENTE[k] || k} etiqueta="Contactos por procedencia" vacio="Aún no hay contactos por enlaces o QR." />
                  {datos.contactos.por_origen.length > 0 && (
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: "10px 0 0" }}>
                      Formulario:{" "}
                      {datos.contactos.por_origen.map((o) => `${ORIGENES[o.clave] || o.clave} (${num(o.total)})`).join(" · ")}
                    </p>
                  )}
                </Seccion>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <Seccion
                titulo="Día a día"
                subtitulo="Visitas por página (hora de Lima)."
                derecha={
                  <label className="ase-toggle">
                    <input type="checkbox" checked={soloConActividad} onChange={(e) => setSoloConActividad(e.target.checked)} />
                    <i /> Solo días con visitas
                  </label>
                }
              >
                {filasDia.length === 0 ? (
                  <Vacio titulo="Sin visitas en este periodo" texto="Cuando alguien abra /enlaces, la beca, el mapa o Grado, aparecerá aquí." />
                ) : (
                  <div className="ase-tabla-scroll">
                    <table className="ase-ld-tabla">
                      <thead>
                        <tr>
                          <th>Día</th>
                          {paginas.map((k) => <th key={k} style={{ textAlign: "right" }}>{PAGINA[k] || k}</th>)}
                          <th style={{ textAlign: "right" }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filasDia.map((d) => (
                          <tr key={d.fecha} style={{ cursor: "default" }}>
                            <td style={{ whiteSpace: "nowrap", fontWeight: 700 }}>{fechaCorta(d.fecha)}</td>
                            {paginas.map((k) => (
                              <td key={k} style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: d[k] ? "var(--ink)" : "#9fb3c0" }}>
                                {num(d[k])}
                              </td>
                            ))}
                            <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 800 }}>{num(d.total)}</td>
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
