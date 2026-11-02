// src/pages/panel/components/mis-servicios/sections/VisaDatosCliente.jsx
//
// Bloque 1 del expediente de visado. A diferencia del resto del portal, aquí
// el CLIENTE escribe: son los datos con los que Inspira emite su impreso
// oficial de solicitud. Se guarda de forma incremental (puede completar poco a
// poco) y queda bloqueado en cuanto el formulario se firma.
//
// Ojo: aquí NO se piden datos de máster (promedio, becas, preferencias…). Un
// expediente de visado sólo necesita lo que exige el consulado.
import { useEffect, useMemo, useRef, useState } from "react";
import { apiPUT } from "../../../../../services/api";
import AyudaPlegable from "../../AyudaPlegable";
import IconoPaso from "../../../../../components/common/IconoPaso";
import { IconoLinea } from "../utils";
import Icono from "../../../../../components/common/Icono";

/* ── Fechas ───────────────────────────────────────────────────────────────────
   En base de datos se guardan como texto libre porque el expediente arrastra
   valores heredados. El <input type="date"> sólo entiende yyyy-mm-dd, así que
   normalizamos en ambos sentidos y toleramos dd/mm/yyyy de registros antiguos. */
function aISO(valor) {
  if (!valor) return "";
  const v = String(valor).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const m = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return "";
}

const ESTADOS_CIVILES = ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"];
const TIPOS_ESTUDIO = ["Grado", "Máster", "FP", "Doctorado", "Otro"];

/* Campos que viajan al backend. El orden no importa; la lista sí: es el
   contrato con CAMPOS_CLIENTE de visa.service.js. */
const CAMPOS = [
  "apellidos", "nombres",
  "dni", "num_pasaporte", "exp_pasaporte", "venc_pasaporte",
  "pais_nacimiento", "lugar_nacimiento", "fecha_nacimiento",
  "estado_civil", "profesion",
  "domicilio", "correo", "telefono",
  "viaje_fecha_prevista", "domicilio_espana",
  "centro_direccion", "centro_telefono", "centro_correo",
  "tipo_estudios", "semestres_total", "centro_inicio", "centro_fin",
];
// Todos estos datos van al impreso oficial: si falta uno, el consulado
// rechaza el formulario. Por eso no hay campos opcionales aqui.
const OPCIONALES = new Set([]);
const CAMPOS_FECHA = [
  "exp_pasaporte", "venc_pasaporte", "fecha_nacimiento",
  "viaje_fecha_prevista", "centro_inicio", "centro_fin",
];

// Los datos que comparte con su perfil. El perfil es la fuente única
// (backend: perfil.campos.js): se leen de allí primero y, al guardar, lo que
// cambie aquí sube al perfil (perfilSync.js, el último dato guardado gana).
// Antes mandaba lo guardado en el expediente, y quien corregía su pasaporte
// en «Mi perfil» seguía viendo aquí el viejo.
function primero(perfil, expediente) {
  return String(perfil ?? "").trim() ? perfil : (expediente || "");
}

function estadoInicial(exp, cli, extra) {
  const e = exp || {};
  const c = cli || {};
  const x = extra || {};
  // Firmado, el formulario es el impreso presentado: se enseña tal cual se
  // firmó, aunque luego el perfil haya cambiado.
  const firmado = e.formulario_estado === "FIRMADO";
  const comun = (perfil, expediente) => (firmado ? (expediente || perfil || "") : primero(perfil, expediente));
  const base = {
    // Van separados porque el impreso oficial los pide en dos líneas: los dos
    // apellidos juntos en la primera, los nombres en la segunda.
    apellidos:        e.apellidos        || "",
    nombres:          e.nombres          || "",
    dni:              comun(c.dni, e.dni),
    num_pasaporte:    comun(c.pasaporte, e.num_pasaporte),
    exp_pasaporte:    comun(x.pasaporte_emision, e.exp_pasaporte),
    venc_pasaporte:   comun(x.pasaporte_vencimiento, e.venc_pasaporte),
    pais_nacimiento:  comun(c.pais_origen, e.pais_nacimiento),
    lugar_nacimiento: e.lugar_nacimiento || "",
    fecha_nacimiento: comun(x.fecha_nacimiento, e.fecha_nacimiento),
    estado_civil:     e.estado_civil     || "",
    profesion:        e.profesion        || "",
    domicilio:        e.domicilio        || "",
    // El correo NO sigue al perfil: el de su cuenta es su acceso con Google,
    // y aquí puede poner otro de contacto para este trámite.
    correo:           e.correo           || c.email_contacto || "",
    telefono:         comun(c.telefono, e.telefono),
    viaje_fecha_prevista: e.viaje_fecha_prevista || "",
    domicilio_espana:     e.domicilio_espana     || "",
    centro_direccion: e.centro_direccion || "",
    centro_telefono:  e.centro_telefono  || "",
    centro_correo:    e.centro_correo    || "",
    tipo_estudios:    e.tipo_estudios    || "",
    semestres_total:  e.semestres_total  || "",
    centro_inicio:    e.centro_inicio    || "",
    centro_fin:       e.centro_fin       || "",
  };
  for (const k of CAMPOS_FECHA) base[k] = aISO(base[k]);
  return base;
}

/* ── Piezas de interfaz ──────────────────────────────────────────────────── */
// Los tonos de siempre (info, ok, warn) en el diccionario del panel. El
// icono: el que se le pase o, si no, el del tono.
const AVISO_TONO = { info: "info", ok: "ok", warn: "aviso", stop: "alto" };
const AVISO_ICONO = { info: "info", ok: "checkCircle", aviso: "alert", alto: "alert" };
function Aviso({ tono = "info", icono, children }) {
  const t = AVISO_TONO[tono] || "info";
  return (
    <div className="pnl-aviso pnl-aviso-bloque" data-tono={t}>
      <span className="pnl-aviso-icono">{icono || <IconoLinea nombre={AVISO_ICONO[t]} />}</span>
      <div className="pnl-aviso-texto">{children}</div>
    </div>
  );
}

function Grupo({ titulo, children }) {
  return (
    <div className="pnl-tarjeta pnl-tarjeta-visado" data-anidada="1">
      <p className="pnl-eyebrow"><span className="punto" />{titulo}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4">{children}</div>
    </div>
  );
}

// La etiqueta va ENCIMA de la caja, legible; si falta el dato, la caja lo dice.
function Campo({ label, valor, onChange, tipo = "text", ancho, pista, opciones, disabled, placeholder, falta }) {
  const clase = ancho === "full" ? "sm:col-span-2" : "";
  return (
    <div className={`pnl-campo ${clase}`}>
      <label className="pnl-campo-etiqueta">
        {label}{falta && <span className="pnl-campo-falta"> · falta</span>}
      </label>
      {opciones ? (
        <select className="pnl-campo-control" data-estado={falta ? "falta" : undefined} value={valor} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
          <option value="">Elige…</option>
          {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={tipo}
          className="pnl-campo-control"
          data-estado={falta ? "falta" : undefined}
          value={valor}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
      {pista && <p className="pnl-campo-pista">{pista}</p>}
    </div>
  );
}

function OpcionTarjeta({ activa, icono, titulo, descripcion, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={activa}
      className="pnl-opcion"
    >
      {activa && (
        <span className="pnl-opcion-marca">
          <IconoPaso nombre="check" strokeWidth={2.4} />
          Tu opción
        </span>
      )}
      <span className="pnl-opcion-cab">
        <span className="pnl-opcion-ico">{icono}</span>
        <span className="min-w-0">
          <span className="pnl-opcion-titulo">{titulo}</span>
          <span className="pnl-opcion-texto">{descripcion}</span>
        </span>
      </span>
    </button>
  );
}

/* ── Componente principal ────────────────────────────────────────────────── */
export default function VisaDatosCliente({ idSolicitud, expediente, cliente, extra, onGuardado }) {
  const bloqueado = expediente?.formulario_estado === "FIRMADO";

  const [pestana, setPestana] = useState(1);
  const [form, setForm] = useState(() => estadoInicial(expediente, cliente, extra));
  const [bls, setBls] = useState(() => ({
    tiene: expediente?.bls_tiene_cuenta ?? null,
    usuario: expediente?.bls_usuario || "",
    password: expediente?.bls_password || "",
  }));
  const [sucio, setSucio] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [verPass, setVerPass] = useState(false);

  // El detalle se auto-refresca cada 25 s. Si resincronizáramos el formulario en
  // cada refresco, borraríamos lo que el cliente está escribiendo; por eso sólo
  // se re-siembra mientras no haya cambios sin guardar.
  const sucioRef = useRef(sucio);
  sucioRef.current = sucio;
  useEffect(() => {
    if (sucioRef.current) return;
    setForm(estadoInicial(expediente, cliente, extra));
    setBls({
      tiene: expediente?.bls_tiene_cuenta ?? null,
      usuario: expediente?.bls_usuario || "",
      password: expediente?.bls_password || "",
    });
  }, [expediente, cliente, extra]);

  const faltantes = useMemo(
    () => CAMPOS.filter((k) => !OPCIONALES.has(k) && String(form[k] || "").trim() === ""),
    [form]
  );
  const completados = CAMPOS.length - faltantes.length;

  function set(campo, valor) {
    setSucio(true);
    setAviso(null);
    setForm((f) => ({ ...f, [campo]: valor }));
  }
  function setCredencial(campo, valor) {
    setSucio(true);
    setAviso(null);
    setBls((b) => ({ ...b, [campo]: valor }));
  }

  async function guardar() {
    if (bloqueado || guardando) return;
    setGuardando(true);
    setAviso(null);
    try {
      const cuerpo = { ...form, bls_tiene_cuenta: bls.tiene };
      // Sólo mandamos credenciales si el cliente dijo tener cuenta: si eligió
      // "no tengo", no tiene sentido arrastrar un usuario escrito por error.
      if (bls.tiene === true) {
        cuerpo.bls_usuario = bls.usuario;
        cuerpo.bls_password = bls.password;
      } else if (bls.tiene === false) {
        cuerpo.bls_usuario = "";
        cuerpo.bls_password = "";
      }
      const r = await apiPUT(`/solicitudes/${idSolicitud}/visa-expediente/datos`, cuerpo);
      if (!r.ok) throw new Error(r.msg || "No se pudieron guardar tus datos");
      setSucio(false);
      setAviso({ tono: "ok", texto: "Guardado. Puedes seguir completando cuando quieras." });
      if (onGuardado) onGuardado();
    } catch (e) {
      setAviso({ tono: "warn", texto: e.message || "Error al guardar" });
    } finally {
      setGuardando(false);
    }
  }

  const inhabilitado = bloqueado || guardando;

  return (
    <div className="space-y-3">

      {/* Pestañas */}
      <div className="pnl-segmentos pnl-segmentos-llenos">
        {[[1, "1 · Tus datos"], [2, "2 · Credenciales BLS"]].map(([n, txt]) => (
          <button
            key={n}
            type="button"
            onClick={() => setPestana(n)}
            aria-pressed={pestana === n}
          >
            {txt}
          </button>
        ))}
      </div>

      {bloqueado && (
        <Aviso tono="warn" icono={<Icono nombre="candado" size={16} />}>
          Tu formulario oficial ya está <b>firmado</b>, así que estos datos quedaron congelados.
          Si necesitas corregir algo, escríbele a tu asesor.
        </Aviso>
      )}

      {/* Aviso permanente mientras falte algo. Estos datos van al impreso
          oficial: uno vacio significa formulario rechazado en el consulado. */}
      {/* La consecuencia (el consulado no lo acepta) queda en el resumen, a
          la vista: plegar no puede esconder por qué importa. */}
      {!bloqueado && faltantes.length > 0 && (
        <AyudaPlegable clave="visa-datos-faltan" tono="aviso"
          resumen={<>Te faltan <b>{faltantes.length} de {CAMPOS.length} datos</b>: si falta alguno, el consulado no acepta tu formulario.</>}>
          <p>
            Te faltan <b>{faltantes.length} de {CAMPOS.length} datos</b> por completar.
            Todos son obligatorios: con ellos emitimos tu formulario oficial, y si falta
            alguno el consulado no lo acepta.
          </p>
        </AyudaPlegable>
      )}

      {!bloqueado && faltantes.length === 0 && (
        <Aviso tono="ok">
          Tienes <b>todos tus datos completos</b>. Si algo cambia, edítalo y vuelve a guardar.
        </Aviso>
      )}

      {pestana === 1 ? (
        <>
          {!bloqueado && (
            <AyudaPlegable clave="visa-datos-poco-a-poco" tono="info"
              resumen={<>Puedes completar poco a poco y <b>guardar</b>.</>}>
              <p>
                Puedes completar poco a poco y <b>guardar</b>. Para emitir tu formulario oficial
                necesitamos la <b>versión final</b> de estos datos — revísalos bien antes de tu cita.
              </p>
            </AyudaPlegable>
          )}

          <Grupo titulo="Datos personales">
            <Campo
              falta={faltantes.includes("apellidos")} label="Apellidos" ancho="full"
              placeholder="Tus dos apellidos, juntos"
              pista="Van juntos en una sola línea, como aparecen en tu pasaporte"
              valor={form.apellidos} onChange={(v) => set("apellidos", v)} disabled={inhabilitado}
            />
            <Campo
              falta={faltantes.includes("nombres")} label="Nombres" ancho="full"
              placeholder="Tus nombres, como en el pasaporte"
              valor={form.nombres} onChange={(v) => set("nombres", v)} disabled={inhabilitado}
            />
            <Campo falta={faltantes.includes("dni")} label="N.º de DNI" valor={form.dni} onChange={(v) => set("dni", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("num_pasaporte")} label="N.º de pasaporte" valor={form.num_pasaporte} onChange={(v) => set("num_pasaporte", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("exp_pasaporte")} label="Expedición pasaporte" tipo="date" valor={form.exp_pasaporte} onChange={(v) => set("exp_pasaporte", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("venc_pasaporte")} label="Vence pasaporte" tipo="date" valor={form.venc_pasaporte} onChange={(v) => set("venc_pasaporte", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("pais_nacimiento")} label="País de origen" valor={form.pais_nacimiento} onChange={(v) => set("pais_nacimiento", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("lugar_nacimiento")} label="Lugar de nacimiento" valor={form.lugar_nacimiento} onChange={(v) => set("lugar_nacimiento", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("fecha_nacimiento")} label="Fecha de nacimiento" tipo="date" valor={form.fecha_nacimiento} onChange={(v) => set("fecha_nacimiento", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("estado_civil")} label="Estado civil" opciones={ESTADOS_CIVILES} valor={form.estado_civil} onChange={(v) => set("estado_civil", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("profesion")} label="Profesión actual" ancho="full" valor={form.profesion} onChange={(v) => set("profesion", v)} disabled={inhabilitado} />
          </Grupo>

          <Grupo titulo="Contacto">
            <Campo falta={faltantes.includes("domicilio")} label="Domicilio" ancho="full" valor={form.domicilio} onChange={(v) => set("domicilio", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("correo")} label="Correo" tipo="email" valor={form.correo} onChange={(v) => set("correo", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("telefono")} label="Celular" tipo="tel" valor={form.telefono} onChange={(v) => set("telefono", v)} disabled={inhabilitado} />
          </Grupo>

          <Grupo titulo="Tu viaje a España">
            <Campo falta={faltantes.includes("viaje_fecha_prevista")} label="Fecha prevista a España" tipo="date" valor={form.viaje_fecha_prevista} onChange={(v) => set("viaje_fecha_prevista", v)} disabled={inhabilitado} />
            <Campo
              label="Domicilio en España" ancho="full"
              pista="Puede ser la dirección de la universidad"
              valor={form.domicilio_espana} onChange={(v) => set("domicilio_espana", v)} disabled={inhabilitado}
            />
          </Grupo>

          <Grupo titulo="Universidad y estudios">
            <Campo falta={faltantes.includes("centro_direccion")} label="Dirección de la universidad" ancho="full" valor={form.centro_direccion} onChange={(v) => set("centro_direccion", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("centro_telefono")} label="Teléfono de la universidad" tipo="tel" valor={form.centro_telefono} onChange={(v) => set("centro_telefono", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("centro_correo")} label="Correo de la universidad" tipo="email" valor={form.centro_correo} onChange={(v) => set("centro_correo", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("tipo_estudios")} label="Tipo de estudios" opciones={TIPOS_ESTUDIO} valor={form.tipo_estudios} onChange={(v) => set("tipo_estudios", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("semestres_total")} label="Semestres en total" tipo="number" valor={form.semestres_total} onChange={(v) => set("semestres_total", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("centro_inicio")} label="Inicio de estudios" tipo="date" valor={form.centro_inicio} onChange={(v) => set("centro_inicio", v)} disabled={inhabilitado} />
            <Campo falta={faltantes.includes("centro_fin")} label="Fin de estudios" tipo="date" valor={form.centro_fin} onChange={(v) => set("centro_fin", v)} disabled={inhabilitado} />
          </Grupo>
        </>
      ) : (
        <>
          <Aviso tono="info" icono={<Icono nombre="candado" size={16} />}>
            BLS International es la plataforma donde se agenda tu cita en el consulado.
          </Aviso>

          <p className="pnl-visado-pregunta">¿Ya tienes una cuenta en BLS?</p>

          <div className="space-y-2">
            <OpcionTarjeta
              activa={bls.tiene === true} icono={<IconoPaso nombre="checkCircle" />}
              titulo="Sí, ya tengo cuenta" descripcion="Te pediremos tus credenciales"
              onClick={() => setCredencial("tiene", true)} disabled={inhabilitado}
            />
            <OpcionTarjeta
              activa={bls.tiene === false} icono={<Icono nombre="destello" size={18} />}
              titulo="No, aún no tengo" descripcion="Nosotros la crearemos por ti"
              onClick={() => setCredencial("tiene", false)} disabled={inhabilitado}
            />
          </div>

          {bls.tiene === true && (
            <>
              <Grupo titulo="Tus credenciales BLS">
                <Campo
                  label="Usuario / correo" placeholder="correo@…"
                  valor={bls.usuario} onChange={(v) => setCredencial("usuario", v)} disabled={inhabilitado}
                />
                <Campo
                  label="Contraseña" tipo={verPass ? "text" : "password"} placeholder="••••••"
                  valor={bls.password} onChange={(v) => setCredencial("password", v)} disabled={inhabilitado}
                />
                <button
                  type="button"
                  onClick={() => setVerPass((v) => !v)}
                  className="pnl-btn-texto sm:col-span-2 justify-self-start"
                  data-talla="s"
                >
                  {verPass ? "Ocultar contraseña" : "Ver contraseña"}
                </button>
              </Grupo>
              <Aviso tono="warn" icono={<Icono nombre="candado" size={16} />}>
                Se guardan <b>cifradas</b> y sólo las usa tu asesor para agendar tu cita.
              </Aviso>
            </>
          )}

          {bls.tiene === false && (
            <Aviso tono="ok" icono={<Icono nombre="destello" size={16} />}>
              Perfecto. <b>Nosotros crearemos tu cuenta BLS</b> y te compartiremos el acceso.
            </Aviso>
          )}
        </>
      )}

      {/* Barra de guardado */}
      {!bloqueado && (
        <div className="pnl-barra-guardar sticky bottom-[var(--selector-alto)] z-[14] flex-wrap">
          {aviso && (
            <div className="w-full">
              <Aviso tono={aviso.tono}>{aviso.texto}</Aviso>
            </div>
          )}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="pnl-btn-primario"
            >
              {guardando && <span className="pnl-spinner" data-talla="s" />}
              {guardando ? "Guardando…" : "Guardar"}
            </button>
            <p className="pnl-barra-guardar-texto" data-sucio={sucio ? "1" : undefined}>
              {sucio ? "Tienes cambios sin guardar" : `${completados} de ${CAMPOS.length} datos completados`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
