// Portal del cliente para la modificación de estudios a residencia por trabajo.
//
// Tiene tres bloques de datos en vez de uno: tú, tu empresa y tu contrato. Los
// de la empresa se piden aquí a propósito aunque no sean suyos —es él quien
// tiene el trato con ella, y quien puede conseguirlos.
//
// El contrato lleva sus condiciones comprobadas mientras se rellena: si el
// salario no llega al SMI o la jornada no es completa, se avisa ahí mismo. No
// tiene sentido descubrirlo con el expediente ya presentado.
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { apiGET, apiPUT, apiPOST, apiUpload, apiDELETE } from "../../../../services/api";
import { abrirArchivo } from "../../../../services/archivos";
import HiloMensajes from "../../../../components/common/HiloMensajes";
import VisorArchivo from "../../../../components/common/VisorArchivo";
import useSubidaDocumento from "../../hooks/useSubidaDocumento";
import AvisoArchivo, { BotonHacerFoto } from "./AvisoArchivo";
import AyudaPlegable from "../AyudaPlegable";


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
  sexo: ["Hombre", "Mujer", "X"],
  estado_civil: ["Soltero/a", "Casado/a", "Viudo/a", "Divorciado/a", "Separado/a"],
  con_duracion: ["1 año", "Indefinido"],
};

/* ── Campos con ayuda ────────────────────────────────────────────────────── */

function Ayuda({ texto }) {
  const [ver, setVer] = useState(false);
  if (!texto) return null;
  return (
    <>
      <button type="button" onClick={() => setVer((v) => !v)}
        aria-label="Qué va en este campo" aria-expanded={ver}
        className="pnl-info">i</button>
      {ver && (
        <span className="pnl-ayuda-campo block w-full order-last">
          {texto}
        </span>
      )}
    </>
  );
}

function Etiqueta({ id, label, ayuda, obligatorio }) {
  return (
    <span className="pnl-campo-etiqueta flex items-center gap-x-2 gap-y-1 flex-wrap">
      <label htmlFor={id}>
        {label}
      </label>
      {!obligatorio && (
        <small>opcional</small>
      )}
      <Ayuda texto={ayuda} />
    </span>
  );
}

function Campo({ label, valor, onChange, tipo = "text", ayuda, obligatorio, falta }) {
  const id = useId();
  return (
    <div className="pnl-campo">
      <Etiqueta id={id} label={label} ayuda={ayuda} obligatorio={obligatorio} />
      <input id={id} type={tipo} value={valor ?? ""} onChange={(e) => onChange(e.target.value)}
        data-estado={falta ? "falta" : undefined}
        className="pnl-campo-control" />
    </div>
  );
}

function Selector({ label, valor, onChange, opciones, ayuda, obligatorio, falta }) {
  const id = useId();
  return (
    <div className="pnl-campo">
      <Etiqueta id={id} label={label} ayuda={ayuda} obligatorio={obligatorio} />
      <select id={id} value={valor ?? ""} onChange={(e) => onChange(e.target.value)}
        data-estado={falta ? "falta" : undefined}
        className="pnl-campo-control">
        <option value="">—</option>
        {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Guardado({ guardando, tocado, completo, arriba }) {
  const texto = guardando ? "Guardando…"
    : tocado ? "Sin guardar…"
    : completo ? "Guardado. Ya está todo."
    : "Guardado";
  const ok = !guardando && !tocado;
  return (
    <p className={`pnl-guardado ${arriba ? "pnl-guardado-arriba" : "pnl-guardado-abajo"}`} data-ok={ok ? "1" : undefined}>
      {guardando ? <span className="pnl-spinner" data-talla="s" aria-hidden="true" />
        : tocado ? <span className="pnl-guardado-punto" aria-hidden="true" />
        : <IconoPaso nombre="check" className="w-3.5 h-3.5" strokeWidth={2.4} />}
      {texto}
      {ok && (
        <span className="pnl-guardado-solo">· se guarda solo</span>
      )}
    </p>
  );
}

/* ── Estado ──────────────────────────────────────────────────────────────── */

/* ── Documentos ──────────────────────────────────────────────────────────── */

// La misma anatomía .ex-doc que la estancia y el máster (styles/panel/base.css):
// el tono del chip y `e`, el estado que colorea el icono de la ficha.
const ESTADO_DOC = {
  SIN_SUBIR: { label: "Pendiente",   tono: "neutro", e: "pendiente" },
  PENDIENTE: { label: "En revisión", tono: "info",   e: "revision" },
  APROBADO:  { label: "Aprobado",    tono: "ok",     e: "aprobado" },
  OBSERVADO: { label: "Por corregir", tono: "alto",   e: "observado" },
};

function TarjetaDocumento({ id, clave, def, onCambio }) {
  // El asesorado ve sus documentos con el mismo visor que en estancia:
  // antes aqui se abrian en otra pestaña y en estancia no, sin motivo.
  const [viendo, setViendo] = useState(null);
  const entradaRef = useRef(null);
  const cfg = ESTADO_DOC[def.estado] || ESTADO_DOC.SIN_SUBIR;
  const ultimo = def.archivos[0];
  const esDelAsesor = def.de === "asesor";

  // Mismo recorrido que en estancia: fotos a un PDF, avisos de borrosa o de
  // una sola cara, y el mismo endpoint de siempre, un archivo por petición.
  const subida = useSubidaDocumento({
    texto: `${def.etiqueta || ""} ${def.requisito || ""}`,
    varios: Boolean(def.varios),
    // La firma digitalizada y las fotografías se usan como imagen.
    convertir: !(def.clave === "firma" || /foto|firma/i.test(def.etiqueta || "")),
    enviar: async (archivos) => {
      for (const archivo of archivos) {
        const datos = new FormData();
        datos.append("archivo", archivo);
        await apiUpload(`/solicitudes/${id}/modificatoria/documentos/${clave}`, datos);
      }
    },
    onHecho: onCambio,
  });
  const subiendo = subida.ocupado;

  async function quitar(idDoc) {
    const r = await apiDELETE(`/solicitudes/${id}/modificatoria/documentos/archivo/${idDoc}`);
    if (r?.ok) onCambio();
  }

  return (
    <div className="ex-doc pnl-doc" data-e={cfg.e}>
      <span className="ex-doc-ico"><IconoPaso nombre="fileText" /></span>
      <div className="ex-doc-fila">
        <span className="n">
          {def.etiqueta}{def.obligatorio && <span className="pnl-obligatorio"> *</span>}
        </span>
        <span className="pnl-chip" data-talla="sm" data-tono={cfg.tono}>
          {esDelAsesor && def.estado === "SIN_SUBIR" ? "Lo hacemos nosotros" : cfg.label}
        </span>
      </div>

      {def.requisito && (
        <div className="ex-doc-pliegues">
          <details className="group">
            <summary>
              <span className="group-open:hidden">Ver requisitos</span>
              <span className="hidden group-open:inline">Ocultar requisitos</span>
            </summary>
            <p className="ex-doc-cuerpo">{def.requisito}</p>
          </details>
        </div>
      )}

      {ultimo?.observacion && (
        <div className="ex-doc-obs">
          <IconoAlerta className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <b className="block">Hay que corregirlo</b>
            {ultimo.observacion}
          </span>
        </div>
      )}

      {def.estado === "PENDIENTE" && !subida.recibido && (
        <p className="pnl-doc-estado">
          Lo tenemos. Tu asesor lo está revisando.
        </p>
      )}

      {def.archivos.length > 0 && (
        <div className="ex-doc-archivos">
          {def.archivos.map((a) => (
            <div key={a.id_documento} className="ex-arch">
              <IconoPaso nombre="clip" className="w-4 h-4" />
              <button type="button" onClick={() => setViendo(a)} className="nm" title={a.nombre}>
                {a.nombre}
              </button>
              {a.subido_por === "CLIENTE" && (
                <button type="button" onClick={() => quitar(a.id_documento)} data-peligro>Quitar</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* En un portal: la vista con transición (.pnl-vista) es su propio
          contexto de apilado y la barra del panel le tapaba la cabecera. */}
      {viendo && createPortal(
        // Con su propio .pnl: en document.body quedaría fuera de los tokens.
        <div className="pnl pnl-visor-archivo">
          <VisorArchivo
            ruta={`/solicitudes/${id}/modificatoria/documentos/archivo/${viendo.id_documento}`}
            nombre={viendo.nombre}
            mime={viendo.mime}
            tamano={viendo.tamano}
            onCerrar={() => setViendo(null)}
          />
        </div>,
        document.body,
      )}

      {!esDelAsesor && (
        <div className="pnl-arch-pie">
          <label className="ex-subir">
            <IconoPaso nombre="upload" />
            {subida.preparando ? "Preparando…"
              : subiendo ? "Subiendo…"
              : def.estado === "OBSERVADO" ? "Corregir"
              : def.archivos.length ? (def.varios ? "Añadir otro archivo" : "Reemplazar el archivo")
              : "Subir archivo"}
            {/* `multiple`: varias fotos del mismo documento salen en un PDF. */}
            <input ref={entradaRef} type="file" className="pnl-arch-oculto" accept="application/pdf,image/*"
              multiple disabled={subiendo}
              onChange={(e) => { subida.elegir(e.target.files); e.target.value = ""; }} />
          </label>
          <BotonHacerFoto onFotos={subida.elegir} disabled={subiendo} />
        </div>
      )}
      {!esDelAsesor && (
        <AvisoArchivo subida={subida} onElegirOtra={() => entradaRef.current?.click()} />
      )}

      {esDelAsesor && def.archivos.length === 0 && (
        <p className="ex-nota">
          Lo preparamos nosotros y aparecerá aquí.
        </p>
      )}
    </div>
  );
}

function PedirRevision({ id, docs, exp, onHecho }) {
  const [abierto, setAbierto] = useState(false);
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  const subidos = Object.values(docs?.ranuras || {})
    .filter((r) => r.de === "cliente" && r.archivos.length).length;
  const yaPedida = Boolean(exp?.revision_solicitada_at);

  async function pedir() {
    setEnviando(true); setMsg("");
    const r = await apiPOST(`/solicitudes/${id}/modificatoria/solicitar-revision`, { nota });
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
          <b>Tu asesor ya sabe que has subido documentos.</b> Los está revisando y te dirá si
          están correctos o qué hay que corregir. Si subes algo más, vuelve a avisarle.
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
              Avísanos y revisamos {subidos === 1 ? "tu documento" : `tus ${subidos} documentos`}.
            </p>
          </div>
          <button type="button" onClick={() => setAbierto(true)}
            className="pnl-btn-primario shrink-0" data-talla="s">
            Pedir revisión
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="pnl-aviso-texto"><b>Avisar a tu asesor</b></p>
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

/* ── Principal ───────────────────────────────────────────────────────────── */

export default function DetalleSolicitudModificatoria({ solicitudBase, onVolver, onIrAGuia }) {
  const id = solicitudBase?.id_solicitud;
  const [exp, setExp] = useState(null);
  const [docs, setDocs] = useState(null);
  const [ext, setExt] = useState([]);
  const sinLeer = solicitudBase?.resumen?.mensajes_sin_leer || 0;
  // Si el asesor escribió, se entra por ahí.
  const [bloque, setBloque] = useState(sinLeer > 0 ? 5 : 1);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [tocado, setTocado] = useState(false);

  // Sin esto, si la primera carga fallaba el esqueleto se quedaba para siempre.
  const [errorCarga, setErrorCarga] = useState("");
  const cargar = useCallback(() => {
    setErrorCarga("");
    return Promise.all([
      apiGET(`/solicitudes/${id}/modificatoria`),
      apiGET(`/solicitudes/${id}/modificatoria/documentos`),
      apiGET(`/solicitudes/${id}/modificatoria/extranjeria`),
    ]).then(([a, b, c]) => {
      if (a?.ok) setExp(a.expediente);
      else setErrorCarga(a?.error || "No se pudo cargar tu expediente.");
      if (b?.ok) setDocs(b);
      if (c?.ok) setExt(c.registros || []);
    }).catch((e) => setErrorCarga(e?.message || "No se pudo cargar tu expediente."));
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Cada retoque sube un numero, para no pisar lo que escriba mientras se
  // guarda ni dar por guardado lo que aun no lo esta.
  const version = useRef(0);
  // Qué ha tocado él. Es lo único que se manda: ver el comentario del guardado.
  const pendientes = useRef({});
  const set = (k) => (v) => {
    version.current += 1;
    pendientes.current[k] = v;
    setTocado(true);
    setExp((p) => ({ ...p, [k]: v }));
  };

  // Se guarda solo al dejar de escribir, sin botón que ir a buscar.
  useEffect(() => {
    if (!tocado) return undefined;

    const t = setTimeout(async () => {
      const v = version.current;
      // Solo lo tocado: mandar el expediente entero haría que dos personas
      // trabajando a la vez se pisaran campos que ninguna ha llegado a tocar.
      setGuardando(true);
      const r = await apiPUT(
        `/solicitudes/${id}/modificatoria/datos`, { ...pendientes.current },
      );
      setGuardando(false);
      if (r?.ok) {
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
    titulo: "Modificación a residencia por trabajo",
    pct: avanceDeRevision(rev),
  });
  const faltaSet = useMemo(() => new Set(rev?.faltan || []), [rev]);
  const falta = (l) => faltaSet.has(l);
  const cuenta = useCallback((ls) => ls.filter((l) => faltaSet.has(l)).length, [faltaSet]);

  const porGrupo = useCallback((g) =>
    Object.entries(docs?.ranuras || {}).filter(([, d]) => d.grupo === g), [docs]);

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
    1: ["Primer apellido", "Nombres", "Nº de pasaporte", "NIE", "Sexo", "Fecha de nacimiento",
        "Lugar de nacimiento", "País de nacimiento", "Nacionalidad", "Estado civil",
        "Nombre del padre", "Nombre de la madre", "Domicilio en España", "Localidad",
        "Código postal", "Provincia", "Teléfono", "Correo electrónico"],
    2: ["Razón social de la empresa", "NIF de la empresa", "Actividad de la empresa",
        "Domicilio social", "Localidad de la empresa", "C.P. de la empresa",
        "Provincia de la empresa"],
    3: ["Puesto de trabajo", "Retribución bruta anual", "Horas de jornada",
        "Duración del contrato", "Dirección del centro de trabajo",
        "Localidad del centro de trabajo", "Provincia del centro de trabajo"],
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
          <p className="pnl-eyebrow"><span className="punto" />Modificación a residencia por trabajo</p>
          <h1 className="pnl-display pnl-exp-titulo">Tu expediente</h1>
        </div>

        <EstadoProceso revision={rev} />

        {/* Qué ha cambiado desde su última visita. Aquí las secciones son
            bloques plegables: se abre el que corresponde. */}
        <NovedadesExpediente
          idSolicitud={solicitudBase?.id_solicitud}
          onIrSeccion={(sec) => { const n = ({ docs: 3, estado: 4, mensajes: 5 })[sec]; if (n) setBloque(n); }}
        />

        {/* ── 1 · Datos ── */}
<ComoInvitado solicitud={solicitudBase} />
        <OtraPersona invitados={exp.invitados} />

        <Bloque numero="1" titulo="Tus datos"
          subtitulo={rev?.completo ? "Completos" : `${hechos} de ${totalCampos} completados`}
          abierto={bloque === 1} onToggle={() => setBloque(bloque === 1 ? 0 : 1)}>

          {/* Plegado para no tapar el formulario, pero la frase de la
              responsabilidad va en el resumen: esa no puede quedar escondida. */}
          <AyudaPlegable clave="modificatoria-datos-antes" tono="importante"
            titulo="Antes de empezar"
            resumen={<>Se copian tal cual al formulario oficial: <b>es tu responsabilidad que sean correctos</b>.</>}>
            <p>
              Estos datos se copian <b>tal cual</b> al formulario oficial que presentamos ante
              Extranjería. Escríbelos exactamente como figuran en tus documentos y en tu
              precontrato: <b>es tu responsabilidad que sean correctos</b>.
            </p>
            <p>
              Si dudas de algún campo, pulsa la <b>ⓘ</b> que hay junto a su nombre.
            </p>
          </AyudaPlegable>

          <div className="flex items-center gap-3 mb-3">
            <div className="pnl-barra flex-1"
              style={{ "--p": totalCampos ? (hechos / totalCampos) * 100 : 0 }}><i /></div>
            <span className="pnl-avance-cifra">
              {rev?.completo ? "listo" : `${hechos}/${totalCampos}`}
            </span>
          </div>

          {rev?.avisos?.map((a, i) => (
            <div key={i} className="pnl-aviso pnl-aviso-arriba mb-3" data-tono="aviso">
              <span className="pnl-aviso-icono" aria-hidden="true"><IconoAlerta /></span>
              <p className="pnl-aviso-texto">{a}</p>
            </div>
          ))}

          <div className="pnl-pasos">
            <Paso numero="1" titulo="Tú" subtitulo="Como figura en tu pasaporte y tu TIE"
              faltan={cuenta(PASOS[1])} abierto={paso === 1} onToggle={() => abrir(1)} onSiguiente={() => setPaso(2)}>
              <div className={g}>
                <Campo label="1er apellido" obligatorio falta={falta("Primer apellido")}
                  ayuda="Exactamente como aparece en tu pasaporte."
                  valor={exp.apellido1} onChange={set("apellido1")} />
                <Campo label="2º apellido" valor={exp.apellido2} onChange={set("apellido2")}
                  ayuda="Si en tu país no se usan dos, déjalo vacío." />
                <Campo label="Nombres" obligatorio falta={falta("Nombres")}
                  valor={exp.nombres} onChange={set("nombres")} />
                <Campo label="Nº de pasaporte" obligatorio falta={falta("Nº de pasaporte")}
                  valor={exp.pasaporte_numero} onChange={set("pasaporte_numero")} />
                <Campo label="NIE" obligatorio falta={falta("NIE")}
                  ayuda="El de tu TIE actual de estudiante."
                  valor={exp.nie} onChange={set("nie")} />
                <Selector label="Sexo" obligatorio falta={falta("Sexo")} opciones={OPCIONES.sexo}
                  valor={exp.sexo} onChange={set("sexo")} />
                <Campo label="Fecha de nacimiento" tipo="date" obligatorio
                  falta={falta("Fecha de nacimiento")}
                  valor={exp.fecha_nacimiento} onChange={set("fecha_nacimiento")} />
                <Campo label="Lugar de nacimiento" obligatorio falta={falta("Lugar de nacimiento")}
                  ayuda="La ciudad, no el país." valor={exp.lugar_nacimiento} onChange={set("lugar_nacimiento")} />
                <Campo label="País de nacimiento" obligatorio falta={falta("País de nacimiento")}
                  valor={exp.pais_nacimiento} onChange={set("pais_nacimiento")} />
                <Campo label="Nacionalidad" obligatorio falta={falta("Nacionalidad")}
                  valor={exp.nacionalidad} onChange={set("nacionalidad")} />
                <Selector label="Estado civil" obligatorio falta={falta("Estado civil")}
                  opciones={OPCIONES.estado_civil} valor={exp.estado_civil} onChange={set("estado_civil")} />
                <Campo label="Nombre del padre" obligatorio falta={falta("Nombre del padre")}
                  ayuda="Nombre y apellidos completos." valor={exp.nombre_padre} onChange={set("nombre_padre")} />
                <Campo label="Nombre de la madre" obligatorio falta={falta("Nombre de la madre")}
                  valor={exp.nombre_madre} onChange={set("nombre_madre")} />
                <Campo label="Teléfono" obligatorio falta={falta("Teléfono")}
                  valor={exp.telefono} onChange={set("telefono")} />
                <Campo label="Correo" tipo="email" obligatorio falta={falta("Correo electrónico")}
                  valor={exp.correo} onChange={set("correo")} />
              </div>

              <p className="pnl-eyebrow pnl-campos-grupo">Tu domicilio en España</p>
              <div className={g}>
                <Campo label="Calle" obligatorio falta={falta("Domicilio en España")}
                  valor={exp.dom_direccion} onChange={set("dom_direccion")} />
                <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                  <Campo label="Número" valor={exp.dom_numero} onChange={set("dom_numero")} />
                  <Campo label="Piso" valor={exp.dom_piso} onChange={set("dom_piso")} />
                </div>
                <Campo label="Localidad" obligatorio falta={falta("Localidad")}
                  valor={exp.dom_localidad} onChange={set("dom_localidad")} />
                <Campo label="Código postal" obligatorio falta={falta("Código postal")}
                  valor={exp.dom_cp} onChange={set("dom_cp")} />
                <Campo label="Provincia" obligatorio falta={falta("Provincia")}
                  valor={exp.dom_provincia} onChange={set("dom_provincia")} />
              </div>

              <label className="pnl-casilla-fila pnl-casilla-larga mt-3">
                <input type="checkbox"
                  checked={exp.hijos_escolarizacion === true}
                  onChange={(e) => set("hijos_escolarizacion")(e.target.checked)} />
                <span>
                  Tengo hijas o hijos a cargo en edad de escolarización en España
                  <small>
                    El impreso lo pregunta y cambia algunos trámites.
                  </small>
                </span>
              </label>
            </Paso>

            <Paso numero="2" titulo="Tu empresa"
              subtitulo="Los datos te los da tu empleador"
              faltan={cuenta(PASOS[2])} abierto={paso === 2} onToggle={() => abrir(2)} onSiguiente={() => setPaso(3)}>
              <div className={g}>
                <Campo label="Razón social" obligatorio falta={falta("Razón social de la empresa")}
                  ayuda="El nombre legal completo, no el comercial."
                  valor={exp.emp_razon_social} onChange={set("emp_razon_social")} />
                <Campo label="NIF de la empresa" obligatorio falta={falta("NIF de la empresa")}
                  valor={exp.emp_nif} onChange={set("emp_nif")} />
                <Campo label="Actividad" obligatorio falta={falta("Actividad de la empresa")}
                  ayuda="A qué se dedica." valor={exp.emp_actividad} onChange={set("emp_actividad")} />
                <Campo label="CNAE" ayuda="Código de actividad. Si no lo sabes, lo pedimos nosotros."
                  valor={exp.emp_cnae} onChange={set("emp_cnae")} />
                <Campo label="Domicilio social" obligatorio falta={falta("Domicilio social")}
                  valor={exp.emp_direccion} onChange={set("emp_direccion")} />
                <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                  <Campo label="Número" valor={exp.emp_numero} onChange={set("emp_numero")} />
                  <Campo label="Piso" valor={exp.emp_piso} onChange={set("emp_piso")} />
                </div>
                <Campo label="Localidad" obligatorio falta={falta("Localidad de la empresa")}
                  valor={exp.emp_localidad} onChange={set("emp_localidad")} />
                <Campo label="Código postal" obligatorio falta={falta("C.P. de la empresa")}
                  valor={exp.emp_cp} onChange={set("emp_cp")} />
                <Campo label="Provincia" obligatorio falta={falta("Provincia de la empresa")}
                  valor={exp.emp_provincia} onChange={set("emp_provincia")} />
                <Campo label="Teléfono" valor={exp.emp_telefono} onChange={set("emp_telefono")} />
                <Campo label="Correo" tipo="email" valor={exp.emp_correo} onChange={set("emp_correo")} />
              </div>
            </Paso>

            <Paso numero="3" titulo="Tu contrato"
              subtitulo="Lo que decide el expediente"
              faltan={cuenta(PASOS[3])} abierto={paso === 3} onToggle={() => abrir(3)}>

              <div className="pnl-aviso pnl-aviso-arriba mb-4" data-tono="info">
                <span className="pnl-aviso-icono" aria-hidden="true"><IconoPaso nombre="info" /></span>
                <p className="pnl-aviso-texto">
                  Extranjería exige tres cosas del precontrato: <b>salario igual o superior al
                  SMI</b> (unos {(rev?.smi_referencia || 16576).toLocaleString("es-ES")} € brutos
                  al año), <b>jornada completa de 40 horas</b> y <b>duración de un año o
                  indefinida</b>. Si algo no cumple, lo deniegan sin mirar el resto.
                </p>
              </div>

              <div className={g}>
                <Campo label="Puesto de trabajo" obligatorio falta={falta("Puesto de trabajo")}
                  ayuda="Tal como figura en el precontrato."
                  valor={exp.con_puesto} onChange={set("con_puesto")} />
                <Campo label="Retribución bruta anual" obligatorio
                  falta={falta("Retribución bruta anual")}
                  ayuda="En euros y al año, antes de impuestos."
                  valor={exp.con_retribucion} onChange={set("con_retribucion")} />
                <Campo label="Horas de jornada" obligatorio falta={falta("Horas de jornada")}
                  ayuda="Semanales. Tienen que ser 40."
                  valor={exp.con_jornada_horas} onChange={set("con_jornada_horas")} />
                <Selector label="Duración" obligatorio falta={falta("Duración del contrato")}
                  opciones={OPCIONES.con_duracion}
                  valor={exp.con_duracion} onChange={set("con_duracion")} />
                <Campo label="Grupo de cotización" valor={exp.con_grupo_cotizacion}
                  onChange={set("con_grupo_cotizacion")} />
                <Campo label="CNO SEPE 2011" ayuda="Código de ocupación. Suele venir en el contrato."
                  valor={exp.con_cno_sepe} onChange={set("con_cno_sepe")} />
                <Campo label="Código de convenio" valor={exp.con_codigo_convenio}
                  onChange={set("con_codigo_convenio")} />
                <Campo label="Denominación del convenio" valor={exp.con_denom_convenio}
                  onChange={set("con_denom_convenio")} />
                <Campo label="Código de contrato" valor={exp.con_codigo_contrato}
                  onChange={set("con_codigo_contrato")} />
                <Campo label="Denominación del contrato" valor={exp.con_denom_contrato}
                  onChange={set("con_denom_contrato")} />
                <Campo label="Cuenta de cotización" valor={exp.con_cuenta_cotizacion}
                  onChange={set("con_cuenta_cotizacion")} />
              </div>

              <p className="pnl-eyebrow pnl-campos-grupo">Centro de trabajo</p>
              <div className={g}>
                <Campo label="Dirección" obligatorio falta={falta("Dirección del centro de trabajo")}
                  ayuda="Dónde vas a trabajar de verdad, que puede no ser el domicilio social."
                  valor={exp.con_centro_direccion} onChange={set("con_centro_direccion")} />
                <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                  <Campo label="Número" valor={exp.con_centro_numero} onChange={set("con_centro_numero")} />
                  <Campo label="Piso" valor={exp.con_centro_piso} onChange={set("con_centro_piso")} />
                </div>
                <Campo label="Localidad" obligatorio falta={falta("Localidad del centro de trabajo")}
                  valor={exp.con_centro_localidad} onChange={set("con_centro_localidad")} />
                <Campo label="Código postal" valor={exp.con_centro_cp} onChange={set("con_centro_cp")} />
                <Campo label="Provincia" obligatorio falta={falta("Provincia del centro de trabajo")}
                  valor={exp.con_centro_provincia} onChange={set("con_centro_provincia")} />
              </div>

              <p className="pnl-eyebrow pnl-campos-grupo">Algo más que debamos saber</p>
              <textarea rows={3} value={exp.notas ?? ""} onChange={(e) => set("notas")(e.target.value)}
                placeholder="Cualquier cosa sobre tu situación o tu contrato…"
                aria-label="Algo más que debamos saber"
                className="pnl-campo-control" />
            </Paso>
          </div>

          <Guardado guardando={guardando} tocado={tocado} completo={rev?.completo} />
        </Bloque>

        {/* ── 2 · Documentos ── */}
        {/* ── 2 · Guía ── */}
        <Bloque numero="2" titulo="Guía del proceso"
          subtitulo="Los plazos, los requisitos y qué pide tu empresa"
          abierto={bloque === 2} onToggle={() => setBloque(bloque === 2 ? 0 : 2)}>
          <p className="pnl-bloque-texto">
            Léela antes de subir nada. Lleva la <b>calculadora de tu ventana de
            presentación</b> —que se abre dos meses antes y se cierra tres después—, la lista
            de lo que tiene que aportar tu empresa y la <b>cláusula que tu contrato debe
            incluir palabra por palabra</b>.
          </p>
          <button type="button" onClick={() => onIrAGuia?.("modificatoria")}
            className="pnl-btn-primario">
            <Icono nombre="libro" size={16} />
            Abrir la guía de residencia y trabajo
          </button>
        </Bloque>

        {/* ── 3 · Documentos ── */}
        <Bloque numero="3" titulo="Tus documentos"
          subtitulo={docs?.faltan?.length ? `Te faltan ${docs.faltan.length}`
            : docs?.observados?.length ? `${docs.observados.length} por corregir`
            : "Todo entregado"}
          abierto={bloque === 3} onToggle={() => setBloque(bloque === 3 ? 0 : 3)}>

          <ComoEscanear />

          <PedirRevision id={id} docs={docs} exp={exp} onHecho={cargar} />

          {docs?.observados?.length > 0 && (
            <div className="pnl-aviso pnl-aviso-arriba mb-3" data-tono="alto">
              <span className="pnl-aviso-icono" aria-hidden="true"><IconoAlerta /></span>
              <p className="pnl-aviso-texto">
                Hay {docs.observados.length} {docs.observados.length === 1 ? "documento" : "documentos"} que hay que corregir.
              </p>
            </div>
          )}

          {[["extranjero", "Los aportas tú"],
            ["empresa", "Los aporta tu empresa"],
            ["inspira", "Los preparamos nosotros"]].map(([clave, titulo]) => (
            <div key={clave} className="pnl-docs-bloque">
              <p className="pnl-eyebrow pnl-docs-grupo">{titulo}</p>
              {clave === "empresa" && (
                <p className="pnl-docs-grupo-nota">
                  Estos los tiene que darte tu empleador. Es donde más se retrasa este trámite,
                  así que pídeselos cuanto antes.
                </p>
              )}
              <div className="ex-docs">
                {porGrupo(clave).map(([k, def]) => (
                  <TarjetaDocumento key={k} id={id} clave={k} def={def} onCambio={cargar} />
                ))}
              </div>
            </div>
          ))}
        </Bloque>

        {/* ── 3 · Extranjería ── */}
        <Bloque numero="4" titulo="Extranjería"
          subtitulo={ext.length ? `${ext.length} ${ext.length === 1 ? "comunicación" : "comunicaciones"}` : "Sin novedades"}
          abierto={bloque === 4} onToggle={() => setBloque(bloque === 4 ? 0 : 4)}>

          {(exp.expediente_numero || exp.expediente_justificante || exp.nie) && (
            <div className="pnl-ficha">
              <p className="pnl-eyebrow">Para consultar tu expediente</p>
              <table className="pnl-ficha-tabla"><tbody>
                {[["Nº de expediente", exp.expediente_numero],
                  ["Nº de justificante", exp.expediente_justificante],
                  ["NIE", exp.nie],
                  ["Fecha de ingreso", exp.expediente_fecha],
                  ["Año de nacimiento", (exp.fecha_nacimiento || "").slice(0, 4)],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <tr key={k}>
                    <td className="pnl-ficha-k">{k}</td>
                    <td className="pnl-ficha-v">{v}</td>
                  </tr>
                ))}
              </tbody></table>
              <a href="https://infoext2.delegaciondelgobierno.gob.es/infoext2/consulta.html"
                target="_blank" rel="noreferrer"
                className="pnl-btn-texto pnl-ficha-enlace" data-talla="s">
                Consultar en la sede de la Delegación del Gobierno
                <IconoPaso nombre="external" />
              </a>
            </div>
          )}

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
                    <button type="button" onClick={() => abrirArchivo(`/solicitudes/${id}/modificatoria/extranjeria/${r.id_registro}/archivo`, {})}
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
        {/* ── 5 · Mensajes: lo que tiene que quedar por escrito ── */}
        <Bloque numero="5" titulo="Mensajes con tu asesor"
          subtitulo={sinLeer > 0 ? `${sinLeer} sin leer` : "Queda en tu expediente, con fecha y constancia de lectura"}
          abierto={bloque === 5} onToggle={() => setBloque(bloque === 5 ? 0 : 5)}>
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
