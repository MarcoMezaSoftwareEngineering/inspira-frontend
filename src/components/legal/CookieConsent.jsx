// src/components/legal/CookieConsent.jsx
import { useEffect, useState } from "react";
import { inicializarAnalytics } from "../../lib/analytics";
import { CATEGORIAS, INVENTARIO } from "../../config/cookies";
import { RUTAS_LEGALES } from "../../config/legal";
import {
  aceptarTodo,
  guardarConsentimiento,
  inicializarConsentimiento,
  obtenerConsentimiento,
  rechazarTodo,
  requiereDecision,
} from "../../lib/consent";

const OPCIONALES = ["preferencias", "analitica", "marketing"];

function contarItems(categoriaId) {
  const bloque = INVENTARIO.find((b) => b.categoria === categoriaId);
  return bloque?.items?.length || 0;
}

/**
 * Banner de consentimiento de cookies.
 *
 * Cumple tres exigencias: las tres opciones tienen el mismo peso visual
 * (Aceptar / Rechazar / Configurar), rechazar es tan fácil como aceptar, y
 * ningún tag opcional se carga antes de la decisión — el bloqueo previo lo
 * garantiza src/lib/consent.js.
 */
export default function CookieConsent() {
  // El estado inicial se deriva del propio almacenamiento: si no hay decisión
  // vigente, el banner nace visible. No hace falta un efecto para eso.
  const [visible, setVisible] = useState(requiereDecision);
  const [panel, setPanel] = useState(false);
  const [seleccion, setSeleccion] = useState(obtenerConsentimiento);

  useEffect(() => {
    // Ejecuta los tags ya consentidos en visitas anteriores.
    inicializarAnalytics(); // se registra; solo carga si hay consentimiento
    inicializarConsentimiento();

    const abrirPanel = () => {
      setSeleccion(obtenerConsentimiento());
      setPanel(true);
      setVisible(true);
    };
    // El footer y la Política de Cookies disparan este evento para reabrir el
    // panel y permitir retirar el consentimiento en cualquier momento.
    window.addEventListener("inspira:abrir-cookies", abrirPanel);
    window.addEventListener("inspira:consent-reset", abrirPanel);
    return () => {
      window.removeEventListener("inspira:abrir-cookies", abrirPanel);
      window.removeEventListener("inspira:consent-reset", abrirPanel);
    };
  }, []);

  if (!visible) return null;

  const cerrar = () => {
    setVisible(false);
    setPanel(false);
  };

  const onAceptar = () => {
    aceptarTodo();
    cerrar();
  };
  const onRechazar = () => {
    rechazarTodo();
    cerrar();
  };
  const onGuardar = () => {
    guardarConsentimiento(seleccion, "configurar");
    cerrar();
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-5"
      role="dialog"
      aria-label="Configuración de cookies"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        <div className="p-5 sm:p-6">
          <h2 className="font-fraunces text-lg font-semibold text-primary">
            Tu privacidad en este sitio
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">
            Usamos cookies y almacenamiento local propios y de terceros. Las{" "}
            <strong>estrictamente necesarias</strong> mantienen tu sesión y
            permiten procesar pagos: sin ellas el sitio no funciona. El resto{" "}
            <strong>solo se activa si tú lo autorizas</strong>. Puedes aceptar,
            rechazar o elegir categoría por categoría, y cambiar tu decisión
            cuando quieras desde el pie de página. Más detalle en la{" "}
            <a
              className="font-medium text-primary underline underline-offset-2"
              href={RUTAS_LEGALES.cookies}
            >
              Política de Cookies
            </a>{" "}
            y en el{" "}
            <a
              className="font-medium text-primary underline underline-offset-2"
              href={RUTAS_LEGALES.privacidad}
            >
              Aviso de Privacidad
            </a>
            .
          </p>

          {panel && (
            <div className="mt-4 space-y-3">
              {Object.values(CATEGORIAS).map((cat) => {
                const total = contarItems(cat.id);
                const activa = cat.obligatoria || seleccion[cat.id];
                return (
                  <div
                    key={cat.id}
                    className="rounded-xl border border-neutral-200 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {cat.nombre}
                          {cat.obligatoria && (
                            <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-primary">
                              Siempre activas
                            </span>
                          )}
                          {!cat.obligatoria && total === 0 && (
                            <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                              Sin tecnologías instaladas hoy
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                          {cat.descripcion}
                        </p>
                      </div>
                      <label className="mt-0.5 inline-flex shrink-0 cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-[#1a5c3a] disabled:opacity-40"
                          checked={!!activa}
                          disabled={cat.obligatoria}
                          onChange={(e) =>
                            setSeleccion((s) => ({
                              ...s,
                              [cat.id]: e.target.checked,
                            }))
                          }
                          aria-label={"Activar " + cat.nombre}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {/* Las tres acciones comparten jerarquía visual: rechazar no es más
                difícil ni menos visible que aceptar. */}
            <button
              type="button"
              onClick={onRechazar}
              className="h-11 rounded-xl border border-primary px-5 text-sm font-semibold text-primary transition hover:bg-secondary sm:order-1"
            >
              Rechazar todas
            </button>
            {panel ? (
              <button
                type="button"
                onClick={onGuardar}
                className="h-11 rounded-xl border border-primary px-5 text-sm font-semibold text-primary transition hover:bg-secondary sm:order-2"
              >
                Guardar mi selección
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSeleccion(obtenerConsentimiento());
                  setPanel(true);
                }}
                className="h-11 rounded-xl border border-primary px-5 text-sm font-semibold text-primary transition hover:bg-secondary sm:order-2"
              >
                Configurar
              </button>
            )}
            <button
              type="button"
              onClick={onAceptar}
              className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark sm:order-3"
            >
              Aceptar todas
            </button>
          </div>

          {OPCIONALES.every((c) => contarItems(c) === 0) && (
            <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
              Hoy este sitio no tiene instaladas herramientas de analítica ni de
              publicidad. Si en el futuro se instalan, quedarán bloqueadas hasta
              que las autorices aquí.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
