// src/pages/backoffice/panel-asesoras/partes/MasterResumen.jsx
import { miss } from "./utilidades";
import { InfoCard, ProgresoBar, FieldGrid, CarpetaLinks, ExpedienteLink } from "./BloquesFicha";

export function MasterResumen({ c }) {
  const p  = c.pasos  || {};
  const og = c.origen || {};
  // Todo esto se deriva del expediente; ✎ marca lo que la asesora forzó a mano.
  const steps = [
    ["Fichero", p.fichero, og.fichero],
    ["Nota media", c.notaMedia, og.notaMedia],
    ["CV Europass", c.cvEuropass, og.cvEuropass],
    ["Informe búsqueda", p.informe, og.informe],
    ["Escogió máster", p.escogio, og.escogio],
    ["Docs completos", c.docCompletos, og.docCompletos],
    ["Postulación completa", p.postulacion, og.postulacion],
  ];
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <InfoCard title="Identidad" right={<ProgresoBar progreso={c.progreso} />}>
          <FieldGrid fields={[
            ["Nombre completo", c.name, false, true],
            ["Paquete", c.paquete, false, true],
            ["Carpeta", c.carpeta, false, true],
          ]} />
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <CarpetaLinks c={c} />
            <ExpedienteLink c={c} />
          </div>
        </InfoCard>
        <InfoCard title="Perfil académico">
          <FieldGrid fields={[
            ["Uni origen", c.uni_origen, miss(c.uni_origen), true, og.uni_origen === "manual"],
            ["Área de interés", c.interes, miss(c.interes), true, og.interes === "manual"],
            ["Promedio", c.promedio, miss(c.promedio), true, og.promedio === "manual"],
            ["Máster elegido", c.masterElegido, miss(c.masterElegido), true, og.masterElegido === "manual"],
          ]} />
        </InfoCard>
        <InfoCard title="Beca">
          {c.beca ? (
            <div className={`rounded-lg p-2.5 -m-0.5 ${c.beca.aprobable ? "bg-fuchsia-50 border border-fuchsia-200" : "bg-white border border-neutral-200"}`}>
              <div className={`text-xs font-bold ${c.beca.aprobable ? "text-fuchsia-700" : "text-neutral-400"}`}>
                {c.beca.aprobable ? "🎓 Beca aprobable" : "Sin análisis aprobable"}
              </div>
              {c.beca.detalle && <div className="text-xs text-neutral-600 mt-1">{c.beca.detalle}</div>}
            </div>
          ) : <div className="text-xs text-neutral-400">Sin registro</div>}
        </InfoCard>
      </div>

      <InfoCard title={`Proceso · ${steps.filter(([, ok]) => ok).length}/${steps.length} completados`}>
        <div className="flex flex-wrap gap-1.5">
          {steps.map(([l, ok, origen]) => (
            <span
              key={l}
              title={origen === "manual" ? "Forzado a mano" : "Derivado del expediente"}
              className={`px-2 py-1 rounded-full text-[11px] font-semibold border ${
                ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"
              } ${origen === "manual" ? "ring-1 ring-amber-300" : ""}`}
            >
              {ok ? "✓" : "×"} {l}
              {origen === "manual" && <span className="ml-1 text-amber-600">✎</span>}
            </span>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}
