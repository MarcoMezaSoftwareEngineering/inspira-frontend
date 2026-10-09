import { fechaHoraLarga } from "../../../../../../lib/formatos";

/**
 * El asesorado ha pedido revision.
 *
 * Va arriba del todo y en color: es una peticion con alguien esperando al otro
 * lado, no una notificacion mas.
 */
export default function RevisionPedida({ exp }) {
  if (!exp.revision_solicitada_at) return null;
  const cuando = fechaHoraLarga(exp.revision_solicitada_at);
  return (
    <div className="rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3 flex gap-3">
      <span className="shrink-0 text-[16px]">🔔</span>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-amber-900">
          Ha pedido revision de sus documentos
        </p>
        <p className="text-[11.5px] text-amber-700 mt-0.5">{cuando}</p>
        {exp.revision_nota && (
          <p className="text-[12.5px] text-amber-900 leading-relaxed mt-1.5">
            <b>Dice:</b> {exp.revision_nota}
          </p>
        )}
      </div>
    </div>
  );
}
