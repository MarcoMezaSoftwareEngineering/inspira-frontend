// src/pages/backoffice/panel-asesoras/partes/ModalesCliente.jsx
// Modales de alta y edición: los dos usan el mismo ClienteForm.
import { SVC_KEYS, SVC_LABELS } from "./constantes";
import { ModalWrapper } from "./ModalWrapper";
import { ClienteForm } from "./ClienteForm";

export function ModalAgregar({ addSvc, setAddSvc, setAddMode, saving, handleSaveNew }) {
  return (
    <ModalWrapper title="Nuevo cliente"
      onCancel={() => setAddMode(false)}
      header={
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SVC_KEYS.map(s => (
            <button key={s} onClick={() => setAddSvc(s)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                addSvc === s ? "border-green-400 bg-green-50 text-green-800 font-semibold" : "border-neutral-200 text-neutral-600"
              }`}>
              {SVC_LABELS[s]}
            </button>
          ))}
        </div>
      }>
      <ClienteForm
        key={addSvc}
        item={null}
        svc={addSvc}
        saving={saving}
        onSubmit={handleSaveNew}
        onCancel={() => setAddMode(false)}
      />
    </ModalWrapper>
  );
}

export function ModalEditar({ editTarget, setEditTarget, saving, handleSaveEdit }) {
  return (
    <ModalWrapper title={`Editar: ${editTarget.item.name}`}
      onCancel={() => setEditTarget(null)}>
      <ClienteForm
        item={editTarget.item}
        svc={editTarget.svc}
        saving={saving}
        onSubmit={handleSaveEdit}
        onCancel={() => setEditTarget(null)}
      />
    </ModalWrapper>
  );
}
