// El PDF del informe subido a mano: subir o reemplazar, ver y descargar.
import { formatearFecha } from "../../utils";

export default function PdfManual({
  detalle, subiendoInforme, handleUploadInforme, manejarInformeAdmin,
}) {
  return (
    <div className="px-5 pt-4 pb-4 border-b border-neutral-100">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {detalle.informe_fecha_subida ? (
          <p className="text-xs text-neutral-500">
            PDF subido el <span className="font-medium text-neutral-700">{formatearFecha(detalle.informe_fecha_subida)}</span>
          </p>
        ) : (
          <p className="text-xs text-neutral-400 italic">Aún no se ha subido un PDF de informe.</p>
        )}
        <label className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 cursor-pointer font-medium transition-all duration-200">
          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {subiendoInforme ? "Subiendo…" : "Subir / reemplazar PDF"}
          <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx"
            onChange={handleUploadInforme} />
        </label>
      </div>

      {detalle.informe_fecha_subida && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 border border-neutral-100 rounded-xl bg-neutral-50/70 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">
                {detalle.informe_nombre_original || "Informe de búsqueda"}
              </p>
              <p className="text-xs text-neutral-500">{formatearFecha(detalle.informe_fecha_subida)}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => manejarInformeAdmin("ver")}
              className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-white transition-all duration-200">
              Ver
            </button>
            <button type="button" onClick={() => manejarInformeAdmin("descargar")}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] transition-all duration-200">
              Descargar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
