// Panel del asesor para la modificación de estudios a residencia por trabajo.
//
// Arriba, las tres condiciones del precontrato: son lo que extranjería mira
// antes que nada y, si alguna falla, no hay expediente que valga. Debajo, la
// ficha completa —la persona, su domicilio, la empresa, el contrato y el
// centro de trabajo— con cada campo en su sitio.
//
// Empieza por el punto 0 —dónde está el expediente— porque es lo primero que
// necesita saber quien lo abre: qué le toca hacer ahora.
//
// Los documentos van como checklist con aprobar y observar, no como listado:
// que un documento esté subido no significa que sirva. Extranjería devuelve
// los que no cumplen, así que alguien tiene que mirarlos antes de presentar y
// el asesorado tiene que saber si el suyo pasó.
//
// 09/10/2026: el archivo tenía 1.376 líneas con todo dentro. Se partió sin
// cambiar el HTML (lo vigilan las instantáneas de ModificatoriaAdmin.test.jsx);
// las piezas están en modificatoria-admin/:
//   useModificatoriaAdmin.js  carga del expediente, documentos y extranjería
//   constantes.js             tonos, clases, estados de documento y apartados
//   utilidades.js             lectura de números escritos (puras)
//   RevisionPedida, Flujo (0), Datos (1, con Condiciones y CamposFicha),
//   Documentos (2, con FilaDocumento, Observacion, AvisoDrive y
//   AvisoObservaciones), CerrarCarpeta (3), Presentado (4), Extranjeria (5)
import Invitados from "../Invitados";
import GeneradoresModificatoria from "./GeneradoresModificatoria";
import RecordatorioModificatoria from "./RecordatorioModificatoria";
import useModificatoriaAdmin from "./modificatoria-admin/useModificatoriaAdmin";
import RevisionPedida from "./modificatoria-admin/RevisionPedida";
import Flujo from "./modificatoria-admin/Flujo";
import Datos from "./modificatoria-admin/Datos";
import Documentos from "./modificatoria-admin/Documentos";
import CerrarCarpeta from "./modificatoria-admin/CerrarCarpeta";
import Presentado from "./modificatoria-admin/Presentado";
import Extranjeria from "./modificatoria-admin/Extranjeria";

/* ── Principal ───────────────────────────────────────────────────────────── */

export default function ModificatoriaAdmin({ idSolicitud }) {
  const { exp, docs, ext, guardando, cargar, guardar } = useModificatoriaAdmin(idSolicitud);

  if (!exp) return <p className="text-[13px] text-neutral-400 py-6">Cargando el expediente…</p>;

  return (
    <div className="space-y-3">
      <RevisionPedida exp={exp} />
      <Flujo revision={exp.revision} guardando={guardando}
        onCambiar={(estado_proceso) => guardar({ estado_proceso })} />
      <Invitados idSolicitud={idSolicitud} numero="0b" />
      <Datos exp={exp} onGuardar={guardar} />
      <Documentos id={idSolicitud} docs={docs} onCambio={cargar} />
      <RecordatorioModificatoria id={idSolicitud} docs={docs} onCambio={cargar} />
      <CerrarCarpeta id={idSolicitud} exp={exp} docs={docs} onHecho={cargar} />
      
      <GeneradoresModificatoria id={idSolicitud} exp={exp} onArchivado={cargar} />
      <Presentado id={idSolicitud} docs={docs} ext={ext} onCambio={cargar} />
      <Extranjeria id={idSolicitud} registros={ext} onCambio={cargar} />
    </div>
  );
}
