// La tarjeta de un documento en el portal del cliente.
//
// La zona de subida es un recuadro grande y punteado, no un enlace de texto:
// es la única acción de la tarjeta y tiene que verse desde lejos, también en
// un móvil. Admite arrastrar y soltar, que es como se sube desde un portátil.
//
// Sirve para el titular y para cada acompañante: lo único que cambia es `base`,
// el trozo de URL del que cuelgan sus documentos.
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { apiUpload, apiDELETE } from "../../../../services/api";
import VisorArchivo from "../../../../components/common/VisorArchivo";
import useSubidaDocumento from "../../hooks/useSubidaDocumento";
import AvisoArchivo, { BotonHacerFoto } from "./AvisoArchivo";
import IconoPaso from "../../../../components/common/IconoPaso";
import { IconoAlerta } from "./Bloques";

// La ficha toma la anatomía .ex-doc del máster (styles/panel/base.css): icono,
// nombre, chip de estado, zona de subida punteada y archivos en fila. El tono
// del chip y `e`, el estado que colorea el icono de la ficha.
const ESTADO_DOC = {
  SIN_SUBIR: { label: "Pendiente",   tono: "neutro", e: "pendiente" },
  PENDIENTE: { label: "En revisión", tono: "info",   e: "revision" },
  APROBADO:  { label: "Aprobado",    tono: "ok",     e: "aprobado" },
  OBSERVADO: { label: "Por corregir", tono: "alto",   e: "observado" },
};

/** El resumen de arriba: cuántos van y cuántos quedan. */
export function ResumenDocumentos({ ranuras }) {
  const lista = Object.values(ranuras || {}).filter((r) => r.de === "cliente");
  const cuenta = (est) => lista.filter((r) => r.estado === est).length;

  // Las mismas palabras que el chip de cada ficha, en plural cuando toca.
  const grupos = [
    [cuenta("APROBADO") === 1 ? "aprobado" : "aprobados", cuenta("APROBADO"), "ok"],
    ["en revisión", cuenta("PENDIENTE"), "info"],
    ["por corregir", cuenta("OBSERVADO"), "alto"],
    [cuenta("SIN_SUBIR") === 1 ? "pendiente" : "pendientes", cuenta("SIN_SUBIR"), "neutro"],
  ].filter(([, n]) => n > 0);

  return (
    <div className="pnl-docs-resumen mb-3">
      <div className="pnl-docs-resumen-chips">
        {grupos.map(([label, n, tono]) => (
          <span key={label} className="pnl-chip" data-talla="sm" data-tono={tono}>
            <span className="punto" />
            {n} {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TarjetaDocumento({ base, clave, def, onCambio }) {
  // Qué documento está mirando. El asesorado también merece verlos sin
  // descargarlos: son suyos.
  const [viendo, setViendo] = useState(null);
  const [encima, setEncima] = useState(false);
  const entradaRef = useRef(null);

  const cfg = ESTADO_DOC[def.estado] || ESTADO_DOC.SIN_SUBIR;
  const ultimo = def.archivos[0];
  const esDelAsesor = def.de === "asesor";

  // Las fotos se juntan en un PDF, se mira si están borrosas o les falta una
  // cara, y solo entonces se sube. El endpoint no cambia: un archivo por
  // petición en el campo «archivo»; si la ranura admite varios, uno tras otro.
  const subida = useSubidaDocumento({
    texto: `${def.etiqueta || ""} ${def.requisito || ""}`,
    varios: Boolean(def.varios),
    // La firma digitalizada y las fotografías se usan como imagen.
    convertir: !(def.clave === "firma" || /foto|firma/i.test(def.etiqueta || "")),
    enviar: async (archivos) => {
      for (const archivo of archivos) {
        const datos = new FormData();
        datos.append("archivo", archivo);
        await apiUpload(`${base}/documentos/${clave}`, datos);
      }
    },
    onHecho: onCambio,
  });
  const subiendo = subida.ocupado;

  async function quitar(idDoc) {
    const r = await apiDELETE(`${base}/documentos/archivo/${idDoc}`);
    if (r?.ok) onCambio();
  }

  const textoSubida = subida.preparando ? "Preparando…" : subiendo ? "Subiendo…"
    : def.estado === "OBSERVADO" ? "Corregir"
    : def.archivos.length ? (def.varios ? "Añadir otro archivo" : "Reemplazar el archivo")
    : "Subir archivo";

  return (
    <div className="ex-doc pnl-doc" data-e={cfg.e}>
      <span className="ex-doc-ico"><IconoPaso nombre="fileText" /></span>
      <div className="ex-doc-fila">
        <span className="n">{def.etiqueta}</span>
        <span className="pnl-chip" data-tono={cfg.tono}>
          {esDelAsesor && def.estado === "SIN_SUBIR" ? "Lo hacemos nosotros" : cfg.label}
        </span>
      </div>

      {def.requisito && (
        <p className="ex-doc-desc">{def.requisito}</p>
      )}

      {ultimo?.observacion && (
        <div className="ex-doc-obs">
          <IconoAlerta className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <b className="block">Hay que corregirlo</b>
            {ultimo.observacion}
          </span>
        </div>
      )}

      {def.estado === "PENDIENTE" && !subida.recibido && (
        <p className="pnl-doc-estado">
          Lo tenemos. Tu asesor lo está revisando y te dirá si está correcto.
        </p>
      )}

      {def.modelo && (
        <a href={def.modelo} target="_blank" rel="noreferrer"
          className="pnl-btn-texto pnl-doc-ejemplo" data-talla="s">
          Ver un ejemplo
          <IconoPaso nombre="external" />
        </a>
      )}
      {def.modelo_nota && (
        <p className="pnl-doc-modelo-nota">
          {def.modelo_nota}
        </p>
      )}

      {def.archivos.length > 0 && (
        <div className="ex-doc-archivos">
          {def.archivos.map((a) => (
            <div key={a.id_documento} className="ex-arch">
              <IconoPaso nombre="clip" className="w-4 h-4" />
              <button type="button" onClick={() => setViendo(a)} className="nm" title={a.nombre}>
                {a.nombre}
              </button>
              {/* Quién lo subió. Con dos personas entrando al expediente,
                  «lo subió el cliente» ya no dice de quién fue. */}
              {a.subido_por_quien && a.subido_por !== "ASESOR" && (
                <small className="pnl-arch-quien"
                  title={`Lo subió ${a.subido_por_quien}`}>
                  {a.subido_por_quien}
                </small>
              )}
              {a.subido_por !== "ASESOR" && (
                <button type="button" onClick={() => quitar(a.id_documento)} data-peligro>
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
              subida.elegir(e.dataTransfer.files);
            }}
            className="ex-subir w-full"
            data-arrastre={encima ? "1" : undefined}
          >
            <IconoPaso nombre="upload" />
            {textoSubida}
          </button>
          <div className="pnl-arch-pie">
            <p className="ex-nota">
              Un solo archivo, nítido, menos de 4 MB. Si son fotos, elígelas todas a la vez y
              las juntamos en un PDF.
            </p>
            <BotonHacerFoto onFotos={subida.elegir} disabled={subiendo} />
          </div>
          {/* `multiple`: las dos caras o todas las hojas en fotos se eligen de
              una vez y salen en un solo PDF. */}
          <input ref={entradaRef} type="file" className="hidden"
            accept="application/pdf,image/*" disabled={subiendo} multiple
            onChange={(e) => { subida.elegir(e.target.files); e.target.value = ""; }} />
          <AvisoArchivo subida={subida} onElegirOtra={() => entradaRef.current?.click()} />
        </>
      )}

      {esDelAsesor && def.archivos.length === 0 && (
        <p className="ex-nota">
          Lo preparamos nosotros y aparecerá aquí cuando esté listo.
        </p>
      )}

      {/* En un portal: dentro del expediente, la vista con transición
          (.pnl-vista) es su propio contexto de apilado y la barra de arriba
          del panel le tapaba la cabecera (nombre, Descargar, cerrar). */}
      {viendo && createPortal(
        // Con su propio .pnl: en document.body quedaría fuera de los tokens.
        <div className="pnl pnl-visor-archivo">
          <VisorArchivo
            ruta={`${base}/documentos/archivo/${viendo.id_documento}`}
            nombre={viendo.nombre}
            mime={viendo.mime}
            tamano={viendo.tamano}
            onCerrar={() => setViendo(null)}
          />
        </div>,
        document.body,
      )}
    </div>
  );
}
