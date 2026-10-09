// src/pages/backoffice/solicitudes/components/InformeAdmin.jsx
//
// El informe de compatibilidad en Inspira Core: lo que propone el motor, la
// lista curada por el asesor, su revisión y la publicación al asesorado.
// Partido en piezas el 09/10/2026: el estado vive en
// informe-admin/useInformeAdmin.js y cada sección de la pantalla en su
// archivo de informe-admin/; aquí solo se ordenan. MasterRowAdmin se sigue
// exportando desde aquí porque pages/dev/MuestraUX.jsx lo importa con esta ruta.
import ModalMaster from "../../catalogo/ModalMaster";
import useInformeAdmin from "./informe-admin/useInformeAdmin";
import CabeceraRevision from "./informe-admin/CabeceraRevision";
import AvisoRecalculo from "./informe-admin/AvisoRecalculo";
import PdfManual from "./informe-admin/PdfManual";
import ControlesLista from "./informe-admin/ControlesLista";
import BannerEdicion from "./informe-admin/BannerEdicion";
import ParametrosCalculo from "./informe-admin/ParametrosCalculo";
import EstadosCompatibilidad from "./informe-admin/EstadosCompatibilidad";
import ListaVista from "./informe-admin/ListaVista";
import PanelRelacionados from "./informe-admin/PanelRelacionados";
import BuscadorMasters from "./informe-admin/BuscadorMasters";
import ListaEditable from "./informe-admin/ListaEditable";

export { default as MasterRowAdmin } from "./informe-admin/MasterRowAdmin";

// ── Main ──────────────────────────────────────────────────────────────────────

export default function InformeAdmin({ detalle, recargar, onRegenerado }) {
  const {
    subiendoInforme, compat, loadingCompat, editMode, setEditMode, listaEdit,
    searchQ, setSearchQ, guardando, publicando, showParams, setShowParams,
    searchResults, setSearchResults, searchingMasters, modoParecidos, setModoParecidos,
    nuevosCandidatos, setNuevosCandidatos, modalCrear, setModalCrear, catalogData,
    loadingCatalog, searchRef, revisando, revision,
    recalcular, aplicarRecalculo, volverAlAutomatico, buscarParecidos, entrarEdicion,
    moverArriba, moverAbajo, moverAPosicion, eliminarItem, quitarPorId, añadirItem,
    cambiarScore, abrirModalCrear, onMasterCreado, mandarARevision, resolverRevision,
    publicarInforme, guardarCurado, handleUploadInforme, manejarInformeAdmin,
    datos, loQuePidio, planLabel, filtros, FINALISTAS, listaVista, isCurado, extras,
    relacionados, idsEnLista, paramRows, showDropdown,
  } = useInformeAdmin({ detalle, recargar, onRegenerado });

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-0 -mx-5 -mt-4 overflow-hidden">

      {/* ── Revisar el informe generado ─────────────────────────── */}
      <CabeceraRevision
        detalle={detalle} revision={revision} loadingCompat={loadingCompat} compat={compat}
        listaVista={listaVista} FINALISTAS={FINALISTAS} extras={extras} isCurado={isCurado}
        planLabel={planLabel} filtros={filtros} recalcular={recalcular} loQuePidio={loQuePidio}
        searchingMasters={searchingMasters} editMode={editMode} listaEdit={listaEdit}
        entrarEdicion={entrarEdicion} buscarParecidos={buscarParecidos}
        volverAlAutomatico={volverAlAutomatico} guardando={guardando}
      />
      {nuevosCandidatos && (
        <AvisoRecalculo
          nuevosCandidatos={nuevosCandidatos} aplicarRecalculo={aplicarRecalculo}
          setNuevosCandidatos={setNuevosCandidatos}
        />
      )}


      {/* ── PDF manual ────────────────────────────────────────────── */}
      <PdfManual
        detalle={detalle} subiendoInforme={subiendoInforme}
        handleUploadInforme={handleUploadInforme} manejarInformeAdmin={manejarInformeAdmin}
      />

      {/* ── Modal crear máster ────────────────────────────────────── */}
      {modalCrear && catalogData && (
        <ModalMaster
          item={null}
          universidades={catalogData.universidades}
          comunidades={catalogData.comunidades}
          ramas={catalogData.ramas}
          onClose={() => setModalCrear(false)}
          onSaved={onMasterCreado}
        />
      )}

      {/* ── Compatibilidad automática ─────────────────────────────── */}
      <div className="px-5 pt-4 pb-5">

        {/* Header controles */}
        <ControlesLista
          editMode={editMode} loadingCompat={loadingCompat} abrirModalCrear={abrirModalCrear}
          loadingCatalog={loadingCatalog} entrarEdicion={entrarEdicion} listaVista={listaVista}
          detalle={detalle} revision={revision} mandarARevision={mandarARevision}
          revisando={revisando} resolverRevision={resolverRevision}
          publicarInforme={publicarInforme} publicando={publicando} setEditMode={setEditMode}
          setSearchQ={setSearchQ} setSearchResults={setSearchResults} guardarCurado={guardarCurado}
          guardando={guardando}
        />

        {/* Banner modo edición */}
        {editMode && (
          <BannerEdicion listaEdit={listaEdit} FINALISTAS={FINALISTAS} />
        )}

        {/* Parámetros colapsables */}
        {datos && !editMode && (
          <ParametrosCalculo showParams={showParams} setShowParams={setShowParams} paramRows={paramRows} />
        )}

        <EstadosCompatibilidad loadingCompat={loadingCompat} compat={compat} />

        {/* Vista normal */}
        {!loadingCompat && !editMode && listaVista.length > 0 && (
          <ListaVista listaVista={listaVista} FINALISTAS={FINALISTAS} />
        )}

        {!loadingCompat && (
          <PanelRelacionados
            grupos={relacionados}
            editMode={editMode}
            idsEnLista={idsEnLista}
            onAñadir={(r) => añadirItem(r, { foco: false })}
            onQuitar={quitarPorId}
            onEntrarEdicion={entrarEdicion}
          />
        )}

        {/* Modo edición */}
        {!loadingCompat && editMode && (
          <div className="space-y-3">

            <BuscadorMasters
              buscarParecidos={buscarParecidos} searchingMasters={searchingMasters}
              loQuePidio={loQuePidio} searchRef={searchRef} searchQ={searchQ}
              setSearchQ={setSearchQ} setModoParecidos={setModoParecidos}
              setSearchResults={setSearchResults} showDropdown={showDropdown}
              searchResults={searchResults} modoParecidos={modoParecidos} añadirItem={añadirItem}
              abrirModalCrear={abrirModalCrear} loadingCatalog={loadingCatalog}
            />

            {/* Lista editable */}
            <ListaEditable
              listaEdit={listaEdit} FINALISTAS={FINALISTAS} moverArriba={moverArriba}
              moverAbajo={moverAbajo} eliminarItem={eliminarItem} moverAPosicion={moverAPosicion}
              cambiarScore={cambiarScore}
            />
          </div>
        )}
      </div>
    </div>
  );
}
