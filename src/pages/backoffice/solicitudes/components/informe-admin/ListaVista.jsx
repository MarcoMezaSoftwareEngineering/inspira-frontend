// La lista del informe tal como la leerá el asesorado, con el corte de
// finalistas.
import TarjetaMaster from "../../../../../components/common/TarjetaMaster";

export default function ListaVista({ listaVista, FINALISTAS }) {
  return (
    <div className="ex-lista-m">
      {listaVista.map((r, i) => (
        <div key={r.master.id_master}>
          {i === FINALISTAS && (
            <div className="flex items-center gap-2 my-3 px-1">
              <div className="flex-1 h-px bg-[#F5C842]" />
              <span className="text-[10px] font-bold text-[#7a5b00] uppercase tracking-wide whitespace-nowrap">
                hasta aquí su lista · lo de abajo va como extras
              </span>
              <div className="flex-1 h-px bg-[#F5C842]" />
            </div>
          )}
          <div className={i >= FINALISTAS ? "opacity-60" : ""}>
            <TarjetaMaster
              resultado={r}
              posicion={i + 1}
              total={listaVista.length}
              nota={r.nota_asesor || null}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
