// src/pages/panel/components/MisServicios.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../services/api";
import ServiciosList from "./mis-servicios/ServiciosList";
import DetalleSolicitud from "./mis-servicios/DetalleSolicitud";
import DetalleSolicitudVisado from "./mis-servicios/DetalleSolicitudVisado";
import DetalleSolicitudEstancia from "./mis-servicios/DetalleSolicitudEstancia";
import DetalleSolicitudModificatoria from "./mis-servicios/DetalleSolicitudModificatoria";

function esModificatoria(s) {
  if (Number(s?.id_tipo_solicitud) === 20) return true;
  const txt = String(
    s?.tipo?.nombre || s?.tipo_solicitud || s?.tipo || s?.titulo || s?.nombre_servicio || ""
  ).toLowerCase();
  return txt.includes("modificatoria") || txt.includes("modificacion") || txt.includes("modificación");
}

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

  // Al entrar en «Mis servicios» se ve la lista, siempre.
  //
  // Antes se recordaba el ultimo servicio abierto y se entraba directo en el.
  // Ayudaba al recargar a mitad de faena, pero rompia lo esencial: quien pulsa
  // «Mi panel» quiere ver sus servicios, no caer dentro de uno. Con varios
  // servicios contratados era ademas desconcertante, porque abria uno sin que
  // nadie lo hubiera pedido.
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => { cargarServicios(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function cargarServicios() {
    setLoading(true);
    setError("");
    try {
      const resp = await apiGET("/solicitudes/mias");
      if (!resp.ok) throw new Error(resp.msg || resp.message || "No se pudieron cargar los servicios");
      const lista = resp.solicitudes || [];
      setServicios(lista);
    } catch (e) {
      setError(e.message || "Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  }

  function manejarVerDetalle(servicio) {
    setSeleccionada(servicio);
  }

  function manejarVolverLista() {
    setSeleccionada(null);
  }

  if (seleccionada) {
    // Propaga la altura completa al detalle
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        {/* La estancia por estudios es un proceso aparte: ni el formulario del
            visado ni el del master le sirven. Antes caia en el del master, que
            es el que sale por defecto para todo lo que no es visado. */}
        {esModificatoria(seleccionada) ? (
          <DetalleSolicitudModificatoria
            solicitudBase={seleccionada} onVolver={manejarVolverLista} />
        ) : esEstancia(seleccionada) ? (
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
