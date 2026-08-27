// src/pages/panel/components/PanelSidebar.jsx
import SidebarItem from "./SidebarItem";
import { useAuth } from "../../../context/AuthContext";
import { navigate } from "../../../services/navigate";

export default function PanelSidebar({
  user, activeTab, onChangeTab, isOpen, onClose,
  tieneSolicitudes, tieneEstancia, tieneModificatoria,
}) {
  const { logout } = useAuth();

  const inicial = user?.nombre?.[0] || user?.email_contacto?.[0] || "U";
  const nombre = user?.nombre || "Mi panel Inspira";
  const correo = user?.email_contacto || "";

  return (
    <aside
      className={[
        "flex flex-col overflow-hidden flex-none",
        "fixed inset-y-0 left-0 z-30 w-72 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:z-auto md:translate-x-0 md:w-60 md:h-screen",
      ].join(" ")}
      style={{ background: "linear-gradient(160deg, #1A3557 0%, #1D6A4A 100%)" }}
    >
      {/* Botón cerrar en móvil */}
      <div className="md:hidden flex justify-end px-4 pt-4 shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white text-base leading-none"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      {/* Logo */}
      <div className="px-5 pt-5 pb-2 shrink-0">
        <p className="font-serif text-[18px] font-bold text-white tracking-tight leading-none">
          inspir<span className="text-[#F5C842]">a</span>
          <span className="text-white/60 text-[11px] font-normal ml-1.5 tracking-widest uppercase font-mono">legal</span>
        </p>
      </div>

      {/* Header usuario */}
      <div className="px-4 pt-2 pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-sm font-bold shrink-0 uppercase font-serif">
            {inicial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold truncate leading-snug text-white" title={nombre}>{nombre}</span>
            <span className="text-[11px] text-white/55 truncate leading-snug mt-1" title={correo}>{correo}</span>
          </div>
        </div>
      </div>

      {/* Menú */}
      <div className="flex-1 px-3 py-4 overflow-y-auto min-h-0">

        {/* Sección principal */}
        <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/35 px-3 mb-1.5 font-mono">
          Mi cuenta
        </p>
        <SidebarItem
          icon="👤"
          label="Perfil"
          active={activeTab === "perfil"}
          onClick={() => onChangeTab("perfil")}
        />
        <SidebarItem
          icon="📁"
          label="Mis servicios"
          active={activeTab === "servicios"}
          onClick={() => onChangeTab("servicios")}
        />

        {/* Sección recursos — solo si tiene al menos una solicitud */}
        {tieneSolicitudes && (
          <>
            <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/35 px-3 mt-4 mb-1.5 font-mono">
              Recursos Inspira
            </p>
            <SidebarItem
              icon="🎓"
              label="Becas España"
              active={activeTab === "becas"}
              onClick={() => onChangeTab("becas")}
            />
            <SidebarItem
              icon="📖"
              label="Guía Máster"
              active={activeTab === "guia"}
              onClick={() => onChangeTab("guia")}
            />
            <SidebarItem
              icon="📜"
              label="Guía Apostilla"
              active={activeTab === "apostilla"}
              onClick={() => onChangeTab("apostilla")}
            />
            {/* Sólo para quien tiene el servicio: al resto no le dice nada. */}
            {tieneEstancia && (
              <SidebarItem
                icon="🇪🇸"
                label="Guía Estancia"
                active={activeTab === "estancia"}
                onClick={() => onChangeTab("estancia")}
              />
            )}
            {tieneModificatoria && (
              <SidebarItem
                icon="💼"
                label="Guía Residencia y Trabajo"
                active={activeTab === "modificatoria"}
                onClick={() => onChangeTab("modificatoria")}
              />
            )}
          </>
        )}
      </div>

      {/* Acciones inferiores */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1 shrink-0">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full text-left text-[12px] px-3 py-2.5 rounded-[9px] text-white/65 hover:bg-white/10 hover:text-white transition font-medium flex items-center gap-2"
        >
          <span>←</span> Volver al inicio
        </button>
        <button
          type="button"
          onClick={logout}
          className="w-full text-left text-[12px] px-3 py-2.5 rounded-[9px] text-white/65 hover:bg-red-500/60 hover:text-white transition font-medium flex items-center gap-2"
        >
          <span>⊗</span> Cerrar sesión
        </button>
        <p className="text-[10px] text-white/25 px-3 pt-1 font-mono">inspira-legal.cloud</p>
      </div>
    </aside>
  );
}
