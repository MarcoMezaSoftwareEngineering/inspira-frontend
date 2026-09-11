import Reveal from "../../../components/common/Reveal";
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";
// Capturas reales del portal, recortadas y desenfocadas (las mismas que
// «Portal propio» de /servicios/master).
import capInicio from "../../../assets/images/servicios/master/portal-inicio.webp";
import capExpediente from "../../../assets/images/servicios/master/portal-expediente.webp";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

// El mayor diferenciador de la firma: sistema propio en vez de WhatsApp.
// Solo funciones que existen (ver hechos verificados del portal): acceso con
// Google, panel instalable, documentos con observaciones del asesor, plazos y
// requerimientos a la vista y mensajes con constancia de lectura.
const PUNTOS = [
  { i: "laptop", t: "Panel privado que se instala como app en tu teléfono" },
  { i: "documento", t: "Documentos revisados por tu asesor, con sus observaciones" },
  { i: "calendario", t: "Tus plazos y requerimientos, a la vista" },
  { i: "chat", t: "Mensajes dentro del expediente, con constancia de lectura" },
];

const CAPTURAS = [
  { src: capInicio, alt: "Inicio del portal del asesorado, con los datos desenfocados" },
  { src: capExpediente, alt: "Avance de un expediente en el portal, con los datos desenfocados" },
];

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
              Al contratar abres tu panel privado, con tu correo de Google. Ahí
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
              Conoce nuestro sistema <span className="arr">→</span>
            </a>
          </Reveal>

          {/* Dos capturas del portal en marco de teléfono */}
          <Reveal delay={140}>
            <div className="mx-auto grid max-w-[420px] grid-cols-2 items-start gap-4">
              {CAPTURAS.map((c, i) => (
                <div
                  key={c.src}
                  className={`overflow-hidden rounded-[1.4rem] border-[5px] border-[#013446] bg-white shadow-[0_24px_50px_-28px_rgba(1,52,70,0.6)] ${i === 1 ? "mt-10" : ""}`}
                >
                  <img
                    src={c.src}
                    alt={c.alt}
                    width={420}
                    height={909}
                    loading="lazy"
                    decoding="async"
                    className="block aspect-[9/15] w-full object-cover object-top"
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-neutral-500">
              Capturas del portal con datos de ejemplo desenfocados.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
