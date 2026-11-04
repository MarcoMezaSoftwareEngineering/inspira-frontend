// La App Inspira gratuita (03/11/2026): lo que ve quien entra con Google sin
// haber contratado nada, y lo que cualquier asesorado tiene en «Herramientas».
//
// Por ítems, como pidió Carina: herramientas gratis, aliados para el viaje y
// recursos gratis. Cada herramienta da una respuesta útil y deja con candado
// lo que hace el asesor; lo de clientes va junto en una sola tarjeta.
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";
import { Presupuesto, TrackerBecas, Calendario, Schengen, Listas } from "./Herramientas";
import { MiNota, MeAdmiten, LlegoATiempo, QuedarmeATrabajar, GradoOFP, InvitaAmigo } from "./Orientacion";
import { useResumen } from "./useHerramienta";
import { Paquetes, MisPostulaciones, GuiaDocumentos } from "./Premium";
import { ALIADOS } from "../../../config/aliados";
import "../../../styles/panel/herramientas.css";

// Por ítems: primero el match de másteres, que es la estrella, y luego el resto.
const HERRAMIENTAS = [
  { clave: "admision", icono: "diana", titulo: "¿Con cuántos másteres haces match?", texto: "Escribe tu carrera y lo ves al momento", Vista: MeAdmiten, estrella: true },
  { clave: "postulaciones", icono: "check", titulo: "Mis postulaciones", texto: "El tracker de tu autopostulación", Vista: MisPostulaciones, paquete: "busqueda-master" },
  { clave: "guia-documentos", icono: "documento", titulo: "Guía de documentos", texto: "Modelos, videos y guías", Vista: GuiaDocumentos, paquete: "guia-documentos" },
  { clave: "calendario", icono: "calendario", titulo: "Mi calendario", texto: "Tus plazos, con avisos al móvil", Vista: Calendario },
  { clave: "becas", icono: "birrete", titulo: "Tracker de becas", texto: "Síguelas y te avisamos del cierre", Vista: TrackerBecas },
  { clave: "schengen", icono: "pasaporte", titulo: "Días Schengen", texto: "Cuántos te quedan como turista", Vista: Schengen },
  { clave: "nota", icono: "grafico", titulo: "Tu nota en España", texto: "Convierte tu nota a la escala del 0 al 10", Vista: MiNota },
  { clave: "presupuesto", icono: "euro", titulo: "Mi presupuesto", texto: "Lo que cuesta vivir y estudiar allá", Vista: Presupuesto },
  { clave: "plazos", icono: "reloj", titulo: "¿Llego a tiempo?", texto: "Tus fechas límite hacia atrás", Vista: LlegoATiempo },
  { clave: "listas", icono: "maleta", titulo: "Mis listas", texto: "Papeles de la visa, maleta y llegada", Vista: Listas },
  { clave: "trabajo", icono: "maletin", titulo: "¿Me puedo quedar a trabajar?", texto: "Tus caminos al terminar", Vista: QuedarmeATrabajar },
  { clave: "grado", icono: "libro", titulo: "¿Grado, FP u homologar?", texto: "El trámite que te toca", Vista: GradoOFP },
];
const TODAS = [...HERRAMIENTAS, { clave: "amigos", Vista: InvitaAmigo }];
// Las que guardan algo cuentan para el progreso.
const CON_PROGRESO = ["admision", "nota", "presupuesto", "becas", "plazos", "calendario", "listas", "schengen"];

// Lo que ya era gratis en la web: se abre aquí mismo, sin salir de la app.
const RECURSOS = [
  { href: "/mapa-estudiar-en-espana", icono: "mapa", titulo: "Mapa de España", texto: "Universidades, ciudades y plazos" },
  { href: "/visa-o-estancia", icono: "balanza", titulo: "¿Visa o estancia?", texto: "Test de 2 minutos" },
  { href: "/te-alcanza", icono: "ubicacion", titulo: "¿Te alcanza?", texto: "Coste de vida por ciudad" },
  { href: "/calculadora-master", icono: "grafico", titulo: "Calculadora de máster", texto: "Matrícula por universidad" },
  { href: "/becas-espana-2027", icono: "trofeo", titulo: "Guía de becas 2027", texto: "Con fechas" },
  { href: "/beca-generacion-bicentenario-2026", icono: "estrella", titulo: "Beca Bicentenario", texto: "Paso a paso" },
  { href: "/por-que-fecha-va-extranjeria", icono: "reloj", titulo: "¿Por qué fecha va extranjería?", texto: "Tiempos reales" },
  { href: "/doctorado-en-espana", icono: "destello", titulo: "Doctorado en España", texto: "Guía completa" },
  { href: "/eventos", icono: "microfono", titulo: "Charlas gratis", texto: "En vivo con el equipo" },
];

const CON_ASESOR = [
  "Tu lista completa de másteres, ordenada para ti",
  "Documentos revisados y validados",
  "IA legal con respuestas revisadas por tu asesor",
  "Te postulamos y tú ves el estado",
  "Tu visa o estancia en el mismo portal",
  "Una persona que te acompaña 1:1",
];

const ir = (href) => (e) => { e.preventDefault(); navigate(href); };

function Tarjeta({ h, usada, bloqueada }) {
  return (
    <a href={`/panel/herramientas/${h.clave}`} onClick={ir(`/panel/herramientas/${h.clave}`)}
      className={`pnl-hr-tarjeta ux-tap${h.estrella ? " es-estrella" : ""}`} data-usada={usada ? "1" : undefined}>
      <span className="pnl-hr-tile"><Icono nombre={h.icono} size={h.estrella ? 26 : 22} /></span>
      <span className="pnl-hr-tarjeta-txt"><strong>{h.titulo}</strong><small>{h.texto}</small></span>
      {usada && <span className="pnl-hr-hecho" aria-label="Ya la usaste">✓</span>}
      {bloqueada && <span className="pnl-hr-de-pago"><Icono nombre="candado" size={11} /> Paquete</span>}
    </a>
  );
}

export default function AppGratis({ herramienta, nombre, esCliente = false }) {
  const { usadas, dias, compras } = useResumen();
  const abierta = TODAS.find((h) => h.clave === herramienta);
  if (abierta) {
    const { Vista } = abierta;
    return <div className="pnl-hr-marco"><Vista /></div>;
  }

  const hechas = CON_PROGRESO.filter((c) => usadas.includes(c)).length;
  const pct = Math.round((hechas / CON_PROGRESO.length) * 100);

  return (
    <div className="pnl-hr-marco">
      <header className="pnl-hr-hero">
        <span className="pnl-hr-sello"><Icono nombre="regalo" size={13} /> Gratis</span>
        <h2>{nombre ? `Hola, ${nombre} 👋` : "Tu App Inspira"}</h2>
        <p>Herramientas y recursos gratis para estudiar y vivir en España.</p>
        <div className="pnl-hr-progreso">
          <span className="pnl-hr-anillo" style={{ "--p": pct }} aria-hidden="true"><b>{pct}%</b></span>
          <span>
            <strong>{hechas === 0 ? "Empieza por tu match de másteres" : `Llevas ${hechas} de ${CON_PROGRESO.length} herramientas`}</strong>
            <small>{dias !== null && dias >= 0 ? `Faltan ${dias} días para tu viaje ✈️` : "Todo lo que escribes se guarda en tu cuenta."}</small>
          </span>
        </div>
      </header>

      <h3 className="pnl-hr-grupo">Herramientas gratis</h3>
      <div className="pnl-hr-rejilla">
        {HERRAMIENTAS.map((h) => <Tarjeta key={h.clave} h={h} usada={usadas.includes(h.clave)} bloqueada={h.paquete && !compras[h.paquete]} />)}
      </div>

      <h3 className="pnl-hr-grupo">Para tu viaje</h3>
      <div className="pnl-hr-carrusel">
        {ALIADOS.filter((a) => a.href).map((a) => (
          <a key={a.clave} href={a.href} target="_blank" rel="noopener noreferrer" className="pnl-hr-aliado ux-tap">
            <span className="pnl-hr-chip">{a.chip}</span>
            <span className="pnl-hr-tile pnl-hr-tile-s"><Icono nombre={a.icono} size={18} /></span>
            <strong>{a.titulo}</strong>
            <small>{a.texto}</small>
          </a>
        ))}
      </div>

      <h3 className="pnl-hr-grupo">Recursos gratis</h3>
      <div className="pnl-hr-lista">
        {RECURSOS.map((r) => (
          <a key={r.href} href={r.href} onClick={ir(r.href)} className="pnl-hr-fila ux-tap">
            <span className="pnl-hr-tile pnl-hr-tile-s"><Icono nombre={r.icono} size={18} /></span>
            <span className="min-w-0 flex-1"><strong>{r.titulo}</strong><small>{r.texto}</small></span>
            <span aria-hidden="true">›</span>
          </a>
        ))}
      </div>

      <Paquetes />

      {!esCliente && (
        <section className="pnl-hr-pro">
          <span className="pnl-hr-pro-sello"><Icono nombre="candado" size={13} /> Con tu asesor</span>
          <h3>Con tu asesor, lo hacemos contigo</h3>
          <ul>{CON_ASESOR.map((t) => <li key={t}><Icono nombre="candado" size={14} />{t}</li>)}</ul>
          <a href="/reservar" onClick={ir("/reservar")} className="pnl-btn-cta pnl-btn-grande ux-tap">Reservar mi asesoría</a>
        </section>
      )}

      <a href="/panel/herramientas/amigos" onClick={ir("/panel/herramientas/amigos")} className="pnl-hr-amigos ux-tap">
        <span className="pnl-hr-amigos-emoji" aria-hidden="true">🎁</span>
        <span><strong>Invita a un amigo</strong><small>Si contrata, los dos reciben un descuento.</small></span>
        <span aria-hidden="true">→</span>
      </a>

    </div>
  );
}
