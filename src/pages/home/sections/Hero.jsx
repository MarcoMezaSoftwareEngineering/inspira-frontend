import { navigate } from "../../../services/navigate";
import Reveal from "../../../components/common/Reveal";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="v4-container hero-grid">
        <Reveal>
          <div className="eyebrow">
            <span className="dot" />
            Extranjería y estudios · España 2026/27
          </div>
          <h1>
            Migra a España
            <br />
            <span>por estudios.</span>
          </h1>
          <p className="lead">
            Visa de estudios, máster, estancia y todo el camino legal hasta instalarte.
            Y si tu ruta es otra — nómada digital, visado PAC o nacionalidad — también
            la conocemos de memoria.
          </p>
          <div className="actions">
            <a
              className="btn btn-primary"
              href="/calculadora-master"
              onClick={(e) => go(e, "/calculadora-master")}
            >
              Descubrir mis opciones <span className="arr">→</span>
            </a>
            <a
              className="btn btn-ghost"
              href="/servicios"
              onClick={(e) => go(e, "/servicios")}
            >
              Ver todos los servicios <span className="arr">↗</span>
            </a>
          </div>
          <div className="proof-inline">
            <span><b>98%</b> admisión</span>
            <span><b>+1,100</b> másteres analizados</span>
            <span><b>+100</b> becas logradas</span>
            <span><b>360°</b> acompañamiento</span>
          </div>
        </Reveal>

        <Reveal className="hero-card">
          <div className="float-chip chip-a">✓ Perfil analizado</div>
          <div className="float-chip chip-b">3 becas compatibles</div>
          <div className="app-window">
            <div className="app-top">
              <span className="tiny">Inspira Match</span>
              <span className="status">● Perfil activo</span>
            </div>
            <div className="app-body">
              <div className="profile-grid">
                <div className="field"><small>País</small><strong>🇵🇪 Perú</strong></div>
                <div className="field"><small>Área</small><strong>Administración</strong></div>
                <div className="field"><small>Promedio</small><strong>15.8 / 20</strong></div>
                <div className="field"><small>Experiencia</small><strong>2 años</strong></div>
              </div>
              <div className="scan">
                <div className="scan-row">
                  <div>
                    <small>Coincidencias encontradas</small>
                    <br />
                    <strong>12</strong>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <small>Universidades</small>
                    <br />
                    <b>7</b>
                  </div>
                </div>
              </div>
              <div className="mini-programs">
                <div className="program">
                  <div className="uni">UAM</div>
                  <div><b>Dirección de Empresas</b><br /><span>Madrid · Pública</span></div>
                  <span className="match">94%</span>
                </div>
                <div className="program">
                  <div className="uni">UPF</div>
                  <div><b>Management</b><br /><span>Barcelona · Pública</span></div>
                  <span className="match">91%</span>
                </div>
                <div className="program">
                  <div className="uni">UV</div>
                  <div><b>Gestión Internacional</b><br /><span>Valencia · Pública</span></div>
                  <span className="match">88%</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
