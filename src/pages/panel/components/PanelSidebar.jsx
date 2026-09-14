// src/pages/panel/components/PanelSidebar.jsx
//
// El menú del asesorado: ocho entradas como mucho (14/09/2026). Mi expediente,
// Mi ruta, Mis servicios (con sus expedientes colgando), Perfil y, según lo
// contratado, Mis guías y Becas España.
//
// Las guías eran cinco entradas sueltas (Mis guías, Guía Máster, Guía
// Apostilla, Guía Estancia, Guía Residencia y Trabajo) más un segundo «Mis
// guías» en el pie. Ahora son una sola entrada y, dentro, una pestaña por guía
// (MisGuias.jsx); cada guía conserva su URL.
import SidebarItem from "./SidebarItem";
import Avatar from "../../../components/common/Avatar";
import Icono from "../../../components/common/Icono";
import { datosUsuario } from "../../../components/common/usuario";
import { useAuth } from "../../../context/AuthContext";
import { navigate } from "../../../services/navigate";
import logo from "../../../assets/images/logo.png";
import { recorta } from "../pendientes";
import { CLAVES_GUIAS } from "../servicios";

// Tope de entradas del menú, contando los expedientes que cuelgan de «Mis servicios».
const MAX_ENTRADAS = 8;

export default function PanelSidebar({
  user, activeTab, onChangeTab, isOpen, onClose, accesos,
  pendientes = 0, servicios = [], idServicioActivo = null, onAbrirServicio, onTour, guias = [],
}) {
  // Qué recursos le corresponden lo decide servicios.js; aquí solo se pintan.
  // A quien no tiene nada contratado no le sale ninguno, y a quien entra
  // invitado a un expediente ajeno tampoco: las guías son del titular.
  const conRuta = servicios.length > 0;
  const conGuias = guias.length > 0;
  const conBecas = Boolean(accesos?.has("becas"));
  const fijas = 3 + Number(conRuta) + Number(conGuias) + Number(conBecas);
  // Los expedientes, por nombre, como accesos directos: los que quepan sin
  // pasar de ocho entradas, y cuatro como mucho. Todos están en «Mis servicios».
  const directos = servicios.slice(0, Math.max(0, Math.min(4, MAX_ENTRADAS - fijas)));
  const enGuias = CLAVES_GUIAS.includes(activeTab);
  const { logout } = useAuth();
  const { nombre, iniciales, correo, foto } = datosUsuario(user);

  return (
    <aside
      className={[
        "pnl pnl-side flex flex-col overflow-hidden flex-none",
        "fixed inset-y-0 left-0 z-30 w-72 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:z-auto md:translate-x-0 md:w-64 md:h-dvh",
      ].join(" ")}
    >
      {/* Cerrar, solo en móvil */}
      <div className="md:hidden flex justify-end px-4 pt-4 shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white text-base leading-none"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      {/* El logotipo de verdad, el mismo del nav. Antes era la palabra
          "inspira" recompuesta con dos <span> y una tipografía distinta, así
          que la marca no coincidía con la de la portada. */}
      <div className="px-4 pt-5 pb-4 shrink-0">
        <div className="pnl-side-logo">
          <img src={logo} alt="Inspira Legal" />
        </div>
      </div>

      <div className="pnl-side-user shrink-0">
        <Avatar foto={foto} iniciales={iniciales} nombre={nombre} size={38} />
        <div className="pnl-side-user-datos">
          <span className="pnl-side-nombre" title={nombre}>{nombre}</span>
          {correo && <span className="pnl-side-correo" title={correo}>{correo}</span>}
        </div>
      </div>

      <nav className="flex-1 px-3 pb-4 overflow-y-auto min-h-0" data-tour="menu">
        <p className="pnl-side-grupo">Mi cuenta</p>
        <SidebarItem
          icono="panel"
          label="Mi expediente"
          badge={pendientes}
          active={activeTab === "inicio"}
          onClick={() => onChangeTab("inicio")}
        />
        {conRuta && (
          <SidebarItem
            icono="avion"
            label="Mi ruta"
            active={activeTab === "ruta"}
            onClick={() => onChangeTab("ruta")}
          />
        )}
        <SidebarItem
          icono="maletin"
          label="Mis servicios"
          active={activeTab === "servicios" && !idServicioActivo}
          onClick={() => onChangeTab("servicios")}
        />
        {directos.map((s) => (
          <SidebarItem
            key={s.id_solicitud}
            sub
            icono="documento"
            label={recorta(s.invitado ? `De ${s.titular}` : s.titulo, 30)}
            active={idServicioActivo === s.id_solicitud}
            onClick={() => onAbrirServicio?.(s.id_solicitud)}
          />
        ))}
        <SidebarItem
          icono="usuario"
          label="Perfil"
          active={activeTab === "perfil"}
          onClick={() => onChangeTab("perfil")}
        />

        {(conGuias || conBecas) && (
          <>
            <p className="pnl-side-grupo">Recursos Inspira</p>
            {/* Una sola entrada para todas las guías: abre la primera que le
                toca y, si ya está en una, se queda en ella. */}
            {conGuias && (
              <SidebarItem
                icono="mapa"
                label="Mis guías"
                active={enGuias}
                onClick={() => onChangeTab(enGuias ? activeTab : guias[0].clave)}
              />
            )}
            {conBecas && (
              <SidebarItem
                icono="birrete"
                label="Becas España"
                active={activeTab === "becas"}
                onClick={() => onChangeTab("becas")}
              />
            )}
          </>
        )}
      </nav>

      <div className="pnl-side-pie px-3 py-4 shrink-0">
        {onTour && (
          <button type="button" onClick={onTour} className="pnl-item">
            <Icono nombre="brujula" size={16} />
            ¿Cómo funciona?
          </button>
        )}
        <button type="button" onClick={() => navigate("/")} className="pnl-item">
          <Icono nombre="casa" size={16} />
          Volver al inicio
        </button>
        <button type="button" onClick={logout} className="pnl-item pnl-salir">
          <Icono nombre="salir" size={16} />
          Cerrar sesión
        </button>
        <p className="pnl-side-dominio">inspira-legal.cloud</p>
      </div>
    </aside>
  );
}
