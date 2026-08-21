import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

const servicios = [
  {
    label: "Programa Máster 360°",
    desc: "Búsqueda personalizada, postulación, seguimiento y matrícula en universidades españolas de primer nivel.",
    href: "/servicios/master",
    badge: "Más popular",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 3L2 8l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 8v8l10 5 10-5V8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Paquete Estancia por Estudios",
    desc: "Gestión completa de tu permiso de estancia para estudiar en España con todos los trámites al día.",
    href: "/servicios/estancia",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Servicios() {
  return (
    <section className="py-24 px-6" style={{ background: "#F4F8FC" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            style={{ color: "#F49E4B" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F49E4B" }} />
            Servicios
          </span>
          <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-primary mt-3 tracking-tight">
            ¿Qué quieres lograr?
          </h2>
          <p className="text-neutral-500 mt-4">
            Elige el servicio que mejor se adapta a tu objetivo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {servicios.map((s) => (
            <a
              key={s.label}
              href={s.href}
              onClick={(e) => go(e, s.href)}
              className="group relative bg-white rounded-3xl border border-neutral-200 p-8 hover:border-accent/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {s.badge && (
                <span className="absolute top-5 right-5 text-xs font-bold text-white px-3 py-1.5 rounded-full" style={{ background: "#F49E4B" }}>
                  {s.badge}
                </span>
              )}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-primary transition-colors group-hover:bg-accent group-hover:text-white"
                style={{ background: "#EEF5F6" }}
              >
                {s.icon}
              </div>
              <h3 className="font-fraunces text-2xl font-bold text-primary mb-2 group-hover:text-accent transition-colors tracking-tight">
                {s.label}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed mb-5">{s.desc}</p>
              <span className="text-sm font-semibold flex items-center gap-1.5 transition-colors" style={{ color: "#F49E4B" }}>
                Ver detalles y planes
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          ))}
        </div>

        {/* Calculadora CTA */}
        <div
          className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #023A4B 0%, #054A5E 100%)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(circle at center, black, transparent 75%)",
              WebkitMaskImage: "radial-gradient(circle at center, black, transparent 75%)",
            }}
          />
          <div
            className="absolute top-0 right-0 rounded-full pointer-events-none"
            style={{
              width: "340px",
              height: "340px",
              background: "radial-gradient(circle, #9ACEFF 0%, transparent 70%)",
              opacity: 0.1,
              transform: "translate(30%, -50%)",
            }}
          />
          <div className="relative z-10">
            <div className="text-white/50 text-xs mb-3 uppercase tracking-widest font-bold">
              Herramienta gratuita
            </div>
            <h3 className="font-fraunces text-2xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              ¿No sabes a qué másteres puedes postular?
            </h3>
            <p className="text-white/55 mb-8 max-w-lg mx-auto leading-relaxed">
              Usa nuestra calculadora gratuita y descubre universidades, becas disponibles
              y los paquetes más adecuados para tu perfil.
            </p>
            <a
              href="/calculadora-master"
              onClick={(e) => go(e, "/calculadora-master")}
              className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all hover:scale-105 hover:shadow-xl"
              style={{ background: "#F49E4B", boxShadow: "0 14px 30px rgba(244,158,75,.25)" }}
            >
              Calculadora Máster Gratis
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
