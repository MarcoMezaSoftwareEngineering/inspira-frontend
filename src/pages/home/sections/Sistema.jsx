import Reveal from "../../../components/common/Reveal";
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

// El mayor diferenciador de la firma: sistema propio en vez de WhatsApp.
export default function Sistema() {
  return (
    <section className="sistema">
      <div className="v4-container">
        <div className="sistema-grid">
          <Reveal>
            <span className="eyebrow"><span className="dot" />Somos una firma distinta</span>
            <h2>
              Tu caso no vive en un chat.
              <br />
              <span>Vive en nuestro sistema.</span>
            </h2>
            <p>
              Al contratar te damos credenciales de acceso a un panel privado
              donde está tu expediente completo. Subes tus documentos, tu
              asesor los valida ahí mismo y el sistema te avisa solo en cada
              hito del proceso.
            </p>
            <ul className="sistema-lista">
              {[
                { i: "laptop", t: "Panel privado con tus credenciales" },
                { i: "documento", t: "Checklist de documentos validado por tu asesor" },
                { i: "destello", t: "Avisos automáticos en cada cambio de estado" },
                { i: "escudo", t: "Backoffice interno: todo el equipo ve tu expediente" },
              ].map((x) => (
                <li key={x.t}>
                  <span className="sistema-ico">
                    <Icono nombre={x.i} size={17} />
                  </span>
                  {x.t}
                </li>
              ))}
            </ul>
            <a
              className="btn btn-primary"
              href="/plataforma"
              onClick={(e) => go(e, "/plataforma")}
            >
              Conoce nuestro sistema <span className="arr">→</span>
            </a>
          </Reveal>

          {/* Maqueta del panel */}
          <Reveal className="sistema-mock" delay={140}>
            <div className="mock-top">
              <span className="mock-dot" />
              <span className="mock-titulo">Mi panel Inspira</span>
              <span className="mock-estado">● Expediente activo</span>
            </div>
            <div className="mock-body">
              <div className="mock-progreso">
                <div className="mock-progreso-head">
                  <span>Visa de Estudios</span>
                  <b>72%</b>
                </div>
                <div className="mock-barra">
                  <i style={{ width: "72%" }} />
                </div>
                <small>Próximo hito: cita consular</small>
              </div>

              <p className="mock-label">Checklist de documentos</p>
              {[
                { d: "Pasaporte vigente", e: "Validado", tipo: "ok" },
                { d: "Carta de admisión", e: "Validado", tipo: "ok" },
                { d: "Antecedentes apostillados", e: "En revisión", tipo: "rev" },
                { d: "Seguro médico", e: "Pendiente", tipo: "pend" },
              ].map((f) => (
                <div className={`mock-doc ${f.tipo}`} key={f.d}>
                  <span className="mock-check">
                    {f.tipo === "ok" ? "✓" : f.tipo === "rev" ? "•" : ""}
                  </span>
                  <span className="mock-doc-n">{f.d}</span>
                  <span className="mock-doc-e">{f.e}</span>
                </div>
              ))}

              <div className="mock-aviso">
                <Icono nombre="destello" size={15} />
                <span>
                  <b>Aviso automático</b>
                  Tu asesor validó “Carta de admisión”.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
