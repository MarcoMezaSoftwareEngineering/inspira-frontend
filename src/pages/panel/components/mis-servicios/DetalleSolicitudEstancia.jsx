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
import QueMeFalta from "../QueMeFalta";
import { queMeFaltaEstancia } from "../../queMeFalta";
import { navigate } from "../../../../services/navigate";
import { rutaDe } from "../../ruta";
import { Campo, Selector, Guardado } from "./campos";
import TarjetaDocumento, { ResumenDocumentos } from "./TarjetaDocumento";
import AyudaPlegable from "../AyudaPlegable";
import AcompanantesCliente from "./AcompanantesCliente";
import { abrirArchivo } from "../../../../services/archivos";
import HiloMensajes from "../../../../components/common/HiloMensajes";

import { Bloque, Paso, EstadoProceso, OtraPersona, ComoInvitado, ComoEscanear, IconoAlerta } from "./Bloques";
import { avanceDeRevision, usePublicarCabecera } from "../../cabeceraExpediente";
import ErrorCarga from "./ErrorCarga";
import NovedadesExpediente from "../NovedadesExpediente";
import { EsqueletoExpediente } from "../Esqueleto";
import Icono from "../../../../components/common/Icono";
import IconoPaso from "../../../../components/common/IconoPaso";
// Lo que llega de Extranjería, en los tonos del panel (styles/panel.css).
const TONO_REGISTRO = { RESOLUCION: "ok", REQUERIMIENTO: "alto" };

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

/* ── Estado y plazos ─────────────────────────────────────────────────────── */

/** «1 día», «3 días»: el plural con el número, no «día(s)». */
const dias = (n) => `${n} ${Math.abs(n) === 1 ? "día" : "días"}`;

function CajaPlazo({ titulo, dato }) {
  if (!dato) return null;
  return (
    <div className="pnl-plazo-caja" data-tono={dato.a_tiempo ? "ok" : "alto"}>
      <p className="pnl-plazo-caja-titulo">{titulo}</p>
      <p className="pnl-plazo-caja-fecha">{dato.limite}</p>
      <p className="pnl-plazo-caja-pie">
        {dato.a_tiempo ? `Quedan ${dias(dato.dias_restantes)}`
          : `Pasado hace ${dias(Math.abs(dato.dias_restantes))}`}
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
        <div key={i} className="pnl-aviso pnl-aviso-arriba"
          data-tono={a.nivel === "alto" ? "alto" : a.nivel === "medio" ? "aviso" : "neutro"}>
          <span className="pnl-aviso-icono" aria-hidden="true">
            {a.nivel === "alto" ? <IconoAlerta /> : <IconoPaso nombre="info" />}
          </span>
          <p className="pnl-aviso-texto">{a.texto}</p>
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
      <div className="pnl-vacio-suave mb-3">
        <span className="pnl-vacio-suave-icono" aria-hidden="true"><IconoPaso nombre="search" /></span>
        <p>
          Cuando presentemos tu solicitud te daremos aquí el número de expediente para que
          puedas seguirlo por tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <div className="pnl-ficha">
      <p className="pnl-eyebrow">Para consultar tu expediente</p>
      <table className="pnl-ficha-tabla">
        <tbody>
          {filas.map(([k, v]) => (
            <tr key={k}>
              <td className="pnl-ficha-k">{k}</td>
              <td className="pnl-ficha-v">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="https://infoext2.delegaciondelgobierno.gob.es/infoext2/consulta.html"
        target="_blank" rel="noreferrer"
        className="pnl-btn-texto pnl-ficha-enlace" data-talla="s">
        Consultar en la sede de la Delegación del Gobierno
        <IconoPaso nombre="external" />
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
      <div className="pnl-aviso pnl-aviso-arriba pnl-revision mb-3" data-tono="neutro">
        <span className="pnl-aviso-icono" aria-hidden="true"><IconoPaso nombre="send" /></span>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="pnl-aviso-texto min-w-0 flex-1">
            <p><b>¿Terminaste de subir?</b></p>
            <p className="pnl-aviso-detalle">
              Cuando subas tus documentos, avísanos desde aquí y los revisamos.
            </p>
          </div>
          <button type="button" disabled className="pnl-btn shrink-0" data-talla="s">
            Pedir revisión
          </button>
        </div>
      </div>
    );
  }

  if (yaPedida) {
    return (
      <div className="pnl-aviso pnl-aviso-arriba mb-3" data-tono="info">
        <span className="pnl-aviso-icono" aria-hidden="true"><IconoPaso nombre="eye" /></span>
        <p className="pnl-aviso-texto">
          <b>Tu asesor ya sabe que has subido documentos.</b> Los está revisando y te dirá
          si están correctos o qué hay que corregir. Si subes algo más, vuelve a avisarle.
        </p>
      </div>
    );
  }

  return (
    <div className="pnl-aviso pnl-aviso-arriba pnl-revision mb-3" data-tono="info">
      <span className="pnl-aviso-icono" aria-hidden="true"><IconoPaso nombre="send" /></span>
      {!abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="pnl-aviso-texto min-w-0 flex-1">
            <p><b>¿Has terminado de subir?</b></p>
            <p className="pnl-aviso-detalle">
              Avísanos y revisamos {(porRevisar || subidos) === 1 ? "tu documento" : `tus ${porRevisar || subidos} documentos`}.
            </p>
          </div>
          <button type="button" onClick={() => setAbierto(true)}
            className="pnl-btn-primario shrink-0" data-talla="s">
            Pedir revisión
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="pnl-aviso-texto">
            <b>Avisar a tu asesor</b>
          </p>
          <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)}
            placeholder="¿Algo que debamos saber? (opcional)"
            className="pnl-campo-control pnl-revision-nota" />
          <div className="flex items-center gap-2">
            <button type="button" onClick={pedir} disabled={enviando}
              className="pnl-btn-primario" data-talla="s">
              {enviando ? "Avisando…" : "Enviar"}
            </button>
            <button type="button" onClick={() => setAbierto(false)}
              className="pnl-btn-texto" data-talla="s">Cancelar</button>
          </div>
        </div>
      )}
      {msg && <p className="pnl-aviso-detalle">{msg}</p>}
    </div>
  );
}

/* ── Bloque plegable ─────────────────────────────────────────────────────── */

/* ── Principal ───────────────────────────────────────────────────────────── */

export default function DetalleSolicitudEstancia({ solicitudBase, onVolver, onIrAGuia, faltanPerfil = 0 }) {
  const id = solicitudBase?.id_solicitud;
  const [exp, setExp] = useState(null);
  const [docs, setDocs] = useState(null);
  const [ext, setExt] = useState([]);
  const sinLeer = solicitudBase?.resumen?.mensajes_sin_leer || 0;
  // Si el asesor escribió, se entra por ahí.
  const [bloque, setBloque] = useState(sinLeer > 0 ? 6 : 1);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [tocado, setTocado] = useState(false);

  // Sin esto, si la primera carga fallaba el esqueleto se quedaba para siempre.
  const [errorCarga, setErrorCarga] = useState("");
  const cargar = useCallback(() => {
    setErrorCarga("");
    return Promise.all([
      apiGET(`/solicitudes/${id}/estancia`),
      apiGET(`/solicitudes/${id}/estancia/documentos`),
      apiGET(`/solicitudes/${id}/estancia/extranjeria`),
    ]).then(([a, b, c]) => {
      if (a?.ok) setExp(a.expediente);
      else setErrorCarga(a?.error || "No se pudo cargar tu expediente.");
      if (b?.ok) setDocs(b);
      if (c?.ok) setExt(c.registros || []);
    }).catch((e) => setErrorCarga(e?.message || "No se pudo cargar tu expediente."));
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Cada retoque sube un numero. Si al volver la respuesta el numero cambio,
  // es que siguio escribiendo mientras se guardaba: ni se le pisa lo escrito ni
  // se da por guardado lo que aun no lo esta.
  const version = useRef(0);
  // Qué ha tocado él. Es lo único que se manda.
  const pendientes = useRef({});
  const set = (k) => (v) => {
    version.current += 1;
    pendientes.current[k] = v;
    setTocado(true);
    setExp((p) => ({ ...p, [k]: v }));
  };

  // Se guarda solo al dejar de escribir. Antes había que bajar hasta el final
  // del formulario a buscar el botón, y quien no lo encontraba perdía el rato.
  useEffect(() => {
    if (!tocado) return undefined;

    const t = setTimeout(async () => {
      const v = version.current;

      // Solo lo tocado. Mandar el expediente entero convertiría cada guardado
      // en «el último que escribe gana»: si el asesor corrige la universidad
      // mientras él escribe su teléfono, al guardar el teléfono se reenviaría
      // también la universidad vieja y la corrección se perdería.
      const payload = { ...pendientes.current };

      // Al asesorado se le pregunta una vez; los campos que el impreso repite
      // se rellenan aquí. El inicio de clases es el mismo dato que el inicio
      // del programa y el de la formación: preguntarlo tres veces sólo
      // confunde. Sólo viajan si se tocó el campo del que salen.
      if ("fecha_inicio_clases" in payload) {
        payload.prog_inicio = payload.fecha_inicio_clases;
        payload.formacion_inicio = payload.fecha_inicio_clases;
      }
      if ("prog_fin" in payload) payload.formacion_fin = payload.prog_fin;
      if ("correo" in payload) payload.dom_correo = payload.correo;
      if ("telefono" in payload) payload.dom_telefono = payload.telefono;
      if ("nombres" in payload || "apellido1" in payload || "apellido2" in payload) {
        payload.nombre_completo = [exp.nombres, exp.apellido1, exp.apellido2]
          .filter(Boolean).join(" ");
      }

      setGuardando(true);
      const r = await apiPUT(`/solicitudes/${id}/estancia/datos`, payload);
      setGuardando(false);
      if (r?.ok) {
        // Solo se refresca lo que calcula el servidor —qué falta, qué plazos—;
        // los campos se quedan como los tiene escritos delante.
        setExp((p) => ({ ...p, revision: r.expediente?.revision }));
        if (version.current === v) { pendientes.current = {}; setTocado(false); }
      }
    }, 900);

    return () => clearTimeout(t);
  }, [exp, tocado, id]);

  const rev = exp?.revision;

  // La barra de arriba del panel dice qué expediente es y cuánto lleva.
  usePublicarCabecera({
    eyebrow: solicitudBase?.id_solicitud ? `Solicitud #${solicitudBase.id_solicitud}` : null,
    titulo: "Estancia por estudios",
    pct: avanceDeRevision(rev),
  });
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
    return (
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {errorCarga
            ? <ErrorCarga mensaje={errorCarga} onReintentar={cargar} />
            : <EsqueletoExpediente variante="bloques" />}
        </div>
      </div>
    );
  }

  const g = "grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4";
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
      <div className="max-w-4xl mx-auto space-y-4 pb-6">
        <button type="button" onClick={onVolver}
          className="pnl-sin-volver text-[12px] font-semibold text-neutral-500 hover:text-primary">
          <IconoPaso nombre="arrowLeft" /> Mis servicios
        </button>

        <div className="pnl-solo-grande">
          <p className="pnl-eyebrow"><span className="punto" />Estancia por estudios</p>
          <h1 className="pnl-display pnl-exp-titulo">Tu expediente</h1>
        </div>

        <EstadoProceso revision={rev} />

        {/* Qué ha cambiado desde su última visita. Aquí las secciones son
            bloques plegables: se abre el que corresponde. */}
        <NovedadesExpediente
          idSolicitud={solicitudBase?.id_solicitud}
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
          subtitulo={datosCompletos ? "Completos" : `${hechos} de ${totalCampos} completados`}
          abierto={bloque === 1} onToggle={() => setBloque(bloque === 1 ? 0 : 1)}>

          {/* Plegado para no tapar el formulario, pero la frase de la
              responsabilidad va en el resumen: esa no puede quedar escondida. */}
          <AyudaPlegable clave="estancia-datos-antes" tono="importante"
            titulo="Antes de empezar"
            resumen={<>Se copian tal cual al formulario oficial: <b>es tu responsabilidad que sean correctos</b>.</>}>
            <p>
              Estos datos se copian <b>tal cual</b> al formulario oficial que presentamos ante
              Extranjería. Escríbelos exactamente como figuran en tu pasaporte y en tu carta de
              admisión: <b>es tu responsabilidad que sean correctos</b>. Un apellido mal escrito
              puede costar el expediente.
            </p>
            <p>
              Si dudas de algún campo, pulsa la <b>ⓘ</b> que hay junto a su nombre.
            </p>
          </AyudaPlegable>

          <div className="flex items-center gap-3 mb-3">
            <div className="pnl-barra flex-1"
              style={{ "--p": totalCampos ? (hechos / totalCampos) * 100 : 0 }}><i /></div>
            <span className="pnl-avance-cifra">
              {datosCompletos ? "listo" : `${hechos}/${totalCampos}`}
            </span>
          </div>

          <Guardado guardando={guardando} tocado={tocado} completo={datosCompletos} arriba />

          <div className="pnl-pasos">
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
              <label className="pnl-casilla-fila pnl-casilla-larga mb-3">
                <input type="checkbox"
                  checked={exp.viaje_schengen_180 === true}
                  onChange={(e) => set("viaje_schengen_180")(e.target.checked)} />
                <span>
                  He viajado al espacio Schengen en los últimos 180 días
                  <small>
                    Si es así, tus 90 días no empiezan de cero.
                  </small>
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

              <p className="pnl-eyebrow pnl-campos-grupo">Dónde está tu universidad</p>
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

              <label className="pnl-casilla-fila pnl-casilla-larga pnl-casilla-caja mb-3">
                <input type="checkbox"
                  checked={usaUni} onChange={(e) => set("dom_usa_universidad")(e.target.checked)} />
                <span>
                  <b>Todavía no tengo dirección en España</b>
                  <small>
                    Usaremos la de tu universidad. Lo que Extranjería mira es que la provincia
                    coincida, y así coincide.
                  </small>
                </span>
              </label>

              {!usaUni && (
                <div className={g}>
                  <Campo label="Calle" obligatorio falta={falta("Domicilio en España")}
                    ayuda="El nombre de la calle, sin número."
                    valor={exp.dom_direccion} onChange={set("dom_direccion")} />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-4">
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

              <p className="pnl-eyebrow pnl-campos-grupo">Algo más que debamos saber</p>
              <textarea rows={3} value={exp.notas ?? ""} onChange={(e) => set("notas")(e.target.value)}
                placeholder="Un NIE anterior, una estancia previa, cualquier cosa…"
                aria-label="Algo más que debamos saber"
                className="pnl-campo-control" />
            </Paso>
          </div>

          <Guardado guardando={guardando} tocado={tocado} completo={datosCompletos} />
        </Bloque>

        {/* ── 2 · Guía ── */}
        <Bloque numero="2" titulo="Guía del proceso"
          subtitulo="Qué se pide, en qué orden y con qué plazos"
          abierto={bloque === 2} onToggle={() => setBloque(bloque === 2 ? 0 : 2)}>
          <p className="pnl-bloque-texto">
            Recuerda que viajas <b>como turista</b> y tramitas desde España. La guía lleva lo
            que necesitas en frontera y lo que hay que reunir después.
          </p>
          <button type="button" onClick={() => onIrAGuia?.("estancia")}
            className="pnl-btn-primario">
            <Icono nombre="libro" size={16} />
            Abrir la guía de estancia por estudios
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
            <div className="pnl-aviso pnl-aviso-arriba mb-3" data-tono="aviso">
              <span className="pnl-aviso-icono" aria-hidden="true"><IconoPaso nombre="list" /></span>
              <div className="pnl-aviso-texto">
                <p>
                  Puedes ir subiendo documentos, pero <b>no podremos presentar tu expediente
                  hasta que completes tus datos</b>: se copian al formulario oficial.
                </p>
                <button type="button" onClick={() => { setBloque(1); setPaso(1); }}
                  className="pnl-btn-texto pnl-aviso-enlace" data-talla="s">
                  Ir a completar mis datos
                  <IconoPaso nombre="arrowRight" />
                </button>
              </div>
            </div>
          )}

          {docs?.observados?.length > 0 && (
            <div className="pnl-aviso pnl-aviso-arriba mb-3" data-tono="alto">
              <span className="pnl-aviso-icono" aria-hidden="true"><IconoAlerta /></span>
              <p className="pnl-aviso-texto">
                Hay {docs.observados.length} {docs.observados.length === 1 ? "documento" : "documentos"} que hay que corregir. Te decimos
                exactamente qué falla en cada uno.
              </p>
            </div>
          )}

          <ComoEscanear />

          <ResumenDocumentos ranuras={docs?.ranuras} />

          <PedirRevision id={id} docs={docs} exp={exp} onHecho={cargar} />

          <div className="ex-docs">
            {ranurasCliente.map(([clave, def]) => (
              <TarjetaDocumento key={clave} base={`/solicitudes/${id}/estancia`}
                clave={clave} def={def} onCambio={cargar} />
            ))}
          </div>

          <p className="pnl-eyebrow pnl-docs-grupo">Los preparamos nosotros</p>
          <div className="ex-docs">
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
          subtitulo={ext.length ? `${ext.length} ${ext.length === 1 ? "comunicación" : "comunicaciones"}` : "Sin novedades"}
          abierto={bloque === 5} onToggle={() => setBloque(bloque === 5 ? 0 : 5)}>
          <SeguimientoExpediente exp={exp} />

          {ext.length === 0 ? (
            <div className="pnl-vacio-suave">
              <span className="pnl-vacio-suave-icono" aria-hidden="true"><IconoPaso nombre="mail" /></span>
              <p>
                Cuando Extranjería nos comunique algo, aparecerá aquí y te avisaremos por correo.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {ext.map((r) => (
                <div key={r.id_registro} className="pnl-registro">
                  <div className="pnl-registro-cab">
                    <span className="pnl-chip" data-talla="sm" data-tono={TONO_REGISTRO[r.tipo] || "aviso"}>{r.tipo_label}</span>
                    {r.fecha && <span className="pnl-registro-fecha">{r.fecha}</span>}
                  </div>
                  <p className="pnl-registro-titulo">{r.titulo}</p>
                  {r.detalle && (
                    <p className="pnl-registro-detalle">{r.detalle}</p>
                  )}
                  {r.plazo && (
                    <p className="pnl-registro-plazo">
                      Plazo para responder: {r.plazo}
                    </p>
                  )}
                  {r.tiene_archivo && (
                    <button type="button" onClick={() => abrirArchivo(`/solicitudes/${id}/estancia/extranjeria/${r.id_registro}/archivo`, {})}
                      className="pnl-btn pnl-registro-boton" data-talla="s">
                      <IconoPaso nombre="fileText" />
                      Ver el documento
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Bloque>
        {/* ── 6 · Mensajes: lo que tiene que quedar por escrito ── */}
        <Bloque numero="6" titulo="Mensajes con tu asesor"
          subtitulo={sinLeer > 0 ? `${sinLeer} sin leer` : "Queda en tu expediente, con fecha y constancia de lectura"}
          abierto={bloque === 6} onToggle={() => setBloque(bloque === 6 ? 0 : 6)}>
          <HiloMensajes
            lado="cliente"
            idSolicitud={id}
            aviso="Lo que se escribe aquí forma parte de tu expediente: queda con fecha, con quién lo escribió y con constancia de cuándo lo leyó tu asesor. Para lo que importa, mejor aquí que por WhatsApp."
            cargar={() => apiGET(`/solicitudes/${id}/mensajes`)}
            enviar={(texto) => apiPOST(`/solicitudes/${id}/mensajes`, { texto })}
          />
        </Bloque>
      </div>
    </div>
  );
}
