// Panel del asesor para el profesional altamente cualificado (UGE).
//
// Mismo molde que la estancia: dónde está el expediente, quién más entra, la
// ficha, los documentos con aprobar y observar, el recordatorio, los
// acompañantes (cada uno con su propia solicitud), cerrar la carpeta y lo
// que llega de la UGE y del consulado.
import Invitados from "../Invitados";
import AcompanantesPacAdmin from "./AcompanantesPacAdmin";
import RecordatorioPac from "./RecordatorioPac";
import { Flujo } from "./pac-admin/Flujo";
import { Datos } from "./pac-admin/Datos";
import { Documentos } from "./pac-admin/Documentos";
import { Extranjeria } from "./pac-admin/Extranjeria";
import { RevisionPedida } from "./pac-admin/RevisionPedida";
import { CerrarCarpeta } from "./pac-admin/CerrarCarpeta";
import { usePacAdmin } from "./pac-admin/usePacAdmin";

export default function PacAdmin({ idSolicitud }) {
  const { exp, docs, ext, guardando, cargar, guardar } = usePacAdmin(idSolicitud);

  if (!exp) return <p className="text-[13px] text-neutral-400 py-6">Cargando el expediente…</p>;

  return (
    <div className="space-y-3">
      <RevisionPedida exp={exp} />
      <Flujo revision={exp.revision} guardando={guardando} onCambiar={(estado_proceso) => guardar({ estado_proceso })} />
      <Invitados idSolicitud={idSolicitud} numero="0b" />
      <Datos exp={exp} onGuardar={guardar} />
      <Documentos id={idSolicitud} docs={docs} onCambio={cargar} />
      <RecordatorioPac id={idSolicitud} docs={docs} onCambio={cargar} />
      <AcompanantesPacAdmin idSolicitud={idSolicitud} exp={exp} numero="3" />
      <CerrarCarpeta id={idSolicitud} exp={exp} docs={docs} onHecho={cargar} />
      <Extranjeria id={idSolicitud} registros={ext} onCambio={cargar} />
    </div>
  );
}
