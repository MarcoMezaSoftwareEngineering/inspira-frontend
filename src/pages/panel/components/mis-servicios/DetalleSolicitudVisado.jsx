// src/pages/panel/components/mis-servicios/DetalleSolicitudVisado.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET } from "../../../../services/api";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

import EncabezadoSolicitud from "./sections/EncabezadoSolicitud";
import ChecklistDocumentos from "./sections/ChecklistDocumentos";
import InstructivosPlantillas from "./sections/InstructivosPlantillas";
import PortalesYJustificantesCliente from "./sections/PortalesYJustificantesCliente";

export default function DetalleSolicitudVisado({ solicitudBase, onVolver }) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [instructivos, setInstructivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const idSolicitud = solicitudBase.id_solicitud;

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSolicitud]);

  async function cargarTodo() {
    setLoading(true);
    setError("");
    try {
      const rDetalle = await apiGET(`/solicitudes/${idSolicitud}`);
      if (rDetalle.ok) setDetalle(rDetalle.solicitud);

      const rChecklist = await apiGET(`/checklist/${idSolicitud}`);
      if (rChecklist.ok) setChecklist(rChecklist.checklist || []);

      const rInst = await apiGET(`/solicitudes/${idSolicitud}/instructivos`);
      if (rInst.ok) {
        const base = (API_URL || "").replace(/\/+$/, "");
        const lista = (rInst.instructivos || []).map((i) => {
          const rawUrl = i.url || i.archivo_url || "";
          const isAbsolute = /^https?:\/\//i.test(rawUrl);
          if (isAbsolute) return { label: i.label, url: rawUrl };
          const path = rawUrl.replace(/^\/+/, "");
          return { label: i.label, url: `${base}/${path}` };
        });
        setInstructivos(lista);
      } else {
        setInstructivos([]);
      }
    } catch (e) {
      console.error(e);
      setError("Error al cargar información.");
    } finally {
      setLoading(false);
    }
  }

  const progresoChecklist = useMemo(() => {
    if (!checklist.length) return 0;
    const done = checklist.filter((it) =>
      ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())
    ).length;
    return Math.round((done * 100) / checklist.length);
  }, [checklist]);

  return (
    <div className="space-y-4">
      <button onClick={onVolver} className="text-xs text-[#023A4B] hover:underline">
        ← Volver a mis servicios
      </button>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4">
        {loading && <p>Cargando…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && detalle && (
          <>
            <EncabezadoSolicitud
              detalle={detalle}
              solicitudBase={solicitudBase}
              progresoChecklist={progresoChecklist}
            />

            {/* VISADO: solo 1,2 y 7 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
              {/* Fila 1: 50/50 */}
              <div className="min-h-[320px] xl:h-[520px]">
                <ChecklistDocumentos
                  checklist={checklist}
                  cargarTodo={cargarTodo}
                  idSolicitud={idSolicitud}
                />
              </div>

              <div className="min-h-[240px] xl:h-[520px]">
                <InstructivosPlantillas instructivos={instructivos} />
              </div>

              {/* Fila 2: Portales full width */}
              <div className="col-span-full">
                <PortalesYJustificantesCliente idSolicitud={idSolicitud} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
