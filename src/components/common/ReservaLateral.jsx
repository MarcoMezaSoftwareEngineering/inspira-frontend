// src/components/common/ReservaLateral.jsx
// Pestaña fija al costado derecho: siempre visible, abre el panel de reserva.
export default function ReservaLateral({ onAbrir }) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label="Reservar asesoría ahora"
      className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-2 rounded-l-xl px-3 py-4 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg transition-all hover:pr-5 lg:flex"
      style={{
        background: "linear-gradient(180deg, #F5871F, #DB6F0C)",
        writingMode: "vertical-rl",
      }}
    >
      <span style={{ writingMode: "horizontal-tb" }} aria-hidden>
        📅
      </span>
      Reserva ahora
    </button>
  );
}
