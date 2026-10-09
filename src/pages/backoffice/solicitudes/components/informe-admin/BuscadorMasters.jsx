// Modo edición: buscar parecidos a lo que pidió, el buscador del catálogo
// completo y crear un máster que no está en el catálogo.
import { scoreChip } from "./utilidades";

export default function BuscadorMasters({
  buscarParecidos, searchingMasters, loQuePidio, searchRef, searchQ, setSearchQ, setModoParecidos,
  setSearchResults, showDropdown, searchResults, modoParecidos, añadirItem, abrirModalCrear,
  loadingCatalog,
}) {
  return (
    <>
      {/* Parecidos a lo que el asesorado escribió que busca */}
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={() => buscarParecidos()} disabled={searchingMasters}
          className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#EEF2F8] text-[#1A3557] border border-[#1A3557]/20 hover:bg-[#e2e8f3] disabled:opacity-50 transition">
          ≈ Buscar parecidos a lo que pidió
        </button>
        <span className="text-[10.5px] text-neutral-400 truncate">
          {loQuePidio || "El asesorado no escribió qué máster busca."}
        </span>
      </div>

      {/* Buscador libre */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {searchingMasters ? (
            <svg className="w-3.5 h-3.5 text-[#1D6A4A] animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        <input
          ref={searchRef}
          type="text"
          value={searchQ}
          onChange={(e) => { setSearchQ(e.target.value); setModoParecidos(false); }}
          placeholder="Buscar cualquier máster del catálogo…"
          className="w-full text-xs pl-8 pr-8 py-2.5 border border-neutral-200 rounded-xl outline-none focus:border-[#1D6A4A] focus:ring-2 focus:ring-[#1D6A4A]/10 bg-white transition-all duration-200"
        />
        {searchQ && (
          <button onClick={() => { setSearchQ(""); setSearchResults([]); setModoParecidos(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center transition-colors duration-150">
            <svg className="w-2.5 h-2.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Dropdown resultados */}
        {showDropdown && !searchingMasters && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="px-3 py-2 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
              </p>
              <p className="text-[10px] text-neutral-400">{modoParecidos ? "Parecidos a lo que pidió · sin filtros" : "Catálogo completo"}</p>
            </div>
            {searchResults.map((r) => (
              <button key={r.master.id_master} type="button" onClick={() => añadirItem(r)}
                className="w-full text-left px-3 py-2.5 hover:bg-[#E8F5EE] transition-colors duration-150 border-b border-neutral-50 last:border-0 group">
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 group-hover:text-[#1D6A4A] transition-colors leading-tight">
                      {r.master.nombre_limpio}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                      {r.master.universidad.nombre_completo}
                      {r.master.universidad.ciudad ? ` · ${r.master.universidad.ciudad}` : ""}
                      {r.master.universidad.comunidad ? ` · ${r.master.universidad.comunidad?.nombre ?? r.master.universidad.comunidad}` : ""}
                    </p>
                    {r.master.coincide_con && (
                      <p className="text-[10.5px] text-[#1D6A4A] mt-0.5 truncate">≈ «{r.master.coincide_con}»</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${scoreChip(r.score)}`}>
                    {r.score != null ? `${r.score}%` : "—"}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-[#1D6A4A] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {showDropdown && !searchingMasters && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 px-4 py-4 text-center">
            <p className="text-xs text-neutral-400 mb-2">
              Sin resultados para <span className="font-semibold text-neutral-600">"{searchQ}"</span>
            </p>
            <button type="button" onClick={abrirModalCrear} disabled={loadingCatalog}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D6A4A] text-white text-xs font-semibold hover:bg-[#175a3d] transition disabled:opacity-50">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {loadingCatalog ? "Cargando…" : "Crear nuevo máster"}
            </button>
          </div>
        )}
      </div>

      {/* Crear nuevo máster si no está en el catálogo */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-neutral-400">¿No está en el catálogo?</p>
        <button type="button" onClick={abrirModalCrear} disabled={loadingCatalog}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1D6A4A] hover:underline disabled:opacity-50 transition">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {loadingCatalog ? "Cargando…" : "Crear nuevo máster"}
        </button>
      </div>
    </>
  );
}
