import { navigate } from "../services/navigate";
import { useSEO } from "../hooks/useSEO";

export default function NotFound() {
  useSEO({ noIndex: true });

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-bold text-[#1D6A4A] mb-4 font-serif">404</p>
      <h1 className="text-2xl font-serif font-bold text-[#1A3557] mb-3">
        Página no encontrada
      </h1>
      <p className="text-neutral-500 mb-8 max-w-sm leading-relaxed">
        La página que buscas no existe o fue movida a otra dirección.
      </p>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="bg-[#1D6A4A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#175a3e] transition"
      >
        Volver al inicio
      </button>
    </main>
  );
}
