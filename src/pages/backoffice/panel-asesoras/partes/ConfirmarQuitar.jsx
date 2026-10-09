// src/pages/backoffice/panel-asesoras/partes/ConfirmarQuitar.jsx

export function ConfirmarQuitar({ delTarget, setDelTarget, handleDelete, saving }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-3 flex-wrap">
      <span className="flex-1 text-sm text-red-800">
        ¿Quitar a <b>{delTarget.name}</b> del panel? (la solicitud no se elimina)
      </span>
      <button onClick={() => setDelTarget(null)} className="h-9 px-3 text-[13px] border border-neutral-300 rounded-lg bg-white hover:bg-neutral-50">Cancelar</button>
      <button onClick={handleDelete} disabled={saving}
        className="h-9 px-3 text-[13px] rounded-lg bg-red-600 text-white font-semibold disabled:opacity-50 hover:bg-red-700">
        {saving ? "…" : "Sí, quitar"}
      </button>
    </div>
  );
}
