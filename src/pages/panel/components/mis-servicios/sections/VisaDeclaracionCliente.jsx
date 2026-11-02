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
import IconoPaso from "../../../../../components/common/IconoPaso";
import { IconoLinea } from "../utils";
import Icono from "../../../../../components/common/Icono";

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

// La etiqueta va ENCIMA de la caja, legible.
function Campo({ label, valor, onChange, ancho, disabled, placeholder }) {
  return (
    <div className={`pnl-campo ${ancho === "full" ? "sm:col-span-2" : ""}`}>
      <label className="pnl-campo-etiqueta">{label}</label>
      <input
        value={valor || ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="pnl-campo-control"
      />
    </div>
  );
}

// Solo la pista visual: la fila entera (el botón que la contiene) es la que
// se toca.
function Interruptor({ activo }) {
  return <span className="pnl-interruptor" data-on={activo ? "1" : undefined} aria-hidden="true" />;
}

/* Tabla repetible (empleos anteriores). En móvil cada fila es una tarjeta. */
function Repetible({ nombre, filas, onCambiar, onAnadir, onQuitar, disabled, etiquetaAnadir }) {
  const cols = FILAS[nombre];
  return (
    <div className="space-y-2">
      {(filas || []).map((fila, i) => (
        <div key={i} className="pnl-repetible-fila">
          {!disabled && (
            <button
              type="button" onClick={() => onQuitar(i)}
              className="pnl-btn-icono pnl-repetible-quitar"
              data-talla="s"
              aria-label="Quitar"
            ><IconoPaso nombre="x" strokeWidth={2.2} /></button>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4 pr-11">
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
          className="pnl-repetible-anadir"
        >
          <IconoPaso nombre="plus" strokeWidth={2.2} />
          {etiquetaAnadir}
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
      <Aviso tono="warn" icono={<Icono nombre="candado" size={16} />}>
        Primero elige tu <b>vía de medios económicos</b> en el bloque anterior.
        Según sea con tu dinero o con un avalista, te pediremos unos datos u otros.
      </Aviso>
    );
  }

  const off = bloqueado || guardando;

  return (
    <div className="space-y-3">
      <Aviso tono="info" icono={<Icono nombre="usuario" size={16} />}>
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
          <div key={i} className="pnl-tarjeta pnl-tarjeta-visado space-y-4" data-anidada="1">
            <p className="pnl-eyebrow"><span className="punto" />{titulo}</p>

            {!esEstudiante && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4">
                <Campo label="Nombre completo" ancho="full" placeholder="Nombres y apellidos"
                  valor={p.nombre} disabled={off} onChange={(v) => setPerfil(i, "nombre", v)} />
              </div>
            )}

            {/* La fila entera es el interruptor: se toca en cualquier punto. */}
            <button
              type="button"
              className="pnl-interruptor-fila"
              disabled={off}
              aria-pressed={!!p.trabajaActual}
              onClick={() => setPerfil(i, "trabajaActual", !p.trabajaActual)}
            >
              <span className="pnl-calc-etiqueta">¿Trabaja actualmente?</span>
              <Interruptor activo={p.trabajaActual} />
            </button>

            {p.trabajaActual ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4">
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
              <p className="pnl-eyebrow pnl-visado-subtitulo">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4">
                <Campo label="Años de trabajo" placeholder="Ej: 12 años"
                  valor={p.aniosTrabajo} disabled={off} onChange={(v) => setPerfil(i, "aniosTrabajo", v)} />
                <Campo label="Otros ingresos (alquileres, negocio…)" placeholder="Opcional"
                  valor={p.tipoIngresos} disabled={off} onChange={(v) => setPerfil(i, "tipoIngresos", v)} />
              </div>
            )}

            <div className="pnl-campo">
              <label className="pnl-campo-etiqueta">
                Notas — cuéntanos cualquier detalle relevante
              </label>
              <textarea
                rows={3} disabled={off} value={p.notas || ""}
                onChange={(e) => setPerfil(i, "notas", e.target.value)}
                placeholder="Cambios de trabajo, ingresos extra, ventas, donaciones…"
                className="pnl-campo-control"
              />
            </div>
          </div>
        );
      })}

      <Aviso tono="info" icono={<IconoPaso nombre="fileText" />}>
        Tendrás que entregar además tu <b>Certificado Único Laboral (CUL)</b> y tu{" "}
        <b>reporte tributario de SUNAT</b>. Súbelos en el bloque de documentos.
      </Aviso>

      {!bloqueado && (
        <div className="pnl-barra-guardar sticky bottom-[var(--selector-alto)] z-[14] flex-wrap">
          {aviso && <div className="w-full"><Aviso tono={aviso.tono}>{aviso.texto}</Aviso></div>}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button" onClick={guardar} disabled={guardando}
              className="pnl-btn-primario"
            >
              {guardando && <span className="pnl-spinner" data-talla="s" />}
              {guardando ? "Guardando…" : "Guardar mis datos"}
            </button>
            {sucio && <p className="pnl-barra-guardar-texto" data-sucio="1">Tienes cambios sin guardar</p>}
          </div>
        </div>
      )}
    </div>
  );
}
