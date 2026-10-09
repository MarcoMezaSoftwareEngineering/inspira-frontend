// src/pages/backoffice/panel-asesoras/partes/ClienteDetail.jsx
import { useState } from "react";
import { MasterResumen } from "./MasterResumen";
import { VisaEeResumen } from "./VisaEeResumen";
import { FpResumen, DocResumen, LegalResumen } from "./OtrosResumenes";
import { UnisTab } from "./UnisTab";
import { PagosSection } from "./PagosSection";
import { PendientesTab } from "./PendientesTab";

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENTE DETAIL (vista expandida, con pestañas)
═══════════════════════════════════════════════════════════════════════════ */
export function ClienteDetail({ c }) {
  const svc = c._svc;
  const hasUnis = svc === "master";
  const tabs = [
    { id: "res", label: "Resumen" },
    ...(hasUnis ? [{ id: "uni", label: `Universidades (${(c.unis || []).length})` }] : []),
    { id: "pay", label: "Pagos" },
    { id: "pen", label: `Pendientes${c.pending?.length ? ` (${c.pending.length})` : ""}` },
  ];
  const [tab, setTab] = useState("res");

  return (
    <div className="px-4 pb-4">
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
        <div className="flex gap-1 p-1.5 border-b border-neutral-100 bg-neutral-50/70 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3 h-8 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                tab === t.id ? "bg-primary/10 text-primary" : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-3">
          {tab === "res" && (
            <>
              {svc === "master"           && <MasterResumen c={c} />}
              {(svc === "visa" || svc === "ee") && <VisaEeResumen c={c} />}
              {svc === "fp"               && <FpResumen c={c} />}
              {svc === "legal"            && <LegalResumen c={c} />}
              {svc === "doc"              && <DocResumen c={c} />}
            </>
          )}
          {tab === "uni" && hasUnis && <UnisTab c={c} />}
          {tab === "pay" && <PagosSection pagos={c.pagos} />}
          {tab === "pen" && <PendientesTab pending={c.pending} />}
        </div>
      </div>
    </div>
  );
}
