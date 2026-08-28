// Panel del asesor para la estancia por estudios.
//
// Empieza por el punto 0 —dónde está el expediente— porque es lo primero que
// necesita saber quien lo abre: qué le toca hacer ahora.
//
// Los documentos van como checklist con aprobar y observar, no como listado:
// que un documento esté subido no significa que sirva. Extranjería devuelve
// los que no cumplen, así que alguien tiene que mirarlos antes de presentar y
// el asesorado tiene que saber si el suyo pasó.
import { useCallback, useEffect, useRef, useState } from "react";
import { boGET, boPATCH, boPOST, boFetch } from "../../../../../services/backofficeApi";
import Invitados from "../Invitados";
import AcompanantesAdmin from "./AcompanantesAdmin";
import GeneradoresEstancia from "./GeneradoresEstancia";
import RecordatorioEstancia from "./RecordatorioEstancia";
import { abrirArchivo } from "../../../../../services/archivos";
import VisorArchivo from "../../../../../components/common/VisorArchivo";
import { dialog } from "../../../../../services/dialogService";

const TONOS = {
  neutral: "bg-neutral-100 text-neutral-700 border-neutral-300",
  azul:    "bg-[#EEF2F8] text-[#1A3557] border-[#1A3557]/25",
  ambar:   "bg-amber-50 text-amber-800 border-amber-300",
  violeta: "bg-violet-50 text-violet-800 border-violet-300",
  rojo:    "bg-red-50 text-red-800 border-red-300",
  verde:   "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35",
};

const input = "text-[12px] border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white " +
  "focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]";

function Cabecera({ numero, titulo, extra }) {
  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[12px]
        font-bold text-white font-serif" style={{ background: "#023A4B" }}>{numero}</span>
      <span className="text-[13.5px] font-bold text-[#1A3557]">{titulo}</span>
      {extra}
    </div>
  );
}

/* ── 0 · Flujo ───────────────────────────────────────────────────────────── */

function Flujo({ revision, onCambiar, guardando }) {
  const recorrido = revision?.recorrido || [];
  const etapa = revision?.etapa;
  if (!etapa) return null;

  return (
    <div id="bloque-flujo" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="0" titulo="Dónde está el expediente"
        extra={
          <span className={`ml-auto text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded border ${TONOS[etapa.tono]}`}>
            {etapa.asesor}
          </span>
        } />

      {/* Los pasos son botones: mover el expediente es la acción más frecuente
          de esta pantalla, y esconderla en un desplegable la vuelve lenta. */}
      <div className="flex flex-wrap gap-1.5">
        {recorrido.map((e) => (
          <button
            key={e.clave} type="button" disabled={guardando}
            onClick={() => onCambiar(e.clave)}
            className={`text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
              e.actual ? `${TONOS[e.tono]} ring-1 ring-offset-1 ring-[#023A4B]`
                : e.pasada ? "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/25"
                : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
            } disabled:opacity-50`}
          >
            {e.pasada && "✓ "}{e.asesor}
          </button>
        ))}
        <button type="button" disabled={guardando} onClick={() => onCambiar("DESFAVORABLE")}
          className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg border border-red-200
            text-red-600 hover:bg-red-50 disabled:opacity-50">
          Desfavorable
        </button>
      </div>

      <p className="text-[11.5px] text-neutral-500 mt-2.5 leading-relaxed">
        El asesorado ve «{etapa.cliente}»: {etapa.explica_cliente}
      </p>
    </div>
  );
}

/* ── 1 · Datos y plazos ──────────────────────────────────────────────────── */

function Plazos({ plazos }) {
  if (!plazos) return null;
  const filas = [
    ["Antelación · 2 meses antes de clases", plazos.antelacion],
    ["Tope desde la llegada a España", plazos.tope],
  ].filter(([, d]) => d);
  if (!filas.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {filas.map(([label, d]) => (
        <div key={label} className={`rounded-xl border px-3 py-2.5 ${
          d.a_tiempo ? "border-[#1D6A4A]/25 bg-[#E8F5EE]/50" : "border-red-300 bg-red-50/60"
        }`}>
          <p className="text-[10px] font-bold uppercase tracking-wide font-mono text-neutral-500 leading-tight">
            {label}
          </p>
          <p className={`text-[17px] font-bold leading-tight mt-0.5 ${
            d.a_tiempo ? "text-[#14532d]" : "text-red-700"
          }`}>{d.limite}</p>
          <p className="text-[11px] text-neutral-500">
            {d.a_tiempo ? `quedan ${d.dias_restantes} días` : `pasado hace ${Math.abs(d.dias_restantes)} días`}
          </p>
        </div>
      ))}
    </div>
  );
}

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
function CampoEdit({ label, valor, onChange, falta, tipo = "text", opciones }) {
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
function CampoVista({ label, valor, falta }) {
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
function Lapiz({ editando, onToggle }) {
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

function SeccionEdit({ titulo, campos, faltaSet, borrador, set, editando }) {
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

/**
 * La ficha del asesorado.
 *
 * Editable: el asesorado rellena lo suyo, pero quien tiene delante la carta de
 * admision cuando el la escribe mal es el asesor, y hasta ahora solo podia
 * mirarla. Se guarda solo, como en el portal.
 */
function Datos({ exp, onGuardar }) {
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

/* ── 2 · Documentos: checklist con revisión ──────────────────────────────── */

const ESTADO_DOC = {
  SIN_SUBIR: { icono: "○", label: "sin subir",   clase: "text-neutral-300" },
  PENDIENTE: { icono: "◐", label: "por revisar", clase: "text-amber-500" },
  APROBADO:  { icono: "✓", label: "aprobado",    clase: "text-[#1D6A4A]" },
  OBSERVADO: { icono: "✕", label: "observado",   clase: "text-red-600" },
};

function FilaDocumento({ id, clave, def, onCambio, onSubir, subiendo, onVer }) {
  const [observando, setObservando] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  const ultimo = def.archivos[0];
  const est = ESTADO_DOC[def.estado] || ESTADO_DOC.SIN_SUBIR;

  async function revisar(estado, observacion) {
    if (!ultimo) return;
    setEnviando(true);
    const r = await boPATCH(
      `/backoffice/solicitudes/${id}/estancia/documentos/archivo/${ultimo.id_documento}/revision`,
      { estado, observacion }
    );
    setEnviando(false);
    if (r?.ok) { setObservando(false); setTexto(""); onCambio(); }
  }

  const fondo =
    def.estado === "APROBADO" ? "border-[#1D6A4A]/25 bg-[#E8F5EE]/40"
      : def.estado === "OBSERVADO" ? "border-red-300 bg-red-50/50"
      : def.estado === "PENDIENTE" ? "border-amber-300 bg-amber-50/40"
      : "border-neutral-200 bg-white";

  return (
    <div className={`rounded-xl border px-3 py-2.5 ${fondo}`}>
      <div className="flex items-start gap-2.5">
        <span className={`shrink-0 mt-0.5 text-[15px] font-bold leading-none ${est.clase}`}>
          {est.icono}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12.5px] font-semibold text-neutral-800">{def.etiqueta}</span>
            {def.obligatorio && def.estado === "SIN_SUBIR" && (
              <span className="text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5
                rounded bg-neutral-100 text-neutral-500">obligatorio</span>
            )}
            {ultimo?.subido_por_quien && (
          <span className="text-[10.5px] text-neutral-400 truncate max-w-[30%]"
            title={`Lo subió ${ultimo.subido_por_quien}`}>
            {ultimo.subido_por_quien}
          </span>
        )}
        <span className={`text-[10px] font-bold uppercase tracking-wide ${est.clase}`}>
              {est.label}
            </span>
          </div>

          {def.requisito && (
            <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">{def.requisito}</p>
          )}

          {/* El asesor tiene que poder ver el mismo ejemplo que ve el asesorado,
              para saber que le esta ensenando cuando se lo reclama. */}
          {def.modelo && (
            <a href={def.modelo} target="_blank" rel="noreferrer"
              className="inline-block text-[11px] font-semibold text-[#046C8C] hover:underline mt-1">
              Ver el ejemplo ↗
            </a>
          )}

          {def.archivos.map((a) => (
            <button type="button" key={a.id_documento}
              onClick={() => onVer(a)}
              className="block text-[11.5px] text-[#046C8C] hover:underline truncate mt-1">
              📄 {a.nombre}
            </button>
          ))}

          {ultimo?.observacion && (
            <p className="text-[11.5px] text-red-700 bg-red-50 border border-red-200
              rounded-lg px-2 py-1.5 mt-1.5 leading-relaxed">
              <b>Observado:</b> {ultimo.observacion}
            </p>
          )}

          {observando && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <input autoFocus className={`${input} flex-1 min-w-[160px]`}
                placeholder="Qué tiene que corregir…"
                value={texto} onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && texto.trim() && revisar("OBSERVADO", texto)} />
              <button type="button" disabled={!texto.trim() || enviando}
                onClick={() => revisar("OBSERVADO", texto)}
                className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg bg-red-600
                  text-white disabled:opacity-40">Observar</button>
              <button type="button" onClick={() => setObservando(false)}
                className="text-[11.5px] text-neutral-500 hover:text-neutral-800">Cancelar</button>
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          {ultimo && !observando && (
            <>
              {def.estado !== "APROBADO" && (
                <button type="button" disabled={enviando} onClick={() => revisar("APROBADO")}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg border
                    border-[#1D6A4A]/40 text-[#1D6A4A] hover:bg-[#E8F5EE] disabled:opacity-40">
                  Aprobar
                </button>
              )}
              {def.estado !== "OBSERVADO" && (
                <button type="button" disabled={enviando} onClick={() => setObservando(true)}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg border
                    border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40">
                  Observar
                </button>
              )}
            </>
          )}
          {def.de === "asesor" && (
            <label className="text-[11px] font-semibold text-[#023A4B] cursor-pointer hover:underline px-1">
              {subiendo === clave ? "…" : def.archivos.length ? "reemplazar" : "subir"}
              <input type="file" className="hidden" accept="application/pdf,image/*"
                onChange={(e) => onSubir(clave, e.target.files?.[0])} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

function Documentos({ id, docs, onCambio }) {
  const [subiendo, setSubiendo] = useState("");
  // Qué documento se está mirando. null = ninguno, no hay ventana.
  const [viendo, setViendo] = useState(null);
  const [abriendoCarpeta, setAbriendoCarpeta] = useState(false);

  /** Aprobar u observar sin salir del documento, que es como se revisa. */
  async function revisarDesdeVisor(archivo, estado, observacion = null) {
    const r = await boPATCH(
      `/backoffice/solicitudes/${id}/estancia/documentos/archivo/${archivo.id_documento}/revision`,
      { estado, observacion },
    );
    if (r?.ok) onCambio();
    else dialog.toast("No se pudo guardar la revisión", "error");
  }

  /**
   * Abre en Drive la carpeta del asesorado.
   *
   * La pestaña se pide ANTES de la llamada: si se abriera al recibir la
   * respuesta, el navegador la trataría como emergente y la bloquearía.
   *
   * Sin "noopener": con esa opción `window.open` devuelve null por
   * especificación, y sin referencia no hay forma de mandar la pestaña a Drive
   * después. El aislamiento se consigue anulando `opener` a mano.
   *
   * Y si aun así no hay pestaña —en el móvil las emergentes se bloquean casi
   * siempre— se navega en la misma. Es peor que abrir al lado, pero llega.
   */
  async function abrirCarpeta() {
    const ventana = window.open("", "_blank");
    if (ventana) { try { ventana.opener = null; } catch { /* da igual */ } }

    setAbriendoCarpeta(true);
    const r = await boGET(`/backoffice/solicitudes/${id}/estancia/carpeta-drive`);
    setAbriendoCarpeta(false);

    if (r?.ok && r.url) {
      if (ventana) ventana.location.replace(r.url);
      else window.location.assign(r.url);
      return;
    }

    ventana?.close();
    dialog.toast(r?.msg || "No se pudo abrir la carpeta en Drive", "error");
  }

  async function subir(clave, archivo) {
    if (!archivo) return;
    setSubiendo(clave);
    const datos = new FormData();
    datos.append("archivo", archivo);
    const r = await boFetch(`/backoffice/solicitudes/${id}/estancia/documentos/${clave}`, {
      method: "POST", body: datos,
    });
    setSubiendo("");
    if (r?.ok) onCambio();
  }

  const del = (de) => Object.entries(docs?.ranuras || {}).filter(([, d]) => d.de === de);
  const oblig = docs ? Object.values(docs.ranuras).filter((d) => d.obligatorio) : [];
  const aprobados = oblig.filter((d) => d.estado === "APROBADO").length;
  const pct = oblig.length ? (aprobados / oblig.length) * 100 : 0;

  return (
    <div id="bloque-documentos" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="2" titulo="Documentos"
        extra={
          <>
            <span className="ml-auto text-[11.5px] text-neutral-500">
              {aprobados} de {oblig.length} aprobados
            </span>
            {/* Hasta ahora este enlace solo salía al avisar a la abogada, así
                que para ver los archivos había que mandarle un correo. */}
            <button
              type="button"
              onClick={abrirCarpeta}
              disabled={abriendoCarpeta}
              className="text-[11.5px] px-2.5 py-1 rounded-lg border border-neutral-300
                hover:bg-neutral-50 disabled:opacity-50 shrink-0"
            >
              {abriendoCarpeta ? "Abriendo…" : "📁 Abrir carpeta del asesorado"}
            </button>
          </>
        } />

      {/* De un vistazo, cuánto falta para poder presentar */}
      <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden mb-4">
        <div className="h-full bg-[#1D6A4A] transition-all" style={{ width: `${pct}%` }} />
      </div>

      <p className="text-[11.5px] font-semibold text-neutral-600 mb-2">
        Los aporta el asesorado
      </p>
      <div className="space-y-1.5 mb-4">
        {del("cliente").map(([clave, d]) => (
          <FilaDocumento key={clave} id={id} clave={clave} def={d}
            onCambio={onCambio} onSubir={subir} subiendo={subiendo} onVer={setViendo} />
        ))}
      </div>

      <p className="text-[11.5px] font-semibold text-neutral-600 mb-2">
        Los prepara Inspira
      </p>
      <div className="space-y-1.5">
        {del("asesor").map(([clave, d]) => (
          <FilaDocumento key={clave} id={id} clave={clave} def={d}
            onCambio={onCambio} onSubir={subir} subiendo={subiendo} onVer={setViendo} />
        ))}
      </div>

      {viendo && (
        <VisorArchivo
          interno
          ruta={`/backoffice/solicitudes/${id}/estancia/documentos/archivo/${viendo.id_documento}`}
          nombre={viendo.nombre}
          mime={viendo.mime}
          tamano={viendo.tamano}
          onAprobar={() => revisarDesdeVisor(viendo, "APROBADO")}
          onObservar={(motivo) => revisarDesdeVisor(viendo, "OBSERVADO", motivo)}
          onCerrar={() => setViendo(null)}
        />
      )}
    </div>
  );
}

/* ── Pasarle la carpeta a la abogada ─────────────────────────────────────── */

/**
 * Un paso distinto de cerrar la carpeta.
 *
 * Cerrarla le dice al asesorado que su parte terminó. Esto se la entrega a
 * quien la va a presentar, con el enlace directo a Drive para que no tenga que
 * buscarla entre carpetas. Son dos avisos a dos personas distintas, y hacerlos
 * a la vez obligaría a esperar a que el cliente estuviera listo para poder
 * mandarle nada a la letrada.
 */
function PasarAAbogada({ id, exp, onHecho }) {
  const [abierto, setAbierto] = useState(false);
  const [para, setPara] = useState(exp.abogada_email || "");
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  const ya = exp.abogada_avisada_at;

  async function enviar() {
    setEnviando(true); setMsg("");
    const r = await boPOST(`/backoffice/solicitudes/${id}/estancia/avisar-abogada`, {
      para: para.trim(),
      nota: nota.trim() || null,
    });
    setEnviando(false);
    if (r?.ok) {
      const acceso = !r.carpeta ? "sin enlace: Drive no respondió"
        : r.acceso?.nuevo ? "con el enlace y acceso a la carpeta del asesorado"
        : r.acceso?.compartida ? "con el enlace; ya tenía acceso"
        : "con el enlace, pero NO se le pudo dar acceso: compártesela a mano";
      setMsg(`Enviado a ${r.para} ${acceso}`);
      setAbierto(false);
      onHecho();
    } else {
      setMsg(r?.msg || "No se pudo enviar");
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <Cabecera numero="4b" titulo="Pasársela a la abogada"
        extra={ya ? (
          <span className="ml-auto text-[11px] font-bold uppercase tracking-wide px-2 py-1
            rounded border bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35">
            avisada
          </span>
        ) : null} />

      {ya && !abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[12.5px] text-neutral-600 leading-relaxed min-w-0 flex-1">
            Avisada el {new Date(ya).toLocaleDateString("es-ES",
              { day: "2-digit", month: "long", year: "numeric" })}
            {exp.abogada_email && <> a <b>{exp.abogada_email}</b></>}.
          </p>
          <button type="button" onClick={() => setAbierto(true)}
            className="shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg border
              border-neutral-300 text-neutral-600 hover:border-neutral-400">
            Volver a enviar
          </button>
        </div>
      ) : !abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[12.5px] text-neutral-600 leading-relaxed min-w-0 flex-1">
            Le manda un correo con el estado de los documentos y el enlace a la carpeta
            <b> de este asesorado</b>, y le da acceso a esa carpeta —sólo a esa— para que
            pueda abrirla y dejar ahí lo que llegue de extranjería.
          </p>
          <button type="button" onClick={() => setAbierto(true)}
            className="shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg
              bg-[#1A3557] text-white hover:opacity-90">
            Enviar a la abogada
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div>
            <p className="text-[11.5px] font-semibold text-neutral-600 mb-1">Correo de la abogada</p>
            <input type="email" value={para} onChange={(e) => setPara(e.target.value)}
              placeholder="nombre@despacho.com" className={input + " w-full"} />
          </div>
          <div>
            <p className="text-[11.5px] font-semibold text-neutral-600 mb-1">
              Nota para ella <span className="text-neutral-400 font-normal">(opcional)</span>
            </p>
            <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)}
              placeholder="Cualquier cosa que deba saber antes de abrirla…"
              className={input + " w-full"} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={enviar} disabled={enviando || !para.trim()}
              className="text-[12px] font-semibold px-4 py-2 rounded-lg bg-[#1A3557]
                text-white hover:opacity-90 disabled:opacity-40">
              {enviando ? "Enviando…" : "Enviar"}
            </button>
            <button type="button" onClick={() => setAbierto(false)}
              className="text-[12px] text-neutral-500 hover:text-neutral-700">cancelar</button>
            {msg && <span className="text-[11.5px] text-neutral-600">{msg}</span>}
          </div>
        </div>
      )}
      {!abierto && msg && <p className="text-[11.5px] text-[#1D6A4A] mt-2">{msg}</p>}
    </div>
  );
}

/* ── 3 · Extranjería ─────────────────────────────────────────────────────── */

/**
 * Un registro sin clasificar.
 *
 * Lo dejo la letrada en la carpeta de Drive y el vigilante lo anoto, pero
 * nadie le ha dicho todavia al asesorado que existe: de un nombre de archivo
 * no se saca si es una resolucion favorable o un requerimiento con diez dias
 * corriendo, y el aviso vale por esa diferencia.
 */
function SinClasificar({ id, r, onCambio }) {
  const [f, setF] = useState({
    tipo: "NOTIFICACION", titulo: r.titulo, fecha: "", plazo: "",
  });
  const [avisar, setAvisar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  async function guardar() {
    setEnviando(true); setMsg("");
    const resp = await boPATCH(
      `/backoffice/solicitudes/${id}/estancia/extranjeria/${r.id_registro}`,
      { ...f, avisar },
    );
    setEnviando(false);
    if (resp?.ok) { onCambio(); } else { setMsg(resp?.msg || "No se pudo guardar"); }
  }

  return (
    <div className="border-2 border-amber-300 bg-amber-50/50 rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border
          bg-amber-100 text-amber-800 border-amber-300">sin clasificar</span>
        <span className="text-[12.5px] font-semibold text-neutral-800 min-w-0 flex-1 truncate">
          {r.titulo}
        </span>
      </div>
      <p className="text-[11.5px] text-neutral-600 leading-relaxed mb-2">
        Apareció en la carpeta de Drive y no lo subió el portal. Al asesorado
        <b> todavía no se le ha dicho nada</b>.
      </p>

      <div className="flex flex-wrap gap-2 mb-2">
        <select className={input} value={f.tipo}
          onChange={(e) => setF({ ...f, tipo: e.target.value })}>
          <option value="REQUERIMIENTO">Requerimiento</option>
          <option value="TASA">Solicitud de tasa</option>
          <option value="NOTIFICACION">Notificación</option>
          <option value="RESOLUCION">Resolución</option>
        </select>
        <input className={`${input} flex-1 min-w-[150px]`} placeholder="Título"
          value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} />
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-500">
          Fecha del documento
          <input type="date" className={input} value={f.fecha}
            onChange={(e) => setF({ ...f, fecha: e.target.value })} />
        </label>
        <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-500">
          Plazo para responder
          <input type="date" className={input} value={f.plazo}
            onChange={(e) => setF({ ...f, plazo: e.target.value })} />
        </label>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-600">
          <input type="checkbox" checked={avisar} className="accent-[#1D6A4A]"
            onChange={(e) => setAvisar(e.target.checked)} />
          Avisar al asesorado
        </label>
        <button type="button" onClick={guardar} disabled={enviando}
          className="text-[12px] font-semibold px-4 py-1.5 rounded-lg bg-[#1D6A4A]
            text-white hover:opacity-90 disabled:opacity-40">
          {enviando ? "…" : "Clasificar y avisar"}
        </button>
        {msg && <span className="text-[11.5px] text-red-600">{msg}</span>}
      </div>
    </div>
  );
}

function Extranjeria({ id, registros, onCambio }) {
  const [abierto, setAbierto] = useState(false);
  const [f, setF] = useState({ tipo: "REQUERIMIENTO", titulo: "", detalle: "", fecha: "", plazo: "" });
  const [archivo, setArchivo] = useState(null);
  const [avisar, setAvisar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  async function registrar() {
    setEnviando(true); setMsg("");
    const datos = new FormData();
    Object.entries(f).forEach(([k, v]) => v && datos.append(k, v));
    datos.append("avisar", avisar ? "true" : "false");
    if (archivo) datos.append("archivo", archivo);
    const r = await boFetch(`/backoffice/solicitudes/${id}/estancia/extranjeria`, {
      method: "POST", body: datos,
    });
    const j = await r?.json().catch(() => null);
    setEnviando(false);
    setMsg(j?.msg || (j?.ok ? "Registrado" : "No se pudo registrar"));
    if (j?.ok) {
      setF({ tipo: "REQUERIMIENTO", titulo: "", detalle: "", fecha: "", plazo: "" });
      setArchivo(null); setAbierto(false); onCambio();
    }
  }

  return (
    <div id="bloque-extranjeria" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="6" titulo="Extranjería"
        extra={
          <>
            {registros.some((r) => r.sin_clasificar) && (
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full
                bg-amber-100 text-amber-800 border border-amber-300">
                {registros.filter((r) => r.sin_clasificar).length} sin clasificar
              </span>
            )}
            <button type="button" onClick={() => setAbierto((v) => !v)}
              className="ml-auto text-[11.5px] font-semibold text-[#023A4B] hover:underline">
              {abierto ? "Cancelar" : "+ Registrar comunicación"}
            </button>
          </>
        } />

      {abierto && (
        <div className="border border-dashed border-[#023A4B]/30 rounded-xl p-3 mb-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <select className={input} value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
              <option value="REQUERIMIENTO">Requerimiento</option>
              <option value="TASA">Solicitud de tasa</option>
              <option value="NOTIFICACION">Notificación</option>
              <option value="RESOLUCION">Resolución</option>
            </select>
            <input className={`${input} flex-1 min-w-[160px]`} placeholder="Título"
              value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-500">
              Fecha del documento
              <input type="date" className={input} value={f.fecha}
                onChange={(e) => setF({ ...f, fecha: e.target.value })} />
            </label>
            <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-500">
              Plazo para responder
              <input type="date" className={input} value={f.plazo}
                onChange={(e) => setF({ ...f, plazo: e.target.value })} />
            </label>
          </div>
          <textarea rows={2} className={`${input} w-full`} placeholder="Detalle para el cliente…"
            value={f.detalle} onChange={(e) => setF({ ...f, detalle: e.target.value })} />
          <div className="flex items-center gap-3 flex-wrap">
            <label className={`${input} cursor-pointer ${archivo ? "border-[#1D6A4A] text-[#1D6A4A] font-semibold" : "text-neutral-500"}`}>
              {archivo ? `✓ ${archivo.name.slice(0, 24)}` : "📎 Adjuntar documento"}
              <input type="file" className="hidden" accept="application/pdf,image/*"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
            </label>
            <label className="flex items-center gap-1.5 text-[12px] text-neutral-600">
              <input type="checkbox" checked={avisar} onChange={(e) => setAvisar(e.target.checked)} />
              Avisar al cliente por correo
            </label>
            <button type="button" onClick={registrar} disabled={enviando || !f.titulo.trim()}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#1D6A4A] text-white disabled:opacity-40">
              {enviando ? "…" : "Registrar"}
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            El aviso va por defecto: los plazos de subsanación se cuentan desde la
            notificación y enterarse tarde cuesta el expediente.
          </p>
        </div>
      )}

      {msg && <p className="text-[11.5px] text-neutral-600 mb-2">{msg}</p>}

      {registros.length === 0 ? (
        <p className="text-[12px] text-neutral-400">Sin comunicaciones registradas.</p>
      ) : (
        <div className="space-y-2">
          {registros.map((r) => (r.sin_clasificar ? (
            <SinClasificar key={r.id_registro} id={id} r={r} onCambio={onCambio} />
          ) : (
            <div key={r.id_registro} className="border border-neutral-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                  r.tipo === "RESOLUCION" ? TONOS.verde : r.tipo === "REQUERIMIENTO" ? TONOS.rojo : TONOS.ambar
                }`}>{r.tipo_label}</span>
                <span className="text-[12.5px] font-semibold text-neutral-800">{r.titulo}</span>
                {r.notificado_at
                  ? <span className="ml-auto text-[10.5px] text-[#1D6A4A]">✓ avisado</span>
                  : <span className="ml-auto text-[10.5px] text-amber-600">sin avisar</span>}
              </div>
              {r.plazo && <p className="text-[11.5px] text-red-700 mt-0.5">Plazo: {r.plazo}</p>}
              {r.tiene_archivo && (
                <button type="button" onClick={() => abrirArchivo(`/backoffice/solicitudes/${id}/estancia/extranjeria/${r.id_registro}/archivo`, { interno: true })}
                  className="text-[11px] text-[#046C8C] hover:underline">📄 {r.archivo_nombre}</button>
              )}
            </div>
          )))}
        </div>
      )}
    </div>
  );
}

/**
 * El asesorado ha pedido revision.
 *
 * Va arriba del todo y en color: es una peticion con alguien esperando al otro
 * lado, no una notificacion mas.
 */
function RevisionPedida({ exp }) {
  if (!exp.revision_solicitada_at) return null;
  const cuando = new Date(exp.revision_solicitada_at)
    .toLocaleDateString("es-ES", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });
  return (
    <div className="rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3 flex gap-3">
      <span className="shrink-0 text-[16px]">🔔</span>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-amber-900">
          Ha pedido revision de sus documentos
        </p>
        <p className="text-[11.5px] text-amber-700 mt-0.5">{cuando}</p>
        {exp.revision_nota && (
          <p className="text-[12.5px] text-amber-900 leading-relaxed mt-1.5">
            <b>Dice:</b> {exp.revision_nota}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Cerrar la carpeta.
 *
 * Es el momento en que el expediente pasa al staff de abogados y deja de estar
 * en manos del asesorado. Se le avisa con la fecha prevista de presentacion,
 * que es lo unico que va a querer saber a partir de aqui.
 */
function CerrarCarpeta({ id, exp, docs, onHecho }) {
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState(exp.presentacion_prevista || "");
  const [avisar, setAvisar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  const oblig = docs ? Object.values(docs.ranuras).filter((d) => d.obligatorio) : [];
  const aprobados = oblig.filter((d) => d.estado === "APROBADO").length;
  const todoAprobado = oblig.length > 0 && aprobados === oblig.length;
  const yaCerrada = Boolean(exp.carpeta_lista_at);

  async function cerrar() {
    setEnviando(true); setMsg("");
    const r = await boPOST(`/backoffice/solicitudes/${id}/estancia/carpeta-lista`, {
      presentacion_prevista: fecha || null,
      avisar,
    });
    setEnviando(false);
    setMsg(r?.msg || (r?.ok ? "Cerrada" : "No se pudo cerrar"));
    if (r?.ok) { setAbierto(false); onHecho(); }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <Cabecera numero="4" titulo="Cerrar la carpeta"
        extra={
          yaCerrada ? (
            <span className="ml-auto text-[11px] font-bold uppercase tracking-wide px-2 py-1
              rounded border bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35">
              cerrada
            </span>
          ) : (
            <span className={`ml-auto text-[11.5px] font-semibold ${
              todoAprobado ? "text-[#1D6A4A]" : "text-neutral-400"
            }`}>
              {aprobados} de {oblig.length} aprobados
            </span>
          )
        } />

      {yaCerrada ? (
        <p className="text-[12.5px] text-neutral-600 leading-relaxed">
          Cerrada el {new Date(exp.carpeta_lista_at).toLocaleDateString("es-ES",
            { day: "2-digit", month: "long", year: "numeric" })}
          {exp.presentacion_prevista && <> · presentacion prevista el <b>{exp.presentacion_prevista}</b></>}.
          El asesorado ya fue avisado.
        </p>
      ) : !abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[12.5px] text-neutral-600 leading-relaxed min-w-0 flex-1">
            Marca la carpeta como revisada y terminada. Se le avisa de que pasa al staff de
            abogados y de cuando esta prevista la presentacion.
          </p>
          <button type="button" onClick={() => setAbierto(true)}
            className={`shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg ${
              todoAprobado ? "bg-[#1D6A4A] text-white hover:opacity-90"
                : "border border-neutral-300 text-neutral-600 hover:border-neutral-400"
            }`}>
            Cerrar carpeta
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {!todoAprobado && (
            <p className="text-[12px] text-amber-800 bg-amber-50 border border-amber-300
              rounded-lg px-3 py-2 leading-relaxed">
              Todavia hay {oblig.length - aprobados} documento(s) obligatorio(s) sin aprobar.
              Puedes cerrarla igual, pero revisa que no falte nada.
            </p>
          )}
          <label className="flex items-center gap-2 text-[12px] text-neutral-600">
            Presentacion prevista
            <input type="date" className={input} value={fecha}
              onChange={(e) => setFecha(e.target.value)} />
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-neutral-600">
            <input type="checkbox" checked={avisar} onChange={(e) => setAvisar(e.target.checked)} />
            Avisar al asesorado por correo
          </label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={cerrar} disabled={enviando}
              className="text-[12px] font-semibold px-4 py-2 rounded-lg bg-[#1D6A4A]
                text-white disabled:opacity-40">
              {enviando ? "Cerrando…" : "Cerrar y avisar"}
            </button>
            <button type="button" onClick={() => setAbierto(false)}
              className="text-[12px] text-neutral-500 hover:text-neutral-800">Cancelar</button>
          </div>
        </div>
      )}
      {msg && <p className="text-[11.5px] text-neutral-600 mt-2">{msg}</p>}
    </div>
  );
}

/* ── Principal ───────────────────────────────────────────────────────────── */

export default function EstanciaAdmin({ idSolicitud }) {
  const [exp, setExp] = useState(null);
  const [docs, setDocs] = useState(null);
  const [ext, setExt] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(() => Promise.all([
    boGET(`/backoffice/solicitudes/${idSolicitud}/estancia`),
    boGET(`/backoffice/solicitudes/${idSolicitud}/estancia/documentos`),
    boGET(`/backoffice/solicitudes/${idSolicitud}/estancia/extranjeria`),
  ]).then(([a, b, c]) => {
    if (a?.ok) setExp(a.expediente);
    if (b?.ok) setDocs(b);
    if (c?.ok) setExt(c.registros || []);
  }), [idSolicitud]);

  useEffect(() => { cargar(); }, [cargar]);

  const guardar = useCallback(async (cambios) => {
    setGuardando(true);
    const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/estancia`, cambios);
    setGuardando(false);
    if (r?.ok) setExp(r.expediente);
  }, [idSolicitud]);

  if (!exp) return <p className="text-[13px] text-neutral-400 py-6">Cargando el expediente…</p>;

  return (
    <div className="space-y-3">
      <RevisionPedida exp={exp} />
      <Flujo revision={exp.revision} guardando={guardando}
        onCambiar={(estado_proceso) => guardar({ estado_proceso })} />
      <Invitados idSolicitud={idSolicitud} numero="0b" />
      <Datos exp={exp} onGuardar={guardar} />
      <Documentos id={idSolicitud} docs={docs} onCambio={cargar} />
      {/* Va justo despues de los documentos: es donde el asesor acaba de ver
          lo que falta y donde tiene sentido reclamarselo. */}
      <RecordatorioEstancia id={idSolicitud} />
      <AcompanantesAdmin idSolicitud={idSolicitud} exp={exp} numero="3" />
      <CerrarCarpeta id={idSolicitud} exp={exp} docs={docs} onHecho={cargar} />
      <PasarAAbogada id={idSolicitud} exp={exp} onHecho={cargar} />
      <GeneradoresEstancia id={idSolicitud} exp={exp} onArchivado={cargar} />
      <Extranjeria id={idSolicitud} registros={ext} onCambio={cargar} />
    </div>
  );
}
