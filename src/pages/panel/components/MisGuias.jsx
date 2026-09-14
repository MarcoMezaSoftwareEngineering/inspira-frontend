// «Mis guías»: la única entrada de guías del menú del asesorado (14/09/2026).
//
// Antes eran cinco entradas sueltas —Mis guías (los PDF), Guía Máster, Guía
// Apostilla, Guía Estancia y Guía Residencia y Trabajo— más un segundo «Mis
// guías» en el pie del menú. Ahora es una sola y dentro va una pestaña por guía.
//
// La URL sigue siendo la única verdad: cada pestaña es su ruta de siempre
// (/panel/portal, /panel/guia, /panel/apostilla, /panel/estancia,
// /panel/modificatoria), así que los enlaces viejos, los botones de dentro de
// cada expediente (onIrAGuia) y «atrás» abren la misma guía que antes.
import { Suspense } from "react";
import { lazyConRecarga } from "../../../lib/cargaDiferida";
import Icono from "../../../components/common/Icono";
import GuiaPortal from "./GuiaPortal";

// Cada guía se descarga la primera vez que se abre.
const GuiaMaster = lazyConRecarga(() => import("../GuiaMaster"));
const GuiaApostilla = lazyConRecarga(() => import("../GuiaApostilla"));
const GuiaEstancia = lazyConRecarga(() => import("../GuiaEstancia"));
const GuiaModificatoria = lazyConRecarga(() => import("../GuiaModificatoria"));

const GUIA = {
  guia: GuiaMaster,
  apostilla: GuiaApostilla,
  estancia: GuiaEstancia,
  modificatoria: GuiaModificatoria,
};

function Cargando() {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="text-center">
        <div className="pnl-spinner" />
        <span className="pnl-nota">Cargando…</span>
      </div>
    </div>
  );
}

/**
 * @param tab         la pestaña abierta (sale de la URL)
 * @param pestanas    las que le tocan (servicios.js, pestanasGuiasDe)
 * @param guiasPortal los PDF de sus servicios
 * @param onCambiar   navega a otra pestaña (su ruta)
 */
export default function MisGuias({ tab, pestanas = [], guiasPortal = [], onCambiar }) {
  const Guia = GUIA[tab];

  return (
    <div className="flex-1 flex flex-col">
      {/* Con una sola guía no hace falta elegir. */}
      {pestanas.length > 1 && (
        <nav className="ex-guias-pestanas" aria-label="Mis guías">
          {pestanas.map((p) => {
            const on = p.clave === tab;
            return (
              <button
                key={p.clave}
                type="button"
                className="ex-guias-pestana"
                data-on={on ? "1" : "0"}
                aria-current={on ? "page" : undefined}
                onClick={() => !on && onCambiar?.(p.clave)}
              >
                <Icono nombre={p.icono} size={15} />
                {p.label}
              </button>
            );
          })}
        </nav>
      )}

      {tab === "portal" ? (
        <GuiaPortal guias={guiasPortal} />
      ) : Guia ? (
        <Suspense fallback={<Cargando />}>
          <Guia />
        </Suspense>
      ) : null}
    </div>
  );
}
