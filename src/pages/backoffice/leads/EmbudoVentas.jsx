// «Embudo de ventas»: pestaña de Leads (/backoffice/leads/embudo).
//
// El recorrido lead → contactado → sesión diagnóstico → contrato → primer
// pago, medido con lo nuestro (sin Google Analytics). Los leads se agrupan
// por el mes en que entraron; cada paso incluye a quien llegó a uno
// posterior. Filtros por servicio, por origen del lead y por canal (utm o
// «sin origen»). Las cuentas de prueba quedan fuera salvo que se pida lo
// contrario. Las reglas las calcula el servidor
// (inspira-backend/src/modules/leads/embudo.js).
import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { boGET } from "../../../services/backofficeApi";
import { Pagina, Cabecera, Cuerpo, Boton, Esqueleto, Pill, Vacio } from "../ui";
import LeadsPestanas from "./LeadsPestanas";
import "../../../styles/leads-core.css";

const COLOR_PASO = {
  lead: "#4e9ee8",
  contactado: "#02506b",
  sesion: "#7d3c98",
  contrato: "#1d6a4a",
  pago: "#b9770e",
};
const TASA_DE_PASO = { contactado: "contactado", sesion: "sesion", contrato: "contrato", pago: "pago" };

const AGRUPAR = [
  { id: "por_origen", label: "Por origen" },
  { id: "por_canal", label: "Por canal" },
  { id: "por_servicio", label: "Por servicio" },
];

function mesLima(n = 0) {
  const hoy = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima", year: "numeric", month: "2-digit",
  }).format(new Date()).slice(0, 7);
  const [a, m] = hoy.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

const nombreMes = (mes) => {
  const [a, m] = String(mes).split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, 15)).toLocaleDateString("es-ES", { month: "short", year: "numeric", timeZone: "UTC" }).replace(".", "");
};

const pct = (v) => (v === null || v === undefined ? "—" : `${v.toLocaleString("es-ES")} %`);
const diasTexto = (d) => (d?.media === null || d?.media === undefined ? "—" : `${d.media.toLocaleString("es-ES")} d`);

function FilaCifras({ etiqueta, f, extra }) {
  return (
    <tr>
      <td className="ase-ld-emb-etq">{etiqueta}</td>
      <td>{f.lead}</td>
      <td>{f.contactado}</td>
      <td>{f.sesion}</td>
      <td>{f.contrato}</td>
      <td>{f.pago}</td>
      <td>{pct(f.tasas?.lead_a_contrato)}</td>
      <td>{diasTexto(f.dias_lead_contrato)}</td>
      {extra}
    </tr>
  );
}

const CABECERA = ["Leads", "Contactados", "Sesión", "Contrato", "Primer pago", "Lead → contrato", "Días a contrato"];

export default function EmbudoVentas() {
  const [desde, setDesde] = useState(() => mesLima(-5));
  const [hasta, setHasta] = useState(() => mesLima(0));
  const [servicio, setServicio] = useState("");
  const [origen, setOrigen] = useState("");
  const [canal, setCanal] = useState("");
  const [conPruebas, setConPruebas] = useState(false);
  const [agrupar, setAgrupar] = useState("por_origen");
  const [recarga, setRecarga] = useState(0);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (desde) p.set("desde", desde);
    if (hasta) p.set("hasta", hasta);
    if (servicio) p.set("servicio", servicio);
    if (origen) p.set("origen", origen);
    if (canal) p.set("canal", canal);
    if (conPruebas) p.set("incluir_pruebas", "1");
    return p.toString();
  }, [desde, hasta, servicio, origen, canal, conPruebas]);

  // `query` dice a qué consulta corresponde lo que hay en pantalla.
  const [estado, setEstado] = useState({ query: null, datos: null, error: null });
  useEffect(() => {
    let vivo = true;
    boGET(`/backoffice/leads/embudo-ventas?${query}`).then((r) => {
      if (!vivo) return;
      if (r?.ok) setEstado({ query, datos: r, error: null });
      else setEstado((e) => ({ query, datos: e.datos, error: r?.msg || "No se pudo calcular el embudo." }));
    });
    return () => { vivo = false; };
  }, [query, recarga]);

  const d = estado.datos;
  const cargando = estado.query !== query;
  const total = d?.total;
  const maxLeads = Math.max(1, total?.lead || 0);

  const stats = [
    { n: total?.lead ?? 0, l: "leads" },
    { n: total?.contrato ?? 0, l: "contratos", tono: "ok" },
    { n: pct(total?.tasas?.lead_a_contrato), l: "lead → contrato" },
    { n: diasTexto(total?.dias_lead_contrato), l: "días medios a contrato", tono: "cielo" },
    { n: total?.pago ?? 0, l: "con primer pago" },
  ];

  return (
    <Pagina>
      <LeadsPestanas activa="embudo" />
      <Cabecera
        eyebrow="Leads"
        titulo="Embudo de ventas"
        subtitulo="De cada lead que entra en el mes: cuántos se contactaron, tuvieron sesión diagnóstico, contrataron un servicio y pagaron. Medido con los datos de Core, sin Google Analytics."
        acciones={(
          <Boton tono="cristal" icono={RefreshCw} onClick={() => setRecarga((n) => n + 1)} aria-label="Recargar">
            <span className="hidden sm:inline">Recargar</span>
          </Boton>
        )}
        stats={stats}
      />

      <Cuerpo>
        <div className="ase-ld-emb-filtros">
          <label className="ase-ld-emb-campo">
            <span>Desde</span>
            <input className="ase-campo" type="month" value={desde} max={hasta || undefined}
              onChange={(e) => setDesde(e.target.value)} aria-label="Desde el mes" />
          </label>
          <label className="ase-ld-emb-campo">
            <span>Hasta</span>
            <input className="ase-campo" type="month" value={hasta} min={desde || undefined}
              onChange={(e) => setHasta(e.target.value)} aria-label="Hasta el mes" />
          </label>
          <select className="ase-campo" value={servicio} onChange={(e) => setServicio(e.target.value)} aria-label="Servicio">
            <option value="">Todos los servicios</option>
            {(d?.opciones?.servicios || []).map((o) => <option key={o.clave} value={o.clave}>{o.etiqueta}</option>)}
          </select>
          <select className="ase-campo" value={origen} onChange={(e) => setOrigen(e.target.value)} aria-label="Origen">
            <option value="">Todos los orígenes</option>
            {(d?.opciones?.origenes || []).map((o) => <option key={o.clave} value={o.clave}>{o.etiqueta}</option>)}
          </select>
          <select className="ase-campo" value={canal} onChange={(e) => setCanal(e.target.value)} aria-label="Canal">
            <option value="">Todos los canales</option>
            {(d?.opciones?.canales || []).map((o) => <option key={o.clave} value={o.clave}>{o.etiqueta}</option>)}
          </select>
          <label className="ase-toggle">
            <input type="checkbox" checked={conPruebas} onChange={(e) => setConPruebas(e.target.checked)} />
            <i /> Incluir pruebas
          </label>
        </div>

        {estado.error && (
          <div className="ase-tarjeta ase-tarjeta-p" style={{ color: "var(--red)", fontSize: 13 }}>{estado.error}</div>
        )}

        {!d ? (
          <Esqueleto filas={4} alto={70} />
        ) : !total?.lead ? (
          <Vacio titulo="Sin leads en este periodo" texto="Amplía el rango de meses o quita filtros." />
        ) : (
          <div style={{ opacity: cargando ? 0.6 : 1, transition: "opacity .2s", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* El embudo del periodo: barra por paso y la tasa desde el anterior. */}
            <section className="ase-ld-emb-pasos" aria-label="Embudo del periodo">
              {(d.pasos || []).map((p) => {
                const n = total[p.clave] || 0;
                const tasa = TASA_DE_PASO[p.clave] ? total.tasas?.[TASA_DE_PASO[p.clave]] : null;
                return (
                  <div key={p.clave} className="ase-ld-emb-paso" style={{ "--ld-color": COLOR_PASO[p.clave] }}>
                    <span className="ase-ld-emb-paso-l">{p.etiqueta}</span>
                    <span className="ase-ld-emb-paso-bar"><i style={{ width: `${(n / maxLeads) * 100}%` }} /></span>
                    <span className="ase-ld-emb-paso-n">{n}</span>
                    <span className="ase-ld-emb-paso-t">{tasa === null || tasa === undefined ? "" : `${pct(tasa)} del paso anterior`}</span>
                  </div>
                );
              })}
              <p className="ase-ld-emb-nota">
                Mediana de días de lead a contrato: {d.total.dias_lead_contrato?.mediana ?? "—"}
                {" · "}media de días de lead a primer pago: {diasTexto(d.total.dias_lead_pago)}
                {d.excluye_pruebas ? ` · ${d.excluidos_prueba} leads de prueba fuera` : " · incluye pruebas"}
              </p>
            </section>

            {/* Por mes de entrada del lead. */}
            <section className="ase-ld-emb-caja">
              <h2 className="ase-seccion-t">Por mes de entrada</h2>
              <div className="ase-tabla-scroll">
                <table className="ase-ld-emb-tabla">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      {CABECERA.map((c) => <th key={c}>{c}</th>)}
                      {d.clics_sin_datos && <th title="Clics de WhatsApp, /enlaces o PDF sin datos de contacto">Clics sin datos</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {d.meses.map((m) => (
                      <FilaCifras key={m.mes} etiqueta={nombreMes(m.mes)} f={m}
                        extra={d.clics_sin_datos ? <td>{d.clics_sin_datos[m.mes] ?? 0}</td> : null} />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Por origen, canal o servicio. */}
            <section className="ase-ld-emb-caja">
              <div className="ase-pills" role="group" aria-label="Agrupar">
                {AGRUPAR.map((a) => (
                  <Pill key={a.id} on={agrupar === a.id} onClick={() => setAgrupar(a.id)}>{a.label}</Pill>
                ))}
              </div>
              <div className="ase-tabla-scroll">
                <table className="ase-ld-emb-tabla">
                  <thead>
                    <tr>
                      <th>{AGRUPAR.find((a) => a.id === agrupar)?.label.replace("Por ", "")}</th>
                      {CABECERA.map((c) => <th key={c}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {(d[agrupar] || []).map((f) => <FilaCifras key={f.clave} etiqueta={f.etiqueta} f={f} />)}
                  </tbody>
                </table>
              </div>
              <p className="ase-ld-emb-nota">
                Canal: la fuente utm con la que llegó el lead (o «sin origen» si no la trae). Servicio: el
                del contrato o, si aún no contrató, el que dijo que le interesaba.
              </p>
            </section>
          </div>
        )}
      </Cuerpo>
    </Pagina>
  );
}
