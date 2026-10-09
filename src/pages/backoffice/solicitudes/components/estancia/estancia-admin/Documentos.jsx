import { useMemo, useState } from "react";
import { boGET, boPATCH, boFetch } from "../../../../../../services/backofficeApi";
import VisorArchivo from "../../../../../../components/common/VisorArchivo";
import { dialog } from "../../../../../../services/dialogService";
import { Cabecera } from "./Cabecera";
import { AvisoDrive } from "./AvisoDrive";
import { FilaDocumento } from "./FilaDocumento";

export function Documentos({ id, docs, onCambio }) {
  const [subiendo, setSubiendo] = useState("");
  // Qué documento se está mirando. null = ninguno, no hay ventana.
  const [viendo, setViendo] = useState(null);
  const [abriendoCarpeta, setAbriendoCarpeta] = useState(false);

  /** Aprobar u observar sin salir del documento, que es como se revisa. */
  async function revisarDesdeVisor(archivo, estado, observacion = null) {
    const r = await boPATCH(
      `/backoffice/solicitudes/${id}/estancia/documentos/archivo/${archivo.id_documento}/revision`,
      { estado, observacion },
    );
    if (r?.ok) onCambio();
    else dialog.toast("No se pudo guardar la revisión", "error");
  }

  /**
   * Abre en Drive la carpeta del asesorado.
   *
   * La pestaña se pide ANTES de la llamada: si se abriera al recibir la
   * respuesta, el navegador la trataría como emergente y la bloquearía.
   *
   * Sin "noopener": con esa opción `window.open` devuelve null por
   * especificación, y sin referencia no hay forma de mandar la pestaña a Drive
   * después. El aislamiento se consigue anulando `opener` a mano.
   *
   * Y si aun así no hay pestaña —en el móvil las emergentes se bloquean casi
   * siempre— se navega en la misma. Es peor que abrir al lado, pero llega.
   */
  async function abrirCarpeta() {
    const ventana = window.open("", "_blank");
    if (ventana) { try { ventana.opener = null; } catch { /* da igual */ } }

    setAbriendoCarpeta(true);
    const r = await boGET(`/backoffice/solicitudes/${id}/estancia/carpeta-drive`);
    setAbriendoCarpeta(false);

    if (r?.ok && r.url) {
      if (ventana) ventana.location.replace(r.url);
      else window.location.assign(r.url);
      return;
    }

    ventana?.close();
    dialog.toast(r?.msg || "No se pudo abrir la carpeta en Drive", "error");
  }

  async function subir(clave, archivo) {
    if (!archivo) return;
    setSubiendo(clave);
    const datos = new FormData();
    datos.append("archivo", archivo);
    const r = await boFetch(`/backoffice/solicitudes/${id}/estancia/documentos/${clave}`, {
      method: "POST", body: datos,
    });
    setSubiendo("");
    if (r?.ok) onCambio();
  }

  // Las listas solo cambian con `docs`. Sin memo se rehacían en cada render, y
  // este bloque se repinta con cada subida, al abrir el visor y con cada
  // autoguardado de la ficha, que repinta el panel entero (09/10/2026).
  const { delCliente, delAsesor, oblig, aprobados } = useMemo(() => {
    const del = (de) => Object.entries(docs?.ranuras || {}).filter(([, d]) => d.de === de);
    const oblig = docs ? Object.values(docs.ranuras).filter((d) => d.obligatorio) : [];
    const aprobados = oblig.filter((d) => d.estado === "APROBADO").length;
    return { delCliente: del("cliente"), delAsesor: del("asesor"), oblig, aprobados };
  }, [docs]);
  const pct = oblig.length ? (aprobados / oblig.length) * 100 : 0;

  return (
    <div id="bloque-documentos" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="2" titulo="Documentos"
        extra={
          <>
            <span className="ml-auto text-[11.5px] text-neutral-500">
              {aprobados} de {oblig.length} aprobados
            </span>
            {/* Hasta ahora este enlace solo salía al avisar a la abogada, así
                que para ver los archivos había que mandarle un correo. */}
            <button
              type="button"
              onClick={abrirCarpeta}
              disabled={abriendoCarpeta}
              className="text-[11.5px] px-2.5 py-1 rounded-lg border border-neutral-300
                hover:bg-neutral-50 disabled:opacity-50 shrink-0"
            >
              {abriendoCarpeta ? "Abriendo…" : "📁 Abrir carpeta del asesorado"}
            </button>
          </>
        } />

      {/* De un vistazo, cuánto falta para poder presentar */}
      <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden mb-4">
        <div className="h-full bg-[#1D6A4A] transition-all" style={{ width: `${pct}%` }} />
      </div>

      <AvisoDrive id={id} docs={docs} onCambio={onCambio} />

      <p className="text-[11.5px] font-semibold text-neutral-600 mb-2">
        Los aporta el asesorado
      </p>
      <div className="space-y-1.5 mb-4">
        {delCliente.map(([clave, d]) => (
          <FilaDocumento key={clave} id={id} clave={clave} def={d}
            onCambio={onCambio} onSubir={subir} subiendo={subiendo} onVer={setViendo} />
        ))}
      </div>

      <p className="text-[11.5px] font-semibold text-neutral-600 mb-2">
        Los prepara Inspira
      </p>
      <div className="space-y-1.5">
        {delAsesor.map(([clave, d]) => (
          <FilaDocumento key={clave} id={id} clave={clave} def={d}
            onCambio={onCambio} onSubir={subir} subiendo={subiendo} onVer={setViendo} />
        ))}
      </div>

      {viendo && (
        <VisorArchivo
          interno
          ruta={`/backoffice/solicitudes/${id}/estancia/documentos/archivo/${viendo.id_documento}`}
          nombre={viendo.nombre}
          mime={viendo.mime}
          tamano={viendo.tamano}
          onAprobar={() => revisarDesdeVisor(viendo, "APROBADO")}
          onObservar={(motivo) => revisarDesdeVisor(viendo, "OBSERVADO", motivo)}
          onCerrar={() => setViendo(null)}
        />
      )}
    </div>
  );
}
