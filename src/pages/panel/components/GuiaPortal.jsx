// «Guía del portal»: el manual en PDF de cómo usar el panel, uno por servicio.
//
// Cada asesorado ve solo la guía de lo que tiene contratado (servicios.js,
// `guiasPortalDe`). Los PDF viven en public/guias/ y se abren en otra pestaña:
// en el teléfono los abre el visor del sistema, que permite guardarlos.
import Icono from "../../../components/common/Icono";

export default function GuiaPortal({ guias = [] }) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-4">
      <div className="pnl-head">
        <div>
          <h2>Guía del portal</h2>
          <p>Paso a paso, con capturas, de todo lo que puedes hacer en tu panel.</p>
        </div>
      </div>
      <ul className="ex-guia-portal-lista">
        {guias.map((g) => (
          <li key={g.servicio} className="ex-guia-portal">
            <span className="ex-guia-portal-icono bg-sky/20 text-primary"><Icono nombre="documento" size={20} /></span>
            <div className="min-w-0 flex-1">
              <strong className="text-primary">{g.titulo}</strong>
              <small>{g.descripcion}</small>
            </div>
            <a className="pnl-btn-cta ux-tap" href={g.href} target="_blank" rel="noopener noreferrer">
              Ver guía (PDF)
              <span className="ex-guia-portal-peso">{g.peso}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
