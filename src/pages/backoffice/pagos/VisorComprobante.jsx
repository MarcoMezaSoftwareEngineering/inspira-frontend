// El comprobante de un cobro, a la vista dentro de la ventana.
//
// El archivo está detrás de autenticación (el token va en cabecera), así que
// no sirve un <img src>: se pide con fetch y se pinta. Las imágenes van como
// data URL —igual que DocViewer, que esquiva así las restricciones sobre
// blob:— y el PDF como blob en un iframe. HEIC no lo pinta ningún navegador
// de escritorio: se ofrece abrirlo.
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { boFetch } from "../../../services/backofficeApi";
import { Boton } from "../ui";

function leerComoDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("No se pudo leer la imagen"));
    r.readAsDataURL(blob);
  });
}

export default function VisorComprobante({ idPago, alto = 380 }) {
  const [estado, setEstado] = useState({ cargando: true });

  useEffect(() => {
    let vivo = true;
    let objectUrl = null;
    (async () => {
      try {
        const r = await boFetch(`/backoffice/pagos/${idPago}/comprobante`);
        if (!r) return;
        if (!r.ok) {
          if (vivo) setEstado({ error: r.status === 404 ? "Este cobro no tiene comprobante." : "No se pudo cargar el comprobante." });
          return;
        }
        const blob = await r.blob();
        const tipo = (blob.type || r.headers.get("content-type") || "").toLowerCase();
        const esPdf = tipo.includes("pdf");
        objectUrl = URL.createObjectURL(esPdf ? new Blob([blob], { type: "application/pdf" }) : blob);
        if (esPdf) {
          if (vivo) setEstado({ tipo: "pdf", url: objectUrl });
        } else if (/image\/(jpeg|png|webp|gif)/.test(tipo)) {
          const dataUrl = await leerComoDataUrl(blob);
          if (vivo) setEstado({ tipo: "imagen", url: objectUrl, vista: dataUrl });
        } else {
          if (vivo) setEstado({ tipo: "otro", url: objectUrl });
        }
      } catch {
        if (vivo) setEstado({ error: "No se pudo cargar el comprobante." });
      }
    })();
    return () => {
      vivo = false;
      // Con espera: una pestaña abierta con «Abrir» todavía lo está leyendo.
      if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    };
  }, [idPago]);

  if (estado.cargando && !estado.url && !estado.error) {
    return <div className="ase-esq" style={{ height: alto, borderRadius: 14 }} />;
  }
  if (estado.error) {
    return <div className="ase-pg-visor-vacio">{estado.error}</div>;
  }

  return (
    <div className="ase-pg-visor">
      <div className="ase-pg-visor-marco" style={{ height: alto }}>
        {estado.tipo === "pdf" && <iframe src={estado.url} title="Comprobante" />}
        {estado.tipo === "imagen" && <img src={estado.vista} alt="Comprobante" />}
        {estado.tipo === "otro" && (
          <p className="ase-pg-visor-vacio" style={{ border: 0 }}>
            Este formato no se puede previsualizar aquí (probablemente HEIC, la foto del iPhone). Ábrelo en otra pestaña.
          </p>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
        <Boton tono="fantasma" tam="xs" icono={ExternalLink} onClick={() => window.open(estado.url, "_blank")}>
          Abrir en otra pestaña
        </Boton>
      </div>
    </div>
  );
}
