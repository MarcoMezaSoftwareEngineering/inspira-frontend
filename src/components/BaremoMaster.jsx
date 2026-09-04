// La baremación de un máster: qué puntúa la universidad para admitir y con
// qué peso.
//
// Se usa igual en el informe del asesorado y en la vista del asesor, a
// propósito: si cada pantalla lo pintara a su manera, acabarían diciendo
// cosas distintas del mismo máster y la conversación entre los dos se rompe.
//
// No es el requisito de acceso. Que un máster valore el expediente al 100 %
// no quiere decir que admita cualquier titulación: eso lo dice el título de
// acceso, que es otro campo.
import { useState } from "react";

const CATEGORIA_ETIQ = {
  EXPEDIENTE_ACADEMICO: "Expediente académico",
  ADECUACION_TITULO: "Adecuación del título de acceso",
  CURRICULUM_VITAE: "Currículum vitae",
  EXPERIENCIA_PROFESIONAL: "Experiencia profesional",
  MOTIVACION: "Carta de motivación",
  ENTREVISTA: "Entrevista",
  IDIOMAS: "Idiomas",
  OTROS_MERITOS: "Otros méritos",
  FORMACION_COMPLEMENTARIA: "Formación complementaria",
  INVESTIGACION: "Investigación y publicaciones",
  CARTAS_REFERENCIA: "Cartas de referencia",
  DOSSIER_PORTFOLIO: "Dossier o portfolio",
};

// 393 criterios de una carga antigua guardaron la categoría y dejaron el texto
// en blanco. Se rotulan desde la categoría: es lo que el texto habría dicho.
export const rotuloCriterio = (c) =>
  (c?.criterio || "").trim() || CATEGORIA_ETIQ[c?.categoria] || "";

/**
 * @param {Array}  baremo    criterios con su peso
 * @param {number} maxVisible cuántos se ven antes de «ver todos»
 */
export default function BaremoMaster({ baremo, maxVisible = 4, compacto = false }) {
  const [abierto, setAbierto] = useState(false);
  const utiles = (baremo || []).filter(rotuloCriterio);
  if (!utiles.length) return null;

  // Dos escalas, y hay que saber cuál es. Un «10» puede ser el 10 % de la
  // nota o 10 puntos sobre 30; en la base viene dicho (`escala`). En
  // porcentaje las barras se miden contra 100, que es lo que el lector espera;
  // en puntos, contra el criterio que más pesa, porque no hay un total fijo.
  // Antes todo se pintaba con «%» y contra el máximo: un baremo de 5/5/5/5
  // puntos salía como cuatro barras llenas al «5 %», que no significa nada.
  const enPuntos = utiles.some((c) => c.escala === "PUNTOS");
  const max = Math.max(...utiles.map((c) => c.peso || 0), 1);
  const base = enPuntos ? max : 100;
  const unidad = enPuntos ? " pt" : "%";
  const visibles = abierto ? utiles : utiles.slice(0, maxVisible);
  const ocultos = utiles.length - visibles.length;

  return (
    // Ancho acotado. En una pantalla de escritorio la tarjeta mide 900px y
    // una barra de 900px con el porcentaje en la otra punta no se lee: el ojo
    // tiene que viajar. A 440px el rótulo, la barra y el número se ven juntos.
    <div className={compacto ? "mt-2" : "mt-2.5"} style={{ maxWidth: 440 }}>
      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
        Qué valoran para admitir
      </p>
      <div className="flex flex-col gap-1">
        {visibles.map((c, i) => (
          <div key={i}>
            <div className="flex justify-between gap-2 text-[10.5px] leading-tight">
              <span className="text-neutral-600 truncate">{rotuloCriterio(c)}</span>
              {c.peso != null && (
                <span className="text-neutral-400 font-semibold tabular-nums shrink-0">
                  {c.peso}{unidad}
                </span>
              )}
            </div>
            <div className="h-[3px] rounded-full bg-neutral-100 mt-0.5 overflow-hidden">
              <i className="block h-full rounded-full"
                style={{ width: `${c.peso == null ? 0 : Math.min(100, Math.round((c.peso / base) * 100))}%`,
                         background: "linear-gradient(90deg,#88C4FC,#013446)" }} />
            </div>
          </div>
        ))}
      </div>
      {(ocultos > 0 || abierto) && (
        <button type="button"
          onClick={(e) => { e.stopPropagation(); setAbierto(!abierto); }}
          className="mt-1 text-[10px] font-semibold text-[#023A4B] hover:underline">
          {abierto ? "Ver menos" : `Ver los ${utiles.length} criterios`}
        </button>
      )}
    </div>
  );
}
