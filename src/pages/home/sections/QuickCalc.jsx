import { useState } from "react";
import { navigate } from "../../../services/navigate";

export default function QuickCalc() {
  const [budget, setBudget] = useState(18000);

  const onSubmit = (e) => {
    e.preventDefault();
    navigate("/calculadora-master");
  };

  return (
    <div className="relative z-10 -mt-14 md:-mt-16 px-6">
      <form
        onSubmit={onSubmit}
        className="max-w-5xl mx-auto bg-white border border-neutral-200 rounded-[26px] shadow-[0_20px_55px_rgba(4,52,65,.16)] p-5 grid md:grid-cols-[1.1fr_1fr_1fr_auto] gap-3 items-end"
      >
        <div>
          <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">
            ¿Desde dónde postulas?
          </label>
          <select className="w-full h-[50px] border border-neutral-200 rounded-xl bg-[#f9fbfb] px-3.5 outline-none text-sm text-neutral-900">
            <option>Perú</option>
            <option>Colombia</option>
            <option>México</option>
            <option>Chile</option>
            <option>Ecuador</option>
            <option>Argentina</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">
            Área de interés
          </label>
          <select className="w-full h-[50px] border border-neutral-200 rounded-xl bg-[#f9fbfb] px-3.5 outline-none text-sm text-neutral-900">
            <option>Negocios y gestión</option>
            <option>Derecho</option>
            <option>Ingeniería</option>
            <option>Marketing</option>
            <option>Educación</option>
            <option>Salud</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-widest">
            Presupuesto estimado
          </label>
          <input
            type="range"
            min="10000"
            max="30000"
            step="1000"
            value={budget}
            onChange={(e) => setBudget(+e.target.value)}
            className="accent-[#1d6a4a]"
          />
          <div className="flex justify-between text-[11px] text-neutral-500">
            <span>€10k</span>
            <strong className="text-neutral-900">€{Math.round(budget / 1000)}k</strong>
            <span>€30k</span>
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 text-white font-semibold px-6 h-[50px] rounded-xl text-sm transition-all hover:scale-105 hover:shadow-xl"
          style={{ background: "#F49E4B" }}
        >
          Calcular mi ruta
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  );
}
