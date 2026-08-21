import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

export default function Hero() {
  return (
    <section
      className="w-full relative overflow-hidden pt-32 pb-24 px-6"
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

      <div className="max-w-[1180px] mx-auto relative z-10 grid lg:grid-cols-[1.04fr_0.96fr] gap-12 lg:gap-16 items-center">
        {/* Left: copy */}
        <div>
          <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#F49E4B" }} />
            Programa 360° · Másteres en España 2026/2027
          </div>

          <h1 className="font-fraunces text-[40px] sm:text-6xl lg:text-[72px] font-bold text-white leading-[0.98] mb-5 tracking-tight">
            Encuentra el máster correcto.
            <br />
            <span style={{ color: "#F49E4B" }}>Nosotros hacemos el resto.</span>
          </h1>

          <p className="text-white/65 text-lg leading-relaxed mb-9 max-w-xl">
            Selección, postulación, documentación y acompañamiento para convertir tu
            objetivo de estudiar en España en un proceso claro, medible y acompañado
            desde la elección del máster hasta la matrícula.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-9">
            <a
              href="/servicios/master"
              onClick={(e) => go(e, "/servicios/master")}
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-7 py-4 rounded-2xl text-base transition-all hover:scale-105 hover:shadow-2xl"
              style={{ background: "#F49E4B", boxShadow: "0 14px 30px rgba(244,158,75,.25)" }}
            >
              Ver Programa Máster 360°
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12L12 5M12 5H6M12 5v6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="/calculadora-master"
              onClick={(e) => go(e, "/calculadora-master")}
              className="inline-flex items-center justify-center gap-2 border border-white/25 hover:border-white/50 bg-white/5 backdrop-blur-sm text-white font-semibold px-7 py-4 rounded-2xl text-base transition-all hover:bg-white/10"
            >
              Calculadora Gratuita
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12l7-7 7 7" transform="rotate(90, 9, 9)" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/45 text-xs">
            <span><b className="text-white text-sm font-semibold">98%</b> admisión</span>
            <span><b className="text-white text-sm font-semibold">+80</b> universidades</span>
            <span><b className="text-white text-sm font-semibold">+100</b> becas logradas</span>
            <span><b className="text-white text-sm font-semibold">360°</b> acompañamiento</span>
          </div>
        </div>

        {/* Right: app mockup card */}
        <div className="relative hidden sm:block">
          <div
            className="absolute -left-9 top-12 z-10 bg-white border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-primary shadow-xl whitespace-nowrap"
            style={{ animation: "inspira-float 4.2s ease-in-out infinite" }}
          >
            ✓ Perfil analizado
          </div>
          <div
            className="absolute -right-8 -bottom-5 z-10 bg-white border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-primary shadow-xl whitespace-nowrap"
            style={{ animation: "inspira-float 4.8s ease-in-out infinite reverse" }}
          >
            3 becas compatibles
          </div>

          <div
            className="relative bg-white/97 border border-white/40 rounded-[28px] overflow-hidden"
            style={{
              boxShadow: "0 30px 90px rgba(0,0,0,.28)",
              transform: "perspective(1000px) rotateY(-2deg) rotateX(1deg)",
            }}
          >
            <div className="h-[58px] px-5 flex items-center justify-between border-b border-neutral-200 bg-[#fbfdfd]">
              <span className="text-xs font-bold text-neutral-500">Inspira Match</span>
              <span className="text-[11px] font-extrabold text-primary bg-secondary px-2.5 py-1.5 rounded-full">
                ✓ Perfil activo
              </span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  ["País", "🇵🇪 Perú"],
                  ["Área", "Administración"],
                  ["Promedio", "15.8 / 20"],
                  ["Experiencia", "2 años"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-[#f7fafb] border border-neutral-200 rounded-xl p-3">
                    <small className="block text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                      {k}
                    </small>
                    <strong className="text-[13px] text-primary">{v}</strong>
                  </div>
                ))}
              </div>

              <div
                className="mt-4 rounded-2xl p-4 text-white relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,#072f3b,#0b5665)" }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <small className="text-white/60 text-[10px]">Coincidencias encontradas</small>
                    <br />
                    <strong className="text-3xl tracking-tight">12</strong>
                  </div>
                  <div className="text-right">
                    <small className="text-white/60 text-[10px]">Universidades</small>
                    <br />
                    <b>7</b>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 mt-3.5">
                {[
                  ["UAM", "Dirección de Empresas", "Madrid · Pública", "94%"],
                  ["UPF", "Management", "Barcelona · Pública", "91%"],
                  ["UV", "Gestión Internacional", "Valencia · Pública", "88%"],
                ].map(([uni, title, loc, match]) => (
                  <div
                    key={uni}
                    className="grid grid-cols-[auto_1fr_auto] gap-2.5 items-center border border-neutral-200 rounded-xl p-2.5 bg-white"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary grid place-items-center text-primary text-[10px] font-black">
                      {uni}
                    </div>
                    <div>
                      <b className="text-[11px] block">{title}</b>
                      <span className="text-[10px] text-neutral-500">{loc}</span>
                    </div>
                    <span className="text-[10px] font-black text-[#1d6a4a] bg-[#e9f7ef] px-2 py-1 rounded-full">
                      {match}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes inspira-float { 50% { transform: translateY(-8px); } }`}</style>
    </section>
  );
}
