// src/pages/backoffice/panel-asesoras/PanelAsesoras.jsx
//
// Orquestador del Panel asesoras. El 09/10/2026 se partió en piezas sin
// cambiar nada de lo que se ve: el estado, la carga y las acciones viven en
// usePanelAsesoras.js; cada sección, en partes/ (las instantáneas de
// PanelAsesoras.test.jsx se tomaron antes de partirlo).
import { DriveToast } from "../driveToast";
import { usePanelAsesoras } from "./usePanelAsesoras";
import { MenuAcciones } from "./partes/MenuAcciones";
import { Cabecera } from "./partes/Cabecera";
import { PestanasServicio } from "./partes/PestanasServicio";
import { Metricas } from "./partes/Metricas";
import { Filtros } from "./partes/Filtros";
import { ModalAgregar, ModalEditar } from "./partes/ModalesCliente";
import { ConfirmarQuitar } from "./partes/ConfirmarQuitar";
import { ListaClientes } from "./partes/ListaClientes";

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════════════════ */
export default function PanelAsesoras() {
  const {
    data, loading, curTab, setCurTab, expandedKey, setExpandedKey,
    editTarget, setEditTarget, addMode, setAddMode, addSvc, setAddSvc,
    search, setSearch, filterEstado, setFilterEstado, saving,
    delTarget, setDelTarget, setPanelPage, menuPos, setMenuFor, driveToastState,
    visible, totalPages, safePage, pageVisible, tabCounts,
    act, noact, activar, pend, hayFiltros,
    handleDelete, handleSaveEdit, handleSaveNew, openRowMenu, menuClient,
  } = usePanelAsesoras();

  /* ─── Render ─── */
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <DriveToast state={driveToastState} />

      {/* ── Menú contextual "···" ── */}
      {menuClient && (
        <MenuAcciones
          menuClient={menuClient}
          menuPos={menuPos}
          setEditTarget={setEditTarget}
          setAddMode={setAddMode}
          setMenuFor={setMenuFor}
          setExpandedKey={setExpandedKey}
          setDelTarget={setDelTarget}
        />
      )}

      {/* Header */}
      <Cabecera data={data} setAddMode={setAddMode} setEditTarget={setEditTarget} />

      {/* Tabs de servicio */}
      <PestanasServicio curTab={curTab} setCurTab={setCurTab} setExpandedKey={setExpandedKey} tabCounts={tabCounts} />

      {/* Métricas */}
      <Metricas visible={visible} act={act} noact={noact} activar={activar} pend={pend} />

      {/* Filtros */}
      <Filtros
        search={search}
        setSearch={setSearch}
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        hayFiltros={hayFiltros}
      />

      {/* Modal agregar */}
      {addMode && (
        <ModalAgregar addSvc={addSvc} setAddSvc={setAddSvc} setAddMode={setAddMode} saving={saving} handleSaveNew={handleSaveNew} />
      )}

      {/* Modal editar */}
      {editTarget && (
        <ModalEditar editTarget={editTarget} setEditTarget={setEditTarget} saving={saving} handleSaveEdit={handleSaveEdit} />
      )}

      {/* Confirmación eliminar */}
      {delTarget && (
        <ConfirmarQuitar delTarget={delTarget} setDelTarget={setDelTarget} handleDelete={handleDelete} saving={saving} />
      )}

      {/* Lista */}
      <ListaClientes
        loading={loading}
        visible={visible}
        pageVisible={pageVisible}
        safePage={safePage}
        totalPages={totalPages}
        expandedKey={expandedKey}
        setExpandedKey={setExpandedKey}
        openRowMenu={openRowMenu}
        setPanelPage={setPanelPage}
      />
    </div>
  );
}
