export default function StatTile({ k, value, note }) {
  return (
    <div className="relative min-h-[68px] bg-white border border-neutral-200 rounded-2xl shadow-sm p-3 overflow-hidden">
      <div className="absolute w-16 h-16 rounded-full -right-5 -top-5 pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(111,224,171,.14),transparent 70%)" }} />
      <span className="relative block text-[9px] font-bold text-neutral-400">{k}</span>
      <strong className="relative block text-lg font-extrabold text-neutral-800 leading-tight mt-1 tracking-tight">{value}</strong>
      <em className="relative block not-italic text-[8.5px] text-neutral-400 mt-0.5 truncate">{note}</em>
    </div>
  );
}
