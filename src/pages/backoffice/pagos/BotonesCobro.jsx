// Los botones de un cobro, en fila: los mismos en la lista de Pagos, en el
// detalle de un plan y en la ficha del cliente.
import { Boton } from "../ui";
import { accionesPara } from "./permisosPagos";

export default function BotonesCobro({ cobro, puede, onAccion, max = 4 }) {
  const acciones = accionesPara(cobro, puede).slice(0, max);
  if (!acciones.length) return null;
  return (
    <div className="ase-pg-acciones">
      {acciones.map((a) => (
        <Boton key={a.tipo} tono={a.tono} tam="xs" icono={a.icono} onClick={(e) => { e.stopPropagation(); onAccion(a.tipo, cobro); }}>
          {a.etiqueta}
        </Boton>
      ))}
    </div>
  );
}
