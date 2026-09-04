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

function estadoInicial(exp, cli, extra) {
  const e = exp || {};
  const c = cli || {};
  const x = extra || {};
  // Prioridad: lo ya guardado en el expediente; si está vacío, lo que se conozca
  // del perfil del cliente. Así no se le pide dos veces lo mismo.
  const base = {
    // Van separados porque el impreso oficial los pide en dos líneas: los dos
    // apellidos juntos en la primera, los nombres en la segunda.
    apellidos:        e.apellidos        || "",
    nombres:          e.nombres          || "",
    dni:              e.dni              || c.dni            || "",
    num_pasaporte:    e.num_pasaporte    || c.pasaporte      || "",
    exp_pasaporte:    e.exp_pasaporte    || x.pasaporte_emision     || "",
    venc_pasaporte:   e.venc_pasaporte   || x.pasaporte_vencimiento || "",
    pais_nacimiento:  e.pais_nacimiento  || c.pais_origen    || "",
    lugar_nacimiento: e.lugar_nacimiento || "",
    fecha_nacimiento: e.fecha_nacimiento || x.fecha_nacimiento || "",
    estado_civil:     e.estado_civil     || "",
    profesion:        e.profesion        || "",
    domicilio:        e.domicilio        || "",
    correo:           e.correo           || c.email_contacto || "",
    telefono:         e.telefono         || c.telefono       || "",
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
function Aviso({ tono = "info", icono, children }) {
  const tonos = {
    info:  "bg-sky-50 border-sky-200 text-sky-900",
    ok:    "bg-emerald-50 border-emerald-200 text-emerald-900",
    warn:  "bg-amber-50 border-amber-200 text-amber-900",
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${tonos[tono]}`}>
      <span className="shrink-0 text-base leading-none mt-0.5">{icono}</span>
      <div>{children}</div>
    </div>
  );
}

function Grupo({ titulo, children }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-4">
      <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] mb-3">{titulo}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">{children}</div>
    </div>
  );
}

function Campo({ label, valor, onChange, tipo = "text", ancho, pista, opciones, disabled, placeholder, falta }) {
  const clase = ancho === "full" ? "sm:col-span-2" : "";
  const estilo =
    "w-full bg-transparent border-none outline-none p-0 text-[13.5px] font-semibold text-neutral-800 " +
    "placeholder:font-normal placeholder:text-neutral-300 disabled:text-neutral-400";
  return (
    <div className={`${clase} rounded-xl px-3 py-2.5 border transition-colors focus-within:border-primary-light focus-within:bg-white ${
      falta ? "bg-amber-50/60 border-amber-300" : "bg-neutral-50 border-neutral-200"
    }`}>
      <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
        {label}{falta && <span className="text-amber-600 ml-1">· falta</span>}
      </label>
      {opciones ? (
        <select className={estilo} value={valor} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
          <option value="">Elige…</option>
          {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={tipo}
          className={estilo}
          value={valor}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
      {pista && <p className="text-[10.5px] text-neutral-400 mt-1 font-normal leading-snug">{pista}</p>}
    </div>
  );
}

function OpcionTarjeta({ activa, icono, titulo, descripcion, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all relative disabled:opacity-60 ${
        activa ? "border-[#1D6A4A] bg-emerald-50/60" : "border-neutral-200 bg-white hover:border-neutral-300"
      }`}
    >
      {activa && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1D6A4A] text-white">
          ✓ Tu opción
        </span>
      )}
      <div className="flex items-center gap-3">
        <span className="shrink-0 w-10 h-10 rounded-xl bg-neutral-100 grid place-items-center text-xl">{icono}</span>
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-primary">{titulo}</p>
          <p className="text-[12px] text-neutral-500 mt-0.5">{descripcion}</p>
        </div>
      </div>
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
      <div className="flex gap-1 bg-neutral-100 border border-neutral-200 rounded-xl p-1">
        {[[1, "1 · Tus datos"], [2, "2 · Credenciales BLS"]].map(([n, txt]) => (
          <button
            key={n}
            type="button"
            onClick={() => setPestana(n)}
            className={`flex-1 py-2 rounded-lg text-[12.5px] font-semibold transition-all ${
              pestana === n ? "bg-primary text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {txt}
          </button>
        ))}
      </div>

      {bloqueado && (
        <Aviso tono="warn" icono="🔒">
          Tu formulario oficial ya está <b>firmado</b>, así que estos datos quedaron congelados.
          Si necesitas corregir algo, escríbele a tu asesor.
        </Aviso>
      )}

      {/* Aviso permanente mientras falte algo. Estos datos van al impreso
          oficial: uno vacio significa formulario rechazado en el consulado. */}
      {!bloqueado && faltantes.length > 0 && (
        <Aviso tono="warn" icono="⚠️">
          Te faltan <b>{faltantes.length} de {CAMPOS.length} datos</b> por completar.
          Todos son obligatorios: con ellos emitimos tu formulario oficial, y si falta
          alguno el consulado no lo acepta.
        </Aviso>
      )}

      {!bloqueado && faltantes.length === 0 && (
        <Aviso tono="ok" icono="✅">
          Tienes <b>todos tus datos completos</b>. Si algo cambia, edítalo y vuelve a guardar.
        </Aviso>
      )}

      {pestana === 1 ? (
        <>
          {!bloqueado && (
            <Aviso tono="info" icono="💾">
              Puedes completar poco a poco y <b>guardar</b>. Para emitir tu formulario oficial
              necesitamos la <b>versión final</b> de estos datos — revísalos bien antes de tu cita.
            </Aviso>
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
          <Aviso tono="info" icono="🔑">
            BLS International es la plataforma donde se agenda tu cita en el consulado.
          </Aviso>

          <p className="text-[14px] font-semibold text-neutral-700 px-1">¿Ya tienes una cuenta en BLS?</p>

          <div className="space-y-2">
            <OpcionTarjeta
              activa={bls.tiene === true} icono="✅"
              titulo="Sí, ya tengo cuenta" descripcion="Te pediremos tus credenciales"
              onClick={() => setCredencial("tiene", true)} disabled={inhabilitado}
            />
            <OpcionTarjeta
              activa={bls.tiene === false} icono="🆕"
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
                  className="sm:col-span-2 text-left text-[11.5px] font-semibold text-primary-light hover:underline px-1"
                >
                  {verPass ? "Ocultar contraseña" : "Ver contraseña"}
                </button>
              </Grupo>
              <Aviso tono="warn" icono="🔒">
                Se guardan <b>cifradas</b> y sólo las usa tu asesor para agendar tu cita.
              </Aviso>
            </>
          )}

          {bls.tiene === false && (
            <Aviso tono="ok" icono="✨">
              Perfecto. <b>Nosotros crearemos tu cuenta BLS</b> y te compartiremos el acceso.
            </Aviso>
          )}
        </>
      )}

      {/* Barra de guardado */}
      {!bloqueado && (
        <div className="sticky bottom-0 -mx-1 px-1 pt-2 pb-1 bg-gradient-to-t from-white via-white to-transparent">
          {aviso && (
            <div className="mb-2">
              <Aviso tono={aviso.tono} icono={aviso.tono === "ok" ? "✔" : "⚠️"}>{aviso.texto}</Aviso>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D6A4A] text-white text-sm font-semibold shadow-sm hover:bg-[#175a3e] active:scale-95 transition-all disabled:opacity-60 disabled:active:scale-100"
            >
              {guardando && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {guardando ? "Guardando…" : "Guardar"}
            </button>
            <p className="text-[11.5px] text-neutral-400">
              {sucio ? "Tienes cambios sin guardar" : `${completados} de ${CAMPOS.length} datos completados`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
