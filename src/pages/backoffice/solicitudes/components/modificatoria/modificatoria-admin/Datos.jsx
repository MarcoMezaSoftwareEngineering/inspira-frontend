/* ── 1 · Datos y plazos ──────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react";
import Cabecera from "./Cabecera";
import Condiciones from "./Condiciones";
import { CampoVista, Lapiz, SeccionEdit } from "./CamposFicha";
import { SECCIONES, input } from "./constantes";

/**
 * La ficha del expediente.
 *
 * Editable: el asesorado rellena lo suyo, pero los datos de la empresa y del
 * precontrato llegan casi siempre por otro lado —los manda la empresa—, y
 * quien los tiene delante es el asesor. Se guarda solo, como en el portal.
 */
export default function Datos({ exp, onGuardar }) {
  const [borrador, setBorrador] = useState(exp);
  const [editando, setEditando] = useState(false);
  const [tocado, setTocado] = useState(false);
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const version = useRef(0);
  const pendientes = useRef({});

  const set = (k) => (v) => {
    version.current += 1;
    pendientes.current[k] = v;
    setTocado(true);
    setBorrador((p) => ({ ...p, [k]: v }));
  };

  // Solo lo tocado, no la ficha entera: dos personas pueden estar en el mismo
  // expediente y mandar el resto sobrescribiria lo que la otra acabe de poner.
  useEffect(() => {
    if (!tocado) return undefined;
    const t = setTimeout(async () => {
      const v = version.current;
      setGuardandoDatos(true);
      await onGuardar({ ...pendientes.current });
      setGuardandoDatos(false);
      if (version.current === v) { pendientes.current = {}; setTocado(false); }
    }, 900);
    return () => clearTimeout(t);
  }, [borrador, tocado, onGuardar]);

  const rev = exp.revision;
  const faltan = rev?.faltan || [];
  const faltaSet = new Set(faltan);
  const anio = (borrador.fecha_nacimiento || "").slice(0, 4);

  return (
    <div id="bloque-datos" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="1" titulo="El expediente"
        extra={
          <span className="ml-auto flex items-center gap-3">
            {editando && (
              <span className="text-[11px] text-neutral-400">
                {guardandoDatos ? "guardando…" : tocado ? "sin guardar…" : "se guarda solo"}
              </span>
            )}
            <Lapiz editando={editando} onToggle={() => setEditando((v) => !v)} />
            <span className={`text-[11.5px] font-semibold ${
              faltan.length ? "text-amber-600" : "text-[#1D6A4A]"
            }`}>
              {faltan.length ? `${faltan.length} datos sin completar` : "✓ datos completos"}
            </span>
          </span>
        } />

      {/* Las condiciones del contrato, primero: si alguna falla, lo deniegan */}
      <Condiciones exp={borrador} revision={rev} />

      {rev?.avisos?.map((a, i) => (
        <p key={i} className="text-[12px] text-red-700 bg-red-50 border border-red-200
          rounded-lg px-3 py-2 mt-2.5 leading-relaxed">{a}</p>
      ))}

      {SECCIONES.map(([titulo, campos]) => (
        <SeccionEdit key={titulo} titulo={titulo} campos={campos} faltaSet={faltaSet}
          borrador={borrador} set={set} editando={editando} />
      ))}

      <div className="mt-3">
        {editando ? (
          <label className="flex items-center gap-2 text-[12px] text-neutral-600">
            <span>Hijos escolarizados</span>
            <select className={input}
              value={borrador.hijos_escolarizacion === true ? "si"
                : borrador.hijos_escolarizacion === false ? "no" : ""}
              onChange={(e) => set("hijos_escolarizacion")(
                e.target.value === "si" ? true : e.target.value === "no" ? false : null
              )}>
              <option value="">Sin preguntar</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </label>
        ) : (
          <CampoVista label="Hijos escolarizados"
            valor={borrador.hijos_escolarizacion === true ? "Sí"
              : borrador.hijos_escolarizacion === false ? "No" : ""} />
        )}
      </div>

      {(editando || borrador.notas) && (
        <>
          <div className="flex items-center gap-2 mt-3.5 mb-1.5">
            <p className="text-[11.5px] font-semibold text-neutral-600">Lo que nos ha contado</p>
            <span className="flex-1 h-px bg-neutral-100" />
          </div>
          {editando ? (
            <textarea rows={2} value={borrador.notas ?? ""}
              onChange={(e) => set("notas")(e.target.value)}
              placeholder="Cualquier cosa que convenga tener anotada…"
              className={`${input} w-full`} />
          ) : (
            <p className="text-[12.5px] text-neutral-700 bg-neutral-50 border border-neutral-200
              rounded-lg px-3 py-2 leading-relaxed">{borrador.notas}</p>
          )}
        </>
      )}

      {/* De esta fecha salen los tres plazos del trámite, así que va sola y
          arriba: si está mal, todas las demás lo están. */}
      <div className="flex items-center gap-2 mt-4 mb-2">
        <p className="text-[11.5px] font-semibold text-neutral-600">Plazos</p>
        <span className="flex-1 h-px bg-neutral-100" />
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-neutral-500">
          Caducidad del permiso actual (TIE)</span>
        <input type="date" className={`${input} w-44`} defaultValue={exp.venc_tie || ""}
          onBlur={(e) => onGuardar({ venc_tie: e.target.value })} />
      </label>
      <p className="text-[10.5px] text-neutral-400 mt-1.5">
        Se puede presentar desde dos meses antes y hasta tres meses después, pero conviene
        hacerlo antes de que caduque: entre la caducidad y la resolución no hay permiso en
        vigor.
      </p>

      {/* Seguimiento en la sede */}
      <div className="flex items-center gap-2 mt-4 mb-2">
        <p className="text-[11.5px] font-semibold text-neutral-600">
          Seguimiento en extranjería
        </p>
        <span className="flex-1 h-px bg-neutral-100" />
      </div>
      <div className="flex flex-wrap gap-2 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-neutral-500">
            Nº expediente</span>
          <input className={`${input} w-40`} defaultValue={exp.expediente_numero || ""}
            onBlur={(e) => onGuardar({ expediente_numero: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-neutral-500">
            Nº justificante</span>
          <input className={`${input} w-36`} defaultValue={exp.expediente_justificante || ""}
            onBlur={(e) => onGuardar({ expediente_justificante: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-neutral-500">
            NIE</span>
          <input className={`${input} w-32`} defaultValue={exp.expediente_nie || ""}
            onBlur={(e) => onGuardar({ expediente_nie: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-neutral-500">
            Fecha de ingreso</span>
          <input type="date" className={input} defaultValue={exp.expediente_fecha || ""}
            onBlur={(e) => onGuardar({ expediente_fecha: e.target.value })} />
        </label>
        {/* El año no se pide: sale de la fecha de nacimiento, que ya está */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-neutral-500">
            Año de nacimiento</span>
          <span className={`text-[12.5px] px-2.5 py-1.5 rounded-lg border ${
            anio ? "bg-[#EEF2F8] border-[#1A3557]/20 text-[#1A3557] font-bold"
              : "bg-neutral-50 border-neutral-200 text-neutral-400"
          }`}>
            {anio || "al poner su fecha de nacimiento"}
          </span>
        </div>
      </div>
      <p className="text-[10.5px] text-neutral-400 mt-1.5">
        Son los cuatro datos con los que se consulta en la sede. El asesorado los ve en su portal.
      </p>
    </div>
  );
}
