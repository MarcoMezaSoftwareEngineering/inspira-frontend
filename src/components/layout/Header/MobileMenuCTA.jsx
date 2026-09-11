// src/components/layout/Header/MobileMenuCTA.jsx
import { navigate } from "../../../services/navigate";
import { HREF_PAQUETE, MASTER_EN_PORTADA } from "../../../config/paqueteMaster2027Resumen";

export default function MobileMenuCTA() {
  return (
    <a
      href={HREF_PAQUETE}
      onClick={(e) => { e.preventDefault(); navigate(HREF_PAQUETE); }}
      className="w-full text-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition"
    >
      {MASTER_EN_PORTADA.menu}
    </a>
  );
}
