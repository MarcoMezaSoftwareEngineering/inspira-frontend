// src/pages/panel/components/mis-servicios/sections/InstructivosPlantillas.jsx
//
// Las guías y plantillas del servicio. Desde el 08/09/2026 ya no son un paso
// aparte: van dentro de Documentos, debajo del checklist, porque cada guía
// sirve para un documento. `InstructivosContenido` es lo que se incrusta;
// el componente por defecto lo envuelve en su sección para quien lo use
// suelto (el visado).
import SeccionPanel from "./SeccionPanel";
import GuiaDocumentosMaster from "./GuiaDocumentosMaster";
import IconoPaso from "../../../../../components/common/IconoPaso";

export function InstructivosContenido({ instructivos, onIrAGuia, guiaDocumentos = false }) {
  const lista = Array.isArray(instructivos) ? instructivos : [];

  return (
    <>
      {onIrAGuia && (
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => onIrAGuia("guia")}
            className="pnl-guia-enlace"
          >
            <span className="pnl-ico" data-talla="l"><IconoPaso nombre="cap" /></span>
            <span className="min-w-0 flex-1">
              <span className="pnl-guia-enlace-titulo">Guía completa del Máster</span>
              <span className="pnl-guia-enlace-texto">Paso a paso de todo el proceso de postulación.</span>
            </span>
            <IconoPaso nombre="arrowRight" className="pnl-guia-enlace-flecha" />
          </button>
          <button
            type="button"
            onClick={() => onIrAGuia("apostilla")}
            className="pnl-guia-enlace"
          >
            <span className="pnl-ico" data-talla="l"><IconoPaso nombre="scroll" /></span>
            <span className="min-w-0 flex-1">
              <span className="pnl-guia-enlace-titulo">Guía de Apostilla</span>
              <span className="pnl-guia-enlace-texto">Cómo apostillar tus documentos.</span>
            </span>
            <IconoPaso nombre="arrowRight" className="pnl-guia-enlace-flecha" />
          </button>
        </div>
      )}

      {/* La guía directa de documentos: qué es cada uno y cómo debe verse. */}
      {guiaDocumentos && <GuiaDocumentosMaster />}

      {lista.length === 0 ? (
        <div className="pnl-vacio-suave">
          <p>Aún no hay instructivos configurados.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {lista.map((doc) => (
            <li
              key={doc.url}
              className="pnl-descarga"
            >
              <span className="pnl-ico" data-talla="l"><IconoPaso nombre="fileText" /></span>
              <span className="pnl-descarga-nombre min-w-0 flex-1">{doc.label}</span>
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                download
                className="pnl-btn shrink-0"
                data-talla="s"
              >
                <IconoPaso nombre="download" />
                Descargar
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function InstructivosPlantillas({
  instructivos,
  numero = "2",
  titulo = "Instructivos y plantillas",
  subtitulo = "Descarga la guía paso a paso de tu servicio.",
  sectionId = "2",
  onIrAGuia,
  guiaDocumentos = false,
}) {
  return (
    <SeccionPanel numero={numero} titulo={titulo} subtitulo={subtitulo} sectionId={sectionId}>
      <InstructivosContenido instructivos={instructivos} onIrAGuia={onIrAGuia} guiaDocumentos={guiaDocumentos} />
    </SeccionPanel>
  );
}
