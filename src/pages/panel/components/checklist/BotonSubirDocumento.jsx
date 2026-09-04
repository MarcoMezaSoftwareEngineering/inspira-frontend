// src/pages/panel/components/checklist/BotonSubirDocumento.jsx
import { useState } from "react";
import { apiUpload } from "../../../../services/api";

export default function BotonSubirDocumento({ solicitudId, item, onUploaded }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setSubiendo(true);
    setError("");

    try {
      const formData = new FormData();
      for (const f of files) formData.append("archivos", f);

      await apiUpload(
        `/api/panel/solicitudes/${solicitudId}/items/${item.id_solicitud_item}/documento`,
        formData
      );

      if (onUploaded) onUploaded();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <label
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border-2 cursor-pointer transition-all whitespace-nowrap select-none ${
          subiendo
            ? "border-neutral-200 bg-neutral-50 text-neutral-400 cursor-wait"
            : "border-primary bg-primary text-white hover:bg-primary-light hover:border-primary-light active:scale-95"
        }`}
      >
        {subiendo ? (
          <>
            <span className="w-4 h-4 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin" />
            Subiendo…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4-4 4M12 8v8" />
            </svg>
            Subir archivo
          </>
        )}
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
        />
      </label>

      {error && (
        <span className="text-xs text-red-500 text-right max-w-[200px] leading-snug">{error}</span>
      )}
    </div>
  );
}
