import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./styles/globals.css";

import { AuthProvider } from "./context/AuthContext";
import InspiraDialog from "./components/ui/InspiraDialog";

import { BrowserRouter } from "react-router-dom";
import { vigilarVersionNueva, marcarArranqueCorrecto } from "./lib/versionNueva";

// Si llegamos hasta aquí, la aplicación cargó: se limpia la marca de recarga
// para que un fallo futuro pueda volver a intentarlo.
marcarArranqueCorrecto();
vigilarVersionNueva();

// Recargar al volver con el botón "atrás" desde la caché de retroceso (bfcache),
// para que el panel no muestre datos de una sesión que ya cerró.
//
// Vivía como <script> suelto dentro de index.html, y era el único motivo por el
// que la CSP del sitio necesitaba 'unsafe-inline' en script-src por nuestra
// parte. Aquí entra en el bundle y deja de serlo.
window.addEventListener("pageshow", (e) => {
  if (e.persisted) window.location.reload();
});


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      <InspiraDialog />
    </BrowserRouter>
  </StrictMode>
);
