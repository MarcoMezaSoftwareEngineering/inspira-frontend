// src/hooks/usePagoServicio.js
import { useState } from "react";
import { apiPOST } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { dialog } from "../services/dialogService";

function isMercadoPagoUrl(url) {
  try {
    const { hostname } = new URL(url);
    return hostname.includes("mercadopago.com");
  } catch {
    return false;
  }
}

export function usePagoServicio() {
  const { user } = useAuth();
  const [loadingId, setLoadingId] = useState(null);

  async function pagarServicio(id_servicio) {
    if (!user) {
      window.location.href = "/auth/success"; // o tu ruta de login
      return;
    }

    setLoadingId(id_servicio);
    try {
      const res = await apiPOST("/mercadopago/servicio/preferencia", {
        id_servicio,
      });

      if (res?.ok && res.preferencia?.init_point && isMercadoPagoUrl(res.preferencia.init_point)) {
        window.location.href = res.preferencia.init_point;
      } else {
        console.error("Error preferencia servicio:", res);
        dialog.toast("No se pudo iniciar el pago del servicio.", "error");
      }
    } catch (err) {
      console.error(err);
      dialog.toast("Error de conexión con el sistema de pagos.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  return { pagarServicio, loadingId };
}
