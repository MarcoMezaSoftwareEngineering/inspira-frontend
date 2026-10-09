import { euros } from "../../../../../../lib/formatos";
import { num } from "./utilidades";

/**
 * Las condiciones que decide extranjería.
 *
 * No son plazos como en la estancia: son las tres cosas que miran del
 * precontrato antes que nada. Van arriba porque si alguna falla, todo lo
 * demás da igual.
 */
export default function Condiciones({ exp, revision }) {
  const smi = revision?.smi_referencia || 16576;
  const salario = num(exp.con_retribucion);
  const horas = num(exp.con_jornada_horas);

  const filas = [
    ["Salario bruto anual",
      salario ? euros(salario) : null,
      salario === null ? null : salario >= smi,
      `mínimo ${euros(smi)}`],
    ["Jornada semanal",
      horas ? `${horas} h` : null,
      horas === null ? null : horas >= 40,
      "tiene que ser 40"],
    ["Duración",
      exp.con_duracion || null,
      exp.con_duracion ? ["1 año", "Indefinido"].includes(exp.con_duracion) : null,
      "1 año o indefinido"],
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {filas.map(([label, valor, bien, regla]) => (
        <div key={label} className={`rounded-xl border px-3 py-2 ${
          bien === null ? "border-neutral-200 bg-white"
            : bien ? "border-[#1D6A4A]/25 bg-[#E8F5EE]/50" : "border-red-300 bg-red-50/60"
        }`}>
          <p className="text-[11px] text-neutral-500 leading-tight">{label}</p>
          <p className={`text-[15px] font-semibold leading-tight mt-0.5 ${
            bien === null ? "text-neutral-300" : bien ? "text-[#14532d]" : "text-red-700"
          }`}>{valor || "sin dato"}</p>
          <p className={`text-[10.5px] mt-0.5 ${
            bien === false ? "text-red-600 font-medium" : "text-neutral-400"
          }`}>{bien === false ? `✕ ${regla}` : regla}</p>
        </div>
      ))}
    </div>
  );
}
