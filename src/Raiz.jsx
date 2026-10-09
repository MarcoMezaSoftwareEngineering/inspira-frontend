// src/Raiz.jsx
//
// El árbol completo de la web pública y del panel, en un solo sitio: lo
// montan main.jsx en el navegador y entry-server.jsx en el prerender
// (09/10/2026). Para hidratar, los dos tienen que pintar exactamente el mismo
// árbol; si cada uno escribiera el suyo, cualquier cambio en uno solo rompería
// la hidratación sin que nadie lo viera.
import { StrictMode } from "react";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import InspiraDialog from "./components/ui/InspiraDialog";
import ErrorRaiz from "./components/common/ErrorRaiz";

/**
 * @param {string}  [ruta]            Solo en el servidor: la ruta que se pinta.
 * @param {boolean} [prerenderizada]  El HTML ya trae esta página (servidor e hidratación).
 */
export default function Raiz({ ruta, prerenderizada = false }) {
  return (
    // Sin <BrowserRouter> (09/10/2026): el enrutado es manual
    // (window.location.pathname en App.jsx) y nadie consumía su contexto;
    // react-router-dom añadía 30 KB a todas las páginas.
    <StrictMode>
      <ErrorRaiz>
        <AuthProvider arranqueSuave={prerenderizada}>
          <App ruta={ruta} prerenderizada={prerenderizada} />
        </AuthProvider>
      </ErrorRaiz>
      <InspiraDialog />
    </StrictMode>
  );
}
