import { useEffect, useRef, useState } from "react";
import Reveal from "../../../components/common/Reveal";

const metrics = [
  { n: 98, suffix: "%", label: "Tasa de admisión", width: 98 },
  { n: 80, prefix: "+", label: "Universidades analizadas", width: 83 },
  { n: 100, prefix: "+", label: "Becas logradas", width: 75 },
  { n: null, label: "Servicio de principio a fin", display: "360°", width: 100 },
];

function Counter({ n, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            setStarted(true);
            const start = performance.now();
            const tick = (t) => {
              const k = Math.min(1, (t - start) / 900);
              setValue(Math.floor(n * (1 - Math.pow(1 - k, 3))));
              if (k < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [n, started]);

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

function Bar({ width }) {
  const ref = useRef(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setW(width);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [width]);

  return (
    <div ref={ref} className="h-[5px] bg-[#edf2f3] rounded-full mt-4.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-1000 ease-out"
        style={{ width: `${w}%`, background: "#F49E4B" }}
      />
    </div>
  );
}

export default function Metrics() {
  return (
    <section className="pt-4 pb-16 md:pb-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 80}>
            <article
              className="border border-neutral-200 rounded-[20px] p-5"
              style={{ background: "linear-gradient(180deg,#fff,#fbfdfd)" }}
            >
              <div className="font-fraunces text-[36px] md:text-[42px] tracking-tight text-primary">
                {m.display ?? <Counter n={m.n} prefix={m.prefix} suffix={m.suffix} />}
              </div>
              <span className="block mt-1 text-neutral-500 text-xs">{m.label}</span>
              <Bar width={m.width} />
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
