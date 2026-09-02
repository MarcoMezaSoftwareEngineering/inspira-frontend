import { Menu } from "lucide-react";
import { initials } from "./navSections";

export default function MobileAppBar({ onMenuToggle, user }) {
  return (
    <header
      className="bo-barra md:hidden fixed top-0 left-0 right-0 h-[60px] z-40 flex items-center justify-between px-3 border-b border-white/10 shadow-md"
    >
      <button
        onClick={onMenuToggle}
        aria-label="Abrir menú"
        className="flex items-center justify-center w-11 h-11 rounded-xl text-white hover:bg-white/10 transition"
      >
        <Menu className="w-6 h-6" strokeWidth={2} />
      </button>

      <span className="bo-marca text-white text-[15px]">Inspira<i>.</i>Core</span>

      <div className="w-9 h-9 rounded-full bg-[#FA943A] text-white text-xs font-bold flex items-center justify-center shrink-0 select-none">
        {initials(user)}
      </div>
    </header>
  );
}
