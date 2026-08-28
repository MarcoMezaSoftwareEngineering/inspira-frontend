// La tarjeta de un documento en el portal del cliente.
//
// La zona de subida es un recuadro grande y punteado, no un enlace de texto:
// es la única acción de la tarjeta y tiene que verse desde lejos, también en
// un móvil. Admite arrastrar y soltar, que es como se sube desde un portátil.
//
// Sirve para el titular y para cada acompañante: lo único que cambia es `base`,
// el trozo de URL del que cuelgan sus documentos.
import { useRef, useState } from "react";
import { apiUpload, apiDELETE } from "../../../../services/api";
import VisorArchivo from "../../../../components/common/VisorArchivo";

const ESTADO_DOC = {
  SIN_SUBIR: { label: "Pendiente",   bg: "bg-amber-50",   text: "text-amber-700",   borde: "border-neutral-200 bg-white" },
  PENDIENTE: { label: "En revisión", bg: "bg-sky-50",     text: "text-sky-700",     borde: "border-sky-200 bg-sky-50/30" },
  APROBADO:  { label: "Aprobado",    bg: "bg-emerald-50", text: "text-emerald-700", borde: "border-emerald-200 bg-emerald-50/20" },
  OBSERVADO: { label: "Corrígelo",   bg: "bg-red-50",     text: "text-red-700",     borde: "border-red-300 bg-red-50/30" },
};

/** El resumen de arriba: cuántos van y cuántos quedan. */
export function ResumenDocumentos({ ranuras }) {
  const lista = Object.values(ranuras || {}).filter((r) => r.de === "cliente");
  const cuenta = (est) => lista.filter((r) => r.estado === est).length;

  const grupos = [
    ["Aprobados", cuenta("APROBADO"), "bg-emerald-500", "text-emerald-700"],
    ["En revisión", cuenta("PENDIENTE"), "bg-sky-500", "text-sky-700"],
    ["Por corregir", cuenta("OBSERVADO"), "bg-red-500", "text-red-700"],
    ["Sin subir", cuenta("SIN_SUBIR"), "bg-neutral-300", "text-neutral-500"],
  ].filter(([, n]) => n > 0);

  return (
    <div className="flex items-center gap-x-4 gap-y-1.5 flex-wrap mb-3">
      {grupos.map(([label, n, punto, texto]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${punto}`} />
          <span className={`text-[12.5px] font-semibold ${texto}`}>{n} {label}</span>
        </span>
      ))}
    </div>
  );
}

export default function TarjetaDocumento({ base, clave, def, onCambio }) {
  // Qué documento está mirando. El asesorado también merece verlos sin
  // descargarlos: son suyos.
  const [viendo, setViendo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [encima, setEncima] = useState(false);
  const [error, setError] = useState("");
  const entradaRef = useRef(null);

  const cfg = ESTADO_DOC[def.estado] || ESTADO_DOC.SIN_SUBIR;
  const ultimo = def.archivos[0];
  const esDelAsesor = def.de === "asesor";

  async function subir(archivo) {
    if (!archivo) return;
    setSubiendo(true); setError("");
    try {
      const datos = new FormData();
      datos.append("archivo", archivo);
      await apiUpload(`${base}/documentos/${clave}`, datos);
      onCambio();
    } catch (e) {
      setError(e.message || "No se pudo subir");
    } finally { setSubiendo(false); }
  }

  async function quitar(idDoc) {
    const r = await apiDELETE(`${base}/documentos/archivo/${idDoc}`);
    if (r?.ok) onCambio();
  }

  const textoSubida = subiendo ? "Subiendo…"
    : def.estado === "OBSERVADO" ? "↑ Subir la corrección"
    : def.archivos.length ? (def.varios ? "↑ Añadir otro archivo" : "↑ Reemplazar el archivo")
    : "↑ Subir archivo";

  return (
    <div className={`border rounded-xl p-3.5 flex flex-col gap-2 ${cfg.borde}`}>
      <div className="flex items-start gap-3">
        <p className="text-[14px] font-semibold text-neutral-900 leading-snug min-w-0 flex-1">
          {def.etiqueta}
        </p>
        <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full
          ${cfg.bg} ${cfg.text}`}>
          {esDelAsesor && def.estado === "SIN_SUBIR" ? "Lo hacemos nosotros" : cfg.label}
        </span>
      </div>

      {def.requisito && (
        <p className="text-[12.5px] text-neutral-500 leading-relaxed -mt-0.5">{def.requisito}</p>
      )}

      {ultimo?.observacion && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-[11px] font-bold text-red-700 mb-0.5">Hay que corregirlo</p>
          <p className="text-[12.5px] text-red-800 leading-relaxed">{ultimo.observacion}</p>
        </div>
      )}

      {def.estado === "PENDIENTE" && (
        <p className="text-[12px] text-sky-700 leading-relaxed">
          Lo tenemos. Tu asesor lo está revisando y te dirá si está correcto.
        </p>
      )}

      {def.archivos.length > 0 && (
        <div className="space-y-1">
          {def.archivos.map((a) => (
            <div key={a.id_documento} className="flex items-center gap-2">
              <button type="button" onClick={() => setViendo(a)}
                className="text-[12px] text-[#046C8C] hover:underline truncate flex-1 text-left">
                📄 {a.nombre}
              </button>
              {/* Quién lo subió. Con dos personas entrando al expediente,
                  «lo subió el cliente» ya no dice de quién fue. */}
              {a.subido_por_quien && a.subido_por !== "ASESOR" && (
                <span className="shrink-0 text-[11px] text-neutral-400 truncate max-w-[45%]"
                  title={`Lo subió ${a.subido_por_quien}`}>
                  {a.subido_por_quien}
                </span>
              )}
              {a.subido_por !== "ASESOR" && (
                <button type="button" onClick={() => quitar(a.id_documento)}
                  className="shrink-0 text-[11.5px] text-neutral-400 hover:text-red-600">
                  quitar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!esDelAsesor && (
        <>
          <button
            type="button" disabled={subiendo}
            onClick={() => entradaRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setEncima(true); }}
            onDragLeave={() => setEncima(false)}
            onDrop={(e) => {
              e.preventDefault(); setEncima(false);
              subir(e.dataTransfer.files?.[0]);
            }}
            className={`w-full rounded-xl border-2 border-dashed py-3.5 text-[13px]
              font-semibold transition-colors disabled:opacity-60 ${
              encima ? "border-[#1D6A4A] bg-[#E8F5EE] text-[#14532d]"
                : "border-neutral-300 text-neutral-500 hover:border-[#1D6A4A] hover:text-[#1D6A4A]"
            }`}
          >
            {textoSubida}
          </button>
          <p className="text-[11px] text-neutral-400 leading-relaxed -mt-0.5">
            Un solo archivo, nítido, menos de 4 MB.
          </p>
          <input ref={entradaRef} type="file" className="hidden"
            accept="application/pdf,image/*" disabled={subiendo}
            onChange={(e) => { subir(e.target.files?.[0]); e.target.value = ""; }} />
        </>
      )}

      {esDelAsesor && def.archivos.length === 0 && (
        <p className="text-[12px] text-neutral-400">
          Lo preparamos nosotros y aparecerá aquí cuando esté listo.
        </p>
      )}

      {error && <p className="text-[12px] text-red-600">{error}</p>}

      {viendo && (
        <VisorArchivo
          ruta={`${base}/documentos/archivo/${viendo.id_documento}`}
          nombre={viendo.nombre}
          mime={viendo.mime}
          tamano={viendo.tamano}
          onCerrar={() => setViendo(null)}
        />
      )}
    </div>
  );
}
