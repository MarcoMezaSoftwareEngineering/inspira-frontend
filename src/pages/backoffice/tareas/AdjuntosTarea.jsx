// Fotos, PDF y enlaces de una tarea: lo que se deja para hacerla («Para
// hacerla») y lo que prueba que se cumplió («Prueba de lo hecho»). Los
// archivos se abren con la sesión de Core (van por la API, no son públicos).
import { useRef, useState } from "react";
import { Paperclip, Link2, FileText, Image as ImageIcon, Trash2, CheckCircle2 } from "lucide-react";
import { boPOST, boDELETE, boFetch } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { Boton } from "../ui";
import { fechaHora } from "./tareasComun";

const MOMENTOS = [
  { valor: "CONTEXTO", etiqueta: "Para hacerla" },
  { valor: "EVIDENCIA", etiqueta: "Prueba de lo hecho" },
];
const ACEPTA = "image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";

function tamano(b) {
  if (!b) return "";
  return b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
}

function Icono({ a }) {
  if (a.tipo === "ENLACE") return <Link2 size={15} />;
  if (String(a.mime).startsWith("image/")) return <ImageIcon size={15} />;
  return <FileText size={15} />;
}

export default function AdjuntosTarea({ tarea, yo, puedeBorrarTarea, onTarea }) {
  const [momento, setMomento] = useState(tarea.abierta ? "CONTEXTO" : "EVIDENCIA");
  const [enlace, setEnlace] = useState("");
  const [nombreEnlace, setNombreEnlace] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const input = useRef(null);
  const adjuntos = tarea.adjuntos || [];

  async function subir(archivos) {
    if (!archivos?.length) return;
    setSubiendo(true);
    for (const f of archivos) {
      const fd = new FormData();
      fd.append("momento", momento);
      fd.append("archivo", f);
      const r = await boPOST(`/backoffice/tareas/${tarea.id_tarea}/adjuntos`, fd);
      if (!r?.ok) { dialog.toast(r?.msg || `No se pudo subir ${f.name}`, "error"); continue; }
      onTarea(r.tarea);
    }
    setSubiendo(false);
    if (input.current) input.current.value = "";
  }

  async function guardarEnlace(e) {
    e.preventDefault();
    if (!enlace.trim()) return;
    setSubiendo(true);
    const r = await boPOST(`/backoffice/tareas/${tarea.id_tarea}/adjuntos`, { url: enlace.trim(), nombre: nombreEnlace.trim(), momento });
    setSubiendo(false);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo guardar el enlace", "error"); return; }
    setEnlace(""); setNombreEnlace("");
    onTarea(r.tarea);
  }

  async function abrir(a) {
    if (a.tipo === "ENLACE") { window.open(a.url, "_blank", "noopener"); return; }
    // La ventana se abre antes de esperar: si no, el navegador la bloquea.
    const v = window.open("", "_blank");
    const r = await boFetch(`/backoffice/tareas/${tarea.id_tarea}/adjuntos/${a.id}`);
    if (!r?.ok) { v?.close(); dialog.toast("No se pudo abrir el archivo", "error"); return; }
    const url = URL.createObjectURL(await r.blob());
    if (v) v.location.href = url; else window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  async function quitar(a) {
    const ok = await dialog.confirm(`Se quita «${a.nombre}» de la tarea para todo el equipo.`, "¿Quitar el adjunto?");
    if (!ok) return;
    const r = await boDELETE(`/backoffice/tareas/${tarea.id_tarea}/adjuntos/${a.id}`);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo quitar", "error"); return; }
    onTarea(r.tarea);
  }

  const grupos = MOMENTOS.map((m) => ({ ...m, lista: adjuntos.filter((a) => a.momento === m.valor) })).filter((g) => g.lista.length);

  return (
    <div className="ase-ld-bloque"
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) e.preventDefault(); }}
      onDrop={(e) => { if (e.dataTransfer.files?.length) { e.preventDefault(); subir([...e.dataTransfer.files]); } }}>
      <p className="ase-ld-bloque-t">Archivos y enlaces</p>

      {grupos.length === 0 && (
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 10px" }}>
          Fotos, PDF o enlaces de lo que se deja para hacerla o de lo que prueba que se hizo. También puedes arrastrarlos aquí.
        </p>
      )}
      {grupos.map((g) => (
        <div key={g.valor} style={{ marginBottom: 10 }}>
          <p className="ase-tr-adj-grupo">
            {g.valor === "EVIDENCIA" && <CheckCircle2 size={12} />} {g.etiqueta}
          </p>
          <ul className="ase-tr-adj">
            {g.lista.map((a) => (
              <li key={a.id}>
                <button type="button" className="ase-tr-adj-abrir" onClick={() => abrir(a)} title="Abrir">
                  <Icono a={a} />
                  <span className="ase-tr-adj-n">{a.nombre}</span>
                </button>
                <span className="ase-tr-adj-m">
                  {[a.autor?.split(" ")[0], fechaHora(a.created_at), tamano(a.tamano_bytes)].filter(Boolean).join(" · ")}
                </span>
                {(a.id_usuario === yo || puedeBorrarTarea) && (
                  <button type="button" className="ase-tr-adj-x" onClick={() => quitar(a)} aria-label={`Quitar ${a.nombre}`} title="Quitar">
                    <Trash2 size={13} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="ase-tr-adj-momento" role="radiogroup" aria-label="Qué es">
        {MOMENTOS.map((m) => (
          <button key={m.valor} type="button" role="radio" aria-checked={momento === m.valor}
            data-activo={momento === m.valor ? "1" : "0"} onClick={() => setMomento(m.valor)}>
            {m.etiqueta}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <input ref={input} type="file" multiple accept={ACEPTA} hidden onChange={(e) => subir([...e.target.files])} />
        <Boton tam="sm" icono={Paperclip} cargando={subiendo} onClick={() => input.current?.click()}>Subir foto o PDF</Boton>
      </div>
      <form onSubmit={guardarEnlace} style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6, marginTop: 8 }}>
        <input className="ase-campo" type="url" inputMode="url" placeholder="Pegar un enlace (Drive, Canva, web…)"
          value={enlace} onChange={(e) => setEnlace(e.target.value)} />
        {enlace.trim() && (
          <div style={{ display: "flex", gap: 6 }}>
            <input className="ase-campo" style={{ flex: 1 }} placeholder="Nombre (opcional)"
              value={nombreEnlace} onChange={(e) => setNombreEnlace(e.target.value)} />
            <Boton type="submit" tam="sm" icono={Link2} disabled={subiendo}>Añadir</Boton>
          </div>
        )}
      </form>
    </div>
  );
}
