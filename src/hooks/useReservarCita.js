// src/hooks/useReservarCita.js
import { useState } from "react";
import { apiPOST } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { loginGoogle } from "../components/layout/Header/LoginButton";
import { dialog } from "../services/dialogService";

function isMercadoPagoUrl(url) {
  try {
    const { hostname } = new URL(url);
    return hostname.includes("mercadopago.com");
  } catch {
    return false;
  }
}

export function useReservarCita() {
  const { user } = useAuth();
  const [loadingSlot, setLoadingSlot] = useState(null);

  async function reservarSlot(id_slot) {
    // Requiere sesión de cliente (login con Google)
    if (!user) {
      loginGoogle(); // guarda post_login_redirect (ruta actual) y va a Google
      return;
    }

    setLoadingSlot(id_slot);
    try {
      const res = await apiPOST("/mercadopago/reserva/preferencia", { id_slot });

      if (res?.ok && res.preferencia?.init_point && isMercadoPagoUrl(res.preferencia.init_point)) {
        window.location.href = res.preferencia.init_point;
        return;
      }

      if (res?.msg) {
        dialog.toast(res.msg, "error"); // p.ej. "Ese horario ya no está disponible"
      } else {
        dialog.toast("No se pudo iniciar el pago de la cita.", "error");
      }
    } catch (err) {
      console.error(err);
      dialog.toast("Error de conexión con el sistema de pagos.", "error");
    } finally {
      setLoadingSlot(null);
    }
  }

  return { reservarSlot, loadingSlot, isLoggedIn: !!user };
}
