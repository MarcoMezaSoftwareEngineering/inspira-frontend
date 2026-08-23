// src/pages/backoffice/precios/ServicioForm.jsx

const MONEDAS = ["EUR", "PEN", "USD"];
const CURRENCY_SYMBOL = { EUR: "€", PEN: "S/", USD: "$" };

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-neutral-600">
        {label}
        {hint && <span className="text-[10px] text-neutral-400 font-normal ml-1">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors";

export default function ServicioForm({
  modo,
  form,
  setForm,
  saving,
  onSubmit,
  onReset,
}) {
  const esNuevo = modo === "nuevo";

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm sticky top-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
        <div className="w-9 h-9 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
          {esNuevo ? (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          ) : (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-neutral-800">
            {esNuevo ? "Nuevo servicio" : "Editar servicio y precio"}
          </h2>
          <p className="text-[11px] text-neutral-400">
            {esNuevo ? "Se creará con precio vigente desde hoy" : `Código ${form.codigo || "—"}`}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="px-5 py-4 space-y-4">
          {/* Código interno */}
          <Field label="Código interno" hint="(generado automáticamente)">
            <input
              type="text"
              className={`${inputCls} bg-neutral-50 text-neutral-400 font-mono`}
              value={form.codigo || ""}
              disabled
              readOnly
              placeholder="—"
            />
          </Field>

          {/* Nombre */}
          <Field label="Nombre">
            <input
              type="text"
              className={inputCls}
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej. Plan Básico Full"
              required
            />
          </Field>

          {/* Descripción */}
          <Field label="Descripción" hint="(opcional)">
            <textarea
              className={`${inputCls} min-h-[72px] resize-none`}
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder="Detalle breve del alcance del servicio…"
            />
          </Field>

          {/* Moneda */}
          <Field label="Moneda">
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-xl">
              {MONEDAS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, moneda: m }))}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    form.moneda === m
                      ? "bg-white text-primary shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>

          {/* Monto */}
          <Field label="Monto">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400 pointer-events-none">
                {CURRENCY_SYMBOL[form.moneda] || form.moneda}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`${inputCls} pl-8`}
                value={form.monto}
                onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
          </Field>

          {/* Activo */}
          {modo === "editar" && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  id="activo"
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-300 peer-checked:bg-primary rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
              </label>
              <label htmlFor="activo" className="text-xs text-neutral-600 cursor-pointer select-none">
                Servicio activo
              </label>
            </div>
          )}

          {/* Precio de citas */}
          {modo === "editar" && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  id="es_reserva_cita"
                  type="checkbox"
                  checked={!!form.es_reserva_cita}
                  onChange={(e) => setForm((f) => ({ ...f, es_reserva_cita: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-300 peer-checked:bg-primary rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
              </label>
              <label htmlFor="es_reserva_cita" className="text-xs text-neutral-600 cursor-pointer select-none">
                Usar este precio para reservar citas
                <span className="block text-[10px] text-neutral-400">
                  Es el monto que se cobra al agendar una cita (debe estar en soles, PEN). Solo un servicio puede tenerlo activo.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-neutral-100 bg-neutral-50/50">
          {modo === "editar" ? (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo servicio
            </button>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm"
          >
            {saving && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {saving ? "Guardando…" : esNuevo ? "Crear servicio" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
