import { useEffect, useRef, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

// Nada protegido se pinta hasta que el servidor confirma la sesión. La
// petición ya salió al cargar BackofficeApp (adelantarArranque), a la vez que
// los permisos y el código de la sección: aquí se recoge esa misma promesa.
export default function ProtectedRoute({ children, onLogout }) {
  const [ok, setOk] = useState(null);
  // La función de salir cambia en cada render del padre; la comprobación se
  // hace una vez, con la última.
  const salir = useRef(onLogout);
  useEffect(() => { salir.current = onLogout; });

  useEffect(() => {
    let vivo = true;
    boGET("/backoffice/me").then((r) => {
      if (!vivo) return;
      setOk(Boolean(r?.ok));
      if (!r?.ok) salir.current?.();
    });
    return () => { vivo = false; };
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
