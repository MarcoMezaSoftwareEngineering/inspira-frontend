/* Modal cancelación — doble confirmación */
export default function ModalCancelacion({
  cancelModal, cancelStep, setCancelStep, cancelReason, setCancelReason,
  cancelling, closeCancelModal, handleCancel,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {cancelStep === 1 && (
          <>
            <div className="bg-amber-50 border-b border-amber-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-lg">⚠️</span>
                <h3 className="text-base font-semibold text-neutral-800">Cancelar reunión</h3>
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Cliente: <span className="font-medium text-neutral-700">{cancelModal.clientName}</span>
              </p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <label className="text-xs font-medium text-neutral-600 block">Motivo de cancelación</label>
              <textarea
                className="w-full border border-neutral-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary transition-colors"
                rows={3} placeholder="Ej: Reagendamiento solicitado por el equipo..."
                value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} autoFocus />
              <p className="text-xs text-neutral-400">Este mensaje se enviará automáticamente al cliente por email.</p>
            </div>
            <div className="flex gap-2 px-6 pb-5 justify-end">
              <button onClick={closeCancelModal}
                className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg border border-neutral-200">Volver</button>
              <button onClick={() => setCancelStep(2)}
                className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium">Continuar →</button>
            </div>
          </>
        )}
        {cancelStep === 2 && (
          <>
            <div className="bg-red-50 border-b border-red-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-lg">🚨</span>
                <h3 className="text-base font-semibold text-neutral-800">Confirmación final</h3>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
                <p className="font-semibold mb-1">Esta acción no se puede deshacer.</p>
                <p>Se cancelará la reunión con <span className="font-medium">{cancelModal.clientName}</span> y Calendly le enviará un aviso por email.</p>
              </div>
              {cancelReason.trim() && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm text-neutral-600">
                  <span className="text-xs font-medium text-neutral-400 block mb-1">Motivo que se enviará:</span>
                  {cancelReason}
                </div>
              )}
            </div>
            <div className="flex gap-2 px-6 pb-5 justify-end">
              <button onClick={() => setCancelStep(1)}
                className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg border border-neutral-200">← Atrás</button>
              <button onClick={handleCancel} disabled={cancelling}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50">
                {cancelling ? "Cancelando..." : "Sí, cancelar definitivamente"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
