// Bloque DJ, lado del asesor: generador completo de la declaración jurada.
//
// El documento se arma con plantilla determinista (lib/visaDeclaracion.js). El
// asesor completa lo que el cliente no aportó, ve el borrador en vivo y puede
// retocarlo a mano antes de exportarlo. Ese retoque se guarda en `dj_borrador`
// y, a partir de ahí, manda sobre lo generado hasta que se regenere.
import { useEffect, useMemo, useRef, useState } from "react";
import { boPATCH } from "../../../../../services/backofficeApi";
import { GuardarBtn, SubLabel } from "./visaWidgets";
import {
  djVacia, perfilVacio, perfilesSegunVia, sembrarDesdeExpediente,
  generarDeclaracion, ESTILOS_HOJA, descargarWord, imprimirDeclaracion,
  filaVacia, FILAS, ROLES,
} from "../../../../../lib/visaDeclaracion";

/* ── Campos ──────────────────────────────────────────────────────────────── */
function C({ label, valor, onChange, ancho, placeholder }) {
  return (
    <div className={`flex flex-col gap-0.5 ${ancho === "full" ? "sm:col-span-2" : ""}`}>
      <label className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">{label}</label>
      <input
        value={valor ?? ""} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="text-[12px] font-medium text-neutral-800 border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A] placeholder:text-neutral-300"
      />
    </div>
  );
}

function Rejilla({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">{children}</div>;
}

function Tabla({ nombre, filas, onCambiar, onAnadir, onQuitar, etiqueta }) {
  const cols = FILAS[nombre];
  return (
    <div className="space-y-2">
      {(filas || []).map((fila, i) => (
        <div key={i} className="relative border border-neutral-200 rounded-lg p-2.5 bg-neutral-50/60">
          <button
            type="button" onClick={() => onQuitar(i)}
            className="absolute top-1.5 right-1.5 w-5 h-5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 grid place-items-center text-[11px]"
            aria-label="Quitar"
          >✕</button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-5">
            {cols.map(([clave, et, ej, full]) => (
              <C key={clave} label={et} placeholder={ej} ancho={full ? "full" : undefined}
                valor={fila[clave]} onChange={(v) => onCambiar(i, clave, v)} />
            ))}
          </div>
        </div>
      ))}
      <button
        type="button" onClick={onAnadir}
        className="w-full py-1.5 rounded-lg border border-dashed border-neutral-300 text-[11.5px] font-semibold text-neutral-500 hover:border-[#1D6A4A] hover:text-[#1D6A4A] transition-colors"
      >
        + {etiqueta}
      </button>
    </div>
  );
}

/* ── Componente ──────────────────────────────────────────────────────────── */
export default function VisaDeclaracionAdmin({ idSolicitud, expediente, onSaved }) {
  const exp = expediente || {};
  const via = exp.tipo_solvencia && exp.tipo_solvencia !== "PENDIENTE" ? exp.tipo_solvencia : "PROPIOS";

  const inicial = useMemo(() => {
    const base = exp.dj_datos && Object.keys(exp.dj_datos).length ? exp.dj_datos : djVacia();
    const sembrada = sembrarDesdeExpediente(base, exp);
    return { ...sembrada, perfiles: perfilesSegunVia(via, sembrada.perfiles || []) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exp.dj_datos, exp.tipo_solvencia]);

  const [dj, setDj] = useState(inicial);
  const [borrador, setBorrador] = useState(exp.dj_borrador || null);
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const hojaRef = useRef(null);
  const sucio = useRef(false);

  useEffect(() => { if (!sucio.current) { setDj(inicial); setBorrador(exp.dj_borrador || null); } }, [inicial, exp.dj_borrador]);

  const html = useMemo(() => borrador || generarDeclaracion(dj, via), [dj, via, borrador]);

  const tocar = () => { sucio.current = true; setMsg(""); };
  const set = (ruta, valor) => {
    tocar();
    setDj((d) => {
      const ks = ruta.split(".");
      const copia = { ...d };
      let o = copia;
      for (let i = 0; i < ks.length - 1; i++) { o[ks[i]] = { ...o[ks[i]] }; o = o[ks[i]]; }
      o[ks[ks.length - 1]] = valor;
      return copia;
    });
  };

  const setPerfil = (i, k, v) => { tocar(); setDj((d) => ({ ...d, perfiles: d.perfiles.map((p, j) => (j === i ? { ...p, [k]: v } : p)) })); };
  const filaPerfil = (i, nombre, idx, k, v) => { tocar(); setDj((d) => ({ ...d, perfiles: d.perfiles.map((p, j) => j === i ? { ...p, [nombre]: (p[nombre] || []).map((f, m) => (m === idx ? { ...f, [k]: v } : f)) } : p) })); };
  const addPerfilFila = (i, nombre) => { tocar(); setDj((d) => ({ ...d, perfiles: d.perfiles.map((p, j) => j === i ? { ...p, [nombre]: [...(p[nombre] || []), filaVacia(nombre)] } : p) })); };
  const delPerfilFila = (i, nombre, idx) => { tocar(); setDj((d) => ({ ...d, perfiles: d.perfiles.map((p, j) => j === i ? { ...p, [nombre]: (p[nombre] || []).filter((_, m) => m !== idx) } : p) })); };

  const setRaiz = (nombre, idx, k, v) => { tocar(); setDj((d) => ({ ...d, [nombre]: (d[nombre] || []).map((f, m) => (m === idx ? { ...f, [k]: v } : f)) })); };
  const addRaiz = (nombre) => { tocar(); setDj((d) => ({ ...d, [nombre]: [...(d[nombre] || []), filaVacia(nombre)] })); };
  const delRaiz = (nombre, idx) => { tocar(); setDj((d) => ({ ...d, [nombre]: (d[nombre] || []).filter((_, m) => m !== idx) })); };

  function alternarEdicion() {
    const el = hojaRef.current;
    if (!el) return;
    if (!editando) {
      setEditando(true);
      el.contentEditable = "true";
      el.focus();
    } else {
      setEditando(false);
      el.contentEditable = "false";
      sucio.current = true;
      setBorrador(el.innerHTML);
    }
  }

  function regenerar() {
    if (hojaRef.current) hojaRef.current.contentEditable = "false";
    setEditando(false);
    setBorrador(null);
    sucio.current = true;
    setMsg("Borrador regenerado desde los datos.");
  }

  async function guardar() {
    setSaving(true);
    setMsg("");
    try {
      const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/visa-expediente`, {
        dj_datos: dj,
        dj_borrador: borrador,
      });
      if (r.ok) {
        sucio.current = false;
        onSaved?.(r.expediente);
        setMsg("Guardado.");
      } else {
        setMsg(r.msg || "No se pudo guardar.");
      }
    } finally {
      setSaving(false);
    }
  }

  const nombreArchivo = `DDJJ-${(dj.est.nombre || "declaracion").split(" ")[0].toLowerCase()}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText((hojaRef.current?.innerText || "").replace(/\n{3,}/g, "\n\n").trim());
      setMsg("Texto copiado al portapapeles.");
    } catch {
      setMsg("El navegador bloqueó el portapapeles. Selecciona el texto y cópialo a mano.");
    }
  }

  function aPdf() {
    const ok = imprimirDeclaracion(hojaRef.current?.innerHTML || "");
    if (!ok) setMsg("El navegador bloqueó la ventana emergente. Permítela para exportar a PDF.");
  }

  const botonera = "text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:border-[#1D6A4A] hover:text-[#1D6A4A] transition-colors";

  return (
    <div className="space-y-4">
      <style>{ESTILOS_HOJA}</style>

      <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
        <span className="text-base leading-none">🔒</span>
        <p className="text-[12px] text-amber-900 leading-relaxed">
          Vista interna. El cliente sólo ve un formulario de datos económicos; aquí tienes
          todo el expediente y el borrador en formato consular. Vía actual: <b>{via}</b>.
        </p>
      </div>

      <div>
        <SubLabel>Cabecera consular</SubLabel>
        <Rejilla>
          <C label="Consulado" ancho="full" valor={dj.consulado} onChange={(v) => set("consulado", v)} />
          <C label="Tipo de visado" ancho="full" valor={dj.tipoVisado} onChange={(v) => set("tipoVisado", v)} />
        </Rejilla>
      </div>

      <div>
        <SubLabel>Declarante</SubLabel>
        <Rejilla>
          <C label="Nombre completo" ancho="full" placeholder="NOMBRES Y APELLIDOS" valor={dj.est.nombre} onChange={(v) => set("est.nombre", v)} />
          <C label="DNI" valor={dj.est.dni} onChange={(v) => set("est.dni", v)} />
          <C label="Pasaporte" valor={dj.est.pasaporte} onChange={(v) => set("est.pasaporte", v)} />
          <C label="Domicilio" ancho="full" valor={dj.est.domicilio} onChange={(v) => set("est.domicilio", v)} />
        </Rejilla>
      </div>

      <div>
        <SubLabel>Primero · Objeto de la estancia</SubLabel>
        <Rejilla>
          <C label="Nivel" valor={dj.estudios.nivel} onChange={(v) => set("estudios.nivel", v)} />
          <C label="Programa" valor={dj.estudios.programa} onChange={(v) => set("estudios.programa", v)} />
          <C label="Universidad" ancho="full" valor={dj.estudios.universidad} onChange={(v) => set("estudios.universidad", v)} />
          <C label="Facultad / centro" ancho="full" valor={dj.estudios.facultad} onChange={(v) => set("estudios.facultad", v)} />
          <C label="Dirección / ciudad" ancho="full" valor={dj.estudios.ciudadUni} onChange={(v) => set("estudios.ciudadUni", v)} />
          <C label="Código RUCT" placeholder="28027060" valor={dj.estudios.codigo} onChange={(v) => set("estudios.codigo", v)} />
          <C label="Modalidad" valor={dj.estudios.modalidad} onChange={(v) => set("estudios.modalidad", v)} />
          <C label="Periodo total" placeholder="1 sep 2026 – 30 jun 2030" valor={dj.estudios.periodoTotal} onChange={(v) => set("estudios.periodoTotal", v)} />
          <C label="ECTS" valor={dj.estudios.ects} onChange={(v) => set("estudios.ects", v)} />
          <C label="Inicio (1.er año)" valor={dj.estudios.inicio} onChange={(v) => set("estudios.inicio", v)} />
          <C label="Fin (1.er año)" valor={dj.estudios.fin} onChange={(v) => set("estudios.fin", v)} />
          <C label="Coste total (€)" valor={dj.estudios.costoTotal} onChange={(v) => set("estudios.costoTotal", v)} />
          <C label="Abonado (€)" valor={dj.estudios.abonado} onChange={(v) => set("estudios.abonado", v)} />
          <C label="Pendiente (€)" valor={dj.estudios.pendiente} onChange={(v) => set("estudios.pendiente", v)} />
        </Rejilla>
        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mt-3 mb-1.5">Desglose de tasas</p>
        <Tabla nombre="costos" filas={dj.costos} etiqueta="Añadir concepto"
          onCambiar={(i, k, v) => setRaiz("costos", i, k, v)} onAnadir={() => addRaiz("costos")} onQuitar={(i) => delRaiz("costos", i)} />
      </div>

      <div>
        <SubLabel>Segundo · Sustento y alojamiento</SubLabel>
        <Rejilla>
          <C label="Alojamiento (dirección)" ancho="full" valor={dj.sustento.alojamiento} onChange={(v) => set("sustento.alojamiento", v)} />
          <C label="Coste total alojamiento (€)" valor={dj.sustento.alojCoste} onChange={(v) => set("sustento.alojCoste", v)} />
          <C label="Cuota mensual (€)" valor={dj.sustento.alojMensual} onChange={(v) => set("sustento.alojMensual", v)} />
          <C label="Periodo alojamiento" ancho="full" valor={dj.sustento.alojPeriodo} onChange={(v) => set("sustento.alojPeriodo", v)} />
          <C label="IPREM anual (€)" valor={dj.sustento.ipremAnual} onChange={(v) => set("sustento.ipremAnual", v)} />
          <C label="Vuelo (ruta)" placeholder="Lima – Madrid" valor={dj.sustento.vuelo} onChange={(v) => set("sustento.vuelo", v)} />
          <C label="Fecha vuelo" valor={dj.sustento.vueloFecha} onChange={(v) => set("sustento.vueloFecha", v)} />
        </Rejilla>
        <p className="text-[11px] text-amber-700 mt-2">⚠️ Verifica el IPREM vigente y lo que exige el consulado.</p>
      </div>

      <div>
        <SubLabel>Situación económica por persona</SubLabel>
        <div className="space-y-3">
          {dj.perfiles.map((p, i) => (
            <div key={i} className="border border-neutral-200 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#023A4B] text-white">{p.rol}</span>
                <select
                  value={p.rol} onChange={(e) => setPerfil(i, "rol", e.target.value)}
                  className="text-[11px] font-semibold border border-neutral-300 rounded-lg px-2 py-1 bg-white"
                >
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
                {dj.perfiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => { tocar(); setDj((d) => ({ ...d, perfiles: d.perfiles.filter((_, j) => j !== i) })); }}
                    className="ml-auto text-[11px] font-semibold text-neutral-400 hover:text-red-600"
                  >Quitar ✕</button>
                )}
              </div>

              <Rejilla>
                <C label="Nombre completo" ancho="full" valor={p.nombre} onChange={(v) => setPerfil(i, "nombre", v)} />
                <C label="Documento" placeholder="DNI / Pasaporte N.°" valor={p.doc} onChange={(v) => setPerfil(i, "doc", v)} />
                <C label="Nacionalidad" valor={p.nacionalidad} onChange={(v) => setPerfil(i, "nacionalidad", v)} />
                <C label="Formación / profesión" ancho="full" valor={p.formacion} onChange={(v) => setPerfil(i, "formacion", v)} />
              </Rejilla>

              <label className="flex items-center gap-2 text-[12px] font-semibold text-neutral-700">
                <input type="checkbox" checked={!!p.trabajaActual} onChange={() => setPerfil(i, "trabajaActual", !p.trabajaActual)} />
                Trabaja actualmente
              </label>

              {p.trabajaActual ? (
                <Rejilla>
                  <C label="Empresa" ancho="full" valor={p.empresa} onChange={(v) => setPerfil(i, "empresa", v)} />
                  <C label="Cargo" valor={p.cargo} onChange={(v) => setPerfil(i, "cargo", v)} />
                  <C label="RUC" valor={p.ruc} onChange={(v) => setPerfil(i, "ruc", v)} />
                  <C label="Desde" valor={p.desde} onChange={(v) => setPerfil(i, "desde", v)} />
                  <C label="Última remuneración" valor={p.ultimaRemuneracion} onChange={(v) => setPerfil(i, "ultimaRemuneracion", v)} />
                </Rejilla>
              ) : (
                <Rejilla>
                  <C label="Último empleo" ancho="full" valor={p.ultEmpEmpresa} onChange={(v) => setPerfil(i, "ultEmpEmpresa", v)} />
                  <C label="Cargo" valor={p.ultEmpCargo} onChange={(v) => setPerfil(i, "ultEmpCargo", v)} />
                  <C label="Desde" valor={p.ultEmpDesde} onChange={(v) => setPerfil(i, "ultEmpDesde", v)} />
                  <C label="Hasta" valor={p.ultEmpHasta} onChange={(v) => setPerfil(i, "ultEmpHasta", v)} />
                </Rejilla>
              )}

              <Rejilla>
                <C label="Años de trabajo" valor={p.aniosTrabajo} onChange={(v) => setPerfil(i, "aniosTrabajo", v)} />
                <C label="Otros ingresos / tipo" valor={p.tipoIngresos} onChange={(v) => setPerfil(i, "tipoIngresos", v)} />
                <C label="Arraigo" ancho="full" valor={p.arraigo} onChange={(v) => setPerfil(i, "arraigo", v)} />
                <C label="Notas del asesor" ancho="full" valor={p.notas} onChange={(v) => setPerfil(i, "notas", v)} />
              </Rejilla>

              {[
                ["empleos", "Empleos (historial)", "Empleo"],
                ["ingresos", "Ingresos mensuales", "Mes de ingreso"],
                ["saldos", "Evolución de saldos bancarios", "Mes de saldo"],
                ["cuentas", "Cuentas (resumen)", "Cuenta"],
                ["donaciones", "Donaciones / ingresos especiales", "Donación"],
              ].map(([nombre, titulo, etiqueta]) => (
                <div key={nombre}>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mt-2 mb-1.5">{titulo}</p>
                  <Tabla
                    nombre={nombre} filas={p[nombre]} etiqueta={etiqueta}
                    onCambiar={(idx, k, v) => filaPerfil(i, nombre, idx, k, v)}
                    onAnadir={() => addPerfilFila(i, nombre)}
                    onQuitar={(idx) => delPerfilFila(i, nombre, idx)}
                  />
                </div>
              ))}
            </div>
          ))}
          <button
            type="button"
            onClick={() => { tocar(); setDj((d) => ({ ...d, perfiles: [...d.perfiles, perfilVacio("Padre")] })); }}
            className="w-full py-2 rounded-lg border border-dashed border-neutral-300 text-[12px] font-semibold text-neutral-500 hover:border-[#1D6A4A] hover:text-[#1D6A4A]"
          >
            + Añadir garante
          </button>
        </div>
      </div>

      <div>
        <SubLabel>Pagos anticipados y compromisos</SubLabel>
        <Tabla nombre="pagos" filas={dj.pagos} etiqueta="Añadir pago"
          onCambiar={(i, k, v) => setRaiz("pagos", i, k, v)} onAnadir={() => addRaiz("pagos")} onQuitar={(i) => delRaiz("pagos", i)} />
      </div>

      <div>
        <SubLabel>Capacidad económica global (cuadro estimado)</SubLabel>
        <Tabla nombre="gastos" filas={dj.gastos} etiqueta="Añadir concepto"
          onCambiar={(i, k, v) => setRaiz("gastos", i, k, v)} onAnadir={() => addRaiz("gastos")} onQuitar={(i) => delRaiz("gastos", i)} />
      </div>

      <div>
        <SubLabel>Lugar y fecha de firma</SubLabel>
        <Rejilla>
          <C label="Ciudad" valor={dj.firma.ciudad} onChange={(v) => set("firma.ciudad", v)} />
          <C label="Día" valor={dj.firma.dia} onChange={(v) => set("firma.dia", v)} />
          <C label="Mes" placeholder="mayo" valor={dj.firma.mes} onChange={(v) => set("firma.mes", v)} />
          <C label="Año" valor={dj.firma.anio} onChange={(v) => set("firma.anio", v)} />
        </Rejilla>
      </div>

      {/* Borrador */}
      <div>
        <SubLabel>Borrador de la declaración (formato consular)</SubLabel>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <button type="button" className={botonera} onClick={alternarEdicion}>
            {editando ? "✓ Guardar edición" : "✎ Editar a mano"}
          </button>
          <button type="button" className={botonera} onClick={regenerar}>↻ Regenerar</button>
          <button type="button" className={botonera} onClick={copiar}>⧉ Copiar</button>
          <button type="button" className={botonera} onClick={() => descargarWord(hojaRef.current?.innerHTML || "", nombreArchivo)}>⭳ Word</button>
          <button
            type="button" onClick={aPdf}
            className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] transition-colors"
          >🖨 PDF</button>
        </div>

        {borrador && (
          <p className="text-[11px] text-amber-700 mb-2">
            ✎ Estás viendo un borrador editado a mano. «Regenerar» lo descarta y vuelve a construirlo desde los datos.
          </p>
        )}

        <div className="border border-neutral-300 rounded-xl overflow-hidden">
          <div className="max-h-[520px] overflow-auto bg-white p-5 sm:p-8">
            <div
              ref={hojaRef}
              className={`dj-hoja outline-none ${editando ? "ring-2 ring-[#1D6A4A] rounded" : ""}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <GuardarBtn onClick={guardar} saving={saving} />
        {msg && <p className="text-[11.5px] text-neutral-500">{msg}</p>}
      </div>
    </div>
  );
}
