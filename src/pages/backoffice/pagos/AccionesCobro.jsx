// Lo que se puede hacer con un cobro, según el permiso de quien mira:
//
//   pagos.registrar            marcar pagado, adjuntar voucher, recordatorio
//   pagos.validar_comprobante  validar o rechazar lo que subió el asesorado
//   admin                      devolver a pendiente un cobro ya pagado
//
// `useAccionesCobro` lo reúne para que la lista, el detalle de un plan y la
// ficha del cliente ofrezcan exactamente lo mismo: devuelve los botones que
// tocan a cada cobro, la función para abrir cada acción y las ventanas.
import { useState } from "react";
import { boPATCH, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { usePermisosPagos } from "./permisosPagos";
import { VentanaPagado, VentanaVoucher, VentanaValidar, VentanaDetalle } from "./VentanasCobro";
import { dinero } from "./pagosComun";

/**
 * @param opciones  lo de GET /backoffice/pagos/opciones (métodos de pago)
 * @param onHecho   (cobro actualizado | null) tras cualquier cambio
 */
export function useAccionesCobro({ opciones, onHecho }) {
  const puede = usePermisosPagos();
  const [abierta, setAbierta] = useState(null); // { tipo, cobro }

  const cerrar = () => setAbierta(null);
  const hecho = (pago) => { setAbierta(null); onHecho?.(pago || null); };

  async function recordar(c) {
    const ok = await dialog.confirm(
      `Se enviará a ${c.cliente?.email || "su correo"} el aviso ${c.vencido ? "de cuota vencida" : "de próximo vencimiento"} de ${dinero(c.monto, c.moneda)}. Es un correo formal al asesorado.`,
      "¿Enviar el recordatorio?",
    );
    if (!ok) return;
    const r = await boPOST(`/backoffice/pagos/${c.id_pago}/recordatorio`, {});
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo enviar el recordatorio", "error"); return; }
    dialog.toast(`Recordatorio enviado a ${r.para}`, "success");
    onHecho?.(null);
  }

  async function deshacer(c) {
    const ok = await dialog.confirm(
      `El cobro de ${dinero(c.monto, c.moneda)} vuelve a pendiente y se borra su fecha de pago. Queda registrado en el historial.`,
      "¿Deshacer este cobro?",
    );
    if (!ok) return;
    const r = await boPATCH(`/backoffice/pagos/${c.id_pago}`, { estado: "PENDIENTE" });
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo deshacer", "error"); return; }
    dialog.toast("Cobro devuelto a pendiente", "success");
    onHecho?.(r.pago);
  }

  function abrir(tipo, cobro) {
    if (tipo === "recordar") { setAbierta(null); recordar(cobro); return; }
    if (tipo === "deshacer") { setAbierta(null); deshacer(cobro); return; }
    setAbierta({ tipo, cobro });
  }

  const c = abierta?.cobro;
  const ventanas = !abierta ? null : (
    abierta.tipo === "pagado" ? <VentanaPagado c={c} opciones={opciones} onCerrar={cerrar} onHecho={hecho} />
      : abierta.tipo === "voucher" ? <VentanaVoucher c={c} opciones={opciones} onCerrar={cerrar} onHecho={hecho} />
        : abierta.tipo === "validar" ? <VentanaValidar c={c} opciones={opciones} onCerrar={cerrar} onHecho={hecho} />
          : <VentanaDetalle c={c} puede={puede} onCerrar={cerrar} onAccion={abrir} />
  );

  return { puede, abrir, ventanas };
}
