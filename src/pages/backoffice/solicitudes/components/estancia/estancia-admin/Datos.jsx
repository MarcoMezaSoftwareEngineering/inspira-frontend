import { useEffect, useRef, useState } from "react";
import { fechaNumerica } from "../../../../../../lib/formatos";
import { Cabecera } from "./Cabecera";
import { Plazos } from "./Plazos";
import { CampoVista, Lapiz, SeccionEdit } from "./CamposFicha";
import { input } from "./constantes";

/**
 * La ficha del asesorado.
 *
 * Editable: el asesorado rellena lo suyo, pero quien tiene delante la carta de
 * admision cuando el la escribe mal es el asesor, y hasta ahora solo podia
 * mirarla. Se guarda solo, como en el portal.
 */
export function Datos({ exp, onGuardar }) {
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

  // Se guarda al dejar de escribir. Solo lo tocado, no la ficha entera: dos
  // personas pueden estar en el mismo expediente y mandar el resto de campos
  // sobrescribiria lo que la otra acabe de poner.
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
  const usaUni = borrador.dom_usa_universidad;

  // [etiqueta, campo, nombre con el que el servidor lo llama al faltar, extra]
  const SECCIONES = [
    ["Identidad", [
      ["1er apellido", "apellido1", "Primer apellido"],
      ["2º apellido", "apellido2", null],
      ["Nombres", "nombres", "Nombres"],
      ["Sexo", "sexo", "Sexo", { opciones: ["Hombre", "Mujer"] }],
      ["Fecha de nacimiento", "fecha_nacimiento", "Fecha de nacimiento", { tipo: "date" }],
      ["Lugar de nacimiento", "lugar_nacimiento", "Lugar de nacimiento"],
      ["País de nacimiento", "pais_nacimiento", "País de nacimiento"],
      ["Nacionalidad", "nacionalidad", "Nacionalidad"],
      ["Estado civil", "estado_civil", "Estado civil",
        { opciones: ["Soltero/a", "Casado/a", "Viudo/a", "Divorciado/a"] }],
      ["Padre", "nombre_padre", "Nombre del padre"],
      ["Madre", "nombre_madre", "Nombre de la madre"],
    ]],
    ["Documentación y contacto", [
      ["Nº pasaporte", "pasaporte_numero", "Nº de pasaporte"],
      ["DNI", "dni", "DNI"],
      ["Emisión pasaporte", "pasaporte_emision", "Fecha de emisión del pasaporte", { tipo: "date" }],
      ["Caducidad pasaporte", "pasaporte_caducidad", "Fecha de caducidad del pasaporte", { tipo: "date" }],
      ["Correo", "correo", "Correo electrónico", { tipo: "email" }],
      ["Teléfono", "telefono", "Teléfono", { tipo: "tel" }],
    ]],
    ["Fechas", [
      ["Admisión", "fecha_admision", "Fecha de admisión", { tipo: "date" }],
      ["Llegada a España", "fecha_llegada_espana", "Fecha de llegada a España", { tipo: "date" }],
      ["Inicio de clases", "fecha_inicio_clases",
        "Inicio de clases según la carta de admisión", { tipo: "date" }],
      ["Fin de estudios", "prog_fin", "Fin del programa", { tipo: "date" }],
    ]],
    ["Estudios", [
      ["Universidad", "uni_denominacion", "Nombre de la universidad"],
      ["Programa", "prog_denominacion", "Nombre del programa"],
      ["Tipo de estudios", "tipo_estudios", "Tipo de estudios",
        { opciones: ["INTERCAMBIO", "GRADO", "MASTER", "DOCTORADO", "INVESTIGACION"] }],
      ["Tipo de título", "tipo_titulo", "Tipo de título", { opciones: ["OFICIAL", "PROPIO"] }],
      ["Tipo de máster", "master_tipo", null,
        { opciones: ["OFICIAL", "FORMACION_PERMANENTE", "PROPIO"] }],
      ["Créditos", "creditos", null],
      ["Modalidad", "prog_modalidad", "Modalidad",
        { opciones: ["PRESENCIAL", "SEMIPRESENCIAL"] }],
      ["Código", "prog_codigo", null],
    ]],
    ["Universidad · dirección", [
      ["Dirección", "uni_direccion", null],
      ["Localidad", "uni_localidad", null],
      ["C.P.", "uni_cp", null],
      ["Provincia", "uni_provincia", "Provincia de la universidad"],
      ["Registro", "uni_registro_tipo", null, { opciones: ["RUCT", "RCD", "OTRO"] }],
      ["Nº registro", "uni_registro_num", null],
    ]],
    ["Domicilio en España", [
      ["Calle", "dom_direccion", "Domicilio en España"],
      ["Número", "dom_numero", null],
      ["Piso", "dom_piso", null],
      ["Localidad", "dom_localidad", "Localidad en España"],
      ["C.P.", "dom_cp", "Código postal en España"],
      ["Provincia", "dom_provincia", "Provincia en España"],
    ]],
  ];

  return (
    <div id="bloque-datos" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="1" titulo="El asesorado"
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

      {/* Los plazos, primero: son lo que decide si esto corre o puede esperar */}
      <Plazos plazos={rev?.plazos} />

      {rev?.plazos?.escrito_excepcionalidad && (
        <p className="text-[12px] text-red-700 bg-red-50 border border-red-200 rounded-lg
          px-3 py-2 mt-2.5 font-semibold">
          Fuera del plazo de antelación: hace falta la declaración jurada de excepcionalidad.
        </p>
      )}

      {rev?.avisos?.map((a, i) => (
        <p key={i} className="text-[12px] text-red-700 bg-red-50 border border-red-200
          rounded-lg px-3 py-2 mt-2.5 leading-relaxed">{a}</p>
      ))}

      {SECCIONES.map(([titulo, campos]) => (
        <SeccionEdit key={titulo} titulo={titulo} campos={campos} faltaSet={faltaSet}
          borrador={borrador} set={set} editando={editando} />
      ))}

      <div className="flex items-center gap-4 flex-wrap mt-3">
        {editando ? (
          <>
            <label className="flex items-center gap-2 text-[12px] text-neutral-600">
              <input type="checkbox" className="accent-[#023A4B]" checked={Boolean(usaUni)}
                onChange={(e) => set("dom_usa_universidad")(e.target.checked)} />
              Usa la dirección de la universidad
            </label>
            <label className="flex items-center gap-2 text-[12px] text-neutral-600">
              <span>Schengen 180 días</span>
              <select className={input}
                value={borrador.viaje_schengen_180 === true ? "si"
                  : borrador.viaje_schengen_180 === false ? "no" : ""}
                onChange={(e) => set("viaje_schengen_180")(
                  e.target.value === "si" ? true : e.target.value === "no" ? false : null
                )}>
                <option value="">Sin preguntar</option>
                <option value="si">Sí, ha viajado</option>
                <option value="no">No</option>
              </select>
            </label>
          </>
        ) : (
          <>
            <CampoVista label="Domicilio de la universidad"
              valor={usaUni ? "Sí, usa el de la universidad" : "No"} />
            <CampoVista label="Schengen 180 días"
              valor={borrador.viaje_schengen_180 === true ? "Sí, ha viajado"
                : borrador.viaje_schengen_180 === false ? "No" : ""} />
          </>
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
              placeholder="Un NIE anterior, una estancia previa, cualquier cosa…"
              className={`${input} w-full`} />
          ) : (
            <p className="text-[12.5px] text-neutral-700 bg-neutral-50 border border-neutral-200
              rounded-lg px-3 py-2 leading-relaxed">{borrador.notas}</p>
          )}
        </>
      )}

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
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-neutral-500">
            Estado en consulta</span>
          <select className={`${input} w-44`} value={exp.consulta_estado || ""}
            onChange={(e) => onGuardar({ consulta_estado: e.target.value })}>
            {[["", "Sin consultar"], ["EN_TRAMITE", "En trámite"], ["REQUERIDO", "Requerimiento"], ["RESUELTO_FAVORABLE", "Resuelto · favorable"], ["RESUELTO_DESFAVORABLE", "Resuelto · desfavorable"], ["RECURSO", "En recurso"], ["ARCHIVADO", "Archivado"]].map(([k, t]) => (
              <option key={k} value={k}>{t}</option>
            ))}
          </select>
          {exp.consulta_fecha && (
            <span className="text-[11px] text-neutral-500">
              Última consulta: {fechaNumerica(exp.consulta_fecha)}{exp.consulta_por ? ` · ${exp.consulta_por}` : ""}
            </span>
          )}
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
