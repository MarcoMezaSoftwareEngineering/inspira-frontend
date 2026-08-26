// src/pages/panel/components/mis-servicios/sections/InstructivosPlantillas.jsx
import SeccionPanel from "./SeccionPanel";

export default function InstructivosPlantillas({
  instructivos,
  numero = "2",
  titulo = "Instructivos y plantillas",
  subtitulo = "Descarga la guía paso a paso de tu servicio.",
  sectionId = "2",
  onIrAGuia,
}) {
  const lista = Array.isArray(instructivos) ? instructivos : [];

  return (
    <SeccionPanel
      numero={numero}
      titulo={titulo}
      subtitulo={subtitulo}
      sectionId={sectionId}
    >
      {onIrAGuia && (
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => onIrAGuia("guia")}
            className="flex items-center gap-3 bg-[#1D6A4A]/5 border border-[#1D6A4A]/20 rounded-xl px-4 py-3.5 text-left hover:bg-[#1D6A4A]/10 transition-all"
          >
            <span className="text-xl shrink-0">🎓</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1D6A4A]">Guía completa del Máster</p>
              <p className="text-xs text-neutral-500">Paso a paso de todo el proceso de postulación.</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onIrAGuia("apostilla")}
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 text-left hover:bg-amber-100/60 transition-all"
          >
            <span className="text-xl shrink-0">📜</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-800">Guía de Apostilla</p>
              <p className="text-xs text-neutral-500">Cómo apostillar tus documentos.</p>
            </div>
          </button>
        </div>
      )}

      {lista.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-neutral-400">Aún no hay instructivos configurados.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {lista.map((doc) => (
            <li
              key={doc.url}
              className="flex items-center justify-between gap-4 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 hover:border-[#046C8C]/30 hover:bg-[#046C8C]/5 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#023A4B]/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#023A4B]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-neutral-800 truncate">{doc.label}</span>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                download
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white border-2 border-[#023A4B] text-[#023A4B] hover:bg-[#023A4B] hover:text-white transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 10l-4 4-4-4M12 4v10" />
                </svg>
                Descargar
              </a>
            </li>
          ))}
        </ul>
      )}
    </SeccionPanel>
  );
}
