// src/pages/panel/components/MisServicios.jsx
import { lazy, Suspense, useEffect } from "react";
import Inicio from "./Inicio";
import ServiciosList from "./mis-servicios/ServiciosList";
import { navigate } from "../../../services/navigate";
import { rutaDe } from "../ruta";
import { SERVICIO, servicioDe } from "../servicios";
import { EsqueletoExpediente } from "./Esqueleto";

// Cada tipo de expediente se descarga solo cuando se abre. Los cuatro juntos
// eran 3.000 líneas en el paquete del panel, y un asesorado de máster nunca
// va a abrir el de modificatoria.
const DetalleSolicitud = lazy(() => import("./mis-servicios/DetalleSolicitud"));
const DetalleSolicitudVisado = lazy(() => import("./mis-servicios/DetalleSolicitudVisado"));
const DetalleSolicitudEstancia = lazy(() => import("./mis-servicios/DetalleSolicitudEstancia"));
const DetalleSolicitudModificatoria = lazy(() => import("./mis-servicios/DetalleSolicitudModificatoria"));

/**
 * La lista, o el expediente que diga la URL.
 *
 * El expediente abierto ya no se guarda en memoria: viene en la ruta
 * (`/panel/servicios/155/post`). Recargar conserva el sitio, «atrás» vuelve a
 * la lista, y un correo puede enlazar a una sección concreta.
 */
export default function MisServicios({ ruta, perfil, conAcademico, conCompleto, servicios, loading, error, onRecargar, onIrAGuia }) {
  const { idServicio, seccion, tab } = ruta;
  const seleccionada = idServicio
    ? (servicios || []).find((s) => Number(s.id_solicitud) === idServicio) || null
    : null;

  // Un id que no es suyo —o que ya no existe— no puede quedarse en la barra:
  // se vuelve a la lista sustituyendo la entrada, para que «atrás» no
  // devuelva a la misma ruta rota.
  useEffect(() => {
    if (idServicio && !loading && servicios && !seleccionada) {
      navigate("/panel", { replace: true });
    }
  }, [idServicio, loading, servicios, seleccionada]);

  const abrir = (s) => navigate(rutaDe({ idServicio: s.id_solicitud }));
  const volver = () => navigate("/panel");
  const irSeccion = (sec) => navigate(rutaDe({ idServicio, seccion: sec }));

  if (idServicio && loading) {
    return <EsqueletoExpediente />;
  }

  if (seleccionada) {
    const tipo = servicioDe(seleccionada);
    // El perfil ya lo tiene el panel: el expediente lo recibe en vez de volver a pedirlo.
    const comunes = { solicitudBase: seleccionada, onVolver: volver, onIrAGuia, perfil };
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <Suspense fallback={<EsqueletoExpediente />}>
          {tipo === SERVICIO.MODIFICATORIA ? (
            <DetalleSolicitudModificatoria {...comunes} />
          ) : tipo === SERVICIO.ESTANCIA ? (
            <DetalleSolicitudEstancia {...comunes} />
          ) : tipo === SERVICIO.VISADO ? (
            <DetalleSolicitudVisado {...comunes} seccion={seccion} onSeccion={irSeccion} />
          ) : (
            <DetalleSolicitud {...comunes} seccion={seccion} onSeccion={irSeccion} />
          )}
        </Suspense>
      </div>
    );
  }

  // «Mis servicios» es la lista sola, con su sitio en el menú: al meter las
  // tarjetas debajo de los pendientes de Inicio, en un teléfono con cinco
  // cosas pendientes quedaban fuera de la vista y parecía que no estaban.
  if (tab === "servicios") {
    return (
      <ServiciosList
        servicios={servicios}
        loading={loading}
        error={error}
        onRecargar={onRecargar}
        onVerDetalle={abrir}
      />
    );
  }

  return (
    <Inicio
      servicios={servicios}
      perfil={perfil}
      conAcademico={conAcademico}
      conCompleto={conCompleto}
      loading={loading}
      error={error}
      onRecargar={onRecargar}
      onVerDetalle={abrir}
    />
  );
}
