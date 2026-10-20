// Portal del asesorado para el profesional altamente cualificado (UGE).
//
// Mismo molde que la estancia por estudios: datos que se guardan solos,
// documentos por ranura con revisión, acompañantes con sus propios documentos,
// lo que llega de la UGE y del consulado, y los mensajes. Lo distinto es el
// trámite: dos fases (autorización ante la UGE por Mercurio y visado en el
// consulado) y que el solicitante puede ser el titular del PAC o un familiar
// que se vincula a un titular que ya tiene su resolución.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGET, apiPUT, apiPOST } from "../../../../services/api";
import QueMeFalta from "../QueMeFalta";
import { queMeFaltaEstancia } from "../../queMeFalta";
import { navigate } from "../../../../services/navigate";
import { rutaDe } from "../../ruta";
import { Campo, Selector, Guardado } from "./campos";
import TarjetaDocumento, { ResumenDocumentos } from "./TarjetaDocumento";
import AcompanantesPacCliente from "./AcompanantesPacCliente";
import { abrirArchivo } from "../../../../services/archivos";
import HiloMensajes from "../../../../components/common/HiloMensajes";
import { Bloque, Paso, EstadoProceso, OtraPersona, ComoInvitado, ComoEscanear } from "./Bloques";
import { avanceDeRevision, usePublicarCabecera } from "../../cabeceraExpediente";
import NovedadesExpediente from "../NovedadesExpediente";
import { WHATSAPP_SEGURO } from "../../../../config/contacto";

const TONOS = {
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  azul:    "bg-[#EEF2F8] text-primary border-primary/20",
  ambar:   "bg-amber-50 text-amber-800 border-amber-300",
  violeta: "bg-violet-50 text-violet-800 border-violet-300",
  rojo:    "bg-red-50 text-red-800 border-red-300",
  verde:   "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/30",
};

const OPCIONES = {
  rol: [["TITULAR", "Soy el titular del PAC (el profesional contratado)"], ["FAMILIAR", "Soy familiar de un titular que ya tiene su resolución"]],
  vinculo: [["CONYUGE", "Cónyuge"], ["PAREJA", "Pareja de hecho"], ["HIJO", "Hijo/a"], ["ASCENDIENTE", "Padre o madre"]],
  sexo: ["Hombre", "Mujer"],
  estado_civil: ["Soltero/a", "Casado/a", "Viudo/a", "Divorciado/a", "Unión de hecho"],
  pais_residencia: ["Perú", "España", "Otro"],
  con_duracion: ["1 año", "2 años", "3 años", "Indefinido"],
  patria_potestad: [["AMBOS", "La comparten ambos padres"], ["EXCLUSIVA", "La tiene en exclusiva quien viaja (hay sentencia)"]],
  cobertura_ss: [["POR_CONFIRMAR", "Por confirmar con el empleador"], ["SI", "Sí, nos cubre la Seguridad Social: no necesitamos seguro"], ["NO", "No: necesitamos seguro privado"]],
};

const ETIQUETA = {
  resolucion_sentido: { FAVORABLE: "Concedida", DESFAVORABLE: "Denegada", SILENCIO: "Concedida por silencio" },
  visado_resolucion: { CONCEDIDO: "Concedido", DENEGADO: "Denegado" },
  presentacion_via: { ABOGADO: "La presenta el abogado de Inspira con su certificado profesional y tu documento de representación", CERTIFICADO_PROPIO: "La presentas tú con tu certificado digital español" },
};

/* ── Plazos y seguimiento ────────────────────────────────────────────────── */

function CajaPlazo({ titulo, dato }) {
  if (!dato) return null;
  return (
    <div className={`rounded-xl border px-3.5 py-3 ${dato.a_tiempo ? "border-[#1D6A4A]/30 bg-[#E8F5EE]" : "border-red-300 bg-red-50"}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-500">{titulo}</p>
      <p className={`text-[19px] font-bold leading-tight mt-0.5 ${dato.a_tiempo ? "text-[#14532d]" : "text-red-700"}`}>{dato.limite}</p>
      <p className="text-[11.5px] text-neutral-600 mt-0.5">
        {dato.a_tiempo ? `Quedan ${dato.dias_restantes} día(s)` : `Pasado hace ${Math.abs(dato.dias_restantes)} día(s)`}
      </p>
      {dato.explicacion && <p className="text-[11px] text-neutral-500 mt-1 leading-snug">{dato.explicacion}</p>}
    </div>
  );
}

function Plazos({ plazos }) {
  if (!plazos) return null;
  const { uge, recogida_visado, tie, avisos = [] } = plazos;
  if (!uge && !recogida_visado && !tie && !avisos.length) return null;
  return (
    <div className="space-y-2.5 mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <CajaPlazo titulo="La UGE resuelve antes de" dato={uge} />
        <CajaPlazo titulo="Recoger el visado antes de" dato={recogida_visado} />
        <CajaPlazo titulo="Pedir la TIE antes de" dato={tie} />
      </div>
      {avisos.map((a, i) => (
        <div key={i} className={`rounded-xl border px-3.5 py-2.5 text-[12.5px] leading-relaxed flex gap-2 ${
          a.nivel === "alto" ? "bg-red-50 border-red-300 text-red-800" : "bg-amber-50 border-amber-300 text-amber-900"}`}>
          <span className="shrink-0">{a.nivel === "alto" ? "⚠️" : "💡"}</span><span>{a.texto}</span>
        </div>
      ))}
    </div>
  );
}

function Dato({ k, v }) {
  if (!v) return null;
  return (
    <tr>
      <td className="text-[11.5px] text-neutral-500 py-0.5 pr-3 align-top w-[45%]">{k}</td>
      <td className="text-[12.5px] font-bold text-primary py-0.5 select-all">{v}</td>
    </tr>
  );
}

/** Lo que Inspira va registrando de las dos fases, tal como lo ve el asesorado. */
function Seguimiento({ exp }) {
  const filasUge = [
    ["Cómo se presenta", ETIQUETA.presentacion_via[exp.presentacion_via]],
    ["Abogado que la presenta", exp.repr_nombre],
    ["Nº de expediente UGE", exp.expediente_numero],
    ["Nº de justificante", exp.expediente_justificante],
    ["Presentada el", exp.expediente_fecha],
    ["Tasa", exp.tasa_pagada_fecha ? `Pagada el ${exp.tasa_pagada_fecha}${exp.tasa_importe ? ` (${exp.tasa_importe} €)` : ""}` : exp.tasa_importe ? `${exp.tasa_importe} € · pendiente` : null],
    ["Resolución", exp.resolucion_sentido ? `${ETIQUETA.resolucion_sentido[exp.resolucion_sentido] || exp.resolucion_sentido}${exp.resolucion_fecha ? ` · ${exp.resolucion_fecha}` : ""}` : null],
  ].filter(([, v]) => v);
  const filasCon = [
    ["Consulado", exp.consulado],
    ["Cita en BLS", exp.bls_cita_fecha ? `${exp.bls_cita_fecha}${exp.bls_cita_hora ? ` · ${exp.bls_cita_hora}` : ""}` : null],
    ["Visado presentado el", exp.visado_presentacion_fecha],
    ["Resolución del visado", exp.visado_resolucion ? `${ETIQUETA.visado_resolucion[exp.visado_resolucion] || exp.visado_resolucion}${exp.visado_resolucion_fecha ? ` · ${exp.visado_resolucion_fecha}` : ""}` : null],
    ["Visado recogido el", exp.visado_recogida_fecha],
    ["Visado válido hasta", exp.visado_validez_hasta],
  ].filter(([, v]) => v);
  const filasEsp = [
    ["Entrada en España", exp.entrada_fecha],
    ["Empadronamiento", exp.empadronamiento_fecha],
    ["Cita de huellas", exp.huellas_fecha],
    ["NIE", exp.nie],
    ["TIE recogida el", exp.tie_fecha],
  ].filter(([, v]) => v);

  const Tabla = ({ titulo, filas, vacio }) => (
    <div className="rounded-xl border border-primary/20 bg-[#EEF2F8] px-3.5 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-primary mb-1.5">{titulo}</p>
      {filas.length ? (
        <table className="w-full"><tbody>{filas.map(([k, v]) => <Dato key={k} k={k} v={v} />)}</tbody></table>
      ) : <p className="text-[12px] text-neutral-500 m-0">{vacio}</p>}
    </div>
  );

  return (
    <div className="space-y-2.5 mb-3">
      <Tabla titulo="Fase 1 · Autorización en la UGE (Mercurio)" filas={filasUge} vacio="Cuando presentemos tu solicitud verás aquí el número de expediente, la tasa y la resolución." />
      <Tabla titulo="Fase 2 · Visado en el consulado" filas={filasCon} vacio="Con la autorización concedida pediremos tu cita en BLS y la verás aquí." />
      {filasEsp.length > 0 && <Tabla titulo="En España" filas={filasEsp} vacio="" />}
    </div>
  );
}

/* ── Pedir revisión ──────────────────────────────────────────────────────── */

function PedirRevision({ id, docs, exp, onHecho }) {
  const [abierto, setAbierto] = useState(false);
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");
  const subidos = Object.values(docs?.ranuras || {}).filter((r) => r.de === "cliente" && r.archivos.length).length;
  const porRevisar = Object.values(docs?.ranuras || {}).filter((r) => r.de === "cliente" && r.estado === "PENDIENTE").length;
  const yaPedida = Boolean(exp?.revision_solicitada_at);

  async function pedir() {
    setEnviando(true); setMsg("");
    const r = await apiPOST(`/solicitudes/${id}/pac/solicitar-revision`, { nota });
    setEnviando(false);
    setMsg(r?.msg || (r?.ok ? "Avisado" : "No se pudo avisar"));
    if (r?.ok) { setAbierto(false); setNota(""); onHecho(); }
  }

  if (!subidos) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 mb-3 flex items-center gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-neutral-600">¿Terminaste de subir?</p>
          <p className="text-[11.5px] text-neutral-500 leading-relaxed">Cuando subas tus documentos, avísanos desde aquí y los revisamos.</p>
        </div>
        <button type="button" disabled className="shrink-0 text-[12.5px] font-semibold px-4 py-2 rounded-lg border border-neutral-300 text-neutral-400 cursor-not-allowed">Pedir revisión</button>
      </div>
    );
  }
  if (yaPedida) {
    return (
      <div className="rounded-xl border border-sky-200 bg-sky-50/50 px-3.5 py-3 mb-3 flex gap-2.5">
        <span className="shrink-0 text-[14px]">👀</span>
        <p className="text-[12.5px] text-sky-900 leading-relaxed"><b>Tu asesor ya sabe que has subido documentos.</b> Los está revisando y te dirá si están correctos o qué hay que corregir. Si subes algo más, vuelve a avisarle.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-[#1D6A4A]/30 bg-[#E8F5EE]/50 px-3.5 py-3 mb-3">
      {!abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-[#14532d]">¿Has terminado de subir?</p>
            <p className="text-[11.5px] text-neutral-600 leading-relaxed">Avísanos y revisamos tus {porRevisar || subidos} documento(s).</p>
          </div>
          <button type="button" onClick={() => setAbierto(true)} className="shrink-0 text-[12.5px] font-semibold px-4 py-2 rounded-lg bg-[#1D6A4A] text-white hover:opacity-90">Pedir revisión</button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[12.5px] font-semibold text-[#14532d]">Avisar a tu asesor</p>
          <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="¿Algo que debamos saber? (opcional)"
            className="w-full text-[12.5px] border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]" />
          <div className="flex items-center gap-2">
            <button type="button" onClick={pedir} disabled={enviando} className="text-[12.5px] font-semibold px-4 py-2 rounded-lg bg-[#1D6A4A] text-white disabled:opacity-40 hover:opacity-90">{enviando ? "Avisando…" : "Enviar"}</button>
            <button type="button" onClick={() => setAbierto(false)} className="text-[12px] text-neutral-500 hover:text-neutral-800">Cancelar</button>
          </div>
        </div>
      )}
      {msg && <p className="text-[11.5px] text-neutral-600 mt-2">{msg}</p>}
    </div>
  );
}

/** El seguro: se recomienda a Félix (StarSeguro) antes de que lo contraten mal. */
function Seguro() {
  return (
    <div className="rounded-xl border border-[#1D6A4A]/30 bg-[#E8F5EE]/60 px-3.5 py-3 mb-3 flex items-center gap-3 flex-wrap">
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold text-[#14532d]">El seguro médico: cotízalo con Félix</p>
        <p className="text-[11.5px] text-neutral-600 leading-relaxed">
          Tiene que ser privado, con una aseguradora autorizada en España, con cobertura completa y <b>sin copagos ni carencias</b>
          (o la póliza familiar que cubra a todos). Félix Olaya (StarSeguro) conoce lo que pide la UGE y el consulado.
        </p>
      </div>
      <a href={WHATSAPP_SEGURO} target="_blank" rel="noopener noreferrer"
        className="shrink-0 text-[12.5px] font-semibold px-4 py-2 rounded-lg bg-[#25D366] text-white hover:opacity-90">
        Cotizar con Félix
      </a>
    </div>
  );
}

/* ── Principal ───────────────────────────────────────────────────────────── */

export default function DetalleSolicitudPac({ solicitudBase, onVolver, faltanPerfil = 0 }) {
  const id = solicitudBase?.id_solicitud;
  const [exp, setExp] = useState(null);
  const [docs, setDocs] = useState(null);
  const [ext, setExt] = useState([]);
  const sinLeer = solicitudBase?.resumen?.mensajes_sin_leer || 0;
  const [bloque, setBloque] = useState(sinLeer > 0 ? 6 : 1);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [tocado, setTocado] = useState(false);

  const cargar = useCallback(() => Promise.all([
    apiGET(`/solicitudes/${id}/pac`),
    apiGET(`/solicitudes/${id}/pac/documentos`),
    apiGET(`/solicitudes/${id}/pac/extranjeria`),
  ]).then(([a, b, c]) => {
    if (a?.ok) setExp(a.expediente);
    if (b?.ok) setDocs(b);
    if (c?.ok) setExt(c.registros || []);
  }), [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const version = useRef(0);
  const pendientes = useRef({});
  const set = (k) => (v) => {
    version.current += 1;
    pendientes.current[k] = v;
    setTocado(true);
    setExp((p) => ({ ...p, [k]: v }));
  };

  useEffect(() => {
    if (!tocado) return undefined;
    const t = setTimeout(async () => {
      const v = version.current;
      const payload = { ...pendientes.current };
      setGuardando(true);
      const r = await apiPUT(`/solicitudes/${id}/pac/datos`, payload);
      setGuardando(false);
      if (r?.ok) {
        setExp((p) => ({ ...p, revision: r.expediente?.revision }));
        if (version.current === v) { pendientes.current = {}; setTocado(false); }
        // El rol cambia qué documentos se piden: se recarga la lista.
        if ("rol" in payload || "fecha_nacimiento" in payload || "patria_potestad" in payload || "cobertura_ss" in payload) cargar();
      }
    }, 900);
    return () => clearTimeout(t);
  }, [exp, tocado, id, cargar]);

  const rev = exp?.revision;
  usePublicarCabecera({
    eyebrow: id ? `Solicitud #${id}` : null,
    titulo: "Profesional altamente cualificado",
    pct: avanceDeRevision(rev),
  });
  const faltaLista = useMemo(() => new Set(rev?.faltan || []), [rev]);
  const falta = (l) => faltaLista.has(l);
  const cuenta = useCallback((ls) => ls.filter((l) => faltaLista.has(l)).length, [faltaLista]);

  const ranurasCliente = useMemo(() => Object.entries(docs?.ranuras || {}).filter(([, d]) => d.de === "cliente"), [docs]);
  const ranurasAsesor = useMemo(() => Object.entries(docs?.ranuras || {}).filter(([, d]) => d.de === "asesor"), [docs]);

  if (!exp) return <p className="text-[13px] text-neutral-400 py-10 text-center">Cargando tu expediente…</p>;

  const g = "grid grid-cols-1 sm:grid-cols-2 gap-3";
  const abrir = (n) => setPaso(paso === n ? 0 : n);
  const esTitular = exp.rol !== "FAMILIAR";
  const menor = Boolean(rev?.menor);

  const PASOS = {
    1: ["Si eres el titular del PAC o un familiar", "Vínculo con el titular del PAC", "Nombre del titular del PAC", "Pasaporte o NIE del titular", "Nº de expediente del titular en la UGE"],
    2: ["Primer apellido", "Nombres", "Sexo", "Fecha de nacimiento", "Lugar de nacimiento", "País de nacimiento", "Nacionalidad", "Estado civil", "Nombre del padre", "Nombre de la madre"],
    3: ["Nº de pasaporte", "Fecha de emisión del pasaporte", "Fecha de caducidad del pasaporte", "Correo electrónico", "Teléfono", "País donde vives ahora", "Domicilio actual", "Localidad actual"],
    4: ["Empresa que te contrata", "NIF de la empresa", "Provincia del centro de trabajo", "Puesto", "Salario bruto anual", "Inicio previsto del contrato", "Titulación superior o experiencia que acredita"],
  };
  const totalCampos = (rev?.faltan?.length || 0) + 0;
  const datosCompletos = rev?.completo;

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-5 space-y-3">
        <button type="button" onClick={onVolver} className="pnl-sin-volver text-[12px] font-semibold text-neutral-500 hover:text-primary">← Mis servicios</button>

        <div className="pnl-solo-grande">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] font-mono text-[#1D6A4A]">Profesional altamente cualificado · UGE</p>
          <h1 className="font-serif text-xl font-bold text-primary">Tu expediente</h1>
        </div>

        <EstadoProceso revision={rev} />

        <NovedadesExpediente
          idSolicitud={id}
          onIrSeccion={(sec) => { const n = ({ docs: 3, estado: 5, mensajes: 6 })[sec]; if (n) setBloque(n); }}
        />

        <QueMeFalta
          {...queMeFaltaEstancia({
            revision: rev, docs, extranjeria: ext, faltanPerfil,
            ir: { bloque: (n) => setBloque(n), perfil: () => navigate(rutaDe({ tab: "perfil" })) },
          })}
        />

        <ComoInvitado solicitud={solicitudBase} />
        <OtraPersona invitados={exp.invitados} />

        {/* ── 1 · Datos ── */}
        <Bloque numero="1" titulo="Tus datos"
          subtitulo={datosCompletos ? "Completos" : `Faltan ${totalCampos} dato(s)`}
          abierto={bloque === 1} onToggle={() => setBloque(bloque === 1 ? 0 : 1)}>

          <Paso numero="1" titulo="Quién pide la residencia" subtitulo="Titular del PAC o familiar de un titular"
            faltan={cuenta(PASOS[1])} abierto={paso === 1} onToggle={() => abrir(1)} onSiguiente={() => setPaso(2)}>
            <div className="space-y-3">
              <Selector label="Tu caso" obligatorio falta={falta("Si eres el titular del PAC o un familiar")}
                opciones={OPCIONES.rol} valor={exp.rol} onChange={set("rol")}
                ayuda="El titular es el profesional contratado por la empresa en España. Si tu cónyuge, pareja, padre o madre ya tiene la resolución favorable, tú pides la tuya como familiar vinculado a la suya." />
              {!esTitular && (
                <div className="rounded-xl border-l-[3px] border-sky-400 bg-sky-50 px-3.5 py-3 space-y-3">
                  <p className="text-[12.5px] text-sky-900 leading-relaxed">
                    Tu solicitud se vincula al expediente del titular: su <b>número de expediente en la UGE</b> va en tu formulario MI-F y adjuntamos su resolución favorable.
                  </p>
                  <div className={g}>
                    <Selector label="Tu vínculo con el titular" obligatorio falta={falta("Vínculo con el titular del PAC")}
                      opciones={OPCIONES.vinculo} valor={exp.vinculo} onChange={set("vinculo")} />
                    <Campo label="Nombre completo del titular" obligatorio falta={falta("Nombre del titular del PAC")}
                      valor={exp.titular_nombre} onChange={set("titular_nombre")} />
                    <Campo label="Pasaporte o NIE del titular" obligatorio falta={falta("Pasaporte o NIE del titular")}
                      valor={exp.titular_pasaporte} onChange={set("titular_pasaporte")} />
                    <Campo label="Nº de expediente del titular en la UGE" obligatorio falta={falta("Nº de expediente del titular en la UGE")}
                      valor={exp.titular_expediente_uge} onChange={set("titular_expediente_uge")}
                      ayuda="Está en su resolución favorable. Con él la UGE asocia tu residencia a su PAC." />
                    <Campo label="Fecha de su resolución" tipo="date" valor={exp.titular_resolucion_fecha} onChange={set("titular_resolucion_fecha")} />
                    <Campo label="Empresa del titular" valor={exp.titular_empresa} onChange={set("titular_empresa")} />
                  </div>
                </div>
              )}
            </div>
          </Paso>

          <Paso numero="2" titulo="Quién eres" subtitulo="Como figura en tu pasaporte"
            faltan={cuenta(PASOS[2])} abierto={paso === 2} onToggle={() => abrir(2)} onSiguiente={() => setPaso(3)}>
            <div className={g}>
              <Campo label="Primer apellido" obligatorio falta={falta("Primer apellido")} valor={exp.apellido1} onChange={set("apellido1")} />
              <Campo label="Segundo apellido" valor={exp.apellido2} onChange={set("apellido2")} />
              <Campo label="Nombres" obligatorio falta={falta("Nombres")} valor={exp.nombres} onChange={set("nombres")} />
              <Selector label="Sexo" obligatorio falta={falta("Sexo")} opciones={OPCIONES.sexo} valor={exp.sexo} onChange={set("sexo")} />
              <Campo label="Fecha de nacimiento" tipo="date" obligatorio falta={falta("Fecha de nacimiento")} valor={exp.fecha_nacimiento} onChange={set("fecha_nacimiento")} />
              <Campo label="Lugar de nacimiento" obligatorio falta={falta("Lugar de nacimiento")} valor={exp.lugar_nacimiento} onChange={set("lugar_nacimiento")} />
              <Campo label="País de nacimiento" obligatorio falta={falta("País de nacimiento")} valor={exp.pais_nacimiento} onChange={set("pais_nacimiento")} />
              <Campo label="Nacionalidad" obligatorio falta={falta("Nacionalidad")} valor={exp.nacionalidad} onChange={set("nacionalidad")} />
              <Selector label="Estado civil" obligatorio falta={falta("Estado civil")} opciones={OPCIONES.estado_civil} valor={exp.estado_civil} onChange={set("estado_civil")} />
              <Campo label="Nombre del padre" obligatorio falta={falta("Nombre del padre")} valor={exp.nombre_padre} onChange={set("nombre_padre")} />
              <Campo label="Nombre de la madre" obligatorio falta={falta("Nombre de la madre")} valor={exp.nombre_madre} onChange={set("nombre_madre")} />
            </div>
            {menor && (
              <div className="rounded-xl border-l-[3px] border-amber-400 bg-amber-50 px-3.5 py-3 mt-4 space-y-3">
                <p className="text-[12.5px] text-amber-900 leading-relaxed">
                  Eres menor de edad: tu solicitud la firma tu representante legal y, si tu padre o tu madre no viaja contigo, la UGE exige su <b>autorización notarial apostillada</b> (o la sentencia de patria potestad exclusiva).
                </p>
                <div className={g}>
                  <Selector label="Patria potestad" obligatorio falta={falta("Patria potestad (ambos padres o exclusiva)")}
                    opciones={OPCIONES.patria_potestad} valor={exp.patria_potestad} onChange={set("patria_potestad")} />
                  <Campo label="Nombre del otro progenitor" obligatorio falta={falta("Nombre del otro progenitor (firma la autorización notarial)")}
                    valor={exp.otro_progenitor_nombre} onChange={set("otro_progenitor_nombre")} />
                  <Campo label="Documento del otro progenitor" valor={exp.otro_progenitor_doc} onChange={set("otro_progenitor_doc")} />
                </div>
              </div>
            )}
          </Paso>

          <Paso numero="3" titulo="Pasaporte, contacto y dónde vives" subtitulo="El pasaporte tiene que valer al menos un año"
            faltan={cuenta(PASOS[3])} abierto={paso === 3} onToggle={() => abrir(3)} onSiguiente={() => setPaso(esTitular ? 4 : 5)}>
            <div className={g}>
              <Campo label="Nº de pasaporte" obligatorio falta={falta("Nº de pasaporte")} valor={exp.pasaporte_numero} onChange={set("pasaporte_numero")} />
              <Campo label="DNI" valor={exp.dni} onChange={set("dni")} />
              <Campo label="Fecha de emisión del pasaporte" tipo="date" obligatorio falta={falta("Fecha de emisión del pasaporte")} valor={exp.pasaporte_emision} onChange={set("pasaporte_emision")} />
              <Campo label="Fecha de caducidad del pasaporte" tipo="date" obligatorio falta={falta("Fecha de caducidad del pasaporte")} valor={exp.pasaporte_caducidad} onChange={set("pasaporte_caducidad")} />
              <Campo label="Correo electrónico" tipo="email" obligatorio falta={falta("Correo electrónico")} valor={exp.correo} onChange={set("correo")} />
              <Campo label="Teléfono" tipo="tel" obligatorio falta={falta("Teléfono")} valor={exp.telefono} onChange={set("telefono")} ayuda="Con prefijo de país. Es el que usará el consulado." />
              <Selector label="País donde vives ahora" obligatorio falta={falta("País donde vives ahora")} opciones={OPCIONES.pais_residencia} valor={exp.pais_residencia} onChange={set("pais_residencia")} />
              <Campo label="Domicilio actual" obligatorio falta={falta("Domicilio actual")} valor={exp.dom_direccion} onChange={set("dom_direccion")} />
              <Campo label="Localidad actual" obligatorio falta={falta("Localidad actual")} valor={exp.dom_localidad} onChange={set("dom_localidad")} />
              <Campo label="Provincia o región" valor={exp.dom_provincia} onChange={set("dom_provincia")} />
            </div>
            <p className="text-[11.5px] font-semibold text-neutral-600 mt-4 mb-2">Dónde vivirás en España (si ya lo sabes)</p>
            <div className={g}>
              <Campo label="Dirección en España" valor={exp.esp_direccion} onChange={set("esp_direccion")} />
              <Campo label="Localidad" valor={exp.esp_localidad} onChange={set("esp_localidad")} />
              <Campo label="Código postal" valor={exp.esp_cp} onChange={set("esp_cp")} />
              <Campo label="Provincia" valor={exp.esp_provincia} onChange={set("esp_provincia")} />
            </div>
          </Paso>

          {esTitular && (
            <Paso numero="4" titulo="Tu empresa y tu contrato" subtitulo="Lo que la UGE valora del PAC"
              faltan={cuenta(PASOS[4])} abierto={paso === 4} onToggle={() => abrir(4)} onSiguiente={() => setPaso(5)}>
              <div className={g}>
                <Campo label="Empresa que te contrata" obligatorio falta={falta("Empresa que te contrata")} valor={exp.emp_razon_social} onChange={set("emp_razon_social")} />
                <Campo label="NIF de la empresa" obligatorio falta={falta("NIF de la empresa")} valor={exp.emp_nif} onChange={set("emp_nif")} />
                <Campo label="Localidad del centro de trabajo" valor={exp.emp_localidad} onChange={set("emp_localidad")} />
                <Campo label="Provincia del centro de trabajo" obligatorio falta={falta("Provincia del centro de trabajo")} valor={exp.emp_provincia} onChange={set("emp_provincia")} />
                <Campo label="Puesto" obligatorio falta={falta("Puesto")} valor={exp.con_puesto} onChange={set("con_puesto")} />
                <Campo label="Salario bruto anual (€)" obligatorio falta={falta("Salario bruto anual")} valor={exp.con_retribucion} onChange={set("con_retribucion")} />
                <Campo label="Inicio previsto del contrato" tipo="date" obligatorio falta={falta("Inicio previsto del contrato")} valor={exp.con_inicio} onChange={set("con_inicio")} />
                <Selector label="Duración" opciones={OPCIONES.con_duracion} valor={exp.con_duracion} onChange={set("con_duracion")} />
                <Campo label="Titulación superior o experiencia que acredita" obligatorio falta={falta("Titulación superior o experiencia que acredita")}
                  valor={exp.titulacion} onChange={set("titulacion")} ayuda="Grado, máster o doctorado; o al menos tres años de experiencia equiparable." />
                <Campo label="Universidad o centro" valor={exp.titulacion_centro} onChange={set("titulacion_centro")} />
                <Campo label="Años de experiencia" valor={exp.experiencia_anios} onChange={set("experiencia_anios")} />
              </div>
            </Paso>
          )}

          <Paso numero={esTitular ? "5" : "4"} titulo="Tu seguro médico" subtitulo="Privado, sin copagos ni carencias"
            faltan={0} abierto={paso === 5} onToggle={() => abrir(5)}>
            <div className="rounded-xl border border-neutral-200 px-3.5 py-3 mb-3 space-y-2">
              <Selector label="¿El contrato del titular os da de alta en la Seguridad Social?" obligatorio
                opciones={OPCIONES.cobertura_ss} valor={exp.cobertura_ss} onChange={set("cobertura_ss")}
                ayuda="Consúltalo con el empleador: si el alta del titular en la Seguridad Social cubre a la familia como beneficiarios, no necesitáis seguro privado. Si no, cada persona necesita una póliza sin copagos ni carencias (o una familiar que os incluya)." />
              <p className="text-[12px] text-neutral-600 leading-relaxed m-0">
                {exp.cobertura_ss === "SI" ? "Perfecto: el seguro privado deja de ser obligatorio en tu lista de documentos. Si cambia, avísanos."
                  : exp.cobertura_ss === "NO" ? "Entonces hace falta seguro privado para cada persona. Cotízalo con Félix antes de contratar nada."
                  : "Hasta que lo confirmes, el seguro sigue en la lista como pendiente. Pide la confirmación por escrito a la empresa."}
              </p>
            </div>
            {exp.cobertura_ss !== "SI" && <Seguro />}
            <div className={g}>
              <Campo label="Aseguradora" valor={exp.seguro_aseguradora} onChange={set("seguro_aseguradora")} />
              <Campo label="Nº de póliza" valor={exp.seguro_poliza} onChange={set("seguro_poliza")} />
              <Campo label="Cobertura hasta" tipo="date" valor={exp.seguro_hasta} onChange={set("seguro_hasta")} />
            </div>
            <Guardado guardando={guardando} tocado={tocado} completo={datosCompletos} />
          </Paso>

          {(rev?.avisos || []).map((t) => (
            <p key={t} className="text-[12px] text-amber-700 leading-relaxed mt-3">⚠ {t}</p>
          ))}
          <Guardado guardando={guardando} tocado={tocado} completo={datosCompletos} arriba />
        </Bloque>

        {/* ── 2 · Cómo va el trámite ── */}
        <Bloque numero="2" titulo="Cómo es el trámite" subtitulo="Dos fases: la UGE y el consulado"
          abierto={bloque === 2} onToggle={() => setBloque(bloque === 2 ? 0 : 2)}>
          <ol className="m-0 pl-5 space-y-2 text-[13px] text-neutral-700 leading-relaxed">
            <li><b>Autorización en la UGE-CE</b> (Unidad de Grandes Empresas), 100 % telemática por Mercurio. La presenta el abogado de Inspira con su certificado profesional y tu documento de representación, o tú con tu certificado digital español. La UGE resuelve en veinte días hábiles; si no contesta, se entiende concedida.</li>
            <li><b>Visado en el consulado</b>, con cita en BLS: acuden todos los solicitantes, también los menores, con originales y copias en el mismo orden. Resuelve en unos diez días y el visado se recoge en persona dentro del mes.</li>
            <li><b>En España</b>: empadronamiento, cita de huellas y TIE dentro del mes desde la entrada.</li>
          </ol>
          <div className="rounded-xl bg-amber-50 border border-amber-300 px-3.5 py-3 mt-3 text-[12.5px] text-amber-900 leading-relaxed space-y-1">
            <p className="m-0"><b>Lo que más se olvida:</b></p>
            <p className="m-0">· El pasaporte va <b>completo</b>, todas las páginas, también las que están en blanco. Solo la hoja de datos es motivo de requerimiento.</p>
            <p className="m-0">· Los antecedentes penales, apostillados y con <b>menos de tres meses</b> al presentarlos, más la <b>declaración responsable</b> de los últimos cinco años.</p>
            <p className="m-0">· Si vais varios, <b>cada persona presenta su propia solicitud</b> (su MI-F, su tasa, su resolución), todas vinculadas al expediente del titular.</p>
          </div>
        </Bloque>

        {/* ── 3 · Documentos ── */}
        <Bloque numero="3" titulo="Tus documentos"
          subtitulo={docs?.faltan?.length ? `Te faltan ${docs.faltan.length}` : docs?.observados?.length ? `${docs.observados.length} por corregir` : "Todo entregado"}
          abierto={bloque === 3} onToggle={() => setBloque(bloque === 3 ? 0 : 3)}>
          {!datosCompletos && (
            <div className="rounded-xl bg-amber-50 border border-amber-300 px-3.5 py-3 mb-3 flex gap-2.5">
              <span className="shrink-0 text-[14px]">📋</span>
              <div>
                <p className="text-[12.5px] text-amber-900 leading-relaxed">Puedes ir subiendo documentos, pero <b>no podremos presentar hasta que completes tus datos</b>: se copian al formulario oficial de la UGE.</p>
                <button type="button" onClick={() => { setBloque(1); setPaso(1); }} className="text-[12px] font-semibold text-primary hover:underline mt-1">Ir a completar mis datos →</button>
              </div>
            </div>
          )}
          {docs?.observados?.length > 0 && (
            <div className="rounded-xl bg-red-50 border border-red-300 px-3.5 py-2.5 mb-3">
              <p className="text-[12.5px] text-red-800 leading-relaxed">Hay {docs.observados.length} documento(s) que hay que corregir. Te decimos exactamente qué falla en cada uno.</p>
            </div>
          )}
          <ComoEscanear />
          {exp.cobertura_ss !== "SI" && <Seguro />}
          <ResumenDocumentos ranuras={docs?.ranuras} />
          <PedirRevision id={id} docs={docs} exp={exp} onHecho={cargar} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
            {ranurasCliente.map(([clave, def]) => (
              <TarjetaDocumento key={clave} base={`/solicitudes/${id}/pac`} clave={clave} def={def} onCambio={cargar} />
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">Los preparamos nosotros</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ranurasAsesor.map(([clave, def]) => (
              <TarjetaDocumento key={clave} base={`/solicitudes/${id}/pac`} clave={clave} def={def} onCambio={cargar} />
            ))}
          </div>
        </Bloque>

        {/* ── 4 · Acompañantes ── */}
        <Bloque numero="4" titulo="¿Quién viene contigo?"
          subtitulo={exp.con_acompanantes ? "Cada uno con su propia solicitud vinculada" : "Cónyuge o pareja, hijos y padres a tu cargo"}
          abierto={bloque === 4} onToggle={() => setBloque(bloque === 4 ? 0 : 4)}>
          <AcompanantesPacCliente idSolicitud={id} exp={exp} conAcompanantes={exp.con_acompanantes} onMarcar={(v) => set("con_acompanantes")(v)} />
        </Bloque>

        {/* ── 5 · UGE y consulado ── */}
        <Bloque numero="5" titulo="UGE y consulado"
          subtitulo={ext.length ? `${ext.length} comunicación(es)` : "Dónde va tu solicitud"}
          abierto={bloque === 5} onToggle={() => setBloque(bloque === 5 ? 0 : 5)}>
          <Plazos plazos={rev?.plazos} />
          <Seguimiento exp={exp} />
          {ext.length === 0 ? (
            <p className="text-[13px] text-neutral-400">Cuando la UGE o el consulado nos comuniquen algo, aparecerá aquí y te avisaremos por correo.</p>
          ) : (
            <div className="space-y-2.5">
              {ext.map((r) => (
                <div key={r.id_registro} className="rounded-xl border border-neutral-200 px-3.5 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${r.tipo === "RESOLUCION" ? TONOS.verde : r.tipo === "REQUERIMIENTO" ? TONOS.rojo : TONOS.ambar}`}>{r.tipo_label}</span>
                    {r.fecha && <span className="text-[11px] text-neutral-400">{r.fecha}</span>}
                  </div>
                  <p className="text-[13.5px] font-semibold text-neutral-800 mt-1">{r.titulo}</p>
                  {r.detalle && <p className="text-[12.5px] text-neutral-600 leading-relaxed mt-1">{r.detalle}</p>}
                  {r.plazo && <p className="text-[12px] font-semibold text-red-700 mt-1">Plazo para responder: {r.plazo}</p>}
                  {r.tiene_archivo && (
                    <button type="button" onClick={() => abrirArchivo(`/solicitudes/${id}/pac/extranjeria/${r.id_registro}/archivo`, {})}
                      className="inline-block text-[11.5px] font-semibold text-primary-light hover:underline mt-1.5">📄 Ver el documento</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Bloque>

        {/* ── 6 · Mensajes ── */}
        <Bloque numero="6" titulo="Mensajes con tu asesor"
          subtitulo={sinLeer > 0 ? `${sinLeer} sin leer` : "Queda en tu expediente, con fecha y constancia de lectura"}
          abierto={bloque === 6} onToggle={() => setBloque(bloque === 6 ? 0 : 6)}>
          <HiloMensajes
            lado="cliente" idSolicitud={id}
            aviso="Lo que se escribe aquí forma parte de tu expediente: queda con fecha, con quién lo escribió y con constancia de cuándo lo leyó tu asesor."
            cargar={() => apiGET(`/solicitudes/${id}/mensajes`)}
            enviar={(texto) => apiPOST(`/solicitudes/${id}/mensajes`, { texto })}
          />
        </Bloque>
      </div>
    </div>
  );
}
