import { useEffect, useRef, useState } from "react";
import { useHidratando } from "../../../lib/hidratacion";

// ⚠️ SUSTANCIACIÓN. Cada cifra debe poder acreditarse con evidencia que ya
// exista al publicarla. Catálogo: más de 3.000 másteres oficiales activos y 45
// universidades públicas en el censo (04/09/2026); 98 % de admitidos según los
// registros internos de expedientes (agosto de 2026). Las becas logradas se
// citan por entidad, sin número. Si una cifra cambia, actualizar también el
// expediente de sustanciación (docs/legal/09 del backend).
const metrics = [
  { count: 98, suffix: "%", label: "Admitidos a másteres oficiales", width: 98 },
  { count: 3000, prefix: "+", label: "Másteres oficiales en nuestro catálogo", width: 92 },
  { count: 45, prefix: "+", label: "Universidades públicas españolas", width: 75 },
  { count: 30, suffix: " h", label: "Semanales de trabajo con permiso de estudiante", width: 60 },
];

// Punto de miles también en cuatro cifras («3.000»).
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// Base de cálculo que se muestra junto a las cifras.
const PERIODO_METRICAS =
  "según los registros internos de expedientes (agosto de 2026) y el catálogo académico de la empresa (septiembre de 2026)";

/* Réplica del contador del mockup: ease-out cúbico sobre 1.6s al entrar en viewport.

   Estados: "oculto" (aún no asomó), "visto" (asomó: aparece y cuenta) y
   "quieto": la portada llegó prerenderizada (09/10/2026) y la cifra ya está
   pintada, final y visible, en el HTML; se lee sin JavaScript. Al hidratar,
   la que está a la vista se queda así, sin volver a contar; la de más abajo
   pasa a "oculto" y contará al asomar, como siempre. */
function useInView(threshold = 0.35) {
  const ref = useRef(null);
  const hidratando = useHidratando();
  const [estado, setEstado] = useState(hidratando ? "quieto" : "oculto");
  const llegoPintado = useRef(hidratando);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // El primer aviso del observador dice dónde estaba al hidratar.
    let primerAviso = llegoPintado.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const primero = primerAviso;
          primerAviso = false;
          if (entry.isIntersecting) {
            if (!primero) setEstado("visto");
            io.unobserve(el);
          } else if (primero) {
            // Por la posición y no por el umbral: la que asoma sin llegar al
            // 35 % ya se está viendo y no se esconde (ver Reveal).
            const bordeInferior = entry.rootBounds ? entry.rootBounds.bottom : window.innerHeight;
            if (entry.boundingClientRect.top >= bordeInferior) setEstado("oculto");
            else io.unobserve(el);
          }
        });
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, estado];
}

function Metric({ m }) {
  const [ref, estado] = useInView();
  const seen = estado !== "oculto";
  const [value, setValue] = useState(estado === "quieto" ? m.count : 0);

  useEffect(() => {
    if (estado !== "visto" || m.fixed) return;
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
  }, [estado, m]);

  return (
    <article className={`metric${seen ? " in" : ""}`} ref={ref} data-reveal="">
      <strong>
        {m.fixed ?? `${m.prefix ?? ""}${miles(value)}${m.suffix ?? ""}`}
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
