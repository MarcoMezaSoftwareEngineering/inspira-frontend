// src/components/common/VisorArchivo.jsx
//
// Visor de documentos del expediente, en una ventana sobre la página.
//
// Existía uno para los documentos de máster (backoffice/documentos/DocViewer),
// pero tiene cableados sus propios endpoints (`/api/admin/documentos/...`), que
// no sirven para estancia ni para modificatoria. Este recibe la ruta, así que
// vale para cualquiera de los tres.
import { useEffect, useState } from "react";
import { pedirArchivo, descargarArchivo, abrirArchivo } from "../../services/archivos";

/** Cuando el backend no guardó el mime, la extensión lo dice igual de bien. */
function tipoDe(mime, nombre) {
  const m = String(mime || "").toLowerCase();
  if (m.includes("pdf")) return "pdf";
  if (m.startsWith("image/")) return "imagen";
  if (m) return "otro";

  const ext = String(nombre || "").toLowerCase().split(".").pop();
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "webp", "gif", "heic", "avif"].includes(ext)) return "imagen";
  return "otro";
}

/** «213.9 KB». Sin tamaño no se pinta nada, en vez de un «—» que no dice nada. */
function comoPesa(bytes) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * @param onAprobar  si se pasa, sale el botón: revisar sin cerrar el documento,
 *                   que es como se revisa de verdad. Solo para el asesor.
 * @param onObservar idem, y pide el motivo que verá el asesorado.
 */
export default function VisorArchivo({
  ruta, nombre, mime, tamano, interno = false, onCerrar, onAprobar, onObservar,
}) {
  const tipo = tipoDe(mime, nombre);
  const peso = comoPesa(tamano);

  // Un formato que no sabemos pintar no tiene nada que cargar: arranca ya
  // resuelto, en vez de poner el estado a false dentro del efecto.
  const [cargando, setCargando] = useState(tipo !== "otro");
  const [error, setError] = useState("");
  const [src, setSrc] = useState(null);
  // Chrome pinta el PDF con su propio visor interno, y hay entornos donde no
  // arranca y deja el marco en gris. No hay forma fiable de detectarlo desde
  // fuera, asi que si pasados unos segundos no ha dicho "cargado", se ofrece
  // la salida en vez de dejar a la persona mirando un rectangulo vacio.
  const [marcoListo, setMarcoListo] = useState(false);
  const [tardando, setTardando] = useState(false);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCerrar]);

  useEffect(() => {
    if (tipo === "otro") return;

    let objectUrl = null;
    let cancelado = false;

    (async () => {
      const { blob, error: err } = await pedirArchivo(ruta, { interno });
      if (cancelado) return;
      if (err) { setError(err); setCargando(false); return; }

      // Se fuerza el tipo: si el mime guardado viene vacío o equivocado, el
      // navegador se niega a enseñar el PDF y ofrece descargarlo.
      const conTipo = new Blob([blob], {
        type: tipo === "pdf" ? "application/pdf" : blob.type || "image/jpeg",
      });
      objectUrl = URL.createObjectURL(conTipo);
      setSrc(objectUrl);
      setCargando(false);
    })();

    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [ruta, interno, tipo]);

  useEffect(() => {
    if (tipo !== "pdf" || !src || marcoListo) return;
    const t = setTimeout(() => setTardando(true), 3500);
    return () => clearTimeout(t);
  }, [tipo, src, marcoListo]);

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/70 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-white/95 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[13px] font-semibold text-neutral-900 truncate flex-1 min-w-0" title={nombre}>
          📄 {nombre}
        </p>

        {peso && <span className="text-[11.5px] text-neutral-400 shrink-0">{peso}</span>}

        {/* Safari en iOS no pinta los PDF dentro de un iframe, y hay
            escritorios donde tampoco. Esta es la salida cuando eso pasa. */}
        <button type="button" onClick={() => abrirArchivo(ruta, { interno, nombre })}
          className="text-[12px] px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 shrink-0">
          Nueva ventana ↗
        </button>

        <button type="button" onClick={() => descargarArchivo(ruta, { interno, nombre })}
          className="text-[12px] px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 shrink-0">
          Descargar
        </button>

        {/* Revisar sin cerrar el documento: es como se revisa de verdad. */}
        {onAprobar && (
          <button type="button" onClick={() => { onAprobar(); onCerrar(); }}
            className="text-[12px] px-3 py-1.5 rounded-lg border border-[#1D6A4A]/40 text-[#1D6A4A]
              hover:bg-[#E8F5EE] shrink-0 font-semibold">
            Aprobar
          </button>
        )}
        {onObservar && (
          <button
            type="button"
            onClick={() => {
              const motivo = window.prompt("¿Qué hay que corregir? El asesorado lo va a leer.");
              if (!motivo?.trim()) return;
              onObservar(motivo.trim());
              onCerrar();
            }}
            className="text-[12px] px-3 py-1.5 rounded-lg border border-amber-400 text-amber-700
              hover:bg-amber-50 shrink-0 font-semibold">
            Observar
          </button>
        )}

        <button type="button" onClick={onCerrar} aria-label="Cerrar"
          className="text-[15px] leading-none px-2 py-1 text-neutral-400 hover:text-neutral-900 shrink-0">
          ✕
        </button>
      </div>

      <div
        className="flex-1 min-h-0 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {cargando && <p className="text-white/80 text-sm">Cargando el documento…</p>}

        {!cargando && error && (
          <div className="bg-white rounded-xl p-6 text-center max-w-sm">
            <p className="text-sm text-red-700 font-semibold mb-1">{error}</p>
            <p className="text-xs text-neutral-500">Prueba a descargarlo.</p>
          </div>
        )}

        {/* Ni el navegador ni nosotros sabemos enseñar un .docx: se descarga. */}
        {!cargando && !error && tipo === "otro" && (
          <div className="bg-white rounded-xl p-6 text-center max-w-sm">
            <p className="text-sm font-semibold text-neutral-800 mb-1">
              Este formato no se puede ver aquí
            </p>
            <p className="text-xs text-neutral-500 mb-4">
              Descárgalo para abrirlo con el programa que corresponda.
            </p>
            <button
              type="button"
              onClick={() => descargarArchivo(ruta, { interno, nombre })}
              className="text-sm px-4 py-2 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#17573c]"
            >
              Descargar
            </button>
          </div>
        )}

        {!cargando && !error && src && tipo === "pdf" && (
          <div className="relative w-full h-full">
            <iframe
              src={src}
              title={nombre}
              onLoad={() => setMarcoListo(true)}
              className="w-full h-full rounded-lg bg-white"
            />
            {tardando && !marcoListo && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-white/95 border-t border-neutral-200
                text-center rounded-b-lg">
                <p className="text-[12px] text-neutral-600 mb-2">
                  ¿No se ve el documento? Tu navegador puede estar bloqueando la vista previa.
                </p>
                <button
                  type="button"
                  onClick={() => abrirArchivo(ruta, { interno, nombre })}
                  className="text-[12px] px-3 py-1.5 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#17573c]"
                >
                  Abrirlo en otra pestaña
                </button>
              </div>
            )}
          </div>
        )}

        {!cargando && !error && src && tipo === "imagen" && (
          <img src={src} alt={nombre} className="max-w-full max-h-full object-contain rounded-lg" />
        )}
      </div>
    </div>
  );
}
