import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

export default function ProtectedRoute({ children, onLogout }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    async function check() {
      const r = await boGET("/backoffice/me");
      setOk(r.ok);
      if (!r.ok) onLogout?.();
    }
    check();
  }, []);

  if (ok === null) {
    return (
      <div className="h-dvh w-full flex flex-col items-center justify-center gap-3 bg-white">
        <div className="w-9 h-9 rounded-full border-[3px] border-neutral-200 border-t-primary animate-spin" />
        <p className="text-[13px] text-neutral-400 font-medium">Cargando…</p>
      </div>
    );
  }
  if (!ok) return null;

  return children;
}
