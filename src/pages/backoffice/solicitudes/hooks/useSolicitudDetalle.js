// src/pages/backoffice/solicitudes/hooks/useSolicitudDetalle.js
import { useEffect, useMemo, useState } from "react";
import { boGET } from "../../../../services/backofficeApi";

export function useSolicitudDetalle(idSolicitud) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [asesoresDisponibles, setAsesoresDisponibles] = useState([]);
  const [asesoresSeleccionados, setAsesoresSeleccionados] = useState([]);
  const [guardandoAsesores, setGuardandoAsesores] = useState(false);

  async function cargar({ silencioso = false } = {}) {
    if (!silencioso) setLoading(true);
    setError("");
    try {
      // 1) Checklist + solicitud (API admin)
      const rChecklist = await boGET(`/api/admin/solicitudes/${idSolicitud}/checklist`);
      if (!rChecklist.ok) {
        setError(rChecklist.message || rChecklist.msg || "No se pudo cargar la solicitud.");
        return;
      }

      // 2) Detalle de backoffice con asesores
      const rBackoffice = await boGET(`/backoffice/solicitudes/${idSolicitud}`);

      let solicitud = rChecklist.solicitud || {};
      if (rBackoffice.ok && rBackoffice.solicitud) {
        solicitud = {
          ...solicitud,
          asesores: rBackoffice.solicitud.asesores || solicitud.asesores,
          informe_compat_curado: rBackoffice.solicitud.informe_compat_curado ?? null,
        };
      }

      setDetalle(solicitud);
      setChecklist(rChecklist.checklist || []);

      // Init asesoresSeleccionados
      const s = solicitud;
      let seleccion = [];

      if (s.asesores && Array.isArray(s.asesores) && s.asesores.length > 0) {
        seleccion = s.asesores.map((a) => String(a.usuario?.id_usuario ?? a.id_usuario));
      } else if (s.asesor && s.asesor.id_usuario) {
        seleccion = [String(s.asesor.id_usuario)];
      } else if (s.id_asesor_asignado) {
        seleccion = [String(s.id_asesor_asignado)];
      }
      setAsesoresSeleccionados(seleccion);
    } catch (e) {
      console.error(e);
      setError("Error al cargar la información de la solicitud.");
    } finally {
      if (!silencioso) setLoading(false);
    }
  }

  async function cargarAsesoresDisponibles() {
    try {
      const r = await boGET("/backoffice/usuarios-internos?rol=asesor");
      if (r.ok) setAsesoresDisponibles(r.usuarios || []);
    } catch (e) {
      console.error("Error al cargar asesores disponibles", e);
    }
  }

  useEffect(() => {
    cargar();
    cargarAsesoresDisponibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSolicitud]);

  const checklistPorEtapa = useMemo(() => {
    const grupos = {};
    (checklist || []).forEach((it) => {
      const etapa = it.item?.etapa?.nombre || "Checklist";
      if (!grupos[etapa]) grupos[etapa] = [];
      grupos[etapa].push(it);
    });
    return grupos;
  }, [checklist]);

  return {
    detalle,
    setDetalle,
    checklist,
    setChecklist,
    checklistPorEtapa,
    loading,
    error,
    cargar,

    asesoresDisponibles,
    asesoresSeleccionados,
    setAsesoresSeleccionados,
    guardandoAsesores,
    setGuardandoAsesores,
  };
}
