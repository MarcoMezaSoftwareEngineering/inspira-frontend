import { useState } from "react";
import { navigate } from "../../../services/navigate";
import Icono from "../../../components/common/Icono";

// Rango real de un máster en España: desde ~700 € de matrícula en una
// pública hasta 10.000 € o más en programas privados.
const MIN = 700;
const MAX = 10000;

const formatear = (v) =>
  v >= MAX ? "10 k€ o más" : `${v.toLocaleString("es-ES")} €`;

export default function QuickCalc() {
  const [budget, setBudget] = useState(3500);

  const onSubmit = (e) => {
    e.preventDefault();
    navigate("/calculadora-master");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div className="quick-calc">
      <div className="v4-container">
        <form className="calc-card" onSubmit={onSubmit}>
          <div className="calc-head">
            <span className="calc-chip">
              <Icono nombre="brujula" size={15} />
              Inspira Match
            </span>
            <p>
              Dinos dos datos y te mostramos qué másteres encajan con tu perfil y
              tu presupuesto real.
            </p>
          </div>

          {/* Dos columnas: origen y presupuesto */}
          <div className="calc-cols">
            <div className="calc-field">
              <label htmlFor="calc-pais">
                <Icono nombre="mapa" size={14} />
                ¿Desde dónde postulas?
              </label>
              <select id="calc-pais" defaultValue="Perú">
                <option>Perú</option>
                <option>Colombia</option>
                <option>México</option>
                <option>Chile</option>
                <option>Ecuador</option>
                <option>Argentina</option>
                <option>Bolivia</option>
                <option>Venezuela</option>
                <option>Otro país</option>
              </select>
            </div>

            <div className="calc-field range-wrap">
              <label htmlFor="calc-budget">
                <Icono nombre="euro" size={14} />
                Presupuesto estimado
              </label>
              <div className="range-valor">{formatear(budget)}</div>
              <input
                id="calc-budget"
                type="range"
                min={MIN}
                max={MAX}
                step="100"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
              <div className="range-meta">
                <span>700 €</span>
                <span>10 k€ o más</span>
              </div>
            </div>
          </div>

          <button className="btn btn-primary calc-btn" type="submit">
            Calcular mi ruta <span className="arr">→</span>
          </button>

          <p className="calc-nota">
            Hay másteres oficiales en universidades públicas desde unos 700 € el
            curso. La calculadora completa suma matrícula, visa, apostillas y
            gastos de vida.
          </p>
        </form>
      </div>
    </div>
  );
}
