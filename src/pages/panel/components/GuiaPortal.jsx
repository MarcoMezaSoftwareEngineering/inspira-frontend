// «Mis guías»: los PDF de cada servicio contratado, la de su trámite y la de
// uso del portal (las mismas dos que recibe por correo al darle de alta).
//
// Cada asesorado ve solo las de lo que tiene contratado (servicios.js,
// `guiasPortalDe`). Los PDF viven en public/guias/ y se abren en otra pestaña:
// en el teléfono los abre el visor del sistema, que permite guardarlos.
import Icono from "../../../components/common/Icono";

export default function GuiaPortal({ guias = [] }) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-4">
      <div className="pnl-head">
        <div>
          <h2>Mis guías</h2>
          <p>La guía de tu trámite, con cada documento y cada plazo, y la del portal, paso a paso con capturas.</p>
        </div>
      </div>
      <ul className="ex-guia-portal-lista">
        {guias.map((g) => (
          <li key={g.href} className="ex-guia-portal">
            <span className="ex-guia-portal-icono bg-sky/20 text-primary">
              <Icono nombre={g.tipo === "portal" ? "mapa" : "documento"} size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <small>{g.tipo === "portal" ? "Tu portal" : "Tu trámite"}</small>
              <strong className="text-primary">{g.titulo}</strong>
              <small>{g.descripcion}</small>
            </div>
            <a className="pnl-btn-cta ux-tap" href={g.href} target="_blank" rel="noopener noreferrer">
              Ver guía (PDF)
              {g.peso && <span className="ex-guia-portal-peso">{g.peso}</span>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
