/**
 * Vista general del asesorado.
 *
 * Lo primero son los plazos, en grande: es lo que decide si este expediente
 * corre o puede esperar, y lo que hay que mirar antes que nada al abrirlo.
 * Debajo, sus datos de un vistazo, para no preguntarle lo que ya puso.
 *
 * Lo que le falta ya no es una lista de treinta nombres separados por puntos
 * -ilegible y desalentadora-: se cuenta por apartados y se despliega solo si
 * hay que perseguirlo.
 */
/**
 * Ficha completa del asesorado.
 *
 * Todos los campos, agrupados como se los pedimos a él. Antes había un resumen
 * de doce datos y, aparte, la lista de los que faltaban: no se veía lo que sí
 * había rellenado, y la lista era un muro de treinta nombres seguidos.
 *
 * Aquí cada campo está en su sitio con su valor o con «falta», así que se lee
 * igual de rápido lo que hay y lo que no, sin desplegar nada.
 */
/**
 * Un dato de la ficha.
 *
 * Rotulo a la izquierda, valor a la derecha, un hilo debajo. Se probo con una
 * caja de color por cada dato que falta y en un expediente recien abierto
 * salian trece seguidas: gritaba tanto que ya no decia nada. Lo que falta se
 * cuenta arriba, en el rotulo del apartado, y aqui basta con no estar en negro.
 */
/**
 * Un dato de la ficha, editable.
 *
 * En mayusculas porque asi va al impreso: lo que el asesor ve aqui es lo que
 * va a salir en el EX-00, y verlo en minusculas mientras el impreso lo pone en
 * mayusculas invita a «corregir» lo que ya estaba bien. El correo no, que en
 * mayusculas parece roto y no va a ningun impreso.
 */
export function CampoEdit({ label, valor, onChange, falta, tipo = "text", opciones }) {
  const mayus = tipo === "text";
  const clase = `text-[12.5px] border rounded-lg px-2.5 py-1.5 bg-white w-full min-w-0
    focus:outline-none focus:ring-2 focus:ring-[#023A4B]/20 focus:border-[#023A4B] ${
    mayus ? "uppercase" : ""
  } ${falta ? "border-amber-400 bg-amber-50/50" : "border-neutral-300"}`;

  return (
    <label className="min-w-0 flex flex-col gap-1">
      <span className="text-[11px] text-neutral-500 leading-tight truncate" title={label}>
        {label}
      </span>
      {opciones ? (
        <select className={clase} value={valor ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={tipo} className={clase} value={valor ?? ""}
          onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

/** El mismo dato, para leer. Es como se ve la ficha mientras nadie la edita. */
export function CampoVista({ label, valor, falta }) {
  const vacio = !String(valor ?? "").trim();
  return (
    <div className="min-w-0 flex flex-col gap-0.5">
      <span className="text-[11px] text-neutral-500 leading-tight truncate" title={label}>
        {label}
      </span>
      <span className={`text-[12.5px] leading-snug break-words ${
        !vacio ? "text-neutral-900 font-medium"
          : falta ? "text-amber-600" : "text-neutral-300"
      }`}>{!vacio ? valor : falta ? "falta" : "—"}</span>
    </div>
  );
}

/** El lápiz. Fuera de él la ficha no se toca. */
export function Lapiz({ editando, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
        editando
          ? "bg-[#023A4B] text-white border-[#023A4B]"
          : "border-neutral-300 text-neutral-600 hover:border-[#023A4B] hover:text-[#023A4B]"
      }`}>
      {editando ? "✓ Listo" : "✎ Editar"}
    </button>
  );
}

export function SeccionEdit({ titulo, campos, faltaSet, borrador, set, editando }) {
  const sinCompletar = campos.filter(
    ([, k, ob]) => ob && faltaSet.has(ob) && !String(borrador[k] || "").trim()
  ).length;

  return (
    <div className="mt-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <p className="text-[12px] font-semibold text-neutral-700">{titulo}</p>
        <span className="flex-1 h-px bg-neutral-100" />
        {sinCompletar > 0 && (
          <span className="text-[10.5px] font-semibold text-amber-700">
            {sinCompletar} sin completar
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2.5">
        {campos.map(([label, k, ob, extra]) => {
          const falta = Boolean(ob) && faltaSet.has(ob) && !String(borrador[k] || "").trim();
          return editando ? (
            <CampoEdit
              key={k} label={label} valor={borrador[k]} onChange={set(k)} falta={falta}
              tipo={extra?.tipo} opciones={extra?.opciones}
            />
          ) : (
            <CampoVista key={k} label={label} valor={borrador[k]} falta={falta} />
          );
        })}
      </div>
    </div>
  );
}
