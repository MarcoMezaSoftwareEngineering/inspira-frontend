// Portal del cliente para la estancia por estudios.
//
// Servicio aparte del visado y del máster: ni comparte formulario ni
// documentos con ellos. El orden de los bloques es el orden en que se hacen
// las cosas —datos, guía, documentos, extranjería—, y arriba del todo va
// siempre en qué punto está su expediente, que es lo que viene a mirar.
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGET, apiPUT, apiUpload, apiDELETE } from "../../../../services/api";

const TONOS = {
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  azul:    "bg-[#EEF2F8] text-[#1A3557] border-[#1A3557]/20",
  ambar:   "bg-amber-50 text-amber-800 border-amber-300",
  violeta: "bg-violet-50 text-violet-800 border-violet-300",
  rojo:    "bg-red-50 text-red-800 border-red-300",
  verde:   "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/30",
};

const OPCIONES = {
  sexo: ["Hombre", "Mujer"],
  estado_civil: ["Soltero/a", "Casado/a", "Viudo/a", "Divorciado/a"],
  tipo_estudios: [
    ["INTERCAMBIO", "Intercambio"], ["GRADO", "Grado universitario"],
    ["MASTER", "Máster universitario"], ["DOCTORADO", "Doctorado"],
    ["INVESTIGACION", "Investigación"],
  ],
  tipo_titulo: [["OFICIAL", "Oficial"], ["PROPIO", "Propio"]],
  master_tipo: [
    ["OFICIAL", "Máster oficial"], ["FORMACION_PERMANENTE", "Formación permanente"],
    ["PROPIO", "Máster propio"],
  ],
  uni_registro_tipo: [["RUCT", "RUCT"], ["RCD", "RCD"], ["OTRO", "Otro"]],
  prog_modalidad: [["PRESENCIAL", "Presencial"], ["SEMIPRESENCIAL", "Semipresencial"]],
};

function Campo({ label, valor, onChange, tipo = "text", ayuda, obligatorio }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400">
        {label}{obligatorio && <span className="text-orange-500"> *</span>}
      </span>
      <input
        type={tipo} value={valor ?? ""} onChange={(e) => onChange(e.target.value)}
        className="text-[13px] border border-neutral-300 rounded-lg px-3 py-2 bg-white
          focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]"
      />
      {ayuda && <span className="text-[11px] text-neutral-400">{ayuda}</span>}
    </label>
  );
}

function Selector({ label, valor, onChange, opciones, obligatorio }) {
  const pares = opciones.map((o) => (Array.isArray(o) ? o : [o, o]));
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400">
        {label}{obligatorio && <span className="text-orange-500"> *</span>}
      </span>
      <select
        value={valor ?? ""} onChange={(e) => onChange(e.target.value)}
        className="text-[13px] border border-neutral-300 rounded-lg px-3 py-2 bg-white
          focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]"
      >
        <option value="">—</option>
        {pares.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );
}

function Bloque({ numero, titulo, subtitulo, children, abierto, onToggle }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
      <button type="button" onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-neutral-50/60">
        <span className="shrink-0 w-8 h-8 rounded-xl grid place-items-center text-[13px] font-bold text-white font-serif"
          style={{ background: "#1A3557" }}>{numero}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold text-[#1A3557] leading-tight">{titulo}</span>
          {subtitulo && <span className="block text-[11.5px] text-neutral-500 mt-0.5">{subtitulo}</span>}
        </span>
        <span className="shrink-0 text-neutral-300 text-[13px]">{abierto ? "▲" : "▼"}</span>
      </button>
      {abierto && <div className="px-4 pb-5 pt-1 border-t border-neutral-100">{children}</div>}
    </div>
  );
}

/* ── Estado del expediente ───────────────────────────────────────────────── */

function EstadoProceso({ revision }) {
  const etapa = revision?.etapa;
  const recorrido = revision?.recorrido || [];
  if (!etapa) return null;

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
        En qué va tu expediente
      </p>
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border mb-3 ${TONOS[etapa.tono]}`}>
        <span className="text-[14px] font-bold">{etapa.cliente}</span>
      </div>
      <p className="text-[13px] text-neutral-600 leading-relaxed mb-4">{etapa.explica_cliente}</p>

      <div className="flex items-center gap-1">
        {recorrido.map((e) => (
          <div key={e.clave} className="flex-1 min-w-0" title={e.cliente}>
            <div className={`h-1.5 rounded-full ${
              e.actual ? "bg-[#1A3557]" : e.pasada ? "bg-[#1D6A4A]" : "bg-neutral-200"
            }`} />
            <p className={`text-[9px] mt-1 truncate ${
              e.actual ? "text-[#1A3557] font-bold" : "text-neutral-400"
            }`}>{e.cliente}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Plazos ──────────────────────────────────────────────────────────────── */

/* Fuera del render: declarada dentro, se recrearía en cada pasada y perdería
   su estado. */
function CajaPlazo({ titulo, dato }) {
  if (!dato) return null;
  return (
    <div className={`rounded-xl border px-3.5 py-3 ${
      dato.a_tiempo ? "border-[#1D6A4A]/30 bg-[#E8F5EE]" : "border-red-300 bg-red-50"
    }`}>
      <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-500">{titulo}</p>
      <p className={`text-[19px] font-bold leading-tight mt-0.5 ${
        dato.a_tiempo ? "text-[#14532d]" : "text-red-700"
      }`}>{dato.limite}</p>
      <p className="text-[11.5px] text-neutral-600 mt-0.5">
        {dato.a_tiempo
          ? `Quedan ${dato.dias_restantes} día(s)`
          : `Pasado hace ${Math.abs(dato.dias_restantes)} día(s)`}
      </p>
    </div>
  );
}

function Plazos({ plazos }) {
  if (!plazos) return null;
  const { antelacion, tope, avisos = [] } = plazos;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CajaPlazo titulo="Presentar antes de" dato={antelacion} />
        <CajaPlazo titulo="Tope desde tu llegada" dato={tope} />
      </div>
      {antelacion && <p className="text-[11.5px] text-neutral-500">{antelacion.explicacion}</p>}
      {tope && <p className="text-[11.5px] text-neutral-500">{tope.explicacion}</p>}
      {avisos.map((a, i) => (
        <div key={i} className={`rounded-xl border px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
          a.nivel === "alto" ? "bg-red-50 border-red-300 text-red-800"
            : a.nivel === "medio" ? "bg-amber-50 border-amber-300 text-amber-800"
            : "bg-neutral-50 border-neutral-200 text-neutral-600"
        }`}>{a.texto}</div>
      ))}
    </div>
  );
}

/* ── Documentos ──────────────────────────────────────────────────────────── */

function Ranura({ id, clave, def, onCambio }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function subir(archivo) {
    if (!archivo) return;
    setSubiendo(true); setError("");
    try {
      const datos = new FormData();
      datos.append("archivo", archivo);
      // apiUpload lanza si algo va mal; no devuelve {ok:false}.
      await apiUpload(`/solicitudes/${id}/estancia/documentos/${clave}`, datos);
      onCambio();
    } catch (e) {
      setError(e.message || "No se pudo subir");
    } finally {
      setSubiendo(false);
    }
  }

  async function quitar(idDoc) {
    const r = await apiDELETE(`/solicitudes/${id}/estancia/documentos/archivo/${idDoc}`);
    if (r?.ok) onCambio();
  }

  const tiene = def.archivos.length > 0;
  const esDelAsesor = def.de === "asesor";

  return (
    <div className={`rounded-xl border px-3.5 py-3 ${
      tiene ? "border-[#1D6A4A]/30 bg-[#E8F5EE]/40"
        : def.obligatorio ? "border-amber-300 bg-amber-50/40" : "border-neutral-200"
    }`}>
      <div className="flex items-start gap-2">
        <span className="shrink-0 mt-0.5 text-[13px]">{tiene ? "✅" : def.obligatorio ? "⚠️" : "○"}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-neutral-800">
            {def.etiqueta}
            {def.obligatorio && !tiene && (
              <span className="ml-1.5 text-[10px] font-bold uppercase text-amber-600">falta</span>
            )}
          </p>
          {def.requisito && (
            <p className="text-[11.5px] text-neutral-500 leading-relaxed mt-0.5">{def.requisito}</p>
          )}

          {def.archivos.map((a) => (
            <div key={a.id_documento} className="flex items-center gap-2 mt-1.5">
              <a href={`/api/solicitudes/${id}/estancia/documentos/archivo/${a.id_documento}`}
                target="_blank" rel="noreferrer"
                className="text-[11.5px] text-[#046C8C] hover:underline truncate">
                {a.nombre}
              </a>
              {a.subido_por === "CLIENTE" && (
                <button type="button" onClick={() => quitar(a.id_documento)}
                  className="text-[11px] text-neutral-400 hover:text-red-600">quitar</button>
              )}
            </div>
          ))}

          {!esDelAsesor && (!tiene || def.varios) && (
            <label className="inline-flex items-center gap-1.5 mt-2 text-[11.5px] font-semibold
              text-[#023A4B] cursor-pointer hover:underline">
              {subiendo ? "Subiendo…" : tiene ? "+ añadir otro" : "📎 Subir"}
              <input type="file" className="hidden" accept="application/pdf,image/*"
                disabled={subiendo}
                onChange={(e) => subir(e.target.files?.[0])} />
            </label>
          )}
          {esDelAsesor && !tiene && (
            <p className="text-[11px] text-neutral-400 mt-1">Lo prepara Inspira.</p>
          )}
          {error && <p className="text-[11.5px] text-red-600 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────────────────── */

export default function DetalleSolicitudEstancia({ solicitudBase, onVolver, onIrAGuia }) {
  const id = solicitudBase?.id_solicitud;
  const [exp, setExp] = useState(null);
  const [docs, setDocs] = useState(null);
  const [ext, setExt] = useState([]);
  const [abierto, setAbierto] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [tocado, setTocado] = useState(false);

  const cargar = useCallback(() => {
    return Promise.all([
      apiGET(`/solicitudes/${id}/estancia`),
      apiGET(`/solicitudes/${id}/estancia/documentos`),
      apiGET(`/solicitudes/${id}/estancia/extranjeria`),
    ]).then(([a, b, c]) => {
      if (a?.ok) setExp(a.expediente);
      if (b?.ok) setDocs(b);
      if (c?.ok) setExt(c.registros || []);
    });
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const set = (k) => (v) => { setTocado(true); setExp((p) => ({ ...p, [k]: v })); };

  const guardar = useCallback(async () => {
    if (!tocado) return;
    setGuardando(true);
    const r = await apiPUT(`/solicitudes/${id}/estancia/datos`, exp || {});
    setGuardando(false);
    if (r?.ok) { setExp(r.expediente); setTocado(false); }
  }, [id, exp, tocado]);

  const revision = exp?.revision;
  const esMaster = exp?.tipo_estudios === "MASTER";
  const conCreditos = ["MASTER", "GRADO"].includes(exp?.tipo_estudios);

  const faltanDocs = docs?.faltan?.length || 0;
  const ranurasCliente = useMemo(
    () => Object.entries(docs?.ranuras || {}).filter(([, d]) => d.de === "cliente"),
    [docs]
  );
  const ranurasAsesor = useMemo(
    () => Object.entries(docs?.ranuras || {}).filter(([, d]) => d.de === "asesor"),
    [docs]
  );

  if (!exp) {
    return <p className="text-[13px] text-neutral-400 py-10 text-center">Cargando tu expediente…</p>;
  }

  const g = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3";

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-5 space-y-3">
        <button type="button" onClick={onVolver}
          className="text-[12px] font-semibold text-neutral-500 hover:text-[#1A3557]">
          ← Mis servicios
        </button>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] font-mono text-[#1D6A4A]">
            Estancia por estudios
          </p>
          <h1 className="font-serif text-xl font-bold text-[#1A3557]">Tu expediente</h1>
        </div>

        <EstadoProceso revision={revision} />

        {/* 1 · Datos */}
        <Bloque numero="1" titulo="Tus datos"
          subtitulo={revision?.faltan?.length
            ? `Faltan ${revision.faltan.length} datos obligatorios`
            : "Completos"}
          abierto={abierto === 1} onToggle={() => setAbierto(abierto === 1 ? 0 : 1)}>

          {revision?.faltan?.length > 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-300 px-3.5 py-2.5 mb-4">
              <p className="text-[12px] text-amber-900 leading-relaxed">
                <b>Te falta por completar:</b> {revision.faltan.join(", ")}.
              </p>
            </div>
          )}
          {revision?.avisos?.map((a, i) => (
            <div key={i} className="rounded-xl bg-red-50 border border-red-300 px-3.5 py-2.5 mb-3">
              <p className="text-[12px] text-red-800 leading-relaxed">{a}</p>
            </div>
          ))}

          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
            Fechas que fijan tus plazos
          </p>
          <div className={`${g} mb-3`}>
            <Campo label="Fecha de admisión" tipo="date" obligatorio
              valor={exp.fecha_admision} onChange={set("fecha_admision")} />
            <Campo label="Llegada a España" tipo="date" obligatorio
              valor={exp.fecha_llegada_espana} onChange={set("fecha_llegada_espana")} />
            <Campo label="Inicio de clases" tipo="date" obligatorio
              ayuda="Según tu carta de admisión"
              valor={exp.fecha_inicio_clases} onChange={set("fecha_inicio_clases")} />
          </div>

          <label className="flex items-start gap-2 mb-4 text-[12.5px] text-neutral-700">
            <input type="checkbox" className="mt-0.5 accent-[#1D6A4A]"
              checked={exp.viaje_schengen_180 === true}
              onChange={(e) => set("viaje_schengen_180")(e.target.checked)} />
            <span>
              He viajado al espacio Schengen en los últimos 180 días
              <span className="block text-[11px] text-neutral-400">
                Si es así, tus 90 días no empiezan de cero. Coméntalo con tu asesor.
              </span>
            </span>
          </label>

          <Plazos plazos={revision?.plazos} />

          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400 mt-5 mb-2">
            Identidad
          </p>
          <div className={g}>
            <Campo label="Nombre completo" obligatorio valor={exp.nombre_completo} onChange={set("nombre_completo")} />
            <Campo label="Nº de pasaporte" obligatorio valor={exp.pasaporte_numero} onChange={set("pasaporte_numero")} />
            <Campo label="DNI" obligatorio valor={exp.dni} onChange={set("dni")} />
            <Campo label="Emisión del pasaporte" tipo="date" obligatorio valor={exp.pasaporte_emision} onChange={set("pasaporte_emision")} />
            <Campo label="Caducidad del pasaporte" tipo="date" obligatorio valor={exp.pasaporte_caducidad} onChange={set("pasaporte_caducidad")} />
            <Selector label="Sexo" obligatorio opciones={OPCIONES.sexo} valor={exp.sexo} onChange={set("sexo")} />
            <Campo label="Fecha de nacimiento" tipo="date" obligatorio valor={exp.fecha_nacimiento} onChange={set("fecha_nacimiento")} />
            <Campo label="Lugar de nacimiento" obligatorio valor={exp.lugar_nacimiento} onChange={set("lugar_nacimiento")} />
            <Campo label="País de nacimiento" obligatorio valor={exp.pais_nacimiento} onChange={set("pais_nacimiento")} />
            <Campo label="Nacionalidad" obligatorio valor={exp.nacionalidad} onChange={set("nacionalidad")} />
            <Selector label="Estado civil" obligatorio opciones={OPCIONES.estado_civil} valor={exp.estado_civil} onChange={set("estado_civil")} />
            <Campo label="Nombre del padre" obligatorio valor={exp.nombre_padre} onChange={set("nombre_padre")} />
            <Campo label="Nombre de la madre" obligatorio valor={exp.nombre_madre} onChange={set("nombre_madre")} />
            <Campo label="Correo" tipo="email" obligatorio valor={exp.correo} onChange={set("correo")} />
            <Campo label="Teléfono" obligatorio valor={exp.telefono} onChange={set("telefono")} />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400 mt-5 mb-1">
            Domicilio en España
          </p>
          <p className="text-[11.5px] text-neutral-500 mb-2 leading-relaxed">
            Tiene que estar en la misma provincia donde estudias: la solicitud se presenta
            ante la oficina de extranjería de esa jurisdicción.
          </p>
          <div className={g}>
            <Campo label="Dirección" obligatorio valor={exp.dom_direccion} onChange={set("dom_direccion")} />
            <Campo label="Localidad" obligatorio valor={exp.dom_localidad} onChange={set("dom_localidad")} />
            <Campo label="Código postal" obligatorio valor={exp.dom_cp} onChange={set("dom_cp")} />
            <Campo label="Provincia" obligatorio valor={exp.dom_provincia} onChange={set("dom_provincia")} />
            <Campo label="Móvil (español)" obligatorio valor={exp.dom_telefono} onChange={set("dom_telefono")} />
            <Campo label="Correo de contacto" valor={exp.dom_correo} onChange={set("dom_correo")} />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400 mt-5 mb-2">
            Tus estudios
          </p>
          <div className={g}>
            <Selector label="Tipo de estudios" obligatorio opciones={OPCIONES.tipo_estudios}
              valor={exp.tipo_estudios} onChange={set("tipo_estudios")} />
            <Campo label="Duración" ayuda="Ej.: 1 año, 2 semestres" valor={exp.duracion} onChange={set("duracion")} />
            <Selector label="Tipo de título" obligatorio opciones={OPCIONES.tipo_titulo}
              valor={exp.tipo_titulo} onChange={set("tipo_titulo")} />
            <Campo label="Inicio de la formación" tipo="date" obligatorio valor={exp.formacion_inicio} onChange={set("formacion_inicio")} />
            <Campo label="Fin de la formación" tipo="date" obligatorio valor={exp.formacion_fin} onChange={set("formacion_fin")} />
            {conCreditos && (
              <Campo label="Créditos" obligatorio valor={exp.creditos} onChange={set("creditos")} />
            )}
            {esMaster && (
              <Selector label="Tipo de máster" obligatorio opciones={OPCIONES.master_tipo}
                valor={exp.master_tipo} onChange={set("master_tipo")} />
            )}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400 mt-5 mb-2">
            Universidad o centro
          </p>
          <div className={g}>
            <Campo label="Denominación" obligatorio valor={exp.uni_denominacion} onChange={set("uni_denominacion")} />
            <Selector label="Registro oficial" opciones={OPCIONES.uni_registro_tipo}
              valor={exp.uni_registro_tipo} onChange={set("uni_registro_tipo")} />
            <Campo label="Nº de registro" valor={exp.uni_registro_num} onChange={set("uni_registro_num")} />
            <Campo label="Dirección" valor={exp.uni_direccion} onChange={set("uni_direccion")} />
            <Campo label="Localidad" valor={exp.uni_localidad} onChange={set("uni_localidad")} />
            <Campo label="Código postal" valor={exp.uni_cp} onChange={set("uni_cp")} />
            <Campo label="Provincia" obligatorio valor={exp.uni_provincia} onChange={set("uni_provincia")} />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400 mt-5 mb-2">
            Programa
          </p>
          <div className={g}>
            <Campo label="Denominación" obligatorio valor={exp.prog_denominacion} onChange={set("prog_denominacion")} />
            <Campo label="Código" valor={exp.prog_codigo} onChange={set("prog_codigo")} />
            <Selector label="Modalidad" obligatorio opciones={OPCIONES.prog_modalidad}
              valor={exp.prog_modalidad} onChange={set("prog_modalidad")} />
            <Campo label="Inicio" tipo="date" obligatorio valor={exp.prog_inicio} onChange={set("prog_inicio")} />
            <Campo label="Fin" tipo="date" obligatorio valor={exp.prog_fin} onChange={set("prog_fin")} />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400 mt-5 mb-2">
            Notas
          </p>
          <textarea rows={3} value={exp.notas ?? ""} onChange={(e) => set("notas")(e.target.value)}
            placeholder="Un NIE anterior, una estancia previa, cualquier cosa que debamos saber…"
            className="w-full text-[13px] border border-neutral-300 rounded-lg px-3 py-2
              focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]" />

          <div className="flex items-center gap-3 mt-4">
            <button type="button" onClick={guardar} disabled={!tocado || guardando}
              className="text-[13px] font-semibold px-5 py-2 rounded-lg bg-[#1D6A4A] text-white
                disabled:opacity-40 hover:opacity-90">
              {guardando ? "Guardando…" : "Guardar mis datos"}
            </button>
            {!tocado && <span className="text-[11.5px] text-neutral-400">Todo guardado</span>}
          </div>
        </Bloque>

        {/* 2 · Instructivo */}
        <Bloque numero="2" titulo="Guía del proceso"
          subtitulo="Qué se pide, en qué orden y con qué plazos"
          abierto={abierto === 2} onToggle={() => setAbierto(abierto === 2 ? 0 : 2)}>
          <p className="text-[13px] text-neutral-700 leading-relaxed mb-3">
            Antes de subir nada, léela: cada documento tiene requisitos concretos y
            extranjería devuelve los que no los cumplen.
          </p>
          <button type="button" onClick={() => onIrAGuia?.("estancia")}
            className="inline-flex items-center gap-2 text-[13px] font-semibold px-4 py-2.5
              rounded-lg text-white hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #1A3557 0%, #023A4B 100%)" }}>
            📖 Abrir la guía de estancia por estudios
          </button>
        </Bloque>

        {/* 3 · Documentos */}
        <Bloque numero="3" titulo="Tus documentos"
          subtitulo={docs ? (faltanDocs ? `Faltan ${faltanDocs}` : "Todos entregados") : "Cargando…"}
          abierto={abierto === 3} onToggle={() => setAbierto(abierto === 3 ? 0 : 3)}>
          <div className="space-y-2.5">
            {ranurasCliente.map(([clave, def]) => (
              <Ranura key={clave} id={id} clave={clave} def={def} onCambio={cargar} />
            ))}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400 mt-5 mb-2">
            Los prepara Inspira
          </p>
          <div className="space-y-2.5">
            {ranurasAsesor.map(([clave, def]) => (
              <Ranura key={clave} id={id} clave={clave} def={def} onCambio={cargar} />
            ))}
          </div>
        </Bloque>

        {/* 4 · Extranjería */}
        <Bloque numero="4" titulo="Extranjería"
          subtitulo={ext.length ? `${ext.length} comunicación(es)` : "Sin novedades"}
          abierto={abierto === 4} onToggle={() => setAbierto(abierto === 4 ? 0 : 4)}>
          {exp.expediente_numero && (
            <div className="rounded-xl border border-[#1A3557]/20 bg-[#EEF2F8] px-3.5 py-3 mb-3">
              <p className="text-[11px] text-neutral-500">Nº de expediente</p>
              <p className="text-[15px] font-bold text-[#1A3557]">{exp.expediente_numero}</p>
              {exp.expediente_fecha && (
                <p className="text-[11.5px] text-neutral-500">Ingresado el {exp.expediente_fecha}</p>
              )}
              <a href="https://infoext2.delegaciondelgobierno.gob.es/infoext2/consulta.html"
                target="_blank" rel="noreferrer"
                className="text-[11.5px] font-semibold text-[#046C8C] hover:underline">
                Consultar en la sede de la Delegación del Gobierno →
              </a>
            </div>
          )}

          {ext.length === 0 ? (
            <p className="text-[13px] text-neutral-400">
              Cuando extranjería nos comunique algo, aparecerá aquí y te avisaremos por correo.
            </p>
          ) : (
            <div className="space-y-2.5">
              {ext.map((r) => (
                <div key={r.id_registro} className="rounded-xl border border-neutral-200 px-3.5 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${
                      r.tipo === "RESOLUCION" ? TONOS.verde
                        : r.tipo === "REQUERIMIENTO" ? TONOS.rojo : TONOS.ambar
                    }`}>{r.tipo_label}</span>
                    {r.fecha && <span className="text-[11px] text-neutral-400">{r.fecha}</span>}
                  </div>
                  <p className="text-[13.5px] font-semibold text-neutral-800 mt-1">{r.titulo}</p>
                  {r.detalle && (
                    <p className="text-[12.5px] text-neutral-600 leading-relaxed mt-1">{r.detalle}</p>
                  )}
                  {r.plazo && (
                    <p className="text-[12px] font-semibold text-red-700 mt-1">
                      Plazo para responder: {r.plazo}
                    </p>
                  )}
                  {r.tiene_archivo && (
                    <a href={`/api/solicitudes/${id}/estancia/extranjeria/${r.id_registro}/archivo`}
                      target="_blank" rel="noreferrer"
                      className="inline-block text-[11.5px] font-semibold text-[#046C8C] hover:underline mt-1.5">
                      📄 Ver el documento
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </Bloque>
      </div>
    </div>
  );
}
