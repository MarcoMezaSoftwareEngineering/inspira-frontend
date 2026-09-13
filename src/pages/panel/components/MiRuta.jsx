// «Mi ruta»: las etapas entre servicios —diagnóstico, máster, admisión, vía
// migratoria, llegada— con su estado. Lo que no está contratado se ofrece
// hablando con el asesor, nunca con precio ni botón de compra.
import IconoPaso from "../../../components/common/IconoPaso";
import Icono from "../../../components/common/Icono";
import { whatsappDesde } from "../../../config/contacto";
import { navigate } from "../../../services/navigate";
import { rutaDe } from "../ruta";
import { ESTADO_ETAPA, rutaDelCliente, puntoDeRuta } from "../rutaCliente";

const ETIQUETA = {
  [ESTADO_ETAPA.HECHO]: "Hecho",
  [ESTADO_ETAPA.ACTUAL]: "En curso",
  [ESTADO_ETAPA.PENDIENTE]: "Pendiente",
  [ESTADO_ETAPA.SIGUIENTE]: "Tu siguiente etapa",
  [ESTADO_ETAPA.PROXIMAMENTE]: "Próximamente",
};

const ICONO = {
  [ESTADO_ETAPA.HECHO]: "check",
  [ESTADO_ETAPA.ACTUAL]: "arrowRight",
  [ESTADO_ETAPA.PENDIENTE]: "calendar",
  [ESTADO_ETAPA.SIGUIENTE]: "sparkles",
  [ESTADO_ETAPA.PROXIMAMENTE]: "flag",
};

function BotonAsesor({ etapa }) {
  return (
    <a
      className="pnl-btn ux-tap"
      href={whatsappDesde("panel-mi-ruta", `Soy cliente y quiero hablar de mi siguiente etapa: ${etapa.titulo.toLowerCase()}.`)}
      target="_blank" rel="noopener noreferrer"
    >
      <Icono nombre="chat" size={15} />
      Hablar con tu asesor
    </a>
  );
}

function Marca({ estado, n }) {
  return (
    <span className="ex-miruta-marca" data-estado={estado} aria-hidden="true">
      {estado === ESTADO_ETAPA.PENDIENTE && n != null
        ? <span className="ex-miruta-num">{n}</span>
        : <IconoPaso nombre={ICONO[estado]} className="w-4 h-4" strokeWidth={2.4} />}
    </span>
  );
}

function Etapa({ etapa, ultima }) {
  const clicable = Boolean(etapa.href);
  return (
    <li className="ex-miruta-etapa" data-estado={etapa.estado}>
      <div className="ex-miruta-riel">
        <Marca estado={etapa.estado} />
        {!ultima && <span className="ex-miruta-linea" />}
      </div>
      <div className="ex-miruta-contenido">
        <div className="ex-miruta-cabeza">
          <div className="min-w-0">
            <span className="ex-miruta-estado">{ETIQUETA[etapa.estado]}</span>
            <h3 className="ex-miruta-titulo text-primary">{etapa.titulo}</h3>
            {etapa.detalle && <p className="ex-miruta-detalle">{etapa.detalle}</p>}
          </div>
          {etapa.contacto
            ? <BotonAsesor etapa={etapa} />
            : clicable && !etapa.pasos && (
              <button type="button" className="pnl-btn ux-tap" onClick={() => navigate(etapa.href)}>Ver</button>
            )}
        </div>

        {etapa.pasos && (
          <ol className="ex-miruta-pasos">
            {etapa.pasos.map((p, i) => (
              <li key={p.clave}>
                <button type="button" className="ex-miruta-paso ux-tap" data-estado={p.estado} onClick={() => navigate(p.href)}>
                  <Marca estado={p.estado} n={i + 1} />
                  <span className="ex-miruta-paso-texto">
                    <strong>{p.titulo}</strong>
                    <small>{[ETIQUETA[p.estado], p.detalle].filter(Boolean).join(" · ")}</small>
                  </span>
                  <IconoPaso nombre="arrowRight" className="w-4 h-4 shrink-0 text-primary/40" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </li>
  );
}

export default function MiRuta({ servicios = [] }) {
  const { etapas, modo } = rutaDelCliente(servicios);
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-4">
      <div className="pnl-head">
        <div>
          <h2>Mi ruta</h2>
          <p>{modo === "master"
            ? "De tu máster a tu llegada a España: dónde estás y qué viene después."
            : "Tu trámite de principio a fin: dónde estás y qué viene después."}</p>
        </div>
      </div>
      {!etapas.length ? (
        <div className="pnl-vacio">
          <h3>Tu ruta aparecerá aquí</h3>
          <p>Cuando tengas un servicio contratado verás cada etapa de tu proceso y en qué punto estás.</p>
        </div>
      ) : (
        <ol className="ex-miruta">
          {etapas.map((e, i) => <Etapa key={e.clave} etapa={e} ultima={i === etapas.length - 1} />)}
        </ol>
      )}
      <p className="pnl-nota">El detalle de cada paso está dentro de tu expediente. Si algo no cuadra, díselo a tu asesor por mensaje.</p>
    </div>
  );
}

/** El bloque corto de Inicio: dónde está, qué viene y el enlace a la ruta. */
export function MiRutaResumen({ servicios }) {
  const { actual, siguiente, hechas, total, plano } = puntoDeRuta(servicios);
  if (!total) return null;
  return (
    <section className="ex-miruta-mini">
      <div className="ex-miruta-mini-cabeza">
        <div className="min-w-0">
          <span className="ex-miruta-mini-eyebrow text-accent">Mi ruta</span>
          <p className="ex-miruta-mini-linea">
            {actual ? <>Estás en <b>{actual.titulo}</b>{actual.de ? ` (${actual.de})` : ""}</> : "Tu ruta, etapa a etapa"}
            {siguiente ? <> · Después: <b>{siguiente.titulo}</b></> : null}
          </p>
        </div>
        <button type="button" className="pnl-btn ux-tap" onClick={() => navigate(rutaDe({ tab: "ruta" }))}>
          <Icono nombre="avion" size={15} />
          Ver mi ruta
        </button>
      </div>
      <div className="ex-miruta-mini-puntos" aria-label={`${hechas} de ${total} etapas hechas`}>
        {plano.map((e) => <span key={`${e.de || ""}${e.clave}`} data-estado={e.estado} title={e.titulo} />)}
      </div>
    </section>
  );
}
