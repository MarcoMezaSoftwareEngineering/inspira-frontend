// Qué puede hacer quien mira con los cobros (claves de
// inspira-backend/src/backoffice/permisos.catalog.js):
//
//   pagos.ver                  listas, resumen, planes, comprobantes
//   pagos.registrar            marcar pagado, adjuntar voucher, recordatorio
//   pagos.planes               crear, reprogramar y anular planes
//   pagos.validar_comprobante  validar o rechazar lo que subió el asesorado
//   admin                      devolver a pendiente un cobro ya pagado
import { Check, Upload, Bell, Eye, Undo2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/** Los permisos de pagos de quien mira. */
export function usePermisosPagos() {
  const { hasPermission, isAdmin } = useAuth();
  return {
    ver: hasPermission("pagos.ver"),
    registrar: hasPermission("pagos.registrar"),
    planes: hasPermission("pagos.planes"),
    validar: hasPermission("pagos.validar_comprobante"),
    admin: isAdmin,
  };
}

/** Los botones que corresponden a un cobro, en el orden en que se pintan. */
export function accionesPara(c, puede) {
  if (!c) return [];
  const lista = [];
  if (c.estado === "EN_REVISION" && puede.validar) lista.push({ tipo: "validar", etiqueta: "Validar", icono: ShieldCheck, tono: "cta" });
  if (c.estado === "PENDIENTE" && puede.registrar) {
    lista.push({ tipo: "pagado", etiqueta: "Marcar pagado", icono: Check, tono: "primario" });
    lista.push({ tipo: "voucher", etiqueta: "Voucher", icono: Upload, tono: "secundario" });
    lista.push({ tipo: "recordar", etiqueta: "Recordar", icono: Bell, tono: "fantasma" });
  }
  if (c.estado === "PAGADO" && puede.registrar && !c.tiene_comprobante) {
    lista.push({ tipo: "voucher", etiqueta: "Adjuntar voucher", icono: Upload, tono: "fantasma" });
  }
  if (c.tiene_comprobante && c.estado !== "EN_REVISION") lista.push({ tipo: "ver", etiqueta: "Comprobante", icono: Eye, tono: "fantasma" });
  if (c.estado === "PAGADO" && puede.admin && !c.pagado_en_linea) {
    lista.push({ tipo: "deshacer", etiqueta: "Deshacer", icono: Undo2, tono: "fantasma" });
  }
  return lista;
}
