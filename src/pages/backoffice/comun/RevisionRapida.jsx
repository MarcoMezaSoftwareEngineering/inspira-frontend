// Revisión rápida de documentos, la misma para todos los servicios.
//
// Enseña el primer documento pendiente y se decide sin salir: Aprobar,
// Observar (con motivo) o Saltar, y pasa solo al siguiente. «Aprobar todo»
// despacha lo que quede de una vez. Se abre desde la tarjeta del cliente, la
// tarea «Revisar documentos» o el expediente con ?revisar=1.
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { pedirArchivo, abrirArchivo } from "../../../services/archivos";
import { dialog } from "../../../services/dialogService";

function Visor({ doc }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let vivo = true; let creada = null;
    pedirArchivo(doc.ver, { interno: true }).then(({ blob, error: e }) => {
      if (!vivo) return;
      if (e) { setError(e); return; }
      creada = URL.createObjectURL(blob);
      setUrl(creada);
    });
    return () => { vivo = false; if (creada) URL.revokeObjectURL(creada); };
  }, [doc.ver]);

  if (error) return <p className="text-[13px] text-red-600 p-6 text-center">{error}</p>;
  if (!url) return <p className="text-[13px] text-neutral-400 p-6 text-center">Cargando documento…</p>;
  const esImagen = /^image\//.test(doc.mime || "") || /\.(jpe?g|png|webp|heic)$/i.test(doc.archivo || "");
  return esImagen
    ? <img src={url} alt={doc.etiqueta} className="max-w-full max-h-full mx-auto object-contain" />
    : <iframe src={url} title={doc.etiqueta} className="w-full h-full bg-white" />;
}

export default function RevisionRapida({ idSolicitud, onCerrar }) {
  const [datos, setDatos] = useState(null);
  const [i, setI] = useState(0);
  const [trabajando, setTrabajando] = useState(false);
  const [hechos, setHechos] = useState({ aprobados: 0, observados: 0 });

  const cargar = useCallback(() => boGET(`/backoffice/revision/${idSolicitud}`).then((r) => {
    if (r.ok) setDatos(r); else { dialog.toast(r.msg || "No se pudo cargar", "error"); onCerrar?.(true); }
  }), [idSolicitud, onCerrar]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onCerrar?.(hechos.aprobados + hechos.observados > 0); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onCerrar, hechos]);

  const docs = datos?.documentos || [];
  const doc = docs[Math.min(i, docs.length - 1)];

  async function decidir(decisiones) {
    setTrabajando(true);
    const r = await boPOST(`/backoffice/revision/${idSolicitud}/decidir`, { decisiones });
    setTrabajando(false);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo guardar", "error"); return; }
    if (r.errores?.length) dialog.toast(r.errores.join(" · "), "error");
    setHechos((h) => ({ aprobados: h.aprobados + (r.aprobados || 0), observados: h.observados + (r.observados || 0) }));
    setDatos((d) => ({ ...d, documentos: r.documentos || [] }));
    setI((x) => Math.min(x, Math.max(0, (r.documentos || []).length - 1)));
  }

  async function observar() {
    const motivo = await dialog.prompt(`Qué tiene que corregir en «${doc.etiqueta}»:`, "", "Observar documento");
    if (motivo && motivo.trim()) decidir([{ origen: doc.origen, id_documento: doc.id_documento, estado: "OBSERVADO", comentario: motivo.trim() }]);
  }

  async function aprobarTodo() {
    const ok = await dialog.confirm(`Se aprobarán los ${docs.length} documentos pendientes.`, "Aprobar todo");
    if (ok) decidir(docs.map((d) => ({ origen: d.origen, id_documento: d.id_documento, estado: "APROBADO" })));
  }

  const cerrar = () => onCerrar?.(hechos.aprobados + hechos.observados > 0);

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-[#011c26]/70 backdrop-blur-sm flex items-stretch sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full sm:max-w-5xl sm:rounded-2xl overflow-hidden flex flex-col h-full sm:h-[90vh] shadow-2xl">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Revisión rápida</p>
            <p className="text-[14px] font-semibold text-[#1A3557] truncate">{datos?.cliente || "…"}</p>
          </div>
          {(hechos.aprobados > 0 || hechos.observados > 0) && (
            <span className="text-[11px] text-neutral-500 whitespace-nowrap">
              <b className="text-[#1D6A4A]">{hechos.aprobados}</b> aprobados · <b className="text-amber-700">{hechos.observados}</b> observados
            </span>
          )}
          <button type="button" onClick={cerrar} aria-label="Cerrar"
            className="w-9 h-9 rounded-full grid place-items-center text-neutral-500 hover:bg-neutral-100">✕</button>
        </div>

        {!datos ? (
          <p className="text-[13px] text-neutral-400 p-10 text-center">Cargando…</p>
        ) : !docs.length ? (
          <div className="flex-1 grid place-items-center p-8 text-center">
            <div>
              <p className="text-[40px]">✓</p>
              <p className="text-[15px] font-semibold text-[#1D6A4A]">No queda nada por revisar</p>
              <button type="button" onClick={cerrar} className="mt-4 text-[13px] font-semibold text-white bg-[#1D6A4A] rounded-xl px-5 py-2.5">Cerrar</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 border-b border-neutral-200">
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-neutral-900 truncate">{doc.etiqueta}</p>
                <p className="text-[11px] text-neutral-500 truncate">
                  {doc.archivo} · subido {new Date(doc.subido_at).toLocaleDateString("es-PE")}
                </p>
              </div>
              <span className="text-[11.5px] font-semibold text-neutral-500 tabular-nums whitespace-nowrap">
                {Math.min(i, docs.length - 1) + 1} de {docs.length}
              </span>
              <button type="button" onClick={() => abrirArchivo(doc.ver, { interno: true, nombre: doc.archivo })}
                className="text-[11.5px] font-semibold text-[#046C8C] whitespace-nowrap">Abrir aparte</button>
            </div>

            <div className="flex-1 min-h-0 bg-neutral-200/60 overflow-auto">
              <Visor key={`${doc.origen}-${doc.id_documento}`} doc={doc} />
            </div>

            <div className="flex items-center gap-2 px-3 py-3 border-t border-neutral-200 flex-wrap">
              <button type="button" disabled={trabajando || i === 0} onClick={() => setI((x) => Math.max(0, x - 1))}
                className="text-[12.5px] font-semibold px-3 py-2 rounded-xl border border-neutral-200 disabled:opacity-40">← Anterior</button>
              <button type="button" disabled={trabajando || i >= docs.length - 1} onClick={() => setI((x) => x + 1)}
                className="text-[12.5px] font-semibold px-3 py-2 rounded-xl border border-neutral-200 disabled:opacity-40">Saltar →</button>
              <button type="button" disabled={trabajando || docs.length < 2} onClick={aprobarTodo}
                className="text-[12.5px] font-semibold px-3 py-2 rounded-xl border border-[#1D6A4A]/40 text-[#1D6A4A] disabled:opacity-40">
                Aprobar todo ({docs.length})
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button type="button" disabled={trabajando} onClick={observar}
                  className="text-[13px] font-bold px-4 py-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 disabled:opacity-40">
                  Observar
                </button>
                <button type="button" disabled={trabajando}
                  onClick={() => decidir([{ origen: doc.origen, id_documento: doc.id_documento, estado: "APROBADO" }])}
                  className="text-[13px] font-bold px-5 py-2.5 rounded-xl bg-[#1D6A4A] text-white disabled:opacity-40">
                  {trabajando ? "Guardando…" : "Aprobar ✓"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
