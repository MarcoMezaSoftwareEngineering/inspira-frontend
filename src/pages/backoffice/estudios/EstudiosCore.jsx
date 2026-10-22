// Grados y FP en Inspira Core (22/10/2026): el catálogo interno con el que se
// arma el informe del servicio de grado/FP. Grados: QEDU, con nota de corte,
// plazas y precio. FP: el Registro Estatal de Centros Docentes, ciclo a ciclo
// y centro a centro.
import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { Pagina, Cabecera, Cuerpo } from "../ui";
import BuscadorEstudios from "./BuscadorEstudios";

export default function EstudiosCore() {
  const [resumen, setResumen] = useState(null);
  useEffect(() => { boGET("/backoffice/estudios/resumen").then((r) => r?.ok && setResumen(r)); }, []);
  const n = (v) => (v === undefined || v === null ? "…" : Number(v).toLocaleString("es-ES"));
  return (
    <Pagina>
      <Cabecera
        eyebrow="Herramientas"
        titulo="Grados y FP"
        subtitulo="El catálogo del que salen las tres carreras y los tres ciclos del informe. Desde el expediente de grado/FP se añaden a la lista con un clic."
        stats={resumen ? [
          { n: resumen.grados, l: "grados (titulación × centro)" },
          { n: resumen.titulaciones, l: "titulaciones" },
          { n: resumen.universidades, l: "universidades" },
          { n: resumen.ciclos, l: "ciclos de grado superior" },
          { n: resumen.centros_fp, l: "centros de FP" },
        ] : null}
      />
      <Cuerpo>
        <BuscadorEstudios />
        <p className="ase-dc-nota" style={{ marginTop: 16 }}>
          Grados: {n(resumen?.grados)} filas de QEDU (ciencia.gob.es/qedu), datos del curso 2025-2026, generados el {resumen?.generado?.grados ? resumen.generado.grados.slice(0, 10) : "…"}.
          FP: {n(resumen?.centros_fp)} centros del RCD (educacion.gob.es/centros), generados el {resumen?.generado?.fp ? resumen.generado.fp.slice(0, 10) : "…"}.
          Se regeneran con <code>scripts/censo-grados-qedu.js</code> y <code>scripts/censo-fp-rcd.js</code>.
        </p>
      </Cuerpo>
    </Pagina>
  );
}
