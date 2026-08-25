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
