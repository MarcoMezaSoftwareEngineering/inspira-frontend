export default function SeccionComentarioEspecial({ formData, setFormData }) {
  return (
    <div>
      <p className="text-xs font-medium text-neutral-500 mb-3 leading-relaxed">
        Cuéntanos cualquier detalle importante sobre tu situación: tiempos, si quieres hacer doctorado después,
        si no puedes mudarte de ciudad, restricciones económicas, etc. Este comentario también ayudará
        a la IA a priorizar los másteres para tu informe.
      </p>
      <textarea
        rows={6}
        value={formData.comentario_especial || ""}
        onChange={(e) => setFormData((p) => ({ ...p, comentario_especial: e.target.value }))}
        className="w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        placeholder="Escribe aquí…"
      />
      <p className="mt-2 text-[10px] text-neutral-400">
        Este campo es completamente opcional, pero nos ayuda mucho a personalizar tu informe.
      </p>
    </div>
  );
}
