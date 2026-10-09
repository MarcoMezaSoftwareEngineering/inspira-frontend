// src/pages/backoffice/panel-asesoras/partes/CopyBtn.jsx
import { Copy } from "lucide-react";
import { miss, copyValue } from "./utilidades";

export function CopyBtn({ value, label, className = "" }) {
  if (miss(value)) return null;
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); copyValue(value, label); }}
      title={`Copiar ${label.toLowerCase()}`}
      aria-label={`Copiar ${label.toLowerCase()}`}
      className={`shrink-0 w-6 h-6 inline-flex items-center justify-center rounded-md text-neutral-300 hover:text-primary hover:bg-neutral-100 transition ${className}`}
    >
      <Copy className="w-3 h-3" />
    </button>
  );
}
