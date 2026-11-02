// src/pages/panel/components/PerfilCliente.jsx
import { useEffect, useRef, useState } from "react";
import { apiPATCH } from "../../../services/api";
import {
  PAISES, AREAS, UNIS,
  parseTelefono, parseInicioPrevisto,
  Combobox, FL, TI, ErrMsg,
  TelefonoInput, SliderPresupuesto, MesAnioSelect,
} from "./perfil.shared";
import Avatar from "../../../components/common/Avatar";
import IconoPaso from "../../../components/common/IconoPaso";
import { datosUsuario } from "../../../components/common/usuario";

function fmtFecha(iso) {
  if (!iso) return null;
  return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtPresupuesto(val) {
  if (!val) return null;
  const n = Number(val);
  return isNaN(n) ? String(val) : `${n.toLocaleString("es-ES")} €/año`;
}

// ── Dato del perfil: se lee y se edita en su sitio ─────────────────────────────
// Para corregir una sola fecha había que abrir el formulario entero y buscar el
// campo entre veinte. Ahora se toca el dato y se edita ahí mismo. El guardado es
// el del modo «Editar» (mismo PATCH /cliente/me, mismas reglas de validar), así
// que no hay dos formas de escribir el perfil que puedan divergir.
function Dato({ label, value, span2, largo, falta, editando, guardando, guardado, error, onEditar, onGuardar, onCancelar, children }) {
  const formRef = useRef(null);
  const vacio = !value;

  // Al abrirse, el foco va al primer campo para poder escribir sin otro toque.
  // Los Combobox (sin name) no se enfocan solos: al enfocarse vacían lo que
  // muestran y parecería que el dato se ha borrado.
  useEffect(() => {
    if (!editando) return;
    formRef.current?.querySelector("input[name], input[type=tel], select, input[type=range]")?.focus();
  }, [editando]);

  if (editando) {
    return (
      <form
        ref={formRef}
        className="pnl-perfil-dato col-span-full"
        data-editando="1"
        onSubmit={(e) => { e.preventDefault(); if (!guardando) onGuardar(); }}
        onKeyDown={(e) => { if (e.key === "Escape" && !guardando) { e.stopPropagation(); onCancelar(); } }}
      >
        <p className="pnl-perfil-dato-label">{label}</p>
        <div className="pnl-perfil-editor">{children}</div>
        {error && <p className="pnl-perfil-editor-error" role="alert">{error}</p>}
        <div className="pnl-perfil-editor-botones">
          <button type="button" className="pnl-btn ux-tap" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className="pnl-btn-primario ux-tap" disabled={guardando}>
            {guardando && <span className="pnl-spinner" data-talla="s" aria-hidden="true" />}
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      type="button"
      className={`pnl-perfil-dato ux-tap ${span2 ? "col-span-2" : ""}`}
      data-vacio={vacio ? "1" : "0"}
      data-largo={largo ? "1" : undefined}
      data-falta={falta && vacio ? "1" : "0"}
      data-guardado={guardado ? "1" : "0"}
      onClick={onEditar}
      aria-label={vacio ? `Añadir ${label}` : `Editar ${label}`}
    >
      <span className="pnl-perfil-dato-label">
        {label}
        {falta && vacio && <span className="pnl-chip pnl-perfil-dato-req" data-talla="sm" data-tono="aviso">Obligatorio</span>}
      </span>
      <span className="pnl-perfil-dato-valor" title={typeof value === "string" ? value : undefined}>
        {vacio ? <span className="pnl-perfil-anadir">+ Añadir</span> : value}
      </span>
      <span className="pnl-perfil-dato-lapiz" aria-hidden="true">
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
      </span>
      {guardado && (
        <span className="pnl-perfil-dato-ok" role="status">
          <IconoPaso nombre="check" className="w-3 h-3" strokeWidth={3} />
          Guardado
        </span>
      )}
    </button>
  );
}

function SecLabel({ children }) {
  return <p className="pnl-eyebrow pnl-perfil-sec"><span className="punto" aria-hidden="true" />{children}</p>;
}

// ── Validación ─────────────────────────────────────────────────────────────────
// Lo que se exige a todos: quién es y con qué documento viaja.
const REQUIRED = [
  ["nombre",               "El nombre es obligatorio"],
  ["pais_origen",          "Selecciona tu país de origen"],
  ["fecha_nacimiento",     "La fecha de nacimiento es obligatoria"],
  ["pasaporte",            "El número de pasaporte es obligatorio"],
  ["pasaporte_vencimiento","La fecha de vencimiento del pasaporte es obligatoria"],
];

// Lo académico solo se exige a quien tiene un servicio que busca programa
// (máster o FP, ver servicios.js#pideAcademico). A un asesorado de visado o de
// modificatoria se le dejaba sin poder guardar su perfil por no poner su
// universidad de origen. Si lo rellena igualmente, se valida el formato.
const REQUIRED_ACADEMICO = [
  ["carrera_titulo",       "El título universitario es obligatorio"],
  ["universidad_origen",   "La universidad de origen es obligatoria"],
  ["inicio_estudios",      "El año de inicio de estudios es obligatorio"],
  ["fin_estudios",         "El año de fin de estudios es obligatorio"],
];

function validar(form, conAcademico) {
  const errs = {};
  for (const [key, msg] of [...REQUIRED, ...(conAcademico ? REQUIRED_ACADEMICO : [])]) {
    if (!form[key] || !String(form[key]).trim()) errs[key] = msg;
  }
  const anioRe = /^\d{4}$/;
  if (form.inicio_estudios && !anioRe.test(String(form.inicio_estudios).trim()))
    errs.inicio_estudios = "Ingresa un año válido (ej. 2018)";
  if (form.fin_estudios && !anioRe.test(String(form.fin_estudios).trim()))
    errs.fin_estudios = "Ingresa un año válido (ej. 2023)";
  if (conAcademico) {
    if (!form.mes_inicio || !form.anio_inicio) errs.inicio_previsto = "Selecciona mes y año de inicio previsto";
    if (!form.presupuesto_hasta) errs.presupuesto_hasta = "Define tu presupuesto máximo";
  }
  return errs;
}

// El formulario tal como sale de lo guardado. Se usa al cargar y al abrir un
// dato suelto, para que un cambio a medias y cancelado en otro dato no se
// cuele en el siguiente guardado.
function formDesdeUser(user) {
  const tp = parseTelefono(user.telefono);
  const de = user.datos_extra || {};
  const wp = parseTelefono(de.whatsapp);
  const mismoWA = !de.whatsapp || de.whatsapp === user.telefono;
  const ip = parseInicioPrevisto(de.inicio_previsto);
  return {
    nombre:                user.nombre        || "",
    pais_origen:           user.pais_origen   || "",
    prefijo_telefono:      tp.prefijo,
    telefono_numero:       tp.numero,
    mismo_whatsapp:        mismoWA,
    prefijo_whatsapp:      wp.prefijo,
    whatsapp_numero:       wp.numero,
    dni:                   user.dni           || "",
    dni_emision:           de.dni_emision     || "",
    dni_vencimiento:       de.dni_vencimiento || "",
    pasaporte:             user.pasaporte     || "",
    ciudad:                de.ciudad          || "",
    fecha_nacimiento:      de.fecha_nacimiento      || "",
    nacionalidad:          de.nacionalidad          || "",
    pasaporte_emision:     de.pasaporte_emision     || "",
    pasaporte_vencimiento: de.pasaporte_vencimiento || "",
    carrera_titulo:        de.carrera_titulo        || "",
    area_carrera:          de.area_carrera          || "",
    universidad_origen:    de.universidad_origen    || "",
    inicio_estudios:       de.inicio_estudios       || "",
    fin_estudios:          de.fin_estudios          || "",
    fecha_titulo:          de.fecha_titulo          || "",
    mes_inicio:            ip.mes,
    anio_inicio:           ip.anio,
    presupuesto_hasta:     de.presupuesto_hasta ? Number(de.presupuesto_hasta) : 3000,
  };
}

// El cuerpo del PATCH, idéntico para el modo «Editar» y para un dato suelto.
// Va siempre con datos_extra completo: el servidor ya lo funde, pero si algún
// día vuelve a reemplazarlo entero, guardar un dato no borraría los demás.
function construirBody(form) {
  const telefono = form.telefono_numero
    ? `${form.prefijo_telefono} ${form.telefono_numero}`.trim() : null;
  const whatsapp = form.mismo_whatsapp
    ? telefono
    : (form.whatsapp_numero ? `${form.prefijo_whatsapp} ${form.whatsapp_numero}`.trim() : null);
  const inicio_previsto = (form.mes_inicio && form.anio_inicio)
    ? `${form.mes_inicio} ${form.anio_inicio}` : null;

  return {
    nombre:      form.nombre      || null,
    telefono,
    dni:         form.dni         || null,
    pasaporte:   form.pasaporte   || null,
    pais_origen: form.pais_origen || null,
    datos_extra: {
      whatsapp,
      ciudad:                form.ciudad                || null,
      fecha_nacimiento:      form.fecha_nacimiento      || null,
      nacionalidad:          form.nacionalidad          || null,
      dni_emision:           form.dni_emision           || null,
      dni_vencimiento:       form.dni_vencimiento       || null,
      pasaporte_emision:     form.pasaporte_emision     || null,
      pasaporte_vencimiento: form.pasaporte_vencimiento || null,
      carrera_titulo:        form.carrera_titulo        || null,
      area_carrera:          form.area_carrera          || null,
      universidad_origen:    form.universidad_origen    || null,
      inicio_estudios:       form.inicio_estudios       || null,
      fin_estudios:          form.fin_estudios          || null,
      fecha_titulo:          form.fecha_titulo          || null,
      inicio_previsto,
      presupuesto_hasta:     form.presupuesto_hasta     || null,
    },
  };
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function PerfilCliente({ user, onUserUpdated, conAcademico = true }) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [okMsg, setOkMsg]       = useState("");
  const [form, setForm]         = useState({});
  const [errs, setErrs]         = useState({});
  // Edición de un dato suelto: cuál está abierto, si se guarda y cuál acaba de guardarse.
  const [editando, setEditando]     = useState(null);
  const [guardandoDato, setGuardandoDato] = useState(false);
  const [errorDato, setErrorDato]   = useState("");
  const [guardado, setGuardado]     = useState(null);
  const timerGuardado = useRef(null);

  useEffect(() => {
    if (!user) return;
    setForm(formDesdeUser(user));
    setErrs({});
  }, [user]);

  useEffect(() => () => clearTimeout(timerGuardado.current), []);

  if (!user) {
    return (
      <div className="pnl-perfil pnl-perfil-esq" role="status" aria-busy="true" aria-label="Cargando…">
        <div className="pnl-esq pnl-esq-bloque" style={{ height: 96 }} />
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="pnl-esq pnl-esq-bloque" data-talla="fila" />)}
      </div>
    );
  }

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); setErrs(p => ({ ...p, [key]: "" })); }
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrs(p => ({ ...p, [name]: "" }));
  }

  function handlePaisChange(nombre) {
    const pais = PAISES.find(p => p.nombre === nombre);
    setForm(p => ({
      ...p,
      pais_origen:      nombre,
      prefijo_telefono: pais?.prefijo || p.prefijo_telefono,
      prefijo_whatsapp: p.mismo_whatsapp ? (pais?.prefijo || p.prefijo_whatsapp) : p.prefijo_whatsapp,
    }));
    setErrs(p => ({ ...p, pais_origen: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errores = validar(form, conAcademico);
    if (Object.keys(errores).length > 0) { setErrs(errores); return; }

    setSaving(true); setError(""); setOkMsg("");
    try {
      const body = construirBody(form);
      const r = await apiPATCH("/cliente/me", body);
      if (!r.ok) { setError(r.message || "Error al guardar."); return; }
      if (onUserUpdated) onUserUpdated(r.cliente || { ...user, ...body });
      setOkMsg("Datos guardados correctamente.");
      setEditMode(false);
    } catch {
      setError("Ocurrió un error al guardar los datos.");
    } finally {
      setSaving(false);
    }
  }

  // ── Un dato suelto ──────────────────────────────────────────────────────────
  function abrirDato(id) {
    if (guardandoDato) return;
    setForm(formDesdeUser(user));
    setErrs({});
    setErrorDato("");
    setOkMsg("");
    setEditando(id);
  }

  function cancelarDato() {
    setEditando(null);
    setErrorDato("");
    setErrs({});
    setForm(formDesdeUser(user));
  }

  // Se validan solo las reglas del dato que se toca: a quien le falta el
  // pasaporte no se le debe impedir corregir su ciudad. Si deja vacío un dato
  // obligatorio, o pone un año mal escrito, se le avisa igual que en «Editar».
  async function guardarDato(campo) {
    const errores = validar(form, conAcademico);
    const propios = {};
    for (const k of campo.reglas || []) if (errores[k]) propios[k] = errores[k];
    if (Object.keys(propios).length) { setErrs(propios); return; }

    const body = construirBody(form);
    // El formulario pone 3000 € por defecto para que la barra no salga en cero.
    // Guardando otro dato, eso no debe convertirse en un presupuesto que el
    // asesorado nunca eligió.
    if (campo.id !== "presupuesto_hasta" && !(user.datos_extra || {}).presupuesto_hasta) {
      body.datos_extra.presupuesto_hasta = null;
    }
    // «Inicio previsto» puede venir del formulario académico como `sep_2027`,
    // que el editor no sabe leer y mandaría vacío: guardando otro dato se
    // conserva tal como estaba.
    if (campo.id !== "inicio_previsto") {
      body.datos_extra.inicio_previsto = (user.datos_extra || {}).inicio_previsto ?? null;
    }

    setGuardandoDato(true); setErrorDato("");
    try {
      const r = await apiPATCH("/cliente/me", body);
      if (!r.ok) { setErrorDato(r.message || "No se pudo guardar. Inténtalo de nuevo."); return; }
      if (onUserUpdated) {
        onUserUpdated(r.cliente || { ...user, ...body, datos_extra: { ...(user.datos_extra || {}), ...body.datos_extra } });
      }
      setEditando(null);
      setGuardado(campo.id);
      clearTimeout(timerGuardado.current);
      timerGuardado.current = setTimeout(() => setGuardado(null), 2600);
    } catch {
      setErrorDato("Ocurrió un error al guardar el dato.");
    } finally {
      setGuardandoDato(false);
    }
  }

  // ── Vista ───────────────────────────────────────────────────────────────────
  if (!editMode) {
    const de = user.datos_extra || {};
    const tp = parseTelefono(user.telefono);
    const paisObj = PAISES.find(p => p.nombre === user.pais_origen);
    const u = datosUsuario(user);

    // Los datos que se exigen: si faltan, el dato se marca como «Obligatorio».
    const obligatorios = new Set([
      ...REQUIRED.map(([k]) => k),
      ...(conAcademico ? [...REQUIRED_ACADEMICO.map(([k]) => k), "inicio_previsto", "presupuesto_hasta"] : []),
    ]);

    const selectCls = "pnl-campo-control";

    // Cada dato: cómo se lee, qué reglas de validar le tocan y con qué se edita.
    const campos = {
      fecha_nacimiento: {
        label: "Fecha de nacimiento", value: fmtFecha(de.fecha_nacimiento), reglas: ["fecha_nacimiento"],
        editor: () => <TI name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} type="date" err={errs.fecha_nacimiento} />,
      },
      pais_origen: {
        label: "País de origen", value: paisObj ? `${paisObj.emoji} ${user.pais_origen}` : user.pais_origen, reglas: ["pais_origen"],
        // Aquí solo cambia el país. En «Editar» también cambia el prefijo del
        // teléfono, pero en un dato suelto eso reescribiría un número ya
        // guardado sin que el asesorado lo vea.
        editor: () => (
          <Combobox
            value={form.pais_origen}
            onChange={p => set("pais_origen", typeof p === "string" ? p : p.nombre)}
            options={PAISES}
            placeholder="Busca tu país…"
            getLabel={p => {
              if (typeof p === "string") { const f = PAISES.find(x => x.nombre === p); return f ? `${f.emoji} ${f.nombre}` : p; }
              return `${p.emoji} ${p.nombre}`;
            }}
            renderOption={p => (
              <span className="flex items-center gap-2">
                <span>{p.emoji}</span><span>{p.nombre}</span>
                <span className="ml-auto text-muted text-meta">{p.prefijo}</span>
              </span>
            )}
          />
        ),
      },
      ciudad: {
        label: "Ciudad", value: de.ciudad,
        editor: () => <TI name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Lima" />,
      },
      nacionalidad: {
        label: "Nacionalidad", value: de.nacionalidad,
        editor: () => <TI name="nacionalidad" value={form.nacionalidad} onChange={handleChange} placeholder="Peruana" />,
      },
      telefono: {
        label: "Teléfono", value: user.telefono ? `${tp.prefijo} ${tp.numero}` : null,
        editor: () => (
          <TelefonoInput
            prefijo={form.prefijo_telefono} numero={form.telefono_numero}
            onPrefijo={v => set("prefijo_telefono", v)} onNumero={v => set("telefono_numero", v)}
          />
        ),
      },
      whatsapp: {
        label: "WhatsApp",
        value: de.whatsapp && de.whatsapp !== user.telefono
          ? (() => { const w = parseTelefono(de.whatsapp); return `${w.prefijo} ${w.numero}`; })()
          : (user.telefono ? "Mismo que teléfono" : null),
        editor: () => (
          <div className="space-y-1.5">
            <label className="pnl-casilla-fila">
              <input type="checkbox" checked={form.mismo_whatsapp}
                onChange={e => set("mismo_whatsapp", e.target.checked)} />
              <span>Mismo que teléfono</span>
            </label>
            {form.mismo_whatsapp
              ? <p className="pnl-perfil-nota">Se usará el mismo número</p>
              : <TelefonoInput
                  prefijo={form.prefijo_whatsapp} numero={form.whatsapp_numero}
                  onPrefijo={v => set("prefijo_whatsapp", v)} onNumero={v => set("whatsapp_numero", v)}
                />}
          </div>
        ),
      },
      dni: {
        label: "DNI / Cédula", value: user.dni,
        editor: () => <TI name="dni" value={form.dni} onChange={handleChange} placeholder="12345678" />,
      },
      dni_emision: {
        label: "DNI — Emisión", value: fmtFecha(de.dni_emision),
        editor: () => <TI name="dni_emision" value={form.dni_emision} onChange={handleChange} type="date" />,
      },
      dni_vencimiento: {
        label: "DNI — Vencimiento", value: fmtFecha(de.dni_vencimiento),
        editor: () => <TI name="dni_vencimiento" value={form.dni_vencimiento} onChange={handleChange} type="date" />,
      },
      pasaporte: {
        label: "Pasaporte", value: user.pasaporte, reglas: ["pasaporte"],
        editor: () => <TI name="pasaporte" value={form.pasaporte} onChange={handleChange} placeholder="AB123456" err={errs.pasaporte} />,
      },
      pasaporte_emision: {
        label: "Pasaporte — Emisión", value: fmtFecha(de.pasaporte_emision),
        editor: () => <TI name="pasaporte_emision" value={form.pasaporte_emision} onChange={handleChange} type="date" />,
      },
      pasaporte_vencimiento: {
        label: "Pasaporte — Vencimiento", value: fmtFecha(de.pasaporte_vencimiento), reglas: ["pasaporte_vencimiento"],
        editor: () => <TI name="pasaporte_vencimiento" value={form.pasaporte_vencimiento} onChange={handleChange} type="date" err={errs.pasaporte_vencimiento} />,
      },
      carrera_titulo: {
        label: "Carrera / Título", value: de.carrera_titulo, reglas: ["carrera_titulo"], largo: true,
        editor: () => <TI name="carrera_titulo" value={form.carrera_titulo} onChange={handleChange} placeholder="Ingeniería Industrial" err={errs.carrera_titulo} />,
      },
      area_carrera: {
        label: "Área de estudio", value: de.area_carrera, largo: true,
        editor: () => (
          <select name="area_carrera" value={form.area_carrera} onChange={e => set("area_carrera", e.target.value)} className={selectCls}>
            <option value="">— Selecciona —</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        ),
      },
      inicio_estudios: {
        label: "Inicio de estudios", value: de.inicio_estudios, reglas: ["inicio_estudios"],
        editor: () => <TI name="inicio_estudios" value={form.inicio_estudios} onChange={handleChange} placeholder="2018" err={errs.inicio_estudios} />,
      },
      fin_estudios: {
        label: "Fin de estudios", value: de.fin_estudios, reglas: ["fin_estudios"],
        editor: () => <TI name="fin_estudios" value={form.fin_estudios} onChange={handleChange} placeholder="2023" err={errs.fin_estudios} />,
      },
      fecha_titulo: {
        label: "Fecha del título", value: fmtFecha(de.fecha_titulo),
        editor: () => <TI name="fecha_titulo" value={form.fecha_titulo} onChange={handleChange} type="date" />,
      },
      inicio_previsto: {
        label: "Inicio previsto", value: de.inicio_previsto, reglas: ["inicio_previsto"],
        editor: () => (
          <MesAnioSelect
            mes={form.mes_inicio}    onMes={v => { set("mes_inicio", v);  setErrs(p => ({ ...p, inicio_previsto: "" })); }}
            anio={form.anio_inicio}  onAnio={v => { set("anio_inicio", v); setErrs(p => ({ ...p, inicio_previsto: "" })); }}
            err={errs.inicio_previsto}
          />
        ),
      },
      presupuesto_hasta: {
        label: "Presupuesto máx.", value: fmtPresupuesto(de.presupuesto_hasta), reglas: ["presupuesto_hasta"],
        editor: () => <SliderPresupuesto value={form.presupuesto_hasta} onChange={v => set("presupuesto_hasta", v)} />,
      },
      universidad_origen: {
        label: "Universidad", value: de.universidad_origen, reglas: ["universidad_origen"], span2: true, largo: true,
        editor: () => (
          <Combobox
            value={form.universidad_origen}
            onChange={v => { set("universidad_origen", v); }}
            options={UNIS}
            placeholder="Busca tu universidad o escribe el nombre…"
            allowCustom
          />
        ),
      },
    };

    const dato = (id) => {
      const c = { id, ...campos[id] };
      const abierto = editando === id;
      const errorValidacion = (c.reglas || []).map(k => errs[k]).find(Boolean);
      return (
        <Dato
          key={id}
          label={c.label}
          value={c.value}
          span2={c.span2}
          largo={c.largo}
          falta={obligatorios.has(id)}
          editando={abierto}
          guardando={abierto && guardandoDato}
          guardado={guardado === id}
          error={abierto ? (errorDato || errorValidacion) : ""}
          onEditar={() => abrirDato(id)}
          onGuardar={() => guardarDato(c)}
          onCancelar={cancelarDato}
        >
          {abierto ? c.editor() : null}
        </Dato>
      );
    };

    return (
      <div className="pnl-perfil">
        <div className="pnl-tarjeta pnl-perfil-tarjeta">
          <div className="pnl-perfil-cab">
            {/* Se pintaba aqui la inicial a mano, asi que esta ficha seguia
                con la letra en un cuadro mientras la barra lateral y la
                cabecera ya mostraban la foto de Google. */}
            <span className="pnl-perfil-cab-avatar">
              <Avatar foto={u.foto} iniciales={u.iniciales} nombre={u.nombre} size={56} />
            </span>
            <div className="pnl-perfil-cab-texto">
              {/* Los nombres completos peruanos llevan dos apellidos y pasan
                  de 35 caracteres: sin sitio para respirar, el nombre, el
                  correo y la fecha se apelotonaban en tres lineas pegadas. */}
              <p className="pnl-perfil-cab-nombre" title={u.nombre}>
                {u.nombre}
              </p>
              <p className="pnl-perfil-cab-correo" title={user.email_contacto}>
                {user.email_contacto}
              </p>
              <p className="pnl-perfil-cab-desde">
                Cliente desde {new Date(user.fecha_registro).toLocaleDateString("es-ES", { year: "numeric", month: "long" })}
              </p>
            </div>
            <button type="button" onClick={() => { setEditando(null); setErrorDato(""); setEditMode(true); setError(""); setOkMsg(""); setErrs({}); }}
              className="pnl-btn-noche pnl-perfil-cab-boton" data-talla="s">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Editar
            </button>
          </div>

          <div className="pnl-perfil-cuerpo">
            <p className="pnl-perfil-pista">Toca cualquier dato para cambiarlo.</p>

            <SecLabel>Datos personales</SecLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["fecha_nacimiento", "pais_origen", "ciudad", "nacionalidad", "telefono", "whatsapp"].map(dato)}
            </div>

            <SecLabel>Documentos de identidad</SecLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["dni", "dni_emision", "dni_vencimiento", "pasaporte", "pasaporte_emision", "pasaporte_vencimiento"].map(dato)}
            </div>

            <SecLabel>Datos académicos y plan</SecLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["carrera_titulo", "area_carrera", "inicio_estudios", "fin_estudios", "fecha_titulo", "inicio_previsto", "presupuesto_hasta", "universidad_origen"].map(dato)}
            </div>
          </div>
        </div>

        {okMsg && (
          <div className="pnl-aviso pnl-perfil-aviso" data-tono="ok">
            <span className="pnl-aviso-icono"><IconoPaso nombre="checkCircle" className="w-4 h-4" /></span>
            <p className="pnl-aviso-texto">{okMsg}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Edición ──────────────────────────────────────────────────────────────────
  const numErrs = Object.values(errs).filter(Boolean).length;

  return (
    <div className="pnl-tarjeta pnl-perfil pnl-perfil-tarjeta">

      <div className="pnl-perfil-cab" data-modo="editar">
        <div className="pnl-perfil-cab-texto">
          <p className="pnl-perfil-cab-nombre">Editar mi perfil</p>
          <p className="pnl-perfil-cab-desde">Los datos académicos se pre-rellenan en tus solicitudes</p>
        </div>
        <button type="button" onClick={() => { setEditMode(false); setError(""); setErrs({}); }}
          className="pnl-btn-texto pnl-perfil-cab-boton" data-talla="s">
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="pnl-perfil-form">

          {(error || numErrs > 0) && (
            <div className="pnl-aviso" data-tono="alto" role="alert">
              <span className="pnl-aviso-icono"><IconoPaso nombre="info" className="w-4 h-4" /></span>
              <p className="pnl-aviso-texto">
                {error || `Hay ${numErrs} campo${numErrs > 1 ? "s" : ""} obligatorio${numErrs > 1 ? "s" : ""} sin completar.`}
              </p>
            </div>
          )}

          {/* ── Columna izquierda ── */}
          <div className="pnl-perfil-form-col">

            <div>
              <SecLabel>Datos personales</SecLabel>
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                <div className="col-span-2">
                  <FL>Nombre completo</FL>
                  <TI name="nombre" value={form.nombre} onChange={handleChange} placeholder="María García" err={errs.nombre} />
                  <ErrMsg msg={errs.nombre} />
                </div>
                <div className="col-span-2">
                  <FL noEdit>Email</FL>
                  <TI value={user.email_contacto || ""} disabled />
                </div>
                <div>
                  <FL>Fecha de nacimiento</FL>
                  <TI name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} type="date" err={errs.fecha_nacimiento} />
                  <ErrMsg msg={errs.fecha_nacimiento} />
                </div>
                <div>
                  <FL>Nacionalidad</FL>
                  <TI name="nacionalidad" value={form.nacionalidad} onChange={handleChange} placeholder="Peruana" />
                </div>
                <div>
                  <FL>Ciudad</FL>
                  <TI name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Lima" />
                </div>
                <div>
                  <FL>País de origen</FL>
                  <Combobox
                    value={form.pais_origen}
                    onChange={p => handlePaisChange(typeof p === "string" ? p : p.nombre)}
                    options={PAISES}
                    placeholder="Busca tu país…"
                    getLabel={p => {
                      if (typeof p === "string") { const f = PAISES.find(x => x.nombre === p); return f ? `${f.emoji} ${f.nombre}` : p; }
                      return `${p.emoji} ${p.nombre}`;
                    }}
                    renderOption={p => (
                      <span className="flex items-center gap-2">
                        <span>{p.emoji}</span><span>{p.nombre}</span>
                        <span className="ml-auto text-muted text-meta">{p.prefijo}</span>
                      </span>
                    )}
                  />
                  <ErrMsg msg={errs.pais_origen} />
                </div>
              </div>
            </div>

            <div>
              <SecLabel>Contacto</SecLabel>
              <div className="space-y-4">
                <div>
                  <FL>Teléfono</FL>
                  <TelefonoInput
                    prefijo={form.prefijo_telefono} numero={form.telefono_numero}
                    onPrefijo={v => set("prefijo_telefono", v)} onNumero={v => set("telefono_numero", v)}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="pnl-campo-etiqueta">WhatsApp</span>
                    <label className="pnl-casilla-fila ml-auto">
                      <input type="checkbox" checked={form.mismo_whatsapp}
                        onChange={e => set("mismo_whatsapp", e.target.checked)} />
                      <span>Mismo que teléfono</span>
                    </label>
                  </div>
                  {form.mismo_whatsapp
                    ? <p className="pnl-perfil-nota">Se usará el mismo número</p>
                    : <TelefonoInput
                        prefijo={form.prefijo_whatsapp} numero={form.whatsapp_numero}
                        onPrefijo={v => set("prefijo_whatsapp", v)} onNumero={v => set("whatsapp_numero", v)}
                      />
                  }
                </div>
              </div>
            </div>

          </div>

          {/* ── Columna derecha ── */}
          <div className="pnl-perfil-form-col">

            <div>
              <SecLabel>Documentos de identidad</SecLabel>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-4">
                <div>
                  <FL>DNI / NIE / Cédula</FL>
                  <TI name="dni" value={form.dni} onChange={handleChange} placeholder="12345678" />
                </div>
                <div>
                  <FL>DNI — Emisión</FL>
                  <TI name="dni_emision" value={form.dni_emision} onChange={handleChange} type="date" />
                </div>
                <div>
                  <FL>DNI — Vencimiento</FL>
                  <TI name="dni_vencimiento" value={form.dni_vencimiento} onChange={handleChange} type="date" />
                </div>
                <div>
                  <FL>Nº Pasaporte</FL>
                  <TI name="pasaporte" value={form.pasaporte} onChange={handleChange} placeholder="AB123456" err={errs.pasaporte} />
                  <ErrMsg msg={errs.pasaporte} />
                </div>
                <div>
                  <FL>Pasaporte — Emisión</FL>
                  <TI name="pasaporte_emision" value={form.pasaporte_emision} onChange={handleChange} type="date" />
                </div>
                <div>
                  <FL>Pasaporte — Vencimiento</FL>
                  <TI name="pasaporte_vencimiento" value={form.pasaporte_vencimiento} onChange={handleChange} type="date" err={errs.pasaporte_vencimiento} />
                  <ErrMsg msg={errs.pasaporte_vencimiento} />
                </div>
              </div>
            </div>

            <div>
              <SecLabel>Datos académicos y plan</SecLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4">
                <div>
                  <FL>Carrera / Título</FL>
                  <TI name="carrera_titulo" value={form.carrera_titulo} onChange={handleChange} placeholder="Ingeniería Industrial" err={errs.carrera_titulo} />
                  <ErrMsg msg={errs.carrera_titulo} />
                </div>
                <div>
                  <FL>Área de estudio</FL>
                  <select value={form.area_carrera} onChange={e => set("area_carrera", e.target.value)}
                    className="pnl-campo-control">
                    <option value="">— Selecciona —</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-4">
                  <div>
                    <FL>Inicio de estudios</FL>
                    <TI name="inicio_estudios" value={form.inicio_estudios} onChange={handleChange} placeholder="2018" err={errs.inicio_estudios} />
                    <ErrMsg msg={errs.inicio_estudios} />
                  </div>
                  <div>
                    <FL>Fin de estudios</FL>
                    <TI name="fin_estudios" value={form.fin_estudios} onChange={handleChange} placeholder="2023" err={errs.fin_estudios} />
                    <ErrMsg msg={errs.fin_estudios} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <FL>Fecha del título</FL>
                    <TI name="fecha_titulo" value={form.fecha_titulo} onChange={handleChange} type="date" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <FL>Inicio previsto en España</FL>
                  <MesAnioSelect
                    mes={form.mes_inicio}    onMes={v => { set("mes_inicio", v);  setErrs(p => ({ ...p, inicio_previsto: "" })); }}
                    anio={form.anio_inicio}  onAnio={v => { set("anio_inicio", v); setErrs(p => ({ ...p, inicio_previsto: "" })); }}
                    err={errs.inicio_previsto}
                  />
                  <ErrMsg msg={errs.inicio_previsto} />
                </div>
                <div className="sm:col-span-2">
                  <FL>Universidad de origen</FL>
                  <Combobox
                    value={form.universidad_origen}
                    onChange={v => { set("universidad_origen", v); }}
                    options={UNIS}
                    placeholder="Busca tu universidad o escribe el nombre…"
                    allowCustom
                  />
                  <ErrMsg msg={errs.universidad_origen} />
                </div>
                <div className="sm:col-span-2">
                  <FL>Presupuesto máximo en matrícula (€/año)</FL>
                  <div className="pnl-perfil-presupuesto" data-estado={errs.presupuesto_hasta ? "error" : undefined}>
                    <SliderPresupuesto
                      value={form.presupuesto_hasta}
                      onChange={v => { set("presupuesto_hasta", v); }}
                    />
                  </div>
                  <ErrMsg msg={errs.presupuesto_hasta} />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="pnl-perfil-pie">
          <button type="button" onClick={() => { setEditMode(false); setError(""); setOkMsg(""); setErrs({}); }}
            className="pnl-btn-texto">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="pnl-btn-primario">
            {saving
              ? <><span className="pnl-spinner" data-talla="s" aria-hidden="true" />Guardando…</>
              : <><IconoPaso nombre="check" className="w-4 h-4" strokeWidth={2.5} />Guardar cambios</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
