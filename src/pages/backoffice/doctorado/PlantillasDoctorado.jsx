// Plantillas que se rellenan solas: el asesor escribe una vez los datos del
// caso y salen el correo al director, la solicitud del certificado de acceso,
// las estructuras de carta y anteproyecto, la documentación para la UGE y la
// declaración de antecedentes. Copiar o descargar. El borrador se guarda en
// este navegador para no perderlo al cambiar de pestaña.
import { useEffect, useMemo, useState } from "react";
import { Copy, Download, RotateCcw } from "lucide-react";
import { dialog } from "../../../services/dialogService";
import { useAuth } from "../context/AuthContext";
import { PLANTILLAS, VACIO, mediosNecesarios } from "./plantillas.datos";

const CLAVE = "bo_doctorado_plantillas";

const CAMPOS = [
  ["nombre", "Nombre del asesorado"], ["pais", "País / nacionalidad"], ["correo", "Correo del asesorado"],
  ["titulo_grado", "Grado o licenciatura"], ["titulo_master", "Máster"], ["uni_origen", "Universidad de origen"],
  ["programa", "Programa de doctorado"], ["uni_destino", "Universidad española"], ["tema", "Tema o título provisional"],
  ["director", "Posible director/a"], ["linea", "Línea de investigación del director"], ["publicacion", "Un artículo reciente del director"],
  ["financiacion", "Financiación (fondos propios, beca…)"],
];

function leer() {
  try { return { ...VACIO, ...JSON.parse(localStorage.getItem(CLAVE) || "{}") }; } catch { return { ...VACIO }; }
}

export default function PlantillasDoctorado() {
  const { user } = useAuth();
  const [d, setD] = useState(leer);
  const [sel, setSel] = useState(PLANTILLAS[0].id);

  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch { /* sin almacenamiento */ }
  }, [d]);

  const datos = useMemo(() => ({ ...d, asesor: d.asesor || user?.nombre || "" }), [d, user]);
  const p = PLANTILLAS.find((x) => x.id === sel);
  const asunto = p.asunto(datos);
  const texto = p.texto(datos);
  const huecos = (texto.match(/\[[^\]]+\]/g) || []).length;
  const { minimo } = mediosNecesarios(d);

  async function copiar() {
    try { await navigator.clipboard.writeText(`${asunto}\n\n${texto}`); dialog.toast("Copiado", "success"); }
    catch { dialog.toast("No se pudo copiar", "error"); }
  }
  function descargar() {
    const blob = new Blob([`${asunto}\n\n${texto}\n`], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${p.id}-${(d.nombre || "doctorado").replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  return (
    <div className="ase-dc-plant">
      <div className="ase-dc-plant-datos">
        <div className="ase-dc-plant-cab">
          <b>Datos del caso</b>
          <button type="button" className="ase-dc-link" onClick={async () => { if (await dialog.confirm("Se vacían todos los campos.", "¿Empezar un caso nuevo?")) setD({ ...VACIO }); }}>
            <RotateCcw size={13} /> Caso nuevo
          </button>
        </div>
        {CAMPOS.map(([k, t]) => (
          <label key={k}><span>{t}</span>
            <input className="ase-campo" value={d[k]} onChange={(e) => setD((x) => ({ ...x, [k]: e.target.value }))} />
          </label>
        ))}
        <label><span>Correo del director</span><input className="ase-campo" value={d.director_correo} onChange={(e) => setD((x) => ({ ...x, director_correo: e.target.value }))} /></label>
        <div className="ase-dc-plant-fila">
          <label><span>Familiares que vienen</span>
            <input className="ase-campo" type="number" min="0" max="9" value={d.familiares} onChange={(e) => setD((x) => ({ ...x, familiares: e.target.value }))} />
          </label>
          <label><span>¿Ya está en España?</span>
            <select className="ase-campo" value={d.desde_espana} onChange={(e) => setD((x) => ({ ...x, desde_espana: e.target.value }))}>
              <option value="no">No, viene de fuera</option><option value="si">Sí, en situación regular</option>
            </select>
          </label>
        </div>
        <p className="ase-dc-nota">Medios que pedirá la UGE: <b>{minimo.toLocaleString("es-ES")} € al año</b>. Los datos se guardan solo en este navegador.</p>
      </div>

      <div className="ase-dc-plant-salida">
        <div className="ase-dc-plant-tabs">
          {PLANTILLAS.map((x) => (
            <button key={x.id} type="button" data-on={x.id === sel ? "1" : "0"} onClick={() => setSel(x.id)}>{x.titulo}</button>
          ))}
        </div>
        <p className="ase-dc-nota" style={{ marginTop: 0 }}>{p.para}{huecos ? ` · Quedan ${huecos} hueco(s) entre corchetes por completar.` : ""}</p>
        <div className="ase-dc-plant-asunto"><span>Asunto</span>{asunto}</div>
        <pre className="ase-dc-plant-texto">{texto}</pre>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="ase-dc-boton" style={{ padding: "0 16px" }} onClick={copiar}><Copy size={15} /> Copiar</button>
          <button type="button" className="ase-dc-boton sec" style={{ padding: "0 16px" }} onClick={descargar}><Download size={15} /> Descargar .txt</button>
          {p.id === "director" && d.director_correo && (
            <a className="ase-dc-boton sec" style={{ padding: "0 16px", display: "inline-flex", alignItems: "center", gap: 6 }}
              href={`mailto:${encodeURIComponent(d.director_correo)}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto)}`}>
              Abrir en el correo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
