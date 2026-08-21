import { useState } from "react";
import { navigate } from "../../../services/navigate";

export default function QuickCalc() {
  const [budget, setBudget] = useState(18000);

  const onSubmit = (e) => {
    e.preventDefault();
    navigate("/calculadora-master");
  };

  return (
    <div className="quick-calc">
      <div className="v4-container">
        <form className="calc-card" onSubmit={onSubmit}>
          <div className="calc-field">
            <label>¿Desde dónde postulas?</label>
            <select defaultValue="Perú">
              <option>Perú</option>
              <option>Colombia</option>
              <option>México</option>
              <option>Chile</option>
              <option>Ecuador</option>
              <option>Argentina</option>
            </select>
          </div>
          <div className="calc-field">
            <label>Área de interés</label>
            <select defaultValue="Negocios y gestión">
              <option>Negocios y gestión</option>
              <option>Derecho</option>
              <option>Ingeniería</option>
              <option>Marketing</option>
              <option>Educación</option>
              <option>Salud</option>
            </select>
          </div>
          <div className="calc-field range-wrap">
            <label>Presupuesto estimado</label>
            <input
              type="range"
              min="10000"
              max="30000"
              step="1000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
            <div className="range-meta">
              <span>€10k</span>
              <strong>€{Math.round(budget / 1000)}k</strong>
              <span>€30k</span>
            </div>
          </div>
          <button className="btn btn-primary" type="submit">
            Calcular mi ruta <span className="arr">→</span>
          </button>
        </form>
      </div>
    </div>
  );
}
