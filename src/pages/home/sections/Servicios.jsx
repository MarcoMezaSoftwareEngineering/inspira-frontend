import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

const checklist = [
  "Búsqueda personalizada",
  "Universidades y becas",
  "Postulaciones",
  "Seguimiento",
  "Panel de avance",
  "Matrícula",
];

export default function Servicios() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#F49E4B" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F49E4B" }} />
            Servicios
          </span>
          <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-primary mt-3 tracking-tight">
            Lo importante no es darte información. Es mover tu caso.
          </h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto leading-relaxed">
            Dos soluciones con jerarquía clara: el Programa Máster 360° como producto
            principal y la estancia por estudios como solución especializada.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.55fr_0.75fr] gap-5">
          {/* Main card */}
          <a
            href="/servicios/master"
            onClick={(e) => go(e, "/servicios/master")}
            className="group relative rounded-[28px] border border-neutral-200 p-8 min-h-[390px] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-accent/40"
            style={{ background: "linear-gradient(145deg,#fff,#f3f8f9)" }}
          >
            <span
              className="inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{ background: "#fff0e2", color: "#b96114" }}
            >
              Más elegido
            </span>
            <h3 className="font-fraunces text-3xl md:text-[34px] font-bold text-primary mt-4 mb-2.5 tracking-tight">
              Programa Máster 360°
            </h3>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-md">
              Desde la búsqueda personalizada hasta la matrícula: construimos tu shortlist,
              gestionamos postulaciones, revisamos requisitos y seguimos cada hito.
            </p>

            <div className="grid grid-cols-2 gap-2 my-5 max-w-md">
              {checklist.map((c) => (
                <div key={c} className="text-xs flex items-center gap-2">
                  <span className="font-black" style={{ color: "#1d6a4a" }}>✓</span>
                  {c}
                </div>
              ))}
            </div>

            <span
              className="inline-flex items-center gap-2 text-white font-semibold px-5 py-3 rounded-xl text-sm"
              style={{ background: "#F49E4B" }}
            >
              Explorar programa
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 7h8M7 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>

            <div
              className="hidden md:block absolute right-6 bottom-5 w-[220px] text-white rounded-2xl p-4"
              style={{ background: "#073948", transform: "rotate(-2deg)" }}
            >
              <small className="text-white/50 text-[10px]">Avance del proceso</small>
              <br />
              <strong className="text-2xl">72%</strong>
              <div className="h-1 rounded-full mt-2 overflow-hidden bg-white/10">
                <div className="h-full rounded-full" style={{ width: "72%", background: "#F49E4B" }} />
              </div>
              <small className="text-white/50 text-[10px] mt-2 block">Próximo: documentación final</small>
            </div>
          </a>

          {/* Secondary card */}
          <a
            href="/servicios/estancia"
            onClick={(e) => go(e, "/servicios/estancia")}
            className="group rounded-[28px] border border-neutral-200 p-8 transition-all duration-300 hover:shadow-xl hover:border-accent/40"
          >
            <span
              className="inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{ background: "#e9f6ef", color: "#1d6a4a" }}
            >
              Especializado
            </span>
            <h3 className="font-fraunces text-2xl font-bold text-primary mt-4 mb-2.5 tracking-tight">
              Estancia por estudios
            </h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Gestión documental y acompañamiento para tu permiso de estancia, con
              checklist y seguimiento de cada requisito.
            </p>
            <span
              className="inline-flex items-center gap-1.5 text-sm font-semibold mt-6"
              style={{ color: "#F49E4B" }}
            >
              Ver servicio
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 7h8M7 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
