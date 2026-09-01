// Las guías, las mismas que ve el asesorado.
//
// No es una copia ni un resumen: son literalmente los mismos componentes que se
// renderizan en su portal. Si se mantuviera una versión aparte para uso interno,
// a la tercera actualización el asesor estaría leyendo una cosa y el asesorado
// otra, que es la peor forma de contradecirse delante de un cliente.
import { lazy, Suspense, useState } from "react";

const GuiaMaster = lazy(() => import("../../panel/GuiaMaster"));
const GuiaEstancia = lazy(() => import("../../panel/GuiaEstancia"));
const GuiaModificatoria = lazy(() => import("../../panel/GuiaModificatoria"));
const GuiaApostilla = lazy(() => import("../../panel/GuiaApostilla"));

const GUIAS = [
  { id: "master", label: "Postulación a Máster", Comp: GuiaMaster },
  { id: "estancia", label: "Estancia por estudios", Comp: GuiaEstancia },
  { id: "modificatoria", label: "Modificación a trabajo", Comp: GuiaModificatoria },
  { id: "apostilla", label: "Apostilla digital", Comp: GuiaApostilla },
];

export default function GuiasAsesor() {
  const [activa, setActiva] = useState("master");
  const { Comp } = GUIAS.find((g) => g.id === activa) || GUIAS[0];

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[19px] font-bold text-neutral-900">Guías</h1>
        <p className="text-[12.5px] text-neutral-500">
          Exactamente lo que ve el asesorado en su portal, para consultarlo mientras le
          atiendes.
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {GUIAS.map((g) => (
          <button key={g.id} type="button" onClick={() => setActiva(g.id)}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              activa === g.id
                ? "border-[#1D6A4A] bg-[#1D6A4A] text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            }`}>
            {g.label}
          </button>
        ))}
      </div>

      {/* Las guías traen su propio ancho y su propio fondo, pensados para el
          portal. Se dejan correr enteras dentro de su caja en vez de pelearse
          con ellas desde fuera. */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <Suspense fallback={
          <div className="py-16 text-center text-[12.5px] text-neutral-400">Cargando la guía…</div>
        }>
          <Comp />
        </Suspense>
      </div>
    </div>
  );
}
