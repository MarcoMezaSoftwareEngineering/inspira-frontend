// src/pages/backoffice/solicitudes/hooks/useSolicitudDetalle.js
import { useEffect, useMemo, useState } from "react";
import { boGET } from "../../../../services/backofficeApi";

// 09/10/2026: este hook también pedía /backoffice/usuarios-internos?rol=asesor
// en cada expediente abierto y guardaba la selección de asesores para
// AsesoresAsignadosAdmin, un componente que ya nadie montaba (se borró).
// Eran unas mil peticiones desde mayo que no pintaban nada.
export function useSolicitudDetalle(idSolicitud) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function cargar({ silencioso = false } = {}) {
    if (!silencioso) setLoading(true);
    setError("");
    try {
      // La solicitud con su checklist (API admin) y el detalle de backoffice
      // con los asesores, a la vez: ninguna depende de la otra (iban en fila).
      const [rChecklist, rBackoffice] = await Promise.all([
        boGET(`/api/admin/solicitudes/${idSolicitud}/checklist`),
        boGET(`/backoffice/solicitudes/${idSolicitud}`),
      ]);
      if (!rChecklist.ok) {
        setError(rChecklist.message || rChecklist.msg || "No se pudo cargar la solicitud.");
        return;
      }

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
    } catch (e) {
      console.error(e);
      setError("Error al cargar la información de la solicitud.");
    } finally {
      if (!silencioso) setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
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
  };
}
