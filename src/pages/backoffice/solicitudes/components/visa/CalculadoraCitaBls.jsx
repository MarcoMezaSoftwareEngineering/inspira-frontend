// Calculadora del plazo de la cita en BLS: a partir del inicio de clases dice el
// límite (dos meses antes), la ventana interna de Inspira (del 7 al 15 del mes,
// con el cierre de cuentas del mes anterior) y, si ya hay fecha de cita, si está
// en regla o si hace falta la declaración jurada de plazo. La regla vive en
// lib/visaPlazoCita.js.
import { useState } from "react";
import { plazoCitaBls, fechaLarga, textoVentana } from "../../../../../lib/visaPlazoCita";
import { Campo } from "./visaWidgets";

const TONO = {
  ok: "bg-emerald-50 border-emerald-200 text-emerald-800",
  aviso: "bg-amber-50 border-amber-200 text-amber-800",
  mal: "bg-red-50 border-red-200 text-red-800",
};
const hoyLima = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());

export default function CalculadoraCitaBls({ inicioClases, citaFecha }) {
  // Sin inicio en el expediente se puede probar una fecha aquí (no se guarda).
  const [manual, setManual] = useState("");
  const inicio = inicioClases || manual;
  const p = plazoCitaBls({ inicioClases: inicio, citaFecha, hoy: hoyLima() });

  return (
    <div className="rounded-xl border border-[#cfe0ea] bg-[#f5f9fc] px-4 py-3 mb-3">
      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-[#4f6672]">Plazo de la cita</p>

      {!inicioClases && (
        <div className="mt-2 max-w-[220px]">
          <Campo label="Inicio de clases" type="date" value={manual} onChange={setManual} />
          <p className="text-[11px] text-neutral-500 mt-1">
            No está en el expediente. Guárdalo en <b>Formulario → Inicio estudios</b> para que salga solo.
          </p>
        </div>
      )}

      {!p ? (
        <p className="text-[12px] text-neutral-500 mt-1.5">Indica el inicio de clases para calcular el plazo.</p>
      ) : (
        <div className="mt-1.5 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <p className="text-[10.5px] text-neutral-500">Inicio de clases</p>
              <p className="text-[13px] font-semibold text-neutral-800">{fechaLarga(p.inicio)}</p>
            </div>
            <div>
              <p className="text-[10.5px] text-neutral-500">Límite (2 meses antes)</p>
              <p className="text-[13px] font-bold text-[#013446]">{fechaLarga(p.limite)}</p>
            </div>
            <div>
              <p className="text-[10.5px] text-neutral-500">Cita ideal (regla Inspira)</p>
              <p className="text-[13px] font-bold text-[#C2410C]">{textoVentana(p.ventana)}</p>
            </div>
          </div>

          <p className="text-[11.5px] text-neutral-600 leading-relaxed">
            Con cita en esa ventana, los estados de cuenta van cerrados hasta <b>{p.ventana?.cuentasHasta}</b>.
            {p.ventana?.recortada && " La ventana se acorta porque el límite cae antes del día 15."}
            {p.ventanaAnterior && <> Si se quiere más margen: <b>{textoVentana(p.ventanaAnterior)}</b>.</>}
          </p>

          {p.hoyFueraDePlazo && !p.cita && (
            <p className={`text-[12px] border rounded-lg px-3 py-2 leading-relaxed ${TONO.mal}`}>
              ⚠️ El límite ya pasó: cualquier cita que se saque ahora necesita <b>declaración jurada de plazo</b>.
            </p>
          )}

          {p.cita && (
            <p className={`text-[12px] border rounded-lg px-3 py-2 leading-relaxed ${TONO[p.cita.tono]}`}>
              {p.cita.tono === "ok" ? "✅" : "⚠️"} <b>Cita del {fechaLarga(p.cita.fecha)}.</b> {p.cita.texto}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
