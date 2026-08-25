// Estado del visado dentro del bloque de Cita BLS.
//
// La resolución consular no es un sí o un no inmediato: puede llegar un
// requerimiento de subsanación con plazo, y una denegación admite apelación o
// reconducirse a estancia por estudios. Por eso los tramos condicionales
// (requerimiento, vía posterior) sólo aparecen cuando corresponden: enseñarlos
// siempre invita a rellenarlos sin que haya pasado nada.
import { useEffect, useRef, useState } from "react";
import { boPATCH } from "../../../../../services/backofficeApi";
import { Campo, Selecc, SubLabel } from "./visaWidgets";
import { RESULTADOS, VIAS_POSTERIORES, REQUERIMIENTO, estadoVisado, TONOS } from "../../../../../lib/visaFlujoInterno";

const CITA_ESTADOS = [
  { value: "PENDIENTE",  label: "Sin cita aún" },
  { value: "AGENDADA",   label: "Cita programada" },
  { value: "CONFIRMADA", label: "Cita confirmada" },
  { value: "REALIZADA",  label: "Cita realizada" },
  { value: "REAGENDAR",  label: "Hay que reagendar" },
];

const CAMPOS = [
  "cita_estado", "cita_fecha", "cita_hora", "cita_ref_bls", "cita_tasa", "cita_notas",
  "visado_resultado", "visado_resultado_fecha",
  "requerimiento_estado", "requerimiento_fecha", "requerimiento_plazo", "requerimiento_detalle",
  "via_posterior", "via_posterior_fecha", "via_posterior_notas",
];

function desde(exp = {}) {
  const o = {};
  CAMPOS.forEach((k) => { o[k] = exp[k] ?? ""; });
  o.cita_estado = exp.cita_estado || "PENDIENTE";
  return o;
}

export default function VisaEstadoVisadoAdmin({ idSolicitud, expediente, onSaved }) {
  const [f, setF] = useState(() => desde(expediente));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const sucio = useRef(false);

  useEffect(() => { if (!sucio.current) setF(desde(expediente)); }, [expediente]);

  const set = (k) => (v) => { sucio.current = true; setMsg(""); setF((p) => ({ ...p, [k]: v })); };

  // Qué tramos tienen sentido ahora mismo.
  const citaHecha = f.cita_estado === "REALIZADA";
  const denegado = f.visado_resultado === "DENEGADO";
  const hayRequerimiento = !!f.requerimiento_estado;

  const resumen = estadoVisado({ ...expediente, ...f });

  async function guardar() {
    setSaving(true);
    setMsg("");
    try {
      // Los campos vacíos viajan como null: así se limpia de verdad un tramo
      // que se abrió por error, en vez de dejar una cadena vacía.
      const cuerpo = {};
      CAMPOS.forEach((k) => { cuerpo[k] = f[k] === "" ? null : f[k]; });
      cuerpo.cita_estado = f.cita_estado || "PENDIENTE";

      const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/visa-expediente`, cuerpo);
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

  return (
    <div className="space-y-4">
      {/* Estado en una línea */}
      <div className={`rounded-xl border px-4 py-3 ${TONOS[resumen.tono]}`}>
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono opacity-70">Estado del visado</p>
        <p className="text-[16px] font-bold mt-0.5">{resumen.icono} {resumen.texto}</p>
      </div>

      {/* 1 · La cita */}
      <div>
        <SubLabel>1 · Cita en BLS</SubLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <Selecc label="Estado de la cita" value={f.cita_estado} onChange={set("cita_estado")} options={CITA_ESTADOS} />
          <Campo label="Fecha de la cita" value={f.cita_fecha} onChange={set("cita_fecha")} type="date" />
          <Campo label="Hora" value={f.cita_hora} onChange={set("cita_hora")} type="time" />
          <Campo label="N.º de referencia BLS" value={f.cita_ref_bls} onChange={set("cita_ref_bls")} />
          <Campo label="Tasa consular" value={f.cita_tasa} onChange={set("cita_tasa")} placeholder="Importe" />
        </div>
      </div>

      {/* 2 · Requerimiento — sólo si el consulado lo pide */}
      <div>
        <SubLabel>2 · Requerimiento o subsanación</SubLabel>
        {!citaHecha && !hayRequerimiento ? (
          <p className="text-[12px] text-neutral-400 leading-relaxed">
            Se habilita cuando la cita esté <b>realizada</b>. Sólo se rellena si el
            consulado llega a pedir algo.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Selecc
                label="¿Hubo requerimiento?" value={f.requerimiento_estado} onChange={set("requerimiento_estado")}
                options={[{ value: "", label: "No hubo" }, ...REQUERIMIENTO.map((r) => ({ value: r.valor, label: r.etiqueta }))]}
              />
              {hayRequerimiento && (
                <>
                  <Campo label="Fecha en que lo notificaron" value={f.requerimiento_fecha} onChange={set("requerimiento_fecha")} type="date" />
                  <Campo label="Plazo para responder" value={f.requerimiento_plazo} onChange={set("requerimiento_plazo")} type="date" />
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Campo label="Qué piden exactamente" value={f.requerimiento_detalle} onChange={set("requerimiento_detalle")}
                      placeholder="Documento, aclaración o corrección solicitada" />
                  </div>
                </>
              )}
            </div>
            {f.requerimiento_estado === "SOLICITADO" && (
              <p className="text-[12px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2.5 leading-relaxed">
                ⚠️ Los requerimientos vienen con <b>plazo corto</b>. Avisa al cliente hoy
                mismo: lo verá también en su portal.
              </p>
            )}
          </>
        )}
      </div>

      {/* 3 · Resultado */}
      <div>
        <SubLabel>3 · Resultado</SubLabel>
        {!citaHecha ? (
          <p className="text-[12px] text-neutral-400 leading-relaxed">
            Se habilita cuando la cita esté <b>realizada</b>.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <Selecc
              label="Resultado" value={f.visado_resultado} onChange={set("visado_resultado")}
              options={[{ value: "", label: "—" }, ...RESULTADOS.map((r) => ({ value: r.valor, label: `${r.icono} ${r.etiqueta}` }))]}
            />
            <Campo label="Fecha del resultado" value={f.visado_resultado_fecha} onChange={set("visado_resultado_fecha")} type="date" />
          </div>
        )}
      </div>

      {/* 4 · Vía posterior — sólo si denegaron */}
      {denegado && (
        <div>
          <SubLabel>4 · Qué se hace con la denegación</SubLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <Selecc
              label="Vía elegida" value={f.via_posterior} onChange={set("via_posterior")}
              options={[{ value: "", label: "Sin decidir" }, ...VIAS_POSTERIORES.map((v) => ({ value: v.valor, label: v.etiqueta }))]}
            />
            <Campo label="Fecha" value={f.via_posterior_fecha} onChange={set("via_posterior_fecha")} type="date" />
            <div className="sm:col-span-2 lg:col-span-1">
              <Campo label="Notas" value={f.via_posterior_notas} onChange={set("via_posterior_notas")} placeholder="Motivo alegado, plazos…" />
            </div>
          </div>
          {f.via_posterior && (
            <p className="text-[11.5px] text-neutral-500 mt-2 leading-relaxed">
              {VIAS_POSTERIORES.find((v) => v.valor === f.via_posterior)?.pista}
            </p>
          )}
        </div>
      )}

      {/* Notas internas */}
      <div>
        <SubLabel>Notas internas</SubLabel>
        <Campo label="Sólo equipo Inspira" value={f.cita_notas} onChange={set("cita_notas")}
          placeholder="Lo que no debe ver el cliente" />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button" onClick={guardar} disabled={saving}
          className="text-[12px] font-semibold px-5 py-2 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#15533a] disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando…" : "Guardar estado"}
        </button>
        {msg && <p className="text-[11.5px] text-neutral-500">{msg}</p>}
      </div>
    </div>
  );
}
