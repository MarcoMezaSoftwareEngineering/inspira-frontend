import { Pill, FLabel, EMsg, FInput } from "../Campos";
import { AREAS_CARRERA } from "../constantes";

// ── PASO 1: Tu carrera ──────────────────────────────────────────────
export default function PasoCarrera({ formData, set, has, buscarCarreras, sugCarreras }) {
  return (
    <div className="space-y-6">
      <div>
        <FLabel>Carrera o título universitario</FLabel>
        <FInput value={formData.carrera_titulo || ""}
          onChange={(e) => { set("carrera_titulo", e.target.value); buscarCarreras(e.target.value); }}
          placeholder="Ej: Ingeniería Industrial, Derecho, Psicología…"
          list="carreras-catalogo" autoComplete="off"
          err={has("carrera_titulo")} />
        {/* Las carreras tal como las nombra el catálogo español. Si elige
            la suya de la lista, el informe puede comprobar en qué másteres
            da acceso sin tener que adivinar cómo la escribió. */}
        <datalist id="carreras-catalogo">
          {sugCarreras.map((c) => <option key={c} value={c} />)}
        </datalist>
        <p className="text-xs text-neutral-400 mt-1.5">
          Si aparece en la lista al escribir, elígela: así comprobamos en qué másteres da acceso tu carrera.
        </p>
        <EMsg show={has("carrera_titulo")} msg="Escribe el nombre de tu carrera" />
      </div>
      <div>
        <FLabel>¿A qué área pertenece tu carrera?</FLabel>
        <div className={`flex flex-wrap gap-2 p-2 rounded-xl transition ${has("area_carrera") ? "bg-red-50 border border-red-200" : ""}`}>
          {AREAS_CARRERA.map((a) => (
            <Pill key={a.value} active={formData.area_carrera === a.value}
              onClick={() => set("area_carrera", formData.area_carrera === a.value ? "" : a.value)}>
              {a.label}
            </Pill>
          ))}
        </div>
        <EMsg show={has("area_carrera")} />
      </div>
    </div>
  );
}
