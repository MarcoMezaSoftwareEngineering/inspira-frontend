// src/pages/panel/components/MisServicios.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../services/api";
import ServiciosList from "./mis-servicios/ServiciosList";
import DetalleSolicitud from "./mis-servicios/DetalleSolicitud";
import DetalleSolicitudVisado from "./mis-servicios/DetalleSolicitudVisado";
import DetalleSolicitudEstancia from "./mis-servicios/DetalleSolicitudEstancia";

function esEstancia(s) {
  if (Number(s?.id_tipo_solicitud) === 18) return true;
  const txt = String(
    s?.tipo?.nombre || s?.tipo_solicitud || s?.tipo || s?.titulo || s?.nombre_servicio || ""
  ).toLowerCase();
  return txt.includes("estancia");
}

function esVisado(s) {
  if (Number(s?.id_tipo_solicitud) === 15) return true;
  const cod = String(
    s?.tipo?.nombre || s?.tipo_solicitud || s?.tipo || s?.categoria || s?.titulo ||
    s?.servicio?.codigo || s?.codigo_servicio || s?.nombre_servicio || ""
  ).toUpperCase();
  return cod.includes("VISADO");
}

export default function MisServicios({ onIrAGuia }) {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [seleccionadaId, setSeleccionadaId] = useState(() => {
    if (typeof window === "undefined") return null;
    try { const raw = window.localStorage.getItem("panel_servicio_id"); return raw ? Number(raw) : null; }
    catch { return null; }
  });

  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => { cargarServicios(); }, []); // eslint-disable-line

  async function cargarServicios() {
    setLoading(true);
    setError("");
    try {
      const resp = await apiGET("/solicitudes/mias");
      if (!resp.ok) throw new Error(resp.msg || resp.message || "No se pudieron cargar los servicios");
      const lista = resp.solicitudes || [];
      setServicios(lista);
      if (!seleccionada && seleccionadaId && lista.length) {
        const encontrada = lista.find((s) => Number(s.id_solicitud) === Number(seleccionadaId));
        if (encontrada) setSeleccionada(encontrada);
      }
    } catch (e) {
      setError(e.message || "Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  }

  function manejarVerDetalle(servicio) {
    setSeleccionada(servicio);
    setSeleccionadaId(servicio.id_solicitud);
    if (typeof window !== "undefined") {
      try { window.localStorage.setItem("panel_servicio_id", String(servicio.id_solicitud)); } catch { /* noop */ }
    }
  }

  function manejarVolverLista() {
    setSeleccionada(null);
    setSeleccionadaId(null);
    if (typeof window !== "undefined") {
      try { window.localStorage.removeItem("panel_servicio_id"); } catch { /* noop */ }
    }
  }

  if (seleccionada) {
    // Propaga la altura completa al detalle
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        {/* La estancia por estudios es un proceso aparte: ni el formulario del
            visado ni el del master le sirven. Antes caia en el del master, que
            es el que sale por defecto para todo lo que no es visado. */}
        {esEstancia(seleccionada) ? (
          <DetalleSolicitudEstancia
            solicitudBase={seleccionada} onVolver={manejarVolverLista} onIrAGuia={onIrAGuia} />
        ) : esVisado(seleccionada) ? (
          <DetalleSolicitudVisado solicitudBase={seleccionada} onVolver={manejarVolverLista} />
        ) : (
          <DetalleSolicitud solicitudBase={seleccionada} onVolver={manejarVolverLista} onIrAGuia={onIrAGuia} />
        )}
      </div>
    );
  }

  return (
    <ServiciosList
      servicios={servicios}
      loading={loading}
      error={error}
      onRecargar={cargarServicios}
      onVerDetalle={manejarVerDetalle}
    />
  );
}
