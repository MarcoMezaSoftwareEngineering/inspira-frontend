import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

export default function Hero() {
  return (
    <section
      className="w-full relative overflow-hidden py-32 px-6"
      style={{
        background: "linear-gradient(135deg, #023A4B 0%, #054A5E 65%, #023A4B 100%)",
      }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(to bottom, black, transparent 80%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 80%)",
        }}
      />

      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 rounded-full pointer-events-none"
        style={{
          width: "760px",
          height: "760px",
          background: "radial-gradient(circle, #9ACEFF 0%, transparent 70%)",
          opacity: 0.1,
          transform: "translate(30%, -30%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 rounded-full pointer-events-none"
        style={{
          width: "560px",
          height: "560px",
          background: "radial-gradient(circle, #F49E4B 0%, transparent 70%)",
          opacity: 0.09,
          transform: "translate(-35%, 35%)",
        }}
      />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#F49E4B" }}
          />
          Programa 360° · Másteres en España 2026/2027
        </div>

        {/* Headline */}
        <h1 className="font-fraunces text-[44px] sm:text-6xl md:text-7xl lg:text-[82px] font-bold text-white leading-[0.98] mb-6 tracking-tight">
          Tu camino a estudiar
          <br />
          <span style={{ color: "#F49E4B" }}>en España</span> empieza aquí
        </h1>

        {/* Subtitle */}
        <p className="text-white/65 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Te acompañamos desde la elección del máster hasta la matrícula en
          universidades españolas de primer nivel.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <a
            href="/servicios/master"
            onClick={(e) => go(e, "/servicios/master")}
            className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105 hover:shadow-2xl"
            style={{ background: "#F49E4B", boxShadow: "0 14px 30px rgba(244,158,75,.25)" }}
          >
            Ver Programa Máster 360°
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                d="M5 12L12 5M12 5H6M12 5v6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            href="/calculadora-master"
            onClick={(e) => go(e, "/calculadora-master")}
            className="inline-flex items-center justify-center gap-2 border border-white/25 hover:border-white/50 bg-white/5 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all hover:bg-white/10"
          >
            Calculadora Gratuita
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                d="M5 12l7-7 7 7"
                transform="rotate(90, 9, 9)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-10 md:gap-20">
          {[
            { n: "98%", label: "Tasa de admisión" },
            { n: "+80", label: "Universidades" },
            { n: "+100", label: "Becas logradas" },
            { n: "360°", label: "Servicio completo" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="font-fraunces text-4xl md:text-[42px] font-bold mb-1 tracking-tight"
                style={{ color: "#F49E4B" }}
              >
                {s.n}
              </div>
              <div className="text-white/45 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
