// src/components/legal/AceptarTerminos.jsx
import { RUTAS_LEGALES, VERSIONES } from "../../config/legal";

/**
 * Casilla de aceptación de Términos y Condiciones previa a contratar.
 *
 * El deber de información al consumidor exige que las condiciones estén
 * disponibles ANTES de la contratación, no después del pago. Por eso este
 * bloque bloquea el botón de pago hasta que el usuario marca la casilla, y los
 * documentos se abren en una pestaña nueva para no perder el flujo.
 */
export default function AceptarTerminos({ checked, onChange, resumen }) {
  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
      {resumen && (
        <p className="mb-2 text-xs leading-relaxed text-neutral-600">{resumen}</p>
      )}
      <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-neutral-700">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#1a5c3a]"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>
          He leído y acepto los{" "}
          <a
            className="font-medium text-primary underline underline-offset-2"
            href={RUTAS_LEGALES.terminos}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Términos y Condiciones de Contratación
          </a>{" "}
          (versión {VERSIONES.terminos.version}) y el{" "}
          <a
            className="font-medium text-primary underline underline-offset-2"
            href={RUTAS_LEGALES.privacidad}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Aviso de Privacidad
          </a>
          . Entiendo que el servicio es de asesoría y gestión, y que la admisión,
          las becas y los visados los deciden las universidades y autoridades
          competentes. <span className="text-red-600">*</span>
        </span>
      </label>
    </div>
  );
}
