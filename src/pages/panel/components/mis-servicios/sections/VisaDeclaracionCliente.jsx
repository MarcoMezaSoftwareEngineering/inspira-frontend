// src/pages/panel/components/mis-servicios/sections/VisaDeclaracionCliente.jsx
//
// Bloque DJ, lado del cliente. Sólo recoge su situación laboral e ingresos (y
// los de su patrocinador si lo hay). El generador completo de la declaración
// jurada vive en el backoffice: al cliente no le sirve de nada ver el borrador
// del documento consular, sólo necesita aportar los datos que faltan.
import { useEffect, useMemo, useRef, useState } from "react";
import { apiPUT } from "../../../../../services/api";
import {
  djVacia, perfilesSegunVia, sembrarDesdeExpediente, filaVacia, FILAS,
} from "../../../../../lib/visaDeclaracion";

function Aviso({ tono = "info", icono, children }) {
  const tonos = {
    info: "bg-sky-50 border-sky-200 text-sky-900",
    ok:   "bg-emerald-50 border-emerald-200 text-emerald-900",
    warn: "bg-amber-50 border-amber-200 text-amber-900",
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${tonos[tono]}`}>
      <span className="shrink-0 text-base leading-none mt-0.5">{icono}</span>
      <div>{children}</div>
    </div>
  );
}

function Campo({ label, valor, onChange, ancho, disabled, placeholder }) {
  return (
    <div className={`${ancho === "full" ? "sm:col-span-2" : ""} bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 focus-within:border-primary-light focus-within:bg-white transition-colors`}>
      <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{label}</label>
      <input
        value={valor || ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-none outline-none p-0 text-[13.5px] font-semibold text-neutral-800 placeholder:font-normal placeholder:text-neutral-300 disabled:text-neutral-400"
      />
    </div>
  );
}

function Interruptor({ activo, onClick, disabled }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:opacity-60 ${activo ? "bg-[#1D6A4A]" : "bg-neutral-300"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${activo ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

/* Tabla repetible (empleos anteriores). En móvil cada fila es una tarjeta. */
function Repetible({ nombre, filas, onCambiar, onAnadir, onQuitar, disabled, etiquetaAnadir }) {
  const cols = FILAS[nombre];
  return (
    <div className="space-y-2">
      {(filas || []).map((fila, i) => (
        <div key={i} className="relative bg-neutral-50 border border-neutral-200 rounded-xl p-3">
          {!disabled && (
            <button
              type="button" onClick={() => onQuitar(i)}
              className="absolute top-2 right-2 w-6 h-6 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 grid place-items-center text-xs"
              aria-label="Quitar"
            >✕</button>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
            {cols.map(([clave, etiqueta, ejemplo, full]) => (
              <Campo
                key={clave} label={etiqueta} ancho={full ? "full" : undefined}
                placeholder={ejemplo} valor={fila[clave]} disabled={disabled}
                onChange={(v) => onCambiar(i, clave, v)}
              />
            ))}
          </div>
        </div>
      ))}
      {!disabled && (
        <button
          type="button" onClick={onAnadir}
          className="w-full py-2.5 rounded-xl border border-dashed border-neutral-300 text-[12.5px] font-semibold text-neutral-500 hover:border-[#1D6A4A] hover:text-[#1D6A4A] transition-colors"
        >
          + {etiquetaAnadir}
        </button>
      )}
    </div>
  );
}

export default function VisaDeclaracionCliente({ idSolicitud, expediente, onGuardado }) {
  const exp = expediente || {};
  const bloqueado = exp.formulario_estado === "FIRMADO";
  const via = exp.tipo_solvencia && exp.tipo_solvencia !== "PENDIENTE" ? exp.tipo_solvencia : null;

  const inicial = useMemo(() => {
    const base = exp.dj_datos && Object.keys(exp.dj_datos).length ? exp.dj_datos : djVacia();
    const sembrada = sembrarDesdeExpediente(base, exp);
    return { ...sembrada, perfiles: perfilesSegunVia(via || "PROPIOS", sembrada.perfiles || []) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exp.dj_datos, exp.tipo_solvencia]);

  const [dj, setDj] = useState(inicial);
  const [sucio, setSucio] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const sucioRef = useRef(sucio);
  sucioRef.current = sucio;
  useEffect(() => { if (!sucioRef.current) setDj(inicial); }, [inicial]);

  const tocar = () => { setSucio(true); setAviso(null); };

  function setPerfil(i, clave, valor) {
    tocar();
    setDj((d) => {
      const perfiles = d.perfiles.map((p, j) => (j === i ? { ...p, [clave]: valor } : p));
      return { ...d, perfiles };
    });
  }
  function setFila(i, nombre, idx, clave, valor) {
    tocar();
    setDj((d) => {
      const perfiles = d.perfiles.map((p, j) => {
        if (j !== i) return p;
        const lista = (p[nombre] || []).map((f, k) => (k === idx ? { ...f, [clave]: valor } : f));
        return { ...p, [nombre]: lista };
      });
      return { ...d, perfiles };
    });
  }
  function anadirFila(i, nombre) {
    tocar();
    setDj((d) => {
      const perfiles = d.perfiles.map((p, j) =>
        j === i ? { ...p, [nombre]: [...(p[nombre] || []), filaVacia(nombre)] } : p);
      return { ...d, perfiles };
    });
  }
  function quitarFila(i, nombre, idx) {
    tocar();
    setDj((d) => {
      const perfiles = d.perfiles.map((p, j) =>
        j === i ? { ...p, [nombre]: (p[nombre] || []).filter((_, k) => k !== idx) } : p);
      return { ...d, perfiles };
    });
  }

  async function guardar() {
    if (bloqueado || guardando) return;
    setGuardando(true);
    setAviso(null);
    try {
      const r = await apiPUT(`/solicitudes/${idSolicitud}/visa-expediente/datos`, { dj_datos: dj });
      if (!r.ok) throw new Error(r.msg || "No se pudieron guardar tus datos");
      setSucio(false);
      setAviso({ tono: "ok", texto: "Guardado. Tu asesor revisará tus datos." });
      if (onGuardado) onGuardado();
    } catch (e) {
      setAviso({ tono: "warn", texto: e.message || "Error al guardar" });
    } finally {
      setGuardando(false);
    }
  }

  if (!via) {
    return (
      <Aviso tono="warn" icono="🔒">
        Primero elige tu <b>vía de medios económicos</b> en el bloque anterior.
        Según sea con tu dinero o con un avalista, te pediremos unos datos u otros.
      </Aviso>
    );
  }

  const off = bloqueado || guardando;

  return (
    <div className="space-y-3">
      <Aviso tono="info" icono="💼">
        Para terminar tu expediente necesitamos algunos datos de tu <b>situación laboral e
        ingresos</b> (y los de tu patrocinador, si aplica). No repitas lo del bloque 1 —
        aquí van datos nuevos.
      </Aviso>

      {dj.perfiles.map((p, i) => {
        const esEstudiante = p.rol === "Estudiante";
        const titulo = esEstudiante
          ? "Tu situación laboral"
          : `Datos de tu ${p.rol.toLowerCase()} (patrocinador)`;
        return (
          <div key={i} className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-4 space-y-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A]">{titulo}</p>

            {!esEstudiante && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Campo label="Nombre completo" ancho="full" placeholder="Nombres y apellidos"
                  valor={p.nombre} disabled={off} onChange={(v) => setPerfil(i, "nombre", v)} />
              </div>
            )}

            <div className="flex items-center gap-3 py-1">
              <p className="flex-1 text-[13px] font-semibold text-neutral-800">¿Trabaja actualmente?</p>
              <Interruptor activo={p.trabajaActual} disabled={off}
                onClick={() => setPerfil(i, "trabajaActual", !p.trabajaActual)} />
            </div>

            {p.trabajaActual ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Campo label="¿Dónde trabaja?" ancho="full" placeholder="Empresa"
                  valor={p.empresa} disabled={off} onChange={(v) => setPerfil(i, "empresa", v)} />
                <Campo label="Cargo" placeholder="Tu puesto"
                  valor={p.cargo} disabled={off} onChange={(v) => setPerfil(i, "cargo", v)} />
                <Campo label="¿Desde cuándo?" placeholder="fecha de ingreso"
                  valor={p.desde} disabled={off} onChange={(v) => setPerfil(i, "desde", v)} />
                <Campo label="Última remuneración" ancho="full" placeholder="S/ …"
                  valor={p.ultimaRemuneracion} disabled={off} onChange={(v) => setPerfil(i, "ultimaRemuneracion", v)} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Campo label="Último lugar donde trabajó" ancho="full" placeholder="Empresa"
                  valor={p.ultEmpEmpresa} disabled={off} onChange={(v) => setPerfil(i, "ultEmpEmpresa", v)} />
                <Campo label="Cargo" placeholder="Puesto"
                  valor={p.ultEmpCargo} disabled={off} onChange={(v) => setPerfil(i, "ultEmpCargo", v)} />
                <Campo label="Desde" placeholder="fecha"
                  valor={p.ultEmpDesde} disabled={off} onChange={(v) => setPerfil(i, "ultEmpDesde", v)} />
                <Campo label="Hasta" placeholder="fecha"
                  valor={p.ultEmpHasta} disabled={off} onChange={(v) => setPerfil(i, "ultEmpHasta", v)} />
              </div>
            )}

            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Empleos anteriores (historial)
              </p>
              <Repetible
                nombre="empleos" filas={p.empleos} disabled={off}
                etiquetaAnadir="Añadir empleo anterior"
                onCambiar={(idx, clave, v) => setFila(i, "empleos", idx, clave, v)}
                onAnadir={() => anadirFila(i, "empleos")}
                onQuitar={(idx) => quitarFila(i, "empleos", idx)}
              />
            </div>

            {!esEstudiante && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Campo label="Años de trabajo" placeholder="Ej: 12 años"
                  valor={p.aniosTrabajo} disabled={off} onChange={(v) => setPerfil(i, "aniosTrabajo", v)} />
                <Campo label="Otros ingresos (alquileres, negocio…)" placeholder="Opcional"
                  valor={p.tipoIngresos} disabled={off} onChange={(v) => setPerfil(i, "tipoIngresos", v)} />
              </div>
            )}

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5">
              <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Notas — cuéntanos cualquier detalle relevante
              </label>
              <textarea
                rows={3} disabled={off} value={p.notas || ""}
                onChange={(e) => setPerfil(i, "notas", e.target.value)}
                placeholder="Cambios de trabajo, ingresos extra, ventas, donaciones…"
                className="w-full bg-transparent border-none outline-none p-0 text-[13.5px] text-neutral-800 resize-y placeholder:text-neutral-300 disabled:text-neutral-400"
              />
            </div>
          </div>
        );
      })}

      <Aviso tono="info" icono="📄">
        Tendrás que entregar además tu <b>Certificado Único Laboral (CUL)</b> y tu{" "}
        <b>reporte tributario de SUNAT</b>. Súbelos en el bloque de documentos.
      </Aviso>

      {!bloqueado && (
        <div className="sticky bottom-0 -mx-1 px-1 pt-2 pb-1 bg-gradient-to-t from-white via-white to-transparent">
          {aviso && <div className="mb-2"><Aviso tono={aviso.tono} icono={aviso.tono === "ok" ? "✔" : "⚠️"}>{aviso.texto}</Aviso></div>}
          <div className="flex items-center gap-3">
            <button
              type="button" onClick={guardar} disabled={guardando}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D6A4A] text-white text-sm font-semibold shadow-sm hover:bg-[#175a3e] active:scale-95 transition-all disabled:opacity-60"
            >
              {guardando && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {guardando ? "Guardando…" : "Guardar mis datos"}
            </button>
            {sucio && <p className="text-[11.5px] text-neutral-400">Tienes cambios sin guardar</p>}
          </div>
        </div>
      )}
    </div>
  );
}
