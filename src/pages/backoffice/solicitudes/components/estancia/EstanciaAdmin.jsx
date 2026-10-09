// Panel del asesor para la estancia por estudios.
//
// Empieza por el punto 0 —dónde está el expediente— porque es lo primero que
// necesita saber quien lo abre: qué le toca hacer ahora.
//
// Los documentos van como checklist con aprobar y observar, no como listado:
// que un documento esté subido no significa que sirva. Extranjería devuelve
// los que no cumplen, así que alguien tiene que mirarlos antes de presentar y
// el asesorado tiene que saber si el suyo pasó.
import Invitados from "../Invitados";
import AcompanantesAdmin from "./AcompanantesAdmin";
import GeneradoresEstancia from "./GeneradoresEstancia";
import RecordatorioEstancia from "./RecordatorioEstancia";
import DeadlineEstancia from "./DeadlineEstancia";
import { Flujo } from "./estancia-admin/Flujo";
import { Datos } from "./estancia-admin/Datos";
import { Documentos } from "./estancia-admin/Documentos";
import { PasarAAbogada } from "./estancia-admin/PasarAAbogada";
import { Presentado } from "./estancia-admin/Presentado";
import { Extranjeria } from "./estancia-admin/Extranjeria";
import { RevisionPedida } from "./estancia-admin/RevisionPedida";
import { CerrarCarpeta } from "./estancia-admin/CerrarCarpeta";
import { useEstanciaAdmin } from "./estancia-admin/useEstanciaAdmin";

/* ── Principal ───────────────────────────────────────────────────────────── */

export default function EstanciaAdmin({ idSolicitud }) {
  const { exp, docs, ext, guardando, cargar, guardar } = useEstanciaAdmin(idSolicitud);

  if (!exp) return <p className="text-[13px] text-neutral-400 py-6">Cargando el expediente…</p>;

  return (
    <div className="space-y-3">
      <RevisionPedida exp={exp} />
      <Flujo revision={exp.revision} guardando={guardando}
        onCambiar={(estado_proceso) => guardar({ estado_proceso })} />
      <Invitados idSolicitud={idSolicitud} numero="0b" />
      <Datos exp={exp} onGuardar={guardar} />
      <Documentos id={idSolicitud} docs={docs} onCambio={cargar} />
      {/* Va justo despues de los documentos: es donde el asesor acaba de ver
          lo que falta y donde tiene sentido reclamarselo. */}
      <RecordatorioEstancia id={idSolicitud} docs={docs} onCambio={cargar} />
      <DeadlineEstancia id={idSolicitud} />
      <AcompanantesAdmin idSolicitud={idSolicitud} exp={exp} numero="3" />
      <CerrarCarpeta id={idSolicitud} exp={exp} docs={docs} onHecho={cargar} />
      <PasarAAbogada id={idSolicitud} exp={exp} onHecho={cargar} />
      <GeneradoresEstancia id={idSolicitud} exp={exp} onArchivado={cargar} />
      <Presentado id={idSolicitud} docs={docs} ext={ext} onCambio={cargar} />
      <Extranjeria id={idSolicitud} registros={ext} onCambio={cargar} />
    </div>
  );
}
