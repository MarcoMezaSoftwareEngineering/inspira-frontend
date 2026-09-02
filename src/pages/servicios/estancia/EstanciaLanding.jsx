import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

const incluye = [
  "Checklist automático de documentos",
  "Carga y validación de documentos",
  "Exposición de motivos generada por IA",
  "Formulario EX-00 asistido",
  "Pasos según país y consulado",
  "Alertas de plazos importantes",
  "Asesorías de seguimiento ilimitadas",
  "Panel interno con estado del proceso",
];

export default function EstanciaLanding() {
  return (
    <main className="w-full">
      {/* Hero */}
      <section
        className="w-full py-20 px-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #013446 0%, #02506B 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 rounded-full pointer-events-none"
          style={{
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, #9ACEFF 0%, transparent 70%)",
            opacity: 0.07,
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block bg-white/10 border border-white/20 text-white/75 text-sm px-4 py-1.5 rounded-full mb-6">
            Servicio migratorio
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Paquete Estancia
            <br />
            <span style={{ color: "#FA943A" }}>por Estudios</span>
          </h1>
          <p className="text-white/65 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Gestionamos tu permiso de estancia para que puedas estudiar en
            España con todos los trámites en orden y plazos controlados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/servicios/master"
              onClick={(e) => go(e, "/servicios/master")}
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:scale-105 hover:shadow-xl"
              style={{ background: "#FA943A" }}
            >
              Ver Programa Máster 360°
            </a>
            <a
              href="/servicios/master"
              onClick={(e) => go(e, "/servicios/master")}
              className="inline-flex items-center justify-center gap-2 border-2 border-white/25 hover:border-white/50 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:bg-white/10"
            >
              Ver Paquete Máster
            </a>
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "#FA943A" }}
            >
              ¿Qué incluye?
            </span>
            <h2 className="text-3xl font-bold text-primary mt-2">
              Todo lo que necesitas para tu estancia
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {incluye.map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 bg-neutral-50 border border-neutral-200 rounded-xl px-6 py-4"
              >
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "#013446" }}
                >
                  ✓
                </span>
                <span className="text-neutral-700 text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* En construcción notice */}
      <section className="py-16 px-6" style={{ background: "#F4F8FC" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white border border-neutral-200 rounded-2xl p-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "#013446" }}
            >
              <svg
                width="26"
                height="26"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary mb-3">
              Detalle completo próximamente
            </h3>
            <p className="text-neutral-500 mb-7 max-w-md mx-auto">
              Estamos preparando la página completa con planes y precios.
              Mientras tanto, conoce nuestro Programa Máster 360°.
            </p>
            <a
              href="/servicios/master"
              onClick={(e) => go(e, "/servicios/master")}
              className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"
              style={{ background: "#013446" }}
            >
              Ver Programa Máster 360° →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
