// La App Inspira gratuita (03/11/2026): lo que ve quien entra con Google sin
// haber contratado nada, y lo que cualquier asesorado tiene en «Herramientas».
//
// Tres bloques: las herramientas que guardan en su cuenta, los recursos
// gratuitos que ya estaban en la web, y lo reservado para clientes con su
// candado. Ese último es el puente a la asesoría: se ve lo que hay, no se abre.
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";
import { Presupuesto, TrackerBecas, Calendario, Schengen, Listas } from "./Herramientas";
import { ALIADOS } from "../../../config/aliados";
import "../../../styles/panel/herramientas.css";

const HERRAMIENTAS = [
  { clave: "presupuesto", icono: "euro", titulo: "Mi presupuesto", texto: "Cuánto cuesta vivir y estudiar en España", Vista: Presupuesto },
  { clave: "becas", icono: "birrete", titulo: "Tracker de becas", texto: "Sigue tus becas: me interesa, postulé, ¡ganada!", Vista: TrackerBecas },
  { clave: "calendario", icono: "calendario", titulo: "Mi calendario", texto: "Tus plazos y la cuenta atrás de tu viaje", Vista: Calendario },
  { clave: "schengen", icono: "pasaporte", titulo: "Días Schengen", texto: "Cuántos días te quedan como turista", Vista: Schengen },
  { clave: "listas", icono: "maleta", titulo: "Mis listas", texto: "Documentos de la visa, el viaje y la llegada", Vista: Listas },
];

// Lo que ya era gratis en la web: se abre aquí mismo, sin salir de la app.
const RECURSOS = [
  { href: "/visa-o-estancia", icono: "balanza", titulo: "¿Visa o estancia?", texto: "Test de 2 minutos" },
  { href: "/calculadora-master", icono: "grafico", titulo: "Calculadora de máster", texto: "Matrícula según universidad" },
  { href: "/te-alcanza", icono: "ubicacion", titulo: "¿Te alcanza?", texto: "Coste de vida por ciudad" },
  { href: "/mapa-estudiar-en-espana", icono: "mapa", titulo: "Mapa de másteres", texto: "Universidades y plazos" },
  { href: "/becas-espana-2027", icono: "trofeo", titulo: "Becas 2027", texto: "Guía con fechas" },
  { href: "/beca-generacion-bicentenario-2026", icono: "estrella", titulo: "Beca Bicentenario", texto: "Paso a paso" },
  { href: "/por-que-fecha-va-extranjeria", icono: "reloj", titulo: "¿Por qué fecha va extranjería?", texto: "Tiempos reales" },
  { href: "/grado-en-espana", icono: "libro", titulo: "Grado en España", texto: "Guía completa" },
  { href: "/doctorado-en-espana", icono: "destello", titulo: "Doctorado", texto: "Guía completa" },
];

const SOLO_CLIENTES = [
  { icono: "documento", titulo: "Tu Expediente Digital", texto: "Documentos revisados y validados por tu asesor" },
  { icono: "grafico", titulo: "Informe de másteres", texto: "Las opciones según tu perfil y tu objetivo" },
  { icono: "robot", titulo: "IA legal", texto: "Respuestas revisadas por tu asesor" },
  { icono: "diana", titulo: "Postulación gestionada", texto: "Te postulamos y tú ves el estado" },
  { icono: "pasaporte", titulo: "Visa o estancia", texto: "Tu trámite en el mismo portal" },
  { icono: "chat", titulo: "Asesor 1:1", texto: "Una persona que te acompaña" },
];

const ir = (href) => (e) => { e.preventDefault(); navigate(href); };

export default function AppGratis({ herramienta, nombre, esCliente = false, perfilIncompleto = false }) {
  const abierta = HERRAMIENTAS.find((h) => h.clave === herramienta);
  if (abierta) {
    const { Vista } = abierta;
    return <div className="pnl-hr-marco"><Vista /></div>;
  }

  return (
    <div className="pnl-hr-marco">
      <header className="pnl-hr-hero">
        <span className="pnl-hr-sello"><Icono nombre="regalo" size={14} /> Gratis para ti</span>
        <h2>{nombre ? `Hola, ${nombre} 👋` : "Tu App Inspira"}</h2>
        <p>Herramientas para preparar tu viaje a España. Lo que escribes se guarda en tu cuenta.</p>
      </header>

      {perfilIncompleto && !esCliente && (
        <a href="/panel/perfil" onClick={ir("/panel/perfil")} className="pnl-hr-aviso">
          <Icono nombre="usuario" size={18} />
          <span><strong>Completa tu perfil</strong><small>Así tu asesor llega a tu primera asesoría sabiendo quién eres.</small></span>
          <span aria-hidden="true">→</span>
        </a>
      )}

      <h3 className="pnl-hr-grupo">Tus herramientas</h3>
      <div className="pnl-hr-rejilla">
        {HERRAMIENTAS.map((h) => (
          <a key={h.clave} href={`/panel/herramientas/${h.clave}`} onClick={ir(`/panel/herramientas/${h.clave}`)} className="pnl-hr-tarjeta ux-tap">
            <span className="pnl-hr-tile"><Icono nombre={h.icono} size={22} /></span>
            <strong>{h.titulo}</strong>
            <small>{h.texto}</small>
          </a>
        ))}
      </div>

      <h3 className="pnl-hr-grupo">Más recursos gratis</h3>
      <div className="pnl-hr-lista">
        {RECURSOS.map((r) => (
          <a key={r.href} href={r.href} onClick={ir(r.href)} className="pnl-hr-fila ux-tap">
            <span className="pnl-hr-tile pnl-hr-tile-s"><Icono nombre={r.icono} size={18} /></span>
            <span className="min-w-0 flex-1"><strong>{r.titulo}</strong><small>{r.texto}</small></span>
            <span aria-hidden="true">›</span>
          </a>
        ))}
      </div>

      <h3 className="pnl-hr-grupo">Aliados para tu viaje</h3>
      <div className="pnl-hr-lista">
        {ALIADOS.filter((a) => a.href).map((a) => (
          <a key={a.clave} href={a.href} target="_blank" rel="noopener noreferrer" className="pnl-hr-fila ux-tap">
            <span className="pnl-hr-tile pnl-hr-tile-s"><Icono nombre={a.icono} size={18} /></span>
            <span className="min-w-0 flex-1"><strong>{a.titulo}</strong><small>{a.texto}</small></span>
            <span className="pnl-hr-chip">{a.chip}</span>
          </a>
        ))}
      </div>

      {!esCliente && (
        <>
          <h3 className="pnl-hr-grupo">Reservado para clientes</h3>
          <div className="pnl-hr-rejilla">
            {SOLO_CLIENTES.map((c) => (
              <a key={c.titulo} href="/reservar" onClick={ir("/reservar")} className="pnl-hr-tarjeta pnl-hr-cerrada ux-tap" aria-label={`${c.titulo}: reservado para clientes`}>
                <span className="pnl-hr-candado"><Icono nombre="candado" size={13} /> Solo clientes</span>
                <span className="pnl-hr-tile"><Icono nombre={c.icono} size={22} /></span>
                <strong>{c.titulo}</strong>
                <small>{c.texto}</small>
              </a>
            ))}
          </div>
          <div className="pnl-hr-cta">
            <strong>¿Lo quieres todo, con tu asesor?</strong>
            <p>Empieza con una asesoría diagnóstico y abrimos tu Expediente Digital.</p>
            <a href="/reservar" onClick={ir("/reservar")} className="pnl-btn-cta pnl-btn-grande ux-tap">Reservar mi asesoría</a>
          </div>
        </>
      )}
    </div>
  );
}
