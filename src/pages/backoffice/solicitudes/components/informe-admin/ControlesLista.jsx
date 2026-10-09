// Cabecera de «Lista del informe»: nuevo máster, modificar, revisión y
// publicación; en edición, cancelar y guardar la curaduría.
export default function ControlesLista({
  editMode, loadingCompat, abrirModalCrear, loadingCatalog, entrarEdicion, listaVista, detalle,
  revision, mandarARevision, revisando, resolverRevision, publicarInforme, publicando, setEditMode,
  setSearchQ, setSearchResults, guardarCurado, guardando,
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
      <p className="ex-sub" style={{ margin: 0 }}>Lista del informe</p>
      <div className="flex gap-1.5 shrink-0">
        {!editMode ? (
          <>
            {!loadingCompat && (
              <>
                <button onClick={abrirModalCrear} disabled={loadingCatalog}
                  className="ex-btn sec">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {loadingCatalog ? "Cargando…" : "Nuevo máster"}
                </button>
                <button onClick={entrarEdicion}
                  className="ex-btn sec">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modificar lista
                </button>
              </>
            )}
            {listaVista.length > 0 && !detalle.informe_publicado
              && ["BORRADOR", "DEVUELTO"].includes(revision) && (
              <button onClick={mandarARevision} disabled={revisando}
                className="ex-btn sec">
                {revisando ? "Avisando…" : "Mandar a revisión"}
              </button>
            )}

            {listaVista.length > 0 && revision === "EN_REVISION" && (
              <>
                <button onClick={() => resolverRevision("APROBADO")} disabled={revisando}
                  className="ex-btn">
                  Aprobar
                </button>
                <button onClick={() => resolverRevision("DEVUELTO")} disabled={revisando}
                  className="ex-btn sec">
                  Devolver
                </button>
              </>
            )}

            {listaVista.length > 0 && (
              <button onClick={publicarInforme} disabled={publicando}
                className="ex-btn">
                {publicando ? (
                  <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                {detalle.informe_publicado ? "Volver a publicar" : "Publicar al cliente"}
              </button>
            )}
            {listaVista.length > 0 && !detalle.informe_publicado && revision !== "APROBADO" && (
              <span className="text-[10.5px] text-amber-700 leading-tight max-w-[220px]">
                Se puede publicar sin aprobación, pero queda anotado que salió sin revisar.
              </span>
            )}
          </>
        ) : (
          <>
            <button onClick={() => { setEditMode(false); setSearchQ(""); setSearchResults([]); }}
              className="text-[11px] px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all duration-200">
              Cancelar
            </button>
            <button onClick={guardarCurado} disabled={guardando}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#175a3d] transition-all duration-200 disabled:opacity-50 font-semibold">
              {guardando ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Guardando…
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar curaduría
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
