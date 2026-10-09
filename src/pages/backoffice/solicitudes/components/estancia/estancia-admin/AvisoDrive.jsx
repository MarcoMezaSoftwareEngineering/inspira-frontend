import { useMemo, useState } from "react";
import { boPOST } from "../../../../../../services/backofficeApi";
import { dialog } from "../../../../../../services/dialogService";

/**
 * Documentos que constan entregados y no están en la carpeta de Drive.
 *
 * La copia a Drive va en segundo plano para que un fallo suyo no impida
 * entregar el documento, y ese fallo no se veía en ningún sitio: el expediente
 * contaba el documento y la carpeta estaba vacía. Sólo se descubría abriendo
 * Drive y contando a mano, normalmente tarde.
 */
export function AvisoDrive({ id, docs, onCambio }) {
  const [reponiendo, setReponiendo] = useState(false);

  // Solo cambia con `docs`. Sin memo se rehacía, copiando cada archivo, en cada
  // render del panel, que se repinta entero con cada autoguardado de la ficha
  // (09/10/2026).
  const faltan = useMemo(() => Object.values(docs?.ranuras || {})
    .flatMap((d) => (d.archivos || []).map((a) => ({ ...a, etiqueta: d.etiqueta })))
    .filter((a) => a.en_drive === false), [docs]);

  if (!faltan.length) return null;

  async function reponer() {
    setReponiendo(true);
    const r = await boPOST(`/backoffice/solicitudes/${id}/estancia/reponer-drive`);
    setReponiendo(false);
    if (r?.ok) { dialog.toast(r.msg || "Repuesto", "exito"); onCambio(); }
    else dialog.toast(r?.msg || "No se pudo reponer", "error");
  }

  return (
    <div className="mb-3 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2.5">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-[12px] text-orange-900 leading-relaxed min-w-0 flex-1">
          <b>{faltan.length} documento{faltan.length === 1 ? "" : "s"} sin copia en Drive.</b>{" "}
          Está{faltan.length === 1 ? "" : "n"} en el expediente, pero la carpeta que abre la
          abogada no lo{faltan.length === 1 ? "" : "s"} tiene.
        </p>
        <button type="button" onClick={reponer} disabled={reponiendo}
          className="shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg bg-[#B45309]
            text-white hover:opacity-90 disabled:opacity-40">
          {reponiendo ? "Subiendo…" : "Subirlos a Drive"}
        </button>
      </div>
      <ul className="mt-2 space-y-0.5">
        {faltan.map((a) => (
          <li key={a.id_documento} className="text-[11.5px] text-orange-800 leading-relaxed">
            · {a.etiqueta}
            {a.drive_error && <span className="text-orange-600"> — {a.drive_error}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
