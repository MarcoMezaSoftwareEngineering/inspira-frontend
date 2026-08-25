// Resumen, para el asesor, de lo que el cliente marcó en su portal.
//
// Es lectura pura: el asesor no debe editarlo aquí. Sirve para entender de un
// vistazo por qué el checklist le está pidiendo unos documentos y no otros, sin
// tener que entrar al portal del cliente a mirarlo.
import { PERFILES, ESPECIALES, listaSolvencia, calcularMedios, VIA_ETIQUETA, eur }
  from "../../../../panel/components/mis-servicios/sections/visaSolvencia";

function Etiqueta({ children }) {
  return (
    <span className="inline-block text-[11px] font-semibold text-[#023A4B] bg-[#EEF2F8] border border-[#1A3557]/15 rounded-full px-2.5 py-1">
      {children}
    </span>
  );
}

export default function MarcadoPorCliente({ expediente }) {
  const exp = expediente || {};
  const via = exp.tipo_solvencia && exp.tipo_solvencia !== "PENDIENTE" ? exp.tipo_solvencia : null;

  if (!via) {
    return (
      <p className="text-[12.5px] text-neutral-400 leading-relaxed">
        El cliente aún no ha elegido su vía de medios económicos. Hasta que lo haga, su
        checklist de documentos permanece bloqueado.
      </p>
    );
  }

  const perfiles = exp.medios_perfiles || {};
  const especiales = exp.medios_especiales || {};
  const marcados = [
    ...PERFILES.filter((p) => perfiles[p.key]),
    ...ESPECIALES.filter((e) => especiales[e.key]),
  ];
  const lista = listaSolvencia(via, perfiles, especiales);
  const calc = exp.medios_calc ? calcularMedios(exp.medios_calc) : null;

  // Cuántas personas describió en sus datos económicos.
  const perfilesDJ = Array.isArray(exp.dj_datos?.perfiles) ? exp.dj_datos.perfiles : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Etiqueta>Vía: {VIA_ETIQUETA[via]}</Etiqueta>
        {calc && <Etiqueta>A acreditar: {eur(calc.total)} €</Etiqueta>}
        <Etiqueta>{lista.length} documentos de solvencia</Etiqueta>
      </div>

      {marcados.length > 0 ? (
        <div>
          <p className="text-[11.5px] text-neutral-500 mb-1.5">Perfil de ingresos y situaciones especiales:</p>
          <div className="flex flex-wrap gap-1.5">
            {marcados.map((m) => <Etiqueta key={m.key}>{m.icono} {m.nombre}</Etiqueta>)}
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
          Eligió su vía pero <b>no marcó ningún perfil de ingresos</b>. Sin eso sólo se le
          piden los extractos bancarios base. Conviene repasarlo con él.
        </p>
      )}

      {perfilesDJ.length > 0 && (
        <div>
          <p className="text-[11.5px] text-neutral-500 mb-1.5">Situación laboral declarada:</p>
          <ul className="space-y-1">
            {perfilesDJ.map((p, i) => (
              <li key={i} className="text-[12.5px] text-neutral-700">
                <b>{p.rol}</b>
                {p.nombre ? ` · ${p.nombre}` : ""}
                {p.trabajaActual
                  ? ` — ${p.cargo || "sin cargo"}${p.empresa ? ` en ${p.empresa}` : ""}`
                  : ` — no trabaja actualmente${p.ultEmpEmpresa ? `; último: ${p.ultEmpEmpresa}` : ""}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <details>
        <summary className="cursor-pointer select-none text-[11.5px] font-semibold text-[#046C8C] hover:underline">
          Ver los {lista.length} documentos que se le están pidiendo
        </summary>
        <ul className="mt-2 space-y-1 border-l-2 border-neutral-200 pl-3">
          {lista.map((d) => (
            <li key={d} className="text-[11.5px] text-neutral-600 leading-snug">· {d}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
