// src/components/common/VisorArchivo.jsx
//
// Visor de documentos del expediente, en una ventana sobre la página.
//
// Existía uno para los documentos de máster (backoffice/documentos/DocViewer),
// pero tiene cableados sus propios endpoints (`/api/admin/documentos/...`), que
// no sirven para estancia ni para modificatoria. Este recibe la ruta, así que
// vale para cualquiera de los tres.
import { useEffect, useState } from "react";
import { pedirArchivo, descargarArchivo } from "../../services/archivos";

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

export default function VisorArchivo({ ruta, nombre, mime, interno = false, onCerrar }) {
  const tipo = tipoDe(mime, nombre);

  // Un formato que no sabemos pintar no tiene nada que cargar: arranca ya
  // resuelto, en vez de poner el estado a false dentro del efecto.
  const [cargando, setCargando] = useState(tipo !== "otro");
  const [error, setError] = useState("");
  const [src, setSrc] = useState(null);

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

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/70 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 bg-white/95 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[13px] font-semibold text-neutral-900 truncate flex-1" title={nombre}>
          📄 {nombre}
        </p>
        <button
          type="button"
          onClick={() => descargarArchivo(ruta, { interno, nombre })}
          className="text-[12px] px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 shrink-0"
        >
          Descargar
        </button>
        <button
          type="button"
          onClick={onCerrar}
          className="text-[12px] px-3 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 shrink-0"
        >
          Cerrar
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
          <iframe src={src} title={nombre} className="w-full h-full rounded-lg bg-white" />
        )}

        {!cargando && !error && src && tipo === "imagen" && (
          <img src={src} alt={nombre} className="max-w-full max-h-full object-contain rounded-lg" />
        )}
      </div>
    </div>
  );
}
