// Portal del cliente para la estancia por estudios.
//
// Cada dato se pide UNA vez. El formulario oficial repite algunos —el correo
// aparece en dos apartados, las fechas del programa en tres— pero eso lo
// resuelve el generador del EX-00, no el asesorado: a él se le pregunta lo
// mínimo y se rellena el resto solo.
//
// Los datos no bloquean la subida de documentos. Se avisa, y con claridad,
// pero alguien puede tener el pasaporte a mano y la carta de admisión no; que
// no pueda avanzar por eso sólo hace que abandone el portal y lo mande todo
// por WhatsApp.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGET, apiPUT, apiPOST } from "../../../../services/api";
import { Campo, Selector, Guardado } from "./campos";
import TarjetaDocumento, { ResumenDocumentos } from "./TarjetaDocumento";
import AcompanantesCliente from "./AcompanantesCliente";

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

/* ── Campos con ayuda ────────────────────────────────────────────────────── */

/**
 * La ayuda va detrás de una ⓘ y no siempre visible: con treinta campos, un
 * párrafo bajo cada uno convierte el formulario en un muro. Quien sabe qué
 * poner no la abre; quien duda, la tiene a un clic.
 */
function Paso({ numero, titulo, subtitulo, faltan, abierto, onToggle, onSiguiente, children }) {
  const completo = faltan === 0;
  return (
    <div className={`rounded-xl border overflow-hidden ${
      completo ? "border-[#1D6A4A]/25" : "border-neutral-200"
    }`}>
      <button type="button" onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-neutral-50/60">
        <span className={`shrink-0 w-6 h-6 rounded-lg grid place-items-center text-[11px] font-bold ${
          completo ? "bg-[#1D6A4A] text-white" : "bg-neutral-200 text-neutral-500"
        }`}>{completo ? "✓" : numero}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-neutral-800">{titulo}</span>
          {subtitulo && <span className="block text-[11px] text-neutral-400">{subtitulo}</span>}
        </span>
        {!completo && (
          <span className="shrink-0 text-[10.5px] font-bold text-amber-600">faltan {faltan}</span>
        )}
        <span className="shrink-0 text-neutral-300 text-[11px]">{abierto ? "▲" : "▼"}</span>
      </button>
      {abierto && (
        <div className="px-3.5 pb-4 pt-1 border-t border-neutral-100">
          {children}
          {onSiguiente && (
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-100">
              <button type="button" onClick={onSiguiente}
                className="text-[12.5px] font-semibold px-4 py-2 rounded-lg
                  bg-neutral-900 text-white hover:opacity-90">
                Continuar
              </button>
              <span className="text-[11.5px] text-neutral-400">
                {completo ? "Este paso está completo" : "Puedes volver luego a lo que falta"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Estado y plazos ─────────────────────────────────────────────────────── */

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
        {dato.a_tiempo ? `Quedan ${dato.dias_restantes} día(s)`
          : `Pasado hace ${Math.abs(dato.dias_restantes)} día(s)`}
      </p>
    </div>
  );
}

function Plazos({ plazos }) {
  if (!plazos) return null;
  const { antelacion, tope, avisos = [] } = plazos;
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <CajaPlazo titulo="Presentar antes de" dato={antelacion} />
        <CajaPlazo titulo="Tope desde tu llegada" dato={tope} />
      </div>
      {avisos.map((a, i) => (
        <div key={i} className={`rounded-xl border px-3.5 py-2.5 text-[12.5px] leading-relaxed flex gap-2 ${
          a.nivel === "alto" ? "bg-red-50 border-red-300 text-red-800"
            : a.nivel === "medio" ? "bg-amber-50 border-amber-300 text-amber-900"
            : "bg-neutral-50 border-neutral-200 text-neutral-600"
        }`}>
          <span className="shrink-0">{a.nivel === "alto" ? "⚠️" : "💡"}</span>
          <span>{a.texto}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Los datos con los que se consulta el expediente en la sede de extranjería.
 *
 * Van juntos y en el mismo orden en que los pide el formulario oficial, porque
 * quien consulta los va copiando uno detrás de otro. El año de nacimiento no
 * se guarda: se saca de la fecha, que ya está en el expediente.
 */
function SeguimientoExpediente({ exp }) {
  const anio = (exp.fecha_nacimiento || "").slice(0, 4);
  const filas = [
    ["Nº de expediente", exp.expediente_numero],
    ["Nº de justificante", exp.expediente_justificante],
    ["NIE", exp.expediente_nie],
    ["Fecha de ingreso", exp.expediente_fecha],
    ["Año de nacimiento", anio],
  ].filter(([, v]) => v);

  if (!filas.length) {
    return (
      <p className="text-[12.5px] text-neutral-500 leading-relaxed mb-3">
        Cuando presentemos tu solicitud te daremos aquí el número de expediente para que
        puedas seguirlo por tu cuenta.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-[#1A3557]/20 bg-[#EEF2F8] px-3.5 py-3 mb-3">
      <p className="text-[10px] font-bold uppercase tracking-widest font-mono
        text-[#1A3557] mb-2">Para consultar tu expediente</p>
      <table className="w-full">
        <tbody>
          {filas.map(([k, v]) => (
            <tr key={k}>
              <td className="text-[11.5px] text-neutral-500 py-0.5 pr-3 align-top w-[45%]">{k}</td>
              <td className="text-[12.5px] font-bold text-[#1A3557] py-0.5 select-all">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="https://infoext2.delegaciondelgobierno.gob.es/infoext2/consulta.html"
        target="_blank" rel="noreferrer"
        className="inline-block text-[11.5px] font-semibold text-[#046C8C] hover:underline mt-2">
        Consultar en la sede de la Delegación del Gobierno →
      </a>
    </div>
  );
}

/* ── Documentos ──────────────────────────────────────────────────────────── */

function PedirRevision({ id, docs, exp, onHecho }) {
  const [abierto, setAbierto] = useState(false);
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  const subidos = Object.values(docs?.ranuras || {})
    .filter((r) => r.de === "cliente" && r.archivos.length).length;
  const porRevisar = Object.values(docs?.ranuras || {})
    .filter((r) => r.de === "cliente" && r.estado === "PENDIENTE").length;

  const yaPedida = Boolean(exp?.revision_solicitada_at);

  async function pedir() {
    setEnviando(true); setMsg("");
    const r = await apiPOST(`/solicitudes/${id}/estancia/solicitar-revision`, { nota });
    setEnviando(false);
    setMsg(r?.msg || (r?.ok ? "Avisado" : "No se pudo avisar"));
    if (r?.ok) { setAbierto(false); setNota(""); onHecho(); }
  }

  // Se ve siempre, tambien sin documentos. Escondiendolo hasta que subiera
  // algo, quien buscaba como avisar a su asesor no encontraba nada y concluia
  // que no existe.
  if (!subidos) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 mb-3
        flex items-center gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-neutral-600">
            ¿Terminaste de subir?
          </p>
          <p className="text-[11.5px] text-neutral-500 leading-relaxed">
            Cuando subas tus documentos, avísanos desde aquí y los revisamos.
          </p>
        </div>
        <button type="button" disabled
          className="shrink-0 text-[12.5px] font-semibold px-4 py-2 rounded-lg
            border border-neutral-300 text-neutral-400 cursor-not-allowed">
          Pedir revisión
        </button>
      </div>
    );
  }

  if (yaPedida) {
    return (
      <div className="rounded-xl border border-sky-200 bg-sky-50/50 px-3.5 py-3 mb-3 flex gap-2.5">
        <span className="shrink-0 text-[14px]">👀</span>
        <p className="text-[12.5px] text-sky-900 leading-relaxed">
          <b>Tu asesor ya sabe que has subido documentos.</b> Los está revisando y te dirá
          si están correctos o qué hay que corregir. Si subes algo más, vuelve a avisarle.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1D6A4A]/30 bg-[#E8F5EE]/50 px-3.5 py-3 mb-3">
      {!abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-[#14532d]">
              ¿Has terminado de subir?
            </p>
            <p className="text-[11.5px] text-neutral-600 leading-relaxed">
              Avísanos y revisamos tus {porRevisar || subidos} documento(s).
            </p>
          </div>
          <button type="button" onClick={() => setAbierto(true)}
            className="shrink-0 text-[12.5px] font-semibold px-4 py-2 rounded-lg
              bg-[#1D6A4A] text-white hover:opacity-90">
            Pedir revisión
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[12.5px] font-semibold text-[#14532d]">
            Avisar a tu asesor
          </p>
          <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)}
            placeholder="¿Algo que debamos saber? (opcional)"
            className="w-full text-[12.5px] border border-neutral-300 rounded-lg px-3 py-2
              focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]" />
          <div className="flex items-center gap-2">
            <button type="button" onClick={pedir} disabled={enviando}
              className="text-[12.5px] font-semibold px-4 py-2 rounded-lg bg-[#1D6A4A]
                text-white disabled:opacity-40 hover:opacity-90">
              {enviando ? "Avisando…" : "Enviar"}
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

/* ── Bloque plegable ─────────────────────────────────────────────────────── */

function Bloque({ numero, titulo, subtitulo, abierto, onToggle, children }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
      <button type="button" onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-neutral-50/60">
        <span className="shrink-0 w-8 h-8 rounded-xl grid place-items-center text-[13px]
          font-bold text-white font-serif" style={{ background: "#1A3557" }}>{numero}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold text-[#1A3557]">{titulo}</span>
          {subtitulo && <span className="block text-[11.5px] text-neutral-500 mt-0.5">{subtitulo}</span>}
        </span>
        <span className="shrink-0 text-neutral-300 text-[13px]">{abierto ? "▲" : "▼"}</span>
      </button>
      {abierto && <div className="px-4 pb-5 pt-1 border-t border-neutral-100">{children}</div>}
    </div>
  );
}

/* ── Principal ───────────────────────────────────────────────────────────── */

export default function DetalleSolicitudEstancia({ solicitudBase, onVolver, onIrAGuia }) {
  const id = solicitudBase?.id_solicitud;
  const [exp, setExp] = useState(null);
  const [docs, setDocs] = useState(null);
  const [ext, setExt] = useState([]);
  const [bloque, setBloque] = useState(1);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [tocado, setTocado] = useState(false);

  const cargar = useCallback(() => Promise.all([
    apiGET(`/solicitudes/${id}/estancia`),
    apiGET(`/solicitudes/${id}/estancia/documentos`),
    apiGET(`/solicitudes/${id}/estancia/extranjeria`),
  ]).then(([a, b, c]) => {
    if (a?.ok) setExp(a.expediente);
    if (b?.ok) setDocs(b);
    if (c?.ok) setExt(c.registros || []);
  }), [id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Cada retoque sube un numero. Si al volver la respuesta el numero cambio,
  // es que siguio escribiendo mientras se guardaba: ni se le pisa lo escrito ni
  // se da por guardado lo que aun no lo esta.
  const version = useRef(0);
  const set = (k) => (v) => {
    version.current += 1;
    setTocado(true);
    setExp((p) => ({ ...p, [k]: v }));
  };

  const guardar = useCallback(async () => {
    if (!tocado) return;
    const v = version.current;
    setGuardando(true);
    // Al asesorado se le pregunta una vez; los campos que el impreso repite se
    // rellenan aquí. El inicio de clases es el mismo dato que el inicio del
    // programa y el de la formación: preguntarlo tres veces sólo confunde.
    const payload = {
      ...exp,
      prog_inicio: exp.fecha_inicio_clases || exp.prog_inicio,
      formacion_inicio: exp.fecha_inicio_clases || exp.formacion_inicio,
      formacion_fin: exp.prog_fin || exp.formacion_fin,
      dom_correo: exp.correo,
      dom_telefono: exp.telefono,
      nombre_completo: [exp.nombres, exp.apellido1, exp.apellido2].filter(Boolean).join(" "),
    };
    const r = await apiPUT(`/solicitudes/${id}/estancia/datos`, payload);
    setGuardando(false);
    if (r?.ok) {
      // Solo se refresca lo que calcula el servidor —qué falta, qué plazos—;
      // los campos se quedan como los tiene escritos delante.
      setExp((p) => ({ ...p, revision: r.expediente?.revision }));
      if (version.current === v) setTocado(false);
    }
  }, [id, exp, tocado]);

  // Se guarda solo al dejar de escribir. Antes habia que bajar hasta el final
  // del formulario a buscar el boton, y quien no lo encontraba perdia el rato.
  useEffect(() => {
    if (!tocado) return undefined;
    const t = setTimeout(guardar, 900);
    return () => clearTimeout(t);
  }, [exp, tocado, guardar]);

  const rev = exp?.revision;
  const faltaLista = useMemo(() => new Set(rev?.faltan || []), [rev]);
  const falta = (l) => faltaLista.has(l);
  const cuenta = useCallback((ls) => ls.filter((l) => faltaLista.has(l)).length, [faltaLista]);

  const datosCompletos = rev?.completo;
  const usaUni = Boolean(exp?.dom_usa_universidad);
  const esMaster = exp?.tipo_estudios === "MASTER";
  const conCreditos = ["MASTER", "GRADO"].includes(exp?.tipo_estudios);

  const ranurasCliente = useMemo(
    () => Object.entries(docs?.ranuras || {}).filter(([, d]) => d.de === "cliente"), [docs]);
  const ranurasAsesor = useMemo(
    () => Object.entries(docs?.ranuras || {}).filter(([, d]) => d.de === "asesor"), [docs]);

  if (!exp) {
    return <p className="text-[13px] text-neutral-400 py-10 text-center">Cargando tu expediente…</p>;
  }

  const g = "grid grid-cols-1 sm:grid-cols-2 gap-3";
  const abrir = (n) => setPaso(paso === n ? 0 : n);

  const PASOS = {
    1: ["Primer apellido", "Nombres", "Fecha de nacimiento", "Lugar de nacimiento",
        "País de nacimiento", "Nacionalidad", "Sexo", "Estado civil",
        "Nombre del padre", "Nombre de la madre"],
    2: ["Nº de pasaporte", "DNI", "Fecha de emisión del pasaporte",
        "Fecha de caducidad del pasaporte", "Correo electrónico", "Teléfono"],
    3: ["Fecha de admisión", "Fecha de llegada a España",
        "Inicio de clases según la carta de admisión", "Fin del programa"],
    4: ["Nombre de la universidad", "Provincia de la universidad", "Tipo de estudios",
        "Tipo de título", "Nombre del programa", "Modalidad"],
    5: ["Domicilio en España", "Localidad en España", "Código postal en España",
        "Provincia en España", "Teléfono móvil"],
  };
  const totalCampos = Object.values(PASOS).flat().length;
  const hechos = totalCampos - (rev?.faltan?.length || 0);

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

        <EstadoProceso revision={rev} />

        {/* ── 1 · Datos ── */}
        <Bloque numero="1" titulo="Tus datos"
          subtitulo={datosCompletos ? "Completos" : `${hechos} de ${totalCampos} completados`}
          abierto={bloque === 1} onToggle={() => setBloque(bloque === 1 ? 0 : 1)}>

          <div className="rounded-xl border-l-[3px] border-orange-400 bg-orange-50 px-3.5 py-3 mb-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-800 mb-1">
              Antes de empezar
            </p>
            <p className="text-[12.5px] text-orange-900 leading-relaxed">
              Estos datos se copian <b>tal cual</b> al formulario oficial que presentamos ante
              Extranjería. Escríbelos exactamente como figuran en tu pasaporte y en tu carta de
              admisión: <b>es tu responsabilidad que sean correctos</b>. Un apellido mal escrito
              puede costar el expediente.
            </p>
            <p className="text-[12px] text-orange-800 leading-relaxed mt-1.5">
              Si dudas de algún campo, pulsa la <b>ⓘ</b> que hay junto a su nombre.
            </p>
          </div>

          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div className="h-full bg-[#1D6A4A] transition-all"
                style={{ width: `${totalCampos ? (hechos / totalCampos) * 100 : 0}%` }} />
            </div>
            <span className="text-[11.5px] font-bold text-neutral-500 shrink-0">
              {datosCompletos ? "listo" : `${hechos}/${totalCampos}`}
            </span>
          </div>

          <Guardado guardando={guardando} tocado={tocado} completo={datosCompletos} arriba />

          <div className="space-y-2">
            <Paso numero="1" titulo="Quién eres" subtitulo="Como figura en tu pasaporte"
              faltan={cuenta(PASOS[1])} abierto={paso === 1} onToggle={() => abrir(1)} onSiguiente={() => setPaso(2)}>
              <div className={g}>
                <Campo label="Primer apellido" obligatorio falta={falta("Primer apellido")}
                  ayuda="Tu primer apellido, exactamente como aparece en tu pasaporte."
                  valor={exp.apellido1} onChange={set("apellido1")} />
                <Campo label="Segundo apellido"
                  ayuda="Si en tu país no se usan dos apellidos, déjalo vacío."
                  valor={exp.apellido2} onChange={set("apellido2")} />
                <Campo label="Nombres" obligatorio falta={falta("Nombres")}
                  ayuda="Todos tus nombres de pila, tal como figuran en el pasaporte."
                  valor={exp.nombres} onChange={set("nombres")} />
                <Campo label="Fecha de nacimiento" tipo="date" obligatorio
                  falta={falta("Fecha de nacimiento")}
                  valor={exp.fecha_nacimiento} onChange={set("fecha_nacimiento")} />
                <Campo label="Lugar de nacimiento" obligatorio falta={falta("Lugar de nacimiento")}
                  ayuda="La ciudad donde naciste, no el país."
                  valor={exp.lugar_nacimiento} onChange={set("lugar_nacimiento")} />
                <Campo label="País de nacimiento" obligatorio falta={falta("País de nacimiento")}
                  valor={exp.pais_nacimiento} onChange={set("pais_nacimiento")} />
                <Campo label="Nacionalidad" obligatorio falta={falta("Nacionalidad")}
                  ayuda="Tu nacionalidad actual, que puede no coincidir con el país donde naciste."
                  valor={exp.nacionalidad} onChange={set("nacionalidad")} />
                <Selector label="Sexo" obligatorio falta={falta("Sexo")} opciones={OPCIONES.sexo}
                  ayuda="El que consta en tu pasaporte."
                  valor={exp.sexo} onChange={set("sexo")} />
                <Selector label="Estado civil" obligatorio falta={falta("Estado civil")}
                  opciones={OPCIONES.estado_civil} valor={exp.estado_civil} onChange={set("estado_civil")} />
                <Campo label="Nombre del padre" obligatorio falta={falta("Nombre del padre")}
                  ayuda="Nombre y apellidos completos. Extranjería lo pide siempre, aunque no viaje contigo."
                  valor={exp.nombre_padre} onChange={set("nombre_padre")} />
                <Campo label="Nombre de la madre" obligatorio falta={falta("Nombre de la madre")}
                  ayuda="Nombre y apellidos completos, con su apellido de soltera si es el que consta."
                  valor={exp.nombre_madre} onChange={set("nombre_madre")} />
              </div>
            </Paso>

            <Paso numero="2" titulo="Documentación y contacto"
              faltan={cuenta(PASOS[2])} abierto={paso === 2} onToggle={() => abrir(2)} onSiguiente={() => setPaso(3)}>
              <div className={g}>
                <Campo label="Nº de pasaporte" obligatorio falta={falta("Nº de pasaporte")}
                  ayuda="El número de la página de datos de tu pasaporte, sin espacios."
                  valor={exp.pasaporte_numero} onChange={set("pasaporte_numero")} />
                <Campo label="DNI de tu país" obligatorio falta={falta("DNI")}
                  ayuda="Tu documento de identidad nacional: DNI, cédula o equivalente."
                  valor={exp.dni} onChange={set("dni")} />
                <Campo label="Emisión del pasaporte" tipo="date" obligatorio
                  ayuda="Está en la misma página que el número, como «fecha de expedición»."
                  falta={falta("Fecha de emisión del pasaporte")}
                  valor={exp.pasaporte_emision} onChange={set("pasaporte_emision")} />
                <Campo label="Caducidad del pasaporte" tipo="date" obligatorio
                  ayuda="Debe seguir vigente cuando terminen tus estudios."
                  falta={falta("Fecha de caducidad del pasaporte")}
                  valor={exp.pasaporte_caducidad} onChange={set("pasaporte_caducidad")} />
                <Campo label="Correo electrónico" tipo="email" obligatorio
                  ayuda="Donde recibirás los avisos del expediente. Míralo a menudo: los plazos son cortos."
                  falta={falta("Correo electrónico")}
                  valor={exp.correo} onChange={set("correo")} />
                <Campo label="Teléfono" obligatorio falta={falta("Teléfono")}
                  ayuda="Con el prefijo del país. Si ya tienes móvil español, pon ese."
                  valor={exp.telefono} onChange={set("telefono")} />
              </div>
            </Paso>

            <Paso numero="3" titulo="Tus fechas" subtitulo="De aquí salen tus plazos legales"
              faltan={cuenta(PASOS[3])} abierto={paso === 3} onToggle={() => abrir(3)} onSiguiente={() => setPaso(4)}>
              <div className={`${g} mb-3`}>
                <Campo label="Fecha de admisión" tipo="date" obligatorio
                  ayuda="La fecha que lleva tu carta de admisión."
                  falta={falta("Fecha de admisión")}
                  valor={exp.fecha_admision} onChange={set("fecha_admision")} />
                <Campo label="Llegada a España" tipo="date" obligatorio
                  ayuda="El día que aterrizas. De aquí sale tu fecha tope para presentar."
                  falta={falta("Fecha de llegada a España")}
                  valor={exp.fecha_llegada_espana} onChange={set("fecha_llegada_espana")} />
                <Campo label="Inicio de clases" tipo="date" obligatorio
                  ayuda="Según tu carta de admisión. Marca el plazo de antelación de dos meses."
                  falta={falta("Inicio de clases según la carta de admisión")}
                  valor={exp.fecha_inicio_clases} onChange={set("fecha_inicio_clases")} />
                <Campo label="Fin de los estudios" tipo="date" obligatorio
                  ayuda="Cuándo terminan, según tu carta de admisión."
                  falta={falta("Fin del programa")}
                  valor={exp.prog_fin} onChange={set("prog_fin")} />
              </div>
              <label className="flex items-start gap-2 mb-3 text-[12.5px] text-neutral-700">
                <input type="checkbox" className="mt-0.5 accent-[#1D6A4A]"
                  checked={exp.viaje_schengen_180 === true}
                  onChange={(e) => set("viaje_schengen_180")(e.target.checked)} />
                <span>
                  He viajado al espacio Schengen en los últimos 180 días
                  <span className="block text-[11px] text-neutral-400">
                    Si es así, tus 90 días no empiezan de cero.
                  </span>
                </span>
              </label>
              <Plazos plazos={rev?.plazos} />
            </Paso>

            <Paso numero="4" titulo="Tus estudios"
              faltan={cuenta(PASOS[4])} abierto={paso === 4} onToggle={() => abrir(4)} onSiguiente={() => setPaso(5)}>
              <div className={g}>
                <Campo label="Universidad o centro" obligatorio falta={falta("Nombre de la universidad")}
                  ayuda="El nombre oficial completo, como aparece en la carta de admisión."
                  valor={exp.uni_denominacion} onChange={set("uni_denominacion")} />
                <Campo label="Nombre del programa" obligatorio falta={falta("Nombre del programa")}
                  ayuda="El máster, grado o curso, tal cual figura en tu admisión."
                  valor={exp.prog_denominacion} onChange={set("prog_denominacion")} />
                <Selector label="Tipo de estudios" obligatorio falta={falta("Tipo de estudios")}
                  opciones={OPCIONES.tipo_estudios} valor={exp.tipo_estudios} onChange={set("tipo_estudios")} />
                <Selector label="Tipo de título" obligatorio falta={falta("Tipo de título")}
                  ayuda="Oficial es el reconocido por el Ministerio; propio lo expide la universidad."
                  opciones={OPCIONES.tipo_titulo} valor={exp.tipo_titulo} onChange={set("tipo_titulo")} />
                {esMaster && (
                  <Selector label="Tipo de máster" obligatorio opciones={OPCIONES.master_tipo}
                    ayuda="Lo dice tu carta de admisión."
                    valor={exp.master_tipo} onChange={set("master_tipo")} />
                )}
                {conCreditos && (
                  <Campo label="Créditos" obligatorio ayuda="Los créditos ECTS del programa."
                    valor={exp.creditos} onChange={set("creditos")} />
                )}
                <Selector label="Modalidad" obligatorio falta={falta("Modalidad")}
                  opciones={OPCIONES.prog_modalidad} valor={exp.prog_modalidad} onChange={set("prog_modalidad")} />
                <Campo label="Código del programa"
                  ayuda="Si tu admisión trae un código, ponlo. Si no, déjalo vacío."
                  valor={exp.prog_codigo} onChange={set("prog_codigo")} />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-widest font-mono
                text-neutral-400 mt-4 mb-2">Dónde está tu universidad</p>
              <div className={g}>
                <Campo label="Dirección" valor={exp.uni_direccion} onChange={set("uni_direccion")} />
                <Campo label="Localidad" valor={exp.uni_localidad} onChange={set("uni_localidad")} />
                <Campo label="Código postal" valor={exp.uni_cp} onChange={set("uni_cp")} />
                <Campo label="Provincia" obligatorio falta={falta("Provincia de la universidad")}
                  ayuda="Determina qué oficina de Extranjería lleva tu expediente."
                  valor={exp.uni_provincia} onChange={set("uni_provincia")} />
                <Selector label="Registro oficial" opciones={OPCIONES.uni_registro_tipo}
                  ayuda="RUCT para estudios universitarios, RCD para formación profesional."
                  valor={exp.uni_registro_tipo} onChange={set("uni_registro_tipo")} />
                <Campo label="Nº de registro" valor={exp.uni_registro_num} onChange={set("uni_registro_num")} />
              </div>
            </Paso>

            <Paso numero="5" titulo="Dónde vivirás en España"
              subtitulo="Tiene que ser la misma provincia donde estudias"
              faltan={usaUni ? 0 : cuenta(PASOS[5])} abierto={paso === 5} onToggle={() => abrir(5)}>

              <label className="flex items-start gap-2 mb-3 text-[12.5px] text-neutral-700
                rounded-xl border border-[#1A3557]/20 bg-[#EEF2F8] px-3 py-2.5 cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-[#1D6A4A]"
                  checked={usaUni} onChange={(e) => set("dom_usa_universidad")(e.target.checked)} />
                <span>
                  <b>Todavía no tengo dirección en España</b>
                  <span className="block text-[11.5px] text-neutral-500 mt-0.5">
                    Usaremos la de tu universidad. Lo que Extranjería mira es que la provincia
                    coincida, y así coincide.
                  </span>
                </span>
              </label>

              {!usaUni && (
                <div className={g}>
                  <Campo label="Calle" obligatorio falta={falta("Domicilio en España")}
                    ayuda="El nombre de la calle, sin número."
                    valor={exp.dom_direccion} onChange={set("dom_direccion")} />
                  <div className="grid grid-cols-2 gap-3">
                    <Campo label="Número" valor={exp.dom_numero} onChange={set("dom_numero")} />
                    <Campo label="Piso / puerta" valor={exp.dom_piso} onChange={set("dom_piso")} />
                  </div>
                  <Campo label="Localidad" obligatorio falta={falta("Localidad en España")}
                    valor={exp.dom_localidad} onChange={set("dom_localidad")} />
                  <Campo label="Código postal" obligatorio falta={falta("Código postal en España")}
                    valor={exp.dom_cp} onChange={set("dom_cp")} />
                  <Campo label="Provincia" obligatorio falta={falta("Provincia en España")}
                    ayuda="Tiene que ser la misma que la de tu universidad."
                    valor={exp.dom_provincia} onChange={set("dom_provincia")} />
                </div>
              )}

              <p className="text-[10px] font-bold uppercase tracking-widest font-mono
                text-neutral-400 mt-4 mb-2">Algo más que debamos saber</p>
              <textarea rows={3} value={exp.notas ?? ""} onChange={(e) => set("notas")(e.target.value)}
                placeholder="Un NIE anterior, una estancia previa, cualquier cosa…"
                className="w-full text-[13px] border border-neutral-300 rounded-lg px-3 py-2
                  focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]" />
            </Paso>
          </div>

          <Guardado guardando={guardando} tocado={tocado} completo={datosCompletos} />
        </Bloque>

        {/* ── 2 · Guía ── */}
        <Bloque numero="2" titulo="Guía del proceso"
          subtitulo="Qué se pide, en qué orden y con qué plazos"
          abierto={bloque === 2} onToggle={() => setBloque(bloque === 2 ? 0 : 2)}>
          <p className="text-[13px] text-neutral-700 leading-relaxed mb-3">
            Recuerda que viajas <b>como turista</b> y tramitas desde España. La guía lleva lo
            que necesitas en frontera y lo que hay que reunir después.
          </p>
          <button type="button" onClick={() => onIrAGuia?.("estancia")}
            className="inline-flex items-center gap-2 text-[13px] font-semibold px-4 py-2.5
              rounded-lg text-white hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #1A3557 0%, #023A4B 100%)" }}>
            📖 Abrir la guía de estancia por estudios
          </button>
        </Bloque>

        {/* ── 3 · Documentos ── */}
        <Bloque numero="3" titulo="Tus documentos"
          subtitulo={docs?.faltan?.length ? `Te faltan ${docs.faltan.length}`
            : docs?.observados?.length ? `${docs.observados.length} por corregir`
            : "Todo entregado"}
          abierto={bloque === 3} onToggle={() => setBloque(bloque === 3 ? 0 : 3)}>

          {/* Aviso, no candado: puede tener el pasaporte a mano y la carta de
              admisión no, y bloquearle sólo haría que lo mande por WhatsApp. */}
          {!datosCompletos && (
            <div className="rounded-xl bg-amber-50 border border-amber-300 px-3.5 py-3 mb-3 flex gap-2.5">
              <span className="shrink-0 text-[14px]">📋</span>
              <div>
                <p className="text-[12.5px] text-amber-900 leading-relaxed">
                  Puedes ir subiendo documentos, pero <b>no podremos presentar tu expediente
                  hasta que completes tus datos</b>: se copian al formulario oficial.
                </p>
                <button type="button" onClick={() => { setBloque(1); setPaso(1); }}
                  className="text-[12px] font-semibold text-[#023A4B] hover:underline mt-1">
                  Ir a completar mis datos →
                </button>
              </div>
            </div>
          )}

          {docs?.observados?.length > 0 && (
            <div className="rounded-xl bg-red-50 border border-red-300 px-3.5 py-2.5 mb-3">
              <p className="text-[12.5px] text-red-800 leading-relaxed">
                Hay {docs.observados.length} documento(s) que hay que corregir. Te decimos
                exactamente qué falla en cada uno.
              </p>
            </div>
          )}

          <ResumenDocumentos ranuras={docs?.ranuras} />

          <PedirRevision id={id} docs={docs} exp={exp} onHecho={cargar} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
            {ranurasCliente.map(([clave, def]) => (
              <TarjetaDocumento key={clave} base={`/solicitudes/${id}/estancia`}
                clave={clave} def={def} onCambio={cargar} />
            ))}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest font-mono
            text-neutral-400 mb-2">Los preparamos nosotros</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ranurasAsesor.map(([clave, def]) => (
              <TarjetaDocumento key={clave} base={`/solicitudes/${id}/estancia`}
                clave={clave} def={def} onCambio={cargar} />
            ))}
          </div>
        </Bloque>

        {/* ── 4 · Acompañantes ── */}
        <Bloque numero="4" titulo="¿Viajas acompañado?"
          subtitulo={exp.con_acompanantes
            ? "Cónyuge o hijos vinculados a tu autorización"
            : "Cónyuge, hijos o familiares a tu cargo"}
          abierto={bloque === 4} onToggle={() => setBloque(bloque === 4 ? 0 : 4)}>
          <AcompanantesCliente
            idSolicitud={id}
            conAcompanantes={exp.con_acompanantes}
            onMarcar={(v) => { set("con_acompanantes")(v); }}
          />
        </Bloque>

        {/* ── 5 · Extranjería ── */}
        <Bloque numero="5" titulo="Extranjería"
          subtitulo={ext.length ? `${ext.length} comunicación(es)` : "Sin novedades"}
          abierto={bloque === 5} onToggle={() => setBloque(bloque === 5 ? 0 : 5)}>
          <SeguimientoExpediente exp={exp} />

          {ext.length === 0 ? (
            <p className="text-[13px] text-neutral-400">
              Cuando Extranjería nos comunique algo, aparecerá aquí y te avisaremos por correo.
            </p>
          ) : (
            <div className="space-y-2.5">
              {ext.map((r) => (
                <div key={r.id_registro} className="rounded-xl border border-neutral-200 px-3.5 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5
                      rounded border ${
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
                      className="inline-block text-[11.5px] font-semibold text-[#046C8C]
                        hover:underline mt-1.5">
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
