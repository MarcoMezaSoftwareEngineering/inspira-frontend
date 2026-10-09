// Aviso de modo edición con cuántos finalistas y extras lleva la lista.
export default function BannerEdicion({ listaEdit, FINALISTAS }) {
  return (
    <div className="mb-4 flex items-center gap-2.5 bg-[#1A3557]/5 border border-[#1A3557]/15 rounded-xl px-3.5 py-2.5">
      <div className="w-2 h-2 rounded-full bg-[#1D6A4A] animate-pulse shrink-0" />
      <p className="text-[11px] text-[#1A3557] font-medium">
        Modo edición activo · {Math.min(listaEdit.length, FINALISTAS)} finalista{Math.min(listaEdit.length, FINALISTAS) !== 1 ? "s" : ""}
        {listaEdit.length > FINALISTAS ? ` y ${listaEdit.length - FINALISTAS} extra${listaEdit.length - FINALISTAS !== 1 ? "s" : ""}` : ""}
        {" · "}los primeros {FINALISTAS} son los que el asesorado lee como su lista
      </p>
    </div>
  );
}
