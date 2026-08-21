// src/components/servicios/ConfirmarPagoModal.jsx
import { useState } from "react";
import AceptarTerminos from "../legal/AceptarTerminos";

export default function ConfirmarPagoModal({
  open,
  onClose,
  plan,
  onConfirm,
  loading = false,
}) {
  const [aceptado, setAceptado] = useState(false);

  // La aceptación no se arrastra entre aperturas del modal ni entre planes:
  // cada contratación exige un acto afirmativo propio. Se reinicia durante el
  // render al detectar el cambio, sin efecto ni render en cascada.
  const claveApertura = open ? plan?.id ?? "abierto" : null;
  const [clavePrevia, setClavePrevia] = useState(claveApertura);
  if (clavePrevia !== claveApertura) {
    setClavePrevia(claveApertura);
    setAceptado(false);
  }

  if (!open || !plan) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
        <h2 className="text-xl font-semibold text-neutral-900">
          Confirmar contratación
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Estás a punto de contratar el plan:
        </p>

        <div className="mt-4 border border-neutral-200 rounded-xl p-4 bg-neutral-50">
          {plan.badge && (
            <span className="inline-block text-xs font-semibold uppercase tracking-wide bg-accent/10 text-accent px-3 py-1 rounded-full mb-2">
              {plan.badge}
            </span>
          )}
          <h3 className="text-lg font-semibold text-neutral-900">
            {plan.title}
          </h3>
          {plan.subtitle && (
            <p className="mt-1 text-sm text-neutral-600">{plan.subtitle}</p>
          )}
          {plan.priceLabel && (
            <p className="mt-3 text-xl font-bold text-neutral-900">
              {plan.priceLabel}
            </p>
          )}
          {plan.bullets && plan.bullets.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-neutral-600">
              {plan.bullets.map((b) => (
                <li key={b}>• {b}</li>
              ))}
            </ul>
          )}
        </div>

        <AceptarTerminos
          checked={aceptado}
          onChange={setAceptado}
          resumen="Al confirmar, serás redirigido a la pasarela segura de Mercado Pago para completar el pago. Una vez aprobado, registraremos tu servicio y lo verás en tu panel de cliente."
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-full border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-100 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || !aceptado}
            className="px-5 py-2 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Redirigiendo..." : "Confirmar y pagar"}
          </button>
        </div>
      </div>
    </div>
  );
}
