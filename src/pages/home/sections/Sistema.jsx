import Reveal from "../../../components/common/Reveal";
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";
import { NOMBRE_PORTAL, FRASE_APOYO } from "../../../config/portalMarca";
// Capturas del Expediente Digital con el desenfoque horneado (las mismas de
// /plataforma), en el marco de teléfono compartido.
import { CAPTURAS_PORTAL } from "../../../components/common/capturasPortal";
import { MarcoTelefono } from "../../../components/common/MarcoDispositivo";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

// El mayor diferenciador de la firma: el Portal Inspira en vez de WhatsApp.
// Solo funciones que existen (ver hechos verificados del portal): acceso con
// Google, panel instalable, documentos con observaciones del asesor, plazos y
// requerimientos a la vista y mensajes con constancia de lectura.
const PUNTOS = [
  { i: "laptop", t: "Portal propio que se instala como app en tu teléfono" },
  { i: "documento", t: "Documentos revisados por tu asesor, con sus observaciones" },
  { i: "calendario", t: "Tus plazos y requerimientos, a la vista" },
  { i: "chat", t: "Mensajes dentro del expediente, con constancia de lectura" },
];

const CAPTURAS = [CAPTURAS_PORTAL.inicio, CAPTURAS_PORTAL.masterPostulaciones];

export default function Sistema() {
  return (
    <section className="sistema">
      <div className="v4-container">
        <div className="sistema-grid">
          <Reveal>
            <span className="eyebrow"><span className="dot" />Somos una firma distinta</span>
            <h2>
              {FRASE_APOYO[0]}
              <br />
              <span>{FRASE_APOYO[1]}</span>
            </h2>
            <p>
              Al contratar se abre tu {NOMBRE_PORTAL}, al que entras con tu correo de Google. Ahí
              vive tu expediente: subes tus documentos, tu asesor los revisa y te
              deja sus observaciones, y cada plazo queda a la vista.
            </p>
            <ul className="sistema-lista">
              {PUNTOS.map((x) => (
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
              Conoce el {NOMBRE_PORTAL} <span className="arr">→</span>
            </a>
          </Reveal>

          {/* Dos capturas del portal en marco de teléfono */}
          <Reveal delay={140}>
            <div className="mx-auto grid max-w-[420px] grid-cols-2 items-start gap-4">
              {CAPTURAS.map((c, i) => (
                <MarcoTelefono key={c.src} captura={c} aspecto="aspect-[9/15]" className={i === 1 ? "mt-10" : ""} />
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-neutral-500">
              Capturas del {NOMBRE_PORTAL} con datos de ejemplo desenfocados.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
