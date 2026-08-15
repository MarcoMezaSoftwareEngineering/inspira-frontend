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

function UsuariosInternosTab() {
  const { user: usuarioActual } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  function resetForm() {
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

    resetForm();
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

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-primary">Usuarios internos</h1>

      <UsuariosForm
        form={form}
        onChange={onChange}
        onSubmit={onSubmit}
        saving={saving}
        editingId={editingId}
        onCancelEdit={resetForm}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o email…"
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="todos">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="asesor">Asesor</option>
          <option value="soporte">Soporte</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Solo activos</option>
          <option value="inactivos">Solo inactivos</option>
        </select>
      </div>

      <UsuariosTable
        usuarios={usuariosFiltrados}
        loading={loading}
        onToggleActivo={toggleActivo}
        onEditClick={startEdit}
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
