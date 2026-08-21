// src/lib/consentimientoFormulario.js
// Helpers de consentimiento para formularios React. Viven fuera del componente
// para que el archivo de UI exporte solo componentes (fast refresh).

import { VERSIONES } from "../config/legal";

/** Valores iniciales: siempre desmarcados, nunca premarcados. */
export const CONSENTIMIENTO_INICIAL = {
  acepta_politica: false,
  acepta_marketing: false,
};

/**
 * Payload que acompaña al formulario. Guarda la prueba del consentimiento:
 * qué se aceptó, con qué versión de la política y cuándo.
 */
export function payloadConsentimiento(valores) {
  return {
    acepta_politica: !!valores.acepta_politica,
    acepta_marketing: !!valores.acepta_marketing,
    politica_version: VERSIONES.privacidad.version,
    consent_ts: new Date().toISOString(),
  };
}
