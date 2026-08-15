// src/pages/backoffice/settings/UsuariosSettings.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { useAuth } from "../context/AuthContext";
import TabView from "../layout/TabView";
import UsuariosForm from "./components/UsuariosForm";
import UsuariosTable from "./components/UsuariosTable";
import RolesPermisos from "./RolesPermisos";

const FORM_VACIO = {
  nombre: "",
  email: "",
  password: "",
  rol: "asesor",
  telefono: "",
  cargo: "",
};

const FILTROS_ESTADO = [
  { value: "todos", label: "Todos", activeClass: "bg-neutral-900 text-white" },
  { value: "activos", label: "Activos", activeClass: "bg-[#1A3557] text-white" },
  { value: "inactivos", label: "Inactivos", activeClass: "bg-neutral-700 text-white" },
];

const FILTROS_ROL = [
  { value: "todos", label: "Todos", activeClass: "bg-neutral-900 text-white" },
  { value: "admin", label: "Admin", activeClass: "bg-[#1A3557] text-white" },
  { value: "asesor", label: "Asesor", activeClass: "bg-primary text-white" },
  { value: "soporte", label: "Soporte", activeClass: "bg-amber-500 text-white" },
];

function ToggleGroup({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg border border-neutral-200 overflow-hidden text-xs shrink-0">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 transition-colors whitespace-nowrap ${i > 0 ? "border-l border-neutral-200" : ""} ${
            value === opt.value ? opt.activeClass : "bg-white text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const COLORS = {
    blue: "border-t-blue-500",
    green: "border-t-emerald-500",
    amber: "border-t-amber-500",
    navy: "border-t-[#1A3557]",
  };
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 border-t-4 ${COLORS[accent]} p-4 shadow-sm`}>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-['Fraunces'] text-3xl font-bold text-[#0d3320] leading-none">{value}</p>
    </div>
  );
}

function UsuariosInternosTab() {
  const { user: usuarioActual } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const cargar = useCallback(async () => {
    setLoading(true);
    const r = await boGET("/backoffice/usuarios");
    if (r.ok) setUsuarios(r.usuarios || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function openCrear() {
    setEditingId(null);
    setForm(FORM_VACIO);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(FORM_VACIO);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);

    let r;
    if (editingId) {
      const body = {
        nombre: form.nombre,
        email: form.email,
        rol: form.rol,
        telefono: form.telefono,
        cargo: form.cargo,
      };
      if (form.password) body.password = form.password;
      r = await boPOST(`/backoffice/usuarios/${editingId}`, body);
    } else {
      r = await boPOST("/backoffice/usuarios", form);
    }

    setSaving(false);

    if (!r.ok) {
      dialog.toast(
        r.msg ||
          (editingId ? "Error actualizando usuario" : "Error creando usuario"),
        "error"
      );
      return;
    }

    if (editingId) {
      setUsuarios((prev) =>
        prev.map((x) => (x.id_usuario === editingId ? r.usuario : x))
      );
      dialog.toast("Usuario actualizado", "success");
    } else {
      setUsuarios((prev) => [...prev, r.usuario]);
      dialog.toast("Usuario creado", "success");
    }

    closeForm();
  }

  function startEdit(u) {
    setEditingId(u.id_usuario);
    setForm({
      nombre: u.nombre || "",
      email: u.email || "",
      password: "",
      rol: u.rol || "asesor",
      telefono: u.telefono || "",
      cargo: u.cargo || "",
    });
    setFormOpen(true);
  }

  async function toggleActivo(u) {
    const esUnoMismo = u.id_usuario === usuarioActual?.id_usuario;
    const vaADesactivar = u.activo;

    if (vaADesactivar && (u.rol === "admin" || esUnoMismo)) {
      const mensaje = esUnoMismo
        ? "Vas a desactivar tu propia cuenta y se cerrará tu sesión. ¿Continuar?"
        : `Vas a desactivar a ${u.nombre}, que es administrador. ¿Continuar?`;
      const ok = await dialog.confirm(mensaje, "Confirmar desactivación");
      if (!ok) return;
    }

    const r = await boPOST(`/backoffice/usuarios/${u.id_usuario}/estado`, {
      activo: !u.activo,
    });

    if (!r.ok) {
      dialog.toast(r.msg || "Error actualizando estado", "error");
      return;
    }

    setUsuarios((prev) =>
      prev.map((x) => (x.id_usuario === u.id_usuario ? r.usuario : x))
    );
  }

  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (filtroRol !== "todos" && u.rol !== filtroRol) return false;
      if (filtroEstado === "activos" && !u.activo) return false;
      if (filtroEstado === "inactivos" && u.activo) return false;
      if (q && !(`${u.nombre} ${u.email}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  const totalActivos = usuarios.filter((u) => u.activo).length;
  const totalInactivos = usuarios.length - totalActivos;
  const totalAdmins = usuarios.filter((u) => u.rol === "admin").length;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Usuarios internos</h1>
          <p className="text-sm text-neutral-500">Staff con acceso al backoffice de Inspira.</p>
        </div>
        <button
          type="button"
          onClick={openCrear}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={usuarios.length} accent="navy" />
        <StatCard label="Activos" value={totalActivos} accent="green" />
        <StatCard label="Inactivos" value={totalInactivos} accent="amber" />
        <StatCard label="Admins" value={totalAdmins} accent="blue" />
      </div>

      {/* Buscador + filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o email…"
            className="w-full border border-neutral-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <ToggleGroup value={filtroEstado} onChange={setFiltroEstado} options={FILTROS_ESTADO} />
          <ToggleGroup value={filtroRol} onChange={setFiltroRol} options={FILTROS_ROL} />
        </div>
      </div>

      <p className="text-xs text-neutral-400">
        {loading ? "Cargando…" : `${usuariosFiltrados.length} de ${usuarios.length} usuarios`}
      </p>

      <UsuariosTable
        usuarios={usuariosFiltrados}
        loading={loading}
        onToggleActivo={toggleActivo}
        onEditClick={startEdit}
      />

      <UsuariosForm
        open={formOpen}
        form={form}
        onChange={onChange}
        onSubmit={onSubmit}
        onClose={closeForm}
        saving={saving}
        editingId={editingId}
      />
    </div>
  );
}

export default function UsuariosSettings() {
  return (
    <TabView
      tabs={[
        { label: "Usuarios internos", content: <UsuariosInternosTab /> },
        { label: "Roles y Permisos", content: <RolesPermisos /> },
      ]}
    />
  );
}
