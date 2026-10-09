// src/pages/backoffice/panel-asesoras/partes/ModalWrapper.jsx

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL WRAPPER
═══════════════════════════════════════════════════════════════════════════ */
export function ModalWrapper({ title, onCancel, header, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl p-6 space-y-4 max-h-[92dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-neutral-800 text-base">{title}</h3>
            {header}
          </div>
          <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none w-11 h-11 flex items-center justify-center -mr-2 -mt-1 shrink-0">×</button>
        </div>
        <div className="border-t border-neutral-100 pt-3">{children}</div>
      </div>
    </div>
  );
}
