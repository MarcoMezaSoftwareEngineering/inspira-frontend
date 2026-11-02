// src/hooks/useReservarCita.js
import { useState } from "react";
import { apiPOST } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { loginGoogle } from "../components/layout/Header/LoginButton";
import { dialog } from "../services/dialogService";
import { registrarInicioPago } from "../lib/analytics";

export function useReservarCita() {
  const { user } = useAuth();
  const [loadingSlot, setLoadingSlot] = useState(null);

  // Separa el horario sin cobrar y lleva a la página de pago de esa reserva.
  // modo «ahora»: elige allí cómo pagar; «despues»: queda separado para pagar luego.
  // `extra`: lo que cuenta el cliente ({ motivo, celular }).
  async function separarHorario(id_slot, servicio_id, modo = "ahora", extra = {}) {
    if (!user) {
      loginGoogle({ volverAqui: true });
      return;
    }
    setLoadingSlot(id_slot);
    try {
      const res = await apiPOST("/api/reservas/cliente/separar", { id_slot, servicio_id, modo, ...extra });
      if (res?.ok && res.id_reserva) {
        registrarInicioPago("reserva_cita_separada", { id_slot, servicio_id, modo });
        window.location.assign(`/reservar/pago?r=${res.id_reserva}`);
        return;
      }
      dialog.toast(res?.msg || "No se pudo separar el horario.", "error");
    } catch (err) {
      console.error(err);
      dialog.toast("Error de conexión. Intente de nuevo.", "error");
    }
    setLoadingSlot(null);
  }

  return { separarHorario, loadingSlot, isLoggedIn: !!user };
}
