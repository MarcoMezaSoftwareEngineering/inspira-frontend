// Cambiar la etapa de un proceso con cierre con control.
//
// Si se pasa a «Finalizado», el servidor pide el resultado y avisa de lo que
// queda abierto (deuda, documentos). Aquí se enseña ese paso en una ventana y
// se reintenta con lo que la persona elija. Lo usan Clientes y Procesos.
import VentanaCierre from "./VentanaCierre";
import { createRoot } from "react-dom/client";
import { boPATCH } from "../../../services/backofficeApi";

function pedirCierre(avisos, resultados) {
  return new Promise((resolve) => {
    const nodo = document.createElement("div");
    document.body.appendChild(nodo);
    const raiz = createRoot(nodo);
    const fin = (v) => { raiz.unmount(); nodo.remove(); resolve(v); };
    raiz.render(<VentanaCierre avisos={avisos} resultados={resultados} onFin={fin} />);
  });
}

/** PATCH de etapa; si pide cierre, pregunta y reintenta. Devuelve la respuesta final (ok o no). */
export async function cambiarEtapa(id_solicitud, etapa, servicio) {
  const ruta = `/backoffice/procesos/${id_solicitud}/etapa`;
  const r = await boPATCH(ruta, { etapa, servicio });
  if (r.ok || !r.requiere_cierre) return r;
  const eleccion = await pedirCierre(r.avisos || [], r.resultados || []);
  if (!eleccion) return { ok: false, cancelado: true };
  return boPATCH(ruta, { etapa, servicio, ...eleccion });
}
