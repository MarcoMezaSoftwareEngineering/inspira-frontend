// Último cerco: si algo revienta fuera de los cercos de cada paso, en vez de
// una pantalla en blanco sale «tuvimos un inconveniente», con salida, y el
// fallo queda en Core → Configuración → Errores.
import { Component } from "react";
import { reportarError } from "../../lib/reportarError";
import PantallaError from "./PantallaError";

export default class ErrorRaiz extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[raiz]", error, info?.componentStack);
    reportarError({
      donde: "raiz",
      mensaje: String(error?.message || error),
      pila: error?.stack,
      componente: info?.componentStack,
    });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <PantallaError
        texto="Tuvimos un inconveniente al mostrar esta página. Ya quedó registrado para revisarlo."
        acciones={[
          { etiqueta: "Recargar", fuerte: true, onClick: () => window.location.reload() },
        ]}
      />
    );
  }
}
