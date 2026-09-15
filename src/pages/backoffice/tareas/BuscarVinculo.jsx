// Buscador para ligar una tarea a un lead o al expediente de un cliente.
// Con `valor` muestra lo elegido y una equis para quitarlo.
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { boGET } from "../../../services/backofficeApi";

export default function BuscarVinculo({ tipo, valor, onElegir, disabled }) {
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscado, setBuscado] = useState("");

  const texto = q.trim();

  // Con respiro: no se pide a la API en cada tecla.
  useEffect(() => {
    if (texto.length < 2) return undefined;
    let vivo = true;
    const t = setTimeout(() => {
      boGET(`/backoffice/tareas/buscar?tipo=${tipo}&q=${encodeURIComponent(texto)}`).then((r) => {
        if (!vivo) return;
        setResultados(r?.ok ? r.resultados : []);
        setBuscado(texto);
      });
    }, 250);
    return () => { vivo = false; clearTimeout(t); };
  }, [texto, tipo]);

  if (valor) {
    return (
      <div className="ase-tr-vinculo">
        <div style={{ minWidth: 0 }}>
          <div className="ase-tr-vinculo-t">{valor.titulo}</div>
          {valor.detalle && <div className="ase-tr-vinculo-d">{valor.detalle}</div>}
        </div>
        {!disabled && (
          <button type="button" className="ase-tr-vinculo-x" onClick={() => onElegir(null)} aria-label="Quitar">
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  const lista = texto.length >= 2 ? resultados : [];
  const sinResultados = texto.length >= 2 && buscado === texto && lista.length === 0;

  return (
    <div className="ase-tr-buscar">
      <label className="ase-buscar">
        <Search />
        <input
          className="ase-campo"
          type="search"
          value={q}
          disabled={disabled}
          placeholder={tipo === "lead" ? "Nombre, correo o WhatsApp del lead" : "Nombre o correo del cliente"}
          onChange={(e) => setQ(e.target.value)}
          aria-label={tipo === "lead" ? "Buscar lead" : "Buscar expediente"}
        />
      </label>
      {lista.length > 0 && (
        <ul className="ase-tr-resultados">
          {lista.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => { onElegir({ tipo, ...r }); setQ(""); }}>
                <b>{r.titulo}</b>
                {r.detalle && <span>{r.detalle}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {sinResultados && <p className="ase-tr-nada">Sin resultados.</p>}
    </div>
  );
}
