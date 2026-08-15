// src/pages/backoffice/precios/PreciosServicios.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST, boPUT } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import ServiciosList from "./ServiciosList";
import ServicioForm from "./ServicioForm";
import { useAuth } from "../context/AuthContext";

const ESTADO_FORM_INICIAL = {
  id_servicio: null,
  codigo: "",
  nombre: "",
  descripcion: "",
  moneda: "EUR",
  monto: "",
  activo: true,
};

export default function PreciosServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(ESTADO_FORM_INICIAL);
  const [modo, setModo] = useState("nuevo"); // "nuevo" | "editar"
  const [filtro, setFiltro] = useState("todos"); // activos | inactivos | todos

  const { hasPermission } = useAuth();
  const puedeEditar = hasPermission("precios.editar");

  // ============================
  // Carga de servicios
  // ============================
  async function cargar() {
    setLoading(true);
    const r = await boGET(`/backoffice/precios/servicios?estado=${filtro}`);
    if (r.ok) setServicios(r.servicios || []);
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  }, [filtro]);

  function resetForm() {
    setForm(ESTADO_FORM_INICIAL);
    setModo("nuevo");
  }

  function editarServicio(s) {
    setModo("editar");
    setForm({
      id_servicio: s.id_servicio,
      codigo: s.codigo,
      nombre: s.nombre,
      descripcion: s.descripcion || "",
      moneda: s.precio_actual?.moneda || "EUR",
      monto: s.precio_actual?.monto ?? "",
      activo: s.activo,
    });
  }

  function abrirChecklist(s) {
    dialog.toast("Abrir checklist para servicio: " + s.nombre, "info");
    // Más adelante aquí haremos navigate('/backoffice/checklist/' + s.id_servicio)
  }

  // ============================
  // Guardar (solo admin)
  // ============================
  async function guardar(e) {
    e.preventDefault();
    if (saving) return;

    if (!puedeEditar) {
      dialog.toast("No tienes permiso para crear o modificar servicios y precios.", "info");
      return;
    }

    setSaving(true);
    try {
      const montoNumber = parseFloat(form.monto);
      if (Number.isNaN(montoNumber)) {
        dialog.toast("Monto inválido", "error");
        return;
      }

      if (modo === "nuevo") {
        const r = await boPOST("/backoffice/precios/servicios", {
          codigo: (form.codigo || "").trim(), // puede ir vacío, el backend genera uno
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          moneda: form.moneda,
          monto: montoNumber,
        });

        if (!r.ok) {
          dialog.toast(r.msg || "No se pudo crear el servicio", "error");
        } else {
          resetForm();
          await cargar();
        }
      } else {
        // actualizar servicio
        const r1 = await boPUT(
          `/backoffice/precios/servicios/${form.id_servicio}`,
          {
            nombre: form.nombre.trim(),
            descripcion: form.descripcion.trim(),
            activo: form.activo,
          }
        );

        if (!r1.ok) {
          dialog.toast(r1.msg || "No se pudo actualizar el servicio", "error");
          return;
        }

        // actualizar precio (nueva versión)
        const r2 = await boPUT(
          `/backoffice/precios/servicios/${form.id_servicio}/precio`,
          {
            moneda: form.moneda,
            monto: montoNumber,
          }
        );

        if (!r2.ok) {
          dialog.toast(r2.msg || "No se pudo actualizar el precio", "error");
          return;
        }

        await cargar();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-secondary text-primary flex items-center justify-center shrink-0">
          <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5.586a1 1 0 01.707.293l7.414 7.414a1 1 0 010 1.414l-8.586 8.586a1 1 0 01-1.414 0L3.293 13.293A1 1 0 013 12.586V7a4 4 0 014-4z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Precios / Servicios</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Gestiona los servicios y sus precios actuales.</p>
        </div>
      </div>

      {/* Filtro por estado */}
      <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 w-fit">
        {[
          { value: "todos", label: "Todos" },
          { value: "activos", label: "Activos" },
          { value: "inactivos", label: "Inactivos" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFiltro(opt.value)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filtro === opt.value ? "bg-white text-primary shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de servicios */}
        <div className="lg:col-span-2">
          <ServiciosList
            servicios={servicios}
            loading={loading}
            onEditar={puedeEditar ? editarServicio : undefined}
            onChecklist={abrirChecklist}
          />
        </div>

        {/* Formulario lateral */}
        <div>
          {puedeEditar ? (
            <ServicioForm
              modo={modo}
              form={form}
              setForm={setForm}
              saving={saving}
              onSubmit={guardar}
              onReset={resetForm}
            />
          ) : (
            <div className="flex gap-3 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 bg-amber-50">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p>
                Solo los administradores pueden crear o modificar servicios y
                precios. Como asesor, puedes consultar la lista de servicios en
                la columna izquierda, pero no realizar cambios.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
