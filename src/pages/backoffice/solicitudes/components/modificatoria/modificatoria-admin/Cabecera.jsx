// El rótulo numerado de cada bloque del panel: el cuadrado con el número y el título.

export default function Cabecera({ numero, titulo, extra }) {
  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[12px]
        font-bold text-white font-serif" style={{ background: "#023A4B" }}>{numero}</span>
      <span className="text-[13.5px] font-bold text-[#1A3557]">{titulo}</span>
      {extra}
    </div>
  );
}
