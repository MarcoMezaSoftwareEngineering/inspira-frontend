// src/components/legal/ConsentimientoDatos.jsx
import { RUTAS_LEGALES, TITULAR, VERSIONES } from "../../config/legal";

/**
 * Bloque de consentimiento reutilizable para todos los formularios públicos.
 *
 * Dos reglas que no se pueden romper:
 *  1. El consentimiento de tratamiento (necesario para atender la solicitud) y
 *     el de marketing van en casillas SEPARADAS.
 *  2. Ninguna casilla viene marcada por defecto: el consentimiento debe ser
 *     una acción afirmativa del usuario.
 *
 * `valores` y `onChange` los controla el formulario padre. Los valores
 * iniciales y el payload que se envía al backend viven en
 * `src/lib/consentimientoFormulario.js`.
 */
export default function ConsentimientoDatos({
  valores,
  onChange,
  finalidad,
  compacto = false,
}) {
  const set = (k, v) => onChange({ ...valores, [k]: v });
  const texto = compacto ? "text-xs" : "text-sm";

  return (
    <div className="space-y-3">
      {/* Aviso de privacidad resumido en el propio punto de recogida */}
      <div className={"rounded-xl bg-secondary-light p-3.5 " + texto + " leading-relaxed text-neutral-700"}>
        <p className="font-semibold text-primary">
          Información básica sobre el tratamiento de tus datos
        </p>
        <p className="mt-1">
          <strong>Responsable:</strong> {TITULAR.razonSocial} (RUC{" "}
          {TITULAR.ruc}). <strong>Finalidad:</strong> {finalidad}{" "}
          <strong>Legitimación:</strong> tu consentimiento.{" "}
          <strong>Destinatarios:</strong> proveedores tecnológicos que actúan
          como encargados (Google, Mercado Pago, Make, Calendly), con flujo
          transfronterizo de datos. <strong>Derechos:</strong> acceso,
          rectificación, cancelación y oposición, entre otros, escribiendo a{" "}
          {TITULAR.emailDatosPersonales} o desde el{" "}
          <a
            className="font-medium text-primary underline underline-offset-2"
            href={RUTAS_LEGALES.derechos}
          >
            formulario de derechos
          </a>
          . Detalle completo en el{" "}
          <a
            className="font-medium text-primary underline underline-offset-2"
            href={RUTAS_LEGALES.privacidad}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Aviso de Privacidad
          </a>
          .
        </p>
      </div>

      {/* Consentimiento necesario para atender la solicitud */}
      <label className={"flex cursor-pointer items-start gap-2.5 " + texto + " text-neutral-700"}>
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#1a5c3a]"
          checked={!!valores.acepta_politica}
          onChange={(e) => set("acepta_politica", e.target.checked)}
        />
        <span>
          He leído y acepto el{" "}
          <a
            className="font-medium text-primary underline underline-offset-2"
            href={RUTAS_LEGALES.privacidad}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Aviso de Privacidad
          </a>{" "}
          y consiento el tratamiento de mis datos para {finalidad.toLowerCase()}{" "}
          <span className="text-red-600">*</span>
        </span>
      </label>

      {/* Consentimiento de marketing: SEPARADO y opcional */}
      <label className={"flex cursor-pointer items-start gap-2.5 " + texto + " text-neutral-700"}>
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#1a5c3a]"
          checked={!!valores.acepta_marketing}
          onChange={(e) => set("acepta_marketing", e.target.checked)}
        />
        <span>
          <span className="font-medium">Opcional:</span> quiero recibir por
          correo y WhatsApp información sobre convocatorias, becas, plazos y
          servicios de Inspira Legal. Puedo darme de baja cuando quiera.
        </span>
      </label>

      <p className="text-[11px] text-neutral-500">
        Aviso de Privacidad versión {VERSIONES.privacidad.version}. Tu decisión
        se registra con fecha y hora como prueba del consentimiento.
      </p>
    </div>
  );
}
