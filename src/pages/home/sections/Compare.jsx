import { useState } from "react";
import Reveal from "../../../components/common/Reveal";
import Icono from "../../../components/common/Icono";
import BotonAsesoria from "../../../components/common/BotonAsesoria";

// Recorrido interactivo: el visitante avanza por las etapas reales de su
// proceso y ve, en cada una, qué pasa si lo hace solo y qué pasa con Inspira.
const ETAPAS = [
  {
    id: "elegir",
    icono: "brujula",
    titulo: "Elegir a dónde vas",
    mes: "Mes 1",
    solo: {
      titulo: "Cientos de pestañas abiertas",
      texto:
        "Comparas programas en webs distintas, cada universidad con su calendario y sus requisitos. Nadie te dice cuáles aceptan tu titulación.",
      dolor: "2–3 meses perdidos",
    },
    con: {
      titulo: "Una shortlist filtrada por tu perfil",
      texto:
        "Analizamos tu formación, presupuesto y plazos, y te entregamos un informe con los programas donde sí eres competitivo.",
      gana: "Decides en 1 semana",
    },
  },
  {
    id: "documentos",
    icono: "documento",
    titulo: "Reunir los documentos",
    mes: "Mes 2",
    solo: {
      titulo: "Apostillas que llegan tarde",
      texto:
        "Descubres a mitad de camino que faltaba una legalización, que la traducción no sirve o que el certificado caducó.",
      dolor: "Reprocesos y gastos dobles",
    },
    con: {
      titulo: "Checklist con plazos y alertas",
      texto:
        "Sabes desde el día uno qué documento necesitas, en qué orden y cuánto tarda cada uno. Revisamos cada archivo antes de presentar.",
      gana: "Cero sorpresas",
    },
  },
  {
    id: "postular",
    icono: "birrete",
    titulo: "Postular y conseguir plaza",
    mes: "Mes 3–5",
    solo: {
      titulo: "Una sola apuesta",
      texto:
        "Postulas donde puedes, en la fase que alcanzas, y si no entra esa te quedas esperando la siguiente convocatoria.",
      dolor: "Riesgo de perder el año",
    },
    con: {
      titulo: "Varias postulaciones en paralelo",
      texto:
        "Presentamos en las primeras fases y en varias universidades, con las becas compatibles trabajadas al mismo tiempo.",
      gana: "Planes de respaldo",
    },
  },
  {
    id: "visa",
    icono: "pasaporte",
    titulo: "El trámite migratorio",
    mes: "Mes 6–7",
    solo: {
      titulo: "El expediente que más se deniega",
      texto:
        "La solvencia mal acreditada y el seguro médico incorrecto son las causas nº1 de denegación. Y el plazo para recurrir es corto.",
      dolor: "Denegación y recurso",
    },
    con: {
      titulo: "Expediente revisado por un abogado",
      texto:
        "Estrategia económica, seguro válido, formularios y cita gestionada. Presentación telemática con firma digital.",
      gana: "Solo asumimos casos viables",
    },
  },
  {
    id: "llegada",
    icono: "bandera",
    titulo: "Aterrizar en España",
    mes: "Mes 8",
    solo: {
      titulo: "Trámites que nadie te explicó",
      texto:
        "TIE, empadronamiento, cuenta bancaria y seguridad social. Cada uno con su cita, su formulario y su tasa.",
      dolor: "Semanas de colas",
    },
    con: {
      titulo: "Aterrizaje acompañado",
      texto:
        "Gestionamos las citas y te decimos exactamente qué llevar a cada una. Y seguimos ahí para la renovación y lo que venga.",
      gana: "Llegas y te instalas",
    },
  },
];

export default function Compare() {
  const [i, setI] = useState(0);
  const [modo, setModo] = useState("con"); // "solo" | "con"
  const etapa = ETAPAS[i];
  const lado = etapa[modo];
  const esSolo = modo === "solo";

  return (
    <section className="recorrido">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />El recorrido</span>
            <h2>Mira lo que cambia en cada etapa.</h2>
          </div>
          <p>
            Avanza por el proceso real y compara: hacerlo por tu cuenta o
            hacerlo con un equipo que ya lo recorrió cientos de veces.
          </p>
        </Reveal>

        {/* Línea de tiempo */}
        <Reveal className="rec-timeline">
          <div className="rec-linea">
            <span
              className="rec-linea-fill"
              style={{ width: `${(i / (ETAPAS.length - 1)) * 100}%` }}
            />
          </div>
          <div className="rec-pasos">
            {ETAPAS.map((e, idx) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setI(idx)}
                className={`rec-paso${idx === i ? " activo" : ""}${
                  idx < i ? " hecho" : ""
                }`}
                aria-current={idx === i}
              >
                <span className="rec-punto">
                  <Icono nombre={e.icono} size={18} />
                </span>
                <span className="rec-paso-txt">
                  <small>{e.mes}</small>
                  <b>{e.titulo}</b>
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Panel comparativo */}
        <div className="rec-panel">
          <div className="rec-switch" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={esSolo}
              className={esSolo ? "activo solo" : undefined}
              onClick={() => setModo("solo")}
            >
              Por tu cuenta
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!esSolo}
              className={!esSolo ? "activo con" : undefined}
              onClick={() => setModo("con")}
            >
              Con Inspira
            </button>
          </div>

          <div className={`rec-card ${esSolo ? "es-solo" : "es-con"}`} key={`${etapa.id}-${modo}`}>
            <div className="rec-card-main">
              <span className="rec-etapa">
                <Icono nombre={etapa.icono} size={15} />
                {etapa.mes} · {etapa.titulo}
              </span>
              <h3>{lado.titulo}</h3>
              <p>{lado.texto}</p>
            </div>
            <div className="rec-card-side">
              <span className="rec-marca">
                <Icono nombre={esSolo ? "reloj" : "escudo"} size={20} />
              </span>
              <b>{esSolo ? lado.dolor : lado.gana}</b>
              <small>{esSolo ? "Coste de hacerlo solo" : "Lo que ganas"}</small>
            </div>
          </div>

          <div className="rec-nav">
            <button
              type="button"
              onClick={() => setI((v) => Math.max(0, v - 1))}
              disabled={i === 0}
            >
              ← Anterior
            </button>
            <span className="rec-contador">
              {i + 1} / {ETAPAS.length}
            </span>
            {i < ETAPAS.length - 1 ? (
              <button
                type="button"
                className="siguiente"
                onClick={() => setI((v) => Math.min(ETAPAS.length - 1, v + 1))}
              >
                Siguiente etapa →
              </button>
            ) : (
              <BotonAsesoria variante="primario" className="rec-final">
                Empezar mi proceso
              </BotonAsesoria>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
