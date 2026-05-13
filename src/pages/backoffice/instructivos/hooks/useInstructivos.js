// Hook de estado y lógica para InstructivosServicios
import { useState } from "react";
import { boGET, boPOST, boPUT, boDELETE, boUpload } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";

const FORM_INICIAL = {
  id_instructivo: null,
  label: "",
  descripcion: "",
  archivo_url: "",
  orden: 1,
  activo: true,
};

export function useInstructivos() {
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState(null);

  const [instructivos, setInstructivos] = useState([]);
  const [loadingInstructivos, setLoadingInstructivos] = useState(false);

  const [form, setForm] = useState(FORM_INICIAL);
  const [modo, setModo] = useState("nuevo");
  const [saving, setSaving] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  async function cargarServicios() {
    setLoadingServicios(true);
    const r = await boGET("/backoffice/instructivos/servicios");
    if (r.ok) setServicios(r.servicios || []);
    setLoadingServicios(false);
  }

  async function cargarInstructivos(id_servicio) {
    if (!id_servicio) { setInstructivos([]); return; }
    setLoadingInstructivos(true);
    const r = await boGET(`/backoffice/instructivos/servicios/${id_servicio}/instructivos`);
    setInstructivos(r.ok && r.servicio ? r.servicio.instructivos || [] : []);
    setLoadingInstructivos(false);
  }

  function resetForm() {
    setForm(FORM_INICIAL);
    setModo("nuevo");
  }

  function seleccionarServicio(id) {
    if (!id) { setSelectedServicio(null); setInstructivos([]); resetForm(); return; }
    setSelectedServicio(id);
    resetForm();
    cargarInstructivos(id);
  }

  function editarInstructivo(inst) {
    setModo("editar");
    setForm({
      id_instructivo: inst.id_instructivo,
      label: inst.label || "",
      descripcion: inst.descripcion || "",
      archivo_url: inst.archivo_url || "",
      orden: inst.orden ?? 1,
      activo: !!inst.activo,
    });
  }

  async function eliminarInstructivo(id_instructivo) {
    if (!await dialog.confirm("¿Eliminar este instructivo?")) return;
    const r = await boDELETE(`/backoffice/instructivos/${id_instructivo}`);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo eliminar", "error"); return; }
    setInstructivos(prev => prev.filter(i => i.id_instructivo !== id_instructivo));
    cargarServicios();
  }

  async function handleUploadArchivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoArchivo(true);
    try {
      const r = await boUpload("/backoffice/instructivos/upload", file);
      if (!r.ok) { dialog.toast(r.msg || "No se pudo subir el archivo", "error"); return; }
      setForm((prev) => ({ ...prev, archivo_url: r.ruta_archivo }));
    } finally {
      setSubiendoArchivo(false);
    }
  }

  async function guardar(e) {
    e.preventDefault();
    if (!selectedServicio) { dialog.toast("Selecciona un servicio primero", "info"); return; }
    if (!form.label.trim()) { dialog.toast("Falta el nombre del instructivo", "error"); return; }
    if (!form.archivo_url) { dialog.toast("Sube un archivo primero", "error"); return; }

    setSaving(true);
    try {
      const payload = {
        label: form.label,
        descripcion: form.descripcion,
        archivo_url: form.archivo_url,
        orden: form.orden,
        activo: form.activo,
      };
      const r = modo === "nuevo"
        ? await boPOST(`/backoffice/instructivos/servicios/${selectedServicio}/instructivos`, payload)
        : await boPUT(`/backoffice/instructivos/${form.id_instructivo}`, payload);

      if (!r.ok) { dialog.toast(r.msg || "No se pudo guardar", "error"); return; }
      resetForm();
      cargarInstructivos(selectedServicio);
      cargarServicios();
    } finally {
      setSaving(false);
    }
  }

  return {
    servicios, loadingServicios, cargarServicios,
    selectedServicio, seleccionarServicio,
    instructivos, loadingInstructivos,
    form, setForm, modo, saving, subiendoArchivo,
    resetForm, editarInstructivo, eliminarInstructivo,
    handleUploadArchivo, guardar,
  };
}
