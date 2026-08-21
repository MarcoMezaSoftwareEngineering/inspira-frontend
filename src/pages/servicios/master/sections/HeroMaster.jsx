import { useAuth } from "../../../../context/AuthContext";
import { navigate } from "../../../../services/navigate";

export default function HeroMaster() {
  const { user } = useAuth();

  const go = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <section
      className="w-full py-20 px-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #023A4B 0%, #054A5E 100%)",
      }}
    >
      {/* Decorative blob */}
      <div
        className="absolute top-0 right-0 rounded-full pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, #9ACEFF 0%, transparent 70%)",
          opacity: 0.07,
          transform: "translate(30%, -30%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <span className="inline-block bg-white/10 border border-white/20 text-white/75 text-sm px-4 py-1.5 rounded-full mb-6">
          Máster en España 2026/2027
        </span>

        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
              Programa Máster
              <br />
              <span style={{ color: "#F49E4B" }}>360°</span>
            </h1>
            <p className="text-white/65 text-lg mb-8 leading-relaxed">
              Te acompañamos desde la búsqueda del máster hasta la matrícula,
              con asesoría educativa, admisión universitaria, postulación y
              seguimiento integral.
            </p>

            {/* Mini stats */}
            <div className="flex gap-4 mb-8">
              {[
                { n: "98%", l: "Admisión" },
                { n: "+45", l: "Universidades" },
                { n: "4", l: "Etapas" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-center flex-1"
                >
                  <div className="text-2xl font-bold" style={{ color: "#F49E4B" }}>
                    {s.n}
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <a
                href="/calculadora-master"
                onClick={(e) => go(e, "/calculadora-master")}
                className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 hover:shadow-xl"
                style={{ background: "#F49E4B" }}
              >
                Calculadora Gratuita
              </a>
            </div>
          </div>

          {/* Feature pills */}
          <div className="hidden md:grid grid-cols-2 gap-3">
            {[
              "✓ Búsqueda personalizada de másteres",
              "✓ Beca Generación Bicentenario",
              "✓ Beca Fundación Carolina",
              "✓ +80 universidades públicas",
              "✓ Revisión documentaria completa",
              "✓ Seguimiento hasta la matrícula",
            ].map((b) => (
              <div
                key={b}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4 text-white/75 text-sm font-medium"
              >
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
