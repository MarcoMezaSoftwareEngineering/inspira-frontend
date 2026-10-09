// src/pages/backoffice/panel-asesoras/partes/Filtros.jsx
import { Search } from "lucide-react";
import { ESTADOS } from "./constantes";
import { estadoLabel } from "./utilidades";

export function Filtros({ search, setSearch, filterEstado, setFilterEstado, hayFiltros }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-3 flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="text" placeholder="Buscar cliente..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full h-10 border border-neutral-200 rounded-lg pl-9 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
        className="h-10 w-full sm:w-48 border border-neutral-200 rounded-lg px-3 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
        <option value="">Todos los estados</option>
        {ESTADOS.map(e => <option key={e} value={e}>{estadoLabel(e)}</option>)}
      </select>
      {hayFiltros && (
        <button onClick={() => { setSearch(""); setFilterEstado(""); }} className="h-10 px-3 text-[13px] text-neutral-500 hover:text-primary whitespace-nowrap">
          ✕ Limpiar filtros
        </button>
      )}
    </div>
  );
}
