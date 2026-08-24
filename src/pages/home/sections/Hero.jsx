import { navigate } from "../../../services/navigate";
import Reveal from "../../../components/common/Reveal";
import { CALENDLY_URL } from "../../../config/contacto";
import { promoVigente, PROMO_GRATIS } from "../../../config/asesorias";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

// Accesos rápidos: lo primero que ve el visitante, sin scroll.
const accesos = [
  { emoji: "🎓", label: "Máster en España", href: "/servicios/master" },
  { emoji: "🛂", label: "Visa de Estudios", href: "/servicios/visa-estudios" },
  { emoji: "🇪🇸", label: "Estancia por Estudios", href: "/servicios/estancia-estudios" },
  { emoji: "🧭", label: "Nuestros servicios", href: "/servicios" },
];

export default function Hero() {
  const promo = promoVigente();

  return (
    <section className="hero" id="inicio">
      <div className="v4-container hero-grid">
        <Reveal>
          {promo && (
            <a
              className="hero-promo"
              href={PROMO_GRATIS.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hero-promo-tag">Gratis</span>
              {PROMO_GRATIS.titulo} — solo hasta el 22 de septiembre
              <span className="arr">→</span>
            </a>
          )}

          <div className="eyebrow">
            <span className="dot" />
            Migra a España · Rumbo a septiembre 2027
          </div>
          <h1>
            Una asesoría de distancia
            <br />
            <span>para vivir en España 🇪🇸</span>
          </h1>
          <p className="lead">
            Visa de estudios, máster, estancia y todo el camino legal hasta
            instalarte. Abogados especialistas en extranjería que solo asumen
            casos viables — y te lo dicen de frente.
          </p>

          <div className="actions">
            <a
              className="btn btn-primary"
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              📅 Agenda tu asesoría <span className="arr">→</span>
            </a>
            <a
              className="btn btn-ghost"
              href="/calculadora-master"
              onClick={(e) => go(e, "/calculadora-master")}
            >
              Calcular mi máster gratis <span className="arr">↗</span>
            </a>
          </div>

          {/* Accesos rápidos en la primera impresión */}
          <div className="hero-quick">
            {accesos.map((a) => (
              <a
                key={a.href}
                href={a.href}
                onClick={(e) => go(e, a.href)}
                className="hero-quick-item"
              >
                <span aria-hidden>{a.emoji}</span>
                {a.label}
              </a>
            ))}
          </div>

          <div className="proof-inline">
            <span><b>98%</b> admisión</span>
            <span><b>+1,100</b> másteres analizados</span>
            <span><b>+100</b> becas logradas</span>
            <span><b>100%</b> digital</span>
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
