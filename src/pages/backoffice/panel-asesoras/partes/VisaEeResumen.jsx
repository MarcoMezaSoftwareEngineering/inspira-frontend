// src/pages/backoffice/panel-asesoras/partes/VisaEeResumen.jsx
import { miss, mkFases } from "./utilidades";
import { InfoCard, FieldGrid, CarpetaLinks } from "./BloquesFicha";

function FasesSection({ fases }) {
  const nextUndone = fases.findIndex(f => !f.done);
  return (
    <div className="space-y-1.5">
      {fases.map((f, i) => {
        const isCurrent = i === nextUndone;
        return (
          <div key={i} className={`flex items-start gap-2 px-2.5 py-2 rounded-lg border ${
            f.done ? "bg-green-50 border-green-200" : isCurrent ? "bg-amber-50 border-amber-200" : "bg-white border-neutral-200"
          }`}>
            <span className="text-sm mt-0.5 flex-shrink-0">{f.done ? "✅" : isCurrent ? "🔶" : "⬜"}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-neutral-700">{f.label}</div>
              {f.pendiente ? <div className="text-[11px] text-red-600 italic mt-0.5">⚠ {f.pendiente}</div>
                : f.done ? <div className="text-[11px] text-green-600 mt-0.5">Completada</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function VisaEeResumen({ c }) {
  const svc = c._svc;
  const isVisa = svc === "visa";
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
      <InfoCard title="Fases del proceso">
        <FasesSection fases={c.fases || mkFases()} />
      </InfoCard>
      <InfoCard title={`Datos de ${isVisa ? "visa" : "estancia"}`}>
        {isVisa ? (
          <FieldGrid fields={[
            ["Fecha cita consulado", c.fechaCita, miss(c.fechaCita)],
            ["Carpeta", c.carpeta, false, true],
            ["Pasaporte", c.pasaporte, miss(c.pasaporte), true],
            ["Fecha nacimiento", c.fNac, miss(c.fNac)],
            ["NIE", c.nie, miss(c.nie), true],
            ["Nº expediente", c.expediente, miss(c.expediente), true],
            ["Llegada a España", c.llegada, miss(c.llegada)],
            ["Plazo máximo", c.plazoMax, miss(c.plazoMax)],
            ["Plazo ideal", c.plazoIdeal, miss(c.plazoIdeal)],
          ]} />
        ) : (
          <FieldGrid fields={[
            ["Detalle", c.detalle, miss(c.detalle), true],
            ["Carpeta", c.carpeta, false, true],
            ["Llegada a España", c.llegada, miss(c.llegada)],
            ["Plazo máximo", c.plazoMax, miss(c.plazoMax)],
            ["Plazo ideal", c.plazoIdeal, miss(c.plazoIdeal)],
            ["Pasaporte", c.pasaporte, miss(c.pasaporte), true],
            ["Fecha nacimiento", c.fNac, miss(c.fNac)],
            ["NIE", c.nie, miss(c.nie), true],
            ["Nº expediente", c.expediente, miss(c.expediente), true],
            ["F. presentación", c.fPresentacion, miss(c.fPresentacion)],
          ]} />
        )}
        <CarpetaLinks c={c} />
      </InfoCard>
    </div>
  );
}
