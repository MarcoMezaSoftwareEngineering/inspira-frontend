// src/pages/backoffice/panel-asesoras/partes/OtrosResumenes.jsx
// Resúmenes de FP / Grado, Doctorado y Legal: una sola ficha cada uno.
import { miss } from "./utilidades";
import { InfoCard, FieldGrid, CarpetaLinks } from "./BloquesFicha";

export function FpResumen({ c }) {
  return (
    <InfoCard title="FP / Grado">
      <FieldGrid fields={[
        ["Paquete", c.paquete, false, true], ["Carpeta", c.carpeta, false, true],
        ["Centro", c.centro, miss(c.centro), true],  ["Estado admisión", c.estadoAdm, miss(c.estadoAdm)],
        ["NIE", c.nie, miss(c.nie), true], ["Nº expediente", c.expediente, miss(c.expediente), true],
      ]} />
      <CarpetaLinks c={c} />
    </InfoCard>
  );
}

// Doctorado: ficha genérica hasta que tenga panel propio.
export function DocResumen({ c }) {
  return (
    <InfoCard title="Doctorado">
      <FieldGrid fields={[
        ["Paquete", c.paquete, false, true], ["Carpeta", c.carpeta, false, true],
        ["Universidad / programa", c.centro, miss(c.centro), true], ["Estado admisión", c.estadoAdm, miss(c.estadoAdm)],
        ["Resultado", c.resultado, miss(c.resultado)],
        ["NIE", c.nie, miss(c.nie), true], ["Nº expediente", c.expediente, miss(c.expediente), true],
      ]} />
      <CarpetaLinks c={c} />
    </InfoCard>
  );
}

export function LegalResumen({ c }) {
  return (
    <InfoCard title="Legal / Extranjería">
      <FieldGrid fields={[
        ["Tipo", c.tipo, miss(c.tipo)], ["Resultado", c.resultado, miss(c.resultado)],
        ["Asesor", c.asesor, miss(c.asesor)], ["Carpeta", c.carpeta, false, true],
        ["NIE", c.nie, miss(c.nie), true], ["Nº expediente", c.expediente, miss(c.expediente), true],
        ["Fecha resolución", c.resolucion, miss(c.resolucion)], ["Paquete", c.paquete, false, true],
      ]} />
      <CarpetaLinks c={c} />
    </InfoCard>
  );
}
