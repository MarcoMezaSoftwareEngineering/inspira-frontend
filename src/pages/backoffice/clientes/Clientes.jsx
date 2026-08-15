// src/pages/backoffice/clientes/Clientes.jsx
import { useEffect, useRef, useState } from "react";
import { boGET, boPOST, boPUT } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import ClientesTable from "./ClientesTable";
import ClienteForm from "./ClienteForm";
import ServiciosClienteModal from "./ServiciosClienteModal";
import PerfilClienteModal from "./PerfilClienteModal";
import { useAuth } from "../context/AuthContext";

const FORM_INICIAL = {
  id_cliente: null,
  nombre: "",
  email_contacto: "",
  telefono: "",
  dni: "",
  pasaporte: "",
  pais_origen: "",
  canal_origen: "",
  activo: true,
};

function Toast({ msg, tipo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const cls =
    tipo === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-emerald-50 border-emerald-200 text-emerald-700";

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm ${cls}`}
    >
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(FORM_INICIAL);
  const [modo, setModo] = useState("nuevo");
  const [showModal, setShowModal] = useState(false);
  const [clienteServicios, setClienteServicios] = useState(null);
  const [clientePerfil, setClientePerfil] = useState(null);
  const [toast, setToast] = useState(null); // { msg, tipo }

  const debounceRef = useRef(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cierre con Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (showModal) closeModal();
        if (clienteServicios) setClienteServicios(null);
        if (clientePerfil) setClientePerfil(null);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showModal, clienteServicios, clientePerfil]);

  async function cargar(qParam) {
    setLoading(true);
    const query = qParam !== undefined ? qParam : q;
    const url = query.trim()
      ? `/backoffice/clientes?q=${encodeURIComponent(query.trim())}`
      : `/backoffice/clientes`;
    const r = await boGET(url);
    if (r.ok) setClientes(r.clientes || []);
    setLoading(false);
  }

  function onSearchChange(val) {
    setQ(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => cargar(val), 380);
  }

  function openModal(modo = "nuevo") {
    setModo(modo);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm(FORM_INICIAL);
    setModo("nuevo");
  }

  function onEditarCliente(c) {
    if (!isAdmin) return;
    setForm({
      id_cliente: c.id_cliente,
      nombre: c.nombre || "",
      email_contacto: c.email_contacto || "",
      telefono: c.telefono || "",
      dni: c.dni || "",
      pasaporte: c.pasaporte || "",
      pais_origen: c.pais_origen || "",
      canal_origen: c.canal_origen || "",
      activo: c.activo ?? true,
    });
    openModal("editar");
  }

  function onChangeForm(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function onVerServiciosCliente(c) {
    setClienteServicios(c);
  }

  function onVerPerfilCliente(c) {
    setClientePerfil(c);
  }

  async function onSubmitForm(e) {
    e.preventDefault();
    if (!isAdmin) return;
    setSaving(true);

    const payload = {
      nombre: (form.nombre || "").trim(),
      email_contacto: (form.email_contacto || "").trim(),
      telefono: form.telefono || null,
      dni: form.dni || null,
      pasaporte: form.pasaporte || null,
      pais_origen: form.pais_origen || null,
      canal_origen: form.canal_origen || null,
      ...(modo === "editar" ? { activo: !!form.activo } : {}),
    };

    let r;
    if (form.id_cliente) {
      r = await boPUT(`/backoffice/clientes/${form.id_cliente}`, payload);
    } else {
      r = await boPOST("/backoffice/clientes", payload);
    }

    setSaving(false);

    if (!r.ok) {
      setToast({ msg: r.msg || "Error guardando cliente", tipo: "error" });
      return;
    }

    closeModal();
    cargar();
    setToast({
      msg: modo === "editar" ? "Cliente actualizado correctamente." : "Cliente creado. Se envió correo de bienvenida.",
      tipo: "ok",
    });
  }

  async function onToggleActivoCliente(c) {
    if (!isAdmin) return;
    const nuevoEstado = !c.activo;
    const ok = await dialog.confirm(
      nuevoEstado ? "¿Activar este cliente?" : "¿Desactivar este cliente?"
    );
    if (!ok) return;

    const r = await boPUT(`/backoffice/clientes/${c.id_cliente}`, {
      nombre: c.nombre || "",
      email_contacto: c.email_contacto || "",
      telefono: c.telefono || null,
      dni: c.dni || null,
      pasaporte: c.pasaporte || null,
      pais_origen: c.pais_origen || null,
      canal_origen: c.canal_origen || null,
      activo: nuevoEstado,
    });

    if (!r.ok) {
      setToast({ msg: r.msg || "No se pudo actualizar el estado.", tipo: "error" });
      return;
    }

    if (r.cliente) {
      setClientes((prev) =>
        prev.map((cli) => (cli.id_cliente === c.id_cliente ? r.cliente : cli))
      );
    } else {
      cargar();
    }
  }

  async function onPurgarCliente(c) {
    if (!isAdmin) return;
    const ok = await dialog.confirm(
      `¿Purgar a "${c.nombre || c.email_contacto}"?\n\nEsto borrará todos sus datos personales de forma permanente. El registro queda vacío para liberar el correo.`
    );
    if (!ok) return;

    const r = await boPOST(`/backoffice/clientes/${c.id_cliente}/purgar`);

    if (!r.ok) {
      setToast({ msg: r.msg || "No se pudo purgar el cliente.", tipo: "error" });
      return;
    }

    setToast({ msg: "Cliente purgado. Sus datos han sido eliminados.", tipo: "ok" });
    cargar();
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-6xl mx-auto">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Clientes</h1>
          <p className="text-sm text-neutral-500">Buscar y gestionar clientes de la plataforma.</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => openModal("nuevo")}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo cliente
          </button>
        )}
      </div>

      {/* Buscador global (debounce, sin botón) */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="w-full border border-neutral-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors"
          placeholder="Buscar por nombre, correo, celular o DNI…"
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {loading && (
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
      </div>

      <ClientesTable
        clientes={clientes}
        loading={loading}
        onEditar={onEditarCliente}
        onVerServicios={onVerServiciosCliente}
        onToggleActivo={onToggleActivoCliente}
        onPurgar={onPurgarCliente}
        onVerPerfil={onVerPerfilCliente}
        isAdmin={isAdmin}
      />

      {/* Modal crear/editar */}
      {isAdmin && showModal && (
        <ClienteForm
          form={form}
          modo={modo}
          onChange={onChangeForm}
          onSubmit={onSubmitForm}
          onCancel={closeModal}
          saving={saving}
        />
      )}

      {/* Modal servicios */}
      {clienteServicios && (
        <ServiciosClienteModal
          cliente={clienteServicios}
          onClose={() => setClienteServicios(null)}
        />
      )}

      {/* Modal perfil completo */}
      {clientePerfil && (
        <PerfilClienteModal
          cliente={clientePerfil}
          onClose={() => setClientePerfil(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
