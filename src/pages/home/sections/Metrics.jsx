import { useEffect, useRef, useState } from "react";

// ⚠️ SUSTANCIACIÓN PREVIA. Toda cifra publicada en publicidad debe poder
// acreditarse con evidencia documental ANTES de difundirla (principio de
// veracidad y sustanciación previa). Antes de publicar:
//   1. Ajusta cada cifra al dato real y verificable de los expedientes.
//   2. Completa PERIODO_METRICAS con el periodo y la base de cálculo.
//   3. Guarda el respaldo (expedientes, cartas de admisión, resoluciones de
//      beca) en el expediente de sustanciación descrito en docs/legal/.
// Si una cifra no puede acreditarse, quítala: es preferible a una infracción
// por publicidad engañosa.
const metrics = [
  { count: 98, suffix: "%", label: "Tasa de admisión", width: 98 },
  { count: 80, prefix: "+", label: "Universidades analizadas", width: 83 },
  { count: 100, prefix: "+", label: "Becas logradas", width: 75 },
  { fixed: "360°", label: "Servicio de principio a fin", width: 100 },
];

// Base de cálculo que se muestra junto a las cifras.
const PERIODO_METRICAS =
  "COMPLETAR: base de cálculo y periodo, p. ej. “sobre N expedientes gestionados entre enero de 2024 y diciembre de 2025”";

/* Réplica del contador del mockup: ease-out cúbico sobre 1.6s al entrar en viewport */
function useInView(threshold = 0.35) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSeen(true);
            io.unobserve(el);
          }
        });
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

function Metric({ m }) {
  const [ref, seen] = useInView();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!seen || m.fixed) return;
    const start = performance.now();
    const dur = 1600;
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(m.count * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, m]);

  return (
    <article className={`metric${seen ? " in" : ""}`} ref={ref} data-reveal="">
      <strong>
        {m.fixed ?? `${m.prefix ?? ""}${value}${m.suffix ?? ""}`}
      </strong>
      <span>{m.label}</span>
      <div className="bar">
        <i style={{ width: seen ? `${m.width}%` : 0 }} />
      </div>
    </article>
  );
}

export default function Metrics() {
  return (
    <section className="metrics">
      <div className="v4-container metric-grid">
        {metrics.map((m) => (
          <Metric key={m.label} m={m} />
        ))}
      </div>

      {/* Sustanciación visible de los datos publicitados */}
      <div className="v4-container">
        <p
          style={{
            marginTop: "18px",
            fontSize: "11.5px",
            lineHeight: 1.6,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Cifras de elaboración propia {PERIODO_METRICAS}. Los resultados
          dependen del perfil de cada postulante y de las decisiones de las
          universidades y autoridades competentes: no garantizamos admisión,
          beca ni visado.
        </p>
      </div>
    </section>
  );
}
