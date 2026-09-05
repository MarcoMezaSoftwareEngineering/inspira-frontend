// La campana de Inspira Core: lo que los asesorados han escrito y nadie ha
// leído todavía, de todos los expedientes. Se refresca sola cada minuto y al
// volver a la pestaña; al abrir un expediente desde aquí, el hilo se marca
// leído y el aviso desaparece en el siguiente refresco.
import { useCallback, useEffect, useRef, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { fechaHoraDoble } from "../../../lib/horas";

const CADA = 60 * 1000;

export default function CampanaMensajes({ navigate, path }) {
  const [datos, setDatos] = useState({ total: 0, items: [] });
  const [abierta, setAbierta] = useState(false);
  const ref = useRef(null);

  const cargar = useCallback(async () => {
    try {
      const r = await boGET("/backoffice/solicitudes/mensajes/pendientes");
      if (r?.ok) setDatos({ total: r.total || 0, items: r.items || [] });
    } catch { /* la campana no puede romper el backoffice */ }
  }, []);

  useEffect(() => {
    const primera = setTimeout(cargar, 0);
    const t = setInterval(cargar, CADA);
    const onFoco = () => { if (document.visibilityState === "visible") cargar(); };
    document.addEventListener("visibilitychange", onFoco);
    window.addEventListener("focus", onFoco);
    return () => { clearTimeout(primera); clearInterval(t); document.removeEventListener("visibilitychange", onFoco); window.removeEventListener("focus", onFoco); };
  }, [cargar, path]);

  useEffect(() => {
    if (!abierta) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierta(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [abierta]);

  const ir = (id) => { setAbierta(false); navigate(`/backoffice/solicitudes/${id}`); };
  const total = datos.total;

  return (
    <div ref={ref} className="fixed top-2.5 right-[60px] md:top-3 md:right-4 z-50">
      <button type="button" onClick={() => setAbierta((v) => !v)} aria-label={total ? `${total} mensajes sin leer` : "Mensajes"}
        title={total ? `${total} mensaje(s) sin leer` : "Sin mensajes nuevos"}
        className={`relative w-10 h-10 rounded-xl grid place-items-center shadow-md transition ${
          total ? "bg-accent text-white hover:opacity-90" : "bg-white/95 text-primary border border-neutral-200 hover:bg-neutral-50 md:bg-primary md:text-white md:border-0"
        }`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {total > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-black grid place-items-center border-2 border-white">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {abierta && (
        <div className="absolute right-0 mt-2 w-[min(92vw,380px)] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <p className="text-[13px] font-bold text-neutral-900">Mensajes de asesorados</p>
            <span className="text-[11px] text-neutral-500">{total ? `${total} sin leer` : "al día"}</span>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {datos.items.length === 0 ? (
              <p className="px-4 py-6 text-[12.5px] text-neutral-500 text-center">Nadie ha escrito nada nuevo. Lo que llegue aparece aquí y por correo.</p>
            ) : datos.items.map((it) => (
              <button key={it.id_solicitud} type="button" onClick={() => ir(it.id_solicitud)}
                className="w-full text-left px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-neutral-900 truncate">{it.cliente}</span>
                  {it.mio && <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">tuyo</span>}
                  <span className="ml-auto text-[10.5px] font-black px-1.5 py-0.5 rounded-full bg-accent text-white shrink-0">{it.sin_leer}</span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate">{it.titulo} · #{it.id_solicitud}</p>
                {it.ultimo && (
                  <>
                    <p className="text-[12px] text-neutral-700 leading-snug mt-1 line-clamp-2">
                      <span className="font-semibold">{it.ultimo.autor}:</span> {it.ultimo.texto}
                    </p>
                    <p className="text-[10.5px] text-neutral-400 mt-0.5">{fechaHoraDoble(it.ultimo.fecha)}</p>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
