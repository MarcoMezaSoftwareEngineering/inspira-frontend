// «Revisar el informe generado»: estado de la revisión, las cuentas de la
// lista y los botones de recalcular, buscar parecidos y volver al automático.
import IconoPaso from "../../../../../components/common/IconoPaso";

export default function CabeceraRevision({
  detalle, revision, loadingCompat, compat, listaVista, FINALISTAS, extras, isCurado, planLabel,
  filtros, recalcular, loQuePidio, searchingMasters, editMode, listaEdit, entrarEdicion,
  buscarParecidos, volverAlAutomatico, guardando,
}) {
  return (
    <div className="px-5 pt-4">
      <div className="ex-h">
        <span className="ex-h-ico"><IconoPaso nombre="chart" /></span>
        <h3>Revisar el informe generado</h3>
        {detalle.informe_publicado ? (
          <span className="ex-est" data-e="ok"><IconoPaso nombre="check" /> Publicado</span>
        ) : revision === "EN_REVISION" ? (
          <span className="ex-est" data-e="on"><IconoPaso nombre="clock" /> En revisión</span>
        ) : revision === "APROBADO" ? (
          <span className="ex-est" data-e="ok"><IconoPaso nombre="check" /> Aprobado · listo para publicar</span>
        ) : revision === "DEVUELTO" ? (
          <span className="ex-est" data-e="warn" title={detalle.informe_revision_nota || ""}><IconoPaso nombre="alert" /> Devuelto · corregir</span>
        ) : (
          <span className="ex-est" data-e="warn"><IconoPaso nombre="edit" /> Sin publicar</span>
        )}
      </div>
      {!loadingCompat && compat && (
        <div className="ex-cuenta">
          <div><b>{compat.total ?? "—"}</b><span>compatibles</span></div>
          <div><b>{Math.min(listaVista.length, FINALISTAS)}</b><span>finalistas</span></div>
          <div><b>{extras}</b><span>extras</span></div>
          <div><b>{isCurado ? "curada" : "auto"}</b><span>lista</span></div>
          <div><b>{detalle.informe_publicado ? "sí" : "no"}</b><span>publicado</span></div>
        </div>
      )}
      <p className="ex-lead">
        El motor propone; usted decide. En cada máster: quitar, añadir, subir o bajar y una nota que el asesorado verá en su informe.
        Nada de esto se pierde al recalcular.
        {planLabel ? <> Plan: <b>{planLabel}</b>.</> : null}
        {filtros ? <> Filtros: {filtros}.</> : null}
      </p>
      <div className="ex-fila">
        <button type="button" onClick={recalcular} disabled={loadingCompat} className="ex-btn sec"
          title="Vuelve a calcular con el formulario de hoy. La lista curada no se toca.">
          <IconoPaso nombre="refresh" /> {loadingCompat ? "Calculando…" : "Recalcular con el formulario actual"}
        </button>
        {/* Los parecidos vivían sólo dentro del modo edición, así que quien
            no entraba a editar no llegaba a verlos nunca. Desde aquí se
            entra a editar y se buscan de una vez. */}
        {loQuePidio && (
          <button type="button" disabled={loadingCompat || searchingMasters} className="ex-btn plano"
            title={`Rastrea todo el catálogo sin filtros buscando: ${loQuePidio}`}
            onClick={() => { const base = editMode ? listaEdit : entrarEdicion(); buscarParecidos(base); }}>
            ≈ Buscar parecidos a lo que pidió
          </button>
        )}
        {detalle.informe_compat_curado && (
          <button type="button" onClick={volverAlAutomatico} disabled={loadingCompat || guardando} className="ex-btn plano">
            Volver al automático
          </button>
        )}
      </div>
      {loQuePidio && (
        <p className="text-[10.5px] text-neutral-400 mt-1.5">Pidió: {loQuePidio}</p>
      )}
    </div>
  );
}
