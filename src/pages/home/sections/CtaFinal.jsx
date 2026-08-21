import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

export default function CtaFinal() {
  return (
    <section className="py-24 px-6 bg-white">
      <div
        className="max-w-6xl mx-auto rounded-[32px] p-9 md:p-14 relative overflow-hidden grid md:grid-cols-[1fr_auto] gap-8 items-center"
        style={{ background: "linear-gradient(135deg, #023A4B 0%, #054A5E 100%)" }}
      >
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: "520px",
            height: "520px",
            right: "-170px",
            top: "-240px",
            background: "radial-gradient(circle, rgba(154,206,255,.18), transparent 68%)",
          }}
        />

        <div className="relative z-10">
          <span
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: "#F49E4B" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F49E4B" }} />
            Empieza gratis
          </span>
          <h2 className="font-fraunces text-3xl md:text-[48px] font-bold text-white mb-3 leading-[1.05] tracking-tight">
            Descubre qué opciones encajan contigo.
          </h2>
          <p className="text-white/62 text-lg max-w-xl leading-relaxed">
            Usa la calculadora como primera puerta de entrada y convierte tus datos en
            una ruta de estudio más concreta, o revisa directamente el Programa Máster 360°.
          </p>
        </div>

        <a
          href="/calculadora-master"
          onClick={(e) => go(e, "/calculadora-master")}
          className="relative z-10 inline-flex items-center justify-center gap-3 text-white font-bold px-9 py-5 rounded-2xl text-base transition-all hover:scale-105 hover:shadow-2xl whitespace-nowrap"
          style={{ background: "#F49E4B", boxShadow: "0 18px 40px rgba(244,158,75,.28)" }}
        >
          Abrir calculadora
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 9h10M10 5l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  );
}
