// El hilo de mensajes del expediente, el mismo para el asesorado y el asesor.
//
// No es un chat: nada se edita ni se borra, cada mensaje lleva su hora y su
// autor, y quien escribió ve cuándo lo leyó el otro. Se refresca al abrir y al
// enviar; no hace falta tiempo real para lo que tiene que quedar por escrito.
//
// `cargar()` y `enviar(texto)` los pone quien lo monta: el panel del asesorado
// con su API y el backoffice con la suya. `lado` dice cuál de los dos es
// «yo», para pintar los míos a la derecha.
import { useEffect, useRef, useState } from "react";

function fecha(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function HiloMensajes({ cargar, enviar, lado, aviso }) {
  const [mensajes, setMensajes] = useState(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const finRef = useRef(null);

  const mio = (m) => (lado === "asesor" ? m.autor_tipo === "ASESOR" : m.autor_tipo !== "ASESOR");

  async function refrescar() {
    try {
      const r = await cargar();
      if (r?.ok) { setMensajes(r.mensajes || []); setError(""); }
      else setError(r?.msg || "No se pudieron cargar los mensajes");
    } catch { setError("No se pudieron cargar los mensajes"); }
  }

  useEffect(() => { refrescar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { finRef.current?.scrollIntoView({ block: "end" }); }, [mensajes?.length]);

  async function mandar() {
    const t = texto.trim();
    if (!t || enviando) return;
    setEnviando(true); setError("");
    try {
      const r = await enviar(t);
      if (r?.ok) { setTexto(""); await refrescar(); }
      else setError(r?.msg || "No se pudo enviar");
    } catch { setError("No se pudo enviar"); }
    finally { setEnviando(false); }
  }

  return (
    <div className="flex flex-col min-h-0">
      {aviso && (
        <p className="text-[11.5px] text-neutral-500 leading-relaxed mb-3 px-1">{aviso}</p>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 px-1 py-1" style={{ maxHeight: "50vh" }}>
        {mensajes === null && !error && <p className="text-[12px] text-neutral-400">Cargando…</p>}
        {mensajes?.length === 0 && (
          <p className="text-[12.5px] text-neutral-500 py-4 text-center">
            Todavía no hay mensajes. Lo que escriba aquí queda en el expediente.
          </p>
        )}
        {(mensajes || []).map((m) => {
          const yo = mio(m);
          return (
            <div key={m.id_mensaje} className={`flex ${yo ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                yo ? "bg-primary text-white rounded-br-md" : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-md"
              }`}>
                <p className={`text-[10.5px] font-bold mb-1 ${yo ? "text-white/70" : "text-primary-light"}`}>
                  {m.autor_nombre}{m.autor_tipo === "INVITADO" ? " · invitado" : ""} · {fecha(m.fecha)}
                </p>
                <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">{m.texto}</p>
                {yo && (
                  <p className="text-[10.5px] mt-1 text-white/60">
                    {m.leido_at
                      ? `Leído${m.leido_por ? ` por ${m.leido_por}` : ""} el ${fecha(m.leido_at)}`
                      : "Enviado · sin leer todavía"}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={finRef} />
      </div>

      <div className="mt-3 shrink-0">
        <textarea
          rows={3} value={texto} onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") mandar(); }}
          placeholder={lado === "asesor" ? "Escribe al asesorado…" : "Escribe a tu asesor…"}
          className="w-full text-[13.5px] border border-neutral-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <button type="button" onClick={mandar} disabled={enviando || !texto.trim()}
            className="ux-tap text-[13px] font-bold px-5 py-2.5 rounded-full bg-accent text-white hover:opacity-90 disabled:opacity-40">
            {enviando ? "Enviando…" : "Enviar"}
          </button>
          <span className="text-[11px] text-neutral-400">
            {lado === "asesor"
              ? "El asesorado recibe una copia por correo. Queda en el expediente y no se puede borrar."
              : "Tu asesor recibe una copia por correo. Queda en tu expediente y no se puede borrar."}
          </span>
          {error && <span className="text-[12px] text-red-600 font-semibold">{error}</span>}
        </div>
      </div>
    </div>
  );
}
