// src/pages/backoffice/panel-asesoras/partes/MenuAcciones.jsx
// Menú contextual "···" de una fila. Se pinta con position: fixed donde lo
// coloca openRowMenu (usePanelAsesoras) y se cierra al hacer clic fuera.
import { Copy, Pencil, Trash2, Eye } from "lucide-react";
import { irAExpediente, copyValue, keyFor } from "./utilidades";

export function MenuAcciones({ menuClient, menuPos, setEditTarget, setAddMode, setMenuFor, setExpandedKey, setDelTarget }) {
  return (
    <div
      className="fixed z-[70] bg-white border border-neutral-200 rounded-xl shadow-2xl p-1.5 min-w-[190px]"
      style={{ top: menuPos.top, left: menuPos.left }}
      onClick={e => e.stopPropagation()}
    >
      <button onClick={() => { setEditTarget({ item: menuClient, svc: menuClient._svc }); setAddMode(false); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-neutral-700 hover:bg-neutral-50 text-left">
        <Pencil className="w-4 h-4 text-neutral-400" /> Editar datos del panel
      </button>
      <button onClick={() => { irAExpediente(menuClient._id); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-neutral-700 hover:bg-neutral-50 text-left">
        <Eye className="w-4 h-4 text-neutral-400" /> Abrir expediente #{menuClient._id}
      </button>
      <button onClick={() => { setExpandedKey(keyFor(menuClient)); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-neutral-700 hover:bg-neutral-50 text-left">
        <Eye className="w-4 h-4 text-neutral-400" /> Ver detalle
      </button>
      <button onClick={() => { copyValue(menuClient.name, "Nombre"); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-neutral-700 hover:bg-neutral-50 text-left">
        <Copy className="w-4 h-4 text-neutral-400" /> Copiar nombre
      </button>
      <div className="h-px bg-neutral-100 my-1" />
      <button onClick={() => { setDelTarget({ id: menuClient._id, svc: menuClient._svc, name: menuClient.name }); setMenuFor(null); }} className="w-full min-h-[38px] flex items-center gap-2.5 px-3 rounded-lg text-[13px] text-red-500 hover:bg-red-50 text-left">
        <Trash2 className="w-4 h-4" /> Eliminar cliente
      </button>
    </div>
  );
}
