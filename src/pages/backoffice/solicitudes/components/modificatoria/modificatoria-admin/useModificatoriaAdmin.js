// Estado del panel de la modificatoria: el expediente, sus documentos y las
// comunicaciones de extranjería; `cargar` lo vuelve a pedir todo y `guardar`
// manda un PATCH con lo que cambia. Salió de ModificatoriaAdmin.jsx al
// partirlo en piezas (09/10/2026); el orden de los hooks es el mismo.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPATCH } from "../../../../../../services/backofficeApi";

export default function useModificatoriaAdmin(idSolicitud) {
  const [exp, setExp] = useState(null);
  const [docs, setDocs] = useState(null);
  const [ext, setExt] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(() => Promise.all([
    boGET(`/backoffice/solicitudes/${idSolicitud}/modificatoria`),
    boGET(`/backoffice/solicitudes/${idSolicitud}/modificatoria/documentos`),
    boGET(`/backoffice/solicitudes/${idSolicitud}/modificatoria/extranjeria`),
  ]).then(([a, b, c]) => {
    if (a?.ok) setExp(a.expediente);
    if (b?.ok) setDocs(b);
    if (c?.ok) setExt(c.registros || []);
  }), [idSolicitud]);

  useEffect(() => { cargar(); }, [cargar]);

  const guardar = useCallback(async (cambios) => {
    setGuardando(true);
    const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/modificatoria`, cambios);
    setGuardando(false);
    if (r?.ok) setExp(r.expediente);
  }, [idSolicitud]);

  return { exp, docs, ext, guardando, cargar, guardar };
}
