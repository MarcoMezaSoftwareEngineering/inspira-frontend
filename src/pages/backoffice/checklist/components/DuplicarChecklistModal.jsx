// src/pages/backoffice/checklist/components/DuplicarChecklistModal.jsx
//
// Copia los documentos del checklist de otro servicio al servicio actual.
// Reutiliza los endpoints existentes: lee el checklist origen y crea los ítems
// uno a uno en el destino.
import { useEffect, useState } from "react";

// Se monta solo cuando está abierto: al cerrarlo el formulario queda limpio.
export default function DuplicarChecklistModal({
  servicios,
  servicioDestino,
  copiando,
  onCerrar,
  onDuplicar,
}) {
  const [origen, setOrigen] = useState("");
  const [omitirExistentes, setOmitirExistentes] = useState(true);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && !copiando) onCerrar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [copiando, onCerrar]);

  const candidatos = servicios.filter((s) => s.id_servicio !== servicioDestino?.id_servicio);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(8,28,19,.38)] p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-[460px] overflow-hidden rounded-[20px] border border-[#dfe7e2] bg-white shadow-[0_28px_80px_rgba(15,61,42,.20)]">
        <div className="border-b border-[#dfe7e2] bg-gradient-to-b from-[#fbfefc] to-[#f8fbf9] px-5 py-4">
          <h3 className="m-0 text-base font-bold text-[#10251c]">Duplicar checklist</h3>
          <p className="mt-1 text-[11px] text-[#6f7d76]">
            Copia los documentos de otro servicio a{" "}
            <b className="text-[#33483d]">{servicioDestino?.nombre || "este servicio"}</b>.
          </p>
        </div>

        <div className="px-5 py-5">
          <label className="block mb-[7px] text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#77827d]">
            Servicio de origen
          </label>
          <select
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
            className="w-full min-h-[46px] rounded-xl border border-[#d9e4dd] bg-white px-3 text-sm outline-none transition focus:border-[#7acaa4] focus:shadow-[0_0_0_4px_rgba(51,177,120,.10)]"
          >
            <option value="">— Selecciona un servicio —</option>
            {candidatos.map((s) => (
              <option key={s.id_servicio} value={s.id_servicio}>
                {s.codigo} · {s.nombre}
              </option>
            ))}
          </select>

          <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[#dfe7e2] bg-white p-3 transition hover:border-[#bcd8c9]">
            <input
              type="checkbox"
              className="mt-0.5 accent-[#0f5e3f]"
              checked={omitirExistentes}
              onChange={(e) => setOmitirExistentes(e.target.checked)}
            />
            <span>
              <strong className="block text-xs">Omitir documentos repetidos</strong>
              <span className="mt-[3px] block text-[10px] leading-[1.4] text-[#6f7d76]">
                No copia los que ya existen con el mismo nombre en este servicio.
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#dfe7e2] bg-[#fafcfa] px-5 py-3.5">
          <button
            type="button"
            disabled={copiando}
            onClick={onCerrar}
            className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-[#dfe7e2] bg-white px-3.5 text-[13px] font-bold text-[#10251c] transition hover:border-[#c8d8cf] disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!origen || copiando}
            onClick={() => onDuplicar(Number(origen), omitirExistentes)}
            className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-gradient-to-br from-[#0f5e3f] to-[#16815a] px-3.5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(15,94,63,.22)] transition disabled:opacity-60"
          >
            {copiando ? "Copiando…" : "Copiar documentos"}
          </button>
        </div>
      </div>
    </div>
  );
}
