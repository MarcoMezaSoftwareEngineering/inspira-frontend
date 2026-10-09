// src/pages/backoffice/panel-asesoras/partes/PestanasServicio.jsx
import { TABS } from "./constantes";

export function PestanasServicio({ curTab, setCurTab, setExpandedKey, tabCounts }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TABS.map(t => (
        <button key={t.id} onClick={() => { setCurTab(t.id); setExpandedKey(null); }}
          className={`px-3 h-8 rounded-full text-[12px] border transition-colors ${
            curTab === t.id
              ? "bg-primary/10 border-primary/30 text-primary font-bold"
              : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
          }`}>
          {t.label} <span className="opacity-60">{tabCounts[t.id]}</span>
        </button>
      ))}
    </div>
  );
}
