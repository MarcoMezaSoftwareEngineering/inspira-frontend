// src/pages/backoffice/panel-asesoras/partes/ListaClientes.jsx
import { keyFor } from "./utilidades";
import { ClienteCard } from "./ClienteCard";
import { Paginacion } from "./Paginacion";

export function ListaClientes({ loading, visible, pageVisible, safePage, totalPages, expandedKey, setExpandedKey, openRowMenu, setPanelPage }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[13px] font-bold text-neutral-700">Clientes</span>
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{pageVisible.length} visibles</span>
        </div>
        <span className="text-[11px] text-neutral-400">Pág. {safePage}/{totalPages} · {visible.length} clientes</span>
      </div>

      {loading ? (
        <div className="text-center text-sm text-neutral-400 py-10">Cargando…</div>
      ) : visible.length === 0 ? (
        <div className="text-center text-sm text-neutral-400 py-10">Sin resultados</div>
      ) : (
        <div>
          {pageVisible.map(c => {
            const key = keyFor(c);
            return (
              <ClienteCard
                key={key}
                c={c}
                isExp={expandedKey === key}
                onToggle={() => setExpandedKey(expandedKey === key ? null : key)}
                onMenu={e => openRowMenu(e, c)}
              />
            );
          })}
        </div>
      )}

      {!loading && visible.length > 0 && totalPages > 1 && (
        <Paginacion visible={visible} pageVisible={pageVisible} safePage={safePage} totalPages={totalPages} setPanelPage={setPanelPage} />
      )}
    </div>
  );
}
