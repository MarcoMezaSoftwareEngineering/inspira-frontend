// La lista de servicios del panel (GET /solicitudes/mias), a mano para las
// piezas que viven dentro de un expediente y necesitan su `resumen` (plazos,
// agenda) sin volver a pedirlo: la línea de tiempo del expediente.
//
// La pone PanelCliente. Fuera del panel vale null y quien la lea se apaña
// sin ella.
import { createContext, useContext } from "react";

export const ServiciosPanelCtx = createContext(null);

/** La solicitud con ese id, tal como llegó en la lista; null si no está. */
export function useServicioPanel(idSolicitud) {
  const lista = useContext(ServiciosPanelCtx);
  return (lista || []).find((s) => Number(s.id_solicitud) === Number(idSolicitud)) || null;
}
