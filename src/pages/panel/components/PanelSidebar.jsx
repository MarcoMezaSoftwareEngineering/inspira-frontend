// src/pages/panel/components/PanelSidebar.jsx
import SidebarItem from "./SidebarItem";
import Avatar from "../../../components/common/Avatar";
import Icono from "../../../components/common/Icono";
import { datosUsuario } from "../../../components/common/usuario";
import { useAuth } from "../../../context/AuthContext";
import { navigate } from "../../../services/navigate";
import logo from "../../../assets/images/logo.png";

// Cada recurso, con la etiqueta y el icono con los que aparece en el menú.
// El orden es el de la lista; se enseñan los que estén en `accesos`.
const RECURSOS = [
  { clave: "becas", icono: "birrete", label: "Becas España" },
  { clave: "guia", icono: "libro", label: "Guía Máster" },
  { clave: "apostilla", icono: "documento", label: "Guía Apostilla" },
  { clave: "estancia", icono: "bandera", label: "Guía Estancia" },
  { clave: "modificatoria", icono: "laptop", label: "Guía Residencia y Trabajo" },
];

export default function PanelSidebar({
  user, activeTab, onChangeTab, isOpen, onClose, accesos,
}) {
  // Qué recursos le corresponden por sus servicios. Lo decide servicios.js:
  // aquí solo se pintan. A quien no tiene nada contratado no le sale ninguno.
  const visibles = RECURSOS.filter((r) => accesos?.has(r.clave));
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

      <nav className="flex-1 px-3 pb-4 overflow-y-auto min-h-0">
        <p className="pnl-side-grupo">Mi cuenta</p>
        <SidebarItem
          icono="usuario"
          label="Perfil"
          active={activeTab === "perfil"}
          onClick={() => onChangeTab("perfil")}
        />
        <SidebarItem
          icono="maletin"
          label="Mis servicios"
          active={activeTab === "servicios"}
          onClick={() => onChangeTab("servicios")}
        />

        {/* Recursos: los que abre cada servicio contratado, y ninguno más.
            Quien entra invitado a un expediente ajeno no ve ninguno: las guías
            son del titular, él viene a ayudar con un trámite concreto. */}
        {visibles.length > 0 && (
          <>
            <p className="pnl-side-grupo">Recursos Inspira</p>
            {visibles.map((r) => (
              <SidebarItem
                key={r.clave}
                icono={r.icono}
                label={r.label}
                active={activeTab === r.clave}
                onClick={() => onChangeTab(r.clave)}
              />
            ))}
          </>
        )}
      </nav>

      <div className="pnl-side-pie px-3 py-4 shrink-0">
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
