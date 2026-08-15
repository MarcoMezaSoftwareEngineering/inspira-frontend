// src/pages/backoffice/layout/TabView.jsx
import { useState } from "react";

export default function TabView({ tabs, initialTab = 0 }) {
  const [active, setActive] = useState(initialTab);
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-neutral-200 px-6 pt-4 gap-1 shrink-0">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={[
              "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
              active === i
                ? "bg-primary text-white"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tabs[active].content}
      </div>
    </div>
  );
}
