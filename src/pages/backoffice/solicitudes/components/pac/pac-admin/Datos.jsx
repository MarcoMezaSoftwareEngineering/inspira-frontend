import { useEffect, useRef, useState } from "react";
import { Cabecera } from "./Cabecera";
import { CampoVista, Lapiz, SeccionEdit } from "./CamposFicha";
import { input } from "./constantes";

const SI_NO = [["", "—"], ["si", "Sí"], ["no", "No"]];

function CajaPlazo({ titulo, dato }) {
  if (!dato) return null;
  return (
    <div className={`rounded-lg border px-3 py-2 ${dato.a_tiempo ? "border-[#1D6A4A]/30 bg-[#E8F5EE]" : "border-red-300 bg-red-50"}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{titulo}</p>
      <p className={`text-[15px] font-bold leading-tight ${dato.a_tiempo ? "text-[#14532d]" : "text-red-700"}`}>{dato.limite}</p>
      <p className="text-[11px] text-neutral-600">{dato.a_tiempo ? `quedan ${dato.dias_restantes} d` : `vencido hace ${Math.abs(dato.dias_restantes)} d`}</p>
    </div>
  );
}

/**
 * La ficha del solicitante del PAC: quién es, su rol (titular o familiar),
 * la empresa si es titular, el titular si es familiar, el seguro, y lo que
 * lleva Inspira de las dos fases (UGE y consulado) y de la llegada. Se guarda
 * sola, como en el portal; sólo lo tocado.
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
  const esTitular = borrador.rol !== "FAMILIAR";

  const SECCIONES = [
    ["Rol", [
      ["Caso", "rol", "Si eres el titular del PAC o un familiar", { opciones: ["TITULAR", "FAMILIAR"] }],
      ["Cómo se presenta", "presentacion_via", null, { opciones: ["ABOGADO", "CERTIFICADO_PROPIO"] }],
      ["Abogado que presenta", "repr_nombre", null],
      ["Nº colegiado", "repr_colegiado", null],
    ]],
    ...(esTitular ? [] : [["El titular del PAC", [
      ["Vínculo", "vinculo", "Vínculo con el titular del PAC", { opciones: ["CONYUGE", "PAREJA", "HIJO", "ASCENDIENTE"] }],
      ["Titular", "titular_nombre", "Nombre del titular del PAC"],
      ["Pasaporte / NIE del titular", "titular_pasaporte", "Pasaporte o NIE del titular"],
      ["NIE del titular", "titular_nie", null],
      ["Nº expediente UGE del titular", "titular_expediente_uge", "Nº de expediente del titular en la UGE"],
      ["Fecha de su resolución", "titular_resolucion_fecha", null, { tipo: "date" }],
      ["Empresa del titular", "titular_empresa", null],
    ]]]),
    ["Identidad", [
      ["1er apellido", "apellido1", "Primer apellido"],
      ["2º apellido", "apellido2", null],
      ["Nombres", "nombres", "Nombres"],
      ["Sexo", "sexo", "Sexo", { opciones: ["Hombre", "Mujer"] }],
      ["Fecha de nacimiento", "fecha_nacimiento", "Fecha de nacimiento", { tipo: "date" }],
      ["Lugar de nacimiento", "lugar_nacimiento", "Lugar de nacimiento"],
      ["País de nacimiento", "pais_nacimiento", "País de nacimiento"],
      ["Nacionalidad", "nacionalidad", "Nacionalidad"],
      ["Estado civil", "estado_civil", "Estado civil", { opciones: ["Soltero/a", "Casado/a", "Viudo/a", "Divorciado/a", "Unión de hecho"] }],
      ["Padre", "nombre_padre", "Nombre del padre"],
      ["Madre", "nombre_madre", "Nombre de la madre"],
    ]],
    ["Pasaporte y contacto", [
      ["Nº pasaporte", "pasaporte_numero", "Nº de pasaporte"],
      ["DNI", "dni", null],
      ["Emisión pasaporte", "pasaporte_emision", "Fecha de emisión del pasaporte", { tipo: "date" }],
      ["Caducidad pasaporte", "pasaporte_caducidad", "Fecha de caducidad del pasaporte", { tipo: "date" }],
      ["Correo", "correo", "Correo electrónico", { tipo: "email" }],
      ["Teléfono", "telefono", "Teléfono", { tipo: "tel" }],
      ["País actual", "pais_residencia", "País donde vives ahora", { opciones: ["Perú", "España", "Otro"] }],
      ["Domicilio actual", "dom_direccion", "Domicilio actual"],
      ["Localidad actual", "dom_localidad", "Localidad actual"],
      ["Provincia / región", "dom_provincia", null],
      ["Dirección en España", "esp_direccion", null],
      ["Localidad en España", "esp_localidad", null],
      ["C.P. en España", "esp_cp", null],
      ["Provincia en España", "esp_provincia", null],
    ]],
    ...(esTitular ? [["Empresa y contrato", [
      ["Empresa", "emp_razon_social", "Empresa que te contrata"],
      ["NIF", "emp_nif", "NIF de la empresa"],
      ["Localidad del centro", "emp_localidad", null],
      ["Provincia del centro", "emp_provincia", "Provincia del centro de trabajo"],
      ["Puesto", "con_puesto", "Puesto"],
      ["Salario bruto anual (€)", "con_retribucion", "Salario bruto anual"],
      ["Inicio del contrato", "con_inicio", "Inicio previsto del contrato", { tipo: "date" }],
      ["Duración", "con_duracion", null, { opciones: ["1 año", "2 años", "3 años", "Indefinido"] }],
      ["Titulación / experiencia", "titulacion", "Titulación superior o experiencia que acredita"],
      ["Centro", "titulacion_centro", null],
      ["Años de experiencia", "experiencia_anios", null],
    ]]] : []),
    ["Menor de edad", [
      ["Patria potestad", "patria_potestad", null, { opciones: ["AMBOS", "EXCLUSIVA"] }],
      ["Otro progenitor", "otro_progenitor_nombre", null],
      ["Documento del otro progenitor", "otro_progenitor_doc", null],
    ]],
    ["Seguro médico", [
      ["Aseguradora", "seguro_aseguradora", null],
      ["Póliza", "seguro_poliza", null],
      ["Cobertura hasta", "seguro_hasta", null, { tipo: "date" }],
    ]],
    ["Fase 1 · UGE (Mercurio)", [
      ["Nº expediente UGE", "expediente_numero", null],
      ["Nº justificante", "expediente_justificante", null],
      ["Presentada el", "expediente_fecha", null, { tipo: "date" }],
      ["Presentación prevista", "presentacion_prevista", null, { tipo: "date" }],
      ["Tasa (€)", "tasa_importe", null],
      ["Tasa pagada el", "tasa_pagada_fecha", null, { tipo: "date" }],
      ["Resolución", "resolucion_sentido", null, { opciones: ["FAVORABLE", "DESFAVORABLE", "SILENCIO"] }],
      ["Fecha resolución", "resolucion_fecha", null, { tipo: "date" }],
    ]],
    ["Fase 2 · Consulado", [
      ["Consulado", "consulado", null],
      ["Cita BLS", "bls_cita_fecha", null, { tipo: "date" }],
      ["Hora", "bls_cita_hora", null],
      ["Visado presentado", "visado_presentacion_fecha", null, { tipo: "date" }],
      ["Resolución visado", "visado_resolucion", null, { opciones: ["CONCEDIDO", "DENEGADO"] }],
      ["Notificación", "visado_resolucion_fecha", null, { tipo: "date" }],
      ["Recogido el", "visado_recogida_fecha", null, { tipo: "date" }],
      ["Válido hasta", "visado_validez_hasta", null, { tipo: "date" }],
    ]],
    ["En España", [
      ["Entrada", "entrada_fecha", null, { tipo: "date" }],
      ["Empadronamiento", "empadronamiento_fecha", null, { tipo: "date" }],
      ["Huellas", "huellas_fecha", null, { tipo: "date" }],
      ["NIE", "nie", null],
      ["TIE recogida", "tie_fecha", null, { tipo: "date" }],
    ]],
  ];

  const p = rev?.plazos;

  return (
    <div id="bloque-datos" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="1" titulo={esTitular ? "El titular del PAC" : "El familiar del titular"}
        extra={
          <span className="ml-auto flex items-center gap-3">
            {editando && (
              <span className="text-[11px] text-neutral-400">{guardandoDatos ? "guardando…" : tocado ? "sin guardar…" : "se guarda solo"}</span>
            )}
            <Lapiz editando={editando} onToggle={() => setEditando((v) => !v)} />
            <span className={`text-[11.5px] font-semibold ${faltan.length ? "text-amber-600" : "text-[#1D6A4A]"}`}>
              {faltan.length ? `${faltan.length} datos sin completar` : "✓ datos completos"}
            </span>
          </span>
        } />

      {p && (p.uge || p.recogida_visado || p.tie) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
          <CajaPlazo titulo="UGE resuelve antes de" dato={p.uge} />
          <CajaPlazo titulo="Recoger visado antes de" dato={p.recogida_visado} />
          <CajaPlazo titulo="Pedir TIE antes de" dato={p.tie} />
        </div>
      )}
      {rev?.menor && (
        <p className="text-[12px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2 font-semibold">
          Solicitante menor de edad: representante legal y, si el otro progenitor no viaja, autorización notarial apostillada o sentencia de patria potestad.
        </p>
      )}
      {rev?.avisos?.map((a, i) => (
        <p key={i} className="text-[12px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2.5 leading-relaxed">{a}</p>
      ))}

      {SECCIONES.map(([titulo, campos]) => (
        <SeccionEdit key={titulo} titulo={titulo} campos={campos} faltaSet={faltaSet} borrador={borrador} set={set} editando={editando} />
      ))}

      <div className="flex items-center gap-4 flex-wrap mt-3">
        {editando ? (
          <label className="flex items-center gap-2 text-[12px] text-neutral-600">
            <span>Profesión regulada</span>
            <select className={input}
              value={borrador.profesion_regulada === true ? "si" : borrador.profesion_regulada === false ? "no" : ""}
              onChange={(e) => set("profesion_regulada")(e.target.value === "si" ? true : e.target.value === "no" ? false : null)}>
              {SI_NO.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
            </select>
          </label>
        ) : (
          <CampoVista label="Profesión regulada" valor={borrador.profesion_regulada === true ? "Sí (hace falta homologación)" : borrador.profesion_regulada === false ? "No" : ""} />
        )}
      </div>

      {(editando || borrador.notas) && (
        <>
          <div className="flex items-center gap-2 mt-3.5 mb-1.5">
            <p className="text-[11.5px] font-semibold text-neutral-600">Notas</p>
            <span className="flex-1 h-px bg-neutral-100" />
          </div>
          {editando ? (
            <textarea rows={2} value={borrador.notas ?? ""} onChange={(e) => set("notas")(e.target.value)} placeholder="Lo que no cabe en ninguna casilla…" className={`${input} w-full`} />
          ) : (
            <p className="text-[12.5px] text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 leading-relaxed">{borrador.notas}</p>
          )}
        </>
      )}
    </div>
  );
}
