// Las cinco herramientas gratuitas de la app (03/11/2026). Cada una guarda lo
// suyo en la cuenta con useHerramienta; ninguna llama a la IA.
import { useMemo, useState } from "react";
import Icono from "../../../components/common/Icono";
import AvisosMovil from "../components/AvisosMovil";
import { navigate } from "../../../services/navigate";
import { BECAS, MESES } from "../../becas2027/textos";
import { IPREM_ANUAL } from "../../../config/visaOEstancia";
import { useHerramienta, textoEstado, uid } from "./useHerramienta";
import { usados, salidaMaxima, diaDe } from "./schengen";

const eur = (n) => `${Math.round(n || 0).toLocaleString("es-ES")}\u00a0€`;
const hoyIso = () => new Date().toISOString().slice(0, 10);
const mesDe = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
const fechaLarga = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

export function Cabecera({ icono, titulo, lema, estado }) {
  return (
    <header className="pnl-hr-cab">
      <button type="button" className="pnl-hr-volver ux-tap" onClick={() => navigate("/panel/herramientas")}>
        ← Herramientas
      </button>
      <div className="pnl-hr-cab-fila">
        <span className="pnl-hr-tile"><Icono nombre={icono} size={22} /></span>
        <div className="min-w-0">
          <h2>{titulo}</h2>
          <p>{lema}</p>
        </div>
      </div>
      {estado && <span className={`pnl-hr-estado${estado === "error" ? " es-error" : ""}`}>{textoEstado(estado)}</span>}
    </header>
  );
}

function Numero({ etiqueta, valor, onCambio, sufijo = "€" }) {
  return (
    <label className="pnl-hr-campo">
      <span>{etiqueta}</span>
      <span className="pnl-hr-num">
        <input type="number" inputMode="decimal" min="0" value={valor ?? ""} onChange={(e) => onCambio(e.target.value === "" ? "" : Number(e.target.value))} />
        <i>{sufijo}</i>
      </span>
    </label>
  );
}

// ── 1. Presupuesto ──────────────────────────────────────────────────────────
const MENSUAL = [["alojamiento", "Alojamiento", 450], ["comida", "Comida", 250], ["transporte", "Transporte", 40], ["movil", "Móvil e internet", 20], ["otros", "Ocio y otros", 100]];
const UNICOS = [["matricula", "Matrícula", 3000], ["vuelo", "Vuelo", 900], ["seguro", "Seguro médico", 400], ["tramites", "Visa, tasas y apostillas", 250], ["fianza", "Fianza del piso", 900], ["instalacion", "Instalarte (sábanas, cocina…)", 200]];
const BASE_PRESUPUESTO = { meses: 10, ...Object.fromEntries([...MENSUAL, ...UNICOS].map(([k, , v]) => [k, v])) };

export function Presupuesto() {
  const [d, guardar, estado] = useHerramienta("presupuesto", BASE_PRESUPUESTO);
  const meses = Number(d.meses) || 0;
  const mes = MENSUAL.reduce((s, [k]) => s + (Number(d[k]) || 0), 0);
  const unicos = UNICOS.reduce((s, [k]) => s + (Number(d[k]) || 0), 0);
  const fondos = (IPREM_ANUAL / 12) * meses;
  const poner = (k) => (v) => guardar({ ...d, [k]: v });
  return (
    <div className="pnl-hr">
      <Cabecera icono="euro" titulo="¿Cuánto cuesta tu sueño?" lema="Tu presupuesto para vivir y estudiar en España." estado={estado} />
      <div className="pnl-hr-total">
        <small>Total para {meses || "…"} meses</small>
        <strong>{eur(mes * meses + unicos)}</strong>
        <span>{eur(mes)} al mes + {eur(unicos)} de una sola vez</span>
      </div>
      <section className="pnl-hr-caja">
        <h3>Cada mes</h3>
        <Numero etiqueta="Meses que vas a estar" valor={d.meses} onCambio={poner("meses")} sufijo="meses" />
        {MENSUAL.map(([k, t]) => <Numero key={k} etiqueta={t} valor={d[k]} onCambio={poner(k)} />)}
      </section>
      <section className="pnl-hr-caja">
        <h3>Una sola vez</h3>
        {UNICOS.map(([k, t]) => <Numero key={k} etiqueta={t} valor={d[k]} onCambio={poner(k)} />)}
      </section>
      <section className="pnl-hr-caja pnl-hr-nota">
        <h3>Para la visa de estudios</h3>
        <p>
          El consulado suele pedir que acredites medios de al menos el 100 % del IPREM: unos <b>{eur(IPREM_ANUAL / 12)} al mes</b>,
          es decir <b>{eur(fondos)}</b> para {meses || "…"} meses. Es orientativo: cada consulado puede pedir más.
        </p>
        <button type="button" className="pnl-btn ux-tap" onClick={() => navigate("/visa-o-estancia")}>¿Visa o estancia? Haz el test →</button>
      </section>
      <p className="pnl-hr-pie">Las cifras vienen de ejemplo: cámbialas por las tuyas y se guardan solas.</p>
    </div>
  );
}

// ── 2. Tracker de becas ─────────────────────────────────────────────────────
const ESTADOS = [
  { id: "interesa", texto: "Me interesa", icono: "⭐" },
  { id: "preparando", texto: "Preparando", icono: "📝" },
  { id: "postule", texto: "Postulé", icono: "📨" },
  { id: "ganada", texto: "¡Ganada!", icono: "🎉" },
  { id: "no", texto: "No salió", icono: "—" },
];

// El cierre que publica la guía, cuando es un día exacto («15» de «feb»), en
// su próxima fecha. Si no lo es, la persona lo escribe.
const MES_NUM = { ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, julio: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12 };
function plazoSugerido(b) {
  const dia = Number(b.dia), mes = MES_NUM[String(b.cuando).split(/[–-]/)[0]];
  if (!dia || !mes) return "";
  const iso = (a) => `${a}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  const anio = new Date().getFullYear();
  return iso(anio) >= hoyIso() ? iso(anio) : iso(anio + 1);
}

/** «Avisarme»: el cierre de la beca va a su calendario, que avisa al móvil. */
function PlazoBeca({ beca, cal, guardarCal }) {
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState(() => plazoSugerido(beca));
  const apuntado = (cal.eventos || []).find((e) => e.beca === beca.id);
  if (apuntado) return <p className="pnl-hr-plazo-ok">📅 En tu calendario: {fechaLarga(apuntado.fecha)}. Te avisamos 7 días antes.</p>;
  if (!abierto) return <button type="button" className="pnl-btn ux-tap" onClick={() => setAbierto(true)}>🔔 Avisarme del cierre</button>;
  return (
    <div className="pnl-hr-plazo">
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} aria-label={`Cierre de ${beca.nombre}`} />
      <button type="button" className="pnl-btn-cta ux-tap" disabled={!fecha}
        onClick={() => guardarCal({ ...cal, eventos: [...(cal.eventos || []), { id: uid(), fecha, titulo: `Cierra ${beca.nombre}`, beca: beca.id }].slice(-150) })}>
        Apuntar
      </button>
    </div>
  );
}

export function TrackerBecas() {
  const [d, guardar, estado] = useHerramienta("becas", { estados: {} });
  const [cal, guardarCal] = useHerramienta("calendario", { viaje: "", eventos: [] });
  const [filtro, setFiltro] = useState("todas");
  const estados = d.estados || {};
  const mes = (id) => MESES.find((m) => m.id === id)?.titulo || "";
  const lista = filtro === "mias" ? BECAS.filter((b) => estados[b.id]) : BECAS;
  const nMias = BECAS.filter((b) => estados[b.id]).length;
  const marcar = (id, e) => guardar({ ...d, estados: { ...estados, [id]: estados[id] === e ? undefined : e } });
  return (
    <div className="pnl-hr">
      <Cabecera icono="birrete" titulo="Tracker de becas" lema="Las becas para estudiar en España y en qué punto vas con cada una." estado={estado} />
      <div className="pnl-hr-chips" role="tablist">
        <button type="button" aria-pressed={filtro === "todas"} onClick={() => setFiltro("todas")}>Todas ({BECAS.length})</button>
        <button type="button" aria-pressed={filtro === "mias"} onClick={() => setFiltro("mias")}>Mis becas ({nMias})</button>
      </div>
      {lista.length === 0 && <p className="pnl-hr-vacio">Todavía no sigues ninguna. Marca «Me interesa» en las que te encajen.</p>}
      {lista.map((b) => (
        <article key={b.id} className="pnl-hr-caja pnl-hr-beca" data-estado={estados[b.id] || undefined}>
          <div className="pnl-hr-beca-cab">
            <strong>{b.nombre}</strong>
            <span className="pnl-hr-mes">{mes(b.mes)}</span>
          </div>
          <p className="pnl-hr-cubre">{b.cubre}</p>
          <p className="pnl-hr-clave">{b.clave}</p>
          <div className="pnl-hr-estados">
            {ESTADOS.map((e) => (
              <button key={e.id} type="button" aria-pressed={estados[b.id] === e.id} onClick={() => marcar(b.id, e.id)}>
                <span aria-hidden="true">{e.icono}</span> {e.texto}
              </button>
            ))}
          </div>
          {estados[b.id] && !["ganada", "no"].includes(estados[b.id]) && <PlazoBeca beca={b} cal={cal} guardarCal={guardarCal} />}
          {b.url && <a className="pnl-hr-enlace" href={b.url} target="_blank" rel="noopener noreferrer">Web oficial ↗</a>}
        </article>
      ))}
      <p className="pnl-hr-pie">Plazos orientativos según la convocatoria anterior. Confírmalos siempre en la web oficial.</p>
    </div>
  );
}

// ── 3. Calendario ───────────────────────────────────────────────────────────
export function Calendario() {
  const [d, guardar, estado] = useHerramienta("calendario", { viaje: "", eventos: [] });
  const [nuevo, setNuevo] = useState({ fecha: "", titulo: "" });
  const eventos = useMemo(() => [...(d.eventos || [])].sort((a, b) => a.fecha.localeCompare(b.fecha)), [d.eventos]);
  const hoy = hoyIso();
  const faltan = d.viaje ? diaDe(d.viaje) - diaDe(hoy) : null;
  const anadir = (e) => {
    e.preventDefault();
    if (!nuevo.fecha || !nuevo.titulo.trim()) return;
    guardar({ ...d, eventos: [...(d.eventos || []), { id: uid(), fecha: nuevo.fecha, titulo: nuevo.titulo.trim().slice(0, 120) }].slice(-150) });
    setNuevo({ fecha: "", titulo: "" });
  };
  const quitar = (id) => guardar({ ...d, eventos: (d.eventos || []).filter((x) => x.id !== id) });
  return (
    <div className="pnl-hr">
      <Cabecera icono="calendario" titulo="Tu calendario" lema="Tus plazos, tus citas y la cuenta atrás de tu viaje." estado={estado} />
      <section className="pnl-hr-total">
        <small>Mi viaje a España ✈️</small>
        {faltan !== null && faltan >= 0
          ? <><strong>{faltan === 0 ? "¡Hoy!" : `${faltan} días`}</strong><span>{fechaLarga(d.viaje)}</span></>
          : <span>{faltan !== null ? "¡Ya estás allí! Cambia la fecha si viajas otra vez." : "Pon la fecha y te cuento los días que faltan."}</span>}
        <input type="date" className="pnl-hr-fecha" value={d.viaje || ""} onChange={(e) => guardar({ ...d, viaje: e.target.value })} aria-label="Fecha del viaje" />
      </section>
      {/* Los avisos al móvil: 7 días antes, el día anterior y el mismo día. */}
      <AvisosMovil />
      <form className="pnl-hr-caja pnl-hr-form" onSubmit={anadir}>
        <h3>Añadir a tu calendario</h3>
        <input type="date" value={nuevo.fecha} onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })} aria-label="Fecha" required />
        <input type="text" placeholder="Ej.: Cierra la beca Carolina" maxLength={120} value={nuevo.titulo} onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })} aria-label="Qué pasa ese día" required />
        <button type="submit" className="pnl-btn-cta ux-tap">Añadir</button>
      </form>
      {eventos.length === 0 && <p className="pnl-hr-vacio">Aún no hay nada. Apunta el cierre de tus becas, tus citas o el día que te mudas.</p>}
      <div className="pnl-hr-agenda">
        {eventos.map((ev, i) => {
          const m = mesDe(ev.fecha);
          const cab = i === 0 || mesDe(eventos[i - 1].fecha) !== m ? m : null;
          const dias = diaDe(ev.fecha) - diaDe(hoy);
          return (
            <div key={ev.id}>
              {cab && <h4>{cab}</h4>}
              <div className="pnl-hr-evento" data-pasado={dias < 0 ? "1" : undefined}>
                <span className="pnl-hr-dia"><b>{Number(ev.fecha.slice(8, 10))}</b></span>
                <span className="min-w-0 flex-1">
                  <strong>{ev.titulo}</strong>
                  <small>{dias === 0 ? "Hoy" : dias > 0 ? `Faltan ${dias} días` : "Ya pasó"}</small>
                </span>
                <button type="button" className="pnl-hr-quitar" onClick={() => quitar(ev.id)} aria-label={`Borrar ${ev.titulo}`}>×</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 4. Días Schengen ────────────────────────────────────────────────────────
export function Schengen() {
  const [d, guardar, estado] = useHerramienta("schengen", { estancias: [], entrada: "" });
  const hoy = hoyIso();
  const estancias = d.estancias || [];
  const n = usados(estancias, hoy);
  const salida = d.entrada ? salidaMaxima(estancias, d.entrada) : null;
  const cambiar = (id, k, v) => guardar({ ...d, estancias: estancias.map((e) => (e.id === id ? { ...e, [k]: v } : e)) });
  return (
    <div className="pnl-hr">
      <Cabecera icono="pasaporte" titulo="Calculadora Schengen" lema="¿Cuántos días te quedan como turista? La regla de 90 días cada 180." estado={estado} />
      <div className="pnl-hr-total" data-alerta={n > 90 ? "1" : undefined}>
        <small>Te quedan hoy</small>
        <strong>{Math.max(0, 90 - n)} de 90 días</strong>
        <span>Has usado {n} en los últimos 180 días</span>
        <span className="pnl-hr-barra" style={{ "--p": Math.min(100, (n / 90) * 100) }} aria-hidden="true" />
      </div>
      <section className="pnl-hr-caja">
        <h3>Tus viajes a Europa</h3>
        {estancias.length === 0 && <p className="pnl-hr-vacio">Añade cada vez que entraste y saliste del espacio Schengen.</p>}
        {estancias.map((e) => (
          <div key={e.id} className="pnl-hr-viaje">
            <label><span>Entrada</span><input type="date" value={e.entrada} onChange={(ev) => cambiar(e.id, "entrada", ev.target.value)} /></label>
            <label><span>Salida</span><input type="date" value={e.salida} onChange={(ev) => cambiar(e.id, "salida", ev.target.value)} /></label>
            <button type="button" className="pnl-hr-quitar" onClick={() => guardar({ ...d, estancias: estancias.filter((x) => x.id !== e.id) })} aria-label="Borrar viaje">×</button>
          </div>
        ))}
        <button type="button" className="pnl-btn ux-tap" onClick={() => guardar({ ...d, estancias: [...estancias, { id: uid(), entrada: "", salida: "" }].slice(-40) })}>+ Añadir viaje</button>
      </section>
      <section className="pnl-hr-caja">
        <h3>Planear el próximo</h3>
        <label className="pnl-hr-campo"><span>Si entro el…</span><input type="date" value={d.entrada || ""} onChange={(e) => guardar({ ...d, entrada: e.target.value })} /></label>
        {d.entrada && (
          <p className="pnl-hr-resultado">
            {salida ? <>Puedes quedarte hasta el <b>{fechaLarga(salida)}</b> ({diaDe(salida) - diaDe(d.entrada) + 1} días).</> : <>Ese día ya no te quedan días: espera a que salgan viajes de la ventana de 180.</>}
          </p>
        )}
      </section>
      <p className="pnl-hr-pie">
        Orientativo, para estancias cortas sin visado. Con visado de estudios o TIE no cuentan estos días en España.
        Para quedarte a estudiar, mira <button type="button" className="pnl-hr-enlace" onClick={() => navigate("/visa-o-estancia")}>¿visa o estancia?</button>
      </p>
    </div>
  );
}

// ── 5. Listas: documentos y llegada ─────────────────────────────────────────
const LISTAS = [
  {
    id: "visa", titulo: "Visa de estudios",
    items: ["Formulario nacional de visado, firmado", "Pasaporte vigente y copia de todas sus páginas", "Fotografía tipo carné reciente", "Carta de admisión de la universidad", "Medios económicos (100 % del IPREM por mes)", "Seguro médico sin copagos ni carencias", "Antecedentes penales apostillados (estudios de más de 6 meses)", "Certificado médico (estudios de más de 6 meses)", "Traducción jurada de lo que no esté en español", "Justificante de pago de la tasa", "Cita en el consulado"],
  },
  {
    id: "maleta", titulo: "Para el viaje",
    items: ["Pasaporte con la visa (o carta de admisión si vas por estancia)", "Título y notas apostillados, originales", "Carta de admisión o matrícula", "Póliza del seguro médico", "Reserva o contrato de alojamiento", "Billete de vuelo", "eSIM o tarjeta para tener datos al llegar", "Euros en efectivo para los primeros días", "Copia digital de todo en el móvil"],
  },
  {
    id: "llegada", titulo: "Al llegar a España", icono: "casa",
    items: ["Empadronarte en tu ayuntamiento", "Pedir cita para la TIE (en el primer mes)", "Abrir una cuenta bancaria", "Tarjeta SIM española", "Abono de transporte joven", "Registrarte en el consulado de tu país", "Darte de alta en tu universidad", "Guardar los teléfonos de emergencia: 112"],
  },
];

export function Listas() {
  const [d, guardar, estado] = useHerramienta("listas", { hecho: {}, propios: {} });
  const [cual, setCual] = useState("visa");
  const [texto, setTexto] = useState("");
  const lista = LISTAS.find((l) => l.id === cual);
  const hecho = d.hecho || {};
  const propios = d.propios?.[cual] || [];
  const items = [...lista.items.map((t, i) => ({ id: `${cual}-${i}`, texto: t })), ...propios];
  const listos = items.filter((it) => hecho[it.id]).length;
  const anadir = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    guardar({ ...d, propios: { ...(d.propios || {}), [cual]: [...propios, { id: uid(), texto: texto.trim().slice(0, 100) }].slice(-40) } });
    setTexto("");
  };
  return (
    <div className="pnl-hr">
      <Cabecera icono="check" titulo="Tus listas" lema="Los papeles de la visa, la maleta y lo que toca al llegar." estado={estado} />
      <div className="pnl-hr-chips">
        {LISTAS.map((l) => <button key={l.id} type="button" aria-pressed={cual === l.id} onClick={() => setCual(l.id)}>{l.titulo}</button>)}
      </div>
      <div className="pnl-hr-total">
        <small>{lista.titulo}</small>
        <strong>{listos} de {items.length}</strong>
        <span className="pnl-hr-barra" style={{ "--p": items.length ? (listos / items.length) * 100 : 0 }} aria-hidden="true" />
      </div>
      <section className="pnl-hr-caja">
        {items.map((it) => (
          <label key={it.id} className="pnl-hr-check" data-hecho={hecho[it.id] ? "1" : undefined}>
            <input type="checkbox" checked={Boolean(hecho[it.id])} onChange={() => guardar({ ...d, hecho: { ...hecho, [it.id]: !hecho[it.id] || undefined } })} />
            <span>{it.texto}</span>
          </label>
        ))}
        <form className="pnl-hr-form pnl-hr-form-fila" onSubmit={anadir}>
          <input type="text" placeholder="Añadir algo tuyo…" maxLength={100} value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Nuevo elemento" />
          <button type="submit" className="pnl-btn ux-tap">Añadir</button>
        </form>
      </section>
    </div>
  );
}
