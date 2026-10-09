// src/pages/backoffice/panel-asesoras/partes/Paginacion.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { pageList } from "./utilidades";

export function Paginacion({ visible, pageVisible, safePage, totalPages, setPanelPage }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 justify-between px-4 py-3 border-t border-neutral-100 bg-neutral-50/70">
      <span className="text-[12px] text-neutral-500">Mostrando <b className="text-neutral-700">{pageVisible.length}</b> de <b className="text-neutral-700">{visible.length}</b> clientes</span>
      <div className="flex items-center gap-1.5">
        <button disabled={safePage === 1} onClick={() => setPanelPage(p => p - 1)} className="w-9 h-9 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-white transition inline-flex items-center justify-center" aria-label="Página anterior">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pageList(safePage, totalPages).map((p, i) =>
          p === "…"
            ? <span key={`e${i}`} className="w-9 h-9 inline-flex items-center justify-center text-neutral-300 text-xs">…</span>
            : (
              <button key={p} onClick={() => setPanelPage(p)} className={`w-9 h-9 rounded-lg border text-[12px] font-bold transition ${p === safePage ? "bg-primary border-primary text-white" : "border-neutral-200 text-neutral-500 hover:bg-white"}`}>
                {p}
              </button>
            )
        )}
        <button disabled={safePage === totalPages} onClick={() => setPanelPage(p => p + 1)} className="w-9 h-9 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-white transition inline-flex items-center justify-center" aria-label="Página siguiente">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
