// src/pages/backoffice/checklist/components/ChecklistItemDrawer.jsx
//
// Panel lateral para crear o editar un documento del checklist.
import { useEffect } from "react";

export default function ChecklistItemDrawer({
  abierto,
  modo,          // "crear" | "editar"
  form,
  setForm,
  saving,
  onCerrar,
  onGuardar,
}) {
  useEffect(() => {
    if (!abierto) return;
    function onKey(e) {
      if (e.key === "Escape") onCerrar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, onCerrar]);

  const esEdicion = modo === "editar";

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onCerrar}
        className={[
          "fixed inset-0 z-[60] bg-[rgba(8,28,19,.38)] backdrop-blur-[3px] transition-opacity duration-200",
          abierto ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!abierto}
        className={[
          "fixed top-0 right-0 bottom-0 z-[70] flex w-[min(520px,100%)] flex-col bg-white",
          "shadow-[-30px_0_80px_rgba(12,55,37,.20)] transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)]",
          abierto ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#dfe7e2] bg-gradient-to-b from-[#fbfefc] to-[#f8fbf9] px-[22px] py-5">
          <div>
            <h3 className="m-0 text-lg font-bold text-[#10251c]">
              {esEdicion ? "Editar documento" : "Añadir nuevo documento"}
            </h3>
            <p className="mt-1 text-[11px] text-[#6f7d76]">
              {esEdicion
                ? "Los cambios se aplican al checklist del servicio."
                : "Se agregará al checklist del servicio seleccionado."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onCerrar}
            className="w-[38px] h-[38px] shrink-0 rounded-xl border border-[#dfe7e2] bg-white grid place-items-center text-[#4a5a51] hover:border-[#c8d8cf]"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <form
          id="form-checklist-item"
          onSubmit={onGuardar}
          className="flex-1 overflow-auto px-[22px] py-[22px]"
        >
          <div className="grid gap-[15px]">
            <div>
              <label className="block mb-[7px] text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#77827d]">
                Nombre del documento
              </label>
              <input
                className="w-full min-h-[46px] rounded-xl border border-[#d9e4dd] bg-white px-[13px] text-sm outline-none transition focus:border-[#7acaa4] focus:shadow-[0_0_0_4px_rgba(51,177,120,.10)]"
                value={form.nombre_item}
                onChange={(e) => setForm((f) => ({ ...f, nombre_item: e.target.value }))}
                placeholder="Ej. Certificado de estudios apostillado"
                required
              />
            </div>

            <div>
              <label className="block mb-[7px] text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#77827d]">
                Descripción
              </label>
              <textarea
                className="w-full min-h-[88px] resize-y rounded-xl border border-[#d9e4dd] bg-white p-3 text-sm outline-none transition focus:border-[#7acaa4] focus:shadow-[0_0_0_4px_rgba(51,177,120,.10)]"
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                placeholder="Añade una instrucción breve para el cliente o el equipo…"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[#dfe7e2] bg-white p-3 transition hover:border-[#bcd8c9] hover:bg-[#fbfdfc]">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[#0f5e3f]"
                  checked={form.obligatorio}
                  onChange={(e) => setForm((f) => ({ ...f, obligatorio: e.target.checked }))}
                />
                <span>
                  <strong className="block text-xs">Obligatorio</strong>
                  <span className="mt-[3px] block text-[10px] leading-[1.4] text-[#6f7d76]">
                    El documento será requisito del servicio.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[#dfe7e2] bg-white p-3 transition hover:border-[#bcd8c9] hover:bg-[#fbfdfc]">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[#0f5e3f]"
                  checked={form.permite_archivo}
                  onChange={(e) => setForm((f) => ({ ...f, permite_archivo: e.target.checked }))}
                />
                <span>
                  <strong className="block text-xs">Requiere archivo</strong>
                  <span className="mt-[3px] block text-[10px] leading-[1.4] text-[#6f7d76]">
                    El usuario deberá adjuntar un documento.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </form>

        <div className="mt-auto flex justify-end gap-2 border-t border-[#dfe7e2] bg-[rgba(250,252,251,.94)] px-[22px] py-[15px] backdrop-blur">
          <button
            type="button"
            onClick={onCerrar}
            className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-[#dfe7e2] bg-white px-3.5 text-[13px] font-bold text-[#10251c] transition hover:border-[#c8d8cf]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-checklist-item"
            disabled={saving}
            className="inline-flex min-h-[42px] items-center justify-center rounded-xl bg-gradient-to-br from-[#0f5e3f] to-[#16815a] px-3.5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(15,94,63,.22)] transition hover:shadow-[0_14px_32px_rgba(15,94,63,.30)] disabled:opacity-60"
          >
            {saving ? "Guardando…" : esEdicion ? "Guardar cambios" : "Añadir documento"}
          </button>
        </div>
      </aside>
    </>
  );
}
