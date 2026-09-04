export default function ComentarioIASection({ form, updateField }) {
  return (
    <section>
      <h4 className="text-base font-semibold text-neutral-900 mb-3">
        3.7. Comentario especial para IA / asesores
      </h4>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Comentario especial sobre tu caso (opcional)
        </label>
        <textarea
          rows={5}
          value={form.comentario_especial}
          onChange={(e) => updateField("comentario_especial", e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Cuéntanos cualquier detalle importante que debamos tener en cuenta (situación familiar, tiempos, si quieres luego hacer doctorado, si no puedes mudarte de ciudad, etc.). Este comentario también ayudará a la IA a priorizar los másteres para tu informe."
        />
      </div>
    </section>
  );
}
